"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ResponsiveModal,
  ResponsiveModalContent,
  ResponsiveModalDescription,
  ResponsiveModalHeader,
  ResponsiveModalTitle,
} from "@/components/ui/responsive-modal";
import { Loader2, UserPlus } from "lucide-react";

interface CreateAdminModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: {
    name: string;
    email: string;
    password: string;
  }) => Promise<void>;
  isLoading?: boolean;
}

export function CreateAdminModal({
  open,
  onOpenChange,
  onSubmit,
  isLoading = false,
}: CreateAdminModalProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const passwordsMatch = password === confirmPassword;
  const isValid =
    name && email && password && confirmPassword && passwordsMatch;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;

    await onSubmit({ name, email, password });
    setName("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
  };

  const handleClose = () => {
    setName("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    onOpenChange(false);
  };

  return (
    <ResponsiveModal open={open} onOpenChange={handleClose}>
      <ResponsiveModalContent>
        <ResponsiveModalHeader>
          <ResponsiveModalTitle className="text-sm flex items-center gap-2">
            <UserPlus className="h-4 w-4" />
            Create Admin Account
          </ResponsiveModalTitle>
          <ResponsiveModalDescription className="text-xs">
            Add a new administrator to the system
          </ResponsiveModalDescription>
        </ResponsiveModalHeader>
        <form
          onSubmit={handleSubmit}
          className="flex flex-col flex-1 overflow-hidden"
        >
          <div className="flex-1 overflow-y-auto">
            <div className="grid gap-3 px-4 py-2">
              <div className="grid gap-1.5">
                <Label htmlFor="create-name" className="text-xs">
                  Full Name
                </Label>
                <Input
                  id="create-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  className="h-8 text-xs"
                  required
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="create-email" className="text-xs">
                  Email Address
                </Label>
                <Input
                  id="create-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@uniride.ng"
                  className="h-8 text-xs"
                  required
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="create-password" className="text-xs">
                  Password
                </Label>
                <Input
                  id="create-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="h-8 text-xs"
                  required
                  minLength={6}
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="create-confirm" className="text-xs">
                  Confirm Password
                </Label>
                <Input
                  id="create-confirm"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="h-8 text-xs"
                  required
                  minLength={6}
                />
                {password && confirmPassword && !passwordsMatch && (
                  <p className="text-[10px] text-destructive">
                    Passwords do not match
                  </p>
                )}
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-2 px-4 pb-4 pt-2 shrink-0">
            <Button
              type="submit"
              size="sm"
              className="text-xs w-full"
              disabled={!isValid || isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Admin"
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="text-xs w-full"
              disabled={isLoading}
              onClick={handleClose}
            >
              Cancel
            </Button>
          </div>
        </form>
      </ResponsiveModalContent>
    </ResponsiveModal>
  );
}
