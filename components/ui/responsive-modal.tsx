"use client";

import * as React from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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

interface ResponsiveModalProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}

function ResponsiveModal({
  open,
  onOpenChange,
  children,
}: ResponsiveModalProps) {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        {children}
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {children}
    </Dialog>
  );
}

function ResponsiveModalTrigger({
  children,
  ...props
}: React.ComponentProps<typeof DialogTrigger>) {
  const isMobile = useIsMobile();

  if (isMobile) {
    return <DrawerTrigger {...props}>{children}</DrawerTrigger>;
  }

  return <DialogTrigger {...props}>{children}</DialogTrigger>;
}

function ResponsiveModalContent({
  children,
  className,
  ...props
}: React.ComponentProps<typeof DialogContent>) {
  const isMobile = useIsMobile();

  if (isMobile) {
    return <DrawerContent>{children}</DrawerContent>;
  }

  return (
    <DialogContent className={className} {...props}>
      {children}
    </DialogContent>
  );
}

function ResponsiveModalHeader({
  children,
  ...props
}: React.ComponentProps<typeof DialogHeader>) {
  const isMobile = useIsMobile();

  if (isMobile) {
    return <DrawerHeader {...props}>{children}</DrawerHeader>;
  }

  return <DialogHeader {...props}>{children}</DialogHeader>;
}

function ResponsiveModalTitle({
  children,
  ...props
}: React.ComponentProps<typeof DialogTitle>) {
  const isMobile = useIsMobile();

  if (isMobile) {
    return <DrawerTitle {...props}>{children}</DrawerTitle>;
  }

  return <DialogTitle {...props}>{children}</DialogTitle>;
}

function ResponsiveModalDescription({
  children,
  ...props
}: React.ComponentProps<typeof DialogDescription>) {
  const isMobile = useIsMobile();

  if (isMobile) {
    return <DrawerDescription {...props}>{children}</DrawerDescription>;
  }

  return <DialogDescription {...props}>{children}</DialogDescription>;
}

function ResponsiveModalFooter({
  children,
  ...props
}: React.ComponentProps<typeof DialogFooter>) {
  const isMobile = useIsMobile();

  if (isMobile) {
    return <DrawerFooter {...props}>{children}</DrawerFooter>;
  }

  return <DialogFooter {...props}>{children}</DialogFooter>;
}

function ResponsiveModalClose({
  children,
  ...props
}: React.ComponentProps<typeof DialogClose>) {
  const isMobile = useIsMobile();

  if (isMobile) {
    return <DrawerClose {...props}>{children}</DrawerClose>;
  }

  return <DialogClose {...props}>{children}</DialogClose>;
}

export {
  ResponsiveModal,
  ResponsiveModalTrigger,
  ResponsiveModalContent,
  ResponsiveModalHeader,
  ResponsiveModalTitle,
  ResponsiveModalDescription,
  ResponsiveModalFooter,
  ResponsiveModalClose,
};
