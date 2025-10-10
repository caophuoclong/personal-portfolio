import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { load } from "https://deno.land/std@0.208.0/dotenv/mod.ts";
import { Application } from "./src/Application.ts";

// Load environment variables from .env file
await load({ export: true });

const PORT = 8000;
const isDev = Deno.args.includes("--dev");

// Create application instance
const app = new Application(isDev, PORT);

// Create request handler
async function handler(req: Request): Promise<Response> {
  return await app.handleRequest(req);
}

console.log(`🚀 Portfolio server running at http://localhost:${PORT}`);
console.log(`📊 API endpoint available at http://localhost:${PORT}/api/data`);
console.log(`🤖 AI-friendly endpoints:`);
console.log(`   - http://localhost:${PORT}/api/profile`);
console.log(`   - http://localhost:${PORT}/api/hiring`);
console.log(`   - http://localhost:${PORT}/ai-hiring.html`);
console.log(`📁 Serving files from: ${Deno.cwd()}`);

if (isDev) {
  console.log(`🔥 Hot reload enabled - watching for file changes`);
  console.log(`🔌 WebSocket endpoint: ws://localhost:${PORT}/ws`);
} else {
  console.log(`⚡ Production mode - no hot reload`);
}

await serve(handler, { port: PORT });
