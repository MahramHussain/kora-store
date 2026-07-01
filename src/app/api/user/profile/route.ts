import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { firstName, lastName, selectedAvatar, customProfilePic, imageUrl, gender, phone, location } = body;

    const dbUser = await prisma.user.findUnique({ where: { id: userId } });
    if (dbUser) {
      const isBanned = dbUser.isBanned || (dbUser.bannedUntil && new Date() < new Date(dbUser.bannedUntil));
      const isShadowBanned = dbUser.isShadowBanned && (!dbUser.shadowBanExpiresAt || new Date() < new Date(dbUser.shadowBanExpiresAt));
      if (isBanned || isShadowBanned) {
        return new NextResponse("Forbidden: Your account is restricted. Profile updates blocked.", { status: 403 });
      }
    }

    const clerkUser = await currentUser();
    const email = clerkUser?.emailAddresses[0]?.emailAddress || "";

    const user = await prisma.user.upsert({
      where: { id: userId },
      update: {
        firstName: firstName !== undefined ? firstName : (clerkUser?.firstName || undefined),
        lastName: lastName !== undefined ? lastName : (clerkUser?.lastName || undefined),
        selectedAvatar: selectedAvatar !== undefined ? selectedAvatar : undefined,
        customProfilePic: customProfilePic !== undefined ? customProfilePic : undefined,
        imageUrl: imageUrl !== undefined ? imageUrl : (clerkUser?.imageUrl || undefined),
        gender: gender !== undefined ? gender : undefined,
        phone: phone !== undefined ? phone : undefined,
        location: location !== undefined ? location : undefined,
      },
      create: {
        id: userId,
        email: email,
        firstName: firstName || clerkUser?.firstName || "",
        lastName: lastName || clerkUser?.lastName || "",
        selectedAvatar: selectedAvatar || null,
        customProfilePic: customProfilePic || null,
        imageUrl: imageUrl || clerkUser?.imageUrl || null,
        gender: gender || null,
        phone: phone || null,
        location: location || null,
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error("[USER_PROFILE_POST_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(null);
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error("[USER_PROFILE_GET_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
