import { Middleware } from "./types.ts";

export const corsMiddleware: Middleware = async (req: Request, next: () => Promise<Response>) => {
  // Handle preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "access-control-allow-origin": "*",
        "access-control-allow-methods": "GET, POST, OPTIONS",
        "access-control-allow-headers": "Content-Type",
      },
    });
  }

  // Process the request through the next middleware/handler
  const response = await next();

  // Clone the response to modify headers (Response is immutable)
  const modifiedResponse = new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: {
      ...Object.fromEntries(response.headers.entries()),
      "access-control-allow-origin": "*",
    },
  });

  return modifiedResponse;
};
