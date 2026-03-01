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
import { RideDetailDrawer } from "@/components/modals/ride-detail-drawer";
import { ProfileAvatar } from "@/components/shared/profile-avatar";
import {
  MapPin,
  Ban,
  Star,
  EllipsisVerticalIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
  Route,
} from "lucide-react";
import type { AdminRide } from "@/store/useAdminStore";

const statusStyles: Record<
  string,
  {
    variant: "default" | "secondary" | "destructive" | "outline";
    label: string;
    className: string;
  }
> = {
  scheduled: {
    variant: "outline",
    label: "Scheduled",
    className: "text-blue-700 border-blue-200 bg-blue-50",
  },
  available: {
    variant: "outline",
    label: "Available",
    className: "text-emerald-700 border-emerald-200 bg-emerald-50",
  },
  accepted: {
    variant: "outline",
    label: "Accepted",
    className: "text-amber-700 border-amber-200 bg-amber-50",
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
    variant: "destructive",
    label: "Cancelled",
    className: "",
  },
};

function getDriverName(ride: AdminRide): string {
  const d = ride.driver_id;
  if (typeof d === "object" && d) return d.user_id?.name ?? "Unknown";
  return "Unknown";
}

function getLocationShort(loc: any): string {
  if (typeof loc === "object" && loc) {
    return loc.short_name || loc.name || "—";
  }
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

interface RidesTableProps {
  rides: AdminRide[];
  onCancel?: (ride: AdminRide) => void;
}

export function RidesTable({ rides, onCancel }: RidesTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([]);

  const columns = React.useMemo<ColumnDef<AdminRide>[]>(
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
        accessorFn: (row) => getDriverName(row),
        id: "driver",
        header: "Driver",
        cell: ({ row }) => {
          const ride = row.original;
          const driver = ride.driver_id;
          const name = getDriverName(ride);
          const vehicle =
            typeof driver === "object" ? driver?.vehicle_model : undefined;
          const avatar =
            typeof driver === "object"
              ? driver?.user_id?.profile_picture || driver?.vehicle_image
              : undefined;
          const rating =
            typeof driver === "object" ? driver?.rating : undefined;
          return (
            <div className="flex items-center gap-2">
              <ProfileAvatar src={avatar} name={name} size="sm" />
              <div className="min-w-0">
                <RideDetailDrawer
                  ride={ride}
                  onCancel={onCancel ? () => onCancel(ride) : undefined}
                  trigger={
                    <Button
                      variant="link"
                      className="text-foreground w-fit px-0 text-left h-auto p-0 text-sm font-medium hover:underline"
                    >
                      {name}
                    </Button>
                  }
                />
                {vehicle && (
                  <p className="text-[10px] text-muted-foreground truncate">
                    {vehicle}
                  </p>
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
        accessorFn: (row) =>
          `${getLocationShort(row.pickup_location_id)} → ${getLocationShort(row.destination_id)}`,
        cell: ({ row }) => (
          <div className="flex items-center gap-1.5 text-xs">
            <div className="flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-green-500 shrink-0" />
              <span className="truncate max-w-[80px]">
                {getLocationShort(row.original.pickup_location_id)}
              </span>
            </div>
            <span className="text-muted-foreground">→</span>
            <div className="flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-destructive shrink-0" />
              <span className="truncate max-w-[80px]">
                {getLocationShort(row.original.destination_id)}
              </span>
            </div>
          </div>
        ),
      },
      {
        accessorKey: "fare",
        header: "Fare",
        cell: ({ row }) => (
          <span className="font-medium">
            ₦{row.original.fare?.toLocaleString() || "0"}
          </span>
        ),
      },
      {
        id: "seats",
        header: "Seats",
        accessorFn: (row) => `${row.booked_seats || 0}/${row.available_seats}`,
        cell: ({ row }) => (
          <span className="text-xs">
            <span className="font-medium">
              {row.original.booked_seats || 0}
            </span>
            <span className="text-muted-foreground">
              /{row.original.available_seats}
            </span>
          </span>
        ),
      },
      {
        accessorKey: "departure_time",
        header: "Departure",
        cell: ({ row }) => (
          <span className="text-xs">
            {formatDate(row.original.departure_time)}
          </span>
        ),
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
        id: "actions",
        cell: ({ row }) => (
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
                <RideDetailDrawer
                  ride={row.original}
                  onCancel={onCancel ? () => onCancel(row.original) : undefined}
                  trigger={
                    <button className="flex w-full items-center text-sm px-2 py-1.5 cursor-default">
                      <MapPin className="h-3.5 w-3.5 mr-1.5" />
                      View Details
                    </button>
                  }
                />
              </DropdownMenuItem>
              {onCancel &&
                !["completed", "cancelled"].includes(row.original.status) && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      variant="destructive"
                      onClick={() => onCancel(row.original)}
                    >
                      <Ban className="h-3.5 w-3.5 mr-1.5" />
                      Cancel Ride
                    </DropdownMenuItem>
                  </>
                )}
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      },
    ],
    [onCancel],
  );

  const table = useReactTable({
    data: rides,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 10 } },
  });

  if (rides.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Route className="h-10 w-10 text-muted-foreground/50 mb-3" />
        <p className="text-sm text-muted-foreground">No rides found</p>
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
            <Label htmlFor="rides-rpp" className="text-sm font-medium">
              Rows per page
            </Label>
            <Select
              value={`${table.getState().pagination.pageSize}`}
              onValueChange={(v) => table.setPageSize(Number(v))}
            >
              <SelectTrigger size="sm" className="w-20" id="rides-rpp">
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
