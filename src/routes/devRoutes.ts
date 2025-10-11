import { RouteGroup } from "./types.ts";
import { KVViewerController } from "../controllers/KVViewerController.ts";

export function createDevRoutes(): RouteGroup {
  const kvViewerController = new KVViewerController();

  return {
    prefix: "/dev",
    routes: [
      // KV Store viewer interface (HTML)
      {
        path: "/kv",
        method: "GET",
        handler: (req: Request) => kvViewerController.getKVViewer(req),
      },
      // KV Store browsing API
      {
        path: "/kv/browse",
        method: "GET",
        handler: (req: Request) => kvViewerController.browseKV(req),
      },
      // Get specific KV entry
      {
        path: "/kv/entry",
        method: "GET",
        handler: (req: Request) => kvViewerController.getKVEntry(req),
      },
      // Set KV entry (for testing)
      {
        path: "/kv/entry",
        method: "POST",
        handler: (req: Request) => kvViewerController.setKVEntry(req),
      },
      // Delete KV entry (for testing)
      {
        path: "/kv/entry",
        method: "DELETE",
        handler: (req: Request) => kvViewerController.deleteKVEntry(req),
      },
      // KV Store statistics
      {
        path: "/kv/stats",
        method: "GET",
        handler: (req: Request) => kvViewerController.getKVStats(req),
      },
    ],
  };
}
