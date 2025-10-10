export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "OPTIONS" | "PATCH";

export interface RouteHandler {
  (req: Request): Promise<Response> | Response;
}

export interface Route {
  path: string;
  method: HttpMethod;
  handler: RouteHandler;
}

export interface RouteGroup {
  prefix: string;
  routes: Route[];
}
