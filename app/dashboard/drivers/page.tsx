"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DriversTable } from "@/components/tables/drivers-table";
import { DeleteConfirmModal } from "@/components/modals/delete-confirm-modal";
import {
  StatsCard,
  PageHeader,
  SearchInput,
  LoadingState,
} from "@/components/shared";
import { Car, Star, Flag } from "lucide-react";
import { useAdminStore } from "@/store/useAdminStore";
import type { Driver } from "@/store/useAdminStore";

export default function DriversPage() {
  const { drivers, isLoading, getAllDrivers, deleteDriver, flagUser } =
    useAdminStore();

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

  const handleFlagDriver = async (driver: Driver) => {
    if (!driver.user_id?._id) return;
    setActionLoading(true);
    try {
      await flagUser(driver.user_id._id, !driver.user_id.is_flagged);
      await getAllDrivers();
    } finally {
      setActionLoading(false);
    }
  };

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
      <PageHeader title="Drivers" description="Manage registered drivers" />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatsCard icon={Car} value={drivers.length} label="Total Drivers" />
        <StatsCard
          icon={Car}
          iconColor="text-green-500"
          value={drivers.filter((d) => d.status === "active").length}
          label="Active"
        />
        <StatsCard
          icon={Star}
          iconColor="text-yellow-500"
          value={avgRating.toFixed(1)}
          label="Avg Rating"
        />
        <StatsCard
          icon={Flag}
          iconColor="text-destructive"
          value={drivers.filter((d) => d.user_id?.is_flagged).length}
          label="Flagged"
        />
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
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search drivers..."
            />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading && drivers.length === 0 ? (
            <LoadingState />
          ) : (
            <DriversTable
              drivers={filteredDrivers}
              onFlag={handleFlagDriver}
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
