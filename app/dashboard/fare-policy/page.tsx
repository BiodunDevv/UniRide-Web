"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DollarSign, Save, Loader2 } from "lucide-react";
import { PageHeader } from "@/components/shared";
import { useAdminStore } from "@/store/useAdminStore";

export default function FarePolicyPage() {
  const { farePolicy, isLoading, getFarePolicy, updateFarePolicy } =
    useAdminStore();

  const [mode, setMode] = useState<"admin" | "driver" | "distance_auto">(
    "admin",
  );
  const [baseFare, setBaseFare] = useState("");
  const [perKmRate, setPerKmRate] = useState("");
  const [perMinuteRate, setPerMinuteRate] = useState("");
  const [minimumFare, setMinimumFare] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getFarePolicy();
  }, [getFarePolicy]);

  useEffect(() => {
    if (farePolicy) {
      setMode(farePolicy.mode);
      setBaseFare(farePolicy.base_fare.toString());
      setPerKmRate(farePolicy.per_km_rate.toString());
      setPerMinuteRate(farePolicy.per_minute_rate.toString());
      setMinimumFare(farePolicy.minimum_fare.toString());
    }
  }, [farePolicy]);

  const distance = 5;
  const waitTime = 3;

  const estimatedTotal = useMemo(() => {
    const base = parseFloat(baseFare) || 0;
    const km = parseFloat(perKmRate) || 0;
    const min = parseFloat(perMinuteRate) || 0;
    return base + km * distance + min * waitTime;
  }, [baseFare, perKmRate, perMinuteRate]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateFarePolicy({
        mode,
        base_fare: parseFloat(baseFare) || 0,
        per_km_rate: parseFloat(perKmRate) || 0,
        per_minute_rate: parseFloat(perMinuteRate) || 0,
        minimum_fare: parseFloat(minimumFare) || 0,
      });
      await getFarePolicy();
    } finally {
      setSaving(false);
    }
  };

  if (isLoading && !farePolicy) {
    return (
      <div className="flex flex-1 items-center justify-center p-6">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
      <PageHeader
        title="Fare Policy"
        description="Configure pricing and fare rules"
        actions={
          <Button size="sm" onClick={handleSave} disabled={saving}>
            {saving ? (
              <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-1.5" />
            )}
            <span className="text-xs">Save Changes</span>
          </Button>
        }
      />

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Pricing Configuration
            </CardTitle>
            <CardDescription className="text-xs">
              Set fare mode, base fares, per-km rates, and minimum fare
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-xs">Fare Mode</Label>
              <Select
                value={mode}
                onValueChange={(v) =>
                  setMode(v as "admin" | "driver" | "distance_auto")
                }
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin" className="text-xs">
                    Admin Set
                  </SelectItem>
                  <SelectItem value="driver" className="text-xs">
                    Driver Set
                  </SelectItem>
                  <SelectItem value="distance_auto" className="text-xs">
                    Auto (Distance)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Base Fare (₦)</Label>
              <Input
                type="number"
                value={baseFare}
                onChange={(e) => setBaseFare(e.target.value)}
                className="h-8 text-xs"
                placeholder="0"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Per Kilometer Rate (₦)</Label>
              <Input
                type="number"
                value={perKmRate}
                onChange={(e) => setPerKmRate(e.target.value)}
                className="h-8 text-xs"
                placeholder="0"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Per Minute Rate (₦)</Label>
              <Input
                type="number"
                value={perMinuteRate}
                onChange={(e) => setPerMinuteRate(e.target.value)}
                className="h-8 text-xs"
                placeholder="0"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Minimum Fare (₦)</Label>
              <Input
                type="number"
                value={minimumFare}
                onChange={(e) => setMinimumFare(e.target.value)}
                className="h-8 text-xs"
                placeholder="0"
              />
            </div>
            {farePolicy?.updatedAt && (
              <p className="text-[10px] text-muted-foreground pt-2 border-t">
                Last updated: {new Date(farePolicy.updatedAt).toLocaleString()}
              </p>
            )}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Fare Calculator Preview</CardTitle>
              <CardDescription className="text-xs">
                Estimate ride cost with current settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <Label className="text-xs">Distance (km)</Label>
                <Input
                  type="number"
                  defaultValue={distance}
                  className="h-8 text-xs"
                  disabled
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Waiting Time (min)</Label>
                <Input
                  type="number"
                  defaultValue={waitTime}
                  className="h-8 text-xs"
                  disabled
                />
              </div>
              <Separator />
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Base Fare</span>
                  <span>₦{parseFloat(baseFare) || 0}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">
                    Distance ({distance} km × ₦{parseFloat(perKmRate) || 0})
                  </span>
                  <span>₦{(parseFloat(perKmRate) || 0) * distance}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">
                    Waiting ({waitTime} min × ₦{parseFloat(perMinuteRate) || 0})
                  </span>
                  <span>₦{(parseFloat(perMinuteRate) || 0) * waitTime}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-sm font-semibold">
                  <span>Estimated Total</span>
                  <span>₦{estimatedTotal.toLocaleString()}</span>
                </div>
                {parseFloat(minimumFare) > 0 &&
                  estimatedTotal < parseFloat(minimumFare) && (
                    <p className="text-[10px] text-muted-foreground">
                      * Minimum fare of ₦{minimumFare} will be applied
                    </p>
                  )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Current Policy Summary</CardTitle>
              <CardDescription className="text-xs">
                Active fare configuration
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span>Mode</span>
                  <Badge variant="outline" className="text-[10px] capitalize">
                    {mode.replace("_", " ")}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span>Base Fare</span>
                  <Badge variant="secondary" className="text-[10px]">
                    ₦{parseFloat(baseFare) || 0}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span>Per Km</span>
                  <Badge variant="secondary" className="text-[10px]">
                    ₦{parseFloat(perKmRate) || 0}/km
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span>Per Minute</span>
                  <Badge variant="secondary" className="text-[10px]">
                    ₦{parseFloat(perMinuteRate) || 0}/min
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span>Minimum Fare</span>
                  <Badge variant="secondary" className="text-[10px]">
                    ₦{parseFloat(minimumFare) || 0}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
