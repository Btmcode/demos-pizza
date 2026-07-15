"use client";

import * as React from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { CONTACT } from "@/lib/constants";

// Demos Pizza koordinatları (Fatih, İstanbul)
const POSITION: [number, number] = [41.0096, 28.9471];

// Custom marker — premium pizza pin
const customIcon = L.divIcon({
  html: `
    <div style="position:relative;width:48px;height:48px;">
      <div style="position:absolute;bottom:0;left:50%;transform:translateX(-50%);width:0;height:0;border-left:8px solid transparent;border-right:8px solid transparent;border-top:12px solid #FF2D8D;"></div>
      <div style="width:36px;height:36px;background:linear-gradient(135deg,#FF2D8D 0%,#FF4FA3 100%);border-radius:50%;border:3px solid #FFC400;box-shadow:0 4px 12px rgba(255,45,141,0.5);display:flex;align-items:center;justify-content:center;font-size:18px;position:absolute;top:0;left:50%;transform:translateX(-50%);">🍕</div>
    </div>
  `,
  className: "demos-pizza-marker",
  iconSize: [48, 48],
  iconAnchor: [24, 48],
  popupAnchor: [0, -48],
});

export default function MapClient() {
  return (
    <MapContainer
      center={POSITION}
      zoom={16}
      style={{ width: "100%", height: "100%" }}
      zoomControl={true}
      scrollWheelZoom={true}
      attributionControl={true}
    >
      {/* Google Maps hybrid tiles — uydu + sokak etiketleri (en güncel veri) */}
      <TileLayer
        url="https://mt0.google.com/vt/lyrs=y&hl=tr&x={x}&y={y}&z={z}"
        attribution="&copy; Google"
        maxZoom={20}
      />

      {/* Teslimat bölgesi dairesi (500m yarıçap) */}
      <Circle
        center={POSITION}
        radius={500}
        pathOptions={{
          color: "#FF2D8D",
          fillColor: "#FF2D8D",
          fillOpacity: 0.08,
          weight: 2,
          dashArray: "6 4",
        }}
      />

      {/* Restaurant marker */}
      <Marker position={POSITION} icon={customIcon}>
        <Popup>
          <div style={{ textAlign: "center", padding: "8px 4px", minWidth: "180px" }}>
            <div style={{ fontSize: "16px", marginBottom: "4px" }}>🍕</div>
            <strong style={{ color: "#FF2D8D", fontSize: "15px", display: "block", marginBottom: "4px" }}>
              Demos Pizza
            </strong>
            <span style={{ fontSize: "12px", color: "#666", display: "block", marginBottom: "8px", lineHeight: "1.4" }}>
              {CONTACT.address.full}
            </span>
            <div style={{ display: "flex", gap: "6px", justifyContent: "center" }}>
              <a
                href="https://www.openstreetmap.org/directions?to=41.0096%2C28.9471"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "inline-block",
                  padding: "6px 12px",
                  background: "#FF2D8D",
                  color: "white",
                  borderRadius: "8px",
                  fontSize: "12px",
                  textDecoration: "none",
                  fontWeight: "600",
                }}
              >
                Yol Tarifi
              </a>
              <a
                href={`tel:${CONTACT.phoneHref.replace("tel:", "")}`}
                style={{
                  display: "inline-block",
                  padding: "6px 12px",
                  background: "#FFC400",
                  color: "#111",
                  borderRadius: "8px",
                  fontSize: "12px",
                  textDecoration: "none",
                  fontWeight: "600",
                }}
              >
                Ara
              </a>
            </div>
          </div>
        </Popup>
      </Marker>
    </MapContainer>
  );
}
