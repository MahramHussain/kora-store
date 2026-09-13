import fs from "fs/promises";
import path from "path";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export type SectionId = "club" | "national" | "shoes" | "gear";

export interface FeaturedSectionsConfig {
  club: string[];
  national: string[];
  shoes: string[];
  gear: string[];
}

const CONFIG_FILE_PATH = path.join(process.cwd(), "src", "data", "featured-sections.json");

const DEFAULT_CONFIG: FeaturedSectionsConfig = {
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
      club: Array.isArray(parsed.club) ? parsed.club.slice(0, 4) : [],
      national: Array.isArray(parsed.national) ? parsed.national.slice(0, 4) : [],
      shoes: Array.isArray(parsed.shoes) ? parsed.shoes.slice(0, 4) : [],
      gear: Array.isArray(parsed.gear) ? parsed.gear.slice(0, 4) : [],
    };
  } catch {
    return { ...DEFAULT_CONFIG };
  }
}

export async function saveFeaturedSectionsConfig(config: FeaturedSectionsConfig): Promise<boolean> {
  try {
    const sanitized: FeaturedSectionsConfig = {
      club: Array.isArray(config.club) ? config.club.slice(0, 4) : [],
      national: Array.isArray(config.national) ? config.national.slice(0, 4) : [],
      shoes: Array.isArray(config.shoes) ? config.shoes.slice(0, 4) : [],
      gear: Array.isArray(config.gear) ? config.gear.slice(0, 4) : [],
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

// Fetch exactly 4 products for a section (configured items first, with fallback items)
export async function getFeaturedProductsForSection(sectionId: SectionId) {
  try {
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

    // 2. If fewer than 4 products, fill remaining slots from category
    if (selectedProducts.length < 4) {
      const needed = 4 - selectedProducts.length;
      const existingIds = selectedProducts.map((p) => p.id);
      const criteria = getSectionCriteria(sectionId);

      const fallbacks = await prisma.product.findMany({
        where: {
          AND: [
            criteria,
            { id: { notIn: existingIds } }
          ]
        },
        take: 16,
        orderBy: { createdAt: "desc" },
        include: {
          reviews: { select: { rating: true } }
        }
      });

      // Sort: On Sale tag first, then newest
      fallbacks.sort((a, b) => {
        const isSaleA = a.tag === "On Sale";
        const isSaleB = b.tag === "On Sale";
        if (isSaleA !== isSaleB) return isSaleA ? -1 : 1;
        return b.createdAt.getTime() - a.createdAt.getTime();
      });

      selectedProducts.push(...fallbacks.slice(0, needed));
    }

    return selectedProducts.slice(0, 4);
  } catch (err) {
    console.error(`[FeaturedSections] Database query error for ${sectionId}:`, err);
    return [];
  }
}
