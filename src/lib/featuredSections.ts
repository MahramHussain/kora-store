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

export async function getFeaturedSectionsConfig(): Promise<FeaturedSectionsConfig> {
  try {
    const raw = await fs.readFile(CONFIG_FILE_PATH, "utf-8");
    const parsed = JSON.parse(raw);
    return {
      best_sellers: Array.isArray(parsed.best_sellers) ? parsed.best_sellers.slice(0, 12) : [],
      club: Array.isArray(parsed.club) ? parsed.club.slice(0, 6) : [],
      national: Array.isArray(parsed.national) ? parsed.national.slice(0, 6) : [],
      shoes: Array.isArray(parsed.shoes) ? parsed.shoes.slice(0, 6) : [],
      gear: Array.isArray(parsed.gear) ? parsed.gear.slice(0, 6) : [],
    };
  } catch {
    return { ...DEFAULT_CONFIG };
  }
}

export async function saveFeaturedSectionsConfig(config: FeaturedSectionsConfig): Promise<boolean> {
  try {
    const sanitized: FeaturedSectionsConfig = {
      best_sellers: Array.isArray(config.best_sellers) ? config.best_sellers.slice(0, 12) : [],
      club: Array.isArray(config.club) ? config.club.slice(0, 6) : [],
      national: Array.isArray(config.national) ? config.national.slice(0, 6) : [],
      shoes: Array.isArray(config.shoes) ? config.shoes.slice(0, 6) : [],
      gear: Array.isArray(config.gear) ? config.gear.slice(0, 6) : [],
    };

    const dir = path.dirname(CONFIG_FILE_PATH);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(CONFIG_FILE_PATH, JSON.stringify(sanitized, null, 2), "utf-8");
    
    // Revalidate home page cache so new selections appear immediately
    revalidatePath("/");
    return true;
  } catch (err) {
    console.error("Failed to save featured sections config:", err);
    return false;
  }
}

// Criteria for category queries
export function getSectionCriteria(sectionId: SectionId) {
  switch (sectionId) {
    case "best_sellers":
      // Any category
      return {};
    case "club":
      return {
        OR: [
          { subCategory: "Club" },
          { category: { in: ["Shirts", "Retro Kits"] }, isWorldCup: false }
        ]
      };
    case "national":
      return {
        isWorldCup: true
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

// Fetch products for a section (12 for best_sellers, 6 for category sections)
export async function getFeaturedProductsForSection(sectionId: SectionId) {
  try {
    const targetCount = sectionId === "best_sellers" ? 12 : 6;
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
    }

    return selectedProducts.slice(0, targetCount);
  } catch (err) {
    console.error(`[FeaturedSections] Database query error for ${sectionId}:`, err);
    return [];
  }
}
