"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Construction, ArrowLeft, Sparkles } from "lucide-react";
import Link from "next/link";

interface ComingSoonProps {
  /** Title override — defaults to the feature name */
  title?: string;
  /** Feature description shown below the title */
  description?: string;
  /** Short feature label shown in the badge (e.g. "Bookings") */
  feature?: string;
  /** Back-button destination. Pass `null` to hide the button. */
  backHref?: string | null;
  /** Back-button label */
  backLabel?: string;
  /** Optional highlights to show in the bullet list */
  highlights?: string[];
}

const DEFAULT_HIGHLIGHTS = [
  "Real-time data and live updates",
  "Advanced filtering and search",
  "Detailed analytics and reporting",
  "Export and data management tools",
];

export function ComingSoon({
  title,
  description,
  feature = "Feature",
  backHref = "/dashboard",
  backLabel = "Back to Dashboard",
  highlights = DEFAULT_HIGHLIGHTS,
}: ComingSoonProps) {
  const heading = title ?? `${feature} — Coming Soon`;
  const subtext =
    description ??
    `We're working hard to bring you ${feature.toLowerCase()} management. This section will be fully functional soon.`;

  return (
    <div className="flex flex-1 flex-col items-center justify-center min-h-[70vh] px-4">
      <div className="w-full max-w-lg text-center space-y-6">
        {/* Icon */}
        <div className="flex justify-center">
          <div className="relative">
            <div className="h-20 w-20 bg-primary/10 flex items-center justify-center">
              <Construction className="h-9 w-9 text-primary" />
            </div>
            <div className="absolute -top-1.5 -right-1.5 h-6 w-6 bg-primary flex items-center justify-center">
              <Sparkles className="h-3 w-3 text-primary-foreground" />
            </div>
          </div>
        </div>

        {/* Badge + heading */}
        <div className="space-y-3">
          <Badge variant="secondary" className="text-[11px] px-3 py-1">
            {feature}
          </Badge>
          <h1 className="text-2xl font-semibold tracking-tight">{heading}</h1>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-sm mx-auto">
            {subtext}
          </p>
        </div>

        <Separator />

        {/* Highlights */}
        <div className="text-left space-y-2.5">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide text-center">
            What to expect
          </p>
          <ul className="space-y-2">
            {highlights.map((item) => (
              <li
                key={item}
                className="flex items-start gap-2.5 text-xs text-muted-foreground"
              >
                <span className="mt-1 h-1.5 w-1.5 shrink-0 bg-primary" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <Separator />

        {/* Back button */}
        {backHref !== null && (
          <Button asChild variant="outline" size="sm" className="text-xs">
            <Link href={backHref}>
              <ArrowLeft className="h-3.5 w-3.5 mr-1.5" />
              {backLabel}
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
}
