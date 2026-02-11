"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BookingsTable } from "@/components/tables/bookings-table";
import { FileText, Search, MapPin, Clock, DollarSign } from "lucide-react";

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
      <div>
        <h2 className="text-lg font-semibold">Bookings</h2>
        <p className="text-xs text-muted-foreground">
          View and manage ride bookings
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              <div>
                <p className="text-lg font-bold">{mockBookings.length}</p>
                <p className="text-[10px] text-muted-foreground">Total</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-500" />
              <div>
                <p className="text-lg font-bold">
                  {mockBookings.filter((b) => b.status === "in_progress").length}
                </p>
                <p className="text-[10px] text-muted-foreground">Active</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-green-500" />
              <div>
                <p className="text-lg font-bold">
                  {mockBookings.filter((b) => b.status === "completed").length}
                </p>
                <p className="text-[10px] text-muted-foreground">Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-destructive" />
              <div>
                <p className="text-lg font-bold">
                  {mockBookings.filter((b) => b.status === "cancelled").length}
                </p>
                <p className="text-[10px] text-muted-foreground">Cancelled</p>
              </div>
            </div>
          </CardContent>
        </Card>
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
              <div className="relative w-48">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-8 text-xs"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32 h-8 text-xs">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all" className="text-xs">
                    All
                  </SelectItem>
                  <SelectItem value="pending" className="text-xs">
                    Pending
                  </SelectItem>
                  <SelectItem value="in_progress" className="text-xs">
                    In Progress
                  </SelectItem>
                  <SelectItem value="completed" className="text-xs">
                    Completed
                  </SelectItem>
                  <SelectItem value="cancelled" className="text-xs">
                    Cancelled
                  </SelectItem>
                </SelectContent>
              </Select>
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
