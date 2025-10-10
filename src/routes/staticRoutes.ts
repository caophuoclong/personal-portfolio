import { RouteGroup } from "./types.ts";
import { StaticController } from "../controllers/StaticController.ts";

export function createStaticRoutes(staticController: StaticController): RouteGroup {
  return {
    prefix: "",
    routes: [
      {
        path: "/",
        method: "GET",
        handler: () => staticController.serveIndex(),
      },
      {
        path: "/index.html",
        method: "GET",
        handler: () => staticController.serveIndex(),
      },
    ],
  };
}
