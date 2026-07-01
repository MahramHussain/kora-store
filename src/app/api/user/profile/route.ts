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
    const { firstName, lastName, selectedAvatar, customProfilePic, imageUrl } = body;

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
      },
      create: {
        id: userId,
        email: email,
        firstName: firstName || clerkUser?.firstName || "",
        lastName: lastName || clerkUser?.lastName || "",
        selectedAvatar: selectedAvatar || null,
        customProfilePic: customProfilePic || null,
        imageUrl: imageUrl || clerkUser?.imageUrl || null,
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error("[USER_PROFILE_POST_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
