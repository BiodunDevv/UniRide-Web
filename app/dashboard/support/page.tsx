"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TicketsTable } from "@/components/tables/tickets-table";
import {
  ReplyTicketModal,
  UpdatePriorityModal,
} from "@/components/modals/ticket-modals";
import {
  StatsCard,
  PageHeader,
  SearchInput,
  StatusFilter,
} from "@/components/shared";
import { MessageSquare, Clock, CheckCircle, AlertCircle } from "lucide-react";

type Ticket = {
  id: string;
  subject: string;
  user: string;
  type: string;
  priority: string;
  status: string;
  createdAt: string;
};

const mockTickets: Ticket[] = [
  {
    id: "T001",
    subject: "Payment not received",
    user: "Ayo Adeniyi",
    type: "payment",
    priority: "high",
    status: "open",
    createdAt: "2024-12-03 10:30",
  },
  {
    id: "T002",
    subject: "Driver was rude",
    user: "Blessing Okoro",
    type: "complaint",
    priority: "medium",
    status: "in_progress",
    createdAt: "2024-12-03 09:15",
  },
  {
    id: "T003",
    subject: "App crash on booking",
    user: "Chukwuma Ibe",
    type: "technical",
    priority: "high",
    status: "open",
    createdAt: "2024-12-03 08:00",
  },
  {
    id: "T004",
    subject: "Refund request",
    user: "Dara Oluwole",
    type: "payment",
    priority: "medium",
    status: "resolved",
    createdAt: "2024-12-02 16:45",
  },
  {
    id: "T005",
    subject: "Wrong pickup location",
    user: "Efe Oghenekaro",
    type: "ride",
    priority: "low",
    status: "resolved",
    createdAt: "2024-12-02 14:00",
  },
];

export default function SupportPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [showPriorityModal, setShowPriorityModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const filteredTickets = mockTickets.filter((ticket) => {
    const matchesSearch =
      ticket.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || ticket.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleReply = async (message: string) => {
    setIsLoading(true);
    try {
      // TODO: integrate with support API
      await new Promise((r) => setTimeout(r, 1000));
      setShowReplyModal(false);
      setSelectedTicket(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdatePriority = async (priority: string) => {
    setIsLoading(true);
    try {
      // TODO: integrate with support API
      await new Promise((r) => setTimeout(r, 1000));
      setShowPriorityModal(false);
      setSelectedTicket(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResolve = async (ticket: Ticket) => {
    // TODO: integrate with support API
    await new Promise((r) => setTimeout(r, 500));
  };

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
      <PageHeader
        title="Support"
        description="Manage support tickets and user inquiries"
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatsCard
          icon={AlertCircle}
          iconColor="text-yellow-500"
          value={mockTickets.filter((t) => t.status === "open").length}
          label="Open"
        />
        <StatsCard
          icon={Clock}
          iconColor="text-blue-500"
          value={mockTickets.filter((t) => t.status === "in_progress").length}
          label="In Progress"
        />
        <StatsCard
          icon={CheckCircle}
          iconColor="text-green-500"
          value={mockTickets.filter((t) => t.status === "resolved").length}
          label="Resolved"
        />
        <StatsCard
          icon={MessageSquare}
          value={mockTickets.length}
          label="Total"
        />
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-sm">Support Tickets</CardTitle>
              <CardDescription className="text-xs">
                {filteredTickets.length} ticket
                {filteredTickets.length !== 1 ? "s" : ""}
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
                  { label: "Open", value: "open" },
                  { label: "In Progress", value: "in_progress" },
                  { label: "Resolved", value: "resolved" },
                ]}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <TicketsTable
            tickets={filteredTickets}
            onReply={(ticket) => {
              setSelectedTicket(ticket);
              setShowReplyModal(true);
            }}
            onResolve={handleResolve}
            onUpdatePriority={(ticket) => {
              setSelectedTicket(ticket);
              setShowPriorityModal(true);
            }}
          />
        </CardContent>
      </Card>

      {selectedTicket && (
        <>
          <ReplyTicketModal
            open={showReplyModal}
            onOpenChange={(open) => {
              setShowReplyModal(open);
              if (!open) setSelectedTicket(null);
            }}
            ticketSubject={selectedTicket.subject}
            onSend={handleReply}
            isLoading={isLoading}
          />

          <UpdatePriorityModal
            open={showPriorityModal}
            onOpenChange={(open) => {
              setShowPriorityModal(open);
              if (!open) setSelectedTicket(null);
            }}
            currentPriority={selectedTicket.priority}
            onSubmit={handleUpdatePriority}
            isLoading={isLoading}
          />
        </>
      )}
    </div>
  );
}
