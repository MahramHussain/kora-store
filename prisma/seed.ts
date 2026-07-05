import { PrismaClient, Prisma } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";
import fs from "fs";
import path from "path";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!
});
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("\n🚀 [INGESTION] Starting automated product ingestion system...");

  // 1. Establish paths
  const productsFilePath = path.join(__dirname, "products.json");
  const uploadDir = path.join(process.cwd(), "public", "uploads", "products");

  // 2. Dynamic directory creation for uploads
  if (!fs.existsSync(uploadDir)) {
    console.log(`📁 [DIRECTORY] Creating missing asset folder: ${uploadDir}`);
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  // 3. Verify metadata template exists
  if (!fs.existsSync(productsFilePath)) {
    console.error(`❌ [ERROR] Metadata template file not found at: ${productsFilePath}`);
    process.exit(1);
  }

  // 4. Parse metadata JSON
  const rawData = fs.readFileSync(productsFilePath, "utf8");
  const products = JSON.parse(rawData);

  console.log(`🔍 [METADATA] Found ${products.length} products to process. Commencing validation...\n`);

  // Cleanup obsolete/dummy products
  const seededIds = products.map((item: any) => item.id);
  try {
    const obsoleteProducts = await prisma.product.findMany({
      where: { id: { notIn: seededIds } },
      select: { id: true }
    });
    const obsoleteIds = obsoleteProducts.map(p => p.id);
    if (obsoleteIds.length > 0) {
      console.log(`🧹 [CLEANUP] Cleaning up CartItems, Reviews, OrderItems for obsolete products:`, obsoleteIds);
      await prisma.cartItem.deleteMany({ where: { productId: { in: obsoleteIds } } });
      await prisma.review.deleteMany({ where: { productId: { in: obsoleteIds } } });
      await prisma.orderItem.deleteMany({ where: { productId: { in: obsoleteIds } } });
      const deleteResult = await prisma.product.deleteMany({ where: { id: { in: obsoleteIds } } });
      console.log(`✓ [CLEANUP] Removed ${deleteResult.count} obsolete products.\n`);
    }
  } catch (cleanError) {
    console.error(`⚠️ [CLEANUP WARNING] Failed to clear obsolete products:`, cleanError);
  }

  let successCount = 0;

  for (const item of products) {
    console.log(`------------------------------------------------------`);
    console.log(`📦 Processing: "${item.name}" (ID: ${item.id})`);

    // A. Asset Presence Validation (Warning only, non-blocking)
    if (item.images && Array.isArray(item.images)) {
      for (const imgPath of item.images) {
        const localImgPath = path.join(process.cwd(), "public", imgPath);
        if (!fs.existsSync(localImgPath)) {
          console.warn(
            `⚠️  [ASSET WARNING] Image file not found locally: "${localImgPath}"\n` +
            `   Make sure to drop the image in public/assets/ to prevent broken links!`
          );
        } else {
          console.log(`✓ [ASSET VERIFIED] Local image confirmed: "${imgPath}"`);
        }
      }
    }

    // B. Idempotent Upsert to Neon DB
    try {
      await prisma.product.upsert({
        where: { id: item.id },
        update: {
          name: item.name,
          category: item.category,
          team: item.team || null,
          price: new Prisma.Decimal(item.price),
          description: item.description || null,
          images: item.images || [],
          sizes: item.sizes || [],
          tag: item.tag || null,
          stock: item.stock ?? 10,
          isWorldCup: item.isWorldCup ?? false,
        },
        create: {
          id: item.id,
          name: item.name,
          category: item.category,
          team: item.team || null,
          price: new Prisma.Decimal(item.price),
          description: item.description || null,
          images: item.images || [],
          sizes: item.sizes || [],
          tag: item.tag || null,
          stock: item.stock ?? 10,
          isWorldCup: item.isWorldCup ?? false,
        },
      });
      console.log(`✓ [DATABASE] Product successfully synced (created/updated).`);
      successCount++;
    } catch (dbError) {
      console.error(`❌ [DATABASE ERROR] Failed to upsert "${item.name}":`, dbError);
    }
  }

  console.log(`======================================================`);
  console.log(`🎉 [INGESTION COMPLETED] Synced ${successCount}/${products.length} products to database.`);
  console.log(`======================================================\n`);
}

main()
  .catch((e) => {
    console.error("❌ Fatal seeding crash:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
