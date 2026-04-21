import type { NextFunction, Request, RequestHandler, Response } from "express";

export type ComposeContext = {
  req: Request;
  res: Response;
  next: NextFunction;
};

export type ComposeHandler = (ctx: ComposeContext) => unknown;

export type FinalHandler = ComposeHandler | RequestHandler;

export type ComposeHandlers = [ComposeHandler] | [RequestHandler] | [...RequestHandler[], ComposeHandler] | [RequestHandler, ...RequestHandler[], RequestHandler];
