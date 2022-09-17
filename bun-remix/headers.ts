import { type StaticHandlerContext } from "@remix-run/router";

export function getDocumentHeaders(context: StaticHandlerContext) {
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
