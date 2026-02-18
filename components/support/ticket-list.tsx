"use client";

import { Loader2, MessageSquare, User, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { PriorityBadge, StatusBadge } from "./ticket-helpers";
import { cn } from "@/lib/utils";

interface Ticket {
  _id: string;
  ticket_number: string;
  subject: string;
  category: string;
  priority: string;
  status: string;
  user_id: { _id: string; name: string; email: string };
  assigned_to?: { _id: string; name: string } | null;
  messages: unknown[];
  createdAt: string;
}

interface TicketListProps {
  tickets: Ticket[];
  currentTicketId?: string;
  isLoading: boolean;
  onSelect: (id: string) => void;
}

export function TicketList({
  tickets,
  currentTicketId,
  isLoading,
  onSelect,
}: TicketListProps) {
  if (isLoading && tickets.length === 0) {
    return (
      <div className="flex items-center justify-center py-12 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin mr-2" />
        <span className="text-xs">Loading tickets…</span>
      </div>
    );
  }

  if (tickets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground gap-2">
        <MessageSquare className="h-8 w-8" />
        <p className="text-xs">No tickets found</p>
      </div>
    );
  }

  return (
    <div className="divide-y">
      {tickets.map((ticket) => {
        const isSelected = ticket._id === currentTicketId;
        return (
          <button
            key={ticket._id}
            onClick={() => onSelect(ticket._id)}
            className={cn(
              "w-full text-left px-4 py-3 hover:bg-muted/50 transition-colors",
              isSelected && "bg-muted",
            )}
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <p className="text-xs font-medium line-clamp-1 flex-1">
                {ticket.subject}
              </p>
              <PriorityBadge priority={ticket.priority} />
            </div>

            <div className="flex flex-wrap items-center gap-1.5 mb-2">
              <StatusBadge status={ticket.status} />
              <Badge variant="outline" className="text-[10px] capitalize">
                {ticket.category}
              </Badge>
            </div>

            <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
              <span className="flex items-center gap-1">
                <User className="h-3 w-3" />
                {ticket.user_id.name}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {new Date(ticket.createdAt).toLocaleDateString()}
              </span>
            </div>

            {ticket.assigned_to && (
              <p className="text-[10px] text-primary mt-1.5">
                Assigned to {ticket.assigned_to.name}
              </p>
            )}
          </button>
        );
      })}
    </div>
  );
}
