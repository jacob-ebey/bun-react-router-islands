import { serve } from "bun";
import liveReload from "bun-livereload";
import * as path from "path";
import type * as React from "react";
import {
  unstable_createStaticHandler as createStaticHandler,
  type StaticHandlerContext,
} from "@remix-run/router";
import {
  unstable_createStaticRouter as createStaticRouter,
  unstable_StaticRouterProvider as StaticRouterProvider,
} from "react-router-dom/server";

// import so they don't get reloaded and cause missmatched contexts
import "react";
import "react-router-dom";

import { loadRoutesConfig } from "./config";
import { getDocumentHeaders } from "./headers";
import { type createRoutes as createRoutesType } from "./routes";

export type HandleDocumentRequestArgs = {
  Component: React.FC;
  request: Request;
  headers: Headers;
  status: number;
};

export async function createServer({
  appDirectory,
  port = 3000,
  before,
}: {
  appDirectory: string;
  port?: number;
  before?: (request: Request) => Promise<Response | null | undefined | void>;
}) {
  appDirectory = path.resolve(appDirectory);
  let routesConfig: Awaited<ReturnType<typeof loadRoutesConfig>>;
  let routes: Awaited<ReturnType<typeof createRoutesType>>;
  let serverEntry = path.resolve(appDirectory, "entry.server.tsx");

  async function handler(request: Request) {
    // TODO: Remove once bun has a signal on the request.
    // @ts-expect-error
    request.signal = new AbortController().signal;

    if (!routesConfig || !routes || process.env.NODE_ENV !== "production") {
      routesConfig = await loadRoutesConfig(appDirectory);
      const { createRoutes } = await import("./routes");
      routes = await createRoutes(routesConfig);
    }

    if (before) {
      const response = await before(request);
      if (response) return response;
    }

    const { handleDocumentRequest } = await import(serverEntry);

    const { query } = createStaticHandler(routes);
    const context = await query(request);

    if (context instanceof Response) {
      return context;
    }

    const headers = getDocumentHeaders(context);
    const router = createStaticRouter(routes, context);

    function Component() {
      return (
        <StaticRouterProvider
          hydrate={false}
          router={router}
          context={context as StaticHandlerContext}
        />
      );
    }

    return await handleDocumentRequest({
      Component,
      request,
      headers,
      status: context.statusCode,
    });
  }

  return serve({
    port,
    fetch:
      process.env.NODE_ENV === "production" ? handler : liveReload(handler),
  });
}
