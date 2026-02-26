"use client";

import { useState, useRef, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Palette, Check } from "lucide-react";

// ─── Common car colors with their CSS values ─────────────────────────────────
const CAR_COLORS = [
  { name: "Black", hex: "#1a1a1a" },
  { name: "White", hex: "#f5f5f5" },
  { name: "Silver", hex: "#c0c0c0" },
  { name: "Gray", hex: "#808080" },
  { name: "Red", hex: "#dc2626" },
  { name: "Blue", hex: "#2563eb" },
  { name: "Navy", hex: "#1e3a5f" },
  { name: "Green", hex: "#16a34a" },
  { name: "Gold", hex: "#ca8a04" },
  { name: "Beige", hex: "#d4b896" },
  { name: "Brown", hex: "#78502e" },
  { name: "Maroon", hex: "#7f1d1d" },
  { name: "Orange", hex: "#ea580c" },
  { name: "Yellow", hex: "#eab308" },
  { name: "Purple", hex: "#7c3aed" },
  { name: "Wine", hex: "#722f37" },
  { name: "Champagne", hex: "#f7e7ce" },
  { name: "Burgundy", hex: "#6b1c23" },
];

interface VehicleColorPickerProps {
  value: string;
  onChange: (color: string) => void;
}

export function VehicleColorPicker({
  value,
  onChange,
}: VehicleColorPickerProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Filter suggestions based on input
  const filtered = value
    ? CAR_COLORS.filter((c) =>
        c.name.toLowerCase().includes(value.toLowerCase()),
      )
    : CAR_COLORS;

  // Resolve displayed color — match against presets or use raw input
  const resolvedColor =
    CAR_COLORS.find((c) => c.name.toLowerCase() === value.toLowerCase())?.hex ??
    (value || undefined);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const selectColor = (name: string) => {
    onChange(name);
    setShowSuggestions(false);
  };

  return (
    <div className="space-y-1.5" ref={containerRef}>
      <Label
        htmlFor="vehicle_color"
        className="text-xs font-medium text-foreground"
      >
        Vehicle Color
      </Label>

      <div className="relative">
        {/* Color swatch / palette icon */}
        {resolvedColor ? (
          <div
            className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full border border-border pointer-events-none shadow-sm"
            style={{ backgroundColor: resolvedColor }}
          />
        ) : (
          <Palette className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
        )}

        <input
          id="vehicle_color"
          type="text"
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setShowSuggestions(true);
          }}
          onFocus={() => {
            setIsFocused(true);
            setShowSuggestions(true);
          }}
          onBlur={() => setIsFocused(false)}
          placeholder="e.g. Silver, Black, White"
          autoComplete="off"
          className={`flex h-9 w-full rounded-md border bg-background px-3 py-1 text-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 pl-8 pr-10 ${
            isFocused ? "border-ring" : "border-input"
          }`}
        />

        {/* Clear button */}
        {value && (
          <button
            type="button"
            onClick={() => {
              onChange("");
              setShowSuggestions(false);
            }}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}

        {/* Suggestions dropdown */}
        {showSuggestions && filtered.length > 0 && (
          <div className="absolute z-50 mt-1 w-full rounded-md border border-border bg-background shadow-lg animate-in fade-in-0 zoom-in-95 duration-100">
            <div className="max-h-52 overflow-y-auto p-1.5">
              {/* Preset color swatches grid */}
              <div className="grid grid-cols-6 gap-1.5 p-1.5">
                {filtered.map((color) => {
                  const isSelected =
                    value.toLowerCase() === color.name.toLowerCase();
                  return (
                    <button
                      key={color.name}
                      type="button"
                      onClick={() => selectColor(color.name)}
                      title={color.name}
                      className={`group relative w-full aspect-square rounded-md border-2 transition-all duration-150 hover:scale-110 hover:shadow-md ${
                        isSelected
                          ? "border-[#042F40] ring-2 ring-[#042F40]/20 scale-110"
                          : "border-transparent hover:border-border"
                      }`}
                      style={{ backgroundColor: color.hex }}
                    >
                      {isSelected && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Check
                            className="w-3.5 h-3.5 drop-shadow-md"
                            style={{
                              color:
                                color.hex === "#f5f5f5" ||
                                color.hex === "#f7e7ce" ||
                                color.hex === "#d4b896" ||
                                color.hex === "#eab308" ||
                                color.hex === "#c0c0c0"
                                  ? "#1a1a1a"
                                  : "#ffffff",
                            }}
                          />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Color name list (shown when filtering) */}
              {value && filtered.length > 0 && filtered.length <= 6 && (
                <>
                  <div className="border-t border-border my-1.5" />
                  <div className="space-y-0.5">
                    {filtered.map((color) => (
                      <button
                        key={`list-${color.name}`}
                        type="button"
                        onClick={() => selectColor(color.name)}
                        className="flex items-center gap-2.5 w-full px-2.5 py-1.5 text-xs rounded-sm hover:bg-muted transition-colors text-left"
                      >
                        <div
                          className="w-4 h-4 rounded-full border border-border shadow-sm shrink-0"
                          style={{ backgroundColor: color.hex }}
                        />
                        <span className="font-medium text-foreground">
                          {color.name}
                        </span>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      <p className="text-xs text-muted-foreground">
        Optional — helps riders identify your vehicle
      </p>
    </div>
  );
}
