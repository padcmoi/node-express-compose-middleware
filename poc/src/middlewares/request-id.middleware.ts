import type { RequestHandler } from "express";
import { randomUUID } from "node:crypto";

export const requestIdMiddleware: RequestHandler = (_req, res, next) => {
  res.locals.requestId = randomUUID();
  next();
};
