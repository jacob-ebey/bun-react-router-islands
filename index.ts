import { serve } from "bun";
import liveReload from "bun-livereload";
import "react";
import "react-router-dom";

const handler = async (request: Request) => {
  const serverEntry = await import("./app/entry.server");
  const { transformFile } = await import("./src/scripts");

  const url = new URL(request.url);
  if (url.pathname === "/_script") {
    const result = await transformFile(url.searchParams.get("src")!);
    return result
      ? new Response(result, {
          headers: {
            "content-type": "application/javascript",
          },
        })
      : new Response(null, { status: 404 });
  }

  // @ts-expect-error
  request.signal = new AbortController().signal;
  return serverEntry.handleDocumentRequest(request);
};

const server = serve({
  port: 3000,
  fetch: process.env.NODE_ENV === "production" ? handler : liveReload(handler),
});

console.log(`Server running at`, server.hostname);
