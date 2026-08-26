"use client";

/**
 * Compresses and converts any image (PNG, JPG, HEIC, WebP) to a lightweight WebP (or JPEG fallback)
 * preserving transparency while drastically shrinking large multi-megabyte files (e.g. 5MB PNG -> 250KB WebP)
 * to prevent hitting serverless 4.5MB payload limits.
 */
export async function prepareImageForUpload(file: File): Promise<File> {
  if (typeof window === "undefined" || file.type === "image/svg+xml") {
    return file;
  }

  return new Promise((resolve) => {
    const img = new Image();
    const reader = new FileReader();

    reader.onload = (e) => {
      img.onload = () => {
        const MAX_DIMENSION = 1600;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_DIMENSION) {
            height = Math.round((height * MAX_DIMENSION) / width);
            width = MAX_DIMENSION;
          }
        } else {
          if (height > MAX_DIMENSION) {
            width = Math.round((width * MAX_DIMENSION) / height);
            height = MAX_DIMENSION;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");

        if (!ctx) {
          return resolve(file);
        }

        ctx.drawImage(img, 0, 0, width, height);

        // Convert to WebP (preserves alpha channel while compressing by ~90%)
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const cleanBaseName = file.name.replace(/\.[^.]+$/, "");
              const compressedFile = new File([blob], `${cleanBaseName}.webp`, {
                type: "image/webp"
              });
              resolve(compressedFile);
            } else {
              // Fallback to JPEG if WebP is unsupported
              canvas.toBlob(
                (jpegBlob) => {
                  if (jpegBlob) {
                    const cleanBaseName = file.name.replace(/\.[^.]+$/, "");
                    const jpegFile = new File([jpegBlob], `${cleanBaseName}.jpg`, {
                      type: "image/jpeg"
                    });
                    resolve(jpegFile);
                  } else {
                    resolve(file);
                  }
                },
                "image/jpeg",
                0.85
              );
            }
          },
          "image/webp",
          0.85
        );
      };

      img.onerror = () => resolve(file);
      img.src = e.target?.result as string;
    };

    reader.onerror = () => resolve(file);
    reader.readAsDataURL(file);
  });
}
