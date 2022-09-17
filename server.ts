import { createServer } from "bun-remix";

const port = process.env.PORT ? Number.parseInt(process.env.PORT) : 3000;
const server = await createServer({
  appDirectory: "app",
  port,
  before: async (request) => {
    const url = new URL(request.url);
    if (url.pathname === "/_script") {
      const { transformFile } = await import("./scripts");
      const result = await transformFile(url.searchParams.get("src")!);

      return result
        ? new Response(result, {
            headers: {
              "content-type": "application/javascript",
            },
          })
        : new Response(null, { status: 404 });
    }
  },
});

console.log(`Server running at`, server.hostname);
