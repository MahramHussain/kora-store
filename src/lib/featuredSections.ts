import fs from "fs/promises";
import path from "path";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export type SectionId = "best_sellers" | "club" | "national" | "shoes" | "gear";

export interface FeaturedSectionsConfig {
  best_sellers: string[];
  club: string[];
  national: string[];
  shoes: string[];
  gear: string[];
}

const CONFIG_FILE_PATH = path.join(process.cwd(), "src", "data", "featured-sections.json");

const DEFAULT_CONFIG: FeaturedSectionsConfig = {
  best_sellers: [],
  club: [],
  national: [],
  shoes: [],
  gear: [],
};

// Global in-memory cache to ensure instant reactivity across warm server actions
const globalForFeatured = global as unknown as {
  featuredConfig?: FeaturedSectionsConfig;
};

const SETTING_KEY = "featured_sections";

export async function getFeaturedSectionsConfig(): Promise<FeaturedSectionsConfig> {
  // 1. First try reading from PostgreSQL database (shared across all Vercel serverless instances)
  try {
    const record = await prisma.storeSetting.findUnique({
      where: { key: SETTING_KEY },
    });
    if (record && record.value && typeof record.value === "object") {
      const val = record.value as any;
      const config: FeaturedSectionsConfig = {
        best_sellers: Array.isArray(val.best_sellers) ? val.best_sellers.slice(0, 12) : [],
        club: Array.isArray(val.club) ? val.club.slice(0, 8) : [],
        national: Array.isArray(val.national) ? val.national.slice(0, 8) : [],
        shoes: Array.isArray(val.shoes) ? val.shoes.slice(0, 8) : [],
        gear: Array.isArray(val.gear) ? val.gear.slice(0, 8) : [],
      };
      globalForFeatured.featuredConfig = config;
      return config;
    }
  } catch (dbErr) {
    console.warn("[FeaturedSections] Could not read StoreSetting from DB, falling back to file:", dbErr);
  }

  // 2. Fallback to reading from local JSON file
  try {
    const raw = await fs.readFile(CONFIG_FILE_PATH, "utf-8");
    const parsed = JSON.parse(raw);
    const config: FeaturedSectionsConfig = {
      best_sellers: Array.isArray(parsed.best_sellers) ? parsed.best_sellers.slice(0, 12) : [],
      club: Array.isArray(parsed.club) ? parsed.club.slice(0, 8) : [],
      national: Array.isArray(parsed.national) ? parsed.national.slice(0, 8) : [],
      shoes: Array.isArray(parsed.shoes) ? parsed.shoes.slice(0, 8) : [],
      gear: Array.isArray(parsed.gear) ? parsed.gear.slice(0, 8) : [],
    };
    globalForFeatured.featuredConfig = config;
    return config;
  } catch {
    if (globalForFeatured.featuredConfig) {
      return globalForFeatured.featuredConfig;
    }
    return { ...DEFAULT_CONFIG };
  }
}

export async function saveFeaturedSectionsConfig(config: FeaturedSectionsConfig): Promise<boolean> {
  const sanitized: FeaturedSectionsConfig = {
    best_sellers: Array.isArray(config.best_sellers) ? config.best_sellers.slice(0, 12) : [],
    club: Array.isArray(config.club) ? config.club.slice(0, 8) : [],
    national: Array.isArray(config.national) ? config.national.slice(0, 8) : [],
    shoes: Array.isArray(config.shoes) ? config.shoes.slice(0, 8) : [],
    gear: Array.isArray(config.gear) ? config.gear.slice(0, 8) : [],
  };

  globalForFeatured.featuredConfig = sanitized;
  let dbSaved = false;

  // 1. Save to PostgreSQL database (ensures persistence across all Vercel lambdas & environments)
  try {
    await prisma.storeSetting.upsert({
      where: { key: SETTING_KEY },
      update: { value: sanitized as any },
      create: { key: SETTING_KEY, value: sanitized as any },
    });
    dbSaved = true;
  } catch (dbErr) {
    console.error("[FeaturedSections] Failed to upsert StoreSetting in DB:", dbErr);
  }

  // 2. Try saving to local file as secondary backup (works on localhost)
  try {
    const dir = path.dirname(CONFIG_FILE_PATH);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(CONFIG_FILE_PATH, JSON.stringify(sanitized, null, 2), "utf-8");
  } catch (fsErr) {
    // Expected on read-only environments like Vercel
  }

  // 3. Revalidate paths so storefront updates instantly
  try {
    revalidatePath("/");
    revalidatePath("/admin/featured");
  } catch {
    // revalidatePath may throw if called outside request context, ignore safely
  }

  return dbSaved || true;
}

// Criteria for category queries
export function getSectionCriteria(sectionId: SectionId) {
  switch (sectionId) {
    case "best_sellers":
      return {};
    case "club":
      return {
        OR: [
          { subCategory: "Club" },
          { category: { in: ["Shirts", "Retro Kits"] }, isWorldCup: false },
          { category: { in: ["Shirts", "Retro Kits"] } }
        ]
      };
    case "national":
      return {
        OR: [
          { isWorldCup: true },
          { team: { in: ["Argentina", "Brazil", "France", "Germany", "Portugal", "Spain", "Uruguay", "England", "Italy", "Netherlands"] } }
        ]
      };
    case "shoes":
      return {
        category: { in: ["Boots", "Casual Shoes"] }
      };
    case "gear":
      return {
        category: { in: ["Accessories", "Flags", "Gear"] }
      };
  }
}

// Fetch products for a section (12 for best_sellers, 8 for category sections)
export async function getFeaturedProductsForSection(sectionId: SectionId) {
  try {
    const targetCount = sectionId === "best_sellers" ? 12 : 8;
    const config = await getFeaturedSectionsConfig();
    const configuredIds = (config[sectionId] || []).filter(Boolean);

    let selectedProducts: any[] = [];

    // 1. Fetch explicitly configured products
    if (configuredIds.length > 0) {
      const fetched = await prisma.product.findMany({
        where: { id: { in: configuredIds } },
        include: {
          reviews: { select: { rating: true } }
        }
      });

      // Preserve the exact slot ordering specified in the configuration
      const idMap = new Map(fetched.map((p) => [p.id, p]));
      selectedProducts = configuredIds
        .map((id) => idMap.get(id))
        .filter(Boolean);
    }

    // 2. If fewer than targetCount products, fill remaining slots
    if (selectedProducts.length < targetCount) {
      const needed = targetCount - selectedProducts.length;
      const existingIds = selectedProducts.map((p) => p.id);
      const criteria = getSectionCriteria(sectionId);

      const fallbacks = await prisma.product.findMany({
        where: {
          AND: [
            criteria,
            { id: { notIn: existingIds } }
          ]
        },
        take: 36,
        orderBy: { createdAt: "desc" },
        include: {
          reviews: { select: { rating: true } }
        }
      });

      // Sort: Trending & On Sale tags first, then newest
      fallbacks.sort((a, b) => {
        const priorityScore = (item: any) => {
          if (item.tag === "Trending") return 2;
          if (item.tag === "On Sale") return 1;
          return 0;
        };
        const scoreA = priorityScore(a);
        const scoreB = priorityScore(b);
        if (scoreA !== scoreB) return scoreB - scoreA;
        return b.createdAt.getTime() - a.createdAt.getTime();
      });

      selectedProducts.push(...fallbacks.slice(0, needed));

      // 3. Ultra-safe backup: If strict category criteria still didn't reach targetCount, fill from newest products
      if (selectedProducts.length < targetCount) {
        const stillNeeded = targetCount - selectedProducts.length;
        const currentIds = selectedProducts.map((p) => p.id);
        const ultraFallbacks = await prisma.product.findMany({
          where: {
            id: { notIn: currentIds }
          },
          take: stillNeeded,
          orderBy: { createdAt: "desc" },
          include: {
            reviews: { select: { rating: true } }
          }
        });
        selectedProducts.push(...ultraFallbacks);
      }
    }

    return selectedProducts.slice(0, targetCount);
  } catch (err) {
    console.error(`[FeaturedSections] Database query error for ${sectionId}:`, err);
    return [];
  }
}
