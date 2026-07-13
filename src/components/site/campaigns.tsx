"use client";

import * as React from "react";
import { Tag, Flame, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface Campaign {
  id: string;
  title: string;
  description: string;
  code: string | null;
  discountPct: number | null;
  discountCents: number | null;
  imageUrl: string | null;
  isActive: boolean;
}

export function Campaigns() {
  const [campaigns, setCampaigns] = React.useState<Campaign[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    fetch("/api/campaigns", { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => {
        if (data.campaigns) setCampaigns(data.campaigns);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (!loading && campaigns.length === 0) return null;

  return (
    <section id="kampanyalar" className="bg-paper py-16 md:py-24">
      <div className="container mx-auto px-4 md:px-6">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-10 md:mb-12">
          <Badge variant="outline" className="border-pink/30 text-pink mb-3">
            <Flame className="h-3 w-3 mr-1" />
            Sıcak Fırsatlar
          </Badge>
          <h2 className="font-display text-3xl md:text-5xl font-bold text-ink leading-tight">
            <span className="text-gradient-pink">Kampanyalar</span> & Fırsatlar
          </h2>
          <p className="mt-3 text-ink/70 text-sm md:text-base">
            Özel indirimler, kampanya kodları ve sınırlı süreli fırsatlar. Kaçırma!
          </p>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-48 rounded-2xl bg-ink/5" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
            {campaigns.map((c) => (
              <div
                key={c.id}
                className="group relative overflow-hidden rounded-2xl bg-ink text-white card-premium flex flex-col"
              >
                {/* Campaign image */}
                {c.imageUrl && (
                  <div className="relative aspect-[16/9] overflow-hidden bg-ink-2">
                    <img
                      src={c.imageUrl}
                      alt={c.title}
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-transparent" />
                    {/* Discount badge on image */}
                    {c.discountPct && (
                      <div className="absolute top-3 right-3">
                        <div className="bg-yellow text-ink font-display font-bold text-xl px-3 py-1 rounded-lg shadow-premium">
                          %{c.discountPct}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Content */}
                <div className="p-5 flex flex-col flex-1 relative">
                  <div className="flex items-start gap-2 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-pink/20 flex items-center justify-center shrink-0">
                      <Tag className="h-4 w-4 text-pink" />
                    </div>
                    <h3 className="font-display text-lg font-bold leading-tight">{c.title}</h3>
                  </div>
                  <p className="text-white/70 text-sm leading-relaxed flex-1">{c.description}</p>

                  {/* Code */}
                  {c.code && (
                    <div className="mt-3 pt-3 border-t border-white/10">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] text-white/50">Kampanya Kodu:</span>
                        <code className="px-2.5 py-1 rounded-lg bg-yellow/10 text-yellow font-mono font-bold text-xs border border-yellow/20">
                          {c.code}
                        </code>
                      </div>
                    </div>
                  )}

                  {/* CTA */}
                  <a href="#menu" className="mt-3">
                    <Button size="sm" className="w-full bg-pink hover:bg-pink-hover text-white shadow-pink-glow btn-premium">
                      Sipariş Ver
                      <ArrowRight className="ml-2 h-3.5 w-3.5" />
                    </Button>
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
