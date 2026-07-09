import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

// Force next.js to re-read updated prisma schema
const globalForPrisma = global as unknown as { prisma: PrismaClient };

// Prisma 7 requires this new Adapter pattern to talk to Vercel/Neon
const adapter = new PrismaPg({ 
  connectionString: process.env.DATABASE_URL! 
});

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    adapter, // <-- We inject the adapter here!
    log: ['query'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;