import { prismaProxyExpressServer } from './prisma-proxy-express-server';

describe('prismaProxyExpressServer', () => {
  it('should work', () => {
    expect(prismaProxyExpressServer()).toEqual('prisma-proxy-express-server');
  });
});
