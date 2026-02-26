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
import { DriverDetailDrawer } from "@/components/modals/driver-detail-drawer";
import Link from "next/link";
import {
  Car,
  Trash2,
  Star,
  Flag,
  FlagOff,
  ExternalLink,
  EllipsisVerticalIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
  Loader2,
  ShieldAlert,
} from "lucide-react";
import type { Driver } from "@/store/useAdminStore";
import { ProfileAvatar } from "@/components/shared/profile-avatar";
import { getDriverStatus } from "@/lib/utils/driver-status";

interface DriversTableProps {
  drivers: Driver[];
  onFlag?: (driver: Driver) => void;
  onDelete?: (driver: Driver) => void;
  flaggingId?: string | null;
}

export function DriversTable({
  drivers,
  onFlag,
  onDelete,
  flaggingId,
}: DriversTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([]);

  const columns = React.useMemo<ColumnDef<Driver>[]>(
    () => [
      {
        accessorFn: (row) => row.user_id?.name ?? "Unknown",
        id: "name",
        header: "Driver",
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <ProfileAvatar
              src={row.original.user_id?.profile_picture}
              name={row.original.user_id?.name ?? "Driver"}
              size="sm"
            />
            <div>
              <DriverDetailDrawer
                driver={row.original}
                onFlag={onFlag ? () => onFlag(row.original) : undefined}
                onDelete={onDelete ? () => onDelete(row.original) : undefined}
              />
              <p className="text-[10px] text-muted-foreground">
                {row.original.user_id?.email}
              </p>
            </div>
          </div>
        ),
        enableHiding: false,
      },
      {
        accessorKey: "vehicle_model",
        header: "Vehicle",
        cell: ({ row }) => (
          <div className="flex items-center gap-1.5">
            {row.original.vehicle_color && (
              <div
                className="w-2.5 h-2.5 rounded-full border border-border shrink-0"
                style={{
                  backgroundColor: row.original.vehicle_color.toLowerCase(),
                }}
                title={row.original.vehicle_color}
              />
            )}
            <span>{row.original.vehicle_model}</span>
          </div>
        ),
      },
      {
        accessorKey: "plate_number",
        header: "Plate",
        cell: ({ row }) => (
          <span className="font-mono">{row.original.plate_number}</span>
        ),
      },
      {
        accessorKey: "rating",
        header: "Rating",
        cell: ({ row }) => (
          <div className="flex items-center gap-1">
            <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
            {row.original.rating?.toFixed(1) ?? "N/A"}
          </div>
        ),
      },
      {
        accessorKey: "available_seats",
        header: "Seats",
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
          const isFlagged = row.original.user_id?.is_flagged;
          const statusConfig = getDriverStatus(row.original.status);
          return (
            <div className="flex items-center gap-1.5">
              <Badge
                variant={
                  isFlagged
                    ? "destructive"
                    : (statusConfig.variant as
                        | "outline"
                        | "secondary"
                        | "destructive"
                        | "default")
                }
                className={`px-1.5 ${isFlagged ? "" : statusConfig.className}`}
              >
                {isFlagged ? (
                  <span className="flex items-center gap-1">
                    <ShieldAlert className="h-3 w-3" />
                    Flagged
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5">
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${statusConfig.dotColor}`}
                    />
                    {statusConfig.label}
                  </span>
                )}
              </Badge>
            </div>
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
                <Link href={`/dashboard/drivers/${row.original._id}`}>
                  <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
                  View Details
                </Link>
              </DropdownMenuItem>
              {onFlag &&
                (() => {
                  const isFlagged = row.original.user_id?.is_flagged;
                  const isLoading = flaggingId === row.original.user_id?._id;
                  return (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => onFlag(row.original)}
                        disabled={isLoading}
                        className={
                          isFlagged
                            ? "text-green-600 focus:text-green-600"
                            : "text-amber-600 focus:text-amber-600"
                        }
                      >
                        {isLoading ? (
                          <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                        ) : isFlagged ? (
                          <FlagOff className="h-3.5 w-3.5 mr-1.5" />
                        ) : (
                          <Flag className="h-3.5 w-3.5 mr-1.5" />
                        )}
                        {isFlagged ? "Unflag Driver" : "Flag Driver"}
                      </DropdownMenuItem>
                    </>
                  );
                })()}
              {onDelete && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    variant="destructive"
                    onClick={() => onDelete(row.original)}
                  >
                    <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                    Delete
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      },
    ],
    [onFlag, onDelete],
  );

  const table = useReactTable({
    data: drivers,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 10 } },
  });

  if (drivers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Car className="h-10 w-10 text-muted-foreground/50 mb-3" />
        <p className="text-sm text-muted-foreground">No drivers found</p>
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
            <Label htmlFor="drivers-rpp" className="text-sm font-medium">
              Rows per page
            </Label>
            <Select
              value={`${table.getState().pagination.pageSize}`}
              onValueChange={(v) => table.setPageSize(Number(v))}
            >
              <SelectTrigger size="sm" className="w-20" id="drivers-rpp">
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
