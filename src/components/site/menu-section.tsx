"use client";

import * as React from "react";
import { ShoppingBag, Plus, Flame, Leaf, Sparkles, Star, Pizza, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
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
  { value: "SIGNATURE", label: "İmza", icon: Star },
  { value: "PIZZA", label: "Pizzalar", icon: Flame },
  { value: "SIDES", label: "Yan Lezzetler", icon: Leaf },
  { value: "DESSERTS", label: "Tatlılar", icon: Sparkles },
  { value: "DRINKS", label: "İçecekler", icon: Leaf },
] as const;

const TAG_META: Record<string, { label: string; cls: string; icon?: any }> = {
  VEGETARIAN: { label: "Vegan", cls: "bg-basil/10 text-basil border-basil/25" },
  VEGAN: { label: "Vegan", cls: "bg-basil/15 text-basil border-basil/30" },
  SPICY: { label: "Acı", cls: "bg-pink/10 text-pink border-pink/25", icon: Flame },
  NEW: { label: "Yeni", cls: "bg-yellow/15 text-gold border-yellow/30", icon: Sparkles },
  HALAL: { label: "Helal", cls: "bg-ink/5 text-ink border-ink/15" },
  GLUTEN_FREE: { label: "Glutensiz", cls: "bg-ink/5 text-ink border-ink/15" },
  CHEF_SPECIAL: { label: "Şefin Önerisi", cls: "bg-pink/10 text-pink border-pink/25", icon: Star },
};

export function MenuSection() {
  const [items, setItems] = React.useState<MenuItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [active, setActive] = React.useState<string>("SIGNATURE");
  const [search, setSearch] = React.useState("");

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

  const filtered = React.useMemo(() => {
    let list = items.filter((i) => i.category === active);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((i) =>
        i.name.toLowerCase().includes(q) ||
        i.description.toLowerCase().includes(q) ||
        i.ingredients.some((ing) => ing.toLowerCase().includes(q))
      );
    }
    return list;
  }, [items, active, search]);

  const featured = items.filter((i) => i.isFeatured).slice(0, 3);

  return (
    <section id="menu" className="bg-paper py-16 md:py-24 relative">
      <div className="container mx-auto px-4 md:px-6 relative">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-10 md:mb-12">
          <Badge variant="outline" className="border-pink/30 text-pink mb-3">
            <Sparkles className="h-3 w-3 mr-1" />
            Taze Pizzalar
          </Badge>
          <h2 className="font-display text-3xl md:text-5xl font-bold text-ink leading-tight">
            Taze pizzasını <span className="text-gradient-pink">seç</span>
          </h2>
          <p className="mt-3 text-ink/70 text-sm md:text-base">
            Her sabah taze hazırlanan hamur, günlük gelen malzemeler.
            Sipariş ver, {CONTACT_PLACEHOLDER.deliveryTime} kapında.
          </p>
        </div>

        {/* Featured strip */}
        {featured.length > 0 && !loading && !search && (
          <div className="mb-10 md:mb-12 grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
            {featured.map((item) => (
              <FeaturedCard key={item.id} item={item} />
            ))}
          </div>
        )}

        {/* Search + Tabs */}
        <div className="flex flex-col md:flex-row gap-3 mb-8">
          <div className="relative flex-1 max-w-md mx-auto md:mx-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink/40" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Pizza ara... (örn: acı, sucuk, bol peynir)"
              className="pl-9 bg-paper border-ink/10 focus:border-pink"
            />
          </div>
          <Tabs value={active} onValueChange={setActive} className="w-full md:w-auto">
            <TabsList className="bg-ink/5 h-auto p-1 flex flex-wrap gap-1 justify-center rounded-xl w-full md:w-auto">
              {CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                return (
                  <TabsTrigger
                    key={cat.value}
                    value={cat.value}
                    className="data-[state=active]:bg-pink data-[state=active]:text-white data-[state=active]:shadow-sm px-3 md:px-4 py-2 text-xs md:text-sm font-medium transition-colors rounded-lg"
                  >
                    <Icon className="h-3.5 w-3.5 mr-1.5 hidden sm:inline" />
                    {cat.label}
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </Tabs>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5 items-stretch">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-80 rounded-2xl bg-ink/5" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-ink/50">
            <Pizza className="h-12 w-12 mx-auto mb-3 text-ink/20" />
            <p>Aramanızla eşleşen ürün bulunamadı.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5 items-stretch">
            {filtered.map((item) => (
              <MenuCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

const CONTACT_PLACEHOLDER = { deliveryTime: "30-45 dk" };

function FeaturedCard({ item }: { item: MenuItem }) {
  const { addItem } = useCart();
  const price = item.sizes?.length ? item.sizes[0].priceCents : item.priceCents;

  return (
    <article className="group relative overflow-hidden rounded-2xl bg-ink text-white card-premium">
      <div className="aspect-[5/4] overflow-hidden bg-ink-2">
        <img
          src={item.imageUrl || "/images/hero-pizza.png"}
          alt={item.name}
          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
      </div>
      <div className="absolute top-3 left-3">
        <Badge className="bg-yellow text-ink border-0 font-semibold shadow-premium">
          <Star className="h-3 w-3 mr-1 fill-ink" />
          İmza
        </Badge>
      </div>
      <div className="absolute bottom-0 inset-x-0 bg-ink p-5">
        <h3 className="font-display text-xl md:text-2xl font-bold">{item.name}</h3>
        <p className="text-white/75 text-sm mt-1 line-clamp-2">{item.description}</p>
        <div className="mt-3 flex items-center justify-between">
          <span className="font-display text-2xl font-bold text-yellow">
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
            className="bg-pink hover:bg-pink-hover text-white shadow-pink-glow btn-premium"
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
    <article className="group bg-paper rounded-2xl overflow-hidden border border-ink/8 card-premium flex flex-col h-full">
      <a href={`/menu/${item.slug}`} className="relative aspect-[4/3] overflow-hidden bg-mist/20 block">
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt={item.name}
            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center bg-mist/20">
            <Pizza className="h-12 w-12 text-ink/20" />
          </div>
        )}
        {item.tags.length > 0 && (
          <div className="absolute top-2 left-2 flex flex-wrap gap-1">
            {item.tags.slice(0, 2).map((tag) => {
              const meta = TAG_META[tag] || { label: tag, cls: "bg-paper/90 text-ink border-ink/15" };
              const Icon = meta.icon;
              return (
                <span
                  key={tag}
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border bg-paper/95 ${meta.cls.replace(/bg-[^/]+\/\d+/, 'bg-paper/95')}`}
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
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-yellow text-ink">
              <Star className="h-2.5 w-2.5 mr-0.5 fill-ink" />
              İmza
            </span>
          </div>
        )}
      </a>

      <div className="p-4 md:p-5 flex flex-col flex-1">
        <a href={`/menu/${item.slug}`} className="hover:text-pink transition-colors">
          <h3 className="font-display text-lg md:text-xl font-bold text-ink leading-tight">{item.name}</h3>
        </a>
        <a href={`/menu/${item.slug}`}>
          <p className="text-xs md:text-sm text-ink/65 mt-1 line-clamp-2 flex-1">{item.description}</p>
        </a>

        {item.ingredients.length > 0 && (
          <div className="mt-2.5 flex flex-wrap gap-1">
            {item.ingredients.slice(0, 3).map((ing, i) => (
              <span key={i} className="text-[10px] px-1.5 py-0.5 rounded bg-ink/5 text-ink/60">
                {ing}
              </span>
            ))}
            {item.ingredients.length > 3 && (
              <span className="text-[10px] px-1.5 py-0.5 text-ink/40">
                +{item.ingredients.length - 3}
              </span>
            )}
          </div>
        )}

        {hasSizes && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {item.sizes!.map((s, i) => (
              <button
                key={i}
                onClick={() => setSelectedSize(i)}
                className={`text-[11px] px-2.5 py-1 rounded-md border transition-colors ${
                  i === selectedSize
                    ? "bg-pink text-white border-pink"
                    : "bg-paper text-ink/70 border-ink/15 hover:border-pink/40"
                }`}
              >
                {s.size}
              </button>
            ))}
          </div>
        )}

        <div className="mt-3.5 pt-3 border-t border-ink/8 flex items-center justify-between gap-2">
          <div>
            <div className="font-display text-xl md:text-2xl font-bold text-pink leading-none">
              {CURRENCY.formatShort(price)}
            </div>
            {hasSizes && item.sizes!.length > 1 && (
              <div className="text-[10px] text-ink/50 mt-1">
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
            className="bg-ink hover:bg-pink text-white transition-colors h-9 px-3 btn-premium"
          >
            <ShoppingBag className="h-3.5 w-3.5 mr-1.5" />
            Ekle
          </Button>
        </div>
      </div>
    </article>
  );
}
