import { StrictMode } from "react";
import { renderToReadableStream } from "react-dom/server";
import {
  unstable_createStaticHandler as createStaticHandler,
  type StaticHandlerContext,
} from "@remix-run/router";
import {
  unstable_createStaticRouter as createStaticRouter,
  unstable_StaticRouterProvider as StaticRouterProvider,
} from "react-router-dom/server";

import { routes } from "./config";

function getDocumentHeaders(context: StaticHandlerContext) {
  const headers = new Headers({ "Content-Type": "text/html" });
  for (const match of context.matches) {
    const loaderHeaders = context.loaderHeaders[match.route.id];
    if (loaderHeaders) {
      for (const [key, value] of loaderHeaders.entries()) {
        const header = key.toLowerCase();
        if (header === "content-type") continue;
        if (header === "set-cookie") {
          headers.append(key, value);
        } else {
          headers.set(key, value);
        }
      }
    }
  }
  return headers;
}

export async function handleDocumentRequest(request: Request) {
  const { query } = createStaticHandler(routes);
  const context = await query(request);

  if (context instanceof Response) {
    return context;
  }

  const router = createStaticRouter(routes, context);
  const body = await renderToReadableStream(
    <StrictMode>
      <StaticRouterProvider hydrate={false} router={router} context={context} />
    </StrictMode>
  );

  return new Response(body as any, {
    status: context.statusCode,
    headers: getDocumentHeaders(context),
  });
}
