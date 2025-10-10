import { Router } from "./Router.ts";
import { HotReloadController } from "./controllers/HotReloadController.ts";
import { StaticController } from "./controllers/StaticController.ts";
import { createAllRoutes } from "./routes/index.ts";
import { corsMiddleware, loggingMiddleware } from "./middleware/index.ts";

export class Application {
  private router: Router;
  private hotReloadController: HotReloadController;
  private staticController: StaticController;

  constructor(private isDev: boolean, private port: number) {
    this.router = new Router();
    this.hotReloadController = new HotReloadController(isDev, port);
    this.staticController = new StaticController(this.hotReloadController);

    this.setupMiddleware();
    this.setupRoutes();
  }

  private setupMiddleware(): void {
    this.router.addMiddleware(loggingMiddleware);
    this.router.addMiddleware(corsMiddleware);
  }

  private setupRoutes(): void {
    const routeGroups = createAllRoutes(this.hotReloadController, this.staticController);

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
        return await this.staticController.serveStatic(req);
      }

      return response;
    } catch (error) {
      console.error("Application error:", error);
      return new Response("Internal Server Error", { status: 500 });
    }
  }
}
