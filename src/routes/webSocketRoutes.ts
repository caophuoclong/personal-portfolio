import { RouteGroup } from "./types.ts";
import { HotReloadController } from "../controllers/HotReloadController.ts";

export function createWebSocketRoutes(hotReloadController: HotReloadController): RouteGroup {
  return {
    prefix: "",
    routes: [
      {
        path: "/ws",
        method: "GET",
        handler: (req: Request) => hotReloadController.handleWebSocket(req),
      },
    ],
  };
}
