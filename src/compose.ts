import type { NextFunction, Request, RequestHandler, Response } from "express";
import type { ComposeHandler, ComposeHandlers, FinalHandler } from "./types";

function callMiddleware(fn: RequestHandler, req: Request, res: Response, next: NextFunction) {
  try {
    Promise.resolve(fn(req, res, next)).catch(next);
  } catch (err) {
    next(err);
  }
}

function callFinal(fn: FinalHandler, req: Request, res: Response, next: NextFunction) {
  try {
    const result = fn.length <= 1 ? (fn as ComposeHandler)({ req, res, next }) : (fn as RequestHandler)(req, res, next);
    Promise.resolve(result).catch(next);
  } catch (err) {
    next(err);
  }
}

export function compose(handler: ComposeHandler): RequestHandler;
export function compose(handler: RequestHandler): RequestHandler;
export function compose(...handlers: [...RequestHandler[], ComposeHandler]): RequestHandler;
export function compose(first: RequestHandler, ...rest: [...RequestHandler[], RequestHandler]): RequestHandler;

// eslint-disable-next-line no-restricted-syntax
export function compose(...handlers: ComposeHandlers): RequestHandler {
  if (handlers.length === 0) {
    return (_req: Request, _res: Response, next: NextFunction) => next();
  }

  if (handlers.length === 1) {
    return (req: Request, res: Response, next: NextFunction) => callFinal(handlers[0] as FinalHandler, req, res, next);
  }

  const finalHandler = handlers[handlers.length - 1] as FinalHandler;
  const middlewares = handlers.slice(0, -1) as RequestHandler[];

  return middlewares.reduceRight<RequestHandler>(
    (nextHandler, mw) => {
      return (req: Request, res: Response, next: NextFunction) => {
        let done = false;

        callMiddleware(mw, req, res, (err?: unknown) => {
          if (done) return;
          done = true;

          if (err) {
            next(err);
            return;
          }

          callMiddleware(nextHandler, req, res, next);
        });
      };
    },
    (req: Request, res: Response, next: NextFunction) => callFinal(finalHandler, req, res, next),
  );
}
