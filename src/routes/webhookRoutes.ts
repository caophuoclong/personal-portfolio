import { RouteGroup } from "./types.ts";
import { WebhookController } from "../controllers/WebhookController.ts";

export function createWebhookRoutes(): RouteGroup {
  const webhookController = new WebhookController();

  return {
    prefix: "/webhooks",
    routes: [
      {
        path: "/email",
        method: "POST",
        handler: (req: Request) => webhookController.handleEmailWebhook(req),
      },
      {
        path: "/ping",
        method: "GET",
        handler: (req: Request) => webhookController.pingWebhook(req),
      },
      {
        path: "/status",
        method: "GET",
        handler: (req: Request) => webhookController.getWebhookStatus(req),
      },
    ],
  };
}
