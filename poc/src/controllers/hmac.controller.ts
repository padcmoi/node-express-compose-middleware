import { compose } from "@naskot/node-express-compose-middleware";
import { authMiddleware } from "../middlewares/auth.middleware";
import { requestIdMiddleware } from "../middlewares/request-id.middleware";

export const targetHmacController = compose(requestIdMiddleware, authMiddleware, async ({ req, res }) => {
  const body = req.body as Record<string, unknown> | undefined;

  res.json({
    ok: true,
    whoami: "Express POC using @naskot/node-express-compose-middleware",
    method: req.method,
    path: req.path,
    requestId: res.locals.requestId,
    auth: res.locals.auth,
    query: req.query,
    params: req.params,
    headers: req.headers,
    body,
  });
});
