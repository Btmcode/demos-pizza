"use client";

import * as React from "react";
import { ShoppingBag, Plus, Flame, Leaf, Sparkles, Star, Pizza, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CURRENCY } from "@/lib/constants";
import { useCart } from "./cart-context";

export interface MenuItem {
  id: string;
  slug: string;
  name: string;
  description: string;
  priceCents: number;
  category: string;
  imageUrl?: string | null;
  isFeatured?: boolean;
  ingredients: string[];
  tags: string[];
  allergens: string[];
  sizes?: { size: string; diameter?: number; priceCents: number }[];
  crustTypes?: { type: string; priceCents: number }[];
  extras?: { category: string; name: string; priceCents: number }[];
}

const CATEGORIES = [
  { value: "SIGNATURE", label: "İmza", icon: Star },
  { value: "PIZZA", label: "Pizzalar", icon: Flame },
  { value: "SIDES", label: "Yan Lezzetler", icon: Leaf },
  { value: "DESSERTS", label: "Tatlılar", icon: Sparkles },
  { value: "DRINKS", label: "İçecekler", icon: Leaf },
] as const;

const TAG_META: Record<string, { label: string; cls: string; icon?: any }> = {
  VEGETARIAN: { label: "Vegan", cls: "bg-basil/10 text-basil border-basil/25" },
  VEGAN: { label: "Vegan", cls: "bg-basil/15 text-basil border-basil/30" },
  SPICY: { label: "Acı", cls: "bg-ember/10 text-ember border-ember/25", icon: Flame },
  NEW: { label: "Yeni", cls: "bg-saffron/15 text-saffron border-saffron/30", icon: Sparkles },
  HALAL: { label: "Helal", cls: "bg-basil/5 text-basil border-basil/20" },
  GLUTEN_FREE: { label: "Glutensiz", cls: "bg-charcoal/5 text-charcoal border-charcoal/15" },
  CHEF_SPECIAL: { label: "Şefin Önerisi", cls: "bg-ember/10 text-ember border-ember/25", icon: Star },
};

export function MenuSection() {
  const [items, setItems] = React.useState<MenuItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [active, setActive] = React.useState<string>("SIGNATURE");

  React.useEffect(() => {
    let mounted = true;
    fetch("/api/menu", { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => {
        if (mounted && Array.isArray(data.items)) setItems(data.items);
      })
      .catch(() => {})
      .finally(() => mounted && setLoading(false));
    return () => { mounted = false; };
  }, []);

  const filtered = items.filter((i) => i.category === active);
  const featured = items.filter((i) => i.isFeatured).slice(0, 3);

  return (
    <section id="menu" className="bg-cream py-16 md:py-20 relative">
      <div className="container mx-auto px-4 md:px-6 relative">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-10 md:mb-12">
          <span className="text-ember text-xs font-mono uppercase tracking-[0.25em]">
            {"// Menümüz"}
          </span>
          <h2 className="font-display text-3xl md:text-5xl font-bold mt-3 text-charcoal leading-tight">
            Taze pizzasını <span className="text-ember italic">seç</span>
          </h2>
          <p className="mt-3 text-charcoal/70 text-sm md:text-base">
            Her sabah taze hazırlanan hamur, günlük gelen malzemeler.
            Sipariş ver, 30-45 dakikada kapında.
          </p>
        </div>

        {/* Featured strip */}
        {featured.length > 0 && !loading && (
          <div className="mb-10 md:mb-12 grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
            {featured.map((item) => (
              <FeaturedCard key={item.id} item={item} />
            ))}
          </div>
        )}

        {/* Tabs */}
        <Tabs value={active} onValueChange={setActive} className="mb-8">
          <TabsList className="bg-charcoal/5 h-auto p-1 flex flex-wrap gap-1 justify-center rounded-xl">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              return (
                <TabsTrigger
                  key={cat.value}
                  value={cat.value}
                  className="data-[state=active]:bg-ember data-[state=active]:text-cream data-[state=active]:shadow-sm px-3.5 md:px-5 py-2 text-xs md:text-sm font-medium transition-colors rounded-lg"
                >
                  <Icon className="h-3.5 w-3.5 mr-1.5 hidden sm:inline" />
                  {cat.label}
                </TabsTrigger>
              );
            })}
          </TabsList>
        </Tabs>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-80 rounded-2xl bg-charcoal/5" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-charcoal/50">
            Bu kategoride henüz ürün yok.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
            {filtered.map((item) => (
              <MenuCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function FeaturedCard({ item }: { item: MenuItem }) {
  const { addItem } = useCart();
  const price = item.sizes?.length ? item.sizes[0].priceCents : item.priceCents;

  return (
    <article className="group relative overflow-hidden rounded-2xl bg-charcoal text-cream card-hover">
      <div className="aspect-[5/4] overflow-hidden bg-smoke">
        <img
          src={item.imageUrl || "/images/hero-pizza.png"}
          alt={item.name}
          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
      </div>
      <div className="absolute top-3 left-3">
        <Badge className="bg-saffron text-charcoal border-0 font-semibold shadow-sm">
          <Star className="h-3 w-3 mr-1 fill-charcoal" />
          İmza
        </Badge>
      </div>
      <div className="absolute bottom-0 inset-x-0 bg-charcoal p-5">
        <h3 className="font-display text-xl md:text-2xl font-bold">{item.name}</h3>
        <p className="text-cream/75 text-sm mt-1 line-clamp-2">{item.description}</p>
        <div className="mt-3 flex items-center justify-between">
          <span className="font-display text-2xl font-bold text-saffron">
            {CURRENCY.formatShort(price)}
          </span>
          <Button
            size="sm"
            onClick={() =>
              addItem({
                slug: item.slug,
                menuItemId: item.id,
                name: item.name,
                size: item.sizes?.[0]?.size,
                unitPriceCents: price,
                extras: [],
                imageUrl: item.imageUrl,
              })
            }
            className="bg-ember hover:bg-ember/90 text-cream shadow-sm"
          >
            <Plus className="h-4 w-4 mr-1" />
            Ekle
          </Button>
        </div>
      </div>
    </article>
  );
}

function MenuCard({ item }: { item: MenuItem }) {
  const { addItem } = useCart();
  const [selectedSize, setSelectedSize] = React.useState(0);
  const hasSizes = item.sizes && item.sizes.length > 0;
  const price = hasSizes ? item.sizes![selectedSize].priceCents : item.priceCents;

  return (
    <article className="group bg-white rounded-2xl overflow-hidden border border-charcoal/8 card-hover flex flex-col">
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-cream">
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt={item.name}
            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center bg-secondary">
            <Pizza className="h-12 w-12 text-ember/25" />
          </div>
        )}
        {item.tags.length > 0 && (
          <div className="absolute top-2 left-2 flex flex-wrap gap-1">
            {item.tags.slice(0, 2).map((tag) => {
              const meta = TAG_META[tag] || { label: tag, cls: "bg-cream/90 text-charcoal border-cream/30" };
              const Icon = meta.icon;
              return (
                <span
                  key={tag}
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border backdrop-blur-sm bg-white/90 ${meta.cls.replace(/bg-[^/]+\/\d+/, 'bg-white/90')}`}
                >
                  {Icon && <Icon className="h-2.5 w-2.5 mr-0.5" />}
                  {meta.label}
                </span>
              );
            })}
          </div>
        )}
        {item.isFeatured && (
          <div className="absolute top-2 right-2">
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-saffron text-charcoal">
              <Star className="h-2.5 w-2.5 mr-0.5 fill-charcoal" />
              İmza
            </span>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="p-4 md:p-5 flex flex-col flex-1">
        <h3 className="font-display text-lg md:text-xl font-bold text-charcoal leading-tight">{item.name}</h3>
        <p className="text-xs md:text-sm text-charcoal/65 mt-1 line-clamp-2 flex-1">{item.description}</p>

        {/* Ingredients */}
        {item.ingredients.length > 0 && (
          <div className="mt-2.5 flex flex-wrap gap-1">
            {item.ingredients.slice(0, 3).map((ing, i) => (
              <span
                key={i}
                className="text-[10px] px-1.5 py-0.5 rounded bg-charcoal/5 text-charcoal/60"
              >
                {ing}
              </span>
            ))}
            {item.ingredients.length > 3 && (
              <span className="text-[10px] px-1.5 py-0.5 text-charcoal/40">
                +{item.ingredients.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Sizes */}
        {hasSizes && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {item.sizes!.map((s, i) => (
              <button
                key={i}
                onClick={() => setSelectedSize(i)}
                className={`text-[11px] px-2.5 py-1 rounded-md border transition-colors ${
                  i === selectedSize
                    ? "bg-ember text-cream border-ember"
                    : "bg-cream text-charcoal/70 border-charcoal/15 hover:border-ember/40"
                }`}
              >
                {s.size}
              </button>
            ))}
          </div>
        )}

        {/* Price + add */}
        <div className="mt-3.5 pt-3 border-t border-charcoal/8 flex items-center justify-between gap-2">
          <div>
            <div className="font-display text-xl md:text-2xl font-bold text-ember leading-none">
              {CURRENCY.formatShort(price)}
            </div>
            {hasSizes && item.sizes!.length > 1 && (
              <div className="text-[10px] text-charcoal/50 mt-1">
                {CURRENCY.formatShort(item.sizes![item.sizes!.length - 1].priceCents)}'e kadar
              </div>
            )}
          </div>
          <Button
            size="sm"
            onClick={() =>
              addItem({
                slug: item.slug,
                menuItemId: item.id,
                name: item.name,
                size: hasSizes ? item.sizes![selectedSize].size : undefined,
                unitPriceCents: price,
                extras: [],
                imageUrl: item.imageUrl,
              })
            }
            className="bg-charcoal hover:bg-ember text-cream transition-colors h-9 px-3"
          >
            <ShoppingBag className="h-3.5 w-3.5 mr-1.5" />
            Ekle
          </Button>
        </div>
      </div>
    </article>
  );
}
