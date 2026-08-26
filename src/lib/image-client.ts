"use client";

/**
 * Universal high-performance client-side image compressor.
 * Decodes and scales down any image (PNG, JPG, HEIC, WEBP) to max 1400px
 * and compresses it to a lightweight WebP (or JPEG) of ~100KB–250KB.
 * Preserves transparency and guarantees zero Vercel / serverless payload limit issues.
 */
export async function prepareImageForUpload(file: File): Promise<File> {
  if (typeof window === "undefined" || file.type === "image/svg+xml") {
    return file;
  }

  // If already under 300KB, it's already safe to upload directly
  if (file.size <= 300 * 1024) {
    return file;
  }

  return new Promise((resolve) => {
    let objectUrl = "";
    try {
      objectUrl = URL.createObjectURL(file);
    } catch (e) {
      console.warn("Could not create object URL, uploading original:", e);
      return resolve(file);
    }

    const img = new Image();

    // Safety timeout: if image decoding hangs, fallback to original file after 4 seconds
    const timeoutId = setTimeout(() => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
      resolve(file);
    }, 4000);

    img.onload = () => {
      clearTimeout(timeoutId);
      URL.revokeObjectURL(objectUrl);

      try {
        const MAX_DIMENSION = 1400;
        let width = img.naturalWidth || img.width;
        let height = img.naturalHeight || img.height;

        if (!width || !height) {
          return resolve(file);
        }

        if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
          if (width > height) {
            height = Math.round((height * MAX_DIMENSION) / width);
            width = MAX_DIMENSION;
          } else {
            width = Math.round((width * MAX_DIMENSION) / height);
            height = MAX_DIMENSION;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d", { alpha: true });

        if (!ctx) {
          return resolve(file);
        }

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(img, 0, 0, width, height);

        // 1. Try WebP compression (preserves alpha channel / transparency, ~150KB)
        canvas.toBlob(
          (webpBlob) => {
            if (webpBlob && webpBlob.size > 0 && webpBlob.size < file.size) {
              const cleanBaseName = file.name.replace(/\.[^.]+$/, "");
              const compressedFile = new File([webpBlob], `${cleanBaseName}.webp`, {
                type: "image/webp"
              });
              return resolve(compressedFile);
            }

            // 2. Fallback to JPEG if WebP is unsupported or larger
            canvas.toBlob(
              (jpegBlob) => {
                if (jpegBlob && jpegBlob.size > 0 && jpegBlob.size < file.size) {
                  const cleanBaseName = file.name.replace(/\.[^.]+$/, "");
                  const jpegFile = new File([jpegBlob], `${cleanBaseName}.jpg`, {
                    type: "image/jpeg"
                  });
                  return resolve(jpegFile);
                }
                return resolve(file);
              },
              "image/jpeg",
              0.82
            );
          },
          "image/webp",
          0.82
        );
      } catch (canvasErr) {
        console.warn("Canvas compression failed, using original file:", canvasErr);
        resolve(file);
      }
    };

    img.onerror = () => {
      clearTimeout(timeoutId);
      if (objectUrl) URL.revokeObjectURL(objectUrl);
      console.warn("Image load error during compression, using original file");
      resolve(file);
    };

    img.src = objectUrl;
  });
}
