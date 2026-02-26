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
import Link from "next/link";
import { useIsMobile } from "@/hooks/use-mobile";
import { ProfileAvatar } from "@/components/shared/profile-avatar";
import {
  Users,
  Mail,
  Calendar,
  Flag,
  FlagOff,
  ExternalLink,
  ShieldAlert,
} from "lucide-react";
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
        <div className="flex flex-col gap-4 flex-1 min-h-0 overflow-y-auto px-4 py-2 text-sm">
          <Separator />
          <div className="flex items-center gap-3">
            <ProfileAvatar
              src={user.profile_picture}
              name={user.name}
              size="md"
            />
            <div>
              <p className="text-sm font-medium">{user.name}</p>
              <div className="flex items-center gap-1.5 mt-1">
                <Badge
                  variant={!user.is_flagged ? "outline" : "destructive"}
                  className="text-[10px] capitalize"
                >
                  {user.is_flagged ? (
                    <span className="flex items-center gap-1">
                      <ShieldAlert className="h-2.5 w-2.5" />
                      Flagged
                    </span>
                  ) : (
                    "Active"
                  )}
                </Badge>
                <Badge variant="secondary" className="text-[10px] capitalize">
                  {user.role}
                </Badge>
              </div>
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
        <DrawerFooter>
          <Button
            variant="outline"
            size="sm"
            className="text-xs w-full"
            asChild
          >
            <Link href={`/dashboard/users/${user._id}`}>
              <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
              View Full Details
            </Link>
          </Button>
          {(onFlag || onDelete) && (
            <div className="flex gap-2 w-full">
              {onFlag && (
                <Button
                  size="sm"
                  variant={user.is_flagged ? "outline" : "secondary"}
                  className={`text-xs flex-1 ${
                    user.is_flagged
                      ? "border-green-200 text-green-700 hover:bg-green-50"
                      : "text-amber-700 hover:bg-amber-50"
                  }`}
                  onClick={onFlag}
                >
                  {user.is_flagged ? (
                    <FlagOff className="h-3.5 w-3.5 mr-1.5" />
                  ) : (
                    <Flag className="h-3.5 w-3.5 mr-1.5" />
                  )}
                  {user.is_flagged ? "Unflag" : "Flag"}
                </Button>
              )}
              {onDelete && (
                <Button
                  size="sm"
                  variant="destructive"
                  className="text-xs flex-1"
                  onClick={onDelete}
                >
                  Delete
                </Button>
              )}
            </div>
          )}
          <DrawerClose asChild>
            <Button variant="ghost" size="sm" className="text-xs w-full">
              Close
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
