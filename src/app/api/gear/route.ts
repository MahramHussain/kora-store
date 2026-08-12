import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";
import { resolveImageFilename } from "@/lib/resolveImage";
import { translateToArabic } from "@/lib/translate";

export async function POST(req: Request) {
  try {
    // 1. Verify user is the admin
    let isAuthorized = false;
    if (process.env.NODE_ENV === "development") {
      isAuthorized = true;
    } else {
      const user = await currentUser();
      const emails = user?.emailAddresses?.map(e => e.emailAddress?.toLowerCase()).filter(Boolean) || [];
      if (emails.includes("mahramh40@gmail.com") || emails.includes("korastore.ae@gmail.com")) {
        isAuthorized = true;
      }
    }
    if (!isAuthorized) {
      return NextResponse.json({ success: false, error: "Forbidden: Unauthorized access" }, { status: 403 });
    }

    const body = await req.json();
    
    // 2. Grab all the data sent from your Admin Dashboard
    const { name, category, team, price, description, tag, images, sizes, sizeStocks, playerStocks, patches, isWorldCup, originalPrice, brand, gender, subCategory, soleplate, colorway } = body;

    // Run Arabic translations in parallel for maximum performance
    const [nameAr, descriptionAr] = await Promise.all([
      translateToArabic(name),
      description ? translateToArabic(description) : Promise.resolve(null)
    ]);

    // 3. Resolve images recursively in the public directory on the server
    const resolvedImages = (Array.isArray(images) ? images : [])
      .map((img: string) => resolveImageFilename(img))
      .filter(Boolean);

    const resolvedPatches = Array.isArray(patches)
      ? patches.map((p: any) => ({
          name: p.name?.trim() || "",
          image: p.image ? resolveImageFilename(p.image) : "",
          sleeve: p.sleeve || "both"
        })).filter(p => p.name)
      : null;

    // Calculate total stock as the sum of all size stocks
    const totalStock = sizeStocks && typeof sizeStocks === "object"
      ? Object.values(sizeStocks).reduce((acc: number, val: any) => acc + (parseInt(val) || 0), 0)
      : (body.stock !== undefined ? parseInt(body.stock) : 10);

    // 4. Safely create the product
    const newProduct = await prisma.product.create({
      data: {
        name,
        nameAr: nameAr || null,
        descriptionAr: descriptionAr || null,
        category,
        team: team || null,
        price: parseFloat(price) || 0,
        description,
        tag: tag || null,
        images: resolvedImages,
        sizes,
        stock: totalStock,
        isWorldCup: !!isWorldCup,
        originalPrice: originalPrice ? (parseFloat(originalPrice) || null) : null,
        brand: brand || null,
        gender: gender || null,
        subCategory: subCategory || null,
        soleplate: soleplate || null,
        colorway: colorway || null,
        patches: resolvedPatches && resolvedPatches.length > 0 ? (resolvedPatches as any) : null,
        sizeStocks: sizeStocks && typeof sizeStocks === "object" ? {
          create: Object.entries(sizeStocks).map(([size, quantity]) => ({
            size,
            quantity: parseInt(quantity as string) || 0
          }))
        } : undefined,
        playerStocks: playerStocks && Array.isArray(playerStocks) ? {
          create: playerStocks
            .filter((p: any) => p && String(p.name || "").trim())
            .map((p: any) => ({
              playerName: String(p.name || "").toUpperCase().trim(),
              playerNumber: String(p.number ?? "").trim(),
              quantity: Math.max(0, parseInt(p.stock as string) || 0)
            }))
        } : undefined
      }
    });

    return NextResponse.json({ success: true, product: newProduct });
    
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ success: false, error: "Failed to add gear to Vault" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    // 1. Verify user is the admin
    let isAuthorized = false;
    if (process.env.NODE_ENV === "development") {
      isAuthorized = true;
    } else {
      let emails: string[] = [];
      try {
        const user = await currentUser();
        if (user?.emailAddresses) {
          emails = user.emailAddresses.map(e => e.emailAddress?.toLowerCase()).filter(Boolean);
        }
      } catch (e) {}

      if (emails.includes("mahramh40@gmail.com") || emails.includes("korastore.ae@gmail.com")) {
        isAuthorized = true;
      }
    }
    if (!isAuthorized) {
      return NextResponse.json({ success: false, error: "Forbidden: Unauthorized access" }, { status: 403 });
    }

    const body = await req.json();
    const { id, name, category, team, price, description, tag, images, sizes, sizeStocks, playerStocks, patches, isWorldCup, originalPrice, brand, gender, subCategory, soleplate, colorway } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: "Product ID is required" }, { status: 400 });
    }

    // Resolve images
    const resolvedImages = (Array.isArray(images) ? images : [])
      .map((img: string) => {
        try {
          return resolveImageFilename(img);
        } catch {
          return img;
        }
      })
      .filter(Boolean);

    const resolvedPatches = Array.isArray(patches)
      ? patches
          .map((p: any) => {
            const patchName = String(p?.name || "").trim();
            let patchImg = String(p?.image || "").trim();
            if (patchImg) {
              try {
                patchImg = resolveImageFilename(patchImg);
              } catch {}
            }
            return {
              name: patchName,
              image: patchImg,
              sleeve: p?.sleeve || "both"
            };
          })
          .filter(p => p.name)
      : null;

    let totalStock = body.stock;
    if (sizeStocks && typeof sizeStocks === "object") {
      totalStock = Object.values(sizeStocks).reduce((acc: number, val: any) => acc + Math.max(0, parseInt(val as any) || 0), 0);
    }

    const cleanSizes: string[] = Array.from(new Set<string>((Array.isArray(sizes) ? sizes : []).map((s: any) => String(s).trim()).filter(Boolean)));

    const result = await prisma.$transaction(async (tx) => {
      // 1. Per-size stock
      if (sizeStocks && typeof sizeStocks === "object") {
        await tx.sizeStock.deleteMany({
          where: { productId: id }
        });

        const sizeStockEntries = Object.entries(sizeStocks)
          .filter(([size]) => size && size.trim())
          .map(([size, quantity]) => ({
            productId: id,
            size: size.trim(),
            quantity: Math.max(0, parseInt(quantity as any) || 0)
          }));

        if (sizeStockEntries.length > 0) {
          await tx.sizeStock.createMany({
            data: sizeStockEntries,
            skipDuplicates: true
          });
        }
      }

      // 2. Player stocks
      if (playerStocks && Array.isArray(playerStocks)) {
        await tx.playerStock.deleteMany({
          where: { productId: id }
        });

        const seenPlayerNames = new Set<string>();
        const playerStockEntries = [];

        for (const p of playerStocks) {
          const pName = String(p?.name || "").toUpperCase().trim();
          const pNum = String(p?.number ?? "").trim();
          const pQty = Math.max(0, parseInt(p?.stock as any) || 0);

          if (pName && !seenPlayerNames.has(pName)) {
            seenPlayerNames.add(pName);
            playerStockEntries.push({
              productId: id,
              playerName: pName,
              playerNumber: pNum,
              quantity: pQty
            });
          }
        }

        if (playerStockEntries.length > 0) {
          await tx.playerStock.createMany({
            data: playerStockEntries,
            skipDuplicates: true
          });
        }
      }

      // 3. Update the product
      const updatedProduct = await tx.product.update({
        where: { id },
        data: {
          name: String(name || "").trim(),
          price: parseFloat(String(price || "0")) || 0,
          category: category || "Shirts",
          team: team ? String(team).trim() : null,
          tag: tag ? String(tag).trim() : null,
          sizes: cleanSizes,
          description: description !== undefined ? description : undefined,
          images: resolvedImages,
          stock: totalStock !== undefined ? totalStock : undefined,
          isWorldCup: isWorldCup !== undefined ? !!isWorldCup : undefined,
          originalPrice: originalPrice !== undefined && originalPrice !== null && String(originalPrice).trim() !== "" ? (parseFloat(String(originalPrice)) || null) : null,
          brand: brand ? String(brand).trim() : null,
          gender: gender ? String(gender).trim() : null,
          subCategory: subCategory ? String(subCategory).trim() : null,
          soleplate: soleplate ? String(soleplate).trim() : null,
          colorway: colorway ? String(colorway).trim() : null,
          patches: resolvedPatches && resolvedPatches.length > 0 ? (resolvedPatches as any) : null,
        },
      });

      return updatedProduct;
    });

    return NextResponse.json({
      success: true,
      product: {
        ...result,
        price: result.price ? result.price.toString() : "0",
        originalPrice: result.originalPrice ? result.originalPrice.toString() : null
      }
    });
  } catch (error: any) {
    console.error("API Error updating gear:", error);
    return NextResponse.json({ success: false, error: error?.message || "Failed to update gear" }, { status: 500 });
  }
}