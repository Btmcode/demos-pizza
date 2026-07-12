"use client";

import * as React from "react";
import { ShoppingBag, Plus, Flame, Leaf, Sparkles, Star, Pizza } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CURRENCY } from "@/lib/constants";
import { useCart } from "./cart-context";
import { toast } from "sonner";

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
  { value: "SIGNATURE", label: "İmza Pizzalar", icon: Star },
  { value: "PIZZA", label: "Klasik Pizzalar", icon: Flame },
  { value: "SIDES", label: "Yan Lezzetler", icon: Leaf },
  { value: "DESSERTS", label: "Tatlılar", icon: Sparkles },
  { value: "DRINKS", label: "İçecekler", icon: Leaf },
] as const;

const TAG_META: Record<string, { label: string; cls: string; icon?: any }> = {
  VEGETARIAN: { label: "Vejetaryen", cls: "bg-basil/15 text-basil border-basil/30" },
  VEGAN: { label: "Vegan", cls: "bg-basil/20 text-basil border-basil/40" },
  SPICY: { label: "Acı", cls: "bg-ember/15 text-ember border-ember/30", icon: Flame },
  NEW: { label: "Yeni", cls: "bg-saffron/20 text-saffron border-saffron/40", icon: Sparkles },
  HALAL: { label: "Helal", cls: "bg-basil/10 text-basil border-basil/25" },
  GLUTEN_FREE: { label: "Glutensiz", cls: "bg-cream/20 text-cream border-cream/30" },
  CHEF_SPECIAL: { label: "Şefin Önerisi", cls: "bg-ember/15 text-ember border-ember/30", icon: Star },
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
    return () => {
      mounted = false;
    };
  }, []);

  const filtered = items.filter((i) => i.category === active);
  const featured = items.filter((i) => i.isFeatured).slice(0, 3);

  return (
    <section id="menu" className="bg-cream py-20 md:py-28 relative overflow-hidden">
      {/* Background watermark */}
      <div className="absolute -right-20 top-32 text-[280px] font-display font-bold text-ember/[0.04] select-none pointer-events-none">
        MENU
      </div>

      <div className="container mx-auto px-6 relative">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-ember text-xs font-mono uppercase tracking-[0.3em]">
            {"// Menümüz"}
          </span>
          <h2 className="font-display text-4xl md:text-5xl font-bold mt-3 text-charcoal">
            Her lokmada <span className="text-ember italic">İtalya</span>
          </h2>
          <p className="mt-4 text-charcoal/70 text-base md:text-lg">
            Taş fırında, günlük taze malzemelerle hazırlanan pizzalarımız.
            Her biri özenle, sevgiyle pişirilir.
          </p>
        </div>

        {/* Featured strip */}
        {featured.length > 0 && (
          <div className="mb-14 grid grid-cols-1 md:grid-cols-3 gap-5">
            {featured.map((item) => (
              <FeaturedCard key={item.id} item={item} />
            ))}
          </div>
        )}

        {/* Tabs */}
        <Tabs value={active} onValueChange={setActive} className="mb-10">
          <TabsList className="bg-charcoal/5 h-auto p-1.5 flex flex-wrap gap-1 justify-center">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              return (
                <TabsTrigger
                  key={cat.value}
                  value={cat.value}
                  className="data-[state=active]:bg-ember data-[state=active]:text-cream data-[state=active]:shadow-md px-4 md:px-5 py-2.5 text-sm font-medium transition-all"
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-80 rounded-2xl bg-charcoal/5" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-charcoal/50">
            Bu kategoride henüz ürün yok.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
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
    <article className="group relative overflow-hidden rounded-2xl bg-charcoal text-cream shadow-xl">
      <div className="aspect-[5/4] overflow-hidden">
        <img
          src={item.imageUrl || "/images/hero-pizza.png"}
          alt={item.name}
          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-700"
          loading="lazy"
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-charcoal/40 to-transparent" />
      <div className="absolute top-3 left-3">
        <Badge className="bg-saffron text-charcoal border-0 font-semibold">
          <Star className="h-3 w-3 mr-1 fill-charcoal" />
          İmza
        </Badge>
      </div>
      <div className="absolute bottom-0 inset-x-0 p-5">
        <h3 className="font-display text-2xl font-bold">{item.name}</h3>
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
            className="bg-ember hover:bg-ember/90 text-cream"
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
    <article className="group bg-white rounded-2xl overflow-hidden border border-charcoal/8 shadow-sm hover:shadow-xl hover:border-ember/30 transition-all duration-300 flex flex-col">
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-cream">
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt={item.name}
            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-700"
            loading="lazy"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-cream to-muted">
            <Pizza className="h-16 w-16 text-ember/30" />
          </div>
        )}
        {/* Tags */}
        {item.tags.length > 0 && (
          <div className="absolute top-2 left-2 flex flex-wrap gap-1">
            {item.tags.slice(0, 3).map((tag) => {
              const meta = TAG_META[tag] || { label: tag, cls: "bg-cream/80 text-charcoal" };
              const Icon = meta.icon;
              return (
                <span
                  key={tag}
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border backdrop-blur-sm ${meta.cls}`}
                >
                  {Icon && <Icon className="h-2.5 w-2.5 mr-0.5" />}
                  {meta.label}
                </span>
              );
            })}
          </div>
        )}
      </div>

      {/* Body */}
      <div className="p-5 flex flex-col flex-1">
        <h3 className="font-display text-xl font-bold text-charcoal">{item.name}</h3>
        <p className="text-sm text-charcoal/65 mt-1 line-clamp-2 flex-1">{item.description}</p>

        {/* Ingredients */}
        {item.ingredients.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1">
            {item.ingredients.slice(0, 4).map((ing, i) => (
              <span
                key={i}
                className="text-[10px] px-1.5 py-0.5 rounded bg-charcoal/5 text-charcoal/70"
              >
                {ing}
              </span>
            ))}
            {item.ingredients.length > 4 && (
              <span className="text-[10px] px-1.5 py-0.5 text-charcoal/50">
                +{item.ingredients.length - 4}
              </span>
            )}
          </div>
        )}

        {/* Sizes */}
        {hasSizes && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {item.sizes!.map((s, i) => (
              <button
                key={i}
                onClick={() => setSelectedSize(i)}
                className={`text-xs px-2.5 py-1 rounded-lg border transition-all ${
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
        <div className="mt-4 pt-4 border-t border-charcoal/8 flex items-center justify-between">
          <div>
            <div className="font-display text-2xl font-bold text-ember">
              {CURRENCY.formatShort(price)}
            </div>
            {hasSizes && selectedSize === 0 && item.sizes!.length > 1 && (
              <div className="text-[10px] text-charcoal/50">
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
            className="bg-charcoal hover:bg-ember text-cream group-hover:bg-ember transition-colors"
          >
            <ShoppingBag className="h-3.5 w-3.5 mr-1.5" />
            Ekle
          </Button>
        </div>
      </div>
    </article>
  );
}
