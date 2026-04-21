import { compose } from "@naskot/node-express-compose-middleware";

export const healthController = compose(({ res }) => {
  res.json({ ok: true, service: "node-express-compose-middleware-poc" });
});
