# Prisma Proxy

Create typesafe proxy servers/clients for your PrismaClient

## Prisma Proxy Express Server

Adds an express api route to your express app that acts as a proxy for your prisma client
All requests return 403: Forbidden until you explicitly enable them with middleware

[Express example app](apps/api/src/main.ts)

[README](libs/prisma-proxy-express-server/README.md)

## Prisma Proxy Fetch Client

Creates a tiny (237 bytes minified & gzipped), typesafe api client for your express server proxy

[NextJS example app](apps/web/pages/index.tsx)

[README](libs/prisma-proxy-fetch-client/README.md)
