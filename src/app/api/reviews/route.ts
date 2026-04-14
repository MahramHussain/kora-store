import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    // 1. Check the bouncer: Are they logged in?
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // 2. Read what they typed in the box
    const body = await req.json();
    const { productId, rating, comment } = body;

    if (!productId || !comment) {
      return new NextResponse("Missing data", { status: 400 });
    }

    // 3. Tell Prisma to save it permanently to the Vault!
    const review = await prisma.review.create({
      data: {
        userId,
        productId,
        rating: rating || 5,
        comment,
      },
    });

    return NextResponse.json(review);
  } catch (error) {
    console.error("[REVIEW_POST_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}