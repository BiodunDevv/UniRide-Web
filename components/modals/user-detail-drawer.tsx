"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { useIsMobile } from "@/hooks/use-mobile";
import { Users, Mail, Calendar, Flag } from "lucide-react";
import type { User } from "@/store/useAdminStore";

interface UserDetailDrawerProps {
  user: User;
  onFlag?: () => void;
  onDelete?: () => void;
}

export function UserDetailDrawer({
  user,
  onFlag,
  onDelete,
}: UserDetailDrawerProps) {
  const isMobile = useIsMobile();

  return (
    <Drawer direction={isMobile ? "bottom" : "right"}>
      <DrawerTrigger asChild>
        <Button
          variant="link"
          className="text-foreground w-fit px-0 text-left h-auto p-0 text-xs font-medium hover:underline"
        >
          {user.name}
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle className="text-sm">User Profile</DrawerTitle>
          <DrawerDescription className="text-xs">
            View user account details
          </DrawerDescription>
        </DrawerHeader>
        <div className="flex flex-col gap-4 overflow-y-auto px-4 text-sm">
          <Separator />
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium">{user.name}</p>
              <Badge
                variant={!user.is_flagged ? "outline" : "destructive"}
                className="text-[10px] capitalize mt-1"
              >
                {user.is_flagged ? "Flagged" : "Active"}
              </Badge>
            </div>
          </div>
          <Separator />
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg border p-3 text-center">
              <p className="text-lg font-bold capitalize">{user.role}</p>
              <p className="text-[10px] text-muted-foreground">Role</p>
            </div>
            <div className="rounded-lg border p-3 text-center">
              <p className="text-lg font-bold">
                {new Date(user.createdAt).toLocaleDateString("en-NG", {
                  month: "short",
                  year: "numeric",
                })}
              </p>
              <p className="text-[10px] text-muted-foreground">Member Since</p>
            </div>
          </div>
          <div className="grid gap-3">
            <div className="flex items-center justify-between">
              <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Mail className="h-3 w-3" /> Email
              </Label>
              <span className="text-xs">{user.email}</span>
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Calendar className="h-3 w-3" /> Joined
              </Label>
              <span className="text-xs">
                {new Date(user.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
        <DrawerFooter className="shrink-0 border-t">
          {onFlag && (
            <Button
              size="sm"
              variant="secondary"
              className="text-xs"
              onClick={onFlag}
            >
              <Flag className="h-3.5 w-3.5 mr-1.5" />
              {user.is_flagged ? "Unflag User" : "Flag User"}
            </Button>
          )}
          {onDelete && (
            <Button
              size="sm"
              variant="destructive"
              className="text-xs"
              onClick={onDelete}
            >
              Delete User
            </Button>
          )}
          <DrawerClose asChild>
            <Button variant="outline" size="sm" className="text-xs">
              Close
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
