import { Application, RequestHandler } from "express";
import { PartialDeep } from "type-fest";

export type PrismaProxyRequestHandler<PrismaClient> = {
  [entity in keyof PrismaClient]: {
    [operation in keyof PrismaClient[entity]]: RequestHandler;
  };
};

export const prismaActions = [
  "groupBy",
  "aggregate",
  "count",
  "create",
  "createMany",
  "delete",
  "deleteMany",
  "executeRaw",
  "findFirst",
  "findMany",
  "findUnique",
  "queryRaw",
  "update",
  "updateMany",
  "upsert",
] as const;

export type prismaActionType = typeof prismaActions[number];

export type PrismaExpressProxyMiddlewares = {
  [k in prismaActionType]: RequestHandler;
};

export function createDefaultRequestHandlers(
  handler: RequestHandler
): PrismaExpressProxyMiddlewares {
  return prismaActions.reduce(
    (acc, curr) => ({ ...acc, [curr]: handler }),
    {} as PrismaExpressProxyMiddlewares
  );
}

const fallbackHandler: RequestHandler = (req, res, next) => {
  const error = new Error("Forbidden");
  (error as any).status = 403;
  next(error);
};

export function createPrismaExpressProxy<PrismaClient>(options: {
  apiPrefix?: `/${string}`;
  app: Application;
  prisma: PrismaClient;
  middleware: PartialDeep<PrismaProxyRequestHandler<PrismaClient>>;
  defaultMiddleware?: RequestHandler;
}) {
  const { apiPrefix, app, prisma, middleware, defaultMiddleware } = options;

  const middlewares = Object.keys(prisma)
    .filter((maybeEntity) => maybeEntity[0] !== "$")
    .reduce((acc, entityName) => {
      const handler = defaultMiddleware ?? fallbackHandler;
      const handlerDefaults = createDefaultRequestHandlers(handler);
      const handlerOverrides = (middleware as any)[entityName] ?? {};
      return {
        ...acc,
        [entityName]: {
          ...handlerDefaults,
          ...handlerOverrides,
        },
      };
    }, {} as PrismaProxyRequestHandler<PrismaClient>);
  app.use(
    `${apiPrefix || ""}/:prismaEntity/:prismaAction`,
    (req, res, next) => {
      const { prismaEntity, prismaAction } = req.params;
      const middleware = (middlewares as any)?.[prismaEntity]?.[prismaAction];
      middleware(req, res, next);
    }
  );
  app.post(`${apiPrefix || ""}/:prismaEntity/:prismaAction`, (req, res) => {
    const { prismaEntity, prismaAction } = req.params;
    const { body: prismaArgs } = req;
    const prismaFunc: (args: any) => Promise<any> = (prisma as any)[
      prismaEntity
    ][prismaAction];
    prismaFunc(prismaArgs).then((data: any) => res.send(data));
  });
}