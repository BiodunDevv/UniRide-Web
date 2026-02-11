"use client";

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
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Settings,
  User,
  Shield,
  Bell,
  Palette,
  Globe,
  Save,
} from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";

export default function SettingsPage() {
  const { user } = useAuthStore();

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
      <div>
        <h2 className="text-lg font-semibold">Settings</h2>
        <p className="text-xs text-muted-foreground">
          Manage your account and platform settings
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <User className="h-4 w-4" />
              Profile Information
            </CardTitle>
            <CardDescription className="text-xs">
              Update your personal details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-xs">Full Name</Label>
              <Input
                defaultValue={user?.name || ""}
                placeholder="Full name"
                className="h-8 text-xs"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Email</Label>
              <Input
                defaultValue={user?.email || ""}
                placeholder="Email address"
                className="h-8 text-xs"
                disabled
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Role</Label>
              <Input
                defaultValue={user?.role || ""}
                placeholder="Role"
                className="h-8 text-xs"
                disabled
              />
            </div>
            <Button size="sm">
              <Save className="h-4 w-4 mr-1.5" />
              <span className="text-xs">Save Profile</span>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Security
            </CardTitle>
            <CardDescription className="text-xs">
              Manage your password and security settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-xs">Current Password</Label>
              <Input
                type="password"
                className="h-8 text-xs"
                placeholder="Enter current password"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">New Password</Label>
              <Input
                type="password"
                className="h-8 text-xs"
                placeholder="Enter new password"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Confirm Password</Label>
              <Input
                type="password"
                className="h-8 text-xs"
                placeholder="Confirm new password"
              />
            </div>
            <Button size="sm" variant="outline">
              <span className="text-xs">Update Password</span>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Notification Preferences
            </CardTitle>
            <CardDescription className="text-xs">
              Configure how you receive notifications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              {
                label: "Email Notifications",
                desc: "Receive updates via email",
              },
              {
                label: "Push Notifications",
                desc: "Browser push notifications",
              },
              {
                label: "New Driver Applications",
                desc: "Alert for new applications",
              },
              {
                label: "Support Tickets",
                desc: "Alert for new support tickets",
              },
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-between py-1"
              >
                <div>
                  <p className="text-xs font-medium">{item.label}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {item.desc}
                  </p>
                </div>
                <Badge variant="outline" className="text-[10px]">
                  On
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

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
      </div>
    </div>
  );
}
