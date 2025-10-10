import { BaseController } from "./BaseController.ts";

export class HotReloadController extends BaseController {
  private clients: Set<WebSocket> = new Set();
  private isDev: boolean;
  private PORT: number;

  constructor(isDev: boolean, port: number) {
    super();
    this.isDev = isDev;
    this.PORT = port;

    if (isDev) {
      this.initFileWatcher();
    }
  }

  handleWebSocket(req: Request): Response {
    if (!this.isDev) {
      return new Response("Hot reload not available in production", { status: 404 });
    }

    if (req.headers.get("upgrade") !== "websocket") {
      return new Response(null, { status: 501 });
    }

    const { socket, response } = Deno.upgradeWebSocket(req);
    this.clients.add(socket);

    socket.addEventListener("close", () => {
      this.clients.delete(socket);
    });

    console.log("🔌 Hot reload client connected");
    return response;
  }

  private broadcastReload(): void {
    for (const client of this.clients) {
      try {
        client.send("reload");
      } catch {
        this.clients.delete(client);
      }
    }
  }

  private initFileWatcher(): void {
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
            setTimeout(() => this.broadcastReload(), 100); // Small delay to avoid rapid reloads
          }
        }
      }
    })();
  }

  injectHotReloadScript(html: string): string {
    if (!this.isDev) return html;

    const hotReloadScript = `
<script>
  // Hot reload client
  const ws = new WebSocket('ws://localhost:${this.PORT}/ws');
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

    return html.replace("</body>", hotReloadScript + "\n</body>");
  }
}
