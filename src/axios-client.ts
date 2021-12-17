import axios, { Axios } from "axios";
import { PrismaProxy } from "./shared";

export function createAxiosClient<PrismaClient>(options: {
  basePath: string;
  axios?: Axios;
}): PrismaProxy<PrismaClient> {
  return new Proxy(
    {},
    {
      get(target: any, prismaEntity: string, _receiver) {
        return new Proxy(
          {},
          {
            get(target: any, prismaAction: string, _receiver) {
              const url = `${options.basePath}/${prismaEntity}/${prismaAction}`;
              return async (prismaArgs: any) => {
                const response = await (options?.axios || axios).post(
                  url,
                  prismaArgs
                );
                return response.data;
              };
            },
          }
        );
      },
    }
  );
}
