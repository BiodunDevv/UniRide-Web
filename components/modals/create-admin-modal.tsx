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
import { Loader2, UserPlus, Info } from "lucide-react";

const DEFAULT_PASSWORD = "123456789";

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

  const isValid = name.trim() && email.trim();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;

    await onSubmit({
      name: name.trim(),
      email: email.trim(),
      password: DEFAULT_PASSWORD,
    });
    setName("");
    setEmail("");
  };

  const handleClose = () => {
    setName("");
    setEmail("");
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
          <div className="flex-1 min-h-0 overflow-y-auto">
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

              {/* Default password notice */}
              <div className="flex items-start gap-2 rounded-md bg-muted/60 px-3 py-2.5">
                <Info className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <p className="text-[11px] font-medium text-foreground">
                    Default password:{" "}
                    <span className="font-mono tracking-wider">
                      {DEFAULT_PASSWORD}
                    </span>
                  </p>
                  <p className="text-[10px] text-muted-foreground leading-relaxed">
                    The admin will be prompted to change their password on first
                    login.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-col-reverse sm:flex-row gap-2 px-4 pb-4 pt-2 shrink-0 border-t sm:justify-end">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="text-xs w-full sm:w-auto"
              disabled={isLoading}
              onClick={handleClose}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              className="text-xs w-full sm:w-auto"
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
          </div>
        </form>
      </ResponsiveModalContent>
    </ResponsiveModal>
  );
}
