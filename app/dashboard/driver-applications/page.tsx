"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ApplicationsTable } from "@/components/tables/applications-table";
import { RejectApplicationModal } from "@/components/modals/application-modals";
import {
  StatsCard,
  PageHeader,
  SearchInput,
  StatusFilter,
  LoadingState,
} from "@/components/shared";
import { CheckCircle, XCircle, Clock } from "lucide-react";
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
      <PageHeader
        title="Driver Applications"
        description="Review and manage driver applications"
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        <StatsCard
          icon={Clock}
          iconColor="text-yellow-500"
          value={applications.filter((a) => a.status === "pending").length}
          label="Pending"
        />
        <StatsCard
          icon={CheckCircle}
          iconColor="text-green-500"
          value={applications.filter((a) => a.status === "approved").length}
          label="Approved"
        />
        <StatsCard
          icon={XCircle}
          iconColor="text-destructive"
          value={applications.filter((a) => a.status === "rejected").length}
          label="Rejected"
        />
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
              <SearchInput
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Search..."
                className="w-48"
              />
              <StatusFilter
                value={statusFilter}
                onChange={setStatusFilter}
                options={[
                  { label: "All", value: "all" },
                  { label: "Pending", value: "pending" },
                  { label: "Approved", value: "approved" },
                  { label: "Rejected", value: "rejected" },
                ]}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading && applications.length === 0 ? (
            <LoadingState />
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
