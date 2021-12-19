export type FilterNotStartingWith<
  T,
  Prefix extends string
> = T extends `${Prefix}${infer _Rest}` ? never : T;

// remove all keys starting with '$' prefix leaving only entity names
export type PrismaProxy<T> = Pick<T, FilterNotStartingWith<keyof T, '$'>>;

export function createAxiosClient<PrismaClient>(options: {
  baseUrl: string;
  requestOptions?: RequestInit | (() => RequestInit | Promise<RequestInit>);
}): PrismaProxy<PrismaClient> {
  return new Proxy(
    {},
    {
      get(_target: any, prismaEntity: string, _receiver) {
        return new Proxy(
          {},
          {
            get(_target: any, prismaAction: string, _receiver) {
              return async (prismaArgs: any) => {
                const requestInit = options.requestOptions
                  ? typeof options.requestOptions === 'function'
                    ? await options.requestOptions()
                    : options.requestOptions
                  : {};
                const response = await fetch(
                  `${options.baseUrl}/${prismaEntity}/${prismaAction}`,
                  {
                    method: 'POST',
                    body: prismaArgs,
                    ...requestInit,
                  }
                );
                return response.json();
              };
            },
          }
        );
      },
    }
  );
}
