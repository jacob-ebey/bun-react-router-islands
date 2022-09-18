import * as React from "react";
// If you want to go fast: https://github.com/oven-sh/bun/blob/main/test/bun.js/react-dom-server.bun.js
// import { renderToReadableStream } from "./react-dom-server.bun";
import { renderToReadableStream } from "react-dom/server";
import { type HandleDocumentRequestArgs } from "bun-remix";

export async function handleDocumentRequest({
  Component,
  headers,
  status,
}: HandleDocumentRequestArgs) {
  const body = await renderToReadableStream(
    <React.StrictMode>
      <Component />
    </React.StrictMode>
  );

  return new Response(body as any, {
    headers,
    status,
  });
}
