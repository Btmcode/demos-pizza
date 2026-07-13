"use client";

import * as React from "react";
import { Plus, Pencil, Trash2, Search, RefreshCw, Star, StarOff, Eye, EyeOff, Loader2, X } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { CURRENCY } from "@/lib/constants";
import { toast } from "sonner";

interface MenuItem {
  id: string;
  slug: string;
  name: string;
  description: string;
  priceCents: number;
  category: string;
  imageUrl?: string | null;
  isAvailable: boolean;
  isFeatured: boolean;
  ingredients: string[];
  tags: string[];
  allergens: string[];
  sizes: { size: string; diameter?: number; priceCents: number }[];
  crustTypes?: { type: string; priceCents: number }[];
  extras?: { category: string; name: string; priceCents: number }[];
  sortOrder: number;
}

const CATEGORIES = [
  { value: "PIZZA", label: "Klasik Pizzalar" },
  { value: "SIGNATURE", label: "İmza Pizzalar" },
  { value: "SIDES", label: "Yan Lezzetler" },
  { value: "DRINKS", label: "İçecekler" },
  { value: "DESSERTS", label: "Tatlılar" },
];

const TAGS = ["VEGETARIAN", "VEGAN", "SPICY", "NEW", "HALAL", "GLUTEN_FREE", "CHEF_SPECIAL"];

export default function AdminMenuPage() {
  const [items, setItems] = React.useState<MenuItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [q, setQ] = React.useState("");
  const [catFilter, setCatFilter] = React.useState("ALL");
  const [editing, setEditing] = React.useState<MenuItem | null>(null);
  const [creating, setCreating] = React.useState(false);
  const [deleteTarget, setDeleteTarget] = React.useState<MenuItem | null>(null);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/menu", { cache: "no-store" });
      const data = await res.json();
      if (data.items) setItems(data.items);
    } catch {
      toast.error("Menü yüklenemedi");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  const filtered = items.filter((it) => {
    if (catFilter !== "ALL" && it.category !== catFilter) return false;
    if (q && !it.name.toLowerCase().includes(q.toLowerCase()) && !it.slug.includes(q.toLowerCase())) return false;
    return true;
  });

  const handleToggle = async (item: MenuItem, field: "isAvailable" | "isFeatured") => {
    // Optimistic update
    setItems((prev) =>
      prev.map((i) => (i.id === item.id ? { ...i, [field]: !i[field] } : i))
    );
    try {
      const res = await fetch(`/api/admin/menu/${item.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: !item[field] }),
      });
      if (!res.ok) throw new Error();
      toast.success(`${item.name}: ${field === "isAvailable" ? (!item.isAvailable ? "aktif" : "pasif") : (!item.isFeatured ? "öne çıkar" : "öne çıkar kaldır")}`);
    } catch {
      toast.error("Güncellenemedi");
      setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, [field]: item[field] } : i)));
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      const res = await fetch(`/api/admin/menu/${deleteTarget.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      const data = await res.json().catch(() => ({}));
      toast.success(data.archived ? "Ürün arşivlendi (geçmiş siparişlerde var)" : "Ürün silindi");
      setItems((prev) => prev.filter((i) => i.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch {
      toast.error("Silinemedi");
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold text-ink">Ürün Yönetimi</h1>
          <p className="text-sm text-ink/60 mt-1">{items.length} toplam ürün</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink/40" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Ara..." className="pl-9 w-48" />
          </div>
          <Select value={catFilter} onValueChange={setCatFilter}>
            <SelectTrigger className="w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Tüm kategoriler</SelectItem>
              {CATEGORIES.map((c) => (
                <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" onClick={load} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
          <Button onClick={() => setCreating(true)} className="bg-pink hover:bg-pink/90 text-white">
            <Plus className="h-4 w-4 mr-1.5" />
            Yeni Ürün
          </Button>
        </div>
      </div>

      {/* Table */}
      <Card className="border-ink/8 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-ink/5 text-ink/70">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Ürün</th>
                <th className="text-left px-4 py-3 font-medium hidden md:table-cell">Kategori</th>
                <th className="text-left px-4 py-3 font-medium">Fiyat</th>
                <th className="text-center px-4 py-3 font-medium hidden sm:table-cell">Durum</th>
                <th className="text-right px-4 py-3 font-medium">İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={5} className="px-4 py-3"><Skeleton className="h-12 w-full" /></td>
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-ink/50">
                    Ürün bulunamadı
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr key={item.id} className="border-t border-ink/8 hover:bg-paper/50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-ink/5 shrink-0">
                          {item.imageUrl ? (
                            <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                          ) : null}
                        </div>
                        <div className="min-w-0">
                          <div className="font-medium text-ink truncate">{item.name}</div>
                          <div className="text-xs text-ink/50 truncate max-w-xs">{item.description}</div>
                          <div className="text-[10px] text-ink/40 font-mono">/{item.slug}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <Badge variant="outline" className="text-xs">
                        {CATEGORIES.find((c) => c.value === item.category)?.label || item.category}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-display font-bold text-ink">
                        {CURRENCY.formatShort(item.priceCents)}
                      </div>
                      {item.sizes.length > 1 && (
                        <div className="text-[10px] text-ink/50">
                          {item.sizes.length} boyut
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => handleToggle(item, "isAvailable")}
                          className={`p-1.5 rounded-md transition-colors ${item.isAvailable ? "text-basil hover:bg-basil/10" : "text-ink/30 hover:bg-ink/5"}`}
                          title={item.isAvailable ? "Aktif (kapat)" : "Pasif (aç)"}
                        >
                          {item.isAvailable ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                        </button>
                        <button
                          onClick={() => handleToggle(item, "isFeatured")}
                          className={`p-1.5 rounded-md transition-colors ${item.isFeatured ? "text-yellow hover:bg-yellow/10" : "text-ink/30 hover:bg-ink/5"}`}
                          title={item.isFeatured ? "Öne çıkarıldı (kaldır)" : "Öne çıkar"}
                        >
                          {item.isFeatured ? <Star className="h-4 w-4 fill-saffron" /> : <StarOff className="h-4 w-4" />}
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Button size="icon" variant="ghost" onClick={() => setEditing(item)} aria-label="Düzenle">
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="ghost" className="text-pink" onClick={() => setDeleteTarget(item)} aria-label="Sil">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Edit / Create dialog */}
      {(editing || creating) && (
        <MenuItemForm
          item={editing}
          onClose={() => {
            setEditing(null);
            setCreating(false);
          }}
          onSaved={() => {
            setEditing(null);
            setCreating(false);
            load();
          }}
        />
      )}

      {/* Delete confirm */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Ürünü sil</AlertDialogTitle>
            <AlertDialogDescription>
              <strong>{deleteTarget?.name}</strong> ürününü silmek istediğinize emin misiniz?
              Bu işlem geri alınamaz. Eğer bu ürüne ait geçmiş siparişler varsa, ürün silinmek yerine
              pasife alınacaktır.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>İptal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-pink hover:bg-pink/90 text-white"
            >
              Sil
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function MenuItemForm({
  item,
  onClose,
  onSaved,
}: {
  item: MenuItem | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = React.useState({
    name: item?.name || "",
    slug: item?.slug || "",
    description: item?.description || "",
    priceCents: item ? Math.round(item.priceCents / 100) : 0,
    category: item?.category || "PIZZA",
    imageUrl: item?.imageUrl || "",
    isAvailable: item?.isAvailable ?? true,
    isFeatured: item?.isFeatured ?? false,
    ingredients: (item?.ingredients || []).join(", "),
    tags: item?.tags || [],
    allergens: (item?.allergens || []).join(", "),
    sortOrder: item?.sortOrder ?? 0,
  });
  const [sizes, setSizes] = React.useState(item?.sizes || []);
  const [crustTypes, setCrustTypes] = React.useState<any[]>(item?.crustTypes || []);
  const [extras, setExtras] = React.useState<any[]>(item?.extras || []);
  const [saving, setSaving] = React.useState(false);

  // Auto-slug
  React.useEffect(() => {
    if (!item && form.name && !form.slug) {
      const slug = form.name
        .toLowerCase()
        .replace(/İ/g, "i")
        .replace(/Ş/g, "s")
        .replace(/Ğ/g, "g")
        .replace(/Ü/g, "u")
        .replace(/Ö/g, "o")
        .replace(/Ç/g, "c")
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");
      setForm((f) => ({ ...f, slug }));
    }
  }, [form.name, form.slug, item]);

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.slug.trim() || !form.description.trim()) {
      toast.error("İsim, slug ve açıklama gerekli");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        slug: form.slug.trim(),
        description: form.description.trim(),
        priceCents: Math.round(form.priceCents * 100),
        category: form.category,
        imageUrl: form.imageUrl.trim(),
        isAvailable: form.isAvailable,
        isFeatured: form.isFeatured,
        ingredients: form.ingredients.split(",").map((s) => s.trim()).filter(Boolean),
        tags: form.tags,
        allergens: form.allergens.split(",").map((s) => s.trim()).filter(Boolean),
        sizes: sizes.map((s) => ({
          size: s.size,
          diameter: s.diameter,
          priceCents: Math.round(s.priceCents),
        })),
        crustTypes: crustTypes.map((c) => ({
          type: c.type,
          priceCents: Math.round(c.priceCents),
        })),
        extras: extras.map((e) => ({
          category: e.category,
          name: e.name,
          priceCents: Math.round(e.priceCents),
        })),
        sortOrder: Number(form.sortOrder) || 0,
      };
      const url = item ? `/api/admin/menu/${item.id}` : "/api/admin/menu";
      const res = await fetch(url, {
        method: item ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        toast.error(d.error || "Kaydedilemedi");
        return;
      }
      toast.success(item ? "Ürün güncellendi" : "Ürün oluşturuldu");
      onSaved();
    } catch {
      toast.error("Bağlantı hatası");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto custom-scroll">
        <DialogHeader>
          <DialogTitle>{item ? "Ürünü Düzenle" : "Yeni Ürün"}</DialogTitle>
          <DialogDescription>
            {item ? `${item.name} ürününü güncelleyin` : "Menüye yeni ürün ekleyin"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="m-name" className="text-xs">İsim *</Label>
              <Input id="m-name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} maxLength={80} className="mt-1" />
            </div>
            <div>
              <Label htmlFor="m-slug" className="text-xs">Slug *</Label>
              <Input id="m-slug" value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value.toLowerCase() }))} maxLength={120} className="mt-1 font-mono text-xs" />
            </div>
          </div>

          <div>
            <Label htmlFor="m-desc" className="text-xs">Açıklama *</Label>
            <Textarea id="m-desc" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} rows={3} maxLength={500} className="mt-1" />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="m-price" className="text-xs">Fiyat (₺)</Label>
              <Input id="m-price" type="number" value={form.priceCents} onChange={(e) => setForm((f) => ({ ...f, priceCents: Number(e.target.value) }))} min={0} className="mt-1" />
            </div>
            <div>
              <Label className="text-xs">Kategori</Label>
              <Select value={form.category} onValueChange={(v) => setForm((f) => ({ ...f, category: v }))}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="m-sort" className="text-xs">Sıra</Label>
              <Input id="m-sort" type="number" value={form.sortOrder} onChange={(e) => setForm((f) => ({ ...f, sortOrder: Number(e.target.value) }))} min={0} className="mt-1" />
            </div>
          </div>

          <div>
            <Label htmlFor="m-img" className="text-xs">Görsel URL</Label>
            <Input id="m-img" value={form.imageUrl} onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value }))} placeholder="/images/pizza-xxx.png" className="mt-1" />
            {form.imageUrl && (
              <div className="mt-2 w-24 h-24 rounded-lg overflow-hidden bg-ink/5">
                <img src={form.imageUrl} alt="preview" className="w-full h-full object-cover" />
              </div>
            )}
          </div>

          <div>
            <Label htmlFor="m-ing" className="text-xs">Malzemeler (virgülle ayır)</Label>
            <Input id="m-ing" value={form.ingredients} onChange={(e) => setForm((f) => ({ ...f, ingredients: e.target.value }))} placeholder="San Marzano, Mozzarella, Basilikum" className="mt-1" />
          </div>

          <div>
            <Label htmlFor="m-allergens" className="text-xs">Alerjenler (virgülle ayır)</Label>
            <Input id="m-allergens" value={form.allergens} onChange={(e) => setForm((f) => ({ ...f, allergens: e.target.value }))} placeholder="Gluten, Süt, Yumurta" className="mt-1" />
          </div>

          {/* Tags */}
          <div>
            <Label className="text-xs">Etiketler</Label>
            <div className="flex flex-wrap gap-2 mt-1.5">
              {TAGS.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() =>
                    setForm((f) => ({
                      ...f,
                      tags: f.tags.includes(t) ? f.tags.filter((x) => x !== t) : [...f.tags, t],
                    }))
                  }
                  className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                    form.tags.includes(t)
                      ? "bg-pink text-white border-pink"
                      : "bg-paper text-ink/70 border-ink/15 hover:border-pink/40"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Sizes (pizza) */}
          {(form.category === "PIZZA" || form.category === "SIGNATURE") && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label className="text-xs">Boyutlar (kuruş olarak)</Label>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => setSizes((s) => [...s, { size: "", diameter: 0, priceCents: 0 }])}
                >
                  <Plus className="h-3 w-3 mr-1" /> Boyut ekle
                </Button>
              </div>
              <div className="space-y-2">
                {sizes.map((s, i) => (
                  <div key={i} className="flex gap-2 items-center">
                    <Input
                      value={s.size}
                      onChange={(e) => setSizes((p) => p.map((x, idx) => idx === i ? { ...x, size: e.target.value } : x))}
                      placeholder="Boyut adı"
                      className="flex-1"
                    />
                    <Input
                      type="number"
                      value={s.diameter || 0}
                      onChange={(e) => setSizes((p) => p.map((x, idx) => idx === i ? { ...x, diameter: Number(e.target.value) } : x))}
                      placeholder="Çap (cm)"
                      className="w-24"
                    />
                    <Input
                      type="number"
                      value={s.priceCents / 100}
                      onChange={(e) => setSizes((p) => p.map((x, idx) => idx === i ? { ...x, priceCents: Math.round(Number(e.target.value) * 100) } : x))}
                      placeholder="Fiyat ₺"
                      className="w-24"
                    />
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      className="text-pink"
                      onClick={() => setSizes((p) => p.filter((_, idx) => idx !== i))}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Crust Types (pizza) */}
          {(form.category === "PIZZA" || form.category === "SIGNATURE") && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label className="text-xs">Hamur Tipleri (kuruş olarak)</Label>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => setCrustTypes((c) => [...c, { type: "", priceCents: 0 }])}
                >
                  <Plus className="h-3 w-3 mr-1" /> Hamur tipi ekle
                </Button>
              </div>
              <div className="space-y-2">
                {crustTypes.map((c, i) => (
                  <div key={i} className="flex gap-2 items-center">
                    <Input
                      value={c.type}
                      onChange={(e) => setCrustTypes((p) => p.map((x, idx) => idx === i ? { ...x, type: e.target.value } : x))}
                      placeholder="Örn: İnce Hamur"
                      className="flex-1"
                    />
                    <Input
                      type="number"
                      value={c.priceCents / 100}
                      onChange={(e) => setCrustTypes((p) => p.map((x, idx) => idx === i ? { ...x, priceCents: Math.round(Number(e.target.value) * 100) } : x))}
                      placeholder="Fiyat ₺"
                      className="w-28"
                    />
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      className="text-pink"
                      onClick={() => setCrustTypes((p) => p.filter((_, idx) => idx !== i))}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Extras (pizza) */}
          {(form.category === "PIZZA" || form.category === "SIGNATURE") && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label className="text-xs">Ekstra Malzemeler (kuruş olarak)</Label>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => setExtras((e) => [...e, { category: "CHEESE", name: "", priceCents: 0 }])}
                >
                  <Plus className="h-3 w-3 mr-1" /> Ekstra ekle
                </Button>
              </div>
              <div className="space-y-2 max-h-60 overflow-y-auto custom-scroll pr-1">
                {extras.map((e, i) => (
                  <div key={i} className="flex gap-2 items-center">
                    <select
                      value={e.category}
                      onChange={(ev) => setExtras((p) => p.map((x, idx) => idx === i ? { ...x, category: ev.target.value } : x))}
                      className="border rounded px-2 py-2 text-xs w-32"
                    >
                      <option value="CHEESE">Peynir</option>
                      <option value="MEAT">Et</option>
                      <option value="VEGETABLE">Sebze</option>
                      <option value="SAUCE">Sos</option>
                      <option value="CRUST">Kenar</option>
                    </select>
                    <Input
                      value={e.name}
                      onChange={(ev) => setExtras((p) => p.map((x, idx) => idx === i ? { ...x, name: ev.target.value } : x))}
                      placeholder="Örn: Ekstra Mozarella"
                      className="flex-1"
                    />
                    <Input
                      type="number"
                      value={e.priceCents / 100}
                      onChange={(ev) => setExtras((p) => p.map((x, idx) => idx === i ? { ...x, priceCents: Math.round(Number(ev.target.value) * 100) } : x))}
                      placeholder="Fiyat ₺"
                      className="w-28"
                    />
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      className="text-pink"
                      onClick={() => setExtras((p) => p.filter((_, idx) => idx !== i))}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Toggles */}
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.isAvailable}
                onChange={(e) => setForm((f) => ({ ...f, isAvailable: e.target.checked }))}
                className="w-4 h-4 rounded"
              />
              <span className="text-sm">Aktif (satışta)</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.isFeatured}
                onChange={(e) => setForm((f) => ({ ...f, isFeatured: e.target.checked }))}
                className="w-4 h-4 rounded"
              />
              <span className="text-sm">Öne çıkar</span>
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-ink/10">
            <Button variant="outline" onClick={onClose}>İptal</Button>
            <Button onClick={handleSubmit} disabled={saving} className="bg-pink hover:bg-pink/90 text-white">
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Kaydediliyor...
                </>
              ) : item ? "Güncelle" : "Oluştur"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
