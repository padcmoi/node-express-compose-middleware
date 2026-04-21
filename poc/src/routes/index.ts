import type { Express } from "express";
import { errorController } from "../controllers/error.controller";
import { healthController } from "../controllers/health.controller";
import { targetHmacController } from "../controllers/hmac.controller";

export function registerRoutes(app: Express) {
  app.get("/", healthController);
  app.post("/test/hmac", targetHmacController);
  app.get("/test/error", errorController);
}
