<script lang="ts">
  // vite doesn't like using the barrel imports from the nx workspace
  import { createAxiosClient } from '../../../../libs/prisma-proxy-axios-client/src/index';
  import type { PrismaClient, Post } from '@prisma/client';

  const baseURL = '/api';
  const client = createAxiosClient<PrismaClient>({ baseURL });
  const posts = client.post.findMany();
</script>

<h1>Super Awesome Blog</h1>

{#await posts}
  Loading posts...
{:then posts}
  <ul>
    {#each posts as p}
      <li>{p.title}</li>
    {/each}
  </ul>
{:catch error}
  Failed to load posts
  <br />
  {error}
{/await}
