"use client";

import * as React from "react";
import { MapPin, Navigation } from "lucide-react";
import { CONTACT } from "@/lib/constants";

/**
 * OpenStreetMap Leaflet ile — SSR güvenli
 * Leaflet window gerektirdiği için dynamic import ile yüklenir
 */
export function OpenStreetMap() {
  const [mounted, setMounted] = React.useState(false);
  const [MapComponent, setMapComponent] = React.useState<React.ComponentType<any> | null>(null);
  const mapRef = React.useRef<any>(null);

  React.useEffect(() => {
    setMounted(true);
    // Leaflet'i client-side yükle
    Promise.all([
      import("react-leaflet"),
      import("leaflet"),
    ]).then(([reactLeaflet, L]) => {
      // CSS'i inject et
      if (!document.querySelector("#leaflet-css")) {
        const link = document.createElement("link");
        link.id = "leaflet-css";
        link.rel = "stylesheet";
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
        document.head.appendChild(link);
      }

      const { MapContainer, TileLayer, Marker, Popup, ZoomControl } = reactLeaflet;

      // Custom marker
      const customIcon = L.divIcon({
        html: `<div style="width:40px;height:40px;background:#FF2D8D;border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:3px solid #FFC400;box-shadow:0 4px 12px rgba(255,45,141,0.4);display:flex;align-items:center;justify-content:center;">
          <div style="transform:rotate(45deg);font-size:18px;">🍕</div>
        </div>`,
        className: "",
        iconSize: [40, 40],
        iconAnchor: [20, 40],
        popupAnchor: [0, -40],
      });

      const position: [number, number] = [41.0096, 28.9471];

      const Map = () => (
        <MapContainer
          center={position}
          zoom={15}
          style={{ width: "100%", height: "100%" }}
          zoomControl={false}
          scrollWheelZoom={false}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; OpenStreetMap'
          />
          <Marker position={position} icon={customIcon}>
            <Popup>
              <div style={{ textAlign: "center", padding: "4px" }}>
                <strong style={{ color: "#FF2D8D", fontSize: "14px" }}>🍕 Demos Pizza</strong>
                <br />
                <span style={{ fontSize: "12px", color: "#666" }}>{CONTACT.address.full}</span>
                <br />
                <a
                  href="https://www.openstreetmap.org/?mlat=41.0096&mlon=28.9471#map=16/41.0096/28.9471"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "inline-block",
                    marginTop: "6px",
                    padding: "4px 10px",
                    background: "#FF2D8D",
                    color: "white",
                    borderRadius: "6px",
                    fontSize: "11px",
                    textDecoration: "none",
                    fontWeight: "600",
                  }}
                >
                  Yol Tarifi Al
                </a>
              </div>
            </Popup>
          </Marker>
          <ZoomControl position="bottomright" />
        </MapContainer>
      );

      setMapComponent(() => Map);
    });
  }, []);

  return (
    <div className="rounded-2xl overflow-hidden border border-ink/8 shadow-premium h-72 md:h-96 relative bg-mist/20">
      {mounted && MapComponent ? (
        <MapComponent />
      ) : (
        <div className="flex items-center justify-center h-full">
          <div className="text-ink/40 text-sm">Harita yükleniyor...</div>
        </div>
      )}

      {/* Address overlay — üstte */}
      <div className="absolute top-3 left-3 z-[1000] glass rounded-xl p-3 max-w-[240px] pointer-events-none">
        <div className="flex items-start gap-2">
          <MapPin className="h-4 w-4 text-pink shrink-0 mt-0.5" />
          <div>
            <div className="font-display font-bold text-ink text-sm">Demos Pizza</div>
            <div className="text-[11px] text-ink/60 mt-0.5">{CONTACT.address.full}</div>
          </div>
        </div>
      </div>

      {/* "Konumumdan Tarif" butonu */}
      <button
        onClick={() => {
          if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((pos) => {
              const userLat = pos.coords.latitude;
              const userLng = pos.coords.longitude;
              window.open(
                `https://www.openstreetmap.org/directions?from=${userLat},${userLng}&to=41.0096,28.9471`,
                "_blank"
              );
            });
          }
        }}
        className="absolute top-3 right-3 z-[1000] glass rounded-lg p-2 hover:bg-pink transition-colors group"
        aria-label="Konumumdan yol tarifi"
        title="Konumumdan yol tarifi"
      >
        <Navigation className="h-4 w-4 text-pink group-hover:text-white" />
      </button>
    </div>
  );
}
