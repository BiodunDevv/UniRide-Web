"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ResponsiveModal,
  ResponsiveModalContent,
  ResponsiveModalDescription,
  ResponsiveModalHeader,
  ResponsiveModalTitle,
} from "@/components/ui/responsive-modal";
import { Loader2, MapPin } from "lucide-react";
import type { CampusLocation, LocationInput } from "@/store/useLocationStore";

const CATEGORIES = [
  { value: "academic", label: "Academic" },
  { value: "hostel", label: "Hostel" },
  { value: "cafeteria", label: "Cafeteria" },
  { value: "admin_building", label: "Admin Building" },
  { value: "religious", label: "Religious" },
  { value: "library", label: "Library" },
  { value: "market", label: "Market" },
  { value: "other", label: "Other" },
] as const;

interface LocationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  location?: CampusLocation | null;
  onSubmit: (data: LocationInput) => Promise<void>;
  isLoading?: boolean;
}

export function LocationModal({
  open,
  onOpenChange,
  location,
  onSubmit,
  isLoading = false,
}: LocationModalProps) {
  const isEditing = !!location;

  const [name, setName] = useState("");
  const [shortName, setShortName] = useState("");
  const [category, setCategory] =
    useState<CampusLocation["category"]>("academic");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [address, setAddress] = useState("");
  const [description, setDescription] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [isPopular, setIsPopular] = useState(false);
  const [order, setOrder] = useState("0");

  useEffect(() => {
    if (location) {
      setName(location.name);
      setShortName(location.short_name || "");
      setCategory(location.category);
      setLatitude(String(location.coordinates.coordinates[1]));
      setLongitude(String(location.coordinates.coordinates[0]));
      setAddress(location.address || "");
      setDescription(location.description || "");
      setIsActive(location.is_active);
      setIsPopular(location.is_popular);
      setOrder(String(location.order));
    } else {
      setName("");
      setShortName("");
      setCategory("academic");
      setLatitude("");
      setLongitude("");
      setAddress("");
      setDescription("");
      setIsActive(true);
      setIsPopular(false);
      setOrder("0");
    }
  }, [location, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !latitude || !longitude) return;

    await onSubmit({
      name: name.trim(),
      short_name: shortName.trim() || undefined,
      category,
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      address: address.trim() || undefined,
      description: description.trim() || undefined,
      is_active: isActive,
      is_popular: isPopular,
      order: parseInt(order) || 0,
    });
  };

  return (
    <ResponsiveModal open={open} onOpenChange={onOpenChange}>
      <ResponsiveModalContent className="sm:max-w-lg">
        <ResponsiveModalHeader>
          <ResponsiveModalTitle className="text-sm flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary" />
            {isEditing ? "Edit Location" : "Add Location"}
          </ResponsiveModalTitle>
          <ResponsiveModalDescription className="text-xs">
            {isEditing
              ? "Update the campus location details below."
              : "Add a new campus location for ride pickup and dropoff."}
          </ResponsiveModalDescription>
        </ResponsiveModalHeader>

        <form onSubmit={handleSubmit}>
          <div className="flex-1 min-h-0 overflow-y-auto max-h-[60vh]">
            <div className="space-y-4 px-4 py-3">
              {/* Name */}
              <div className="space-y-1.5">
                <Label htmlFor="loc-name" className="text-xs font-medium">
                  Name *
                </Label>
                <Input
                  id="loc-name"
                  placeholder="e.g. Senate Building"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="text-sm"
                  required
                />
              </div>

              {/* Short Name + Category */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="loc-short" className="text-xs font-medium">
                    Short Name
                  </Label>
                  <Input
                    id="loc-short"
                    placeholder="e.g. Senate"
                    value={shortName}
                    onChange={(e) => setShortName(e.target.value)}
                    className="text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Category *</Label>
                  <Select
                    value={category}
                    onValueChange={(v) =>
                      setCategory(v as CampusLocation["category"])
                    }
                  >
                    <SelectTrigger className="text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((c) => (
                        <SelectItem key={c.value} value={c.value}>
                          {c.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Coordinates */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="loc-lat" className="text-xs font-medium">
                    Latitude *
                  </Label>
                  <Input
                    id="loc-lat"
                    type="number"
                    step="any"
                    placeholder="e.g. 7.5200"
                    value={latitude}
                    onChange={(e) => setLatitude(e.target.value)}
                    className="text-sm"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="loc-lng" className="text-xs font-medium">
                    Longitude *
                  </Label>
                  <Input
                    id="loc-lng"
                    type="number"
                    step="any"
                    placeholder="e.g. 4.5200"
                    value={longitude}
                    onChange={(e) => setLongitude(e.target.value)}
                    className="text-sm"
                    required
                  />
                </div>
              </div>

              {/* Address */}
              <div className="space-y-1.5">
                <Label htmlFor="loc-address" className="text-xs font-medium">
                  Address
                </Label>
                <Input
                  id="loc-address"
                  placeholder="Optional street address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="text-sm"
                />
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <Label htmlFor="loc-desc" className="text-xs font-medium">
                  Description
                </Label>
                <Input
                  id="loc-desc"
                  placeholder="Brief description of this location"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="text-sm"
                />
              </div>

              {/* Order */}
              <div className="space-y-1.5">
                <Label htmlFor="loc-order" className="text-xs font-medium">
                  Display Order
                </Label>
                <Input
                  id="loc-order"
                  type="number"
                  value={order}
                  onChange={(e) => setOrder(e.target.value)}
                  className="text-sm w-24"
                />
              </div>

              {/* Toggles */}
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="loc-active"
                    checked={isActive}
                    onCheckedChange={(c) => setIsActive(c === true)}
                  />
                  <Label htmlFor="loc-active" className="text-xs">
                    Active
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="loc-popular"
                    checked={isPopular}
                    onCheckedChange={(c) => setIsPopular(c === true)}
                  />
                  <Label htmlFor="loc-popular" className="text-xs">
                    Popular
                  </Label>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col-reverse sm:flex-row gap-2 px-4 pb-4 pt-2 shrink-0 border-t sm:justify-end">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="text-xs w-full sm:w-auto"
              disabled={isLoading}
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              className="text-xs w-full sm:w-auto"
              disabled={isLoading || !name.trim() || !latitude || !longitude}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                  {isEditing ? "Updating..." : "Creating..."}
                </>
              ) : isEditing ? (
                "Update Location"
              ) : (
                "Create Location"
              )}
            </Button>
          </div>
        </form>
      </ResponsiveModalContent>
    </ResponsiveModal>
  );
}
