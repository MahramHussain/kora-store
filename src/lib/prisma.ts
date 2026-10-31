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
  const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    max: 15, // Allow enough pool connections for concurrent server component queries across sections
    idleTimeoutMillis: 15000, // Close idle connections after 15 seconds to stay within Neon's pooler timeouts
    connectionTimeoutMillis: 30000, // 30s to comfortably handle Neon cold starts without timing out
    keepAlive: true,
  });

  // Catch unexpected idle client errors so they do not crash or abort queries
  pool.on('error', (err) => {
    console.warn('[Prisma pgPool] Handled idle client error (pool will discard client and reconnect):', err.message);
  });

  globalForPrisma.pgPool = pool;
}

const pool = globalForPrisma.pgPool;
const adapter = new PrismaPg(pool);

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    adapter,
    // Avoid verbose query logging in production to save CPU/logging costs
    log: process.env.NODE_ENV === 'production' ? [] : ['error'],
  });

// Always store it in global so it persists in warm lambda containers
globalForPrisma.prisma = prisma;
