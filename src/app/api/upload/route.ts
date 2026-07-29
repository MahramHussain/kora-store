import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import fs from "fs";
import path from "path";
import sharp from "sharp";

export async function POST(req: Request) {
  try {
    // 1. Verify user is the admin (case-insensitive check)
    let isAuthorized = false;
    if (process.env.NODE_ENV === "development") {
      isAuthorized = true;
    } else {
      const user = await currentUser();
      const email = user?.emailAddresses[0]?.emailAddress?.toLowerCase();
      if (email && (email === "mahramh40@gmail.com" || email === "korastore.ae@gmail.com")) {
        isAuthorized = true;
      }
    }
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

    // 3. Resolve sharp function correctly to handle ESM/CJS default export wrapping
    const sharpFunc = typeof sharp === "function" ? sharp : (sharp as any).default;
    if (typeof sharpFunc !== "function") {
      throw new Error("Failed to load sharp builder function: sharp is not a function.");
    }

    // 4. Process image with sharp (auto-orient EXIF metadata for 4:3 camera photos & convert to WebP)
    const arrayBuffer = await file.arrayBuffer();
    const rawBuffer = Buffer.from(arrayBuffer);
    let optimizedBuffer: Buffer;

    try {
      optimizedBuffer = await sharpFunc(rawBuffer)
        .rotate() // Auto-orient photo using EXIF orientation tags (critical for 4:3 / camera shots)
        .resize({
          width: 1000,
          height: 1000,
          fit: "inside",
          withoutEnlargement: true
        })
        .webp({ quality: 80 })
        .toBuffer();
    } catch (sharpErr: any) {
      console.warn("Sharp image processing skipped, preserving original raw buffer for 4:3 file:", sharpErr?.message || sharpErr);
      optimizedBuffer = rawBuffer;
    }

    // 5. Generate unique filename to avoid overwrites (forcing webp extension)
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const originalExtension = path.extname(file.name) || ".png";
    const baseName = path.basename(file.name, originalExtension).replace(/[^a-zA-Z0-9]/g, "_");
    const uniqueFilename = `${baseName}-${uniqueSuffix}.webp`;

    // 6. Try to write optimized file to disk (works on writeable filesystems like localhost)
    let imageUrl = "";
    try {
      const uploadDir = path.join(process.cwd(), "public", "uploads", "products");
      await fs.promises.mkdir(uploadDir, { recursive: true });

      const filePath = path.join(uploadDir, uniqueFilename);
      await fs.promises.writeFile(filePath, optimizedBuffer);
      imageUrl = `/uploads/products/${uniqueFilename}`;
    } catch (fsError: any) {
      console.warn("Local upload filesystem write failed (likely read-only on Vercel). Falling back to Base64 storage:", fsError.message || fsError);
      
      // Fallback: Convert optimized WebP image directly to Base64 data URL
      imageUrl = `data:image/webp;base64,${optimizedBuffer.toString("base64")}`;
    }

    // 8. Return URL (either local path or Base64 data URL)
    return NextResponse.json({ success: true, url: imageUrl, filename: uniqueFilename });

  } catch (error: any) {
    console.error("Upload API Error:", error);
    return NextResponse.json({ success: false, error: `Failed to upload image: ${error.message || error}` }, { status: 500 });
  }
}

