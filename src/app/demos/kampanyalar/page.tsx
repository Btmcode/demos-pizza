"use client";

import * as React from "react";
import { Plus, Pencil, Trash2, Tag, Flame, Loader2, X } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

interface Campaign {
  id: string;
  title: string;
  description: string;
  code: string | null;
  discountPct: number | null;
  discountCents: number | null;
  imageUrl: string | null;
  isActive: boolean;
  startsAt: string | null;
  endsAt: string | null;
  sortOrder: number;
}

export default function AdminCampaignsPage() {
  const [campaigns, setCampaigns] = React.useState<Campaign[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [editing, setEditing] = React.useState<Campaign | null>(null);
  const [creating, setCreating] = React.useState(false);
  const [deleteTarget, setDeleteTarget] = React.useState<Campaign | null>(null);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/campaigns", { cache: "no-store" });
      const data = await res.json();
      if (data.campaigns) setCampaigns(data.campaigns);
    } catch { toast.error("Kampanyalar yüklenemedi"); }
    finally { setLoading(false); }
  }, []);

  React.useEffect(() => { load(); }, [load]);

  const handleToggle = async (c: Campaign) => {
    setCampaigns((prev) => prev.map((x) => x.id === c.id ? { ...x, isActive: !c.isActive } : x));
    try {
      await fetch(`/api/admin/campaigns/${c.id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !c.isActive }),
      });
      toast.success(`${c.title}: ${!c.isActive ? "Aktif" : "Pasif"}`);
    } catch { toast.error("Güncellenemedi"); load(); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await fetch(`/api/admin/campaigns/${deleteTarget.id}`, { method: "DELETE" });
      toast.success("Kampanya silindi");
      setCampaigns((prev) => prev.filter((x) => x.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch { toast.error("Silinemedi"); }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold text-ink">Kampanyalar</h1>
          <p className="text-sm text-ink/60 mt-1">{campaigns.length} kampanya</p>
        </div>
        <Button onClick={() => setCreating(true)} className="bg-pink hover:bg-pink-hover text-white">
          <Plus className="h-4 w-4 mr-1.5" /> Yeni Kampanya
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-48 rounded-2xl" />)}
        </div>
      ) : campaigns.length === 0 ? (
        <Card className="p-12 text-center border-ink/8">
          <Tag className="h-12 w-12 mx-auto text-ink/20 mb-3" />
          <p className="text-ink/60">Henüz kampanya yok</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {campaigns.map((c) => (
            <Card key={c.id} className="p-5 border-ink/8 shadow-sm card-premium">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-lg bg-pink/10 text-pink flex items-center justify-center">
                    <Tag className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-ink text-base">{c.title}</h3>
                    {c.discountPct && <span className="text-xs text-pink font-bold">%{c.discountPct} indirim</span>}
                  </div>
                </div>
                <Badge variant="outline" className={c.isActive ? "text-basil border-basil/30" : "text-ink/40 border-ink/15"}>
                  {c.isActive ? "Aktif" : "Pasif"}
                </Badge>
              </div>
              <p className="text-xs text-ink/65 line-clamp-2 mb-3">{c.description}</p>
              {c.code && (
                <code className="inline-block px-2 py-1 rounded bg-yellow/10 text-yellow text-xs font-mono border border-yellow/20 mb-3">
                  {c.code}
                </code>
              )}
              <div className="flex items-center gap-1">
                <Button size="sm" variant="outline" onClick={() => handleToggle(c)}>Aktif/Pasif</Button>
                <Button size="sm" variant="ghost" onClick={() => setEditing(c)}><Pencil className="h-4 w-4" /></Button>
                <Button size="sm" variant="ghost" className="text-pink" onClick={() => setDeleteTarget(c)}><Trash2 className="h-4 w-4" /></Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {(editing || creating) && (
        <CampaignForm campaign={editing} onClose={() => { setEditing(null); setCreating(false); }} onSaved={() => { setEditing(null); setCreating(false); load(); }} />
      )}

      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Kampanyayı sil</AlertDialogTitle>
            <AlertDialogDescription>
              <strong>{deleteTarget?.title}</strong> kampanyasını silmek istediğinize emin misiniz?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>İptal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-pink hover:bg-pink-hover text-white">Sil</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function CampaignForm({ campaign, onClose, onSaved }: { campaign: Campaign | null; onClose: () => void; onSaved: () => void; }) {
  const [form, setForm] = React.useState({
    title: campaign?.title || "",
    description: campaign?.description || "",
    code: campaign?.code || "",
    discountPct: campaign?.discountPct ?? "",
    discountCents: campaign?.discountCents ? campaign.discountCents / 100 : "",
    imageUrl: campaign?.imageUrl || "",
    isActive: campaign?.isActive ?? true,
    startsAt: campaign?.startsAt ? new Date(campaign.startsAt).toISOString().slice(0, 10) : "",
    endsAt: campaign?.endsAt ? new Date(campaign.endsAt).toISOString().slice(0, 10) : "",
    sortOrder: campaign?.sortOrder ?? 0,
  });
  const [saving, setSaving] = React.useState(false);

  const handleSubmit = async () => {
    if (!form.title.trim() || !form.description.trim()) { toast.error("Başlık ve açıklama gerekli"); return; }
    setSaving(true);
    try {
      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        code: form.code.trim() || null,
        discountPct: form.discountPct === "" ? null : Number(form.discountPct),
        discountCents: form.discountCents === "" ? null : Math.round(Number(form.discountCents) * 100),
        imageUrl: form.imageUrl.trim() || null,
        isActive: form.isActive,
        startsAt: form.startsAt || null,
        endsAt: form.endsAt || null,
        sortOrder: Number(form.sortOrder) || 0,
      };
      const url = campaign ? `/api/admin/campaigns/${campaign.id}` : "/api/admin/campaigns";
      const res = await fetch(url, {
        method: campaign ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) { const d = await res.json().catch(() => ({})); toast.error(d.error || "Kaydedilemedi"); return; }
      toast.success(campaign ? "Kampanya güncellendi" : "Kampanya oluşturuldu");
      onSaved();
    } catch { toast.error("Bağlantı hatası"); }
    finally { setSaving(false); }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto custom-scroll">
        <DialogHeader>
          <DialogTitle>{campaign ? "Kampanyayı Düzenle" : "Yeni Kampanya"}</DialogTitle>
          <DialogDescription>{campaign ? campaign.title : "Yeni kampanya oluştur"}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label className="text-xs">Başlık *</Label>
            <Input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} maxLength={100} className="mt-1" />
          </div>
          <div>
            <Label className="text-xs">Açıklama *</Label>
            <Textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} rows={3} maxLength={500} className="mt-1" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">İndirim (%)</Label>
              <Input type="number" value={form.discountPct} onChange={(e) => setForm((f) => ({ ...f, discountPct: e.target.value }))} placeholder="15" min={0} max={100} className="mt-1" />
            </div>
            <div>
              <Label className="text-xs">İndirim (₺)</Label>
              <Input type="number" value={form.discountCents} onChange={(e) => setForm((f) => ({ ...f, discountCents: e.target.value }))} placeholder="50" min={0} className="mt-1" />
            </div>
          </div>
          <div>
            <Label className="text-xs">Kampanya Kodu</Label>
            <Input value={form.code} onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))} placeholder="DEMOS15" maxLength={30} className="mt-1 font-mono" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Başlangıç</Label>
              <Input type="date" value={form.startsAt} onChange={(e) => setForm((f) => ({ ...f, startsAt: e.target.value }))} className="mt-1" />
            </div>
            <div>
              <Label className="text-xs">Bitiş</Label>
              <Input type="date" value={form.endsAt} onChange={(e) => setForm((f) => ({ ...f, endsAt: e.target.value }))} className="mt-1" />
            </div>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.isActive} onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))} className="w-4 h-4 rounded" />
            <span className="text-sm">Aktif</span>
          </label>
          <div className="flex justify-end gap-2 pt-4 border-t border-ink/10">
            <Button variant="outline" onClick={onClose}>İptal</Button>
            <Button onClick={handleSubmit} disabled={saving} className="bg-pink hover:bg-pink-hover text-white">
              {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              {campaign ? "Güncelle" : "Oluştur"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
