import axios from "axios";
import { PrismaProxy } from "./shared";

export function createAxiosClient<PrismaClient>(options: {
  basePath: string;
  headers?: Record<string, string>;
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
                const response = await axios.post(url, prismaArgs, {
                  headers: options.headers,
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
