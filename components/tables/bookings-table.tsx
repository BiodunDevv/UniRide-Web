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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { BookingDetailDrawer } from "@/components/modals/booking-detail-drawer";
import { ProfileAvatar } from "@/components/shared/profile-avatar";
import {
  MapPin,
  FileText,
  CreditCard,
  CheckCircle2,
  XCircle,
  Phone,
  EllipsisVerticalIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
} from "lucide-react";
import type { AdminBooking } from "@/store/useAdminStore";

const statusStyles: Record<
  string,
  {
    variant: "default" | "secondary" | "destructive" | "outline";
    label: string;
    className: string;
  }
> = {
  pending: {
    variant: "outline",
    label: "Pending",
    className: "text-amber-700 border-amber-200 bg-amber-50",
  },
  accepted: {
    variant: "outline",
    label: "Accepted",
    className: "text-blue-700 border-blue-200 bg-blue-50",
  },
  declined: {
    variant: "destructive",
    label: "Declined",
    className: "",
  },
  in_progress: {
    variant: "outline",
    label: "In Progress",
    className: "text-purple-700 border-purple-200 bg-purple-50",
  },
  completed: {
    variant: "default",
    label: "Completed",
    className: "",
  },
  cancelled: {
    variant: "secondary",
    label: "Cancelled",
    className: "",
  },
};

function getPassengerName(booking: AdminBooking): string {
  const u = booking.user_id;
  if (typeof u === "object" && u) return u.name ?? "Unknown";
  return "Unknown";
}

function getLocationShort(loc: any): string {
  if (typeof loc === "object" && loc) return loc.short_name || loc.name || "—";
  return "—";
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-NG", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

interface BookingsTableProps {
  bookings: AdminBooking[];
  onAccept?: (booking: AdminBooking) => void;
  onDecline?: (booking: AdminBooking) => void;
}

export function BookingsTable({
  bookings,
  onAccept,
  onDecline,
}: BookingsTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([]);

  const columns = React.useMemo<ColumnDef<AdminBooking>[]>(
    () => [
      {
        id: "row_number",
        header: "#",
        cell: ({ row }) => (
          <span className="text-xs text-muted-foreground font-medium tabular-nums">
            {row.index + 1}
          </span>
        ),
        size: 40,
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorFn: (row) => getPassengerName(row),
        id: "passenger",
        header: "Passenger",
        cell: ({ row }) => {
          const booking = row.original;
          const name = getPassengerName(booking);
          const email =
            typeof booking.user_id === "object"
              ? booking.user_id?.email
              : undefined;
          const phone =
            typeof booking.user_id === "object"
              ? booking.user_id?.phone
              : undefined;
          const avatar =
            typeof booking.user_id === "object"
              ? booking.user_id?.profile_picture
              : undefined;
          return (
            <div className="flex items-center gap-2">
              <ProfileAvatar src={avatar} name={name} size="sm" />
              <div className="min-w-0">
                <BookingDetailDrawer
                  booking={booking}
                  onAccept={onAccept ? () => onAccept(booking) : undefined}
                  onDecline={onDecline ? () => onDecline(booking) : undefined}
                  trigger={
                    <Button
                      variant="link"
                      className="text-foreground w-fit px-0 text-left h-auto p-0 text-sm font-medium hover:underline"
                    >
                      {name}
                    </Button>
                  }
                />
                {email && (
                  <p className="text-[10px] text-muted-foreground truncate">
                    {email}
                  </p>
                )}
                {phone && (
                  <a
                    href={`tel:${phone}`}
                    className="mt-0.5 inline-flex items-center gap-1 text-[10px] font-medium text-sky-700 hover:text-sky-800"
                  >
                    <Phone className="h-3 w-3" />
                    {phone}
                  </a>
                )}
              </div>
            </div>
          );
        },
        enableHiding: false,
      },
      {
        id: "route",
        header: "Route",
        accessorFn: (row) => {
          const ride = row.ride_id;
          if (ride && typeof ride === "object") {
            return `${getLocationShort(ride.pickup_location_id)} → ${getLocationShort(ride.destination_id)}`;
          }
          return "—";
        },
        cell: ({ row }) => {
          const ride = row.original.ride_id;
          if (!ride || typeof ride !== "object") {
            return <span className="text-muted-foreground text-xs">—</span>;
          }
          return (
            <div className="flex items-center gap-1.5 text-xs">
              <div className="flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-green-500 shrink-0" />
                <span className="truncate max-w-20">
                  {getLocationShort(ride.pickup_location_id)}
                </span>
              </div>
              <span className="text-muted-foreground">→</span>
              <div className="flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-destructive shrink-0" />
                <span className="truncate max-w-20">
                  {getLocationShort(ride.destination_id)}
                </span>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "seats_requested",
        header: "Seats",
        cell: ({ row }) => (
          <span className="text-xs font-medium">
            {row.original.seats_requested}
          </span>
        ),
      },
      {
        accessorKey: "total_fare",
        header: "Fare",
        cell: ({ row }) => (
          <span className="font-medium">
            ₦{row.original.total_fare?.toLocaleString() || "0"}
          </span>
        ),
      },
      {
        id: "payment",
        header: "Payment",
        cell: ({ row }) => {
          const paid = row.original.payment_status === "paid";
          return (
            <div className="flex items-center gap-1 text-xs">
              <CreditCard
                className={`h-3 w-3 ${paid ? "text-green-500" : "text-muted-foreground"}`}
              />
              <span className="capitalize">{row.original.payment_method}</span>
              {paid && <CheckCircle2 className="h-3 w-3 text-green-500" />}
            </div>
          );
        },
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
          const s = statusStyles[row.original.status] || {
            variant: "secondary" as const,
            label: row.original.status,
            className: "",
          };
          return (
            <Badge
              variant={s.variant}
              className={`px-1.5 text-[10px] ${s.className}`}
            >
              {s.label}
            </Badge>
          );
        },
      },
      {
        accessorKey: "createdAt",
        header: "Booked",
        cell: ({ row }) => (
          <span className="text-xs text-muted-foreground">
            {formatDate(row.original.booking_time || row.original.createdAt)}
          </span>
        ),
      },
      {
        id: "actions",
        cell: ({ row }) => {
          const booking = row.original;
          const isPending = booking.status === "pending";
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="data-[state=open]:bg-muted text-muted-foreground size-8"
                >
                  <EllipsisVerticalIcon />
                  <span className="sr-only">Open menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem asChild>
                  <BookingDetailDrawer
                    booking={booking}
                    onAccept={onAccept ? () => onAccept(booking) : undefined}
                    onDecline={onDecline ? () => onDecline(booking) : undefined}
                    trigger={
                      <button className="flex w-full items-center text-sm px-2 py-1.5 cursor-default">
                        <MapPin className="h-3.5 w-3.5 mr-1.5" />
                        View Details
                      </button>
                    }
                  />
                </DropdownMenuItem>
                {isPending && onAccept && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => onAccept(booking)}
                      className="text-green-600 focus:text-green-600"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />
                      Accept
                    </DropdownMenuItem>
                  </>
                )}
                {isPending && onDecline && (
                  <DropdownMenuItem
                    variant="destructive"
                    onClick={() => onDecline(booking)}
                  >
                    <XCircle className="h-3.5 w-3.5 mr-1.5" />
                    Decline
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    [onAccept, onDecline],
  );

  const table = useReactTable({
    data: bookings,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 10 } },
  });

  if (bookings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <FileText className="h-10 w-10 text-muted-foreground/50 mb-3" />
        <p className="text-sm text-muted-foreground">No bookings found</p>
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
            <Label htmlFor="bookings-rpp" className="text-sm font-medium">
              Rows per page
            </Label>
            <Select
              value={`${table.getState().pagination.pageSize}`}
              onValueChange={(v) => table.setPageSize(Number(v))}
            >
              <SelectTrigger size="sm" className="w-20" id="bookings-rpp">
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
