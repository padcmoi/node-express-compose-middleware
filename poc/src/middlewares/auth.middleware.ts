import type { RequestHandler } from "express";

export const authMiddleware: RequestHandler = (req, res, next) => {
  const apiKey = req.header("x-api-key");

  if (apiKey !== "dev-key") {
    res.status(401).json({ ok: false, error: "UNAUTHORIZED", hint: "Use x-api-key: dev-key" });
    return;
  }

  res.locals.auth = { strategy: "api-key", role: "developer" };
  next();
};
