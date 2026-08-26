import { NextResponse } from "next/server";
import { auth, currentUser, clerkClient } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import fs from "fs";
import path from "path";

async function checkIsAdmin(): Promise<boolean> {
  if (process.env.NODE_ENV === "development") {
    return true;
  }

  let emails: string[] = [];

  // Method 1: currentUser
  try {
    const user = await currentUser();
    if (user?.emailAddresses) {
      emails = user.emailAddresses.map(e => e.emailAddress?.toLowerCase()).filter(Boolean);
    }
  } catch (e) {
    console.warn("currentUser check failed in upload:", e);
  }

  // Method 2: clerkClient via auth() userId
  if (emails.length === 0) {
    try {
      const { userId } = await auth();
      if (userId) {
        const client = await clerkClient();
        const user = await client.users.getUser(userId);
        if (user?.emailAddresses) {
          emails = user.emailAddresses.map(e => e.emailAddress?.toLowerCase()).filter(Boolean);
        }
      }
    } catch (e) {
      console.warn("clerkClient check failed in upload:", e);
    }
  }

  // Method 3: Prisma DB lookup via auth() userId
  if (emails.length === 0) {
    try {
      const { userId } = await auth();
      if (userId) {
        const dbUser = await prisma.user.findUnique({ where: { id: userId } });
        if (dbUser?.email) {
          emails.push(dbUser.email.toLowerCase());
        }
      }
    } catch (e) {
      console.warn("prisma user check failed in upload:", e);
    }
  }

  const authorizedEmails = ["mahramh40@gmail.com", "korastore.ae@gmail.com"];
  return emails.some(email => authorizedEmails.includes(email));
}

export async function POST(req: Request) {
  try {
    // 1. Verify user is the admin
    const isAuthorized = await checkIsAdmin();
    if (!isAuthorized) {
      return NextResponse.json({ success: false, error: "Forbidden: Unauthorized access" }, { status: 403 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;
    if (!file) {
      return NextResponse.json({ success: false, error: "No file provided" }, { status: 400 });
    }

    // 2. Validate file type (image only)
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ success: false, error: "Invalid file type. Only images are allowed." }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const rawBuffer = Buffer.from(arrayBuffer);
    let optimizedBuffer: Buffer = rawBuffer;
    let outputExtension = ".webp";
    let mimeType = "image/webp";

    // 3. Process image with sharp if available, with full graceful fallback
    try {
      const sharpModule = await import("sharp");
      const sharpFunc = typeof sharpModule === "function" ? sharpModule : (sharpModule as any)?.default;
      if (typeof sharpFunc === "function") {
        optimizedBuffer = await sharpFunc(rawBuffer)
          .rotate() // Auto-orient photo using EXIF metadata
          .resize({
            width: 1200,
            height: 1200,
            fit: "inside",
            withoutEnlargement: true
          })
          .webp({ quality: 85 })
          .toBuffer();
        outputExtension = ".webp";
        mimeType = "image/webp";
      }
    } catch (sharpErr: any) {
      console.warn("Sharp image processing skipped, saving original buffer:", sharpErr?.message || sharpErr);
      optimizedBuffer = rawBuffer;
      const origExt = path.extname(file.name) || ".png";
      outputExtension = origExt.toLowerCase();
      mimeType = file.type || "image/png";
    }

    // 4. Generate unique filename to avoid overwrites
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const originalExtension = path.extname(file.name) || ".png";
    const baseName = path.basename(file.name, originalExtension).replace(/[^a-zA-Z0-9]/g, "_");
    const uniqueFilename = `${baseName}-${uniqueSuffix}${outputExtension}`;

    // 5. Try writing file to disk (localhost / persistent server)
    let imageUrl = "";
    try {
      const uploadDir = path.join(process.cwd(), "public", "uploads", "products");
      await fs.promises.mkdir(uploadDir, { recursive: true });

      const filePath = path.join(uploadDir, uniqueFilename);
      await fs.promises.writeFile(filePath, optimizedBuffer);
      imageUrl = `/uploads/products/${uniqueFilename}`;
    } catch (fsError: any) {
      console.warn("Local upload filesystem write failed (read-only environment). Falling back to Base64 data URL:", fsError.message || fsError);
      
      // Fallback: Convert image directly to Base64 data URL
      imageUrl = `data:${mimeType};base64,${optimizedBuffer.toString("base64")}`;
    }

    return NextResponse.json({ success: true, url: imageUrl, filename: uniqueFilename });

  } catch (error: any) {
    console.error("Upload API Error:", error);
    return NextResponse.json({ success: false, error: `Failed to upload image: ${error.message || error}` }, { status: 500 });
  }
}
