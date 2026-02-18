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
import { User, Save } from "lucide-react";

interface ProfileCardProps {
  name: string;
  email: string;
  role: string;
}

export function ProfileCard({ name, email, role }: ProfileCardProps) {
  return (
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
            defaultValue={name}
            placeholder="Full name"
            className="h-8 text-xs"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-xs">Email</Label>
          <Input
            defaultValue={email}
            placeholder="Email address"
            className="h-8 text-xs"
            disabled
          />
        </div>
        <div className="space-y-2">
          <Label className="text-xs">Role</Label>
          <Input
            defaultValue={role}
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
  );
}
