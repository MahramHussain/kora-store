"use client";

import { useEffect, useRef, useState } from "react";

interface MapPickerProps {
  onLocationSelected: (lat: number, lng: number) => void;
}

export default function MapPicker({ onLocationSelected }: MapPickerProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Load Leaflet CSS from CDN
    const linkId = "leaflet-css";
    if (!document.getElementById(linkId)) {
      const link = document.createElement("link");
      link.id = linkId;
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }

    // Load Leaflet JS from CDN
    const scriptId = "leaflet-js";
    if (!document.getElementById(scriptId)) {
      const script = document.createElement("script");
      script.id = scriptId;
      script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
      script.onload = () => {
        initializeMap();
      };
      document.head.appendChild(script);
    } else {
      initializeMap();
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  const initializeMap = () => {
    const L = (window as any).L;
    if (!L || !mapContainerRef.current || mapRef.current) return;

    // Center of Dubai
    const defaultLat = 25.2048;
    const defaultLng = 55.2708;

    const map = L.map(mapContainerRef.current, {
      zoomControl: false // Custom placement or compact mode
    }).setView([defaultLat, defaultLng], 12);
    mapRef.current = map;

    // Add zoom control at bottom-right for clean UI
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map);

    // Custom marker icon using SVG or leaflet default
    const marker = L.marker([defaultLat, defaultLng], {
      draggable: true,
    }).addTo(map);
    markerRef.current = marker;

    setCoordinates({ lat: defaultLat, lng: defaultLng });
    onLocationSelected(defaultLat, defaultLng);

    // Marker drag event
    marker.on("dragend", () => {
      const position = marker.getLatLng();
      setCoordinates({ lat: position.lat, lng: position.lng });
      onLocationSelected(position.lat, position.lng);
    });

    // Map click event
    map.on("click", (e: any) => {
      marker.setLatLng(e.latlng);
      setCoordinates({ lat: e.latlng.lat, lng: e.latlng.lng });
      onLocationSelected(e.latlng.lat, e.latlng.lng);
    });
  };

  const locateUser = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const L = (window as any).L;
        if (L && mapRef.current && markerRef.current) {
          mapRef.current.setView([latitude, longitude], 15);
          markerRef.current.setLatLng([latitude, longitude]);
          setCoordinates({ lat: latitude, lng: longitude });
          onLocationSelected(latitude, longitude);
        }
        setIsLocating(false);
      },
      (error) => {
        console.error("Geolocation error:", error);
        alert("Unable to find your location. Please move the map marker manually.");
        setIsLocating(false);
      }
    );
  };

  return (
    <div className="space-y-3 font-sans mt-4">
      <div className="flex justify-between items-center">
        <label className="block text-slate-500 text-xs font-bold uppercase tracking-wider">
          Pinpoint Delivery Location
        </label>
        <button
          type="button"
          onClick={locateUser}
          disabled={isLocating}
          className="text-xs text-kora font-black hover:text-purple-700 transition-colors uppercase tracking-wider flex items-center gap-1"
        >
          📍 {isLocating ? "Pinpointing..." : "Locate Me"}
        </button>
      </div>

      <div
        ref={mapContainerRef}
        className="w-full h-48 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden z-10 bg-slate-50"
      >
        <div className="absolute inset-0 flex items-center justify-center text-xs font-bold uppercase text-slate-400 tracking-wider">
          Loading Delivery Map...
        </div>
      </div>

      {coordinates && (
        <p className="text-[10px] text-slate-400 font-mono">
          Coordinates: {coordinates.lat.toFixed(6)}, {coordinates.lng.toFixed(6)} (Google Maps compatible)
        </p>
      )}
    </div>
  );
}
