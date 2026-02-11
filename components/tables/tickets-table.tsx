"use client";

import * as React from "react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TicketDetailDrawer } from "@/components/modals/ticket-modals";
import {
  MessageSquare,
  Clock,
  CheckCircle,
  AlertCircle,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
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

const statusStyles: Record<
  string,
  {
    variant: "default" | "secondary" | "destructive" | "outline";
    icon: typeof Clock;
  }
> = {
  open: { variant: "outline", icon: AlertCircle },
  in_progress: { variant: "default", icon: Clock },
  resolved: { variant: "secondary", icon: CheckCircle },
};

interface TicketsTableProps {
  tickets: Ticket[];
  onReply?: (ticket: Ticket) => void;
  onResolve?: (ticket: Ticket) => void;
  onUpdatePriority?: (ticket: Ticket) => void;
}

export function TicketsTable({
  tickets,
  onReply,
  onResolve,
  onUpdatePriority,
}: TicketsTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([]);

  const columns = React.useMemo<ColumnDef<Ticket>[]>(
    () => [
      {
        accessorKey: "id",
        header: "Ticket",
        cell: ({ row }) => (
          <span className="font-mono font-medium">{row.original.id}</span>
        ),
      },
      {
        accessorKey: "subject",
        header: "Subject",
        cell: ({ row }) => (
          <div className="max-w-48">
            <TicketDetailDrawer
              ticket={row.original}
              onReply={onReply ? () => onReply(row.original) : undefined}
              onResolve={onResolve ? () => onResolve(row.original) : undefined}
              onUpdatePriority={
                onUpdatePriority
                  ? () => onUpdatePriority(row.original)
                  : undefined
              }
            />
          </div>
        ),
        enableHiding: false,
      },
      {
        accessorKey: "user",
        header: "User",
        cell: ({ row }) => (
          <span className="text-muted-foreground">{row.original.user}</span>
        ),
      },
      {
        accessorKey: "priority",
        header: "Priority",
        cell: ({ row }) => (
          <Badge
            variant={priorityColors[row.original.priority] || "secondary"}
            className="text-muted-foreground px-1.5 capitalize"
          >
            {row.original.priority}
          </Badge>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
          const StatusIcon = statusStyles[row.original.status]?.icon || Clock;
          return (
            <Badge
              variant={
                statusStyles[row.original.status]?.variant || "secondary"
              }
              className="text-muted-foreground px-1.5 capitalize"
            >
              <StatusIcon className="h-3 w-3 mr-1" />
              {row.original.status.replace("_", " ")}
            </Badge>
          );
        },
      },
      {
        accessorKey: "createdAt",
        header: "Created",
        cell: ({ row }) => (
          <span className="text-muted-foreground">
            {row.original.createdAt}
          </span>
        ),
      },
    ],
    [onReply, onResolve, onUpdatePriority],
  );

  const table = useReactTable({
    data: tickets,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 10 } },
  });

  if (tickets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <MessageSquare className="h-10 w-10 text-muted-foreground/50 mb-3" />
        <p className="text-sm text-muted-foreground">No tickets found</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="overflow-hidden rounded-lg border">
        <Table>
          <TableHeader className="bg-muted sticky top-0 z-10">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} colSpan={header.colSpan}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-between px-2">
        <div className="text-muted-foreground hidden flex-1 text-sm lg:flex">
          {table.getFilteredRowModel().rows.length} row(s) total.
        </div>
        <div className="flex w-full items-center gap-8 lg:w-fit">
          <div className="hidden items-center gap-2 lg:flex">
            <Label htmlFor="tickets-rpp" className="text-sm font-medium">
              Rows per page
            </Label>
            <Select
              value={`${table.getState().pagination.pageSize}`}
              onValueChange={(v) => table.setPageSize(Number(v))}
            >
              <SelectTrigger size="sm" className="w-20" id="tickets-rpp">
                <SelectValue />
              </SelectTrigger>
              <SelectContent side="top">
                <SelectGroup>
                  {[10, 20, 30, 50].map((s) => (
                    <SelectItem key={s} value={`${s}`}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <div className="flex w-fit items-center justify-center text-sm font-medium">
            Page {table.getState().pagination.pageIndex + 1} of{" "}
            {table.getPageCount()}
          </div>
          <div className="ml-auto flex items-center gap-2 lg:ml-0">
            <Button
              variant="outline"
              className="hidden size-8 lg:flex"
              size="icon"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">First page</span>
              <ChevronsLeftIcon />
            </Button>
            <Button
              variant="outline"
              className="size-8"
              size="icon"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">Previous page</span>
              <ChevronLeftIcon />
            </Button>
            <Button
              variant="outline"
              className="size-8"
              size="icon"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only">Next page</span>
              <ChevronRightIcon />
            </Button>
            <Button
              variant="outline"
              className="hidden size-8 lg:flex"
              size="icon"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only">Last page</span>
              <ChevronsRightIcon />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
