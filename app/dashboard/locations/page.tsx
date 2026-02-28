"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LocationsTable } from "@/components/tables/locations-table";
import { LocationModal } from "@/components/modals/location-modal";
import { DeleteConfirmModal } from "@/components/modals/delete-confirm-modal";
import {
  PageHeader,
  StatsCard,
  SearchInput,
  LoadingState,
} from "@/components/shared";
import { MapPin, Star, Eye, EyeOff, Plus } from "lucide-react";
import {
  useLocationStore,
  type CampusLocation,
  type LocationInput,
} from "@/store/useLocationStore";

export default function LocationsPage() {
  const {
    locations,
    isLoading,
    getLocations,
    createLocation,
    updateLocation,
    deleteLocation,
    toggleActive,
    togglePopular,
  } = useLocationStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedLocation, setSelectedLocation] =
    useState<CampusLocation | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    getLocations();
  }, [getLocations]);

  const filteredLocations = useMemo(() => {
    return locations.filter((loc) => {
      const matchSearch =
        loc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (loc.short_name || "")
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        (loc.address || "").toLowerCase().includes(searchQuery.toLowerCase());
      const matchCategory =
        categoryFilter === "all" || loc.category === categoryFilter;
      return matchSearch && matchCategory;
    });
  }, [locations, searchQuery, categoryFilter]);

  const stats = useMemo(() => {
    const total = locations.length;
    const active = locations.filter((l) => l.is_active).length;
    const popular = locations.filter((l) => l.is_popular).length;
    const inactive = total - active;
    return { total, active, popular, inactive };
  }, [locations]);

  const handleCreate = () => {
    setSelectedLocation(null);
    setShowModal(true);
  };

  const handleEdit = (location: CampusLocation) => {
    setSelectedLocation(location);
    setShowModal(true);
  };

  const handleDelete = (location: CampusLocation) => {
    setSelectedLocation(location);
    setShowDeleteModal(true);
  };

  const handleSubmit = async (data: LocationInput) => {
    setActionLoading(true);
    try {
      if (selectedLocation) {
        await updateLocation(selectedLocation._id, data);
      } else {
        await createLocation(data);
      }
      setShowModal(false);
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedLocation) return;
    setActionLoading(true);
    try {
      await deleteLocation(selectedLocation._id);
      setShowDeleteModal(false);
      setSelectedLocation(null);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
      <PageHeader
        title="Campus Locations"
        description="Manage pickup and dropoff points across the campus"
        actions={
          <Button size="sm" className="text-xs" onClick={handleCreate}>
            <Plus className="h-3.5 w-3.5 mr-1.5" />
            Add Location
          </Button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatsCard icon={MapPin} value={stats.total} label="Total Locations" />
        <StatsCard
          icon={Eye}
          iconColor="text-green-500"
          value={stats.active}
          label="Active"
        />
        <StatsCard
          icon={Star}
          iconColor="text-yellow-500"
          value={stats.popular}
          label="Popular"
        />
        <StatsCard
          icon={EyeOff}
          iconColor="text-muted-foreground"
          value={stats.inactive}
          label="Inactive"
        />
      </div>

      {/* Table */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <CardTitle className="text-sm">All Locations</CardTitle>
              <CardDescription className="text-xs">
                {filteredLocations.length} of {locations.length} locations shown
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="h-8 rounded-md border border-input bg-background px-2 text-xs"
              >
                <option value="all">All Categories</option>
                <option value="academic">Academic</option>
                <option value="hostel">Hostel</option>
                <option value="cafeteria">Cafeteria</option>
                <option value="admin_building">Admin Building</option>
                <option value="religious">Religious</option>
                <option value="library">Library</option>
                <option value="market">Market</option>
                <option value="other">Other</option>
              </select>
              <SearchInput
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Search locations..."
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading && locations.length === 0 ? (
            <LoadingState />
          ) : (
            <LocationsTable
              locations={filteredLocations}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onToggleActive={toggleActive}
              onTogglePopular={togglePopular}
            />
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Modal */}
      <LocationModal
        open={showModal}
        onOpenChange={setShowModal}
        location={selectedLocation}
        onSubmit={handleSubmit}
        isLoading={actionLoading}
      />

      {/* Delete Confirmation */}
      <DeleteConfirmModal
        open={showDeleteModal}
        onOpenChange={setShowDeleteModal}
        title="Delete Location"
        entityName={selectedLocation?.name || ""}
        entityType="location"
        onConfirm={async () => {
          await handleConfirmDelete();
        }}
        isLoading={actionLoading}
        showForceOption={false}
      />
    </div>
  );
}
