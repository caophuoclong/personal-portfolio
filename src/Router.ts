import { Route, RouteGroup, HttpMethod } from "./routes/types.ts";
import { Middleware } from "./middleware/types.ts";

export class Router {
  private routes: Map<string, Route> = new Map();
  private middleware: Middleware[] = [];

  addRouteGroup(group: RouteGroup): void {
    for (const route of group.routes) {
      const fullPath = group.prefix + route.path;
      const key = this.createRouteKey(route.method, fullPath);
      this.routes.set(key, { ...route, path: fullPath });
    }
  }

  addMiddleware(middleware: Middleware): void {
    this.middleware.push(middleware);
  }

  async handleRequest(req: Request): Promise<Response> {
    const url = new URL(req.url);
    const pathname = url.pathname;
    const method = req.method as HttpMethod;

    // Find matching route
    const routeKey = this.createRouteKey(method, pathname);
    const route = this.routes.get(routeKey);

    if (route) {
      // Execute middleware chain and route handler
      return await this.executeMiddleware(req, 0, async () => await Promise.resolve(route.handler(req)));
    }

    // If no route matches, return 404
    return new Response("Not Found", { status: 404 });
  }

  private createRouteKey(method: HttpMethod, path: string): string {
    return `${method}:${path}`;
  }

  private async executeMiddleware(req: Request, index: number, finalHandler: () => Promise<Response>): Promise<Response> {
    // If we've processed all middleware, execute the final handler
    if (index >= this.middleware.length) {
      return await finalHandler();
    }

    // Get the current middleware
    const currentMiddleware = this.middleware[index];

    // Execute the current middleware with a "next" function
    return await currentMiddleware(req, () => this.executeMiddleware(req, index + 1, finalHandler));
  }

  listRoutes(): void {
    console.log("📋 Registered routes:");
    for (const [key, _route] of this.routes) {
      console.log(`   ${key}`);
    }
  }
}
