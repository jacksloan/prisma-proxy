import axios, { Axios } from "axios";
import { PrismaProxy } from "./shared";

export function createAxiosClient<PrismaClient>(options: {
  baseURL: string;
  axios?: Axios;
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
                const response = await (options?.axios || axios).request({
                  method: "POST",
                  url: `/${prismaEntity}/${prismaAction}`,
                  baseURL: options.baseURL,
                  data: prismaArgs,
                });
                return response.data;
              };
            },
          }
        );
      },
    }
  );
}
