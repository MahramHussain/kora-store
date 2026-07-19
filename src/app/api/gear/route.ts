import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";
import { resolveImageFilename } from "@/lib/resolveImage";
import { translateToArabic } from "@/lib/translate";

export async function POST(req: Request) {
  try {
    // 1. Verify user is the admin
    const user = await currentUser();
    const email = user?.emailAddresses[0]?.emailAddress;
    if (!email || (email !== "mahramh40@gmail.com" && email !== "korastore.ae@gmail.com")) {
      return NextResponse.json({ success: false, error: "Forbidden: Unauthorized access" }, { status: 403 });
    }

    const body = await req.json();
    
    // 2. Grab all the data sent from your Admin Dashboard
    const { name, category, team, price, description, tag, images, sizes, sizeStocks, playerStocks, isWorldCup, originalPrice, brand, gender, subCategory, soleplate, colorway } = body;

    // Run Arabic translations in parallel for maximum performance
    const [nameAr, descriptionAr] = await Promise.all([
      translateToArabic(name),
      description ? translateToArabic(description) : Promise.resolve(null)
    ]);

    // 3. Resolve images recursively in the public directory on the server
    const resolvedImages = (Array.isArray(images) ? images : [])
      .map((img: string) => resolveImageFilename(img))
      .filter(Boolean);

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
        sizeStocks: sizeStocks && typeof sizeStocks === "object" ? {
          create: Object.entries(sizeStocks).map(([size, quantity]) => ({
            size,
            quantity: parseInt(quantity as string) || 0
          }))
        } : undefined,
        playerStocks: playerStocks && Array.isArray(playerStocks) ? {
          create: playerStocks.map((p: any) => ({
            playerName: p.name.toUpperCase().trim(),
            playerNumber: p.number.trim(),
            quantity: parseInt(p.stock as string) || 0
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