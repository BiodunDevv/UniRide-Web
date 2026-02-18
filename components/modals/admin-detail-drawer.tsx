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
import { Shield, Mail } from "lucide-react";
import type { Admin } from "@/store/useAdminStore";

interface AdminDetailDrawerProps {
  admin: Admin;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function AdminDetailDrawer({
  admin,
  onEdit,
  onDelete,
}: AdminDetailDrawerProps) {
  const isMobile = useIsMobile();

  return (
    <Drawer direction={isMobile ? "bottom" : "right"}>
      <DrawerTrigger asChild>
        <Button
          variant="link"
          className="text-foreground w-fit px-0 text-left h-auto p-0 text-xs font-medium hover:underline"
        >
          {admin.name}
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle className="text-sm">Admin Profile</DrawerTitle>
          <DrawerDescription className="text-xs">
            View admin account details
          </DrawerDescription>
        </DrawerHeader>
        <div className="flex flex-col gap-4 flex-1 min-h-0 overflow-y-auto px-4 py-2 text-sm">
          <Separator />
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium">{admin.name}</p>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Mail className="h-3 w-3" />
                {admin.email}
              </p>
            </div>
          </div>
          <Separator />
          <div className="grid gap-3">
            <div className="flex items-center justify-between">
              <Label className="text-xs text-muted-foreground">Role</Label>
              <Badge
                variant={admin.role === "super_admin" ? "default" : "secondary"}
                className="text-[10px]"
              >
                {admin.role === "super_admin" ? "Super Admin" : "Admin"}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-xs text-muted-foreground">Status</Label>
              <Badge
                variant={!admin.is_flagged ? "outline" : "secondary"}
                className="text-[10px] capitalize"
              >
                {admin.is_flagged ? "Flagged" : "Active"}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-xs text-muted-foreground">Joined</Label>
              <span className="text-xs">
                {new Date(admin.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
        <DrawerFooter>
          {(onEdit || onDelete) && (
            <div className="flex gap-2 w-full">
              {onEdit && (
                <Button size="sm" className="text-xs flex-1" onClick={onEdit}>
                  Edit Role
                </Button>
              )}
              {onDelete && (
                <Button
                  size="sm"
                  variant="destructive"
                  className="text-xs flex-1"
                  onClick={onDelete}
                >
                  Delete Admin
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
