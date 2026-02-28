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
  XCircle,
  ShieldCheck,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { PriorityBadge, StatusBadge } from "./ticket-helpers";

interface Message {
  _id: string;
  sender_id?: { _id: string; name: string; role: string } | null;
  sender_name?: string;
  sender_role: string;
  message: string;
  timestamp: string;
}

interface Ticket {
  _id: string;
  ticket_number?: string;
  subject: string;
  category: string;
  priority: string;
  status: string;
  user_id?: { _id: string; name: string; email: string } | null;
  guest_name?: string;
  guest_email?: string;
  assigned_to?: { _id: string; name: string; email: string } | null;
  messages: Message[];
  resolved_at?: string;
  closed_at?: string;
  createdAt: string;
}

interface TicketDetailProps {
  ticket: Ticket;
  currentUserId?: string;
  currentUserRole?: string;
  processingTicketId: string | null;
  onBack: () => void;
  onAccept: (id: string) => void;
  onDecline: (id: string) => void;
  onResolve: (id: string) => void;
  onClose: (id: string) => void;
  onSendMessage: (id: string, message: string) => Promise<void>;
  onOpenPriorityModal: (id: string, currentPriority: string) => void;
}

export function TicketDetail({
  ticket,
  currentUserId,
  currentUserRole,
  processingTicketId,
  onBack,
  onAccept,
  onDecline,
  onResolve,
  onClose,
  onSendMessage,
  onOpenPriorityModal,
}: TicketDetailProps) {
  const [message, setMessage] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const isProcessing = processingTicketId === ticket._id;
  const isAssignedToMe = ticket.assigned_to?._id === currentUserId;
  const isSuperAdmin = currentUserRole === "super_admin";
  const isAdmin = currentUserRole === "admin" || isSuperAdmin;
  const isOwner = ticket.user_id?._id === currentUserId;
  const isClosed = ticket.status === "closed";
  const isResolved = ticket.status === "resolved";

  // Can reply: assigned admin, super admin on any assigned ticket, or ticket owner (for user-admin chat)
  const canReply =
    !isClosed &&
    (isAssignedToMe ||
      (isSuperAdmin && ticket.assigned_to) ||
      (isOwner && ticket.status !== "resolved"));

  // Can accept: unassigned open ticket by any admin, or super admin can reassign
  const canAccept =
    !isClosed &&
    isAdmin &&
    ((!ticket.assigned_to && ticket.status === "open") ||
      (isSuperAdmin && ticket.assigned_to && !isAssignedToMe));

  // Can decline: only the assigned admin themselves, or super admin for any assigned ticket
  const canDecline =
    ticket.assigned_to &&
    ticket.status === "in_progress" &&
    (isAssignedToMe || isSuperAdmin);

  // Can resolve: assigned to me and in_progress, or super admin for any in_progress
  const canResolve =
    ticket.status === "in_progress" && (isAssignedToMe || isSuperAdmin);

  // Can close: resolved tickets by any admin
  const canClose = isResolved && isAdmin;

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
            {ticket.ticket_number && (
              <p className="text-[10px] text-muted-foreground mt-0.5">
                #{ticket.ticket_number}
              </p>
            )}
          </div>
          {isSuperAdmin && (
            <Badge
              variant="outline"
              className="text-[9px] gap-1 shrink-0 border-amber-500/30 text-amber-600"
            >
              <ShieldCheck className="h-3 w-3" />
              Super Admin
            </Badge>
          )}
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
            <p className="font-medium mt-0.5">
              {ticket.user_id?.name || ticket.guest_name || "Guest"}
            </p>
            <p className="text-[10px] text-muted-foreground">
              {ticket.user_id?.email || ticket.guest_email || ""}
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
          <div>
            <Label className="text-[10px] text-muted-foreground">
              Assigned To
            </Label>
            <p
              className={`font-medium mt-0.5 ${
                ticket.assigned_to ? "text-primary" : "text-muted-foreground"
              }`}
            >
              {ticket.assigned_to
                ? `${ticket.assigned_to.name}${isAssignedToMe ? " (You)" : ""}`
                : "Unassigned"}
            </p>
          </div>
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
          {ticket.closed_at && (
            <div>
              <Label className="text-[10px] text-muted-foreground">
                Closed
              </Label>
              <p className="font-medium text-muted-foreground mt-0.5">
                {new Date(ticket.closed_at).toLocaleDateString(undefined, {
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
          {canAccept && (
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
              {isSuperAdmin && ticket.assigned_to
                ? "Reassign to Me"
                : "Accept Ticket"}
            </Button>
          )}
          {canResolve && (
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
          )}
          {canClose && (
            <Button
              size="sm"
              variant="outline"
              className="text-xs h-7"
              onClick={() => onClose(ticket._id)}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <XCircle className="h-3.5 w-3.5 mr-1.5" />
              )}
              Close Ticket
            </Button>
          )}
          {canDecline && (
            <Button
              size="sm"
              variant="destructive"
              className="text-xs h-7"
              onClick={() => onDecline(ticket._id)}
              disabled={isProcessing}
            >
              {isSuperAdmin && !isAssignedToMe ? "Unassign" : "Decline"}
            </Button>
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
            const isMine = msg.sender_id?._id === currentUserId;
            const isAdminMsg = ["admin", "super_admin"].includes(
              msg.sender_role,
            );
            return (
              <div
                key={msg._id}
                className={`flex ${isMine ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[75%] p-3 text-xs space-y-1.5 rounded-lg ${
                    isMine
                      ? "bg-primary text-primary-foreground"
                      : isAdminMsg
                        ? "bg-blue-50 dark:bg-blue-950/30 text-foreground border border-blue-200 dark:border-blue-800"
                        : "bg-muted text-foreground border"
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <User className="h-3 w-3 shrink-0" />
                    <span className="font-medium">
                      {msg.sender_id?.name || msg.sender_name || "Guest"}
                    </span>
                    <Badge
                      variant={isMine ? "outline" : "secondary"}
                      className={`text-[9px] px-1 py-0 capitalize ${
                        isMine
                          ? "border-primary-foreground/30 text-primary-foreground"
                          : ""
                      }`}
                    >
                      {msg.sender_role === "super_admin"
                        ? "Super Admin"
                        : msg.sender_role}
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
                    {new Date(msg.timestamp).toLocaleString(undefined, {
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

      {/* Read-only notice for super admin viewing other admin's tickets */}
      {isSuperAdmin &&
        !isAssignedToMe &&
        ticket.assigned_to &&
        !canReply &&
        !isClosed &&
        !isResolved && (
          <div className="border-t p-3 bg-muted/30">
            <p className="text-[10px] text-muted-foreground flex items-center gap-1.5">
              <Eye className="h-3 w-3" />
              Viewing as observer — Assigned to {ticket.assigned_to.name}
            </p>
          </div>
        )}

      {/* Closed/Resolved notice */}
      {(isClosed || (isResolved && !canClose)) && (
        <div className="border-t p-3 bg-muted/30">
          <p className="text-[10px] text-muted-foreground text-center">
            This ticket is {ticket.status.replace("_", " ")}
          </p>
        </div>
      )}
    </div>
  );
}

/* --- Empty state --- */
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
