"use client";

import * as React from "react";
import { MessageSquare, RefreshCw, Mail, Phone, Trash2, Reply, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

interface Message {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string;
  message: string;
  isRead: boolean;
  isReplied: boolean;
  createdAt: string;
}

export default function AdminMessagesPage() {
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [filter, setFilter] = React.useState<"all" | "unread">("unread");

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const url = filter === "unread" ? "/api/demos/messages?unread=true&limit=100" : "/api/demos/messages?limit=100";
      const res = await fetch(url, { cache: "no-store" });
      const data = await res.json();
      if (data.messages) setMessages(data.messages);
    } catch {
      toast.error("Mesajlar yüklenemedi");
    } finally {
      setLoading(false);
    }
  }, [filter]);

  React.useEffect(() => {
    load();
  }, [load]);

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/demos/messages/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success("Mesaj silindi");
      setMessages((prev) => prev.filter((m) => m.id !== id));
    } catch {
      toast.error("Silinemedi");
    }
  };

  const markReplied = async (id: string) => {
    try {
      const res = await fetch(`/api/demos/messages/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isReplied: true }),
      });
      if (!res.ok) throw new Error();
      toast.success("Yanıtlandı olarak işaretlendi");
      setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, isReplied: true } : m)));
    } catch {
      toast.error("Güncellenemedi");
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold text-charcoal">Mesajlar</h1>
          <p className="text-sm text-charcoal/60 mt-1">{messages.length} mesaj</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex bg-charcoal/5 rounded-lg p-1">
            <button
              onClick={() => setFilter("unread")}
              className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${filter === "unread" ? "bg-ember text-cream" : "text-charcoal/70"}`}
            >
              Okunmamış
            </button>
            <button
              onClick={() => setFilter("all")}
              className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${filter === "all" ? "bg-ember text-cream" : "text-charcoal/70"}`}
            >
              Tümü
            </button>
          </div>
          <Button variant="outline" size="icon" onClick={load} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full rounded-xl" />
          ))}
        </div>
      ) : messages.length === 0 ? (
        <Card className="p-12 text-center border-charcoal/8">
          <MessageSquare className="h-12 w-12 mx-auto text-charcoal/20 mb-3" />
          <p className="text-charcoal/60">Mesaj yok</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {messages.map((m) => (
            <Card key={m.id} className={`p-4 md:p-5 border-charcoal/8 shadow-sm ${!m.isRead ? "border-l-4 border-l-ember" : ""}`}>
              <div className="flex items-start justify-between gap-3 mb-2">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-charcoal">{m.subject}</h3>
                    {!m.isRead && <Badge className="bg-ember text-cream text-[10px]">YENİ</Badge>}
                    {m.isReplied && <Badge variant="outline" className="text-basil border-basil/30 text-[10px]">YANITLANDI</Badge>}
                  </div>
                  <div className="text-xs text-charcoal/60 mt-1">
                    {m.name} · {new Date(m.createdAt).toLocaleString("tr-TR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </div>
                </div>
              </div>

              <p className="text-sm text-charcoal/80 bg-charcoal/5 rounded-lg p-3 my-3 whitespace-pre-wrap">
                {m.message}
              </p>

              <div className="flex flex-wrap items-center gap-2">
                <a href={`mailto:${m.email}`}>
                  <Button size="sm" variant="outline">
                    <Mail className="h-3.5 w-3.5 mr-1.5" />
                    {m.email}
                  </Button>
                </a>
                {m.phone && (
                  <a href={`tel:${m.phone}`}>
                    <Button size="sm" variant="outline">
                      <Phone className="h-3.5 w-3.5 mr-1.5" />
                      {m.phone}
                    </Button>
                  </a>
                )}
                <a href={`mailto:${m.email}?subject=RE: ${encodeURIComponent(m.subject)}`}>
                  <Button size="sm" className="bg-ember hover:bg-ember/90 text-cream ml-auto">
                    <Reply className="h-3.5 w-3.5 mr-1.5" />
                    Yanıtla
                  </Button>
                </a>
                {!m.isReplied && (
                  <Button size="sm" variant="ghost" onClick={() => markReplied(m.id)}>
                    Yantlandı işaretle
                  </Button>
                )}
                <Button size="icon" variant="ghost" className="text-ember" onClick={() => handleDelete(m.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
