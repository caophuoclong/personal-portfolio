import { BaseController } from "./BaseController.ts";

export class DataController extends BaseController {
  async getData(): Promise<Response> {
    try {
      const data = await Deno.readTextFile("./data.json");
      return new Response(data, {
        headers: {
          "content-type": "application/json",
          "access-control-allow-origin": "*",
        },
      });
    } catch (error) {
      console.error("Error reading data.json:", error);
      return this.sendError("Internal Server Error", 500);
    }
  }
}
