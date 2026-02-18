"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BookingsTable } from "@/components/tables/bookings-table";
import {
  StatsCard,
  PageHeader,
  SearchInput,
  StatusFilter,
} from "@/components/shared";
import { FileText, MapPin, Clock, DollarSign } from "lucide-react";

const mockBookings = [
  {
    id: "BK001",
    rider: "Ayo Adeniyi",
    driver: "Adebayo Ogunleye",
    from: "Lekki Phase 1",
    to: "Victoria Island",
    fare: "\u20A61,200",
    status: "completed",
    date: "2024-12-03 14:30",
  },
  {
    id: "BK002",
    rider: "Blessing Okoro",
    driver: "Chidinma Obi",
    from: "Wuse II",
    to: "Maitama",
    fare: "\u20A6800",
    status: "completed",
    date: "2024-12-03 13:15",
  },
  {
    id: "BK003",
    rider: "Chukwuma Ibe",
    driver: "Hassan Yusuf",
    from: "Ikoyi",
    to: "Surulere",
    fare: "\u20A61,500",
    status: "in_progress",
    date: "2024-12-03 15:00",
  },
  {
    id: "BK004",
    rider: "Dara Oluwole",
    driver: null,
    from: "Ajah",
    to: "Ikeja",
    fare: "\u20A62,300",
    status: "cancelled",
    date: "2024-12-03 12:45",
  },
  {
    id: "BK005",
    rider: "Efe Oghenekaro",
    driver: "Emeka Nwosu",
    from: "GRA",
    to: "Trans Amadi",
    fare: "\u20A6950",
    status: "completed",
    date: "2024-12-03 11:00",
  },
  {
    id: "BK006",
    rider: "Funmi Adesanya",
    driver: "Adebayo Ogunleye",
    from: "Ogba",
    to: "Maryland",
    fare: "\u20A6700",
    status: "pending",
    date: "2024-12-03 15:30",
  },
];

export default function BookingsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredBookings = mockBookings.filter((booking) => {
    const matchesSearch =
      booking.rider.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.from.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.to.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || booking.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
      <PageHeader
        title="Bookings"
        description="View and manage ride bookings"
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatsCard icon={FileText} value={mockBookings.length} label="Total" />
        <StatsCard
          icon={Clock}
          iconColor="text-blue-500"
          value={mockBookings.filter((b) => b.status === "in_progress").length}
          label="Active"
        />
        <StatsCard
          icon={DollarSign}
          iconColor="text-green-500"
          value={mockBookings.filter((b) => b.status === "completed").length}
          label="Completed"
        />
        <StatsCard
          icon={MapPin}
          iconColor="text-destructive"
          value={mockBookings.filter((b) => b.status === "cancelled").length}
          label="Cancelled"
        />
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-sm">All Bookings</CardTitle>
              <CardDescription className="text-xs">
                {filteredBookings.length} booking
                {filteredBookings.length !== 1 ? "s" : ""}
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
                  { label: "Pending", value: "pending" },
                  { label: "In Progress", value: "in_progress" },
                  { label: "Completed", value: "completed" },
                  { label: "Cancelled", value: "cancelled" },
                ]}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <BookingsTable bookings={filteredBookings} />
        </CardContent>
      </Card>
    </div>
  );
}
