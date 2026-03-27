"use client";

import "leaflet/dist/leaflet.css";

import { useCallback, useEffect, useMemo, useState } from "react";
import { io, Socket } from "socket.io-client";
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Tooltip,
  useMap,
  Marker,
} from "react-leaflet";
import { divIcon, type LatLngBoundsExpression, type LatLngTuple } from "leaflet";
import { useAuthStore } from "@/store/useAuthStore";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
  Activity,
  Car,
  Clock3,
  ExternalLink,
  LocateFixed,
  Radio,
  RefreshCw,
  Route,
  UserRound,
  Wifi,
  WifiOff,
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

interface DriverMarker {
  driver_id: string;
  user_id: string;
  name: string;
  profile_picture?: string | null;
  vehicle_model?: string;
  vehicle_color?: string;
  plate_number?: string;
  rating?: number;
  is_online: boolean;
  heading?: number;
  status?: string;
  location: {
    latitude: number;
    longitude: number;
  } | null;
  last_online_at?: string;
}

interface ActiveRiderMarker {
  booking_id?: string;
  user_id: string;
  name: string;
  profile_picture?: string | null;
  email?: string | null;
  ride_id?: string;
  ride_status?: string;
  booking_status?: string;
  pickup_name?: string;
  dropoff_name?: string;
  last_updated_at?: string;
  location: {
    latitude: number;
    longitude: number;
  } | null;
}

type EntityView = "all" | "drivers" | "riders";
type SelectedEntity =
  | { type: "driver"; data: DriverMarker }
  | { type: "rider"; data: ActiveRiderMarker }
  | null;
type LiveEntityItem = Exclude<SelectedEntity, null>;

function MapViewport({
  points,
  fitSignal,
}: {
  points: Array<{ latitude: number; longitude: number }>;
  fitSignal: number;
}) {
  const map = useMap();

  useEffect(() => {
    if (points.length === 0) return;
    if (points.length === 1) {
      map.setView([points[0].latitude, points[0].longitude], 15);
      return;
    }

    const bounds: LatLngBoundsExpression = points.map(
      (point) => [point.latitude, point.longitude] as LatLngTuple,
    );

    map.fitBounds(bounds, { padding: [48, 48] });
  }, [fitSignal, map, points]);

  return null;
}

function formatTime(value?: string) {
  if (!value) return "Unavailable";
  return new Date(value).toLocaleString("en-NG", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function LiveMapPage() {
  const { token } = useAuthStore();
  const [drivers, setDrivers] = useState<DriverMarker[]>([]);
  const [riders, setRiders] = useState<ActiveRiderMarker[]>([]);
  const [selected, setSelected] = useState<SelectedEntity>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [socketStatus, setSocketStatus] = useState<
    "connecting" | "connected" | "disconnected"
  >("connecting");
  const [view, setView] = useState<EntityView>("all");
  const [showOfflineDrivers, setShowOfflineDrivers] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);
  const [mapStyle, setMapStyle] = useState<"satellite" | "street">(
    "satellite",
  );
  const [fitSignal, setFitSignal] = useState(0);
  const [hasInitializedViewport, setHasInitializedViewport] = useState(false);

  const fetchLiveData = useCallback(
    async (showSpinner = false, shouldFit = false) => {
      if (!token) return;
      if (showSpinner) setRefreshing(true);

      try {
        const [driverRes, riderRes] = await Promise.all([
          fetch(`${API_URL}/api/driver/locations`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_URL}/api/driver/active-riders`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const [driverJson, riderJson] = await Promise.all([
          driverRes.json(),
          riderRes.json(),
        ]);

        if (driverJson.success) {
          setDrivers(driverJson.data || []);
        }

        if (riderJson.success) {
          setRiders(riderJson.data || []);
        }

        setLastSyncedAt(new Date().toISOString());
        if (shouldFit || !hasInitializedViewport) {
          setFitSignal((current) => current + 1);
          setHasInitializedViewport(true);
        }
      } catch (error) {
        console.error("Failed to load live map data:", error);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [hasInitializedViewport, token],
  );

  useEffect(() => {
    fetchLiveData(false, true);
    const interval = setInterval(() => fetchLiveData(), 15000);
    return () => clearInterval(interval);
  }, [fetchLiveData]);

  useEffect(() => {
    if (!token) return;

    const socket: Socket = io(API_URL, {
      auth: { token },
      transports: ["websocket"],
    });

    socket.on("connect", () => {
      setSocketStatus("connected");
      socket.emit("join-live-map");
    });

    socket.on("disconnect", () => {
      setSocketStatus("disconnected");
    });

    socket.on("connect_error", () => {
      setSocketStatus("disconnected");
    });

    socket.on("driver-location-updated", (data: any) => {
      const latitude = data?.location?.latitude ?? data?.latitude;
      const longitude = data?.location?.longitude ?? data?.longitude;

      if (typeof latitude !== "number" || typeof longitude !== "number") {
        return;
      }

      setDrivers((current) => {
        const existing = current.find(
          (driver) => driver.driver_id === data.driver_id,
        );

        if (!existing) {
          fetchLiveData();
          return current;
        }

        return current.map((driver) =>
          driver.driver_id === data.driver_id
            ? {
                ...driver,
                heading: data.heading ?? driver.heading,
                is_online: true,
                last_online_at:
                  data.timestamp || new Date().toISOString(),
                location: { latitude, longitude },
              }
            : driver,
        );
      });
    });

    socket.on("driver-offline", (data: any) => {
      setDrivers((current) =>
        current.map((driver) =>
          driver.driver_id === data.driver_id
            ? {
                ...driver,
                is_online: false,
                location: data?.last_known_location?.coordinates
                  ? {
                      latitude: data.last_known_location.coordinates[1],
                      longitude: data.last_known_location.coordinates[0],
                    }
                  : driver.location,
                last_online_at:
                  data.timestamp || driver.last_online_at,
              }
            : driver,
        ),
      );
    });

    socket.on("active-rider-location-updated", (data: any) => {
      const latitude = data?.location?.latitude;
      const longitude = data?.location?.longitude;

      if (typeof latitude !== "number" || typeof longitude !== "number") {
        return;
      }

      setRiders((current) => {
        const existing = current.find((rider) => rider.user_id === data.user_id);

        if (!existing) {
          fetchLiveData();
          return current;
        }

        return current.map((rider) =>
          rider.user_id === data.user_id
            ? {
                ...rider,
                ...data,
                location: { latitude, longitude },
                last_updated_at:
                  data.last_updated_at || new Date().toISOString(),
              }
            : rider,
        );
      });
    });

    return () => {
      socket.emit("leave-live-map");
      socket.disconnect();
    };
  }, [fetchLiveData, token]);

  const filteredDrivers = useMemo(
    () =>
      drivers.filter(
        (driver) => driver.location && (showOfflineDrivers || driver.is_online),
      ),
    [drivers, showOfflineDrivers],
  );

  const filteredRiders = useMemo(
    () => riders.filter((rider) => rider.location),
    [riders],
  );

  const visiblePoints = useMemo(() => {
    const points: Array<{ latitude: number; longitude: number }> = [];

    if (view === "all" || view === "drivers") {
      filteredDrivers.forEach((driver) => {
        if (driver.location) points.push(driver.location);
      });
    }

    if (view === "all" || view === "riders") {
      filteredRiders.forEach((rider) => {
        if (rider.location) points.push(rider.location);
      });
    }

    return points;
  }, [filteredDrivers, filteredRiders, view]);

  const listItems = useMemo(() => {
    const items: LiveEntityItem[] = [];

    if (view === "all" || view === "drivers") {
      filteredDrivers.forEach((driver) =>
        items.push({ type: "driver", data: driver }),
      );
    }

    if (view === "all" || view === "riders") {
      filteredRiders.forEach((rider) =>
        items.push({ type: "rider", data: rider }),
      );
    }

    return items;
  }, [filteredDrivers, filteredRiders, view]);

  const stats = useMemo(
    () => ({
      totalDrivers: drivers.length,
      onlineDrivers: drivers.filter((driver) => driver.is_online).length,
      activeRiders: riders.length,
      visibleEntities: listItems.length,
    }),
    [drivers, riders, listItems.length],
  );

  const selectedCoordinates =
    selected?.data.location &&
    `${selected.data.location.latitude},${selected.data.location.longitude}`;

  useEffect(() => {
    if (!hasInitializedViewport) return;
    setFitSignal((current) => current + 1);
  }, [hasInitializedViewport, showOfflineDrivers, view]);

  const buildDriverIcon = useCallback(
    (driver: DriverMarker) =>
      divIcon({
        className: "driver-car-icon",
        iconSize: [42, 42],
        iconAnchor: [21, 21],
        html: `
          <div style="position:relative;width:42px;height:42px;display:flex;align-items:center;justify-content:center;">
            <div style="
              position:absolute;
              inset:6px;
              border-radius:9999px;
              background:${driver.is_online ? "rgba(20,184,166,0.18)" : "rgba(148,163,184,0.18)"};
              border:2px solid ${driver.is_online ? "#0f766e" : "#64748b"};
              box-shadow:0 10px 24px rgba(15,23,42,0.14);
            "></div>
            <div style="
              position:relative;
              z-index:1;
              font-size:18px;
              line-height:1;
              transform:rotate(${driver.heading || 0}deg);
              filter:drop-shadow(0 2px 4px rgba(15,23,42,0.24));
            ">🚗</div>
          </div>
        `,
      }),
    [],
  );

  return (
    <div className="flex min-h-[calc(100vh-5rem)] flex-col gap-6 p-4 md:p-6">
      <Card className="border-slate-200 bg-gradient-to-br from-white via-slate-50 to-slate-100">
        <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className="border-emerald-200 bg-emerald-50 text-emerald-700"
              >
                <Radio className="mr-1 h-3.5 w-3.5" />
                Live operations
              </Badge>
              <Badge
                variant="outline"
                className={cn(
                  socketStatus === "connected"
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                    : socketStatus === "connecting"
                      ? "border-amber-200 bg-amber-50 text-amber-700"
                      : "border-rose-200 bg-rose-50 text-rose-700",
                )}
              >
                {socketStatus === "connected" ? (
                  <Wifi className="mr-1 h-3.5 w-3.5" />
                ) : (
                  <WifiOff className="mr-1 h-3.5 w-3.5" />
                )}
                {socketStatus}
              </Badge>
            </div>
            <div>
              <CardTitle className="text-2xl font-semibold tracking-tight text-slate-950">
                Campus live map
              </CardTitle>
              <CardDescription className="max-w-2xl text-sm text-slate-600">
                Monitor approved drivers and only riders in accepted or
                in-progress trips. The map stays synced through REST preload plus
                live socket updates.
              </CardDescription>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {(["all", "drivers", "riders"] as const).map((option) => (
              <Button
                key={option}
                variant={view === option ? "default" : "outline"}
                size="sm"
                onClick={() => setView(option)}
              >
                {option === "all"
                  ? "All activity"
                  : option === "drivers"
                    ? "Drivers only"
                    : "Active riders"}
              </Button>
            ))}
            <Button
              variant={showOfflineDrivers ? "secondary" : "outline"}
              size="sm"
              onClick={() => setShowOfflineDrivers((current) => !current)}
            >
              {showOfflineDrivers ? "Hide offline drivers" : "Show offline drivers"}
            </Button>
            <Button
              variant={mapStyle === "satellite" ? "default" : "outline"}
              size="sm"
              onClick={() =>
                setMapStyle((current) =>
                  current === "satellite" ? "street" : "satellite",
                )
              }
            >
              {mapStyle === "satellite" ? "Satellite" : "Street"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchLiveData(true, true)}
              disabled={refreshing}
            >
              <RefreshCw
                className={cn("mr-2 h-4 w-4", refreshing && "animate-spin")}
              />
              Refresh
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setFitSignal((current) => current + 1)}
            >
              Fit map
            </Button>
          </div>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4">
            <div className="flex items-center gap-2 text-slate-500">
              <Car className="h-4 w-4" />
              <span className="text-sm">Approved drivers</span>
            </div>
            <div className="mt-2 text-3xl font-semibold text-slate-950">
              {stats.totalDrivers}
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4">
            <div className="flex items-center gap-2 text-slate-500">
              <Activity className="h-4 w-4" />
              <span className="text-sm">Drivers live now</span>
            </div>
            <div className="mt-2 text-3xl font-semibold text-slate-950">
              {stats.onlineDrivers}
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4">
            <div className="flex items-center gap-2 text-slate-500">
              <UserRound className="h-4 w-4" />
              <span className="text-sm">Active riders</span>
            </div>
            <div className="mt-2 text-3xl font-semibold text-slate-950">
              {stats.activeRiders}
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4">
            <div className="flex items-center gap-2 text-slate-500">
              <Clock3 className="h-4 w-4" />
              <span className="text-sm">Last synced</span>
            </div>
            <div className="mt-2 text-sm font-medium text-slate-950">
              {lastSyncedAt ? formatTime(lastSyncedAt) : "Waiting for data"}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.65fr)_380px]">
        <Card className="overflow-hidden border-slate-200">
          <CardContent className="relative p-0">
            <div className="h-[70vh] min-h-[560px] bg-slate-100">
              {loading ? (
                <div className="flex h-full items-center justify-center text-sm text-slate-500">
                  Loading live map data...
                </div>
              ) : visiblePoints.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center">
                  <LocateFixed className="h-10 w-10 text-slate-300" />
                  <div>
                    <p className="text-base font-medium text-slate-900">
                      No live locations to display
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      When approved drivers or active riders start streaming
                      location updates, they will appear here automatically.
                    </p>
                  </div>
                </div>
              ) : (
                <MapContainer
                  center={[7.52, 4.52]}
                  zoom={14}
                  scrollWheelZoom
                  className="h-full w-full"
                >
                  <TileLayer
                    attribution={
                      mapStyle === "satellite"
                        ? 'Tiles &copy; Esri'
                        : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    }
                    url={
                      mapStyle === "satellite"
                        ? "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                        : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    }
                  />
                  <MapViewport points={visiblePoints} fitSignal={fitSignal} />

                  {(view === "all" || view === "drivers") &&
                    filteredDrivers.map((driver) =>
                      driver.location ? (
                        <Marker
                          key={driver.driver_id}
                          position={[
                            driver.location.latitude,
                            driver.location.longitude,
                          ]}
                          icon={buildDriverIcon(driver)}
                          eventHandlers={{
                            click: () =>
                              setSelected({ type: "driver", data: driver }),
                          }}
                        >
                          <Tooltip direction="top" offset={[0, -8]} opacity={1}>
                            <div className="space-y-1">
                              <p className="font-medium">{driver.name}</p>
                              <p className="text-xs opacity-80">
                                {driver.vehicle_model || "Vehicle unavailable"}
                              </p>
                            </div>
                          </Tooltip>
                        </Marker>
                      ) : null,
                    )}

                  {(view === "all" || view === "riders") &&
                    filteredRiders.map((rider) =>
                      rider.location ? (
                        <CircleMarker
                          key={rider.user_id}
                          center={[
                            rider.location.latitude,
                            rider.location.longitude,
                          ]}
                          radius={9}
                          pathOptions={{
                            color: "#7c2d12",
                            fillColor: "#f97316",
                            fillOpacity: 0.92,
                            weight: 2,
                          }}
                          eventHandlers={{
                            click: () =>
                              setSelected({ type: "rider", data: rider }),
                          }}
                        >
                          <Tooltip direction="top" offset={[0, -8]} opacity={1}>
                            <div className="space-y-1">
                              <p className="font-medium">{rider.name}</p>
                              <p className="text-xs opacity-80">
                                {rider.pickup_name || "Pickup"} to{" "}
                                {rider.dropoff_name || "Destination"}
                              </p>
                            </div>
                          </Tooltip>
                        </CircleMarker>
                      ) : null,
                    )}
                </MapContainer>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6">
          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle className="text-base font-semibold text-slate-950">
                Live entities
              </CardTitle>
              <CardDescription>
                Operators can select a driver or active rider to inspect their
                latest map state.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[320px]">
                <div className="space-y-2 p-4">
                  {listItems.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-6 text-center text-sm text-slate-500">
                      No entities match the current filters.
                    </div>
                  ) : (
                    listItems.map((item) => {
                      const isDriver = item?.type === "driver";
                      const id = isDriver
                        ? item.data.driver_id
                        : item.data.user_id;
                      const title = item.data.name;
                      const subtitle = isDriver
                        ? `${item.data.vehicle_model || "Vehicle unavailable"}`
                        : `${item.data.pickup_name || "Pickup"} to ${item.data.dropoff_name || "Destination"}`;

                      return (
                        <button
                          key={`${item?.type}-${id}`}
                          type="button"
                          className={cn(
                            "w-full rounded-2xl border px-4 py-3 text-left transition-colors",
                            selected &&
                              selected.type === item?.type &&
                              ((selected.type === "driver" &&
                                selected.data.driver_id ===
                                  (item.data as DriverMarker).driver_id) ||
                                (selected.type === "rider" &&
                                  selected.data.user_id ===
                                    (item.data as ActiveRiderMarker).user_id))
                              ? "border-slate-900 bg-slate-900 text-white"
                              : "border-slate-200 bg-white hover:bg-slate-50",
                          )}
                          onClick={() => setSelected(item)}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <div className="flex items-center gap-2">
                                {isDriver ? (
                                  <Car className="h-4 w-4" />
                                ) : (
                                  <UserRound className="h-4 w-4" />
                                )}
                                <span className="text-sm font-semibold">
                                  {title}
                                </span>
                              </div>
                              <p className="mt-1 text-xs opacity-75">
                                {subtitle}
                              </p>
                            </div>
                            <Badge
                              variant="outline"
                              className={cn(
                                "shrink-0",
                                isDriver
                                  ? (item.data as DriverMarker).is_online
                                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                    : "border-slate-200 bg-slate-100 text-slate-600"
                                  : "border-orange-200 bg-orange-50 text-orange-700",
                              )}
                            >
                              {isDriver
                                ? (item.data as DriverMarker).is_online
                                  ? "Live"
                                  : "Last seen"
                                : (item.data as ActiveRiderMarker).ride_status ||
                                  "Active"}
                            </Badge>
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle className="text-base font-semibold text-slate-950">
                Detail panel
              </CardTitle>
              <CardDescription>
                Focused operational context for the selected live entity.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!selected ? (
                <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-10 text-center text-sm text-slate-500">
                  Select a driver or rider from the list or directly from the
                  map to inspect live details.
                </div>
              ) : selected.type === "driver" ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-lg font-semibold text-slate-950">
                        {selected.data.name}
                      </p>
                      <p className="text-sm text-slate-500">
                        {selected.data.vehicle_model || "Vehicle unavailable"}{" "}
                        {selected.data.plate_number
                          ? `• ${selected.data.plate_number}`
                          : ""}
                      </p>
                    </div>
                    <Badge
                      className={
                        selected.data.is_online
                          ? "bg-emerald-600 text-white"
                          : "bg-slate-500 text-white"
                      }
                    >
                      {selected.data.is_online ? "Online" : "Offline"}
                    </Badge>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl bg-slate-50 px-4 py-3">
                      <p className="text-xs text-slate-500">Driver rating</p>
                      <p className="mt-1 text-lg font-semibold text-slate-950">
                        {selected.data.rating?.toFixed(1) || "N/A"}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-slate-50 px-4 py-3">
                      <p className="text-xs text-slate-500">Vehicle color</p>
                      <p className="mt-1 text-lg font-semibold text-slate-950">
                        {selected.data.vehicle_color || "Unknown"}
                      </p>
                    </div>
                  </div>
                  <div className="rounded-2xl border border-slate-200 px-4 py-4">
                    <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
                      Location state
                    </p>
                    <p className="mt-2 text-sm text-slate-700">
                      Last activity: {formatTime(selected.data.last_online_at)}
                    </p>
                    <p className="mt-1 text-sm text-slate-700">
                      Coordinates:{" "}
                      {selected.data.location
                        ? `${selected.data.location.latitude.toFixed(5)}, ${selected.data.location.longitude.toFixed(5)}`
                        : "Unavailable"}
                    </p>
                  </div>
                  {selectedCoordinates ? (
                    <Button asChild className="w-full">
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${selectedCoordinates}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Open in Google Maps
                      </a>
                    </Button>
                  ) : null}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-lg font-semibold text-slate-950">
                        {selected.data.name}
                      </p>
                      <p className="text-sm text-slate-500">
                        Ride {selected.data.ride_id || "unavailable"}
                      </p>
                    </div>
                    <Badge className="bg-orange-500 text-white">
                      {selected.data.ride_status || "Active"}
                    </Badge>
                  </div>
                  <div className="rounded-2xl border border-slate-200 px-4 py-4">
                    <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
                      Route summary
                    </p>
                    <div className="mt-3 flex items-center gap-2 text-sm text-slate-700">
                      <Route className="h-4 w-4 text-slate-400" />
                      <span>
                        {selected.data.pickup_name || "Pickup"} to{" "}
                        {selected.data.dropoff_name || "Destination"}
                      </span>
                    </div>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl bg-slate-50 px-4 py-3">
                      <p className="text-xs text-slate-500">Booking status</p>
                      <p className="mt-1 text-lg font-semibold text-slate-950">
                        {selected.data.booking_status || "Unknown"}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-slate-50 px-4 py-3">
                      <p className="text-xs text-slate-500">Last update</p>
                      <p className="mt-1 text-lg font-semibold text-slate-950">
                        {formatTime(selected.data.last_updated_at)}
                      </p>
                    </div>
                  </div>
                  <div className="rounded-2xl border border-slate-200 px-4 py-4">
                    <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
                      Current coordinates
                    </p>
                    <p className="mt-2 text-sm text-slate-700">
                      {selected.data.location
                        ? `${selected.data.location.latitude.toFixed(5)}, ${selected.data.location.longitude.toFixed(5)}`
                        : "Unavailable"}
                    </p>
                    {selected.data.email ? (
                      <p className="mt-2 text-sm text-slate-700">
                        Contact: {selected.data.email}
                      </p>
                    ) : null}
                  </div>
                  {selectedCoordinates ? (
                    <Button asChild className="w-full">
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${selectedCoordinates}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Open in Google Maps
                      </a>
                    </Button>
                  ) : null}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
