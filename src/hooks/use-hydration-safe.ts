"use client";

import * as React from "react";

/**
 * Hydration-safe hooks for date/time rendering.
 *
 * SSR ve client render arasında tarih/saat farkından kaynaklı
 * hydration mismatch hatalarını önler.
 *
 * Kullanım:
 *   const dateStr = useCurrentDate("tr-TR", { weekday: "long", ... });
 *   const year = useCurrentYear();
 *
 * İlk render'da (SSR + client ilk mount) sabit/boş değer döner,
 * mount olduktan sonra gerçek değeri gösterir.
 */

/**
 * Mevcut yılı döndürür — hydration-safe.
 * SSR ve client arasında yıl farkı (yılbaşı gece yarısı) sorununu önler.
 */
export function useCurrentYear(fallback = 2025): number {
  const [year, setYear] = React.useState(fallback);
  React.useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);
  return year;
}

/**
 * Mevcut tarihi formatlı döndürür — hydration-safe.
 * SSR'de boş string, client mount olduktan sonra gerçek değer.
 */
export function useCurrentDate(
  locale: string = "tr-TR",
  options?: Intl.DateTimeFormatOptions
): string {
  const [dateStr, setDateStr] = React.useState("");
  React.useEffect(() => {
    setDateStr(new Date().toLocaleDateString(locale, options));
  }, [locale, options]);
  return dateStr;
}

/**
 * Bir tarihi formatlar — hydration-safe.
 * SSR'de boş string döner, client'ta gerçek değer.
 * Veri-gelen (API) tarihler için kullanılır — bu tarihler SSR'de
 * henüz yüklenmediği için sorun olmaz, ama yine de güvenli.
 */
export function useFormattedDate(
  dateInput: string | Date | null | undefined,
  locale: string = "tr-TR",
  options?: Intl.DateTimeFormatOptions
): string {
  const [formatted, setFormatted] = React.useState("");
  React.useEffect(() => {
    if (!dateInput) {
      setFormatted("");
      return;
    }
    try {
      setFormatted(new Date(dateInput).toLocaleString(locale, options));
    } catch {
      setFormatted("");
    }
  }, [dateInput, locale, options]);
  return formatted;
}

/**
 * Componentin mount edilip edilmediğini döndürür.
 * Hydration sonrası kod çalıştırmak için kullanılır.
 */
export function useMounted(): boolean {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => {
    setMounted(true);
  }, []);
  return mounted;
}
