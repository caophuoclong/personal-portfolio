import { RouteGroup } from "./types.ts";
import { DataController } from "../controllers/DataController.ts";
import { ProfileController } from "../controllers/ProfileController.ts";
import { ContactController } from "../controllers/ContactController.ts";

export function createApiRoutes(): RouteGroup {
  const dataController = new DataController();
  const profileController = new ProfileController();
  const contactController = new ContactController();

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
    ],
  };
}
