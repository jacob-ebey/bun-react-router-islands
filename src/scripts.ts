import { Transpiler } from "bun";
import * as path from "path";
import { rollup } from "rollup/dist/rollup.js";
import commonjs from "@rollup/plugin-commonjs";
import replace from "@rollup/plugin-replace";

const mode = process.env.NODE_ENV || "production";

const transpiler = new Transpiler({
  define: {
    "process.env.NODE_ENV": JSON.stringify(mode),
  },
  allowBunRuntime: false,
  loader: "tsx",
  treeShaking: true,
  trimUnusedImports: true,
  platform: "browser",
  tsconfig: require("../tsconfig.json"),
});

const cache = new Map<string, string>();
export async function transformFile(src: string) {
  if (!src) return null;

  const file = Bun.resolveSync(src, process.cwd());

  if (cache.has(file)) {
    return cache.get(file)!;
  }

  const bundled = await rollup({
    input: file,
    context: path.dirname(file),
    makeAbsoluteExternalsRelative: false,
    external: (id) => {
      return id.startsWith("/_script?src=");
    },
    plugins: [
      replace({
        preventAssignment: true,
        "process.env.NODE_ENV": JSON.stringify(mode),
      }),
      commonjs({
        defaultIsModuleExports: true,
      }),
      {
        name: "bun-resolver",
        resolveId(id, importer) {
          id = id.replace(/^\u0000/, "").replace(/\?.*$/, "");
          importer =
            importer && importer.replace(/^\u0000/, "").replace(/\?.*$/, "");
          if (!importer || id === importer) {
            return id;
          }

          const resolved = Bun.resolveSync(
            id,
            path.dirname(importer) || process.cwd()
          );

          if (importer.includes("node_modules") && id.startsWith("./")) {
            return resolved;
          }

          if (resolved.includes("node_modules")) {
            const searchParams = new URLSearchParams({ src: id });

            return { id: `/_script?${searchParams}`, external: true };
          }

          return null;
        },
      },
      {
        name: "bun-transpiler",
        async load(id) {
          if (id.endsWith(".ts") || id.endsWith(".tsx")) {
            const fileBlob = Bun.file(
              id.replace(/^\u0000/, "").replace(/\?.*$/, "")
            );
            let code = await fileBlob.text();
            code = transpiler.transformSync(
              code,
              file.endsWith(".ts") ? "ts" : "tsx"
            );
            if (file.endsWith(".tsx")) {
              code =
                "import __jsx_runtime__ from'/_script?src=react/jsx-runtime';const jsx=__jsx_runtime__.jsx;" +
                code;
            }
            return code;
          }
          return null;
        },
      },
    ],
  });

  const output = await bundled.generate({
    file: "bundle.js",
    format: "esm",
    compact: true,
  });
  const code = output.output[0].code;

  cache.set(file, code);
  return code;
}
