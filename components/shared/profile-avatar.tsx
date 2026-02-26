"use client";

import { useState } from "react";
import Image from "next/image";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { X } from "lucide-react";

interface ProfileAvatarProps {
  src?: string | null;
  name: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeMap = {
  sm: { container: "h-7 w-7", text: "text-[10px]" },
  md: { container: "h-10 w-10", text: "text-xs" },
  lg: { container: "h-16 w-16", text: "text-lg" },
};

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

/** Avatar with optional fullscreen preview on click */
export function ProfileAvatar({
  src,
  name,
  size = "md",
  className = "",
}: ProfileAvatarProps) {
  const [showPreview, setShowPreview] = useState(false);
  const s = sizeMap[size];
  const initials = getInitials(name || "U");

  return (
    <>
      {src ? (
        <button
          onClick={() => setShowPreview(true)}
          className={`${s.container} rounded-full overflow-hidden shrink-0 border border-border hover:ring-2 hover:ring-primary/20 transition-all cursor-pointer ${className}`}
          title={`View ${name}'s photo`}
        >
          <img src={src} alt={name} className="h-full w-full object-cover" />
        </button>
      ) : (
        <div
          className={`${s.container} rounded-full bg-primary/10 flex items-center justify-center shrink-0 ${className}`}
        >
          <span className={`${s.text} font-semibold text-primary`}>
            {initials}
          </span>
        </div>
      )}

      {src && (
        <Dialog open={showPreview} onOpenChange={setShowPreview}>
          <DialogContent className="max-w-lg p-0 overflow-hidden border-0 bg-black/95 [&>button]:hidden">
            <button
              onClick={() => setShowPreview(false)}
              className="absolute top-3 right-3 z-10 h-8 w-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
            >
              <X className="h-4 w-4 text-white" />
            </button>
            <div className="flex items-center justify-center p-4">
              <div className="relative w-72 h-72 sm:w-80 sm:h-80">
                <Image
                  src={src}
                  alt={name}
                  fill
                  className="object-contain rounded-lg"
                  unoptimized
                />
              </div>
            </div>
            <div className="text-center pb-4">
              <p className="text-white/80 text-sm font-medium">{name}</p>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}

/** Clickable image card with fullscreen preview */
export function ImagePreview({
  src,
  alt,
  aspectRatio = "aspect-video",
  className = "",
}: {
  src: string;
  alt: string;
  aspectRatio?: string;
  className?: string;
}) {
  const [showPreview, setShowPreview] = useState(false);

  return (
    <>
      <button
        onClick={() => setShowPreview(true)}
        className={`relative w-full ${aspectRatio} border bg-muted/30 overflow-hidden rounded-lg hover:ring-2 hover:ring-primary/20 transition-all cursor-pointer ${className}`}
        title="Click to view full size"
      >
        <Image
          src={src}
          alt={alt}
          fill
          className="object-cover hover:scale-[1.02] transition-transform duration-300"
          unoptimized
        />
      </button>

      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-3xl p-0 overflow-hidden border-0 bg-black/95 [&>button]:hidden">
          <button
            onClick={() => setShowPreview(false)}
            className="absolute top-3 right-3 z-10 h-8 w-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
          >
            <X className="h-4 w-4 text-white" />
          </button>
          <div className="flex items-center justify-center p-6">
            <div className="relative w-full max-h-[75vh] aspect-video">
              <Image
                src={src}
                alt={alt}
                fill
                className="object-contain"
                unoptimized
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
