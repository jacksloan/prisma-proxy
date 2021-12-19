import { createAxiosClient } from '@prisma-proxy/prisma-proxy-fetch-client';
import { Post, PrismaClient } from '@prisma/client';
import { NextPage, NextPageContext } from 'next';
import styles from './index.module.css';

export async function getServerSideProps(_context: NextPageContext) {
  const baseURL = 'http://localhost:3333';
  const api = createAxiosClient<PrismaClient>({ baseUrl: baseURL });
  const posts = await api.post.findMany();
  return { props: { posts } };
}

const IndexPage: NextPage<{ posts: Post[] }> = (props) => {
  return (
    <div className={styles.page}>
      <div className={styles.pageChild}>
        <h1>Super Awesome Blog</h1>
        <section>
          <h2>Posts</h2>
          <ul>
            {props.posts.map((p) => (
              <li key={p.id}>
                <a href={`/${p.id}`}>{p.title}</a>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
};

export default IndexPage;
