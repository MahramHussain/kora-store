import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";
import { resolveImageFilename } from "@/lib/resolveImage";

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
    const { name, category, team, price, description, tag, images, sizes } = body;

    // 3. Resolve images recursively in the public directory on the server
    const resolvedImages = (Array.isArray(images) ? images : [])
      .map((img: string) => resolveImageFilename(img))
      .filter(Boolean);

    // 4. Safely create the product
    const newProduct = await prisma.product.create({
      data: {
        name,
        category,
        team: team || null,
        price: parseFloat(price),
        description,
        tag: tag || null,
        images: resolvedImages,
        sizes
      }
    });

    return NextResponse.json({ success: true, product: newProduct });
    
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ success: false, error: "Failed to add gear to Vault" }, { status: 500 });
  }
}