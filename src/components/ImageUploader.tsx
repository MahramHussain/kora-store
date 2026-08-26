"use client";

import { useState, useRef } from "react";
import { FiUploadCloud, FiTrash2, FiLoader, FiPlus, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { prepareImageForUpload } from "@/lib/image-client";

interface ImageUploaderProps {
  images: string[];
  onChange: (images: string[]) => void;
}

export default function ImageUploader({ images, onChange }: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState<{ id: string; name: string }[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", index.toString());
  };

  const handleDragOverItem = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const reorderedImages = [...images];
    const draggedItem = reorderedImages[draggedIndex];
    reorderedImages.splice(draggedIndex, 1);
    reorderedImages.splice(index, 0, draggedItem);

    setDraggedIndex(index);
    onChange(reorderedImages);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const handleDropItem = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDraggedIndex(null);
  };

  const handleMoveImage = (index: number, direction: "left" | "right") => {
    if (direction === "left" && index > 0) {
      const updated = [...images];
      const temp = updated[index];
      updated[index] = updated[index - 1];
      updated[index - 1] = temp;
      onChange(updated);
    } else if (direction === "right" && index < images.length - 1) {
      const updated = [...images];
      const temp = updated[index];
      updated[index] = updated[index + 1];
      updated[index + 1] = temp;
      onChange(updated);
    }
  };

  const handleFiles = async (files: FileList) => {
    // Support file detection by MIME type OR file extension for PNG, JPG, WEBP, etc.
    const imageExtensionRegex = /\.(png|jpe?g|webp|gif|svg|avif|heic|bmp)$/i;
    const validFiles = Array.from(files).filter(
      file => (file.type && file.type.startsWith("image/")) || imageExtensionRegex.test(file.name)
    );

    if (validFiles.length === 0) return;

    // Add files to uploading state
    const newUploading = validFiles.map(file => ({
      id: Math.random().toString(36).substring(2, 9),
      name: file.name
    }));
    setUploadingFiles(prev => [...prev, ...newUploading]);

    let currentImages = [...images];

    for (let i = 0; i < validFiles.length; i++) {
      const originalFile = validFiles[i];
      const targetUploadingId = newUploading[i].id;
      
      try {
        // Compress PNG / large image to lightweight WebP client-side
        const fileToUpload = await prepareImageForUpload(originalFile);
        const formData = new FormData();
        formData.append("file", fileToUpload, fileToUpload.name);

        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        const data = await res.json().catch(() => null);

        if (res.ok && data?.success && data?.url) {
          currentImages = [...currentImages, data.url];
          onChange(currentImages);
        } else {
          const errorMsg = data?.error || `Upload failed (${res.status}): ${res.statusText}`;
          console.error("Upload error:", errorMsg);
          alert(`Failed to upload ${originalFile.name}: ${errorMsg}`);
        }
      } catch (err: any) {
        console.error("Error uploading file:", err);
        alert(`Failed to upload ${originalFile.name}: ${err?.message || "Network error"}`);
      } finally {
        // Remove from uploading state
        setUploadingFiles(prev => prev.filter(f => f.id !== targetUploadingId));
      }
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files);
    }
  };

  const handleRemoveImage = (indexToRemove: number) => {
    const updatedImages = images.filter((_, idx) => idx !== indexToRemove);
    onChange(updatedImages);
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  // Helper to resolve local image display paths
  const getDisplayUrl = (url: string) => {
    if (!url) return "";
    if (url.startsWith("http") || url.startsWith("/") || url.startsWith("data:")) {
      return url;
    }
    return `/uploads/products/${url}`;
  };

  return (
    <div className="space-y-4">
      {/* Upload/Drag Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={triggerFileSelect}
        className={`w-full min-h-[160px] border-2 border-dashed rounded-2xl flex flex-col items-center justify-center p-6 cursor-pointer select-none transition-all ${
          isDragging
            ? "border-kora bg-kora/5 scale-[0.99]"
            : "border-slate-200 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-300"
        }`}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          multiple
          accept="image/*,.png,.jpg,.jpeg,.webp,.gif"
          className="hidden"
        />
        
        <div className="w-12 h-12 rounded-full bg-white border border-slate-100 flex items-center justify-center text-slate-400 shadow-sm mb-3 group-hover:text-kora transition-colors">
          <FiUploadCloud className="text-xl" />
        </div>

        <p className="text-xs font-bold text-slate-800 text-center uppercase tracking-wider">
          Drag &amp; drop images here, or <span className="text-kora hover:underline">browse</span>
        </p>
        <p className="text-[10px] text-slate-400 mt-1 text-center font-medium">
          Supports PNG, JPG, WEBP, and GIF
        </p>
      </div>

      {/* Grid of uploaded images & loading states */}
      {(images.length > 0 || uploadingFiles.length > 0) && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {/* Render uploaded images */}
          {images.map((img, idx) => (
            <div
              key={idx}
              draggable
              onDragStart={(e) => handleDragStart(e, idx)}
              onDragOver={(e) => handleDragOverItem(e, idx)}
              onDragEnd={handleDragEnd}
              onDrop={(e) => handleDropItem(e, idx)}
              className={`relative aspect-square rounded-xl overflow-hidden border border-slate-200/60 bg-slate-50 group shadow-2xs hover:shadow-sm hover:border-slate-300 transition-all cursor-grab active:cursor-grabbing ${
                draggedIndex === idx ? "opacity-40 border-kora border-2 scale-95" : ""
              }`}
            >
              <img
                src={getDisplayUrl(img)}
                alt={`Uploaded ${idx + 1}`}
                className="w-full h-full object-cover select-none pointer-events-none"
                referrerPolicy="no-referrer"
              />
              
              {/* Order index badge */}
              <div className="absolute top-2 left-2 bg-slate-950/75 backdrop-blur-xs text-white font-sans font-black text-[9px] px-2 py-0.5 rounded-lg select-none uppercase tracking-wider shadow-sm z-10 border border-white/5">
                {idx === 0 ? "Main" : idx + 1}
              </div>

              {/* Responsive Overlay Controls */}
              <div className="absolute bottom-0 left-0 right-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-around py-2 px-3 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-200 z-10 border-t border-white/5">
                {/* Move Left */}
                <button
                  type="button"
                  disabled={idx === 0}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleMoveImage(idx, "left");
                  }}
                  className={`w-7 h-7 rounded-lg flex items-center justify-center text-white bg-white/10 hover:bg-white/20 transition-all ${
                    idx === 0 ? "opacity-30 cursor-not-allowed" : "active:scale-95 cursor-pointer"
                  }`}
                  title="Move Left"
                >
                  <FiChevronLeft className="text-sm font-bold" />
                </button>

                {/* Remove */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveImage(idx);
                  }}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-rose-400 bg-white/10 hover:bg-rose-500/20 active:scale-95 transition-all cursor-pointer"
                  title="Remove Image"
                >
                  <FiTrash2 className="text-sm" />
                </button>

                {/* Move Right */}
                <button
                  type="button"
                  disabled={idx === images.length - 1}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleMoveImage(idx, "right");
                  }}
                  className={`w-7 h-7 rounded-lg flex items-center justify-center text-white bg-white/10 hover:bg-white/20 transition-all ${
                    idx === images.length - 1 ? "opacity-30 cursor-not-allowed" : "active:scale-95 cursor-pointer"
                  }`}
                  title="Move Right"
                >
                  <FiChevronRight className="text-sm font-bold" />
                </button>
              </div>
            </div>
          ))}

          {/* Render loading placeholders */}
          {uploadingFiles.map((file) => (
            <div
              key={file.id}
              className="relative aspect-square rounded-xl overflow-hidden border border-dashed border-slate-200 bg-slate-50/50 flex flex-col items-center justify-center p-3 text-center"
            >
              <FiLoader className="text-kora text-lg animate-spin mb-1.5" />
              <span className="text-[9px] font-bold text-slate-400 truncate max-w-full">
                Uploading...
              </span>
            </div>
          ))}

          {/* Micro "Add Another" slot */}
          {images.length > 0 && (
            <button
              type="button"
              onClick={triggerFileSelect}
              className="aspect-square rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/20 hover:bg-slate-50 hover:border-slate-300 flex flex-col items-center justify-center text-slate-400 hover:text-kora transition-all"
            >
              <FiPlus className="text-lg" />
              <span className="text-[9px] font-bold uppercase tracking-wider mt-1">Add More</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
