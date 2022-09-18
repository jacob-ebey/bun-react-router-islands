import * as Bun from "bun";
import * as fs from "fs";
import * as path from "path";
import * as esbuild from "esbuild-wasm/lib/browser";

await esbuild.initialize({
  wasmModule: new WebAssembly.Module(
    fs.readFileSync("./node_modules/esbuild-wasm/esbuild.wasm")
  ),
  worker: false,
});

const mode = process.env.NODE_ENV || "production";

const cache = new Map<string, string>();
export async function transformFile(src: string) {
  if (!src) return null;

  const file = await Bun.resolve(src, process.cwd());

  if (cache.has(file)) {
    return cache.get(file)!;
  }

  const buildResult = await esbuild.build({
    entryPoints: {
      entry: file,
    },
    outdir: "/",
    logLevel: "silent",
    write: false,
    bundle: true,
    format: "esm",
    platform: "browser",
    target: "es2019",
    jsx: "automatic",
    jsxImportSource: "react",
    define: {
      "process.env.NODE_ENV": `"${mode}"`,
    },
    plugins: [esmNodeModulesPlugin(), bunResolvePlugin(), bunLoadPlugin()],
  });

  if (buildResult.warnings.length > 0)
    console.log(
      await esbuild.formatMessages(buildResult.warnings, {
        kind: "warning",
        color: true,
      })
    );
  if (buildResult.errors.length > 0)
    console.log(
      await esbuild.formatMessages(buildResult.errors, {
        kind: "error",
        color: true,
      })
    );

  const code = buildResult.outputFiles.find((f) => f.path === "/entry.js").text;

  cache.set(file, code);
  return code;
}

function bunResolvePlugin(): esbuild.Plugin {
  return {
    name: "bun-resolve",
    setup(build) {
      build.onResolve({ filter: /.*/ }, async (args) => {
        const parent =
          (args.importer && path.dirname(args.importer)) || process.cwd();
        console.log({ path: args.path, parent });
        if (args.path.startsWith(".")) {
          return {
            path: path.resolve(parent, args.path),
            pluginData: {
              parent,
            },
          };
        }

        return {
          path: await Bun.resolve(args.path, parent),
          pluginData: {
            parent,
          },
        };
      });
    },
  };
}

function bunLoadPlugin(): esbuild.Plugin {
  return {
    name: "bun-load",
    setup(build) {
      build.onLoad({ filter: /.*/ }, async (args) => {
        const path = await Bun.resolve(
          args.path,
          (args.pluginData && args.pluginData.parent) || process.cwd()
        );
        const contents = fs.readFileSync(path, "utf8");
        return {
          contents,
          loader: getLoader(args.path),
        };
      });
    },
  };
}

function esmNodeModulesPlugin(): esbuild.Plugin {
  return {
    name: "esm-node-modules",
    setup(build) {
      build.onResolve({ filter: /.*/ }, async (args) => {
        if (isBareModuleId(args.path)) {
          const packageNameSplit = args.path.split("/");
          let packageName = packageNameSplit[0];
          let rest = packageNameSplit.slice(1).join("/");
          if (packageName.startsWith("@")) {
            packageName = packageNameSplit.slice(0, 1).join("/");
            rest = packageNameSplit.slice(2).join("/");
          }
          rest = rest ? `/${rest}` : "";

          const pkgText = fs.readFileSync(
            path.resolve(
              process.cwd(),
              `node_modules/${packageName}/package.json`
            ),
            "utf8"
          );
          const { version } = JSON.parse(pkgText);

          return {
            path: `https://esm.sh/${packageName}@${version}${rest}?target=es2019`,
            external: true,
          };
        }
      });
    },
  };
}

function getLoader(file: string): esbuild.Loader {
  const ext = path.extname(file);
  switch (ext) {
    case ".js":
    case ".jsx":
      return "jsx";
    case ".ts":
      return "ts";
    case ".tsx":
      return "tsx";
    case ".json":
      return "json";
    case ".css":
      return "file";
    default:
      return "text";
  }
}

function isBareModuleId(id: string) {
  return !id.startsWith(".") && !id.startsWith("/") && !path.isAbsolute(id);
}
