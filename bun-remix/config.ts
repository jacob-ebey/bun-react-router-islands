import * as fs from "fs";
import * as path from "path";

export type RoutesConfig = Awaited<ReturnType<typeof loadRoutesConfig>>;

export async function loadRoutesConfig(appDirectory: string) {
  const routes: Record<
    string,
    {
      id: string;
      parentId?: string;
      file: string;
      path?: string;
      index?: boolean;
    }
  > = {
    root: {
      id: "root",
      file: path.resolve(appDirectory, "root.tsx"),
    },
  };

  try {
    const routesDir = path.resolve(appDirectory, "routes");
    let entries: {
      id: string;
      index?: boolean;
      path?: string;
      file: string;
    }[] = [];
    for await (const entry of fs.readdirSync(routesDir)) {
      const filePath = path.resolve(routesDir, entry);

      const stat = fs.statSync(filePath);
      if (
        !stat.isFile() ||
        !(filePath.endsWith(".ts") || filePath.endsWith(".tsx"))
      ) {
        continue;
      }

      const relativePath = path.relative(routesDir, filePath);
      const normalizedSystemSlashes = relativePath.replace(/\\/g, "/");
      const withoutExtension = normalizedSystemSlashes.replace(/\.tsx?$/, "");
      const withSlashes = withoutExtension.replace(/\./g, "/");
      const index =
        withoutExtension === "index" || withSlashes.endsWith("/index");
      const withoutIndex = index
        ? withSlashes.replace(/\/?index$/, "")
        : withSlashes;
      const withSlugs = withoutIndex.replace(/\$/g, ":");
      const fullPath = withSlugs
        .split("/")
        .map((segment) => segment.replace(/_$/, ""))
        .join("/");

      entries.push({
        id: "routes/" + withoutExtension.replace(/\./g, "/"),
        index,
        path: fullPath,
        file: filePath,
      });
    }
    entries = entries.sort((a, b) => b.file.length - a.file.length);

    const findParentId = (id: string) => {
      if (id === "root") return undefined;

      let foundId: string | undefined = undefined;
      for (const entry of entries) {
        if (entry.id === id) continue;
        if (id.startsWith(entry.id + "/")) {
          foundId = entry.id;
        }
      }
      return foundId || "root";
    };

    for (const entry of entries) {
      routes[entry.id] = {
        ...entry,
        parentId: findParentId(entry.id),
      };
    }
  } catch (err) {
    console.log(err);
  }

  function cleanUpPath(route: { parentId?: string; path?: string }) {
    if (route.parentId && route.path && routes[route.parentId].path) {
      route.path = route.path
        .slice(-routes[route.parentId].path!.length - 1)
        .replace(/^\//, "")
        .replace(/\/$/, "");
    }
  }

  for (const route of Object.values(routes)) {
    cleanUpPath(route);
  }

  return routes;
}
