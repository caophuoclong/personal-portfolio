import { RouteGroup } from "./types.ts";
import { createApiRoutes } from "./apiRoutes.ts";
import { createWebSocketRoutes } from "./webSocketRoutes.ts";
import { createStaticRoutes } from "./staticRoutes.ts";
import { createWebhookRoutes } from "./webhookRoutes.ts";
import { createDevRoutes } from "./devRoutes.ts";
import { HotReloadController } from "../controllers/HotReloadController.ts";

export function createAllRoutes(hotReloadController: HotReloadController, isDev = false): RouteGroup[] {
  const routes = [createApiRoutes(), createWebhookRoutes(), createWebSocketRoutes(hotReloadController), createStaticRoutes()];

  // Add development routes only in dev mode
  if (isDev) {
    routes.push(createDevRoutes());
  }

  return routes;
}

export * from "./types.ts";
