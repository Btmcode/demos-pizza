"use client";

import * as React from "react";

interface DateDisplayProps {
  date: string | Date | null | undefined;
  locale?: string;
  options?: Intl.DateTimeFormatOptions;
  fallback?: string;
}

/**
 * Hydration-safe date formatter.
 *
 * SSR'de boş string döner, client mount olduktan sonra gerçek değeri gösterir.
 * Bu, sunucu ve istemci arasındaki timezone farkından kaynaklı
 * hydration mismatch'leri önler.
 *
 * Kullanım:
 *   <DateDisplay date={order.createdAt} />
 *   <DateDisplay date={log.createdAt} options={{ dateStyle: "short", timeStyle: "medium" }} />
 *   <DateDisplay date={order.createdAt} locale="tr-TR" options={{ day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }} />
 */
export function DateDisplay({
  date,
  locale = "tr-TR",
  options,
  fallback = "",
}: DateDisplayProps) {
  const [formatted, setFormatted] = React.useState<string>(fallback);

  React.useEffect(() => {
    if (!date) {
      setFormatted(fallback);
      return;
    }
    try {
      setFormatted(new Date(date).toLocaleString(locale, options));
    } catch {
      setFormatted(fallback);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date, locale, JSON.stringify(options)]);

  return <>{formatted}</>;
}
