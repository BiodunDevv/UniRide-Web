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
import { Shield } from "lucide-react";

export function SecurityCard() {
  return (
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
  );
}
