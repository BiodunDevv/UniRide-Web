"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { DriversTable } from "@/components/tables/drivers-table";
import { DeleteConfirmModal } from "@/components/modals/delete-confirm-modal";
import { Car, Search, Star, Loader2 } from "lucide-react";
import { useAdminStore } from "@/store/useAdminStore";
import type { Driver } from "@/store/useAdminStore";

export default function DriversPage() {
  const { drivers, isLoading, getAllDrivers, deleteDriver } = useAdminStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    getAllDrivers();
  }, [getAllDrivers]);

  const filteredDrivers = useMemo(
    () =>
      drivers.filter(
        (driver) =>
          (driver.user_id?.name || "")
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          (driver.user_id?.email || "")
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          driver.plate_number
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          driver.vehicle_model
            .toLowerCase()
            .includes(searchQuery.toLowerCase()),
      ),
    [drivers, searchQuery],
  );

  const avgRating = useMemo(() => {
    const rated = drivers.filter((d) => d.rating > 0);
    if (rated.length === 0) return 0;
    return rated.reduce((acc, d) => acc + d.rating, 0) / rated.length;
  }, [drivers]);

  const handleDeleteDriver = async (forceDelete: boolean) => {
    if (!selectedDriver) return;
    setActionLoading(true);
    try {
      await deleteDriver(selectedDriver._id, forceDelete);
      setShowDeleteModal(false);
      setSelectedDriver(null);
      await getAllDrivers();
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
      <div>
        <h2 className="text-lg font-semibold">Drivers</h2>
        <p className="text-xs text-muted-foreground">
          Manage registered drivers
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Car className="h-4 w-4 text-primary" />
              <div>
                <p className="text-lg font-bold">{drivers.length}</p>
                <p className="text-[10px] text-muted-foreground">
                  Total Drivers
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Car className="h-4 w-4 text-green-500" />
              <div>
                <p className="text-lg font-bold">
                  {drivers.filter((d) => d.status === "active").length}
                </p>
                <p className="text-[10px] text-muted-foreground">Active</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-yellow-500" />
              <div>
                <p className="text-lg font-bold">{avgRating.toFixed(1)}</p>
                <p className="text-[10px] text-muted-foreground">Avg Rating</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Car className="h-4 w-4 text-accent" />
              <div>
                <p className="text-lg font-bold">
                  {drivers.reduce((acc, d) => acc + (d.total_ratings || 0), 0)}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  Total Ratings
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-sm">All Drivers</CardTitle>
              <CardDescription className="text-xs">
                {filteredDrivers.length} driver
                {filteredDrivers.length !== 1 ? "s" : ""}
              </CardDescription>
            </div>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Search drivers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-8 text-xs"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading && drivers.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <DriversTable
              drivers={filteredDrivers}
              onDelete={(driver) => {
                setSelectedDriver(driver);
                setShowDeleteModal(true);
              }}
            />
          )}
        </CardContent>
      </Card>

      {selectedDriver && (
        <DeleteConfirmModal
          open={showDeleteModal}
          onOpenChange={(open) => {
            setShowDeleteModal(open);
            if (!open) setSelectedDriver(null);
          }}
          title="Delete Driver"
          entityName={selectedDriver.user_id?.name ?? "Driver"}
          entityType="driver"
          onConfirm={handleDeleteDriver}
          isLoading={actionLoading}
          showForceOption
        />
      )}
    </div>
  );
}
