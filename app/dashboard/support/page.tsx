"use client";

import { useCallback, useEffect, useMemo, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useChatStore } from "@/store/useChatStore";
import { useAuthStore } from "@/store/useAuthStore";
import { PageHeader, StatsCard } from "@/components/shared";
import { TicketList } from "@/components/support/ticket-list";
import {
  TicketDetail,
  TicketDetailEmpty,
} from "@/components/support/ticket-detail";
import { UpdatePriorityDialog } from "@/components/support/update-priority-dialog";
import { STATUS_OPTIONS } from "@/components/support/ticket-helpers";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  X,
  MessageSquare,
  Clock,
  CheckCircle2,
  AlertCircle,
  Inbox,
  ShieldCheck,
  RefreshCw,
} from "lucide-react";

type TabType = "available" | "my-tickets" | "all";

function SupportContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuthStore();
  const {
    tickets,
    availableTickets,
    myTickets,
    currentTicket,
    isLoading,
    error,
    processingTicketId,
    getAllTickets,
    getAvailableTickets,
    getMyAssignedTickets,
    getTicketById,
    acceptTicket,
    declineTicket,
    addMessage,
    resolveTicket,
    closeTicket,
    updatePriority,
    clearError,
    setCurrentTicket,
  } = useChatStore();

  const isSuperAdmin = user?.role === "super_admin";

  const initialTab = useMemo<TabType>(() => {
    const tab = searchParams.get("tab");
    if (tab === "all" || tab === "available" || tab === "my-tickets")
      return tab;
    return "available";
  }, [searchParams]);

  const [activeTab, setActiveTab] = useState<TabType>(initialTab);
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [priorityModal, setPriorityModal] = useState<{
    open: boolean;
    ticketId: string;
    current: string;
  }>({ open: false, ticketId: "", current: "" });

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setCurrentTicket(null);
    setStatusFilter("all");
    setPriorityFilter("all");
    router.push(`/dashboard/support?tab=${tab}`, { scroll: false });
  };

  // Load tickets based on active tab
  const loadTickets = useCallback(async () => {
    try {
      const pf = priorityFilter !== "all" ? priorityFilter : undefined;
      const sf = statusFilter !== "all" ? statusFilter : undefined;

      if (activeTab === "available") {
        await getAvailableTickets(pf);
      } else if (activeTab === "my-tickets") {
        await getMyAssignedTickets(sf, pf);
      } else {
        // "all" tab
        await getAllTickets(sf, pf);
      }
    } catch {
      // errors handled in store via toast
    }
  }, [
    activeTab,
    statusFilter,
    priorityFilter,
    getAvailableTickets,
    getMyAssignedTickets,
    getAllTickets,
  ]);

  useEffect(() => {
    loadTickets();
  }, [loadTickets]);

  // Also load available count on mount for badge
  useEffect(() => {
    getAvailableTickets().catch(() => {});
    getMyAssignedTickets().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Display tickets based on active tab
  const displayTickets = useMemo(() => {
    if (activeTab === "available") return availableTickets;
    if (activeTab === "my-tickets") return myTickets;
    return tickets;
  }, [activeTab, tickets, availableTickets, myTickets]);

  // Stats from all data sources
  const stats = useMemo(
    () => ({
      available: availableTickets.length,
      myActive: myTickets.filter((t) => t.status === "in_progress").length,
      myTotal: myTickets.length,
      resolved: myTickets.filter((t) => t.status === "resolved").length,
    }),
    [availableTickets, myTickets],
  );

  const handleSelect = async (id: string) => {
    try {
      await getTicketById(id);
    } catch {
      /* handled */
    }
  };

  const handleAccept = async (id: string) => {
    try {
      const accepted = await acceptTicket(id);
      // Auto-switch to "my-tickets" tab and keep the ticket detail open
      setActiveTab("my-tickets");
      router.push("/dashboard/support?tab=my-tickets", { scroll: false });
      // Refresh my tickets to ensure the list is up-to-date
      await getMyAssignedTickets();
      // Re-fetch the ticket to ensure currentTicket is fresh
      if (accepted?._id) {
        await getTicketById(accepted._id);
      }
    } catch {
      /* handled */
    }
  };

  const handleDecline = async (id: string) => {
    try {
      await declineTicket(id);
      setCurrentTicket(null);
      await loadTickets();
    } catch {
      /* handled */
    }
  };

  const handleResolve = async (id: string) => {
    try {
      await resolveTicket(id);
      await loadTickets();
      if (currentTicket?._id === id) await getTicketById(id);
    } catch {
      /* handled */
    }
  };

  const handleClose = async (id: string) => {
    try {
      await closeTicket(id);
      await loadTickets();
      if (currentTicket?._id === id) await getTicketById(id);
    } catch {
      /* handled */
    }
  };

  const handleSendMessage = async (id: string, message: string) => {
    await addMessage(id, message);
    await getTicketById(id);
  };

  const handleUpdatePriority = async (priority: string) => {
    if (!priorityModal.ticketId) return;
    await updatePriority(priorityModal.ticketId, priority);
    setPriorityModal({ open: false, ticketId: "", current: "" });
    await loadTickets();
    if (currentTicket?._id === priorityModal.ticketId)
      await getTicketById(priorityModal.ticketId);
  };

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
      <div className="flex items-center justify-between">
        <PageHeader
          title="Support Center"
          description={
            isSuperAdmin
              ? "Oversee all support tickets and team performance"
              : "Manage and respond to user support tickets"
          }
        />
        <Button
          variant="outline"
          size="sm"
          className="text-xs h-8 gap-1.5"
          onClick={loadTickets}
          disabled={isLoading}
        >
          <RefreshCw
            className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`}
          />
          Refresh
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatsCard
          icon={Inbox}
          iconColor="text-yellow-500"
          value={stats.available}
          label="Available"
        />
        <StatsCard
          icon={Clock}
          iconColor="text-blue-500"
          value={stats.myActive}
          label="My Active"
        />
        <StatsCard
          icon={CheckCircle2}
          iconColor="text-green-500"
          value={stats.resolved}
          label="Resolved"
        />
        <StatsCard
          icon={MessageSquare}
          value={stats.myTotal}
          label="My Total"
        />
      </div>

      {/* Error */}
      {error && (
        <Alert variant="destructive" className="py-2">
          <AlertDescription className="text-xs flex items-center justify-between">
            {error}
            <Button
              variant="ghost"
              size="icon"
              className="h-5 w-5 shrink-0"
              onClick={clearError}
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Main layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 min-h-[600px]">
        {/* Ticket list panel */}
        <div className="flex flex-col border bg-card lg:col-span-1">
          <div className="border-b">
            <Tabs
              value={activeTab}
              onValueChange={(v) => handleTabChange(v as TabType)}
            >
              <TabsList
                variant="line"
                className="w-full justify-start px-3 pt-1"
              >
                <TabsTrigger value="available" className="text-xs flex-1">
                  Available
                  {availableTickets.length > 0 && (
                    <Badge
                      variant="destructive"
                      className="text-[9px] px-1.5 py-0 ml-1"
                    >
                      {availableTickets.length}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="my-tickets" className="text-xs flex-1">
                  Mine
                  {myTickets.filter((t) => t.status === "in_progress").length >
                    0 && (
                    <Badge
                      variant="default"
                      className="text-[9px] px-1.5 py-0 ml-1"
                    >
                      {
                        myTickets.filter((t) => t.status === "in_progress")
                          .length
                      }
                    </Badge>
                  )}
                </TabsTrigger>
                {isSuperAdmin && (
                  <TabsTrigger value="all" className="text-xs flex-1">
                    <ShieldCheck className="h-3 w-3 mr-1" />
                    All
                  </TabsTrigger>
                )}
              </TabsList>
            </Tabs>
          </div>

          <div className="p-3 border-b space-y-2">
            {activeTab !== "available" && (
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-7 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((opt) => (
                    <SelectItem
                      key={opt.value}
                      value={opt.value}
                      className="text-xs"
                    >
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="h-7 text-xs">
                <SelectValue placeholder="All Priorities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="text-xs">
                  All Priorities
                </SelectItem>
                <SelectItem value="urgent" className="text-xs">
                  Urgent
                </SelectItem>
                <SelectItem value="high" className="text-xs">
                  High
                </SelectItem>
                <SelectItem value="medium" className="text-xs">
                  Medium
                </SelectItem>
                <SelectItem value="low" className="text-xs">
                  Low
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex-1 overflow-y-auto">
            <TicketList
              tickets={displayTickets}
              currentTicketId={currentTicket?._id}
              isLoading={isLoading}
              onSelect={handleSelect}
              showAssignedTo={activeTab === "all"}
            />
          </div>
        </div>

        {/* Detail panel */}
        <div className="lg:col-span-2">
          {currentTicket ? (
            <TicketDetail
              ticket={currentTicket}
              currentUserId={user?.id}
              currentUserRole={user?.role}
              processingTicketId={processingTicketId}
              onBack={() => setCurrentTicket(null)}
              onAccept={handleAccept}
              onDecline={handleDecline}
              onResolve={handleResolve}
              onClose={handleClose}
              onSendMessage={handleSendMessage}
              onOpenPriorityModal={(id, current) =>
                setPriorityModal({ open: true, ticketId: id, current })
              }
            />
          ) : (
            <TicketDetailEmpty />
          )}
        </div>
      </div>

      <UpdatePriorityDialog
        open={priorityModal.open}
        onOpenChange={(open) => setPriorityModal((prev) => ({ ...prev, open }))}
        currentPriority={priorityModal.current}
        isLoading={processingTicketId === priorityModal.ticketId}
        onSubmit={handleUpdatePriority}
      />
    </div>
  );
}

export default function SupportPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-1 items-center justify-center min-h-[60vh]">
          <div className="flex items-center gap-2 text-muted-foreground">
            <MessageSquare className="h-4 w-4 animate-pulse" />
            <span className="text-xs">Loading support…</span>
          </div>
        </div>
      }
    >
      <SupportContent />
    </Suspense>
  );
}
