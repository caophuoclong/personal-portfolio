import { Router } from "./Router.ts";
import { HotReloadController } from "./controllers/HotReloadController.ts";
import { createAllRoutes } from "./routes/index.ts";
import { corsMiddleware, loggingMiddleware } from "./middleware/index.ts";
import { serveDir } from "https://deno.land/std@0.208.0/http/file_server.ts";

export class Application {
  private router: Router;
  private hotReloadController: HotReloadController;

  constructor(private isDev: boolean, private port: number) {
    this.router = new Router();
    this.hotReloadController = new HotReloadController(isDev, port);

    this.setupMiddleware();
    this.setupRoutes();
  }

  private setupMiddleware(): void {
    this.router.addMiddleware(loggingMiddleware);
    this.router.addMiddleware(corsMiddleware);
  }

  private setupRoutes(): void {
    const routeGroups = createAllRoutes(this.hotReloadController, this.isDev);

    for (const group of routeGroups) {
      this.router.addRouteGroup(group);
    }

    // List all registered routes in development mode
    if (this.isDev) {
      this.router.listRoutes();
    }
  }

  async handleRequest(req: Request): Promise<Response> {
    try {
      // Try to match a specific route first
      const response = await this.router.handleRequest(req);

      // If no specific route matched (404), serve static files
      if (response.status === 404) {
        return await serveDir(req, {
          fsRoot: ".",
          urlRoot: "",
          showDirListing: false,
          showDotfiles: false,
        });
      }

      return response;
    } catch (error) {
      console.error("Application error:", error);
      return new Response("Internal Server Error", { status: 500 });
    }
  }
}
