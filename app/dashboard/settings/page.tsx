"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/shared";
import { useAuthStore } from "@/store/useAuthStore";
import { useDeviceStore } from "@/store/useDeviceStore";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Monitor,
  Smartphone,
  Tablet,
  HelpCircle,
  Trash2,
  LogOut,
  Shield,
  User,
  Bell,
  Save,
  Loader2,
  Laptop,
} from "lucide-react";

import { toast } from "sonner";

/* ─── Device icon helper ─── */
function DeviceIcon({
  type,
  className,
}: {
  type: string;
  className?: string;
}) {
  const cls = className ?? "h-5 w-5";
  switch (type) {
    case "mobile":
      return <Smartphone className={cls} />;
    case "tablet":
      return <Tablet className={cls} />;
    case "desktop":
      return <Monitor className={cls} />;
    default:
      return <HelpCircle className={cls} />;
  }
}

/* ─── Device Tab ─── */
function DevicesTab() {
  const { devices, maxDevices, isLoading, getDevices, removeDevice, logoutAllDevices } =
    useDeviceStore();
  const { device_id } = useAuthStore();

  const [removeTarget, setRemoveTarget] = useState<string | null>(null);
  const [showLogoutAll, setShowLogoutAll] = useState(false);

  useEffect(() => {
    getDevices().catch(() => {});
  }, [getDevices]);

  const handleRemove = async () => {
    if (!removeTarget) return;
    try {
      await removeDevice(removeTarget);
      setRemoveTarget(null);
    } catch {
      /* handled in store */
    }
  };

  const handleLogoutAll = async () => {
    try {
      await logoutAllDevices(true, device_id || "");
      setShowLogoutAll(false);
    } catch {
      /* handled in store */
    }
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div className="space-y-1">
            <CardTitle className="text-sm flex items-center gap-2">
              <Laptop className="h-4 w-4" />
              Active Sessions
            </CardTitle>
            <CardDescription className="text-xs">
              {devices.length} of {maxDevices} devices connected
            </CardDescription>
          </div>
          {devices.length > 1 && (
            <Button
              variant="destructive"
              size="sm"
              className="text-xs"
              onClick={() => setShowLogoutAll(true)}
              disabled={isLoading}
            >
              <LogOut className="h-3.5 w-3.5 mr-1.5" />
              Logout Other Devices
            </Button>
          )}
        </CardHeader>
        <CardContent className="space-y-3">
          {isLoading && devices.length === 0 ? (
            <div className="flex items-center justify-center py-8 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              <span className="text-xs">Loading devices…</span>
            </div>
          ) : devices.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-8">
              No active sessions found
            </p>
          ) : (
            devices.map((device) => {
              const isCurrent = device.device_id === device_id;
              return (
                <div
                  key={device.device_id}
                  className="flex items-center justify-between gap-3 p-3 border"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-9 w-9 shrink-0 bg-muted flex items-center justify-center">
                      <DeviceIcon
                        type={device.device_type}
                        className="h-4 w-4 text-muted-foreground"
                      />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-medium truncate">
                          {device.device_name}
                        </p>
                        {isCurrent && (
                          <Badge variant="default" className="text-[10px] px-1.5 py-0">
                            This device
                          </Badge>
                        )}
                      </div>
                      <p className="text-[10px] text-muted-foreground">
                        Last active{" "}
                        {new Date(device.last_login).toLocaleDateString(
                          undefined,
                          {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}
                        {device.ip_address && ` · ${device.ip_address}`}
                      </p>
                    </div>
                  </div>
                  {!isCurrent && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="shrink-0 text-muted-foreground hover:text-destructive h-8 w-8"
                      onClick={() => setRemoveTarget(device.device_id)}
                      disabled={isLoading}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              );
            })
          )}
        </CardContent>
      </Card>

      {/* Remove device dialog */}
      <AlertDialog
        open={!!removeTarget}
        onOpenChange={(open) => !open && setRemoveTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-sm">
              Remove Device
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs">
              This will log out the selected device. The user will need to sign
              in again on that device.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="text-xs" disabled={isLoading}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="text-xs"
              onClick={handleRemove}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
              ) : (
                <Trash2 className="h-3.5 w-3.5 mr-1.5" />
              )}
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Logout all dialog */}
      <AlertDialog open={showLogoutAll} onOpenChange={setShowLogoutAll}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-sm">
              Logout Other Devices
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs">
              All other devices will be logged out. Only this current session
              will remain active.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="text-xs" disabled={isLoading}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="text-xs bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleLogoutAll}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
              ) : (
                <LogOut className="h-3.5 w-3.5 mr-1.5" />
              )}
              Logout All
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

/* ─── Profile Tab ─── */
function ProfileTab() {
  const { user } = useAuthStore();

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
            defaultValue={
              user?.role === "super_admin" ? "Super Admin" : "Admin"
            }
            className="h-8 text-xs"
            disabled
          />
        </div>
        <Button size="sm" className="text-xs">
          <Save className="h-3.5 w-3.5 mr-1.5" />
          Save Profile
        </Button>
      </CardContent>
    </Card>
  );
}

/* ─── Security Tab ─── */
function SecurityTab() {
  const { changePassword, isLoading } = useAuthStore();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword) {
      toast.error("Please fill in all password fields");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }
    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    try {
      await changePassword(currentPassword, newPassword);
      toast.success("Password updated successfully");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch {
      /* handled in store */
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          <Shield className="h-4 w-4" />
          Change Password
        </CardTitle>
        <CardDescription className="text-xs">
          Update your account password
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label className="text-xs">Current Password</Label>
          <Input
            type="password"
            className="h-8 text-xs"
            placeholder="Enter current password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label className="text-xs">New Password</Label>
          <Input
            type="password"
            className="h-8 text-xs"
            placeholder="Enter new password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label className="text-xs">Confirm New Password</Label>
          <Input
            type="password"
            className="h-8 text-xs"
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>
        <Button
          size="sm"
          variant="outline"
          className="text-xs"
          onClick={handleChangePassword}
          disabled={isLoading}
        >
          {isLoading && <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />}
          Update Password
        </Button>
      </CardContent>
    </Card>
  );
}

/* ─── Notifications Tab ─── */
const NOTIFICATION_PREFS = [
  {
    id: "email",
    label: "Email Notifications",
    desc: "Receive updates via email",
  },
  {
    id: "push",
    label: "Push Notifications",
    desc: "Browser push notifications",
  },
  {
    id: "applications",
    label: "New Driver Applications",
    desc: "Alert for new applications",
  },
  {
    id: "tickets",
    label: "Support Tickets",
    desc: "Alert for new support tickets",
  },
  {
    id: "bookings",
    label: "Booking Alerts",
    desc: "Alert for cancelled or flagged bookings",
  },
];

function NotificationsTab() {
  const [prefs, setPrefs] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(NOTIFICATION_PREFS.map((p) => [p.id, true]))
  );

  const toggle = (id: string) =>
    setPrefs((prev) => ({ ...prev, [id]: !prev[id] }));

  return (
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
      <CardContent className="space-y-1">
        {NOTIFICATION_PREFS.map((item, idx) => (
          <div key={item.id}>
            <div className="flex items-center justify-between py-2.5">
              <div>
                <p className="text-xs font-medium">{item.label}</p>
                <p className="text-[10px] text-muted-foreground">{item.desc}</p>
              </div>
              <Switch
                size="sm"
                checked={prefs[item.id]}
                onCheckedChange={() => toggle(item.id)}
              />
            </div>
            {idx < NOTIFICATION_PREFS.length - 1 && <Separator />}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

/* ─── Settings Page ─── */
export default function SettingsPage() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
      <PageHeader
        title="Settings"
        description="Manage your account, sessions, and platform preferences"
      />

      <Tabs defaultValue="devices" className="gap-4">
        <TabsList variant="line" className="w-full justify-start border-b">
          <TabsTrigger value="devices" className="text-xs">
            <Laptop className="h-3.5 w-3.5" />
            Devices
          </TabsTrigger>
          <TabsTrigger value="profile" className="text-xs">
            <User className="h-3.5 w-3.5" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="security" className="text-xs">
            <Shield className="h-3.5 w-3.5" />
            Security
          </TabsTrigger>
          <TabsTrigger value="notifications" className="text-xs">
            <Bell className="h-3.5 w-3.5" />
            Notifications
          </TabsTrigger>
          
        </TabsList>

        <TabsContent value="devices">
          <DevicesTab />
        </TabsContent>
        <TabsContent value="profile">
          <ProfileTab />
        </TabsContent>
        <TabsContent value="security">
          <SecurityTab />
        </TabsContent>
        <TabsContent value="notifications">
          <NotificationsTab />
        </TabsContent>
       
      </Tabs>
    </div>
  );
}
