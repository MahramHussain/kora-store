import { auth, currentUser } from "@clerk/nextjs/server";
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

    const clerkUser = await currentUser();
    const email = clerkUser?.emailAddresses[0]?.emailAddress || "";

    const dbUser = await prisma.user.upsert({
      where: { id: userId },
      update: {
        firstName: clerkUser?.firstName || "",
        lastName: clerkUser?.lastName || "",
        imageUrl: clerkUser?.imageUrl || "",
      },
      create: {
        id: userId,
        email: email,
        firstName: clerkUser?.firstName || "",
        lastName: clerkUser?.lastName || "",
        imageUrl: clerkUser?.imageUrl || "",
      },
    });

    // Check if banned or shadow-banned
    const isBanned = dbUser.isBanned || (dbUser.bannedUntil && new Date() < new Date(dbUser.bannedUntil));
    const isShadowBanned = dbUser.isShadowBanned && (!dbUser.shadowBanExpiresAt || new Date() < new Date(dbUser.shadowBanExpiresAt));
    if (isBanned || isShadowBanned) {
      return new NextResponse("Forbidden: Your account is restricted", { status: 403 });
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

export async function PUT(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const dbUser = await prisma.user.findUnique({ where: { id: userId } });
    if (dbUser) {
      const isBanned = dbUser.isBanned || (dbUser.bannedUntil && new Date() < new Date(dbUser.bannedUntil));
      const isShadowBanned = dbUser.isShadowBanned && (!dbUser.shadowBanExpiresAt || new Date() < new Date(dbUser.shadowBanExpiresAt));
      if (isBanned || isShadowBanned) {
        return new NextResponse("Forbidden: Your account is restricted", { status: 403 });
      }
    }

    let isAdmin = false;
    if (process.env.NODE_ENV === "development") {
      isAdmin = true;
    } else {
      const clerkUser = await currentUser();
      const email = clerkUser?.emailAddresses[0]?.emailAddress?.toLowerCase();
      isAdmin = email === "mahramh40@gmail.com" || email === "korastore.ae@gmail.com";
    }

    const body = await req.json();
    const { reviewId, action, comment, rating, replyText } = body;

    if (!reviewId) {
      return new NextResponse("Missing reviewId", { status: 400 });
    }

    const review = await prisma.review.findUnique({
      where: { id: reviewId },
    });

    if (!review) {
      return new NextResponse("Review not found", { status: 404 });
    }

    if (action === "reply") {
      if (!isAdmin) {
        return new NextResponse("Forbidden", { status: 403 });
      }

      const updated = await prisma.review.update({
        where: { id: reviewId },
        data: {
          adminReply: replyText || null,
          adminReplyAt: replyText ? new Date() : null,
        },
      });
      return NextResponse.json(updated);
    } else if (action === "edit") {
      if (review.userId !== userId) {
        return new NextResponse("Forbidden", { status: 403 });
      }

      const updated = await prisma.review.update({
        where: { id: reviewId },
        data: {
          comment: comment || review.comment,
          rating: rating !== undefined ? rating : review.rating,
          edited: true,
        },
      });
      return NextResponse.json(updated);
    }

    return new NextResponse("Invalid action", { status: 400 });
  } catch (error) {
    console.error("[REVIEW_PUT_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    let isAdmin = false;
    if (process.env.NODE_ENV === "development") {
      isAdmin = true;
    } else {
      const clerkUser = await currentUser();
      const email = clerkUser?.emailAddresses[0]?.emailAddress?.toLowerCase();
      isAdmin = email === "mahramh40@gmail.com" || email === "korastore.ae@gmail.com";
    }

    if (!isAdmin) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const reviewId = searchParams.get("reviewId");

    if (!reviewId) {
      return new NextResponse("Missing reviewId", { status: 400 });
    }

    await prisma.review.delete({
      where: { id: reviewId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[REVIEW_DELETE_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}