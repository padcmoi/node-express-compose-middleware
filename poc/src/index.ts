import express from "express";
import { registerRoutes } from "./routes";

async function bootstrap() {
  const app = express();

  app.use(express.json());
  registerRoutes(app);

  app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    const message = err instanceof Error ? err.message : "UNKNOWN_ERROR";
    res.status(500).json({ ok: false, error: message });
  });

  const server = app.listen(0, () => {
    const address = server.address();
    const port = typeof address === "object" && address ? address.port : "unknown";
    console.info(`POC express-compose started on port ${port}`);
    console.info("Try POST /test/hmac with header x-api-key: dev-key");
  });

  const shutdown = () => {
    server.close();
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

void bootstrap();
