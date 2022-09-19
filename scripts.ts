import * as path from "path";
import { bundleFile } from "on-demand-bundler";

const mode = process.env.NODE_ENV || "production";

const cache = new Map<string, string>();
export async function transformFile(src: string) {
  if (!src) return null;

  const file = await Bun.resolve(src, process.cwd());

  if (cache.has(file)) {
    return cache.get(file)!;
  }

  const code = await bundleFile({
    fileToBundle: path.resolve(process.cwd(), src),
    include: [/app[\/\\](enhancements|islands)[\/\\]/],
    publicPath: "/_script",
    rootDirectory: process.cwd(),
    jsxImportSource: "react",
    mode,
  });

  cache.set(file, code);
  return code;
}
