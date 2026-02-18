"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Globe, Save } from "lucide-react";

export function PlatformSettingsCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          <Globe className="h-4 w-4" />
          Platform Settings
        </CardTitle>
        <CardDescription className="text-xs">
          General platform configuration
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label className="text-xs">Timezone</Label>
          <Select defaultValue="africa_lagos">
            <SelectTrigger className="h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="africa_lagos" className="text-xs">
                Africa/Lagos (WAT)
              </SelectItem>
              <SelectItem value="utc" className="text-xs">
                UTC
              </SelectItem>
              <SelectItem value="europe_london" className="text-xs">
                Europe/London (GMT)
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label className="text-xs">Currency</Label>
          <Select defaultValue="ngn">
            <SelectTrigger className="h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ngn" className="text-xs">
                ₦ Nigerian Naira (NGN)
              </SelectItem>
              <SelectItem value="usd" className="text-xs">
                $ US Dollar (USD)
              </SelectItem>
              <SelectItem value="gbp" className="text-xs">
                £ British Pound (GBP)
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label className="text-xs">Language</Label>
          <Select defaultValue="en">
            <SelectTrigger className="h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en" className="text-xs">
                English
              </SelectItem>
              <SelectItem value="fr" className="text-xs">
                French
              </SelectItem>
              <SelectItem value="yo" className="text-xs">
                Yoruba
              </SelectItem>
              <SelectItem value="ig" className="text-xs">
                Igbo
              </SelectItem>
              <SelectItem value="ha" className="text-xs">
                Hausa
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button size="sm">
          <Save className="h-4 w-4 mr-1.5" />
          <span className="text-xs">Save Settings</span>
        </Button>
      </CardContent>
    </Card>
  );
}
