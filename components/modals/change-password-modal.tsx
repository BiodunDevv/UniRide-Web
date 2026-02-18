"use client";

import { useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  Loader2,
  AlertCircle,
  KeyRound,
} from "lucide-react";
import { toast } from "sonner";

interface ChangePasswordModalProps {
  open: boolean;
  onSuccess: () => void;
}

export function ChangePasswordModal({
  open,
  onSuccess,
}: ChangePasswordModalProps) {
  const { changePassword, isLoading } = useAuthStore();

  const [currentPassword, setCurrentPassword] = useState("123456789");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [localError, setLocalError] = useState("");

  const passwordsMatch = newPassword === confirmPassword;
  const isLongEnough = newPassword.length >= 8;
  const hasUppercase = /[A-Z]/.test(newPassword);
  const hasLowercase = /[a-z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  const hasSpecial = /[^A-Za-z0-9]/.test(newPassword);
  const isStrong =
    isLongEnough && hasUppercase && hasLowercase && hasNumber && hasSpecial;

  const canSubmit =
    currentPassword &&
    newPassword &&
    confirmPassword &&
    passwordsMatch &&
    isStrong &&
    !isLoading;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError("");

    if (!passwordsMatch) {
      setLocalError("Passwords do not match");
      return;
    }

    if (!isStrong) {
      setLocalError("Password does not meet all requirements");
      return;
    }

    try {
      await changePassword(currentPassword, newPassword);
      toast.success("Password changed successfully!", {
        description: "You can now use your new password to sign in.",
      });
      onSuccess();
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Failed to change password";
      setLocalError(msg);
    }
  };

  const strengthChecks = [
    { label: "At least 8 characters", met: isLongEnough },
    { label: "Uppercase letter (A-Z)", met: hasUppercase },
    { label: "Lowercase letter (a-z)", met: hasLowercase },
    { label: "Number (0-9)", met: hasNumber },
    { label: "Special character (!@#$...)", met: hasSpecial },
  ];

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent
        showCloseButton={false}
        className="sm:max-w-md"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="flex h-9 w-9 items-center justify-center bg-primary/10">
              <KeyRound className="h-4.5 w-4.5 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-base font-semibold">
                Change Your Password
              </DialogTitle>
              <DialogDescription>
                For security, please set a new password before continuing.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <Alert className="border-amber-200 bg-amber-50">
          <ShieldCheck className="size-4 text-amber-700" />
          <AlertDescription className="text-amber-800 text-xs">
            This is your first sign in. You must change your default password to
            continue using the admin portal.
          </AlertDescription>
        </Alert>

        {localError && (
          <Alert variant="destructive">
            <AlertCircle className="size-4" />
            <AlertDescription className="text-xs">
              {localError}
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Current Password */}
          <div className="space-y-1.5">
            <Label htmlFor="current-pw" className="text-xs font-medium">
              Current Password
            </Label>
            <div className="relative">
              <Lock className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
              <Input
                id="current-pw"
                type={showCurrentPassword ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
                className="pl-8 pr-9"
                autoFocus
                required
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                tabIndex={-1}
              >
                {showCurrentPassword ? (
                  <EyeOff className="h-3.5 w-3.5" />
                ) : (
                  <Eye className="h-3.5 w-3.5" />
                )}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div className="space-y-1.5">
            <Label htmlFor="new-pw" className="text-xs font-medium">
              New Password
            </Label>
            <div className="relative">
              <Lock className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
              <Input
                id="new-pw"
                type={showNewPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                className="pl-8 pr-9"
                required
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                tabIndex={-1}
              >
                {showNewPassword ? (
                  <EyeOff className="h-3.5 w-3.5" />
                ) : (
                  <Eye className="h-3.5 w-3.5" />
                )}
              </button>
            </div>
          </div>

          {/* Password Strength Checks */}
          {newPassword && (
            <div className="border bg-muted/30 p-3 space-y-1.5">
              <p className="text-xs font-medium text-foreground mb-2">
                Password requirements
              </p>
              {strengthChecks.map((check) => (
                <div
                  key={check.label}
                  className="flex items-center gap-2 text-xs"
                >
                  <div
                    className={`h-1.5 w-1.5 shrink-0 ${
                      check.met ? "bg-green-500" : "bg-muted-foreground/30"
                    }`}
                  />
                  <span
                    className={
                      check.met ? "text-green-700" : "text-muted-foreground"
                    }
                  >
                    {check.label}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Confirm Password */}
          <div className="space-y-1.5">
            <Label htmlFor="confirm-pw" className="text-xs font-medium">
              Confirm New Password
            </Label>
            <div className="relative">
              <Lock className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
              <Input
                id="confirm-pw"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                className={`pl-8 pr-9 ${
                  confirmPassword && !passwordsMatch
                    ? "border-destructive focus-visible:ring-destructive"
                    : ""
                }`}
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                tabIndex={-1}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-3.5 w-3.5" />
                ) : (
                  <Eye className="h-3.5 w-3.5" />
                )}
              </button>
            </div>
            {confirmPassword && !passwordsMatch && (
              <p className="text-xs text-destructive">Passwords do not match</p>
            )}
          </div>

          <DialogFooter className="pt-2">
            <Button type="submit" className="w-full" disabled={!canSubmit}>
              {isLoading ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                  Updating Password...
                </>
              ) : (
                <>
                  <ShieldCheck className="h-3.5 w-3.5 mr-1.5" />
                  Update Password
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
