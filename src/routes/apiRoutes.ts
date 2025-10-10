import { RouteGroup } from "./types.ts";
import { DataController } from "../controllers/DataController.ts";
import { ProfileController } from "../controllers/ProfileController.ts";
import { ContactController } from "../controllers/ContactController.ts";
import { AdminController } from "../controllers/AdminController.ts";

export function createApiRoutes(): RouteGroup {
  const dataController = new DataController();
  const profileController = new ProfileController();
  const contactController = new ContactController();
  const adminController = new AdminController();

  return {
    prefix: "/api",
    routes: [
      {
        path: "/data",
        method: "GET",
        handler: () => dataController.getData(),
      },
      {
        path: "/profile",
        method: "GET",
        handler: () => profileController.getProfile(),
      },
      {
        path: "/hiring",
        method: "GET",
        handler: () => profileController.getProfile(),
      },
      {
        path: "/ai-profile",
        method: "GET",
        handler: () => profileController.getProfile(),
      },
      {
        path: "/contact",
        method: "POST",
        handler: (req: Request) => contactController.submitContact(req),
      },
      // Admin endpoints for managing stored data
      {
        path: "/admin/emails",
        method: "GET",
        handler: (req: Request) => adminController.getEmails(req),
      },
      {
        path: "/admin/emails/:id",
        method: "GET",
        handler: (req: Request) => adminController.getEmail(req),
      },
      {
        path: "/admin/contacts",
        method: "GET",
        handler: (req: Request) => adminController.getContactMessages(req),
      },
      {
        path: "/admin/contacts/:id",
        method: "GET",
        handler: (req: Request) => adminController.getContactMessage(req),
      },
      {
        path: "/admin/stats",
        method: "GET",
        handler: (req: Request) => adminController.getStats(req),
      },
      {
        path: "/admin/export",
        method: "GET",
        handler: (req: Request) => adminController.exportData(req),
      },
    ],
  };
}
