import { PrismaClient } from '@prisma/client';

/**
 * Prisma client singleton.
 * Hot-reload (dev) үед олон холболт үүсэхээс сэргийлж global-д хадгална.
 */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'warn', 'error'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// Prisma-аас үүсгэгдсэн бүх төрөл, enum-ийг дахин export хийнэ
export * from '@prisma/client';
export { PrismaClient } from '@prisma/client';
