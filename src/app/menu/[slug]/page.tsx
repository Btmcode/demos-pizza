"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowLeft, ShoppingBag, Plus, Minus, Flame, Leaf, Sparkles, Star,
  Check, Loader2, ChevronRight, AlertCircle, X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { CURRENCY } from "@/lib/constants";
import { useCart } from "@/components/site/cart-context";
import { toast } from "sonner";

interface MenuItemDetail {
  id: string;
  slug: string;
  name: string;
  description: string;
  priceCents: number;
  category: string;
  imageUrl?: string | null;
  isFeatured: boolean;
  ingredients: string[];
  tags: string[];
  allergens: string[];
  sizes: { size: string; diameter?: number; priceCents: number }[];
  crustTypes: { type: string; priceCents: number }[];
  extras: { category: string; name: string; priceCents: number }[];
}

interface RelatedItem {
  id: string;
  slug: string;
  name: string;
  priceCents: number;
  imageUrl?: string | null;
  category: string;
  isFeatured: boolean;
}

const TAG_META: Record<string, { label: string; cls: string; icon?: any }> = {
  VEGETARIAN: { label: "Vejetaryen", cls: "bg-basil/10 text-basil border-basil/25" },
  VEGAN: { label: "Vegan", cls: "bg-basil/15 text-basil border-basil/30" },
  SPICY: { label: "Acı", cls: "bg-pink/10 text-pink border-pink/25", icon: Flame },
  NEW: { label: "Yeni", cls: "bg-yellow/15 text-gold border-yellow/30", icon: Sparkles },
  HALAL: { label: "Helal", cls: "bg-ink/5 text-ink border-ink/15" },
  GLUTEN_FREE: { label: "Glutensiz", cls: "bg-ink/5 text-ink border-ink/15" },
  CHEF_SPECIAL: { label: "Şefin Önerisi", cls: "bg-pink/10 text-pink border-pink/25", icon: Star },
};

const EXTRA_CAT_LABELS: Record<string, string> = {
  CHEESE: "Peynirler",
  MEAT: "Etler",
  VEGETABLE: "Sebzeler",
  SAUCE: "Soslar",
  CRUST: "Kenar",
};

export default function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const [slug, setSlug] = React.useState<string>("");

  React.useEffect(() => {
    params.then((p) => setSlug(p.slug));
  }, [params]);

  if (!slug) {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-pink" />
      </div>
    );
  }

  return <ProductDetailContent slug={slug} />;
}

function ProductDetailContent({ slug }: { slug: string }) {
  const { addItem, itemCount, openCart } = useCart();

  const [item, setItem] = React.useState<MenuItemDetail | null>(null);
  const [related, setRelated] = React.useState<RelatedItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [notFound, setNotFound] = React.useState(false);

  // Seçim state
  const [selectedSize, setSelectedSize] = React.useState(0);
  const [selectedCrust, setSelectedCrust] = React.useState(0);
  const [selectedExtras, setSelectedExtras] = React.useState<string[]>([]);
  const [removedIngredients, setRemovedIngredients] = React.useState<string[]>([]);
  const [quantity, setQuantity] = React.useState(1);

  React.useEffect(() => {
    if (!slug) return;
    fetch(`/api/menu/${slug}`, { cache: "no-store" })
      .then((r) => {
        if (!r.ok) throw new Error("not found");
        return r.json();
      })
      .then((data) => {
        setItem(data.item);
        setRelated(data.related || []);
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [slug]);

  // Hesaplamalar
  const basePrice = item?.sizes?.length ? item.sizes[selectedSize]?.priceCents ?? item.priceCents : item?.priceCents ?? 0;
  const crustPrice = item?.crustTypes?.length ? item.crustTypes[selectedCrust]?.priceCents ?? 0 : 0;
  const extrasPrice = React.useMemo(() => {
    if (!item?.extras) return 0;
    return item.extras
      .filter((e) => selectedExtras.includes(e.name))
      .reduce((sum, e) => sum + e.priceCents, 0);
  }, [item, selectedExtras]);
  const unitPrice = basePrice + crustPrice + extrasPrice;
  const totalPrice = unitPrice * quantity;

  const toggleExtra = (name: string) => {
    setSelectedExtras((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]
    );
  };

  const handleAddToCart = () => {
    if (!item) return;
    const sizeLabel = item.sizes?.length ? item.sizes[selectedSize]?.size : undefined;
    const crustLabel = item.crustTypes?.length ? item.crustTypes[selectedCrust]?.type : undefined;
    const extras = item.extras?.filter((e) => selectedExtras.includes(e.name)) || [];

    // Çıkarılan malzemeleri not olarak ekle
    const removedNote = removedIngredients.length > 0
      ? `Çıkarılan malzemeler: ${removedIngredients.join(", ")}`
      : undefined;
    const crustNote = crustLabel ? `Hamur: ${crustLabel}` : undefined;
    const notes = [crustNote, removedNote].filter(Boolean).join(" · ") || undefined;

    addItem({
      slug: item.slug,
      menuItemId: item.id,
      name: item.name,
      size: sizeLabel,
      unitPriceCents: unitPrice,
      extras: extras.map((e) => ({ name: e.name, priceCents: e.priceCents })),
      imageUrl: item.imageUrl,
      quantity,
      notes,
    });
    toast.success(`${item.name} sepete eklendi!`, {
      description: `${quantity} adet · ${CURRENCY.formatShort(totalPrice)}`,
      action: {
        label: "Sepete Git",
        onClick: () => openCart(),
      },
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-paper">
        <div className="container mx-auto px-4 md:px-6 py-8">
          <Skeleton className="h-8 w-32 mb-6" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Skeleton className="aspect-square rounded-2xl" />
            <div className="space-y-4">
              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (notFound || !item) {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 mx-auto rounded-full bg-ink/5 flex items-center justify-center mb-4">
            <AlertCircle className="h-10 w-10 text-ink/30" />
          </div>
          <h1 className="font-display text-2xl font-bold text-ink mb-2">Ürün Bulunamadı</h1>
          <p className="text-ink/60 mb-6">Aradığınız ürün mevcut değil veya kaldırılmış olabilir.</p>
          <Link href="/#menu">
            <Button className="bg-pink hover:bg-pink-hover text-white">
              Menüye Dön
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-paper">
      <div className="container mx-auto px-4 md:px-6 py-6 md:py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs md:text-sm text-ink/50 mb-6">
          <Link href="/" className="hover:text-pink">Anasayfa</Link>
          <ChevronRight className="h-3 w-3" />
          <Link href="/#menu" className="hover:text-pink">Menü</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-ink font-medium truncate">{item.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-12">
          {/* Image */}
          <div className="relative">
            <div className="sticky top-24 aspect-square rounded-3xl overflow-hidden bg-ink-2 shadow-premium-lg">
              {item.imageUrl ? (
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="h-full w-full object-cover"
                  fetchPriority="high"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center bg-mist/20">
                  <ShoppingBag className="h-16 w-16 text-ink/20" />
                </div>
              )}
            </div>
            {item.isFeatured && (
              <div className="absolute top-4 left-4">
                <Badge className="bg-yellow text-ink border-0 font-semibold shadow-premium">
                  <Star className="h-3 w-3 mr-1 fill-ink" />
                  İmza
                </Badge>
              </div>
            )}
          </div>

          {/* Details */}
          <div>
            {/* Tags */}
            {item.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-3">
                {item.tags.map((tag) => {
                  const meta = TAG_META[tag] || { label: tag, cls: "bg-ink/5 text-ink/70 border-ink/15" };
                  const Icon = meta.icon;
                  return (
                    <span
                      key={tag}
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${meta.cls}`}
                    >
                      {Icon && <Icon className="h-3 w-3 mr-1" />}
                      {meta.label}
                    </span>
                  );
                })}
              </div>
            )}

            {/* Title */}
            <h1 className="font-display text-3xl md:text-4xl font-bold text-ink leading-tight">
              {item.name}
            </h1>

            {/* Description */}
            <p className="mt-3 text-ink/70 text-base md:text-lg leading-relaxed">
              {item.description}
            </p>

            {/* Price */}
            <div className="mt-5 flex items-baseline gap-2">
              <span className="font-display text-4xl font-bold text-pink">
                {CURRENCY.formatShort(totalPrice)}
              </span>
              {quantity > 1 && (
                <span className="text-sm text-ink/50">
                  ({CURRENCY.formatShort(unitPrice)} / adet)
                </span>
              )}
            </div>

            {/* Ingredients — çıkartılabilir */}
            {item.ingredients.length > 0 && (
              <div className="mt-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-display font-bold text-ink text-sm">İçindekiler</h3>
                  <span className="text-[11px] text-ink/50">İstemediğini çıkar</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {item.ingredients.map((ing, i) => {
                    const removed = removedIngredients.includes(ing);
                    return (
                      <button
                        key={i}
                        onClick={() => {
                          setRemovedIngredients((prev) =>
                            prev.includes(ing)
                              ? prev.filter((x) => x !== ing)
                              : [...prev, ing]
                          );
                        }}
                        className={`text-xs px-2.5 py-1 rounded-full border transition-all flex items-center gap-1 ${
                          removed
                            ? "bg-ink/5 text-ink/40 line-through border-ink/10"
                            : "bg-pink/5 text-ink border-pink/20 hover:bg-pink/10"
                        }`}
                        aria-pressed={removed}
                      >
                        {removed && <X className="h-3 w-3" />}
                        {ing}
                      </button>
                    );
                  })}
                </div>
                {removedIngredients.length > 0 && (
                  <p className="text-[11px] text-pink mt-2 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {removedIngredients.length} malzeme çıkarıldı: {removedIngredients.join(", ")}
                  </p>
                )}
              </div>
            )}

            {/* Size selection */}
            {item.sizes.length > 0 && (
              <div className="mt-6">
                <h3 className="font-display font-bold text-ink text-sm mb-2">Boyut Seç</h3>
                <div className="grid grid-cols-3 gap-2">
                  {item.sizes.map((s, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedSize(i)}
                      className={`p-3 rounded-xl border text-center transition-all ${
                        i === selectedSize
                          ? "bg-pink text-white border-pink shadow-pink-glow"
                          : "bg-paper text-ink border-ink/15 hover:border-pink/40"
                      }`}
                    >
                      <div className="text-sm font-semibold">{s.size}</div>
                      <div className={`text-xs mt-0.5 ${i === selectedSize ? "text-white/80" : "text-ink/50"}`}>
                        {CURRENCY.formatShort(s.priceCents)}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Crust selection */}
            {item.crustTypes.length > 0 && (
              <div className="mt-5">
                <h3 className="font-display font-bold text-ink text-sm mb-2">Hamur Tipi</h3>
                <div className="flex flex-wrap gap-2">
                  {item.crustTypes.map((c, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedCrust(i)}
                      className={`px-4 py-2 rounded-xl border text-sm font-medium transition-all ${
                        i === selectedCrust
                          ? "bg-ink text-white border-ink"
                          : "bg-paper text-ink border-ink/15 hover:border-ink/40"
                      }`}
                    >
                      {c.type}
                      {c.priceCents > 0 && (
                        <span className={`ml-1.5 text-xs ${i === selectedCrust ? "text-white/70" : "text-ink/50"}`}>
                          +{CURRENCY.formatShort(c.priceCents)}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Extras */}
            {item.extras.length > 0 && (
              <div className="mt-5">
                <h3 className="font-display font-bold text-ink text-sm mb-2">Ekstra Malzemeler</h3>
                <div className="space-y-3 max-h-60 overflow-y-auto custom-scroll pr-1">
                  {Object.entries(
                    item.extras.reduce((acc, e) => {
                      if (!acc[e.category]) acc[e.category] = [];
                      acc[e.category].push(e);
                      return acc;
                    }, {} as Record<string, typeof item.extras>)
                  ).map(([cat, extras]) => (
                    <div key={cat}>
                      <div className="text-[11px] font-semibold text-ink/50 uppercase tracking-wide mb-1.5">
                        {EXTRA_CAT_LABELS[cat] || cat}
                      </div>
                      <div className="space-y-1.5">
                        {extras.map((e) => {
                          const selected = selectedExtras.includes(e.name);
                          return (
                            <button
                              key={e.name}
                              onClick={() => toggleExtra(e.name)}
                              className={`w-full flex items-center justify-between p-2.5 rounded-lg border transition-all ${
                                selected
                                  ? "bg-pink/5 border-pink"
                                  : "bg-paper border-ink/8 hover:border-ink/20"
                              }`}
                            >
                              <div className="flex items-center gap-2.5">
                                <div className={`w-5 h-5 rounded-md flex items-center justify-center border ${
                                  selected ? "bg-pink border-pink" : "border-ink/20"
                                }`}>
                                  {selected && <Check className="h-3 w-3 text-white" />}
                                </div>
                                <span className="text-sm text-ink">{e.name}</span>
                              </div>
                              <span className="text-xs font-medium text-ink/60">
                                +{CURRENCY.formatShort(e.priceCents)}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Allergens */}
            {item.allergens.length > 0 && (
              <div className="mt-5 p-3 rounded-lg bg-yellow/5 border border-yellow/20">
                <div className="flex items-center gap-2 text-xs text-ink/70">
                  <AlertCircle className="h-4 w-4 text-gold shrink-0" />
                  <span><strong>Alerjenler:</strong> {item.allergens.join(", ")}</span>
                </div>
              </div>
            )}

            {/* Quantity + Add to cart */}
            <div className="mt-6 flex items-center gap-3">
              <div className="flex items-center gap-1 bg-ink/5 rounded-xl p-1">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-paper transition-colors"
                  aria-label="Azalt"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="font-display font-bold text-lg w-10 text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => Math.min(20, q + 1))}
                  className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-paper transition-colors"
                  aria-label="Artır"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              <Button
                onClick={handleAddToCart}
                className="flex-1 bg-pink hover:bg-pink-hover text-white h-12 shadow-pink-glow btn-premium"
              >
                <ShoppingBag className="h-4 w-4 mr-2" />
                Sepete Ekle · {CURRENCY.formatShort(totalPrice)}
              </Button>
            </div>

            {/* Sepete Git — sepette ürün olduğunda görünür */}
            {itemCount > 0 && (
              <button
                onClick={openCart}
                className="mt-3 w-full bg-ink hover:bg-ink/90 text-white h-12 rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors"
              >
                <ShoppingBag className="h-4 w-4" />
                Sepete Git ({itemCount} ürün)
                <ChevronRight className="h-4 w-4" />
              </button>
            )}

            {/* Back link */}
            <Link href="/#menu" className="mt-6 inline-flex items-center gap-1.5 text-sm text-ink/60 hover:text-pink transition-colors">
              <ArrowLeft className="h-4 w-4" />
              Menüye dön
            </Link>
          </div>
        </div>

        {/* Related */}
        {related.length > 0 && (
          <div className="mt-16 md:mt-24">
            <h2 className="font-display text-2xl md:text-3xl font-bold text-ink mb-6">
              Benzer Ürünler
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5">
              {related.map((r) => (
                <Link
                  key={r.id}
                  href={`/menu/${r.slug}`}
                  className="group bg-paper rounded-2xl overflow-hidden border border-ink/8 card-premium"
                >
                  <div className="aspect-square overflow-hidden bg-mist/20">
                    {r.imageUrl && (
                      <img
                        src={r.imageUrl}
                        alt={r.name}
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                    )}
                  </div>
                  <div className="p-3">
                    <h3 className="font-display font-bold text-sm text-ink truncate">{r.name}</h3>
                    <div className="mt-1 flex items-center justify-between">
                      <span className="font-display font-bold text-pink">
                        {CURRENCY.formatShort(r.priceCents)}
                      </span>
                      {r.isFeatured && (
                        <Star className="h-3.5 w-3.5 fill-yellow text-yellow" />
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Sticky mobile sepet barı — Domino's tarzı */}
      <MobileStickyBar
        price={totalPrice}
        quantity={quantity}
        onAddToCart={handleAddToCart}
        itemCount={itemCount}
        onViewCart={openCart}
      />
    </div>
  );
}

// ============================================================
// Mobil sticky sepet barı — scroll'da görünür
// Sepette ürün varsa "Sepete Git" gösterir, yoksa "Sepete Ekle" gösterir
// ============================================================
function MobileStickyBar({
  price,
  quantity,
  onAddToCart,
  itemCount,
  onViewCart,
}: {
  price: number;
  quantity: number;
  onAddToCart: () => void;
  itemCount: number;
  onViewCart: () => void;
}) {
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    const onScroll = () => {
      // 300px scroll'dan sonra sticky bar göster
      setVisible(window.scrollY > 300);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!visible) return null;

  // Sepette ürün varsa "Sepete Git" göster, yoksa "Sepete Ekle"
  // Bu sayede çift "Sepete Ekle" butonu sorunu çözülür
  const showViewCart = itemCount > 0;

  return (
    <div className="md:hidden fixed bottom-16 inset-x-0 z-30 animate-in slide-in-from-bottom-4 duration-300">
      <div className="mx-3 mb-2 bg-ink rounded-2xl shadow-2xl p-3 flex items-center gap-3">
        <div className="flex items-center gap-1 bg-white/5 rounded-lg p-1 shrink-0">
          <span className="font-display font-bold text-lg text-white w-8 text-center">{quantity}</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[10px] text-white/50 uppercase tracking-wider">
            {showViewCart ? `Sepette ${itemCount} ürün` : "Toplam"}
          </div>
          <div className="font-display font-bold text-yellow text-lg leading-none">{CURRENCY.formatShort(price)}</div>
        </div>
        {showViewCart ? (
          <button
            onClick={onViewCart}
            className="bg-yellow hover:bg-yellow/90 text-ink font-semibold text-sm px-5 h-11 rounded-xl shadow-lg flex items-center gap-1.5 shrink-0"
          >
            <ShoppingBag className="h-4 w-4" />
            Sepete Git
          </button>
        ) : (
          <button
            onClick={onAddToCart}
            className="bg-pink hover:bg-pink-hover text-white font-semibold text-sm px-5 h-11 rounded-xl shadow-pink-glow flex items-center gap-1.5 shrink-0"
          >
            <ShoppingBag className="h-4 w-4" />
            Sepete Ekle
          </button>
        )}
      </div>
    </div>
  );
}
