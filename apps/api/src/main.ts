/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { createPrismaExpressProxy } from '@prisma-proxy/prisma-proxy-express-server';
import { PrismaClient } from '@prisma/client';
import * as express from 'express';
import type { RequestHandler } from 'express';
import { HttpErrorResponse } from './app/http-error-response';

const app = express();
const prisma = new PrismaClient();

const allowAnyRequest: RequestHandler = (_req, _res, next) => next();

createPrismaExpressProxy({
  app,
  prisma,
  defaultMiddleware: (_res, _req, next) =>
    next(new HttpErrorResponse(403, 'Forbidden')),
  middleware: {
    post: {
      create: allowAnyRequest,
      findMany: allowAnyRequest,
      update: allowAnyRequest,
      findUnique: allowAnyRequest,
      delete: allowAnyRequest,
    },
  },
});

const port = process.env.port || 3333;
const server = app.listen(port, () =>
  console.log(`Listening at http://localhost:${port}`)
);
server.on('error', console.error);
