import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { serveDir } from "https://deno.land/std@0.208.0/http/file_server.ts";

const PORT = 8000;
const isDev = Deno.args.includes("--dev");

// Hot reload functionality
const clients: Set<WebSocket> = new Set();

function broadcastReload() {
  console.log("🔄 Broadcasting reload to", clients.size, "client(s)");
  for (const client of clients) {
    try {
      client.send("reload");
    } catch {
      clients.delete(client);
    }
  }
}

// Watch files for changes in development mode
if (isDev) {
  const watcher = Deno.watchFs([".", "assets", "data.json"], { recursive: true });

  (async () => {
    for await (const event of watcher) {
      if (event.kind === "modify" || event.kind === "create") {
        // Filter out temporary files and directories
        const validExtensions = [".html", ".css", ".js", ".json", ".png", ".jpg", ".jpeg", ".svg"];
        const isValidFile = event.paths.some(
          (path) =>
            validExtensions.some((ext) => path.endsWith(ext)) &&
            !path.includes(".git") &&
            !path.includes("node_modules") &&
            !path.includes(".DS_Store")
        );

        if (isValidFile) {
          console.log("📝 File changed:", event.paths.join(", "));
          setTimeout(broadcastReload, 100); // Small delay to avoid rapid reloads
        }
      }
    }
  })();
}

async function handler(req: Request): Promise<Response> {
  const pathname = new URL(req.url).pathname;

  // WebSocket endpoint for hot reload
  if (pathname === "/ws" && isDev) {
    if (req.headers.get("upgrade") !== "websocket") {
      return new Response(null, { status: 501 });
    }
    const { socket, response } = Deno.upgradeWebSocket(req);
    clients.add(socket);

    socket.addEventListener("close", () => {
      clients.delete(socket);
    });

    console.log("🔌 Hot reload client connected");
    return response;
  }

  // API endpoint to serve portfolio data
  if (pathname === "/api/data") {
    try {
      const data = await Deno.readTextFile("./data.json");
      return new Response(data, {
        headers: {
          "content-type": "application/json",
          "access-control-allow-origin": "*",
        },
      });
    } catch (error) {
      console.error("Error reading data.json:", error);
      return new Response("Internal Server Error", { status: 500 });
    }
  }

  // AI-friendly API endpoint for hiring tools and crawlers
  if (pathname === "/api/profile" || pathname === "/api/hiring" || pathname === "/api/ai-profile") {
    try {
      const profileData = await Deno.readTextFile("./api/profile.json");
      return new Response(profileData, {
        headers: {
          "content-type": "application/json",
          "access-control-allow-origin": "*",
          "cache-control": "public, max-age=3600", // Cache for 1 hour
          "x-robots-tag": "index, follow",
        },
      });
    } catch (error) {
      console.error("Error reading profile data:", error);
      return new Response("Internal Server Error", { status: 500 });
    }
  }

  // Serve HTML files with hot reload script injection in dev mode
  if (pathname === "/" || pathname === "/index.html") {
    try {
      let html = await Deno.readTextFile("./index.html");

      if (isDev) {
        const hotReloadScript = `
<script>
  // Hot reload client
  const ws = new WebSocket('ws://localhost:${PORT}/ws');
  ws.onmessage = (event) => {
    if (event.data === 'reload') {
      console.log('🔄 Hot reload triggered');
      window.location.reload();
    }
  };
  ws.onclose = () => {
    console.log('🔌 Hot reload disconnected');
  };
  console.log('🔥 Hot reload enabled');
</script>`;

        html = html.replace("</body>", hotReloadScript + "\n</body>");
      }

      return new Response(html, {
        headers: { "content-type": "text/html" },
      });
    } catch (error) {
      console.error("Error reading index.html:", error);
      return new Response("File not found", { status: 404 });
    }
  }

  // Serve static files
  return serveDir(req, {
    fsRoot: ".",
    urlRoot: "",
    showDirListing: false,
    showDotfiles: false,
  });
}

console.log(`🚀 Portfolio server running at http://localhost:${PORT}`);
console.log(`📊 API endpoint available at http://localhost:${PORT}/api/data`);
console.log(`🤖 AI-friendly endpoints:`);
console.log(`   - http://localhost:${PORT}/api/profile`);
console.log(`   - http://localhost:${PORT}/api/hiring`);
console.log(`   - http://localhost:${PORT}/ai-hiring.html`);
console.log(`📁 Serving files from: ${Deno.cwd()}`);

if (isDev) {
  console.log(`🔥 Hot reload enabled - watching for file changes`);
  console.log(`🔌 WebSocket endpoint: ws://localhost:${PORT}/ws`);
} else {
  console.log(`⚡ Production mode - no hot reload`);
}

await serve(handler, { port: PORT });
