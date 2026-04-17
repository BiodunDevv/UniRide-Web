"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  LoadingState,
  PageHeader,
  SearchInput,
  StatsCard,
} from "@/components/shared";
import { useAdminStore, type AccountDeletionRequest } from "@/store/useAdminStore";
import { Clock3, Filter, Mail, ShieldCheck, Trash2 } from "lucide-react";

const statusOptions = [
  { value: "all", label: "All" },
  { value: "pending_review", label: "Pending review" },
  { value: "scheduled", label: "Scheduled" },
  { value: "rejected", label: "Rejected" },
  { value: "cancelled", label: "Cancelled" },
  { value: "completed", label: "Completed" },
];

const statusLabel = (status: string) => status.replaceAll("_", " ");

export default function AccountDeletionRequestsPage() {
  const {
    accountDeletionRequests,
    isLoading,
    getAccountDeletionRequests,
    getAccountDeletionRequestById,
    approveAccountDeletionRequest,
    rejectAccountDeletionRequest,
  } = useAdminStore();

  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRequest, setSelectedRequest] =
    useState<AccountDeletionRequest | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [rejectNote, setRejectNote] = useState("");

  useEffect(() => {
    getAccountDeletionRequests(statusFilter === "all" ? undefined : statusFilter);
  }, [getAccountDeletionRequests, statusFilter]);

  const filteredRequests = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return accountDeletionRequests.filter((request) => {
      if (!query) return true;
      return (
        request.name.toLowerCase().includes(query) ||
        request.email.toLowerCase().includes(query) ||
        request.role.toLowerCase().includes(query)
      );
    });
  }, [accountDeletionRequests, searchQuery]);

  const openDetails = async (request: AccountDeletionRequest) => {
    const detailed = await getAccountDeletionRequestById(request.id);
    setSelectedRequest(detailed);
    setRejectNote(detailed.review_note || "");
    setDialogOpen(true);
  };

  const handleApprove = async () => {
    if (!selectedRequest) return;
    setActionLoading(true);
    try {
      await approveAccountDeletionRequest(selectedRequest.id);
      await getAccountDeletionRequests(statusFilter === "all" ? undefined : statusFilter);
      const refreshed = await getAccountDeletionRequestById(selectedRequest.id);
      setSelectedRequest(refreshed);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selectedRequest) return;
    setActionLoading(true);
    try {
      await rejectAccountDeletionRequest(selectedRequest.id, rejectNote);
      await getAccountDeletionRequests(statusFilter === "all" ? undefined : statusFilter);
      const refreshed = await getAccountDeletionRequestById(selectedRequest.id);
      setSelectedRequest(refreshed);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
      <PageHeader
        title="Deletion Requests"
        description="Review, approve, and audit rider and driver account deletion requests."
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatsCard
          icon={Trash2}
          value={accountDeletionRequests.length}
          label="Visible Requests"
        />
        <StatsCard
          icon={Clock3}
          iconColor="text-amber-500"
          value={
            accountDeletionRequests.filter((item) => item.status === "pending_review")
              .length
          }
          label="Pending Review"
        />
        <StatsCard
          icon={ShieldCheck}
          iconColor="text-emerald-500"
          value={
            accountDeletionRequests.filter((item) => item.status === "scheduled")
              .length
          }
          label="Scheduled"
        />
        <StatsCard
          icon={Mail}
          iconColor="text-slate-500"
          value={
            accountDeletionRequests.filter((item) =>
              ["rejected", "cancelled", "completed"].includes(item.status),
            ).length
          }
          label="Closed"
        />
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <CardTitle className="text-sm">Account Deletion Queue</CardTitle>
              <CardDescription className="text-xs">
                Requests from riders and drivers are kept here until they are resolved.
              </CardDescription>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <SearchInput
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Search by name or email..."
              />
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <select
                  className="h-9 border border-input bg-background px-3 text-sm outline-none"
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value)}
                >
                  {statusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading && accountDeletionRequests.length === 0 ? (
            <LoadingState />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[820px] text-sm">
                <thead>
                  <tr className="border-b text-left text-xs text-muted-foreground">
                    <th className="py-3 pr-4 font-medium">Account</th>
                    <th className="py-3 pr-4 font-medium">Role</th>
                    <th className="py-3 pr-4 font-medium">Source</th>
                    <th className="py-3 pr-4 font-medium">Requested</th>
                    <th className="py-3 pr-4 font-medium">Status</th>
                    <th className="py-3 pr-4 font-medium">Scheduled Delete</th>
                    <th className="py-3 font-medium">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRequests.map((request) => (
                    <tr key={request.id} className="border-b last:border-b-0">
                      <td className="py-3 pr-4">
                        <div className="font-medium text-foreground">{request.name}</div>
                        <div className="text-xs text-muted-foreground">{request.email}</div>
                      </td>
                      <td className="py-3 pr-4 capitalize">{request.role}</td>
                      <td className="py-3 pr-4 capitalize">
                        {request.requested_via.replaceAll("_", " ")}
                      </td>
                      <td className="py-3 pr-4 text-muted-foreground">
                        {new Date(request.createdAt).toLocaleString()}
                      </td>
                      <td className="py-3 pr-4">
                        <Badge variant="outline" className="capitalize">
                          {statusLabel(request.status)}
                        </Badge>
                      </td>
                      <td className="py-3 pr-4 text-muted-foreground">
                        {request.scheduled_for
                          ? new Date(request.scheduled_for).toLocaleString()
                          : "Not scheduled"}
                      </td>
                      <td className="py-3">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => openDetails(request)}
                        >
                          View
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Deletion Request Details</DialogTitle>
            <DialogDescription>
              Review the request details before approving or rejecting it.
            </DialogDescription>
          </DialogHeader>

          {selectedRequest ? (
            <div className="space-y-5">
              <div className="grid gap-4 border border-border p-4 sm:grid-cols-2">
                <div>
                  <div className="text-xs text-muted-foreground">Name</div>
                  <div className="font-medium">{selectedRequest.name}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Email</div>
                  <div className="font-medium">{selectedRequest.email}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Role</div>
                  <div className="font-medium capitalize">{selectedRequest.role}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Status</div>
                  <div className="font-medium capitalize">
                    {statusLabel(selectedRequest.status)}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Requested via</div>
                  <div className="font-medium capitalize">
                    {selectedRequest.requested_via.replaceAll("_", " ")}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Requested at</div>
                  <div className="font-medium">
                    {new Date(selectedRequest.createdAt).toLocaleString()}
                  </div>
                </div>
                {selectedRequest.scheduled_for ? (
                  <div>
                    <div className="text-xs text-muted-foreground">Scheduled delete</div>
                    <div className="font-medium">
                      {new Date(selectedRequest.scheduled_for).toLocaleString()}
                    </div>
                  </div>
                ) : null}
                {selectedRequest.reviewed_at ? (
                  <div>
                    <div className="text-xs text-muted-foreground">Reviewed at</div>
                    <div className="font-medium">
                      {new Date(selectedRequest.reviewed_at).toLocaleString()}
                    </div>
                  </div>
                ) : null}
              </div>

              <div className="space-y-2">
                <div className="text-xs text-muted-foreground">Reason</div>
                <div className="border border-border bg-muted/20 p-3 text-sm">
                  {selectedRequest.request_reason || "No reason provided."}
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-xs text-muted-foreground">Rejection note</div>
                <Textarea
                  rows={4}
                  value={rejectNote}
                  disabled={selectedRequest.status !== "pending_review"}
                  onChange={(event) => setRejectNote(event.target.value)}
                  placeholder="Provide a clear reason if you reject this request."
                />
              </div>

              {selectedRequest.status === "pending_review" ? (
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleReject}
                    disabled={actionLoading || !rejectNote.trim()}
                  >
                    Reject request
                  </Button>
                  <Button
                    type="button"
                    onClick={handleApprove}
                    disabled={actionLoading}
                  >
                    Approve and schedule deletion
                  </Button>
                </DialogFooter>
              ) : (
                <div className="border border-border bg-muted/20 p-3 text-sm text-muted-foreground">
                  This request is read-only because it has already been resolved.
                </div>
              )}
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
