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

    // 2. Validate file type (flexible check by mime type or image file extension)
    const fileName = file.name || "image.png";
    const isImageMime = file.type && (file.type.startsWith("image/") || file.type === "application/octet-stream");
    const isImageExt = /\.(png|jpe?g|webp|gif|svg|avif|heic|bmp)$/i.test(fileName);

    if (!isImageMime && !isImageExt) {
      return NextResponse.json({ success: false, error: "Invalid file type. Only images (PNG, JPG, WEBP, etc.) are allowed." }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const rawBuffer = Buffer.from(arrayBuffer);
    let optimizedBuffer: Buffer = rawBuffer;
    let outputExtension = ".webp";
    let mimeType = "image/webp";

    // 3. Process image with sharp (handles PNG, JPG, and converts to compact WebP)
    try {
      const sharpModule = await import("sharp");
      const sharpFunc = typeof sharpModule === "function" ? sharpModule : (sharpModule as any)?.default;
      if (typeof sharpFunc === "function") {
        let pipeline = sharpFunc(rawBuffer);
        
        try {
          pipeline = pipeline.rotate();
        } catch (_) {
          // Ignore rotate error for image types without EXIF
        }

        optimizedBuffer = await pipeline
          .resize({
            width: 1400,
            height: 1400,
            fit: "inside",
            withoutEnlargement: true
          })
          .toFormat("webp", { quality: 85, effort: 4 })
          .toBuffer();

        outputExtension = ".webp";
        mimeType = "image/webp";
      }
    } catch (sharpErr: any) {
      console.warn("Sharp image processing skipped, saving original buffer:", sharpErr?.message || sharpErr);
      optimizedBuffer = rawBuffer;
      const origExt = path.extname(fileName) || ".png";
      outputExtension = origExt.toLowerCase();
      mimeType = file.type || "image/png";
    }

    // 4. Generate unique filename to avoid overwrites
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const originalExtension = path.extname(fileName) || ".png";
    const baseName = path.basename(fileName, originalExtension).replace(/[^a-zA-Z0-9]/g, "_");
    const uniqueFilename = `${baseName}-${uniqueSuffix}${outputExtension}`;

    // 5. Try writing file to disk (localhost / persistent filesystem)
    let imageUrl = "";
    try {
      const uploadDir = path.join(process.cwd(), "public", "uploads", "products");
      await fs.promises.mkdir(uploadDir, { recursive: true });

      const filePath = path.join(uploadDir, uniqueFilename);
      await fs.promises.writeFile(filePath, optimizedBuffer);
      imageUrl = `/uploads/products/${uniqueFilename}`;
    } catch (fsError: any) {
      console.warn("Local upload filesystem write failed (read-only environment). Falling back to Base64 data URL:", fsError.message || fsError);
      
      // Fallback: Convert optimized image to Base64 data URL
      imageUrl = `data:${mimeType};base64,${optimizedBuffer.toString("base64")}`;
    }

    return NextResponse.json({ success: true, url: imageUrl, filename: uniqueFilename });

  } catch (error: any) {
    console.error("Upload API Error:", error);
    return NextResponse.json({ success: false, error: `Failed to upload image: ${error.message || error}` }, { status: 500 });
  }
}
