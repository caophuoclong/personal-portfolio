import { Middleware } from "./types.ts";

export const loggingMiddleware: Middleware = async (req: Request, next: () => Promise<Response>) => {
  const startTime = Date.now();
  const { method, url } = req;

  console.log(`➡️  ${method} ${url}`);

  try {
    const response = await next();
    const duration = Date.now() - startTime;

    console.log(`⬅️  ${method} ${url} - ${response.status} (${duration}ms)`);

    return response;
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`❌ ${method} ${url} - Error (${duration}ms):`, error);
    throw error;
  }
};
