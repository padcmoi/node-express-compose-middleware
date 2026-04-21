import { compose } from "@naskot/node-express-compose-middleware";

export const errorController = compose(async () => {
  throw new Error("POC_ERROR_FROM_COMPOSE");
});
