import { RouteGroup } from "./types.ts";

async function serveIndexHtml(): Promise<Response> {
  try {
    const html = await Deno.readTextFile("./index.html");
    return new Response(html, {
      headers: { "content-type": "text/html" },
    });
  } catch (error) {
    console.error("Error reading index.html:", error);
    return new Response("File not found", { status: 404 });
  }
}

export function createStaticRoutes(): RouteGroup {
  return {
    prefix: "",
    routes: [
      {
        path: "/",
        method: "GET",
        handler: () => serveIndexHtml(),
      },
      {
        path: "/index.html",
        method: "GET",
        handler: () => serveIndexHtml(),
      },
    ],
  };
}
