import { RouteGroup } from "./types.ts";
import { createApiRoutes } from "./apiRoutes.ts";
import { createWebSocketRoutes } from "./webSocketRoutes.ts";
import { createStaticRoutes } from "./staticRoutes.ts";
import { createWebhookRoutes } from "./webhookRoutes.ts";
import { HotReloadController } from "../controllers/HotReloadController.ts";
import { StaticController } from "../controllers/StaticController.ts";

export function createAllRoutes(hotReloadController: HotReloadController, staticController: StaticController): RouteGroup[] {
  return [createApiRoutes(), createWebhookRoutes(), createWebSocketRoutes(hotReloadController), createStaticRoutes(staticController)];
}

export * from "./types.ts";
