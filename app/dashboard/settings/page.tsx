"use client";

import { useCallback, useEffect, useState } from "react";
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
import { Checkbox } from "@/components/ui/checkbox";
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
  Database,
  Globe,
  Plus,
  Edit,
  ToggleLeft,
} from "lucide-react";

import { toast } from "sonner";

/* ─── Device icon helper ─── */
function DeviceIcon({ type, className }: { type: string; className?: string }) {
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

const API_URL = process.env.NEXT_PUBLIC_API_URL;

function getAuthToken(): string {
  const token = localStorage.getItem("auth-storage");
  if (!token) throw new Error("No authentication token found");
  const authData = JSON.parse(token);
  if (!authData.state?.token) throw new Error("No authentication token found");
  return authData.state.token;
}

async function authFetch(url: string, options: RequestInit = {}) {
  const token = getAuthToken();
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Request failed");
  return data;
}

/* ─── Device Tab ─── */
function DevicesTab() {
  const {
    devices,
    maxDevices,
    isLoading,
    getDevices,
    removeDevice,
    logoutAllDevices,
  } = useDeviceStore();
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
                          <Badge
                            variant="default"
                            className="text-[10px] px-1.5 py-0"
                          >
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
                          },
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
    Object.fromEntries(NOTIFICATION_PREFS.map((p) => [p.id, true])),
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

/* ─── Audit Data Tab (Super Admin only) ─── */
interface AuditSummary {
  support_tickets: number;
  admin_notifications: number;
  user_notifications: number;
  broadcasts: number;
  bookings: number;
  rides: number;
  locations: number;
}

const AUDIT_TARGETS = [
  { id: "support_tickets", label: "Closed Support Tickets", icon: "🎫" },
  { id: "notifications", label: "Notifications", icon: "🔔" },
  { id: "broadcasts", label: "Broadcast Messages", icon: "📢" },
  { id: "bookings", label: "Completed/Cancelled Bookings", icon: "📋" },
  { id: "ride_history", label: "Completed/Cancelled Rides", icon: "🚗" },
  { id: "locations", label: "Campus Locations", icon: "📍" },
] as const;

function AuditTab() {
  const [summary, setSummary] = useState<AuditSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [beforeDate, setBeforeDate] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);

  const fetchSummary = useCallback(async () => {
    setLoading(true);
    try {
      const data = await authFetch(`${API_URL}/api/admin/audit/summary`);
      setSummary(data.data);
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : "Failed to load summary",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  const toggleTarget = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id],
    );
  };

  const handleClear = async () => {
    if (selected.length === 0) return;
    setClearing(true);
    try {
      const body: { targets: string[]; before_date?: string } = {
        targets: selected,
      };
      if (beforeDate) body.before_date = beforeDate;
      const data = await authFetch(`${API_URL}/api/admin/audit/clear`, {
        method: "POST",
        body: JSON.stringify(body),
      });
      toast.success("Audit data cleared successfully");
      setSelected([]);
      setBeforeDate("");
      setConfirmOpen(false);
      await fetchSummary();
      console.log("Cleared:", data.data);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to clear data");
    } finally {
      setClearing(false);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Database className="h-4 w-4" />
            Audit Data Management
          </CardTitle>
          <CardDescription className="text-xs">
            Clear historical data at end of month. Only closed/completed records
            are removed.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading && !summary ? (
            <div className="flex items-center justify-center py-8 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              <span className="text-xs">Loading summary…</span>
            </div>
          ) : summary ? (
            <>
              {/* Data summary */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="text-lg font-bold">{summary.support_tickets}</p>
                  <p className="text-[10px] text-muted-foreground">
                    Closed Tickets
                  </p>
                </div>
                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="text-lg font-bold">
                    {summary.admin_notifications + summary.user_notifications}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    Notifications
                  </p>
                </div>
                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="text-lg font-bold">{summary.broadcasts}</p>
                  <p className="text-[10px] text-muted-foreground">
                    Broadcasts
                  </p>
                </div>
                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="text-lg font-bold">{summary.bookings}</p>
                  <p className="text-[10px] text-muted-foreground">
                    Completed Bookings
                  </p>
                </div>
                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="text-lg font-bold">{summary.rides}</p>
                  <p className="text-[10px] text-muted-foreground">
                    Completed Rides
                  </p>
                </div>
                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="text-lg font-bold">{summary.locations}</p>
                  <p className="text-[10px] text-muted-foreground">
                    Campus Locations
                  </p>
                </div>
              </div>

              <Separator />

              {/* Target selection */}
              <div>
                <Label className="text-xs font-medium mb-2 block">
                  Select data to clear
                </Label>
                <div className="space-y-2">
                  {AUDIT_TARGETS.map((target) => (
                    <label
                      key={target.id}
                      className="flex items-center gap-3 p-2.5 border rounded-lg cursor-pointer hover:bg-muted/30 transition-colors"
                    >
                      <Checkbox
                        checked={selected.includes(target.id)}
                        onCheckedChange={() => toggleTarget(target.id)}
                      />
                      <span className="text-sm">{target.icon}</span>
                      <span className="text-xs font-medium">
                        {target.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Date filter */}
              <div className="space-y-2">
                <Label className="text-xs">
                  Clear records before date (optional)
                </Label>
                <Input
                  type="date"
                  value={beforeDate}
                  onChange={(e) => setBeforeDate(e.target.value)}
                  className="h-8 text-xs w-48"
                />
              </div>

              <Button
                variant="destructive"
                size="sm"
                className="text-xs"
                disabled={selected.length === 0 || clearing}
                onClick={() => setConfirmOpen(true)}
              >
                <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                Clear Selected Data
              </Button>
            </>
          ) : null}
        </CardContent>
      </Card>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-sm">
              Confirm Data Clearing
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs">
              This will permanently delete the following data:{" "}
              <strong>{selected.join(", ").replace(/_/g, " ")}</strong>
              {beforeDate && ` created before ${beforeDate}`}. This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="text-xs" disabled={clearing}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="text-xs bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleClear}
              disabled={clearing}
            >
              {clearing ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
              ) : (
                <Trash2 className="h-3.5 w-3.5 mr-1.5" />
              )}
              Clear Permanently
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

/* ─── Language Management Tab (Super Admin only) ─── */
interface LanguageItem {
  _id: string;
  code: string;
  name: string;
  native_name: string;
  is_active: boolean;
  is_default: boolean;
}

function LanguagesTab() {
  const [languages, setLanguages] = useState<LanguageItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [newCode, setNewCode] = useState("");
  const [newName, setNewName] = useState("");
  const [newNative, setNewNative] = useState("");

  const fetchLanguages = useCallback(async () => {
    setLoading(true);
    try {
      const data = await authFetch(`${API_URL}/api/admin/languages`);
      setLanguages(data.data);
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : "Failed to load languages",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLanguages();
  }, [fetchLanguages]);

  const handleAdd = async () => {
    if (!newCode || !newName) return;
    setSaving(true);
    try {
      await authFetch(`${API_URL}/api/admin/languages`, {
        method: "POST",
        body: JSON.stringify({
          code: newCode,
          name: newName,
          native_name: newNative || newName,
        }),
      });
      toast.success("Language added");
      setNewCode("");
      setNewName("");
      setNewNative("");
      setShowAdd(false);
      await fetchLanguages();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to add");
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (lang: LanguageItem) => {
    if (lang.is_default) return;
    try {
      await authFetch(`${API_URL}/api/admin/languages/${lang._id}`, {
        method: "PATCH",
        body: JSON.stringify({ is_active: !lang.is_active }),
      });
      setLanguages((prev) =>
        prev.map((l) =>
          l._id === lang._id ? { ...l, is_active: !l.is_active } : l,
        ),
      );
      toast.success(`${lang.name} ${lang.is_active ? "disabled" : "enabled"}`);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to update");
    }
  };

  const handleDelete = async (lang: LanguageItem) => {
    if (lang.is_default) return;
    try {
      await authFetch(`${API_URL}/api/admin/languages/${lang._id}`, {
        method: "DELETE",
      });
      toast.success(`${lang.name} deleted`);
      await fetchLanguages();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to delete");
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <div className="space-y-1">
          <CardTitle className="text-sm flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Language Management
          </CardTitle>
          <CardDescription className="text-xs">
            Manage supported languages for the platform
          </CardDescription>
        </div>
        <Button
          size="sm"
          className="text-xs"
          onClick={() => setShowAdd(!showAdd)}
        >
          <Plus className="h-3.5 w-3.5 mr-1" />
          Add Language
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {showAdd && (
          <div className="p-3 border rounded-lg space-y-3 bg-muted/30">
            <div className="grid grid-cols-3 gap-2">
              <div className="space-y-1">
                <Label className="text-[10px]">Code</Label>
                <Input
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value)}
                  placeholder="e.g. fr"
                  className="h-7 text-xs"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-[10px]">Name</Label>
                <Input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. French"
                  className="h-7 text-xs"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-[10px]">Native Name</Label>
                <Input
                  value={newNative}
                  onChange={(e) => setNewNative(e.target.value)}
                  placeholder="e.g. Français"
                  className="h-7 text-xs"
                />
              </div>
            </div>
            <Button
              size="sm"
              className="text-xs"
              onClick={handleAdd}
              disabled={saving || !newCode || !newName}
            >
              {saving && <Loader2 className="h-3 w-3 animate-spin mr-1" />}
              Save
            </Button>
          </div>
        )}

        {loading && languages.length === 0 ? (
          <div className="flex items-center justify-center py-8 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            <span className="text-xs">Loading languages…</span>
          </div>
        ) : (
          <div className="space-y-2">
            {languages.map((lang) => (
              <div
                key={lang._id}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <Badge
                    variant={lang.is_active ? "default" : "secondary"}
                    className="text-[10px] font-mono w-8 justify-center"
                  >
                    {lang.code}
                  </Badge>
                  <div>
                    <p className="text-xs font-medium">
                      {lang.name}
                      {lang.native_name && lang.native_name !== lang.name && (
                        <span className="text-muted-foreground ml-1">
                          ({lang.native_name})
                        </span>
                      )}
                    </p>
                    {lang.is_default && (
                      <Badge
                        variant="outline"
                        className="text-[9px] mt-0.5 border-green-200 text-green-600"
                      >
                        Default
                      </Badge>
                    )}
                  </div>
                </div>
                {!lang.is_default && (
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => handleToggle(lang)}
                      title={lang.is_active ? "Disable" : "Enable"}
                    >
                      <ToggleLeft
                        className={`h-3.5 w-3.5 ${lang.is_active ? "text-green-500" : "text-muted-foreground"}`}
                      />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive"
                      onClick={() => handleDelete(lang)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/* ─── Platform Tab ─── */
function PlatformTab() {
  const [settings, setSettings] = useState<Record<string, unknown> | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      const data = await authFetch(`${API_URL}/api/platform-settings/admin`);
      setSettings(data.data);
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : "Failed to load settings",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleSave = async () => {
    if (!settings) return;
    try {
      setSaving(true);
      await authFetch(`${API_URL}/api/platform-settings`, {
        method: "PATCH",
        body: JSON.stringify(settings),
      });
      toast.success("Platform settings updated");
      fetchSettings();
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : "Failed to save settings",
      );
    } finally {
      setSaving(false);
    }
  };

  const updateField = (key: string, value: unknown) => {
    setSettings((prev) => (prev ? { ...prev, [key]: value } : prev));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="text-center py-12 text-sm text-muted-foreground">
        Failed to load platform settings
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Map Provider */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Map Provider
          </CardTitle>
          <CardDescription className="text-xs">
            Choose which map provider mobile apps use. Expo Maps is a fallback
            for Expo Go development.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div
              className={`relative rounded-lg border-2 p-4 cursor-pointer transition-colors ${
                settings.map_provider === "mapbox"
                  ? "border-primary bg-primary/5"
                  : "border-muted hover:border-muted-foreground/30"
              }`}
              onClick={() => updateField("map_provider", "mapbox")}
            >
              <div className="flex items-center gap-2 mb-1">
                <div className="h-6 w-6 rounded bg-blue-500 flex items-center justify-center">
                  <span className="text-white text-[10px] font-bold">MB</span>
                </div>
                <span className="text-sm font-medium">Mapbox</span>
              </div>
              <p className="text-[10px] text-muted-foreground">
                Full-featured maps with custom styling. Requires standalone
                build.
              </p>
            </div>
            <div
              className={`relative rounded-lg border-2 p-4 cursor-pointer transition-colors ${
                settings.map_provider === "expo"
                  ? "border-primary bg-primary/5"
                  : "border-muted hover:border-muted-foreground/30"
              }`}
              onClick={() => updateField("map_provider", "expo")}
            >
              <div className="flex items-center gap-2 mb-1">
                <div className="h-6 w-6 rounded bg-green-500 flex items-center justify-center">
                  <span className="text-white text-[10px] font-bold">EX</span>
                </div>
                <span className="text-sm font-medium">Expo Maps</span>
              </div>
              <p className="text-[10px] text-muted-foreground">
                Works with Expo Go. Uses native Apple/Google maps.
              </p>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <Label className="text-xs">Enable Mapbox</Label>
            <Switch
              checked={!!settings.mapbox_enabled}
              onCheckedChange={(v) => updateField("mapbox_enabled", v)}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label className="text-xs">Enable Expo Maps</Label>
            <Switch
              checked={!!settings.expo_maps_enabled}
              onCheckedChange={(v) => updateField("expo_maps_enabled", v)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Ride & Booking Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <ToggleLeft className="h-4 w-4" />
            Ride & Booking
          </CardTitle>
          <CardDescription className="text-xs">
            Control ride and booking behavior across the platform
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-xs">Fare Per Seat</Label>
              <p className="text-[10px] text-muted-foreground">
                Multiply fare by number of seats booked
              </p>
            </div>
            <Switch
              checked={!!settings.fare_per_seat}
              onCheckedChange={(v) => updateField("fare_per_seat", v)}
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-xs">Auto Accept Bookings</Label>
              <p className="text-[10px] text-muted-foreground">
                Automatically accept ride requests
              </p>
            </div>
            <Switch
              checked={!!settings.auto_accept_bookings}
              onCheckedChange={(v) => updateField("auto_accept_bookings", v)}
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-xs">Allow Ride Without Driver</Label>
              <p className="text-[10px] text-muted-foreground">
                Let users create rides without assigned driver
              </p>
            </div>
            <Switch
              checked={!!settings.allow_ride_without_driver}
              onCheckedChange={(v) =>
                updateField("allow_ride_without_driver", v)
              }
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-xs">Max Seats Per Booking</Label>
              <p className="text-[10px] text-muted-foreground">
                Maximum seats a user can book at once
              </p>
            </div>
            <Input
              type="number"
              min={1}
              max={10}
              className="w-20 h-8 text-xs"
              value={settings.max_seats_per_booking as number}
              onChange={(e) =>
                updateField(
                  "max_seats_per_booking",
                  parseInt(e.target.value) || 1,
                )
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* System */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Shield className="h-4 w-4" />
            System
          </CardTitle>
          <CardDescription className="text-xs">
            Maintenance and version controls
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-xs">Maintenance Mode</Label>
              <p className="text-[10px] text-muted-foreground">
                Disable the platform for maintenance
              </p>
            </div>
            <Switch
              checked={!!settings.maintenance_mode}
              onCheckedChange={(v) => updateField("maintenance_mode", v)}
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-xs">Minimum App Version</Label>
              <p className="text-[10px] text-muted-foreground">
                Force users to update below this version
              </p>
            </div>
            <Input
              type="text"
              className="w-24 h-8 text-xs"
              value={(settings.app_version_minimum as string) ?? ""}
              onChange={(e) =>
                updateField("app_version_minimum", e.target.value)
              }
            />
          </div>
        </CardContent>
      </Card>

      <Button onClick={handleSave} disabled={saving} size="sm">
        {saving ? (
          <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
        ) : (
          <Save className="h-4 w-4 mr-1.5" />
        )}
        <span className="text-xs">Save Platform Settings</span>
      </Button>
    </div>
  );
}

/* ─── Settings Page ─── */
export default function SettingsPage() {
  const { user } = useAuthStore();
  const isSuperAdmin = user?.role === "super_admin";

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
          {isSuperAdmin && (
            <>
              <TabsTrigger value="audit" className="text-xs">
                <Database className="h-3.5 w-3.5" />
                Audit Data
              </TabsTrigger>
              <TabsTrigger value="languages" className="text-xs">
                <Globe className="h-3.5 w-3.5" />
                Languages
              </TabsTrigger>
              <TabsTrigger value="platform" className="text-xs">
                <ToggleLeft className="h-3.5 w-3.5" />
                Platform
              </TabsTrigger>
            </>
          )}
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
        {isSuperAdmin && (
          <>
            <TabsContent value="audit">
              <AuditTab />
            </TabsContent>
            <TabsContent value="languages">
              <LanguagesTab />
            </TabsContent>
            <TabsContent value="platform">
              <PlatformTab />
            </TabsContent>
          </>
        )}
      </Tabs>
    </div>
  );
}
