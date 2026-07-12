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

  // Already logged in?
  React.useEffect(() => {
    getSession().then((s) => {
      if (s) router.replace("/admin");
    });
  }, [router]);

  const callbackUrl = searchParams.get("callbackUrl") || "/admin";
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
    <div className="min-h-screen flex items-center justify-center bg-charcoal p-4 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <img
          src="/images/stone-oven.png"
          alt=""
          className="h-full w-full object-cover opacity-15"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-charcoal via-charcoal/95 to-smoke" />
        <div className="absolute -top-20 -right-20 w-96 h-96 bg-saffron/10 blur-3xl rounded-full ember-pulse" />
        <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-ember/10 blur-3xl rounded-full ember-pulse" />
      </div>

      {/* Form card */}
      <div className="relative w-full max-w-md">
        <div className="bg-cream/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8 md:p-10 border border-saffron/20">
          {/* Logo */}
          <div className="text-center mb-8">
            <img
              src="/logo.svg"
              alt="Demos Pizza"
              className="h-14 mx-auto mb-4"
            />
            <div className="flex items-center justify-center gap-2 text-xs text-charcoal/60 font-mono uppercase tracking-widest">
              <Flame className="h-3 w-3 text-ember" />
              Yönetim Paneli
            </div>
          </div>

          <h1 className="font-display text-2xl md:text-3xl font-bold text-charcoal text-center mb-2">
            Hoş geldiniz
          </h1>
          <p className="text-center text-sm text-charcoal/60 mb-8">
            Devam etmek için yönetici bilgilerinizle giriş yapın
          </p>

          {/* Error */}
          {error && (
            <div className="mb-5 p-3 rounded-lg bg-ember/10 border border-ember/30 text-ember text-sm flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email" className="text-xs font-medium">
                E-posta
              </Label>
              <div className="relative mt-1.5">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-charcoal/40" />
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
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-charcoal/40" />
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
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal/40 hover:text-charcoal"
                  aria-label={showPwd ? "Şifreyi gizle" : "Şifreyi göster"}
                >
                  {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-ember hover:bg-ember/90 text-cream h-12 text-base font-semibold"
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

          {/* Security note */}
          <div className="mt-6 p-3 rounded-lg bg-charcoal/5 text-[11px] text-charcoal/60 leading-relaxed">
            <strong className="text-charcoal/80">Güvenlik:</strong> Tüm giriş denemeleri
            kaydedilir. Yetkisiz erişim girişimi yasal işlem doğurur. Bu alan sadece
            yetkili personel içindir.
          </div>

          <div className="mt-5 text-center">
            <a href="/" className="text-xs text-charcoal/50 hover:text-ember">
              ← Siteye dön
            </a>
          </div>
        </div>

        <div className="text-center text-cream/40 text-[10px] mt-6">
          Demos Pizza Yönetim Sistemi · v1.0 · Güvenli Giriş
        </div>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-charcoal text-cream/60 text-sm">
          Yükleniyor...
        </div>
      }
    >
      <LoginContent />
    </React.Suspense>
  );
}
