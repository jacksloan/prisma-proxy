import { PrismaClient } from "@prisma/client";
import bodyParser from "body-parser";
import express from "express";
import {
  createPrismaExpressProxy,
  createDefaultRequestHandlers,
} from "../src/express-proxy";

const prismaClient = new PrismaClient();
const expressApp = express();
expressApp.use(bodyParser.json());

createPrismaExpressProxy({
  apiPrefix: "/prisma-proxy",
  app: expressApp,
  prisma: prismaClient,

  // returns 403 forbidden for all handlers not explicitly set
  middleware: {
    post: {
      // allow any request to /post/findMany, /post/update, etc...
      ...createDefaultRequestHandlers((req, res, next) => next()),
    },
    user: {
      findMany: (req, _res, next) => {
        if (req.headers.authorizationtoken === "ADMIN") {
          next();
        } else {
          next(new Error("forbidden"));
        }
      },
      findFirst: (req, _res, next) => {
        // req.params and req.body are fully typed!
        //     typeof req.params = {user: string, findFirst: string}
        //     typeof req.body = UserFindFirstArgs
        if (req.body?.where?.name === "Sarah") {
          next(new Error("top secret"));
        } else {
          next();
        }
      },
    },
  },
});

expressApp.listen(3000, () => {
  console.log(`Prisma express proxy listening at http://localhost:3000`);
});
