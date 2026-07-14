"use client";

import * as React from "react";
import { MapPin, Search, Navigation, X, Loader2, CheckCircle2, Crosshair, MapPinIcon } from "lucide-react";
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
  /** Konum alındığında tetiklenir — üst bileşen ek aksiyon alabilir */
  onLocationSet?: () => void;
}

interface NominatimResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  address?: {
    road?: string;
    pedestrian?: string;
    footway?: string;
    neighbourhood?: string;
    suburb?: string;
    quarter?: string;
    city_district?: string;
    city?: string;
    town?: string;
    house_number?: string;
    postcode?: string;
    county?: string;
    state?: string;
    country?: string;
  };
}

interface ParsedAddress {
  street: string;
  houseNumber: string;
  neighborhood: string;
  district: string;
  city: string;
  postcode: string;
  fullAddress: string;
  lat: number;
  lng: number;
}

/**
 * Profesyonel konum seçici (Emlakjet / Trendyol tarzı)
 *
 * Akış:
 * 1. "Konum Al" butonu → harita modal açılır
 * 2. Kullanıcı haritadan nokta seçer, adres arar veya GPS kullanır
 * 3. Reverse geocode ile tüm adres bileşenleri çıkarılır:
 *    - Sokak/Cadde
 *    - Mahalle
 *    - İlçe (Fatih)
 *    - Postakodu
 *    - Bina no (varsa)
 * 4. Form alanları OTOMATİK doldurulur
 * 5. Bina no / Daire / Kat kullanıcı tarafından girilir (OSM'de yok)
 * 6. "Bu Konumu Kullan" → modal kapanır, form dolu gelir
 */
export function AddressPicker({ form, setForm, onLocationSet }: AddressPickerProps) {
  const [mapOpen, setMapOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [searchResults, setSearchResults] = React.useState<NominatimResult[]>([]);
  const [searching, setSearching] = React.useState(false);
  const [locating, setLocating] = React.useState(false);
  const [reverseLoading, setReverseLoading] = React.useState(false);
  const [markerPos, setMarkerPos] = React.useState<{ lat: number; lng: number } | null>(null);
  const [parsedAddress, setParsedAddress] = React.useState<ParsedAddress | null>(null);
  const mapRef = React.useRef<HTMLDivElement>(null);
  const mapInstanceRef = React.useRef<any>(null);
  const markerRef = React.useRef<any>(null);

  // Harita açıldığında init et
  React.useEffect(() => {
    if (!mapOpen) return;
    const timer = setTimeout(initMap, 100);
    return () => clearTimeout(timer);
  }, [mapOpen]);

  // Modal kapandığında haritayı temizle (memory leak önle)
  React.useEffect(() => {
    if (!mapOpen && mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
      markerRef.current = null;
    }
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
            searchQuery + " Fatih İstanbul Türkiye"
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

  /**
   * Nominatim adres verisini parse et — tüm bileşenleri çıkar
   * Türkiye adres yapısı: Sokak, Mahalle, İlçe, İl, Postakodu
   */
  const parseAddress = (data: any, lat: number, lng: number): ParsedAddress => {
    const addr = data.address || {};
    const display = data.display_name || "";

    // Sokak / Cadde
    const street =
      addr.road ||
      addr.pedestrian ||
      addr.footway ||
      addr.path ||
      "";

    // Bina numarası (nadir olarak var)
    const houseNumber = addr.house_number || "";

    // Mahalle
    const neighborhood =
      addr.neighbourhood ||
      addr.suburb ||
      addr.quarter ||
      addr.city_district ||
      "";

    // İlçe (Fatih)
    const district =
      addr.town ||
      addr.county ||
      addr.city_district ||
      "";

    // İl (İstanbul)
    const city =
      addr.city ||
      addr.state ||
      addr.region ||
      "";

    // Postakodu
    const postcode = addr.postcode || "";

    // Tam adres — display_name'i temizle
    const fullAddress = display || [street, houseNumber, neighborhood, district, city, postcode]
      .filter(Boolean)
      .join(", ");

    return {
      street,
      houseNumber,
      neighborhood,
      district,
      city,
      postcode,
      fullAddress,
      lat,
      lng,
    };
  };

  /**
   * Servis bölgesi eşleştir — parsed adres'ten CONTACT.delivery.serviceAreas ile eşle
   */
  const matchServiceArea = (parsed: ParsedAddress): string => {
    const allText = `${parsed.neighborhood} ${parsed.district} ${parsed.city}`.toLowerCase();
    const matched = CONTACT.delivery.serviceAreas.find((area) =>
      allText.includes(area.toLowerCase())
    );
    return matched || parsed.district || CONTACT.delivery.serviceAreas[0] || "";
  };

  /**
   * Reverse geocode — koordinattan adres çıkar
   * Tüm form alanlarını otomatik doldurur
   */
  const reverseGeocode = async (lat: number, lng: number) => {
    setReverseLoading(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=tr&zoom=18`
      );
      const data = await res.json();
      if (data?.address) {
        const parsed = parseAddress(data, lat, lng);
        setParsedAddress(parsed);

        // Form alanlarını doldur
        const matchedArea = matchServiceArea(parsed);
        setForm((f: any) => ({
          ...f,
          district: matchedArea || f.district,
          street: parsed.street || f.street,
          building: parsed.houseNumber || f.building,
          // address alanı: tam adres özeti
          address: [
            parsed.street,
            parsed.houseNumber && `No:${parsed.houseNumber}`,
            parsed.neighborhood,
            parsed.district,
            parsed.postcode,
          ].filter(Boolean).join(", "),
        }));
      } else {
        setParsedAddress(null);
      }
    } catch {
      setParsedAddress(null);
    } finally {
      setReverseLoading(false);
    }
  };

  const initMap = async () => {
    if (typeof window === "undefined" || !mapRef.current) return;

    // Leaflet dinamik import (sadece modal açıkken)
    const L = (await import("leaflet")).default;

    // CSS ekle (bir kez)
    if (!document.querySelector("#leaflet-css")) {
      const link = document.createElement("link");
      link.id = "leaflet-css";
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }

    // Merkez: Demos Pizza
    const center: [number, number] = [41.0096, 28.9471];

    // Harita zaten varsa temizle
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    mapInstanceRef.current = L.map(mapRef.current, {
      zoomControl: false,
      attributionControl: false,
    }).setView(center, 15);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: "© OpenStreetMap",
    }).addTo(mapInstanceRef.current);

    // Zoom kontrolleri
    L.control.zoom({ position: "bottomright" }).addTo(mapInstanceRef.current);

    // Restoran marker (🍕)
    const restaurantIcon = L.divIcon({
      html: `<div style="font-size: 36px; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));">🍕</div>`,
      className: "",
      iconSize: [36, 36],
      iconAnchor: [18, 18],
    });
    L.marker(center, { icon: restaurantIcon }).addTo(mapInstanceRef.current);

    // Restoran çevresi daire (teslimat bölgesi görseli)
    L.circle(center, {
      color: "#FF2D8D",
      fillColor: "#FF2D8D",
      fillOpacity: 0.08,
      weight: 2,
      radius: 1500, // 1.5km teslimat alanı
    }).addTo(mapInstanceRef.current);

    // Kullanıcı adres pin'i (sürüklenebilir)
    const userIcon = L.divIcon({
      html: `<div style="position: relative; width: 40px; height: 40px;">
        <div style="position: absolute; top: 0; left: 0; width: 32px; height: 32px; border-radius: 50% 50% 50% 0; background: #FF2D8D; transform: rotate(-45deg); border: 4px solid white; box-shadow: 0 4px 8px rgba(0,0,0,0.3);"></div>
        <div style="position: absolute; top: 10px; left: 10px; width: 12px; height: 12px; border-radius: 50%; background: white;"></div>
      </div>`,
      className: "",
      iconSize: [40, 40],
      iconAnchor: [20, 40],
    });

    markerRef.current = L.marker(center, {
      icon: userIcon,
      draggable: true,
      autoPan: true,
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
    // İlk yüklemede restoran adresini göster
    reverseGeocode(center[0], center[1]);
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
          mapInstanceRef.current.setView([latitude, longitude], 17);
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
          modernToast("error", "Konum alınamadı", "Lütfen haritadan seçin");
        }
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const selectSearchResult = (result: NominatimResult) => {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    if (mapInstanceRef.current && markerRef.current) {
      mapInstanceRef.current.setView([lat, lng], 18);
      markerRef.current.setLatLng([lat, lng]);
      setMarkerPos({ lat, lng });
      reverseGeocode(lat, lng);
    }
    setSearchQuery("");
    setSearchResults([]);
  };

  const confirmLocation = () => {
    if (!parsedAddress) {
      modernToast("error", "Önce bir konum seçin");
      return;
    }
    setMapOpen(false);
    onLocationSet?.();
    modernToast(
      "success",
      "Konum alındı!",
      parsedAddress.street
        ? `${parsedAddress.street}${parsedAddress.houseNumber ? " No:" + parsedAddress.houseNumber : ""} — ${parsedAddress.neighborhood || parsedAddress.district}`
        : parsedAddress.fullAddress
    );
  };

  return (
    <>
      {/* Konum Al butonu — ana CTA */}
      <button
        type="button"
        onClick={() => setMapOpen(true)}
        className="w-full flex items-center justify-center gap-2 bg-ink hover:bg-ink/90 text-white h-12 rounded-xl font-semibold transition-colors text-sm"
      >
        <Navigation className="h-4 w-4" />
        Konum Al
      </button>

      {/* Seçilen adres özeti — konum alındıktan sonra görünür */}
      {parsedAddress && parsedAddress.street && (
        <div className="p-3 rounded-xl bg-basil/5 border border-basil/20">
          <div className="flex items-start gap-2">
            <CheckCircle2 className="h-4 w-4 text-basil shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <div className="text-[10px] text-basil font-semibold uppercase tracking-wide">Konum Alındı</div>
              <div className="text-xs text-ink/80 mt-0.5 font-medium">
                {parsedAddress.street}
                {parsedAddress.houseNumber && ` No:${parsedAddress.houseNumber}`}
              </div>
              <div className="text-[11px] text-ink/50 mt-0.5">
                {parsedAddress.neighborhood}
                {parsedAddress.district && `, ${parsedAddress.district}`}
                {parsedAddress.postcode && ` ${parsedAddress.postcode}`}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Harita modal — full screen */}
      {mapOpen && (
        <div className="fixed inset-0 z-[60] bg-black/60 flex items-end md:items-center justify-center p-0 md:p-4">
          <div className="bg-paper rounded-t-3xl md:rounded-3xl w-full max-w-2xl h-[90vh] md:h-[80vh] flex flex-col overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-ink/8 shrink-0">
              <div className="min-w-0">
                <h3 className="font-display font-bold text-ink text-base flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-pink" />
                  Konum Seç
                </h3>
                <p className="text-[11px] text-ink/50 mt-0.5">
                  Haritadan işaretle, adres ara veya GPS kullan
                </p>
              </div>
              <button
                onClick={() => setMapOpen(false)}
                className="w-9 h-9 flex items-center justify-center rounded-xl text-ink/50 hover:text-ink hover:bg-ink/5 transition-colors shrink-0"
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
                  placeholder="Sokak, mahalle veya cadde ara..."
                  className="w-full pl-9 pr-9 py-2.5 rounded-xl border border-ink/15 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-pink/30 focus:border-pink"
                />
                {searching && (
                  <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-ink/30" />
                )}
              </div>

              {/* Arama sonuçları */}
              {searchResults.length > 0 && (
                <div className="absolute left-3 right-3 mt-1 bg-white rounded-xl border border-ink/10 shadow-xl max-h-56 overflow-y-auto z-20">
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

            {/* Mevcut konum butonu — harita üzerinde floating */}
            <button
              onClick={useMyLocation}
              disabled={locating}
              className="absolute bottom-32 right-5 z-[500] w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-paper transition-colors disabled:opacity-50 border-2 border-pink/20"
              aria-label="Mevcut konumumu kullan"
            >
              {locating ? (
                <Loader2 className="h-5 w-5 animate-spin text-pink" />
              ) : (
                <Crosshair className="h-5 w-5 text-pink" />
              )}
            </button>

            {/* Reverse loading indicator */}
            {reverseLoading && (
              <div className="absolute top-20 left-1/2 -translate-x-1/2 z-[500] bg-ink/90 text-white text-xs px-3 py-1.5 rounded-full flex items-center gap-2 shadow-lg">
                <Loader2 className="h-3 w-3 animate-spin" />
                Adres alınıyor...
              </div>
            )}

            {/* Footer — seçilen adres detayı + onayla */}
            <div className="p-4 border-t border-ink/8 shrink-0 space-y-3 bg-paper">
              {parsedAddress && parsedAddress.street ? (
                <div className="p-3 rounded-xl bg-pink/5 border border-pink/20">
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-pink shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <div className="text-[10px] text-pink font-semibold uppercase tracking-wide">Seçilen Adres</div>
                      <div className="text-sm text-ink font-medium mt-0.5">
                        {parsedAddress.street}
                        {parsedAddress.houseNumber && ` No:${parsedAddress.houseNumber}`}
                      </div>
                      <div className="text-[11px] text-ink/50 mt-0.5">
                        {parsedAddress.neighborhood}
                        {parsedAddress.district && `, ${parsedAddress.district}`}
                        {parsedAddress.postcode && ` · ${parsedAddress.postcode}`}
                      </div>
                      {/* Koordinat — küçük */}
                      <div className="text-[10px] text-ink/30 mt-1 font-mono">
                        {parsedAddress.lat.toFixed(5)}, {parsedAddress.lng.toFixed(5)}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-ink/50 text-center py-2">
                  {reverseLoading ? "Adres alınıyor..." : "Haritadan bir nokta seç veya adres ara"}
                </p>
              )}
              <button
                onClick={confirmLocation}
                disabled={!parsedAddress || !parsedAddress.street}
                className="w-full bg-pink hover:bg-pink-hover disabled:bg-ink/20 disabled:text-ink/40 text-white h-12 rounded-xl font-semibold transition-colors"
              >
                Bu Konumu Kullan
              </button>
              <p className="text-[10px] text-ink/40 text-center">
                Bina no, daire ve kat bilgilerini aşağıdaki formdan girebilirsin
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
