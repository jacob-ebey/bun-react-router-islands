import { type RouteObject } from "react-router-dom";
import { type RoutesConfig } from "./config";

export async function createRoutes(
  routesConfig: RoutesConfig,
  _parentId?: string
) {
  const routes = Object.values(routesConfig);
  const results: RouteObject[] = [];

  for (const { parentId, file, ...route } of routes) {
    if (parentId === _parentId) {
      const { default: Component, ErrorBoundary, ...rest } = await import(file);
      results.push({
        ...route,
        ...rest,
        element: Component ? <Component /> : undefined,
        errorElement: ErrorBoundary ? <ErrorBoundary /> : undefined,
        children: await createRoutes(routesConfig, route.id),
      });
    }
  }

  return results.length > 0 ? results : undefined;
}
