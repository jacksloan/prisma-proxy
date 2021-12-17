import { PrismaClient } from "@prisma/client";
import bodyParser from "body-parser";
import express from "express";
import { createPrismaExpressProxy as createPrismaProxyExpress } from "../src/express-proxy";

const prismaClient = new PrismaClient();
const expressApp = express();
expressApp.use(bodyParser.json());

createPrismaProxyExpress({
  app: expressApp,
  prisma: prismaClient,

  // returns 403 forbidden for all handlers not explicitly set
  middleware: {
    post: {
      // allow any request through
      findMany: (req, res, next) => next(),
      findUnique: (req, res, next) => next(),
    },
    user: {
      findMany: (req, res, next) => {
        const token = req.headers.authorization ?? "";
        if (isUserAdmin(token)) {
          next();
        } else {
          type AuthError = Error & { status?: number };
          const error: AuthError = new Error("forbidden");
          error.status = 403;
          next(error);
        }
      },
    },
  },
});

// mock auth for purposes of demonstration
function isUserAdmin(jwt: string): boolean {
  return jwt === "ADMIN";
}

expressApp.listen(3000, () => {
  console.log(`Prisma express proxy listening at http://localhost:3000`);
});
