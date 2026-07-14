"use client";

import * as React from "react";
import { MapPin, Search, Navigation, X, Loader2, CheckCircle2, Plus, Minus, Crosshair } from "lucide-react";
import { CONTACT } from "@/lib/constants";
import { modernToast } from "@/components/ui/sonner";

interface AddressPickerProps {
  form: {
    district: string;
    street: string;
    building: string;
    apartment: string;
    floor: string;
    address: string;
  };
  setForm: React.Dispatch<React.SetStateAction<any>>;
}

interface NominatimResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  address: {
    road?: string;
    neighbourhood?: string;
    suburb?: string;
    city_district?: string;
    city?: string;
    town?: string;
    house_number?: string;
    postcode?: string;
    county?: string;
  };
}

/**
 * Emlakjet tarzı adres seçici
 * - Harita üzerinde sürüklenebilir pin
 * - Adres arama (autocomplete)
 * - Mevcut konum butonu
 * - Tıklanabilir harita
 * - Otomatik form doldurma
 */
export function AddressPicker({ form, setForm }: AddressPickerProps) {
  const [mapOpen, setMapOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [searchResults, setSearchResults] = React.useState<NominatimResult[]>([]);
  const [searching, setSearching] = React.useState(false);
  const [locating, setLocating] = React.useState(false);
  const [markerPos, setMarkerPos] = React.useState<{ lat: number; lng: number } | null>(null);
  const [reverseAddress, setReverseAddress] = React.useState<string>("");
  const mapRef = React.useRef<HTMLDivElement>(null);
  const mapInstanceRef = React.useRef<any>(null);
  const markerRef = React.useRef<any>(null);

  // Harita açıldığında init et
  React.useEffect(() => {
    if (!mapOpen) return;
    const timer = setTimeout(initMap, 100);
    return () => clearTimeout(timer);
  }, [mapOpen]);

  // Adres arama (debounced)
  React.useEffect(() => {
    if (searchQuery.trim().length < 3) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
            searchQuery + " Fatih İstanbul"
          )}&limit=5&addressdetails=1&accept-language=tr`
        );
        const data = await res.json();
        setSearchResults(data);
      } catch {
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const initMap = async () => {
    if (typeof window === "undefined" || !mapRef.current) return;
    // Leaflet dinamik import
    const L = (await import("leaflet")).default;
    // CSS ekle
    if (!document.querySelector("#leaflet-css")) {
      const link = document.createElement("link");
      link.id = "leaflet-css";
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }

    // Default merkez: Demos Pizza lokasyonu
    const center: [number, number] = [41.0096, 28.9471];

    if (!mapInstanceRef.current) {
      mapInstanceRef.current = L.map(mapRef.current, {
        zoomControl: false,
        attributionControl: false,
      }).setView(center, 14);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
      }).addTo(mapInstanceRef.current);

      // Zoom kontrolleri sağ altta
      L.control.zoom({ position: "bottomright" }).addTo(mapInstanceRef.current);

      // Pizza restoran marker
      const restaurantIcon = L.divIcon({
        html: `<div style="font-size: 32px;">🍕</div>`,
        className: "",
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });
      L.marker(center, { icon: restaurantIcon }).addTo(mapInstanceRef.current);

      // Sürüklenebilir pin (kullanıcı adresi)
      const userIcon = L.divIcon({
        html: `<div style="position: relative; width: 36px; height: 36px;">
          <div style="position: absolute; bottom: 0; left: 50%; transform: translateX(-50%); width: 0; height: 0; border-left: 10px solid transparent; border-right: 10px solid transparent; border-top: 16px solid #FF2D8D;"></div>
          <div style="position: absolute; top: 0; left: 50%; transform: translateX(-50%); width: 28px; height: 28px; border-radius: 50% 50% 50% 0; background: #FF2D8D; transform: rotate(-45deg) translateX(-50%); border: 3px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.3);"></div>
        </div>`,
        className: "",
        iconSize: [36, 36],
        iconAnchor: [18, 36],
      });

      markerRef.current = L.marker(center, {
        icon: userIcon,
        draggable: true,
      }).addTo(mapInstanceRef.current);

      markerRef.current.on("dragend", (e: any) => {
        const pos = e.target.getLatLng();
        setMarkerPos({ lat: pos.lat, lng: pos.lng });
        reverseGeocode(pos.lat, pos.lng);
      });

      // Harita tıklama
      mapInstanceRef.current.on("click", (e: any) => {
        markerRef.current.setLatLng(e.latlng);
        setMarkerPos({ lat: e.latlng.lat, lng: e.latlng.lng });
        reverseGeocode(e.latlng.lat, e.latlng.lng);
      });

      setMarkerPos({ lat: center[0], lng: center[1] });
    } else {
      // Harita zaten var, sadece refresh
      setTimeout(() => mapInstanceRef.current?.invalidateSize(), 100);
    }
  };

  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=tr`
      );
      const data = await res.json();
      if (data?.address) {
        const addr = data.address;
        const street = addr.road || addr.pedestrian || addr.footway || "";
        const houseNumber = addr.house_number || "";
        const neighborhood = addr.suburb || addr.neighbourhood || addr.quarter || "";
        const district = addr.city_district || addr.town || addr.city || "";

        // Form alanlarını doldur
        const matchedArea = CONTACT.delivery.serviceAreas.find(
          (area) =>
            district.toLowerCase().includes(area.toLowerCase()) ||
            neighborhood.toLowerCase().includes(area.toLowerCase()) ||
            (addr.county && addr.county.toLowerCase().includes(area.toLowerCase()))
        );

        setForm((f: any) => ({
          ...f,
          district: matchedArea || f.district,
          street: street || f.street,
          building: houseNumber || f.building,
        }));

        const fullAddress = [street, houseNumber && `No:${houseNumber}`, neighborhood]
          .filter(Boolean)
          .join(" ");
        setReverseAddress(fullAddress || data.display_name || "");
      }
    } catch {
      setReverseAddress("");
    }
  };

  const useMyLocation = () => {
    if (!navigator.geolocation) {
      modernToast("error", "Tarayıcınız konum özelliğini desteklemiyor.");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        if (mapInstanceRef.current && markerRef.current) {
          mapInstanceRef.current.setView([latitude, longitude], 16);
          markerRef.current.setLatLng([latitude, longitude]);
          setMarkerPos({ lat: latitude, lng: longitude });
          reverseGeocode(latitude, longitude);
        }
        setLocating(false);
      },
      (error) => {
        setLocating(false);
        if (error.code === error.PERMISSION_DENIED) {
          modernToast("error", "Konum izni reddedildi", "Tarayıcı ayarlarından izin verin");
        } else {
          modernToast("error", "Konum alınamadı");
        }
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const selectSearchResult = (result: NominatimResult) => {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    if (mapInstanceRef.current && markerRef.current) {
      mapInstanceRef.current.setView([lat, lng], 17);
      markerRef.current.setLatLng([lat, lng]);
      setMarkerPos({ lat, lng });
      reverseGeocode(lat, lng);
    }
    setSearchQuery("");
    setSearchResults([]);
  };

  return (
    <>
      {/* Konum seç butonu */}
      <div className="flex items-center justify-between">
        <span className="text-[11px] text-ink/60 font-medium">Haritadan konum seç</span>
        <button
          type="button"
          onClick={() => setMapOpen(true)}
          className="inline-flex items-center gap-1.5 text-[11px] font-medium text-pink hover:text-pink-hover transition-colors"
        >
          <MapPin className="h-3.5 w-3.5" />
          Haritayı Aç
        </button>
      </div>

      {/* Adres özet kartı */}
      {reverseAddress && (
        <div className="p-3 rounded-xl bg-basil/5 border border-basil/20 flex items-start gap-2">
          <CheckCircle2 className="h-4 w-4 text-basil shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <div className="text-[10px] text-basil font-semibold uppercase tracking-wide">Konum seçildi</div>
            <div className="text-xs text-ink/70 mt-0.5">{reverseAddress}</div>
          </div>
        </div>
      )}

      {/* Harita modal — full screen */}
      {mapOpen && (
        <div className="fixed inset-0 z-[60] bg-black/50 flex items-end md:items-center justify-center p-0 md:p-4">
          <div className="bg-paper rounded-t-3xl md:rounded-3xl w-full max-w-2xl h-[85vh] md:h-[80vh] flex flex-col overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-ink/8 shrink-0">
              <div>
                <h3 className="font-display font-bold text-ink text-base">Konum Seç</h3>
                <p className="text-[11px] text-ink/50">Haritadan adresini işaretle veya ara</p>
              </div>
              <button
                onClick={() => setMapOpen(false)}
                className="w-9 h-9 flex items-center justify-center rounded-xl text-ink/50 hover:text-ink hover:bg-ink/5 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Arama kutusu */}
            <div className="p-3 border-b border-ink/8 shrink-0 relative">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink/40" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Sokak, mahalle veya adres ara..."
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-ink/15 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-pink/30 focus:border-pink"
                />
                {searching && (
                  <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-ink/30" />
                )}
              </div>

              {/* Arama sonuçları */}
              {searchResults.length > 0 && (
                <div className="absolute left-3 right-3 mt-1 bg-white rounded-xl border border-ink/10 shadow-xl max-h-48 overflow-y-auto z-10">
                  {searchResults.map((result) => (
                    <button
                      key={result.place_id}
                      onClick={() => selectSearchResult(result)}
                      className="w-full text-left p-3 hover:bg-ink/5 transition-colors border-b border-ink/5 last:border-0"
                    >
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 text-pink shrink-0 mt-0.5" />
                        <div className="text-xs text-ink/70 line-clamp-2">{result.display_name}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Harita */}
            <div ref={mapRef} className="flex-1 relative bg-ink/5" style={{ minHeight: "300px" }} />

            {/* Mevcut konum butonu — harita üzerinde */}
            <button
              onClick={useMyLocation}
              disabled={locating}
              className="absolute bottom-28 right-5 z-[500] w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-paper transition-colors disabled:opacity-50"
              aria-label="Mevcut konumum"
            >
              {locating ? (
                <Loader2 className="h-5 w-5 animate-spin text-pink" />
              ) : (
                <Crosshair className="h-5 w-5 text-pink" />
              )}
            </button>

            {/* Footer — seçilen adres + onayla */}
            <div className="p-4 border-t border-ink/8 shrink-0 space-y-3">
              {markerPos && reverseAddress ? (
                <div className="p-3 rounded-xl bg-pink/5 border border-pink/20">
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-pink shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <div className="text-[10px] text-pink font-semibold uppercase tracking-wide">Seçilen Konum</div>
                      <div className="text-xs text-ink/80 mt-0.5">{reverseAddress}</div>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-ink/50 text-center py-2">
                  Haritadan bir nokta seç veya adres ara
                </p>
              )}
              <button
                onClick={() => {
                  setMapOpen(false);
                  if (reverseAddress) {
                    modernToast("success", "Konum seçildi!", "Adres alanları dolduruldu");
                  }
                }}
                className="w-full bg-pink hover:bg-pink-hover text-white h-12 rounded-xl font-semibold transition-colors"
              >
                Bu Konumu Kullan
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
