import { Application, RequestHandler, json } from 'express';
import { PartialDeep } from 'type-fest';

export type FilterNotStartingWith<
  T,
  Prefix extends string
> = T extends `${Prefix}${infer _Rest}` ? never : T;

// remove all keys starting with '$' prefix leaving only entity names
export type OmitKeysStartingWith$<T> = Pick<
  T,
  FilterNotStartingWith<keyof T, '$'>
>;

type GetFirstParameterType<
  PrismaClient,
  PrismaEntityName extends keyof PrismaClient,
  PrismaActionName extends keyof PrismaClient[PrismaEntityName]
> = Parameters<
  PrismaClient[PrismaEntityName][PrismaActionName] extends (
    ...args: unknown[]
  ) => unknown
    ? PrismaClient[PrismaEntityName][PrismaActionName]
    : never
>[0];

export type PrismaProxyRequestHandler<PrismaClient> = {
  [entity in keyof PrismaClient]: {
    [action in keyof PrismaClient[entity]]: RequestHandler<
      { [k in entity | action]: string },
      unknown,
      GetFirstParameterType<PrismaClient, entity, action>
    >;
  };
};

export const prismaActions = [
  'groupBy',
  'aggregate',
  'count',
  'create',
  'createMany',
  'delete',
  'deleteMany',
  'executeRaw',
  'findFirst',
  'findMany',
  'findUnique',
  'queryRaw',
  'update',
  'updateMany',
  'upsert',
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

class HttpError extends Error {
  status = 500;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

const fallbackHandler: RequestHandler = (req, res, next) => {
  next(new HttpError(403, 'Forbidden'));
};

export function createPrismaExpressProxy<PrismaClient>(options: {
  apiPrefix?: `/${string}`;
  app: Application;
  prisma: PrismaClient;
  middleware: PartialDeep<
    PrismaProxyRequestHandler<OmitKeysStartingWith$<PrismaClient>>
  >;
  defaultMiddleware?: RequestHandler;
}) {
  const { apiPrefix, app, prisma, middleware, defaultMiddleware } = options;
  app.use(json())

  const middlewares = Object.keys(prisma)
    .filter((maybeEntity) => maybeEntity[0] !== '$')
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
    `${apiPrefix || ''}/:prismaEntity/:prismaAction`,
    (req, res, next) => {
      const { prismaEntity, prismaAction } = req.params;
      const middleware = (middlewares as any)?.[prismaEntity]?.[prismaAction];
      if (middleware && typeof middleware === 'function') {
        middleware(req, res, next);
      } else {
        next(new Error(`no middleware defined for route ${prismaEntity}/${prismaAction}`));
      }
    }
  );
  app.post(`${apiPrefix || ''}/:prismaEntity/:prismaAction`, (req, res) => {
    const { prismaEntity, prismaAction } = req.params;
    const { body: prismaArgs } = req;
    const prismaFunc: (args: any) => Promise<any> = (prisma as any)[
      prismaEntity
    ][prismaAction];
    prismaFunc(prismaArgs).then((data: any) => res.send(data));
  });
}
