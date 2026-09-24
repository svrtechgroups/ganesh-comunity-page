import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function getPrismaClient(): PrismaClient {
  if (globalForPrisma.prisma) {
    if ('config' in (globalForPrisma.prisma as any)) {
      return globalForPrisma.prisma;
    }
    // Delete stale @prisma/client from require cache
    try {
      if (typeof require !== 'undefined' && require.cache) {
        Object.keys(require.cache).forEach((key) => {
          if (key.includes('@prisma/client') || key.includes('.prisma')) {
            delete require.cache[key];
          }
        });
      }
      const FreshClient = require('@prisma/client').PrismaClient;
      globalForPrisma.prisma = new FreshClient({
        log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
      });
      return globalForPrisma.prisma!;
    } catch (e) {
      console.error('Error refreshing Prisma client:', e);
    }
  }

  const client = new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

  if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = client;
  }

  return client;
}

export const prisma = getPrismaClient();
