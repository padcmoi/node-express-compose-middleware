import type { NextFunction, Request, RequestHandler, Response } from "express";
import { describe, expect, it, vi } from "vitest";
import { compose } from "../src";
import type { ComposeHandler } from "../src";

function createReq() {
  return { method: "GET", headers: {}, query: {}, params: {}, body: {} } as unknown as Request;
}

function createRes() {
  return { locals: {}, json: vi.fn() } as unknown as Response;
}

describe("compose", () => {
  it("supports final ctx handler", async () => {
    const req = createReq();
    const res = createRes();
    const next = vi.fn() as NextFunction;

    const finalHandler: ComposeHandler = ({ req: ctxReq, res: ctxRes }) => {
      ctxRes.json({ ok: true, method: ctxReq.method });
    };

    const handler = compose(finalHandler);

    handler(req, res, next);
    await Promise.resolve();

    expect(res.json).toHaveBeenCalledWith({ ok: true, method: "GET" });
    expect(next).not.toHaveBeenCalled();
  });

  it("supports middleware chain then final ctx handler", async () => {
    const req = createReq();
    const res = createRes();
    const next = vi.fn() as NextFunction;

    const m1: RequestHandler = (_req, _res, mwNext) => {
      mwNext();
    };

    const m2: RequestHandler = (_req, _res, mwNext) => {
      mwNext();
    };

    const finalHandler: ComposeHandler = ({ res: ctxRes }) => {
      ctxRes.json({ ok: true });
    };

    const handler = compose(m1, m2, finalHandler);

    handler(req, res, next);
    await Promise.resolve();

    expect(res.json).toHaveBeenCalledWith({ ok: true });
    expect(next).not.toHaveBeenCalled();
  });

  it("forwards middleware error", async () => {
    const req = createReq();
    const res = createRes();
    const next = vi.fn() as NextFunction;

    const err = new Error("boom");

    const badMw: RequestHandler = (_req, _res, mwNext) => {
      mwNext(err);
    };

    const finalHandler: ComposeHandler = ({ res: ctxRes }) => {
      ctxRes.json({ ok: true });
    };

    const handler = compose(badMw, finalHandler);

    handler(req, res, next);
    await Promise.resolve();

    expect(next).toHaveBeenCalledWith(err);
    expect(res.json).not.toHaveBeenCalled();
  });
});
