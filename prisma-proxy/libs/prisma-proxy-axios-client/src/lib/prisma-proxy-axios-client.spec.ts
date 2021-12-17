import { prismaProxyAxiosClient } from './prisma-proxy-axios-client';

describe('prismaProxyAxiosClient', () => {
  it('should work', () => {
    expect(prismaProxyAxiosClient()).toEqual('prisma-proxy-axios-client');
  });
});
