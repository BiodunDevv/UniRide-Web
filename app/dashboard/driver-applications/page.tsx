"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ApplicationsTable } from "@/components/tables/applications-table";
import { RejectApplicationModal } from "@/components/modals/application-modals";
import { Search, CheckCircle, XCircle, Clock, Loader2 } from "lucide-react";
import { useAdminStore } from "@/store/useAdminStore";
import type { DriverApplication } from "@/store/useAdminStore";

export default function DriverApplicationsPage() {
  const {
    applications,
    isLoading,
    getAllApplications,
    approveDriver,
    rejectDriver,
  } = useAdminStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedApp, setSelectedApp] = useState<DriverApplication | null>(
    null,
  );
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    getAllApplications();
  }, [getAllApplications]);

  const filteredApplications = useMemo(
    () =>
      applications.filter((app) => {
        const matchesSearch =
          app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          app.email.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus =
          statusFilter === "all" || app.status === statusFilter;
        return matchesSearch && matchesStatus;
      }),
    [applications, searchQuery, statusFilter],
  );

  const handleApprove = async (app: DriverApplication) => {
    setActionLoading(true);
    try {
      await approveDriver(app._id);
      await getAllApplications();
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (reason: string) => {
    if (!selectedApp) return;
    setActionLoading(true);
    try {
      await rejectDriver(selectedApp._id, reason);
      setShowRejectModal(false);
      setSelectedApp(null);
      await getAllApplications();
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
      <div>
        <h2 className="text-lg font-semibold">Driver Applications</h2>
        <p className="text-xs text-muted-foreground">
          Review and manage driver applications
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-yellow-500" />
              <div>
                <p className="text-lg font-bold">
                  {applications.filter((a) => a.status === "pending").length}
                </p>
                <p className="text-[10px] text-muted-foreground">Pending</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <div>
                <p className="text-lg font-bold">
                  {applications.filter((a) => a.status === "approved").length}
                </p>
                <p className="text-[10px] text-muted-foreground">Approved</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <XCircle className="h-4 w-4 text-destructive" />
              <div>
                <p className="text-lg font-bold">
                  {applications.filter((a) => a.status === "rejected").length}
                </p>
                <p className="text-[10px] text-muted-foreground">Rejected</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-sm">Applications</CardTitle>
              <CardDescription className="text-xs">
                {filteredApplications.length} application
                {filteredApplications.length !== 1 ? "s" : ""}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative w-48">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-8 text-xs"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32 h-8 text-xs">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all" className="text-xs">
                    All
                  </SelectItem>
                  <SelectItem value="pending" className="text-xs">
                    Pending
                  </SelectItem>
                  <SelectItem value="approved" className="text-xs">
                    Approved
                  </SelectItem>
                  <SelectItem value="rejected" className="text-xs">
                    Rejected
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading && applications.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <ApplicationsTable
              applications={filteredApplications}
              onApprove={handleApprove}
              onReject={(app) => {
                setSelectedApp(app);
                setShowRejectModal(true);
              }}
            />
          )}
        </CardContent>
      </Card>

      {selectedApp && (
        <RejectApplicationModal
          open={showRejectModal}
          onOpenChange={(open) => {
            setShowRejectModal(open);
            if (!open) setSelectedApp(null);
          }}
          applicantName={selectedApp.name}
          onConfirm={handleReject}
          isLoading={actionLoading}
        />
      )}
    </div>
  );
}
