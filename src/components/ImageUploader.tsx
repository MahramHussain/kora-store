"use client";

import { useState, useRef } from "react";
import { FiUploadCloud, FiTrash2, FiLoader, FiPlus } from "react-icons/fi";

interface ImageUploaderProps {
  images: string[];
  onChange: (images: string[]) => void;
}

export default function ImageUploader({ images, onChange }: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState<{ id: string; name: string }[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (files: FileList) => {
    const validFiles = Array.from(files).filter(file => file.type.startsWith("image/"));
    if (validFiles.length === 0) return;

    // Add files to uploading state
    const newUploading = validFiles.map(file => ({
      id: Math.random().toString(36).substring(2, 9),
      name: file.name
    }));
    setUploadingFiles(prev => [...prev, ...newUploading]);

    const uploadedUrls: string[] = [];

    for (let i = 0; i < validFiles.length; i++) {
      const file = validFiles[i];
      const targetUploadingId = newUploading[i].id;
      
      const formData = new FormData();
      formData.append("file", file);

      try {
        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (res.ok) {
          const data = await res.json();
          if (data.success && data.url) {
            uploadedUrls.push(data.url);
          }
        } else {
          console.error("Upload failed for file:", file.name);
        }
      } catch (err) {
        console.error("Error uploading file:", err);
      } finally {
        // Remove from uploading state
        setUploadingFiles(prev => prev.filter(f => f.id !== targetUploadingId));
      }
    }

    if (uploadedUrls.length > 0) {
      onChange([...images, ...uploadedUrls]);
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
    if (url.startsWith("http") || url.startsWith("/")) {
      return url;
    }
    // Fallback if it's just a filename
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
          accept="image/*"
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
              className="relative aspect-square rounded-xl overflow-hidden border border-slate-200/60 bg-slate-50 group shadow-2xs hover:shadow-sm hover:border-slate-300 transition-all"
            >
              <img
                src={getDisplayUrl(img)}
                alt={`Uploaded ${idx + 1}`}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              
              {/* Overlay with delete button */}
              <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveImage(idx);
                  }}
                  className="w-9 h-9 rounded-full bg-white text-rose-600 border border-slate-200/50 flex items-center justify-center shadow-md hover:bg-rose-50 hover:scale-105 transition-all"
                  title="Remove Image"
                >
                  <FiTrash2 className="text-base" />
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
