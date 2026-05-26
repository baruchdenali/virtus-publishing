import { serveStatic } from "@hono/node-server/serve-static";

export function serveStaticFiles(app: any) {
  // Serve uploaded files
  app.use("/uploads/*", serveStatic({ root: "./" }));
  // Serve cover images
  app.use("/covers/*", serveStatic({ root: "./public/" }));
  // Serve image assets
  app.use("/images/*", serveStatic({ root: "./public/" }));
  // Serve static assets (JS, CSS)
  app.use("/assets/*", serveStatic({ root: "./dist/public/" }));
  // SPA fallback - serve index.html for all non-API routes
  app.use("*", serveStatic({ path: "./dist/public/index.html" }));
}
