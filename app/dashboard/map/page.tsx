"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { io, Socket } from "socket.io-client";
import { useAuthStore } from "@/store/useAuthStore";

const MAPBOX_TOKEN =
  process.env.NEXT_PUBLIC_MAPBOX_TOKEN ||
  "pk.eyJ1IjoiYmlvZHVuZGV2IiwiYSI6ImNtbTVmaXdmYjA1MmgycHA5dThqamRrdDkifQ.C7PtTgCNYHpVIh7CpYbVzw";

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

  // Fetch drivers
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

  // Init map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/dark-v11",
      center: [3.9, 7.6], // Nigeria default
      zoom: 12,
      pitch: 45,
    });

    map.addControl(new mapboxgl.NavigationControl(), "bottom-right");
    map.addControl(new mapboxgl.FullscreenControl(), "bottom-right");

    // 3D buildings
    map.on("load", () => {
      const layers = map.getStyle().layers;
      let labelLayerId: string | undefined;
      for (const layer of layers || []) {
        if (layer.type === "symbol" && (layer.layout as any)?.["text-field"]) {
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
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Connect socket
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
      setDrivers((prev) =>
        prev.map((d) =>
          d.driver_id === data.driver_id
            ? {
                ...d,
                location: {
                  latitude: data.latitude,
                  longitude: data.longitude,
                },
                heading: data.heading || d.heading,
              }
            : d,
        ),
      );
    });

    socket.on("driver-online", (data: any) => {
      fetchDrivers();
    });

    socket.on("driver-offline", (data: any) => {
      setDrivers((prev) =>
        prev.map((d) =>
          d.driver_id === data.driver_id ? { ...d, is_online: false } : d,
        ),
      );
    });

    socketRef.current = socket;

    return () => {
      socket.emit("leave-live-map");
      socket.disconnect();
      socketRef.current = null;
    };
  }, [token, fetchDrivers]);

  // Fetch drivers on mount and periodically
  useEffect(() => {
    fetchDrivers();
    const interval = setInterval(fetchDrivers, 30000);
    return () => clearInterval(interval);
  }, [fetchDrivers]);

  // Update markers
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

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
        // update color
        const el = existing.getElement();
        const dot = el.querySelector(".marker-dot") as HTMLElement;
        if (dot) {
          dot.style.backgroundColor = driver.is_online ? "#22C55E" : "#9CA3AF";
        }
      } else {
        // Create marker element
        const el = document.createElement("div");
        el.className = "driver-marker";
        el.innerHTML = `
          <div style="position: relative; cursor: pointer;">
            <div class="marker-dot" style="
              width: 32px;
              height: 32px;
              border-radius: 50%;
              background-color: ${driver.is_online ? "#22C55E" : "#9CA3AF"};
              border: 3px solid white;
              box-shadow: 0 2px 8px rgba(0,0,0,0.3);
              display: flex;
              align-items: center;
              justify-content: center;
              transition: background-color 0.3s;
            ">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                <path d="M5 11l1.5-4.5h11L19 11m-1 0H6m13 0v5a1 1 0 01-1 1h-1a1 1 0 01-1-1v-1H8v1a1 1 0 01-1 1H6a1 1 0 01-1-1v-5m2.5 2a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm9 0a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" stroke="white" fill="none" stroke-width="1.5"/>
              </svg>
            </div>
            ${
              driver.is_online
                ? `
              <div style="
                position: absolute;
                top: -2px;
                right: -2px;
                width: 10px;
                height: 10px;
                border-radius: 50%;
                background-color: #22C55E;
                border: 2px solid white;
                animation: pulse 2s infinite;
              "></div>
            `
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
        })
          .setLngLat(lngLat)
          .addTo(map);

        markersRef.current[driver.driver_id] = marker;
      }
    });
  }, [drivers, filter]);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b bg-white">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Live Map</h1>
          <p className="text-sm text-gray-500">Real-time driver tracking</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-green-50 rounded-lg px-3 py-2">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <span className="text-sm font-semibold text-green-700">
              {stats.online} Online
            </span>
          </div>
          <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
            <div className="w-2 h-2 rounded-full bg-gray-400" />
            <span className="text-sm font-semibold text-gray-600">
              {stats.offline} Offline
            </span>
          </div>
          <div className="flex items-center gap-2 bg-blue-50 rounded-lg px-3 py-2">
            <span className="text-sm font-semibold text-blue-700">
              {stats.total} Total
            </span>
          </div>
        </div>
      </div>

      {/* Filter + Map */}
      <div className="flex-1 relative">
        {/* Filter pills */}
        <div className="absolute top-4 left-4 z-10 flex gap-2">
          {(["all", "online", "offline"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-full text-sm font-semibold shadow-lg transition-all capitalize ${
                filter === f
                  ? "bg-[#042F40] text-white"
                  : "bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Map */}
        <div ref={mapContainerRef} className="w-full h-full" />

        {/* Selected driver panel */}
        {selectedDriver && (
          <div className="absolute bottom-4 left-4 right-4 max-w-md bg-white rounded-2xl shadow-2xl p-5 z-10">
            <button
              onClick={() => setSelectedDriver(null)}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
            <div className="flex items-center mb-3">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg ${
                  selectedDriver.is_online ? "bg-green-500" : "bg-gray-400"
                }`}
              >
                {selectedDriver.name?.[0]?.toUpperCase() || "D"}
              </div>
              <div className="ml-3">
                <h3 className="text-base font-bold text-gray-900">
                  {selectedDriver.name}
                </h3>
                <p className="text-sm text-gray-500">
                  {selectedDriver.vehicle_model} • {selectedDriver.plate_number}
                </p>
              </div>
              <div className="ml-auto">
                <div
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    selectedDriver.is_online
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {selectedDriver.is_online ? "Online" : "Offline"}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-gray-50 rounded-xl p-3 text-center">
                <p className="text-xs text-gray-500">Rating</p>
                <p className="text-sm font-bold text-gray-900">
                  ⭐ {selectedDriver.rating?.toFixed(1) || "N/A"}
                </p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3 text-center">
                <p className="text-xs text-gray-500">Color</p>
                <p className="text-sm font-bold text-gray-900">
                  {selectedDriver.vehicle_color || "—"}
                </p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3 text-center">
                <p className="text-xs text-gray-500">Last Seen</p>
                <p className="text-sm font-bold text-gray-900">
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
          </div>
        )}

        {/* Loading overlay */}
        {loading && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center z-20">
            <div className="flex flex-col items-center gap-3">
              <div className="w-10 h-10 border-4 border-[#042F40] border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-gray-600 font-medium">
                Loading drivers...
              </p>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes pulse {
          0% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.5;
            transform: scale(1.5);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
}
