export type FilterNotStartingWith<
  T,
  Prefix extends string
> = T extends `${Prefix}${infer _Rest}` ? never : T;

// remove all keys starting with '$' prefix leaving only entity names
export type PrismaProxy<T> = Pick<T, FilterNotStartingWith<keyof T, '$'>>;

export function createFetchClient<PrismaClient>(opt: {
  baseUrl: string;
  requestOptions?: () => RequestInit | Promise<RequestInit>;
  fetch?: (input: RequestInfo, init?: RequestInit) => Promise<Response>;
}): PrismaProxy<PrismaClient> {
  const newProxy = (
    handler: (_target: any, prop: string, _receiver: any) => any
  ) => new Proxy({}, { get: handler });
  return newProxy((_, prismaEntity) =>
    newProxy((_, prismaAction) => async (body: any) => {
      const res = await (opt.fetch || fetch)(
        `${opt.baseUrl}/${prismaEntity}/${prismaAction}`,
        {
          method: 'POST',
          body,
          ...(opt.requestOptions ? await opt.requestOptions() : {}),
        }
      );
      return res.json();
    })
  );
}
