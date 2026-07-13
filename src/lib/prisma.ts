import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

// Force next.js to re-read updated prisma schema and persist database pool across warm serverless functions
const globalForPrisma = global as unknown as {
  prisma?: PrismaClient;
  pgPool?: pg.Pool;
};

// Create a single pg Pool if it doesn't exist
if (!globalForPrisma.pgPool) {
  globalForPrisma.pgPool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    max: 2, // Limit pool size in serverless to prevent connection exhaustion
    idleTimeoutMillis: 30000, // Close idle connections after 30 seconds
    connectionTimeoutMillis: 5000, // Return an error after 5 seconds if connection fails
  });
}

const pool = globalForPrisma.pgPool;
const adapter = new PrismaPg(pool);

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    adapter, // <-- We inject the adapter here!
    // Avoid verbose query logging in production to save CPU/logging costs
    log: process.env.NODE_ENV === 'production' ? [] : ['query', 'error'],
  });

// Always store it in global so it persists in warm lambda containers
globalForPrisma.prisma = prisma;