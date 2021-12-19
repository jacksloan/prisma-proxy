export type FilterNotStartingWith<
  T,
  Prefix extends string
> = T extends `${Prefix}${infer _Rest}` ? never : T;

// remove all keys starting with '$' prefix leaving only entity names
export type PrismaProxy<T> = Pick<T, FilterNotStartingWith<keyof T, '$'>>;

export function createFetchClient<PrismaClient>(
  baseUrl: string,
  requestOptions?: () => RequestInit | Promise<RequestInit>
): PrismaProxy<PrismaClient> {
  const newProxy = (
    handler: (_target: any, prop: string, _receiver: any) => any
  ) => new Proxy({}, { get: handler });
  return newProxy((_, prismaEntity) =>
    newProxy((_, prismaAction) => async (body: any) => {
      const res = await fetch(`${baseUrl}/${prismaEntity}/${prismaAction}`, {
        method: 'POST',
        body,
        ...(requestOptions ? await requestOptions() : {}),
      });
      return res.json();
    })
  );
}
