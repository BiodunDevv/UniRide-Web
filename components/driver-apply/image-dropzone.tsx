"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";
import { Upload, Loader2, X, CheckCircle2, ImageIcon } from "lucide-react";
import Image from "next/image";

interface ImageDropzoneProps {
  /** Current image URL (preview) */
  imageUrl: string;
  /** Callback when an image is uploaded or removed */
  onImageChange: (url: string) => void;
  /** Label shown in the idle state */
  label?: string;
  /** Label shown on the success badge */
  successLabel?: string;
  /** Whether a placeholder icon or upload icon is shown */
  variant?: "upload" | "image";
  /** Padding size for the drop zone */
  size?: "sm" | "md";
  /** Whether the field is required */
  required?: boolean;
  /** Unique id for the hidden file input */
  inputId: string;
}

export function ImageDropzone({
  imageUrl,
  onImageChange,
  label = "Drag & drop or click to upload",
  successLabel = "Uploaded successfully",
  variant = "upload",
  size = "md",
  required = false,
  inputId,
}: ImageDropzoneProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [dragging, setDragging] = useState(false);

  const processFile = useCallback(
    async (file: File) => {
      if (!file.type.startsWith("image/")) {
        toast.error("Invalid file type", {
          description: "Please upload a valid image file (PNG, JPG, WEBP).",
        });
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        toast.error("File too large", {
          description: "Image size must be less than 5MB.",
        });
        return;
      }

      setUploading(true);
      setProgress(0);

      try {
        const url = await new Promise<string>((resolve, reject) => {
          const formData = new FormData();
          formData.append("file", file);
          formData.append(
            "upload_preset",
            process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "",
          );

          const xhr = new XMLHttpRequest();

          xhr.upload.addEventListener("progress", (event) => {
            if (event.lengthComputable) {
              const percent = Math.round((event.loaded / event.total) * 100);
              setProgress(percent);
            }
          });

          xhr.addEventListener("load", () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              const data = JSON.parse(xhr.responseText);
              if (data.secure_url) {
                resolve(data.secure_url);
              } else {
                reject(new Error("No URL returned from upload"));
              }
            } else {
              reject(new Error("Upload failed"));
            }
          });

          xhr.addEventListener("error", () =>
            reject(new Error("Network error during upload")),
          );
          xhr.addEventListener("abort", () =>
            reject(new Error("Upload cancelled")),
          );

          xhr.open(
            "POST",
            `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
          );
          xhr.send(formData);
        });

        onImageChange(url);
        toast.success("Image uploaded successfully");
      } catch (err) {
        console.error("Error uploading image:", err);
        toast.error("Upload failed", {
          description: "Could not upload your image. Please try again.",
        });
      } finally {
        setUploading(false);
        setProgress(0);
      }
    },
    [onImageChange],
  );

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(true);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);
  };

  const paddingClass = size === "sm" ? "p-6" : "p-8";
  const iconSize = size === "sm" ? "w-8 h-8" : "w-10 h-10";
  const IdleIcon = variant === "image" ? ImageIcon : Upload;

  if (imageUrl) {
    return (
      <div className="relative">
        <div className="border overflow-hidden">
          <Image
            src={imageUrl}
            alt="Preview"
            width={800}
            height={500}
            className={`w-full h-auto ${variant === "image" ? "max-h-64 object-cover" : ""}`}
          />
        </div>
        <button
          type="button"
          onClick={() => onImageChange("")}
          className="absolute top-2 right-2 bg-destructive text-destructive-foreground p-1.5 hover:opacity-80 transition-opacity"
        >
          <X className="w-3.5 h-3.5" />
        </button>
        <div className="mt-2 flex items-center gap-1.5 text-xs text-green-700">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>{successLabel}</span>
        </div>
      </div>
    );
  }

  return (
    <div
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => !uploading && document.getElementById(inputId)?.click()}
      className={`flex flex-col items-center justify-center border-2 border-dashed ${paddingClass} cursor-pointer transition-all duration-200 ${
        dragging
          ? "border-[#042F40] bg-[#042F40]/5 scale-[1.01] ring-2 ring-[#042F40]/20"
          : "border-border hover:border-[#042F40] hover:bg-muted/30"
      }`}
    >
      <input
        type="file"
        accept="image/*"
        onChange={handleFileInput}
        className="hidden"
        id={inputId}
        required={required}
      />

      {uploading ? (
        <div className="w-full space-y-4">
          <div className="flex flex-col items-center">
            <Loader2
              className={`${iconSize} text-[#042F40] mb-3 animate-spin`}
            />
            <p className="text-sm font-medium text-foreground mb-1">
              Uploading image...
            </p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Upload progress</span>
              <span className="font-semibold text-[#042F40]">{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
          {size === "md" && (
            <p className="text-xs text-muted-foreground text-center">
              Please wait while we upload your document
            </p>
          )}
        </div>
      ) : (
        <>
          {dragging ? (
            <>
              <Upload
                className={`${iconSize} text-[#042F40] mb-2 animate-bounce`}
              />
              <p className="text-sm font-medium text-[#042F40] mb-1">
                Drop your image here
              </p>
              <p className="text-xs text-[#042F40]/60">Release to upload</p>
            </>
          ) : (
            <>
              <IdleIcon className={`${iconSize} text-muted-foreground mb-2`} />
              <p className="text-sm font-medium text-foreground mb-1">
                {label}
              </p>
              <p className="text-xs text-muted-foreground">
                PNG, JPG — up to 5MB
              </p>
            </>
          )}
        </>
      )}
    </div>
  );
}
