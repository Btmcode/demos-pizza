"use client";

import * as React from "react";
import { Sparkles, Loader2, ArrowRight, RotateCcw, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { CURRENCY } from "@/lib/constants";
import { useCart } from "./cart-context";
import { toast } from "sonner";

const QUICK_PREFS = [
  "Acı seven biri için",
  "Vejetaryen",
  "Çok peynirli olsun",
  "Çocuklar için",
  "Sucuklu klasik",
  "Lüks bir şey",
  "Ekonomik",
  "Bol malzemeli",
];

interface Recommendation {
  name: string;
  reason: string;
  match: number;
  slug: string;
  price: string;
  priceCents: number;
  imageUrl: string | null;
  description: string;
}

export function AIRecommendation() {
  const [preferences, setPreferences] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [recommendations, setRecommendations] = React.useState<Recommendation[]>([]);
  const { addItem } = useCart();

  const getRecommendations = async (pref?: string) => {
    const query = pref || preferences;
    if (!query.trim()) {
      toast.error("Lütfen bir tercih girin");
      return;
    }
    setLoading(true);
    setRecommendations([]);
    try {
      const res = await fetch("/api/ai/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ preferences: query }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Öneri alınamadı");
        return;
      }
      setRecommendations(data.recommendations || []);
      if (!data.recommendations?.length) {
        toast.info("Bu tercihe uygun pizza bulunamadı");
      }
    } catch {
      toast.error("Bağlantı hatası");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickPref = (pref: string) => {
    setPreferences(pref);
    getRecommendations(pref);
  };

  return (
    <section id="ai-recommendation" className="bg-ink py-16 md:py-24 relative overflow-hidden">
      <div className="absolute inset-0 dot-pattern opacity-30" />
      <div className="container mx-auto px-4 md:px-6 relative">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8 md:mb-10">
            <Badge variant="outline" className="glass-dark border-pink/40 text-pink mb-3">
              <Sparkles className="h-3 w-3 mr-1" />
              AI Destekli
            </Badge>
            <h2 className="font-display text-3xl md:text-5xl font-bold text-white leading-tight">
              Sana özel pizza
              <br />
              <span className="text-gradient-pink">AI ile öner</span>
            </h2>
            <p className="mt-3 text-white/70 text-sm md:text-base">
              Tercihlerini yaz, AI sana en uygun pizzaları seçsin. 3 saniyede kişiselleştirilmiş öneri.
            </p>
          </div>

          {/* Input card */}
          <div className="glass-dark rounded-2xl p-5 md:p-6 shadow-premium-lg">
            <div className="flex flex-col gap-3">
              <Textarea
                value={preferences}
                onChange={(e) => setPreferences(e.target.value)}
                placeholder="Örn: Acı seven biri için, bol peynirli, çıtır hamur..."
                rows={3}
                maxLength={300}
                className="bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:border-pink"
              />
              <div className="flex flex-wrap gap-1.5">
                {QUICK_PREFS.map((p) => (
                  <button
                    key={p}
                    onClick={() => handleQuickPref(p)}
                    disabled={loading}
                    className="text-[11px] px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-white/70 hover:bg-pink/10 hover:border-pink/30 hover:text-pink transition-colors disabled:opacity-50"
                  >
                    {p}
                  </button>
                ))}
              </div>
              <Button
                onClick={() => getRecommendations()}
                disabled={loading || !preferences.trim()}
                className="bg-pink hover:bg-pink-hover text-white shadow-pink-glow btn-premium"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    AI düşünüyor...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    AI Öneri Al
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Recommendations */}
          {recommendations.length > 0 && (
            <div className="mt-6 md:mt-8 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-display font-bold text-white text-lg flex items-center gap-2">
                  <Heart className="h-4 w-4 text-pink" />
                  Sana özel öneriler
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => getRecommendations()}
                  disabled={loading}
                  className="text-white/60 hover:text-pink hover:bg-pink/5"
                >
                  <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
                  Yenile
                </Button>
              </div>
              {recommendations.map((rec, i) => (
                <div
                  key={rec.slug}
                  className="glass-dark rounded-2xl p-4 md:p-5 card-premium"
                >
                  <div className="flex items-start gap-4">
                    {rec.imageUrl && (
                      <div className="w-16 h-16 md:w-20 md:h-20 rounded-xl overflow-hidden bg-ink-2 shrink-0">
                        <img
                          src={rec.imageUrl}
                          alt={rec.name}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="font-display font-bold text-white text-base md:text-lg">
                            {rec.name}
                          </h4>
                          <div className="flex items-center gap-2 mt-0.5">
                            <Badge className="bg-pink/15 text-pink border-pink/30 text-[10px]">
                              %{rec.match} eşleşme
                            </Badge>
                            <span className="text-yellow font-display font-bold text-sm">
                              {rec.price}
                            </span>
                          </div>
                        </div>
                      </div>
                      <p className="text-white/70 text-xs md:text-sm mt-1.5 leading-relaxed">
                        {rec.reason}
                      </p>
                      <Button
                        size="sm"
                        onClick={() => {
                          addItem({
                            slug: rec.slug,
                            name: rec.name,
                            unitPriceCents: rec.priceCents,
                            extras: [],
                            imageUrl: rec.imageUrl,
                          });
                          toast.success(`${rec.name} sepete eklendi!`);
                        }}
                        className="mt-3 bg-pink hover:bg-pink-hover text-white h-8 text-xs"
                      >
                        Sepete Ekle
                        <ArrowRight className="ml-1.5 h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
