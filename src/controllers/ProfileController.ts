import { BaseController } from "./BaseController.ts";

export class ProfileController extends BaseController {
  async getProfile(): Promise<Response> {
    try {
      const profileData = await Deno.readTextFile("./api/profile.json");
      return new Response(profileData, {
        headers: {
          "content-type": "application/json",
          "access-control-allow-origin": "*",
          "cache-control": "public, max-age=3600", // Cache for 1 hour
          "x-robots-tag": "index, follow",
        },
      });
    } catch (error) {
      console.error("Error reading profile data:", error);
      return this.sendError("Internal Server Error", 500);
    }
  }
}
