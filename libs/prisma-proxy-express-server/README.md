# prisma-proxy-express-server

Creates an api for your prisma client

# getting started

TODO

# basic usage

For a complete example see [express.js example app](/apps/api/src/main.ts)

```
// prisma.schema
model Post {
  id        Int     @id @default(autoincrement())
  title     String
  content   String?
}
```

```typescript
import { createPrismaExpressProxy } from '@prisma-proxy/prisma-proxy-express-server';
import { PrismaClient } from '@prisma/client';
import * as express from 'express';

const app = express();
const prisma = new PrismaClient();

createPrismaExpressProxy({
  app,
  prisma,
  // default middleware is applied if middleware is not explicitly set for a route
  defaultMiddleware: (_res, _req, next) =>
    next(new Error('internal server error')),

  // typed middleware can be used to allow/restrict access to certain prisma actions
  middleware: {
    post: {
      // un-authenticated routes
      findMany: (req, res, next) => next(),

      // restricted route
      create: (req, res, next) => {
        // typeof req.body is PostCreateArgs
        // typeof req.params is {post: string, create: string}
        const token = req.headers.authorization;
        if (isUserAdmin(token)) {
          next();
        } else {
          const error = new Error('You do not have the required permissions');
          error.status = 403;
          next(error);
        }
      },
    },
  },
});

const server = app.listen(3333);
```
