import fs from "fs";
import path from "path";

// Helper to recursively walk a directory and search for a file matching the given name (case-insensitive)
// Helper to recursively walk a directory and search for a file matching the given name
function findImageRecursively(dir: string, filename: string): string | null {
  if (!fs.existsSync(dir)) return null;
  
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  // First pass: look for exact match or exact match without extension in current directory
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isFile()) {
      const entryLower = entry.name.toLowerCase();
      const fileLower = filename.toLowerCase();
      
      // Exact match (e.g., "image.jpg" === "image.jpg")
      if (entryLower === fileLower) {
        return fullPath;
      }
      
      // Extensionless match (e.g., "image" === "image")
      const entryNameOnly = path.parse(entry.name).name.toLowerCase();
      const fileNameOnly = path.parse(filename).name.toLowerCase();
      if (entryNameOnly === fileLower || entryNameOnly === fileNameOnly) {
        return fullPath;
      }
    }
  }

  // Second pass: look for prefix matches in current directory (e.g., "254027e0-ec57-4c79-8e" starts-with match)
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isFile()) {
      const entryLower = entry.name.toLowerCase();
      const fileLower = filename.toLowerCase();
      
      if (entryLower.startsWith(fileLower) || path.parse(entry.name).name.toLowerCase().startsWith(fileLower)) {
        return fullPath;
      }
    }
  }

  // Third pass: recurse into subdirectories
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory()) {
      const found = findImageRecursively(fullPath, filename);
      if (found) return found;
    }
  }
  
  return null;
}

// Main utility to resolve an image filename into a public relative URL
export function resolveImageFilename(filename: string): string {
  let trimmed = filename.trim();
  if (!trimmed) return "";
  
  // If it's an external URL (http/https), return it as-is
  if (trimmed.startsWith("http")) {
    return trimmed;
  }

  const publicDir = path.join(process.cwd(), "public");

  // If it's a local absolute path, check if it exists on disk first
  if (trimmed.startsWith("/")) {
    const fullPathAsIs = path.join(publicDir, trimmed);
    if (fs.existsSync(fullPathAsIs) && fs.statSync(fullPathAsIs).isFile()) {
      return trimmed;
    }
    // If it doesn't exist on disk, strip the prefix directories to search recursively
    trimmed = path.basename(trimmed);
  }

  // 1. Check in public/assets recursively
  const assetsDir = path.join(publicDir, "assets");
  const foundInAssets = findImageRecursively(assetsDir, trimmed);
  if (foundInAssets) {
    const relativePath = path.relative(publicDir, foundInAssets);
    return "/" + relativePath.replace(/\\/g, "/");
  }

  // 2. Check in public/uploads/products recursively
  const uploadsDir = path.join(publicDir, "uploads", "products");
  const foundInUploads = findImageRecursively(uploadsDir, trimmed);
  if (foundInUploads) {
    const relativePath = path.relative(publicDir, foundInUploads);
    return "/" + relativePath.replace(/\\/g, "/");
  }

  // 3. Fallback: If it was a path input, preserve it, otherwise map to default uploads path
  return filename.startsWith("/") ? filename : `/uploads/products/${filename}`;
}
