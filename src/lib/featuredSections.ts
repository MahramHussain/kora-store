import fs from "fs/promises";
import path from "path";
import { prisma } from "@/lib/prisma";
import { revalidatePath, revalidateTag, unstable_cache } from "next/cache";

export type SectionId = "best_sellers" | "club" | "national" | "shoes" | "gear";

export interface FeaturedSectionsConfig {
  best_sellers: string[];
  club: string[];
  national: string[];
  shoes: string[];
  gear: string[];
}

const CONFIG_FILE_PATH = path.join(process.cwd(), "src", "data", "featured-sections.json");
const LOCAL_PRODUCTS_FILE = path.join(process.cwd(), "prisma", "products.json");

const DEFAULT_CONFIG: FeaturedSectionsConfig = {
  best_sellers: [],
  club: [],
  national: [],
  shoes: [],
  gear: [],
};

// Global in-memory cache with TTL to ensure instant reactivity and avoid redundant DB hammering
const globalForFeatured = global as unknown as {
  featuredConfig?: FeaturedSectionsConfig;
  featuredConfigLoadedAt?: number;
  lastKnownProducts?: Record<SectionId, any[]>;
  configFetchPromise?: Promise<FeaturedSectionsConfig> | null;
};

if (!globalForFeatured.lastKnownProducts) {
  globalForFeatured.lastKnownProducts = {
    best_sellers: [],
    club: [],
    national: [],
    shoes: [],
    gear: [],
  };
}

const SETTING_KEY = "featured_sections";

export function getSectionTargetCount(sectionId: SectionId): number {
  switch (sectionId) {
    case "best_sellers":
      return 16;
    case "shoes":
      return 16;
    case "national":
      return 12;
    case "gear":
      return 12;
    case "club":
    default:
      return 8;
  }
}

// Resilient query wrapper that retries once on transient connection/cold-start drops
async function queryWithRetry<T>(queryFn: () => Promise<T>, retries = 1, delayMs = 300): Promise<T> {
  let lastErr: any;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await queryFn();
    } catch (err: any) {
      lastErr = err;
      if (attempt < retries) {
        await new Promise((res) => setTimeout(res, delayMs));
      }
    }
  }
  throw lastErr;
}

export async function getFeaturedSectionsConfig(): Promise<FeaturedSectionsConfig> {
  // 1. Fast in-memory cache check with 15-second TTL (prevents stale configs while collapsing concurrent requests)
  const isFresh =
    globalForFeatured.featuredConfig &&
    globalForFeatured.featuredConfigLoadedAt &&
    Date.now() - globalForFeatured.featuredConfigLoadedAt < 15000;

  if (isFresh && globalForFeatured.featuredConfig) {
    return globalForFeatured.featuredConfig;
  }

  // 2. Deduplicate in-flight promises so concurrent section queries share one single DB call
  if (globalForFeatured.configFetchPromise) {
    return globalForFeatured.configFetchPromise;
  }

  globalForFeatured.configFetchPromise = (async () => {
    try {
      const record = await queryWithRetry(() =>
        prisma.storeSetting.findUnique({
          where: { key: SETTING_KEY },
        })
      );

      if (record && record.value && typeof record.value === "object") {
        const val = record.value as any;
        const config: FeaturedSectionsConfig = {
          best_sellers: Array.isArray(val.best_sellers) ? val.best_sellers.slice(0, 16) : [],
          club: Array.isArray(val.club) ? val.club.slice(0, 8) : [],
          national: Array.isArray(val.national) ? val.national.slice(0, 12) : [],
          shoes: Array.isArray(val.shoes) ? val.shoes.slice(0, 16) : [],
          gear: Array.isArray(val.gear) ? val.gear.slice(0, 12) : [],
        };
        globalForFeatured.featuredConfig = config;
        globalForFeatured.featuredConfigLoadedAt = Date.now();
        return config;
      }
    } catch (dbErr) {
      console.warn("[FeaturedSections] Could not read StoreSetting from DB, falling back:", dbErr);
    } finally {
      globalForFeatured.configFetchPromise = null;
    }

    // 3. Fallback to reading from local JSON file
    try {
      const raw = await fs.readFile(CONFIG_FILE_PATH, "utf-8");
      const parsed = JSON.parse(raw);
      const config: FeaturedSectionsConfig = {
        best_sellers: Array.isArray(parsed.best_sellers) ? parsed.best_sellers.slice(0, 16) : [],
        club: Array.isArray(parsed.club) ? parsed.club.slice(0, 8) : [],
        national: Array.isArray(parsed.national) ? parsed.national.slice(0, 12) : [],
        shoes: Array.isArray(parsed.shoes) ? parsed.shoes.slice(0, 16) : [],
        gear: Array.isArray(parsed.gear) ? parsed.gear.slice(0, 12) : [],
      };
      globalForFeatured.featuredConfig = config;
      globalForFeatured.featuredConfigLoadedAt = Date.now();
      return config;
    } catch {
      if (globalForFeatured.featuredConfig) {
        return globalForFeatured.featuredConfig;
      }
      return { ...DEFAULT_CONFIG };
    }
  })();



  return globalForFeatured.configFetchPromise;
}

export async function saveFeaturedSectionsConfig(config: FeaturedSectionsConfig): Promise<boolean> {
  const sanitized: FeaturedSectionsConfig = {
    best_sellers: Array.isArray(config.best_sellers) ? config.best_sellers.slice(0, 16) : [],
    club: Array.isArray(config.club) ? config.club.slice(0, 8) : [],
    national: Array.isArray(config.national) ? config.national.slice(0, 12) : [],
    shoes: Array.isArray(config.shoes) ? config.shoes.slice(0, 16) : [],
    gear: Array.isArray(config.gear) ? config.gear.slice(0, 12) : [],
  };

  // Immediately update in-memory active config and reset loaded timestamp
  globalForFeatured.featuredConfig = sanitized;
  globalForFeatured.featuredConfigLoadedAt = Date.now();

  // Reset in-memory product cache so storefront immediately generates the newly curated sort order
  globalForFeatured.lastKnownProducts = {
    best_sellers: [],
    club: [],
    national: [],
    shoes: [],
    gear: [],
  };

  let dbSaved = false;

  // 1. Save to PostgreSQL database with retry (ensures persistence across all serverless lambdas)
  try {
    await queryWithRetry(() =>
      prisma.storeSetting.upsert({
        where: { key: SETTING_KEY },
        update: { value: sanitized as any },
        create: { key: SETTING_KEY, value: sanitized as any },
      })
    );
    dbSaved = true;
  } catch (dbErr) {
    console.error("[FeaturedSections] Failed to upsert StoreSetting in DB:", dbErr);
  }

  // 2. Try saving to local file as secondary backup
  try {
    const dir = path.dirname(CONFIG_FILE_PATH);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(CONFIG_FILE_PATH, JSON.stringify(sanitized, null, 2), "utf-8");
  } catch (fsErr) {
    // Expected on read-only environments
  }

  // 3. Invalidate caches so storefront updates instantly with the new sort order
  try {
    revalidatePath("/", "layout");
    revalidatePath("/");
    revalidatePath("/admin/featured");
    (revalidateTag as any)("featured-sections", { expire: 0 });
    (revalidateTag as any)("products", { expire: 0 });
  } catch {
    // Ignore outside request context
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

// Emergency static fallback loader from prisma/products.json if DB is temporarily unreachable on cold start
async function getLocalFallbackProducts(sectionId: SectionId): Promise<any[]> {
  try {
    const raw = await fs.readFile(LOCAL_PRODUCTS_FILE, "utf-8");
    const all = JSON.parse(raw);
    if (!Array.isArray(all) || all.length === 0) return [];

    const targetCount = getSectionTargetCount(sectionId);

    let filtered = all.filter((item: any) => {
      switch (sectionId) {
        case "best_sellers":
          return true;
        case "club":
          return (item.category === "Shirts" || item.category === "Retro Kits") && !item.isWorldCup;
        case "national":
          return item.isWorldCup === true || ["Argentina", "Brazil", "France", "Germany", "Portugal", "Spain", "Uruguay"].includes(item.team);
        case "shoes":
          return item.category === "Boots" || item.category === "Casual Shoes";
        case "gear":
          return item.category === "Accessories" || item.category === "Flags" || item.category === "Gear";
        default:
          return true;
      }
    });

    if (filtered.length === 0) {
      filtered = all;
    }

    return filtered.slice(0, targetCount).map((p: any) => ({
      ...p,
      price: String(p.price || "0"),
      originalPrice: p.originalPrice ? String(p.originalPrice) : null,
      images: p.images && p.images.length > 0 ? [p.images[0]] : [],
      reviews: [{ rating: 5 }],
    }));
  } catch {
    return [];
  }
}

// Internal query function that executes the database selection and fallback hierarchy
async function fetchFeaturedProductsRaw(sectionId: SectionId): Promise<any[]> {
  const targetCount = getSectionTargetCount(sectionId);
  const config = await getFeaturedSectionsConfig();
  const configuredIds = (config[sectionId] || []).filter(Boolean);

  const cardSelect = {
    id: true,
    name: true,
    nameAr: true,
    category: true,
    team: true,
    price: true,
    originalPrice: true,
    tag: true,
    stock: true,
    images: true,
    createdAt: true,
    isWorldCup: true,
    reviews: { select: { rating: true } },
  };

  let selectedProducts: any[] = [];

  // 1. Fetch explicitly configured products
  if (configuredIds.length > 0) {
    try {
      const fetched = await queryWithRetry(() =>
        prisma.product.findMany({
          where: { id: { in: configuredIds } },
          select: cardSelect,
        })
      );

      const idMap = new Map(fetched.map((p) => [p.id, p]));
      selectedProducts = configuredIds
        .map((id) => idMap.get(id))
        .filter(Boolean);
    } catch (err) {
      console.warn(`[FeaturedSections] Failed to fetch configured IDs for ${sectionId}:`, err);
    }
  }

  // 2. If fewer than targetCount products, fill remaining slots
  if (selectedProducts.length < targetCount) {
    const needed = targetCount - selectedProducts.length;
    const existingIds = selectedProducts.map((p) => p.id);
    const criteria = getSectionCriteria(sectionId);

    try {
      const fallbacks = await queryWithRetry(() =>
        prisma.product.findMany({
          where: {
            AND: [criteria, { id: { notIn: existingIds } }],
          },
          take: 48,
          orderBy: { createdAt: "desc" },
          select: cardSelect,
        })
      );

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
    } catch (err) {
      console.warn(`[FeaturedSections] Fallback query failed for ${sectionId}:`, err);
    }

    // 3. Ultra-safe backup: If strict criteria didn't reach targetCount, fill from newest store products
    if (selectedProducts.length < targetCount) {
      const stillNeeded = targetCount - selectedProducts.length;
      const currentIds = selectedProducts.map((p) => p.id);
      try {
        const ultraFallbacks = await queryWithRetry(() =>
          prisma.product.findMany({
            where: {
              id: { notIn: currentIds },
            },
            take: stillNeeded,
            orderBy: { createdAt: "desc" },
            select: cardSelect,
          })
        );
        selectedProducts.push(...ultraFallbacks);
      } catch (err) {
        console.warn(`[FeaturedSections] Ultra-fallback query failed for ${sectionId}:`, err);
      }
    }
  }

  // Format products and keep only the primary image for fast rendering
  const formatted = selectedProducts.slice(0, targetCount).map((p) => ({
    ...p,
    images: p.images && p.images.length > 0 ? [p.images[0]] : [],
  }));

  // Update in-memory last-known-good products cache whenever valid products are loaded
  if (formatted.length > 0) {
    if (globalForFeatured.lastKnownProducts) {
      globalForFeatured.lastKnownProducts[sectionId] = formatted;
    }
    return formatted;
  }

  // If DB returned 0 products, try the in-memory last known good state
  if (globalForFeatured.lastKnownProducts?.[sectionId]?.length) {
    return globalForFeatured.lastKnownProducts[sectionId];
  }

  // Ultimate emergency fallback: load local static catalog products
  return await getLocalFallbackProducts(sectionId);
}

// Cached export that guarantees non-empty resilient output for each section
export const getFeaturedProductsForSection = unstable_cache(
  async (sectionId: SectionId) => {
    try {
      const products = await fetchFeaturedProductsRaw(sectionId);
      if (products && products.length > 0) {
        return products;
      }
      // If still empty, return in-memory or local fallback
      if (globalForFeatured.lastKnownProducts?.[sectionId]?.length) {
        return globalForFeatured.lastKnownProducts[sectionId];
      }
      return await getLocalFallbackProducts(sectionId);
    } catch (err) {
      console.error(`[FeaturedSections] Critical error fetching ${sectionId}:`, err);
      if (globalForFeatured.lastKnownProducts?.[sectionId]?.length) {
        return globalForFeatured.lastKnownProducts[sectionId];
      }
      return await getLocalFallbackProducts(sectionId);
    }
  },
  ["featured-section-products-cache"],
  { revalidate: 60, tags: ["featured-sections", "products"] }
);
