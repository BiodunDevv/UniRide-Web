"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  ResponsiveModal,
  ResponsiveModalContent,
  ResponsiveModalDescription,
  ResponsiveModalHeader,
  ResponsiveModalTitle,
} from "@/components/ui/responsive-modal";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  MessageSquare,
  User,
  Calendar,
  Tag,
  AlertCircle,
  Clock,
  CheckCircle,
  Send,
} from "lucide-react";

interface Ticket {
  id: string;
  subject: string;
  user: string;
  type: string;
  priority: string;
  status: string;
  createdAt: string;
}

const priorityColors: Record<
  string,
  "default" | "secondary" | "destructive" | "outline"
> = {
  high: "destructive",
  medium: "default",
  low: "secondary",
  urgent: "destructive",
};

const statusIcons: Record<string, typeof Clock> = {
  open: AlertCircle,
  in_progress: Clock,
  resolved: CheckCircle,
};

interface TicketDetailDrawerProps {
  ticket: Ticket;
  onReply?: () => void;
  onResolve?: () => void;
  onUpdatePriority?: () => void;
}

export function TicketDetailDrawer({
  ticket,
  onReply,
  onResolve,
  onUpdatePriority,
}: TicketDetailDrawerProps) {
  const isMobile = useIsMobile();
  const StatusIcon = statusIcons[ticket.status] || Clock;

  return (
    <Drawer direction={isMobile ? "bottom" : "right"}>
      <DrawerTrigger asChild>
        <Button
          variant="link"
          className="text-foreground w-fit px-0 text-left h-auto p-0 text-xs font-medium hover:underline"
        >
          {ticket.subject}
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle className="text-sm">Ticket Details</DrawerTitle>
          <DrawerDescription className="text-xs">
            {ticket.id} — {ticket.subject}
          </DrawerDescription>
        </DrawerHeader>
        <div className="flex flex-col gap-4 flex-1 min-h-0 overflow-y-auto px-4 py-2 text-sm">
          <Separator />
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <MessageSquare className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{ticket.subject}</p>
              <div className="flex items-center gap-2 mt-1">
                <Badge
                  variant={priorityColors[ticket.priority] || "secondary"}
                  className="text-[10px] capitalize"
                >
                  {ticket.priority}
                </Badge>
                <Badge variant="outline" className="text-[10px] capitalize">
                  <StatusIcon className="h-3 w-3 mr-1" />
                  {ticket.status.replace("_", " ")}
                </Badge>
              </div>
            </div>
          </div>
          <Separator />
          <div className="grid gap-3">
            <div className="flex items-center justify-between">
              <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
                <User className="h-3 w-3" /> User
              </Label>
              <span className="text-xs">{ticket.user}</span>
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Tag className="h-3 w-3" /> Type
              </Label>
              <span className="text-xs capitalize">{ticket.type}</span>
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Calendar className="h-3 w-3" /> Created
              </Label>
              <span className="text-xs">{ticket.createdAt}</span>
            </div>
          </div>
        </div>
        <DrawerFooter>
          {ticket.status !== "resolved" && (onReply || onResolve) && (
            <div className="flex gap-2 w-full">
              {onReply && (
                <Button size="sm" className="text-xs flex-1" onClick={onReply}>
                  <Send className="h-3.5 w-3.5 mr-1.5" />
                  Reply
                </Button>
              )}
              {onResolve && (
                <Button
                  size="sm"
                  variant="secondary"
                  className="text-xs flex-1"
                  onClick={onResolve}
                >
                  <CheckCircle className="h-3.5 w-3.5 mr-1.5" />
                  Resolve
                </Button>
              )}
            </div>
          )}
          {onUpdatePriority && (
            <Button
              size="sm"
              variant="outline"
              className="text-xs w-full"
              onClick={onUpdatePriority}
            >
              Update Priority
            </Button>
          )}
          <DrawerClose asChild>
            <Button variant="ghost" size="sm" className="text-xs w-full">
              Close
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

interface ReplyTicketModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ticketSubject: string;
  onSend: (message: string) => Promise<void>;
  isLoading?: boolean;
}

export function ReplyTicketModal({
  open,
  onOpenChange,
  ticketSubject,
  onSend,
  isLoading = false,
}: ReplyTicketModalProps) {
  const [message, setMessage] = useState("");

  const handleSend = async () => {
    if (!message.trim()) return;
    await onSend(message);
    setMessage("");
  };

  return (
    <ResponsiveModal open={open} onOpenChange={onOpenChange}>
      <ResponsiveModalContent>
        <ResponsiveModalHeader>
          <ResponsiveModalTitle className="text-sm flex items-center gap-2">
            <Send className="h-4 w-4" />
            Reply to Ticket
          </ResponsiveModalTitle>
          <ResponsiveModalDescription className="text-xs">
            Responding to: {ticketSubject}
          </ResponsiveModalDescription>
        </ResponsiveModalHeader>
        <div className="flex-1 min-h-0 overflow-y-auto px-4 py-2">
          <div className="grid gap-1.5">
            <Label htmlFor="reply-msg" className="text-xs">
              Message
            </Label>
            <Textarea
              id="reply-msg"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your reply..."
              className="text-xs min-h-[100px]"
            />
          </div>
        </div>
        <div className="flex flex-col-reverse sm:flex-row gap-2 px-4 pb-4 pt-2 shrink-0 border-t sm:justify-end">
          <Button
            variant="outline"
            size="sm"
            className="text-xs w-full sm:w-auto"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            size="sm"
            className="text-xs w-full sm:w-auto"
            onClick={handleSend}
            disabled={!message.trim() || isLoading}
          >
            <Send className="h-3.5 w-3.5 mr-1.5" />
            Send Reply
          </Button>
        </div>
      </ResponsiveModalContent>
    </ResponsiveModal>
  );
}

interface UpdatePriorityModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentPriority: string;
  onSubmit: (priority: string) => Promise<void>;
  isLoading?: boolean;
}

export function UpdatePriorityModal({
  open,
  onOpenChange,
  currentPriority,
  onSubmit,
  isLoading = false,
}: UpdatePriorityModalProps) {
  const [priority, setPriority] = useState(currentPriority);

  const handleSubmit = async () => {
    await onSubmit(priority);
  };

  return (
    <ResponsiveModal open={open} onOpenChange={onOpenChange}>
      <ResponsiveModalContent>
        <ResponsiveModalHeader>
          <ResponsiveModalTitle className="text-sm">
            Update Priority
          </ResponsiveModalTitle>
          <ResponsiveModalDescription className="text-xs">
            Change the priority level for this ticket
          </ResponsiveModalDescription>
        </ResponsiveModalHeader>
        <div className="flex-1 min-h-0 overflow-y-auto">
          <div className="px-4 py-2">
            <div className="grid gap-1.5">
              <Label htmlFor="ticket-priority" className="text-xs">
                Priority
              </Label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger id="ticket-priority" className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low" className="text-xs">
                    Low
                  </SelectItem>
                  <SelectItem value="medium" className="text-xs">
                    Medium
                  </SelectItem>
                  <SelectItem value="high" className="text-xs">
                    High
                  </SelectItem>
                  <SelectItem value="urgent" className="text-xs">
                    Urgent
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <div className="flex flex-col-reverse sm:flex-row gap-2 px-4 pb-4 pt-2 shrink-0 border-t sm:justify-end">
          <Button
            variant="outline"
            size="sm"
            className="text-xs w-full sm:w-auto"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            size="sm"
            className="text-xs w-full sm:w-auto"
            onClick={handleSubmit}
            disabled={isLoading}
          >
            Update Priority
          </Button>
        </div>
      </ResponsiveModalContent>
    </ResponsiveModal>
  );
}
