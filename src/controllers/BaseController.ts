export abstract class BaseController {
  protected sendResponse(data: unknown, status = 200, headers: Record<string, string> = {}): Response {
    const defaultHeaders = {
      "content-type": "application/json",
      "access-control-allow-origin": "*",
      ...headers,
    };

    return new Response(JSON.stringify(data), {
      status,
      headers: defaultHeaders,
    });
  }

  protected sendError(message: string, status = 500): Response {
    return this.sendResponse({ error: message }, status);
  }

  protected sendSuccess(data: Record<string, unknown> = {}, message = "Success"): Response {
    return this.sendResponse({ success: true, message, ...data });
  }
}
