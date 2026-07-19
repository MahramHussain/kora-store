import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import fs from "fs";
import path from "path";
import sharp from "sharp";

export async function POST(req: Request) {
  try {
    // 1. Verify user is the admin (case-insensitive check)
    const user = await currentUser();
    const email = user?.emailAddresses[0]?.emailAddress?.toLowerCase();
    if (!email || (email !== "mahramh40@gmail.com" && email !== "korastore.ae@gmail.com")) {
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

    // 4. Process image with sharp (resize and convert to WebP)
    const arrayBuffer = await file.arrayBuffer();
    const optimizedBuffer = await sharpFunc(Buffer.from(arrayBuffer))
      .resize({ width: 1200, height: 1200, fit: "inside", withoutEnlargement: true })
      .webp({ quality: 80 })
      .toBuffer();

    // 5. Generate unique filename to avoid overwrites (forcing webp extension)
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const originalExtension = path.extname(file.name) || ".png";
    const baseName = path.basename(file.name, originalExtension).replace(/[^a-zA-Z0-9]/g, "_");
    const uniqueFilename = `${baseName}-${uniqueSuffix}.webp`;

    // 6. Ensure upload directory exists
    const uploadDir = path.join(process.cwd(), "public", "uploads", "products");
    await fs.promises.mkdir(uploadDir, { recursive: true });

    // 7. Write optimized file to disk
    const filePath = path.join(uploadDir, uniqueFilename);
    await fs.promises.writeFile(filePath, optimizedBuffer);

    // 8. Return URL
    const relativeUrl = `/uploads/products/${uniqueFilename}`;
    return NextResponse.json({ success: true, url: relativeUrl, filename: uniqueFilename });

  } catch (error: any) {
    console.error("Upload API Error:", error);
    return NextResponse.json({ success: false, error: `Failed to upload image: ${error.message || error}` }, { status: 500 });
  }
}

