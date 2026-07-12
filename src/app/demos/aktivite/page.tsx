"use client";

import * as React from "react";
import { Activity, RefreshCw, LogIn, LogOut, Edit, Trash2, Plus, User } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

interface Log {
  id: string;
  adminId: string | null;
  adminEmail: string | null;
  action: string;
  entityType: string;
  entityId: string | null;
  details: string | null;
  ipAddress: string | null;
  createdAt: string;
}

const ACTION_ICON: Record<string, any> = {
  LOGIN: LogIn,
  LOGOUT: LogOut,
  CREATE: Plus,
  UPDATE: Edit,
  DELETE: Trash2,
  ARCHIVE: Edit,
};

const ACTION_COLOR: Record<string, string> = {
  LOGIN: "text-basil",
  LOGOUT: "text-charcoal/60",
  CREATE: "text-basil",
  UPDATE: "text-saffron",
  DELETE: "text-ember",
  ARCHIVE: "text-saffron",
};

export default function AdminActivityPage() {
  const [logs, setLogs] = React.useState<Log[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [page, setPage] = React.useState(1);
  const [total, setTotal] = React.useState(0);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/demos/activity?page=${page}&limit=50`, { cache: "no-store" });
      const data = await res.json();
      if (data.logs) setLogs(data.logs);
      if (data.pagination) setTotal(data.pagination.total);
    } catch {
      toast.error("Aktivite kayıtları yüklenemedi");
    } finally {
      setLoading(false);
    }
  }, [page]);

  React.useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="space-y-5">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-charcoal">Aktivite Kaydı</h1>
          <p className="text-sm text-charcoal/60 mt-1">{total} toplam kayıt · Sayfa {page}</p>
        </div>
        <Button variant="outline" size="icon" onClick={load} disabled={loading}>
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        </Button>
      </div>

      <Card className="border-charcoal/8 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-4 space-y-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full" />
            ))}
          </div>
        ) : logs.length === 0 ? (
          <div className="p-12 text-center text-charcoal/50">
            <Activity className="h-12 w-12 mx-auto mb-3 text-charcoal/20" />
            Kayıt yok
          </div>
        ) : (
          <div className="divide-y divide-charcoal/5">
            {logs.map((log) => {
              const Icon = ACTION_ICON[log.action] || Activity;
              return (
                <div key={log.id} className="p-4 flex items-start gap-3 hover:bg-cream/50 transition-colors">
                  <div className={`w-9 h-9 rounded-full bg-charcoal/5 flex items-center justify-center shrink-0 ${ACTION_COLOR[log.action] || "text-charcoal/60"}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="outline" className="text-[10px] font-mono">
                        {log.action}
                      </Badge>
                      <span className="text-sm font-medium text-charcoal">{log.entityType}</span>
                      {log.adminEmail && (
                        <span className="text-xs text-charcoal/60 flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {log.adminEmail}
                        </span>
                      )}
                    </div>
                    {log.details && (
                      <p className="text-xs text-charcoal/70 mt-1">{log.details}</p>
                    )}
                    <div className="text-[10px] text-charcoal/40 mt-1 font-mono">
                      {new Date(log.createdAt).toLocaleString("tr-TR", { dateStyle: "short", timeStyle: "medium" })}
                      {log.ipAddress && ` · IP: ${log.ipAddress}`}
                      {log.entityId && ` · ID: ${log.entityId.slice(0, 8)}`}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {total > 50 && (
        <div className="flex items-center justify-center gap-2">
          <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
            Önceki
          </Button>
          <span className="text-sm text-charcoal/60">
            {page} / {Math.ceil(total / 50)}
          </span>
          <Button variant="outline" size="sm" disabled={page >= Math.ceil(total / 50)} onClick={() => setPage((p) => p + 1)}>
            Sonraki
          </Button>
        </div>
      )}
    </div>
  );
}
