# prisma-proxy-fetch-client

Creates a tiny (237 bytes minified & gzipped), typesafe api client using the same familiar api as your generated PrismaClient

# example

For a complete example see [next.js example app](/apps/web/pages/index.tsx)

```
// prisma.schema
model Post {
  id        Int     @id @default(autoincrement())
  title     String
  content   String?
}
```

```typescript
import { createFetchClient } from 'prisma-proxy-fetch-client';
import type { PrismaClient } from '@prisma/client';

const baseURL = 'http://localhost:3333';
const api = createFetchClient<PrismaClient>({ baseUrl: baseURL });
const posts = await api.post.findMany({ where: { title: 'First Post' } });
// makes the following post request
//     url   http://localhost:3333/post/findMany
//     body  { "where": { "title": "First Post" }}
```

## Running unit tests

Run `nx test prisma-proxy-fetch-client` to execute the unit tests via [Jest](https://jestjs.io).
