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
      const options = opt.requestOptions ? await opt.requestOptions() : {};

      const res = await (opt.fetch || fetch)(
        `${opt.baseUrl}/${prismaEntity}/${prismaAction}`,
        {
          ...options,
          method: 'POST',
          body: JSON.stringify(body),
          headers: {
            ...(options?.headers || {}),
            'Content-Type': 'application/json',
          },
        }
      );

      const text = await res.text();
      try {
        // null is a valid prisma response for some queries
        return text && JSON.parse(text);
      } catch (e) {
        throw new Error(
          `Prisma proxy client - could not parse json from text ${text}`
        );
      }
    })
  );
}
