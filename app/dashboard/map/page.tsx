"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { io, Socket } from "socket.io-client";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Map,
  Layers,
  Car,
  Star,
  RefreshCw,
  X,
  Mountain,
  Satellite,
  Globe,
  Navigation,
  Eye,
  Clock,
  Radio,
  Activity,
} from "lucide-react";

const MAPBOX_TOKEN =
  process.env.NEXT_PUBLIC_MAPBOX_TOKEN ||
  "find_your_own_token_at_mapbox.com_and_put_it_here";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

mapboxgl.accessToken = MAPBOX_TOKEN;

interface DriverMarker {
  driver_id: string;
  name: string;
  vehicle_model: string;
  plate_number: string;
  vehicle_color: string;
  rating: number;
  is_online: boolean;
  heading: number;
  location: {
    latitude: number;
    longitude: number;
  };
  last_online_at: string;
}

const MAP_STYLES = [
  {
    id: "satellite-streets",
    label: "Hybrid",
    icon: Satellite,
    url: "mapbox://styles/mapbox/satellite-streets-v12",
  },
  {
    id: "dark",
    label: "Dark",
    icon: Globe,
    url: "mapbox://styles/mapbox/dark-v11",
  },
  {
    id: "light",
    label: "Light",
    icon: Eye,
    url: "mapbox://styles/mapbox/light-v11",
  },
  {
    id: "streets",
    label: "Streets",
    icon: Map,
    url: "mapbox://styles/mapbox/streets-v12",
  },
  {
    id: "satellite",
    label: "Satellite",
    icon: Satellite,
    url: "mapbox://styles/mapbox/satellite-v9",
  },

  {
    id: "outdoors",
    label: "Terrain",
    icon: Mountain,
    url: "mapbox://styles/mapbox/outdoors-v12",
  },
];

export default function LiveMapPage() {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<Record<string, mapboxgl.Marker>>({});
  const socketRef = useRef<Socket | null>(null);
  const { token } = useAuthStore();

  const [drivers, setDrivers] = useState<DriverMarker[]>([]);
  const [selectedDriver, setSelectedDriver] = useState<DriverMarker | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "online" | "offline">("all");
  const [stats, setStats] = useState({ total: 0, online: 0, offline: 0 });
  const [mapStyle, setMapStyle] = useState("satellite-streets");
  const [is3D, setIs3D] = useState(true);

  // ── Fetch drivers via REST ──────────────────────────────────────────────
  const fetchDrivers = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/driver/locations`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setDrivers(data.data || []);
        const online = (data.data || []).filter(
          (d: DriverMarker) => d.is_online,
        ).length;
        setStats({
          total: data.data?.length || 0,
          online,
          offline: (data.data?.length || 0) - online,
        });
      }
    } catch (error) {
      console.error("Failed to fetch drivers:", error);
    } finally {
      setLoading(false);
    }
  }, [token]);

  // ── Initialize map ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!mapContainerRef.current) return;

    const styleUrl =
      MAP_STYLES.find((s) => s.id === mapStyle)?.url ||
      "mapbox://styles/mapbox/dark-v11";

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: styleUrl,
      center: [3.9, 7.6],
      zoom: 12,
      pitch: is3D ? 45 : 0,
      bearing: 0,
    });

    map.addControl(new mapboxgl.NavigationControl(), "bottom-right");
    map.addControl(new mapboxgl.FullscreenControl(), "bottom-right");
    map.addControl(
      new mapboxgl.GeolocateControl({
        positionOptions: { enableHighAccuracy: true },
        trackUserLocation: true,
        showUserHeading: true,
      }),
      "bottom-right",
    );

    map.on("load", () => {
      if (is3D) {
        const layers = map.getStyle().layers;
        let labelLayerId: string | undefined;
        for (const layer of layers || []) {
          if (
            layer.type === "symbol" &&
            (layer.layout as any)?.["text-field"]
          ) {
            labelLayerId = layer.id;
            break;
          }
        }

        map.addLayer(
          {
            id: "3d-buildings",
            source: "composite",
            "source-layer": "building",
            filter: ["==", "extrude", "true"],
            type: "fill-extrusion",
            minzoom: 15,
            paint: {
              "fill-extrusion-color": "#aaa",
              "fill-extrusion-height": ["get", "height"],
              "fill-extrusion-base": ["get", "min_height"],
              "fill-extrusion-opacity": 0.6,
            },
          },
          labelLayerId,
        );
      }
    });

    mapRef.current = map;

    return () => {
      Object.values(markersRef.current).forEach((m) => m.remove());
      markersRef.current = {};
      map.remove();
      mapRef.current = null;
    };
  }, [mapStyle, is3D]);

  // ── Socket connection ───────────────────────────────────────────────────
  useEffect(() => {
    if (!token) return;

    const socket = io(API_URL, {
      auth: { token },
      transports: ["websocket"],
    });

    socket.on("connect", () => {
      socket.emit("join-live-map");
    });

    socket.on("driver-location-updated", (data: any) => {
      setDrivers((prev) => {
        const exists = prev.find((d) => d.driver_id === data.driver_id);
        if (exists) {
          return prev.map((d) =>
            d.driver_id === data.driver_id
              ? {
                  ...d,
                  location: {
                    latitude: data.location?.latitude ?? data.latitude,
                    longitude: data.location?.longitude ?? data.longitude,
                  },
                  heading: data.heading ?? d.heading,
                  is_online: true,
                  last_online_at: data.timestamp || new Date().toISOString(),
                }
              : d,
          );
        }
        fetchDrivers();
        return prev;
      });
    });

    socket.on("driver-online", () => {
      fetchDrivers();
    });

    socket.on("driver-offline", (data: any) => {
      setDrivers((prev) =>
        prev.map((d) =>
          d.driver_id === data.driver_id ? { ...d, is_online: false } : d,
        ),
      );
      setStats((prev) => ({
        ...prev,
        online: Math.max(0, prev.online - 1),
        offline: prev.offline + 1,
      }));
    });

    socketRef.current = socket;

    return () => {
      socket.emit("leave-live-map");
      socket.disconnect();
      socketRef.current = null;
    };
  }, [token, fetchDrivers]);

  // ── Periodic fetch ──────────────────────────────────────────────────────
  useEffect(() => {
    fetchDrivers();
    const interval = setInterval(fetchDrivers, 15000);
    return () => clearInterval(interval);
  }, [fetchDrivers]);

  // ── Render markers ──────────────────────────────────────────────────────
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.loaded()) {
      // Wait for map load, then re-trigger
      const handler = () => {
        if (map) renderMarkers(map);
      };
      map?.on("load", handler);
      return () => {
        map?.off("load", handler);
      };
    }
    renderMarkers(map);
  }, [drivers, filter]);

  const renderMarkers = useCallback(
    (map: mapboxgl.Map) => {
      const filteredDrivers =
        filter === "all"
          ? drivers
          : filter === "online"
            ? drivers.filter((d) => d.is_online)
            : drivers.filter((d) => !d.is_online);

      // Remove old markers
      Object.keys(markersRef.current).forEach((id) => {
        if (!filteredDrivers.find((d) => d.driver_id === id)) {
          markersRef.current[id].remove();
          delete markersRef.current[id];
        }
      });

      // Add/update markers
      filteredDrivers.forEach((driver) => {
        if (!driver.location?.latitude || !driver.location?.longitude) return;

        const existing = markersRef.current[driver.driver_id];
        const lngLat: [number, number] = [
          driver.location.longitude,
          driver.location.latitude,
        ];

        if (existing) {
          existing.setLngLat(lngLat);
          existing.setRotation(driver.heading || 0);
          const el = existing.getElement();
          const carBody = el.querySelector(".car-body") as SVGElement;
          if (carBody) {
            carBody.setAttribute(
              "fill",
              driver.is_online ? "#22C55E" : "#9CA3AF",
            );
          }
          const pulse = el.querySelector(".pulse-ring") as HTMLElement;
          if (pulse) {
            pulse.style.display = driver.is_online ? "block" : "none";
          }
        } else {
          const el = document.createElement("div");
          el.className = "driver-marker";
          el.style.cursor = "pointer";
          el.style.position = "relative";

          const color = driver.is_online ? "#22C55E" : "#9CA3AF";

          el.innerHTML = `
            <div style="position: relative; width: 40px; height: 40px; filter: drop-shadow(0 2px 6px rgba(0,0,0,0.35));">
              <svg viewBox="0 0 40 40" width="40" height="40" xmlns="http://www.w3.org/2000/svg">
                <ellipse cx="20" cy="38" rx="10" ry="2" fill="rgba(0,0,0,0.15)" />
                <g class="car-body-group">
                  <rect class="car-body" x="10" y="4" width="20" height="32" rx="8" ry="8" fill="${color}" />
                  <rect x="13" y="8" width="14" height="7" rx="3" fill="rgba(255,255,255,0.85)" />
                  <rect x="13" y="26" width="14" height="5" rx="2.5" fill="rgba(255,255,255,0.5)" />
                  <rect x="7" y="12" width="4" height="3" rx="1.5" fill="${color}" />
                  <rect x="29" y="12" width="4" height="3" rx="1.5" fill="${color}" />
                  <circle cx="14" cy="6" r="1.5" fill="#FDE68A" />
                  <circle cx="26" cy="6" r="1.5" fill="#FDE68A" />
                  <line x1="20" y1="16" x2="20" y2="24" stroke="rgba(255,255,255,0.3)" stroke-width="1" stroke-linecap="round" />
                </g>
              </svg>
              ${
                driver.is_online
                  ? `<div class="pulse-ring" style="
                      position: absolute; top: 50%; left: 50%;
                      transform: translate(-50%, -50%);
                      width: 50px; height: 50px; border-radius: 50%;
                      border: 2px solid ${color}; opacity: 0;
                      animation: carPulse 2s ease-out infinite;
                      pointer-events: none;
                    "></div>`
                  : ""
              }
            </div>
          `;

          el.addEventListener("click", () => {
            setSelectedDriver(driver);
          });

          const marker = new mapboxgl.Marker({
            element: el,
            rotation: driver.heading || 0,
            rotationAlignment: "map",
            pitchAlignment: "map",
          })
            .setLngLat(lngLat)
            .addTo(map);

          markersRef.current[driver.driver_id] = marker;
        }
      });
    },
    [drivers, filter],
  );

  const handleStyleChange = (styleId: string) => {
    setMapStyle(styleId);
  };

  const toggle3D = () => {
    setIs3D((prev) => !prev);
  };

  const currentStyleLabel =
    MAP_STYLES.find((s) => s.id === mapStyle)?.label || "Dark";

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b bg-background/95 backdrop-blur-sm md:px-6">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center">
              <Radio className="h-4.5 w-4.5 text-primary" />
            </div>
            <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-green-500 border-2 border-background animate-pulse" />
          </div>
          <div>
            <h1 className="text-sm font-semibold tracking-tight">Live Map</h1>
            <p className="text-[10px] text-muted-foreground leading-tight">
              Real-time driver tracking
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Online */}
          <div className="flex items-center gap-2 rounded-lg border bg-green-50/50 dark:bg-green-950/20 px-3 py-1.5">
            <div className="relative flex items-center justify-center">
              <span className="h-2 w-2 rounded-full bg-green-500" />
              <span className="absolute h-2 w-2 rounded-full bg-green-500 animate-ping opacity-40" />
            </div>
            <div className="text-right">
              <p className="text-sm font-bold leading-none tabular-nums text-green-700 dark:text-green-400">
                {stats.online}
              </p>
              <p className="text-[9px] text-green-600/70 dark:text-green-500/70 leading-none mt-0.5">
                Online
              </p>
            </div>
          </div>

          {/* Offline */}
          <div className="flex items-center gap-2 rounded-lg border px-3 py-1.5">
            <span className="h-2 w-2 rounded-full bg-gray-400" />
            <div className="text-right">
              <p className="text-sm font-bold leading-none tabular-nums text-muted-foreground">
                {stats.offline}
              </p>
              <p className="text-[9px] text-muted-foreground/70 leading-none mt-0.5">
                Offline
              </p>
            </div>
          </div>

          {/* Total */}
          <div className="flex items-center gap-2 rounded-lg border px-3 py-1.5">
            <Activity className="h-3.5 w-3.5 text-primary" />
            <div className="text-right">
              <p className="text-sm font-bold leading-none tabular-nums">
                {stats.total}
              </p>
              <p className="text-[9px] text-muted-foreground/70 leading-none mt-0.5">
                Total
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Map */}
      <div className="flex-1 relative">
        {/* Controls overlay */}
        <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
          {/* Filter buttons */}
          <div className="flex gap-1 bg-background/95 backdrop-blur-sm rounded-lg border shadow-lg p-1">
            {(["all", "online", "offline"] as const).map((f) => (
              <Button
                key={f}
                size="sm"
                variant={filter === f ? "default" : "ghost"}
                className="h-7 px-3 text-xs capitalize"
                onClick={() => setFilter(f)}
              >
                {f === "online" && (
                  <span className="h-1.5 w-1.5 rounded-full bg-green-500 mr-1.5" />
                )}
                {f === "offline" && (
                  <span className="h-1.5 w-1.5 rounded-full bg-gray-400 mr-1.5" />
                )}
                {f}
              </Button>
            ))}
          </div>

          {/* Map style switcher */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="sm"
                variant="outline"
                className="h-7 gap-1.5 bg-background/95 backdrop-blur-sm shadow-lg text-xs"
              >
                <Layers className="h-3.5 w-3.5" />
                {currentStyleLabel}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-40">
              {MAP_STYLES.map((style) => (
                <DropdownMenuItem
                  key={style.id}
                  className="text-xs gap-2"
                  onClick={() => handleStyleChange(style.id)}
                >
                  <style.icon className="h-3.5 w-3.5" />
                  {style.label}
                  {mapStyle === style.id && (
                    <span className="ml-auto text-primary font-bold">✓</span>
                  )}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-xs gap-2" onClick={toggle3D}>
                <Mountain className="h-3.5 w-3.5" />
                3D Buildings
                <Badge
                  variant={is3D ? "default" : "secondary"}
                  className="ml-auto text-[9px] h-4 px-1.5"
                >
                  {is3D ? "ON" : "OFF"}
                </Badge>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Refresh */}
          <Button
            size="sm"
            variant="outline"
            className="h-7 w-7 p-0 bg-background/95 backdrop-blur-sm shadow-lg"
            onClick={fetchDrivers}
            disabled={loading}
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`}
            />
          </Button>
        </div>

        {/* Map container */}
        <div ref={mapContainerRef} className="w-full h-full" />

        {/* Selected driver panel */}
        {selectedDriver && (
          <Card className="absolute bottom-4 left-4 right-4 max-w-md z-10 shadow-2xl">
            <CardHeader className="pb-2 pt-4 px-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`h-10 w-10 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                      selectedDriver.is_online
                        ? "bg-green-500"
                        : "bg-muted-foreground"
                    }`}
                  >
                    {selectedDriver.name?.[0]?.toUpperCase() || "D"}
                  </div>
                  <div>
                    <CardTitle className="text-sm">
                      {selectedDriver.name}
                    </CardTitle>
                    <CardDescription className="text-xs">
                      {selectedDriver.vehicle_model} •{" "}
                      {selectedDriver.plate_number}
                    </CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant={selectedDriver.is_online ? "default" : "secondary"}
                    className={`text-[10px] ${
                      selectedDriver.is_online
                        ? "bg-green-100 text-green-700 border-green-200"
                        : ""
                    }`}
                  >
                    {selectedDriver.is_online ? "Online" : "Offline"}
                  </Badge>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 w-6 p-0"
                    onClick={() => setSelectedDriver(null)}
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="px-4 pb-4 pt-2">
              <div className="grid grid-cols-3 gap-2">
                <div className="rounded-lg border bg-muted/30 px-3 py-2 text-center">
                  <p className="text-[10px] text-muted-foreground flex items-center justify-center gap-1">
                    <Star className="h-2.5 w-2.5 text-yellow-500" />
                    Rating
                  </p>
                  <p className="text-xs font-semibold mt-0.5">
                    {selectedDriver.rating?.toFixed(1) || "N/A"}
                  </p>
                </div>
                <div className="rounded-lg border bg-muted/30 px-3 py-2 text-center">
                  <p className="text-[10px] text-muted-foreground flex items-center justify-center gap-1">
                    <Car className="h-2.5 w-2.5" />
                    Color
                  </p>
                  <p className="text-xs font-semibold mt-0.5">
                    {selectedDriver.vehicle_color || "—"}
                  </p>
                </div>
                <div className="rounded-lg border bg-muted/30 px-3 py-2 text-center">
                  <p className="text-[10px] text-muted-foreground flex items-center justify-center gap-1">
                    <Clock className="h-2.5 w-2.5" />
                    Last Seen
                  </p>
                  <p className="text-xs font-semibold mt-0.5">
                    {selectedDriver.is_online
                      ? "Now"
                      : selectedDriver.last_online_at
                        ? new Date(
                            selectedDriver.last_online_at,
                          ).toLocaleTimeString("en-NG", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "—"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Loading overlay */}
        {loading && (
          <div className="absolute inset-0 bg-background/60 backdrop-blur-sm flex items-center justify-center z-20">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-xs text-muted-foreground font-medium">
                Loading drivers...
              </p>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes carPulse {
          0% {
            opacity: 0.6;
            transform: translate(-50%, -50%) scale(0.8);
          }
          100% {
            opacity: 0;
            transform: translate(-50%, -50%) scale(1.6);
          }
        }
      `}</style>
    </div>
  );
}
