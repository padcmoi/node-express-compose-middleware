# @naskot/node-express-compose-middleware

Tiny Express-only utility to compose multiple middlewares with a final handler using `{ req, res, next }` context.

## In 4 Lines

- Express-only helper to chain middlewares and final handler in one readable `compose(...)`.
- Supports both styles: classic `(req, res, next)` and ctx-style `({ req, res, next })`.
- Unifies async/sync error forwarding to `next(err)` without extra boilerplate.
- Works in NestJS only when you use the Express adapter (`@nestjs/platform-express`).

## Why use it

- Keep middleware chain readable in one function.
- Final handler can use object context instead of `(req, res, next)` signature.
- Same behavior as the starter-template `compose.ts`.

## Install

```bash
npm i @naskot/node-express-compose-middleware express
```

## Usage

```ts
import { compose } from "@naskot/node-express-compose-middleware";

const routeHandler = compose(authMiddleware("hmac"), async ({ req, res }) => {
  res.json({ ok: true, headers: req.headers, locals: res.locals });
});
```

## Examples

### 1) Final handler only (ctx style)

```ts
import { compose } from "@naskot/node-express-compose-middleware";

export const ping = compose(({ res }) => {
  res.json({ ok: true });
});
```

### 2) Final handler only (classic Express style)

```ts
import { compose } from "@naskot/node-express-compose-middleware";

export const ping = compose((req, res) => {
  res.json({ method: req.method, ok: true });
});
```

### 3) Middleware + final ctx handler

```ts
import { compose } from "@naskot/node-express-compose-middleware";

export const targetHMAC = compose(authMiddleware("hmac"), async ({ req, res }) => {
  const remoteRedisKeys = await debugExtractKeysSecretsFromRedis("key");
  const remoteIp = getRemoteIp(req);

  res.json({
    remoteIp,
    remoteRedisKeys,
    ok: true,
    body: req.body,
    query: req.query,
    params: req.params,
    locals: res.locals,
    headers: req.headers,
  });
});
```

### 4) Multiple middlewares with `res.locals`

```ts
import { compose } from "@naskot/node-express-compose-middleware";

export const me = compose(
  (_req, res, next) => {
    res.locals.requestId = crypto.randomUUID();
    next();
  },
  async (req, res, next) => {
    res.locals.user = await userService.findByToken(req.headers.authorization ?? "");
    next();
  },
  ({ res }) => {
    res.json({
      requestId: res.locals.requestId,
      user: res.locals.user,
    });
  },
);
```

### 5) Access guard (short-circuit)

```ts
import { compose } from "@naskot/node-express-compose-middleware";

export const adminStats = compose(
  (_req, res, next) => {
    if (!res.locals.user?.isAdmin) {
      res.status(403).json({ ok: false, error: "forbidden" });
      return;
    }
    next();
  },
  ({ res }) => {
    res.json({ ok: true, scope: "admin" });
  },
);
```

### 6) Validation middleware

```ts
import { compose } from "@naskot/node-express-compose-middleware";

export const createUser = compose(
  (req, res, next) => {
    if (typeof req.body?.email !== "string" || req.body.email.length === 0) {
      res.status(400).json({ ok: false, error: "email_required" });
      return;
    }
    next();
  },
  async ({ req, res }) => {
    const user = await userService.create({ email: req.body.email });
    res.status(201).json({ ok: true, user });
  },
);
```

### 7) Final handler as classic `RequestHandler`

```ts
import { compose } from "@naskot/node-express-compose-middleware";

export const route = compose(
  (_req, _res, next) => next(),
  (_req, _res, next) => next(),
  (req, res) => {
    res.json({ ok: true, path: req.path });
  },
);
```

### 8) Throwing errors (auto-forward to `next`)

```ts
import { compose } from "@naskot/node-express-compose-middleware";

export const failDemo = compose(async () => {
  throw new Error("boom");
});

// Express error middleware
app.use((err, _req, res, _next) => {
  res.status(500).json({ ok: false, error: err.message });
});
```

## API

- `compose(handler)` where `handler` is `(ctx) => unknown`
- `compose(handler)` where `handler` is classic `RequestHandler`
- `compose(...middlewares, finalHandler)` where final handler can be ctx-style or `RequestHandler`

## Local checks

```bash
npm run lint
npm run check
npm test
npm run build
```
