import { PrismaClient } from "@prisma/client";
import axios from "axios";
import { createAxiosClient as createAxiosClient } from "../src/axios-client";

const proxy = createAxiosClient<PrismaClient>({
  baseURL: "http://localhost:3000/prisma-proxy",
  axios: axios.create({
    headers: {
      authorization: "ADMIN",
    },
  }),
});

async function main() {
  // posts to http://localhost:3000/post/findMany with body
  const posts = await proxy.post.findMany({
    where: {
      author: {
        email: "sarah@prisma.io",
      },
    },
  });
  console.log({ posts });
}

main().then(() => {});
