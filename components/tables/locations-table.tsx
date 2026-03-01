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
import {
  MapPin,
  MoreHorizontal,
  Pencil,
  Trash2,
  Star,
  StarOff,
  Eye,
  EyeOff,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
} from "lucide-react";
import type { CampusLocation } from "@/store/useLocationStore";

const categoryStyles: Record<
  string,
  {
    label: string;
    variant: "default" | "secondary" | "outline" | "destructive";
  }
> = {
  academic: { label: "Academic", variant: "default" },
  hostel: { label: "Hostel", variant: "secondary" },
  cafeteria: { label: "Cafeteria", variant: "outline" },
  admin_building: { label: "Admin", variant: "default" },
  religious: { label: "Religious", variant: "secondary" },
  library: { label: "Library", variant: "outline" },
  market: { label: "Market", variant: "secondary" },
  other: { label: "Other", variant: "outline" },
};

interface LocationsTableProps {
  locations: CampusLocation[];
  onEdit: (location: CampusLocation) => void;
  onDelete: (location: CampusLocation) => void;
  onToggleActive: (id: string, is_active: boolean) => void;
  onTogglePopular: (id: string, is_popular: boolean) => void;
}

export function LocationsTable({
  locations,
  onEdit,
  onDelete,
  onToggleActive,
  onTogglePopular,
}: LocationsTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([]);

  const columns = React.useMemo<ColumnDef<CampusLocation>[]>(
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
        accessorKey: "name",
        header: "Name",
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
            <div>
              <p className="font-medium text-sm">{row.original.name}</p>
              {row.original.short_name && (
                <p className="text-[10px] text-muted-foreground">
                  {row.original.short_name}
                </p>
              )}
            </div>
          </div>
        ),
        enableHiding: false,
      },
      {
        accessorKey: "category",
        header: "Category",
        cell: ({ row }) => {
          const style =
            categoryStyles[row.original.category] || categoryStyles.other;
          return (
            <Badge variant={style.variant} className="text-[10px] px-1.5">
              {style.label}
            </Badge>
          );
        },
      },
      {
        id: "coordinates",
        header: "Coordinates",
        cell: ({ row }) => {
          const [lng, lat] = row.original.coordinates.coordinates;
          return (
            <span className="text-xs text-muted-foreground font-mono">
              {lat.toFixed(4)}, {lng.toFixed(4)}
            </span>
          );
        },
      },
      {
        accessorKey: "is_active",
        header: "Status",
        cell: ({ row }) => (
          <Badge
            variant={row.original.is_active ? "default" : "secondary"}
            className="text-[10px] px-1.5"
          >
            {row.original.is_active ? "Active" : "Inactive"}
          </Badge>
        ),
      },
      {
        accessorKey: "is_popular",
        header: "Popular",
        cell: ({ row }) =>
          row.original.is_popular ? (
            <Star className="h-3.5 w-3.5 text-yellow-500 fill-yellow-500" />
          ) : (
            <span className="text-muted-foreground text-xs">—</span>
          ),
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => {
          const loc = row.original;
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(loc)}>
                  <Pencil className="mr-2 h-3.5 w-3.5" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onToggleActive(loc._id, !loc.is_active)}
                >
                  {loc.is_active ? (
                    <>
                      <EyeOff className="mr-2 h-3.5 w-3.5" />
                      Deactivate
                    </>
                  ) : (
                    <>
                      <Eye className="mr-2 h-3.5 w-3.5" />
                      Activate
                    </>
                  )}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onTogglePopular(loc._id, !loc.is_popular)}
                >
                  {loc.is_popular ? (
                    <>
                      <StarOff className="mr-2 h-3.5 w-3.5" />
                      Remove Popular
                    </>
                  ) : (
                    <>
                      <Star className="mr-2 h-3.5 w-3.5" />
                      Mark Popular
                    </>
                  )}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={() => onDelete(loc)}
                >
                  <Trash2 className="mr-2 h-3.5 w-3.5" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    [onEdit, onDelete, onToggleActive, onTogglePopular],
  );

  const table = useReactTable({
    data: locations,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 10 } },
  });

  if (locations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <MapPin className="h-10 w-10 text-muted-foreground/50 mb-3" />
        <p className="text-sm text-muted-foreground">No locations found</p>
        <p className="text-xs text-muted-foreground mt-1">
          Add campus locations for ride pickup and dropoff points.
        </p>
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

      {/* Pagination */}
      <div className="flex items-center justify-between px-2">
        <div className="text-muted-foreground hidden flex-1 text-sm lg:flex">
          {table.getFilteredRowModel().rows.length} location(s) total.
        </div>
        <div className="flex w-full items-center gap-8 lg:w-fit">
          <div className="hidden items-center gap-2 lg:flex">
            <Label htmlFor="locations-rpp" className="text-sm font-medium">
              Rows per page
            </Label>
            <Select
              value={`${table.getState().pagination.pageSize}`}
              onValueChange={(v) => table.setPageSize(Number(v))}
            >
              <SelectTrigger size="sm" className="w-20" id="locations-rpp">
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
