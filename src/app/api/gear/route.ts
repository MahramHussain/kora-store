import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // 1. Grab all the data sent from your Admin Dashboard
    const { name, category, team, price, description, tag, images, sizes } = body;

    // 2. Safely create the product (Notice we let Prisma handle the ID completely!)
    const newProduct = await prisma.product.create({
      data: {
        name,
        category,
        team,
        price: parseFloat(price), // Converts the text price to a real number
        description,
        tag,
        images,
        sizes
      }
    });

    return NextResponse.json({ success: true, product: newProduct });
    
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ success: false, error: "Failed to add gear to Vault" }, { status: 500 });
  }
}