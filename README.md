# Prisma Proxy

Create typesafe proxy servers/clients for your PrismaClient

# Installation

`npm i prisma-proxy-fetch-client`

`npm i prisma-proxy-express-server`

# Basic usage

See individual libraries for more detailed demo & readme

```
// schema.prisma
model Post {
  id        Int     @id @default(autoincrement())
  title     String
  content   String?
}
```

```ts
// server.ts
createPrismaExpressProxy({
  app: express(),
  prisma: new PrismaClient(),
  apiPrefix: 'prisma',

  // default middleware returns
  // status 403 for ALL routes
  // unless explicitely overriden
  middleware: {
    post: {
      // unrestricted
      findMany: (req, res, next) => next(),

      // restricted
      create: (req, res, next) => {
        // do some custom auth logic
        if (isPermitted(req)) {
          next();
        } else {
          next(new Error());
        }
      },
    },
  },
});
```

```ts
// client.ts
const baseURL = 'http://localhost:3333';
const api = createFetchClient<PrismaClient>(baseURL);

// makes a post request to:
//      http://localhost:3333/post/findMany
//      { "where": { "title": "My First Post" } }
const posts: Post[] = await api.post.findMany({
  where: { title: 'My First Post' },
});
```

## Prisma Proxy Express Server

Adds an express api route to your express app that acts as a proxy for your prisma client
All requests return 403: Forbidden until you explicitly enable them with middleware

[Express example app](apps/api/src/main.ts)

[README](libs/prisma-proxy-express-server/README.md)

## Prisma Proxy Fetch Client

Creates a tiny (237 bytes minified & gzipped), typesafe api client for your express server proxy

[NextJS example app](apps/web/pages/index.tsx)

[README](libs/prisma-proxy-fetch-client/README.md)

## Running the examples apps

```
# install dependencies
npm install

# generate the prisma client
npx prisma generate

# serve the api and web project
npm run serve
```
