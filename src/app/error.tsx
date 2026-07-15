"use client";

import * as React from "react";
import { AlertCircle, RotateCcw } from "lucide-react";

/**
 * Error boundary — sayfa hatalarında zarif geri bildirim
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    console.error("Page error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-paper flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 mx-auto rounded-full bg-pink/10 flex items-center justify-center mb-4">
          <AlertCircle className="h-10 w-10 text-pink" />
        </div>
        <h1 className="font-display text-2xl font-bold text-ink mb-2">
          Bir şeyler ters gitti
        </h1>
        <p className="text-sm text-ink/60 mb-6">
          Sayfa yüklenirken bir hata oluştu. Lütfen tekrar deneyin.
        </p>
        <button
          onClick={reset}
          className="inline-flex items-center gap-2 bg-pink hover:bg-pink-hover text-white px-6 h-12 rounded-xl font-semibold transition-colors"
        >
          <RotateCcw className="h-4 w-4" />
          Tekrar Dene
        </button>
      </div>
    </div>
  );
}
