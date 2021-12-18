/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { createPrismaExpressProxy } from '@prisma-proxy/prisma-proxy-express-server';
import { PrismaClient } from '@prisma/client';
import * as express from 'express';

const app = express();
const prisma = new PrismaClient();

createPrismaExpressProxy({
  app,
  prisma,
  defaultMiddleware: (_res, _req, next) => next(new Error('forbidden')),
  middleware: {
    post: {
      // allow any request to fetch many posts
      findMany: (_req, _res, next) => {
        next();
      },
    },
  },
});

const port = process.env.port || 3333;
const server = app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}`);
});
server.on('error', console.error);
