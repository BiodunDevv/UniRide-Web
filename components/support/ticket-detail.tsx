"use client";

import { useRef, useEffect, useState, KeyboardEvent } from "react";
import {
  ArrowLeft,
  CheckCheck,
  ThumbsUp,
  Tag,
  Loader2,
  Send,
  User,
  MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { PriorityBadge, StatusBadge } from "./ticket-helpers";

interface Message {
  _id: string;
  sender_id: { _id: string; name: string; role: string };
  sender_role: string;
  message: string;
  createdAt: string;
}

interface Ticket {
  _id: string;
  ticket_number: string;
  subject: string;
  category: string;
  priority: string;
  status: string;
  user_id: { _id: string; name: string; email: string };
  assigned_to?: { _id: string; name: string; email: string } | null;
  messages: Message[];
  resolved_at?: string;
  createdAt: string;
}

interface TicketDetailProps {
  ticket: Ticket;
  currentUserId?: string;
  processingTicketId: string | null;
  onBack: () => void;
  onAccept: (id: string) => void;
  onDecline: (id: string) => void;
  onResolve: (id: string) => void;
  onSendMessage: (id: string, message: string) => Promise<void>;
  onOpenPriorityModal: (id: string, currentPriority: string) => void;
}

export function TicketDetail({
  ticket,
  currentUserId,
  processingTicketId,
  onBack,
  onAccept,
  onDecline,
  onResolve,
  onSendMessage,
  onOpenPriorityModal,
}: TicketDetailProps) {
  const [message, setMessage] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const isProcessing = processingTicketId === ticket._id;
  const isAssignedToMe = ticket.assigned_to?._id === currentUserId;
  const canReply =
    ticket.status !== "closed" && ticket.status !== "resolved" && isAssignedToMe;

  // Scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [ticket.messages]);

  const handleSend = async () => {
    const trimmed = message.trim();
    if (!trimmed) return;
    setMessage("");
    await onSendMessage(ticket._id, trimmed);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full border bg-card">
      {/* Header */}
      <div className="p-4 border-b space-y-3">
        <div className="flex items-start gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0 h-7 w-7 mt-0.5"
            onClick={onBack}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold leading-tight">
              {ticket.subject}
            </p>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              #{ticket.ticket_number}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5 pl-10">
          <StatusBadge status={ticket.status} />
          <button
            onClick={() => onOpenPriorityModal(ticket._id, ticket.priority)}
            className="inline-flex items-center gap-1 cursor-pointer"
            title="Change priority"
          >
            <PriorityBadge priority={ticket.priority} />
          </button>
          <Badge variant="outline" className="text-[10px] capitalize">
            {ticket.category}
          </Badge>
          <Tag className="h-3 w-3 text-muted-foreground self-center" />
        </div>

        <Separator />

        {/* Meta */}
        <div className="grid grid-cols-2 gap-2 text-xs pl-1">
          <div>
            <Label className="text-[10px] text-muted-foreground">
              Requester
            </Label>
            <p className="font-medium mt-0.5">{ticket.user_id.name}</p>
            <p className="text-[10px] text-muted-foreground">
              {ticket.user_id.email}
            </p>
          </div>
          <div>
            <Label className="text-[10px] text-muted-foreground">Created</Label>
            <p className="font-medium mt-0.5">
              {new Date(ticket.createdAt).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </p>
          </div>
          {ticket.assigned_to && (
            <div>
              <Label className="text-[10px] text-muted-foreground">
                Assigned To
              </Label>
              <p className="font-medium text-primary mt-0.5">
                {ticket.assigned_to.name}
              </p>
            </div>
          )}
          {ticket.resolved_at && (
            <div>
              <Label className="text-[10px] text-muted-foreground">
                Resolved
              </Label>
              <p className="font-medium text-green-600 mt-0.5">
                {new Date(ticket.resolved_at).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex gap-2 pl-1 flex-wrap">
          {!ticket.assigned_to && ticket.status === "open" && (
            <Button
              size="sm"
              className="text-xs h-7"
              onClick={() => onAccept(ticket._id)}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <ThumbsUp className="h-3.5 w-3.5 mr-1.5" />
              )}
              Accept Ticket
            </Button>
          )}
          {isAssignedToMe && ticket.status === "in_progress" && (
            <>
              <Button
                size="sm"
                className="text-xs h-7"
                onClick={() => onResolve(ticket._id)}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <CheckCheck className="h-3.5 w-3.5 mr-1.5" />
                )}
                Mark Resolved
              </Button>
              <Button
                size="sm"
                variant="destructive"
                className="text-xs h-7"
                onClick={() => onDecline(ticket._id)}
                disabled={isProcessing}
              >
                Decline
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0"
      >
        {ticket.messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-2">
            <MessageSquare className="h-8 w-8" />
            <p className="text-xs">No messages yet</p>
          </div>
        ) : (
          ticket.messages.map((msg) => {
            const isMine = msg.sender_id._id === currentUserId;
            return (
              <div
                key={msg._id}
                className={`flex ${isMine ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[75%] p-3 text-xs space-y-1.5 ${
                    isMine
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-foreground border"
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <User className="h-3 w-3 shrink-0" />
                    <span className="font-medium">{msg.sender_id.name}</span>
                    <Badge
                      variant={isMine ? "outline" : "secondary"}
                      className={`text-[9px] px-1 py-0 capitalize ${
                        isMine
                          ? "border-primary-foreground/30 text-primary-foreground"
                          : ""
                      }`}
                    >
                      {msg.sender_role}
                    </Badge>
                  </div>
                  <p className="whitespace-pre-wrap leading-relaxed">
                    {msg.message}
                  </p>
                  <p
                    className={`text-[10px] ${
                      isMine
                        ? "text-primary-foreground/60"
                        : "text-muted-foreground"
                    }`}
                  >
                    {new Date(msg.createdAt).toLocaleString(undefined, {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Reply box */}
      {canReply && (
        <div className="border-t p-3">
          <div className="flex gap-2 items-end">
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a reply… (⌘+Enter to send)"
              className="text-xs resize-none min-h-[72px]"
              rows={3}
              disabled={isProcessing}
            />
            <Button
              size="icon"
              className="shrink-0 h-9 w-9"
              onClick={handleSend}
              disabled={!message.trim() || isProcessing}
            >
              {isProcessing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
          <p className="text-[10px] text-muted-foreground mt-1">
            ⌘ + Enter to send
          </p>
        </div>
      )}
    </div>
  );
}

/* ─── Empty state ─── */
export function TicketDetailEmpty() {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[360px] border bg-muted/30 text-muted-foreground gap-3">
      <MessageSquare className="h-10 w-10" />
      <div className="text-center">
        <p className="text-sm font-medium">No ticket selected</p>
        <p className="text-xs mt-0.5">
          Pick a ticket from the list to view details
        </p>
      </div>
    </div>
  );
}
