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
} from "lucide-react";

type TabType = "available" | "my-tickets" | "all";

function SupportContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuthStore();
  const {
    tickets,
    availableTickets,
    currentTicket,
    isLoading,
    error,
    processingTicketId,
    getAllTickets,
    getAvailableTickets,
    getTicketById,
    acceptTicket,
    declineTicket,
    addMessage,
    resolveTicket,
    updatePriority,
    clearError,
    setCurrentTicket,
  } = useChatStore();

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
    router.push(`/dashboard/support?tab=${tab}`, { scroll: false });
  };

  const loadTickets = useCallback(async () => {
    try {
      if (activeTab === "available") {
        await getAvailableTickets(
          priorityFilter !== "all" ? priorityFilter : undefined,
        );
      } else {
        await getAllTickets(
          statusFilter !== "all" ? statusFilter : undefined,
          priorityFilter !== "all" ? priorityFilter : undefined,
        );
      }
    } catch {
      // errors handled in store via toast
    }
  }, [
    activeTab,
    statusFilter,
    priorityFilter,
    getAvailableTickets,
    getAllTickets,
  ]);

  useEffect(() => {
    loadTickets();
  }, [loadTickets]);

  const displayTickets = useMemo(() => {
    if (activeTab === "available") return availableTickets;
    if (activeTab === "my-tickets")
      return tickets.filter((t) => t.assigned_to?._id === user?.id);
    return tickets;
  }, [activeTab, tickets, availableTickets, user?.id]);

  const stats = useMemo(
    () => ({
      open: tickets.filter((t) => t.status === "open").length,
      inProgress: tickets.filter((t) => t.status === "in_progress").length,
      resolved: tickets.filter((t) => t.status === "resolved").length,
      total: tickets.length,
    }),
    [tickets],
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
      await acceptTicket(id);
      await loadTickets();
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
      <PageHeader
        title="Support"
        description="Manage and respond to user support tickets"
      />

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatsCard
          icon={AlertCircle}
          iconColor="text-yellow-500"
          value={stats.open}
          label="Open"
        />
        <StatsCard
          icon={Clock}
          iconColor="text-blue-500"
          value={stats.inProgress}
          label="In Progress"
        />
        <StatsCard
          icon={CheckCircle2}
          iconColor="text-green-500"
          value={stats.resolved}
          label="Resolved"
        />
        <StatsCard icon={MessageSquare} value={stats.total} label="Total" />
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
                </TabsTrigger>
                <TabsTrigger value="all" className="text-xs flex-1">
                  All
                </TabsTrigger>
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
            />
          </div>
        </div>

        {/* Detail panel */}
        <div className="lg:col-span-2">
          {currentTicket ? (
            <TicketDetail
              ticket={currentTicket}
              currentUserId={user?.id}
              processingTicketId={processingTicketId}
              onBack={() => setCurrentTicket(null)}
              onAccept={handleAccept}
              onDecline={handleDecline}
              onResolve={handleResolve}
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
import { TicketsTable } from "@/components/tables/tickets-table";
