import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";
import pg from "pg";
import { PRESET_PLAYERS } from "../src/lib/constants";

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const getPresetPlayersForProduct = (productName: string) => {
  const normalized = productName.toUpperCase().replace(/\s+KIT.*$/i, "").trim();
  return PRESET_PLAYERS[normalized] || [];
};

async function main() {
  console.log("🚀 Initializing player name stocks for existing shirts...");
  const products = await prisma.product.findMany({
    where: {
      category: { in: ["Shirts", "Retro Kits"] }
    }
  });

  console.log(`Found ${products.length} shirt products.`);

  for (const product of products) {
    const presetPlayers = getPresetPlayersForProduct(product.name);
    if (presetPlayers.length > 0) {
      console.log(`Product: "${product.name}" (ID: ${product.id}) has ${presetPlayers.length} preset players.`);
      for (const player of presetPlayers) {
        await prisma.playerStock.upsert({
          where: {
            productId_playerName: {
              productId: product.id,
              playerName: player.name
            }
          },
          update: {},
          create: {
            productId: product.id,
            playerName: player.name,
            playerNumber: player.number,
            quantity: 10 // default stock to 10
          }
        });
        console.log(`  - Set stock for ${player.name} (#${player.number}) to 10`);
      }
    }
  }
  console.log("✅ Initialization complete!");
}

main()
  .catch(e => {
    console.error("❌ Seeding crash:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
