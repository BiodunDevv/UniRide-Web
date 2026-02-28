"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPinIcon, ArrowRightIcon } from "lucide-react";

interface TopRoute {
  pickup_name: string;
  dropoff_name: string;
  count: number;
}

interface TopRoutesProps {
  data: TopRoute[];
}

export function TopRoutes({ data }: TopRoutesProps) {
  if (!data || data.length === 0) return null;

  const maxCount = Math.max(...data.map((r) => r.count));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          <MapPinIcon className="h-4 w-4 text-primary" />
          Top Routes
        </CardTitle>
        <CardDescription className="text-xs">
          Most popular pickup → dropoff combinations
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {data.slice(0, 10).map((route, i) => (
            <div key={i} className="space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 min-w-0 flex-1 text-xs">
                  <span className="text-muted-foreground font-medium shrink-0">
                    #{i + 1}
                  </span>
                  <span className="truncate">{route.pickup_name}</span>
                  <ArrowRightIcon className="h-3 w-3 shrink-0 text-muted-foreground" />
                  <span className="truncate">{route.dropoff_name}</span>
                </div>
                <Badge variant="outline" className="text-[10px] shrink-0">
                  {route.count}
                </Badge>
              </div>
              <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary/60 rounded-full transition-all"
                  style={{
                    width: `${maxCount > 0 ? (route.count / maxCount) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
