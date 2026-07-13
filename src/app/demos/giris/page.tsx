"use client";

import * as React from "react";
import { signIn, getSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, Lock, Mail, Flame, ArrowRight, AlertCircle, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [form, setForm] = React.useState({ email: "", password: "" });
  const [showPwd, setShowPwd] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    getSession().then((s) => {
      if (s) router.replace("/demos");
    });
  }, [router]);

  const callbackUrl = searchParams.get("callbackUrl") || "/demos";
  const urlError = searchParams.get("error");

  React.useEffect(() => {
    if (urlError === "CredentialsSignin") {
      setError("E-posta veya şifre hatalı");
    } else if (urlError === "AccessDenied") {
      setError("Bu alana erişim yetkiniz yok");
    }
  }, [urlError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!form.email.trim() || !form.password) {
      setError("E-posta ve şifre gerekli");
      return;
    }
    setLoading(true);
    try {
      const res = await signIn("admin-credentials", {
        redirect: false,
        email: form.email,
        password: form.password,
        callbackUrl,
      });
      if (res?.error) {
        setError("E-posta veya şifre hatalı");
        setLoading(false);
        return;
      }
      if (res?.url) {
        toast.success("Giriş başarılı! Yönlendiriliyorsunuz...");
        router.replace(res.url);
        router.refresh();
      }
    } catch {
      setError("Bağlantı hatası. Tekrar deneyin.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-ink p-4">
      {/* Form card */}
      <div className="relative w-full max-w-md">
        <div className="bg-paper rounded-2xl shadow-xl p-7 md:p-9 border border-smoke">
          {/* Logo */}
          <div className="text-center mb-7">
            <div className="bg-ink rounded-2xl px-4 py-3 inline-block mb-3 shadow-premium">
              <img
                src="/logo.webp"
                alt="Demos Pizza"
                className="h-[50px] md:h-[59px] w-auto"
              />
            </div>
            <div className="flex items-center justify-center gap-1.5 text-xs text-ink/60 font-mono uppercase tracking-widest">
              <Flame className="h-3 w-3 text-pink" />
              Yönetim Paneli
            </div>
          </div>

          <h1 className="font-display text-xl md:text-2xl font-bold text-ink text-center mb-1">
            Hoş geldiniz
          </h1>
          <p className="text-center text-xs text-ink/60 mb-6">
            Devam etmek için yönetici bilgilerinizle giriş yapın
          </p>

          {error && (
            <div className="mb-4 p-2.5 rounded-lg bg-pink/10 border border-pink/30 text-pink text-xs flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <Label htmlFor="email" className="text-xs font-medium">
                E-posta
              </Label>
              <div className="relative mt-1.5">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink/40" />
                <Input
                  id="email"
                  type="email"
                  autoComplete="username"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  placeholder="admin@demospizza.com"
                  className="pl-9"
                  required
                  maxLength={254}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="password" className="text-xs font-medium">
                Şifre
              </Label>
              <div className="relative mt-1.5">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink/40" />
                <Input
                  id="password"
                  type={showPwd ? "text" : "password"}
                  autoComplete="current-password"
                  value={form.password}
                  onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                  placeholder="••••••••"
                  className="pl-9 pr-10"
                  required
                  maxLength={128}
                />
                <button
                  type="button"
                  onClick={() => setShowPwd((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ink/40 hover:text-ink"
                  aria-label={showPwd ? "Şifreyi gizle" : "Şifreyi göster"}
                >
                  {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-pink hover:bg-pink/90 text-white h-11 text-sm font-semibold mt-2"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Giriş yapılıyor...
                </>
              ) : (
                <>
                  Giriş Yap
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          <div className="mt-5 p-2.5 rounded-lg bg-ink/5 text-[11px] text-ink/60 leading-relaxed">
            <strong className="text-ink/80">Güvenlik:</strong> Tüm giriş denemeleri
            kaydedilir. Yetkisiz erişim girişimi yasal işlem doğurur. Bu alan sadece
            yetkili personel içindir.
          </div>

          <div className="mt-4 text-center">
            <a href="/" className="text-xs text-ink/50 hover:text-pink">
              ← Siteye dön
            </a>
          </div>
        </div>

        <div className="text-center text-white/40 text-[10px] mt-5">
          Demos Pizza Yönetim · v1.0 · Güvenli Giriş
        </div>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-ink text-white/60 text-sm">
          Yükleniyor...
        </div>
      }
    >
      <LoginContent />
    </React.Suspense>
  );
}
