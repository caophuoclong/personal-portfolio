import { serveDir } from "https://deno.land/std@0.208.0/http/file_server.ts";
import { BaseController } from "./BaseController.ts";
import { HotReloadController } from "./HotReloadController.ts";

export class StaticController extends BaseController {
  constructor(private hotReloadController: HotReloadController) {
    super();
  }

  async serveIndex(): Promise<Response> {
    try {
      let html = await Deno.readTextFile("./index.html");
      html = this.hotReloadController.injectHotReloadScript(html);

      return new Response(html, {
        headers: { "content-type": "text/html" },
      });
    } catch (error) {
      console.error("Error reading index.html:", error);
      return new Response("File not found", { status: 404 });
    }
  }

  serveStatic(req: Request): Promise<Response> {
    return serveDir(req, {
      fsRoot: ".",
      urlRoot: "",
      showDirListing: false,
      showDotfiles: false,
    });
  }
}
