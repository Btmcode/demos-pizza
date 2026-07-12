"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { SessionProvider, useSession, signOut } from "next-auth/react";
import {
  LayoutDashboard,
  UtensilsCrossed,
  ShoppingBag,
  CalendarCheck,
  MessageSquare,
  Settings,
  Activity,
  LogOut,
  ExternalLink,
  Menu as MenuIcon,
  X,
  Flame,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { BRAND } from "@/lib/constants";

const NAV = [
  { href: "/admin", label: "Gösterge Paneli", icon: LayoutDashboard, exact: true },
  { href: "/admin/siparisler", label: "Siparişler", icon: ShoppingBag },
  { href: "/admin/menu", label: "Menü Yönetimi", icon: UtensilsCrossed },
  { href: "/admin/rezervasyonlar", label: "Rezervasyonlar", icon: CalendarCheck },
  { href: "/admin/mesajlar", label: "Mesajlar", icon: MessageSquare },
  { href: "/admin/ayarlar", label: "Ayarlar", icon: Settings },
  { href: "/admin/aktivite", label: "Aktivite Kaydı", icon: Activity },
];

function AdminShell({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  // Login page is excluded from auth gate (handled in page itself)
  const isLogin = pathname === "/admin/giris";

  React.useEffect(() => {
    if (status === "loading") return;
    if (!session && !isLogin) {
      router.replace("/admin/giris");
    }
  }, [session, status, isLogin, router]);

  if (isLogin) {
    return <>{children}</>;
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-charcoal">
        <div className="text-cream/60 text-sm">Yükleniyor...</div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-cream flex">
      {/* Sidebar - desktop */}
      <aside className="hidden lg:flex flex-col w-64 bg-charcoal text-cream/80 fixed inset-y-0 left-0 z-30">
        <SidebarContent pathname={pathname} session={session} />
      </aside>

      {/* Sidebar - mobile drawer */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/60" onClick={() => setSidebarOpen(false)} />
          <aside className="absolute left-0 inset-y-0 w-64 bg-charcoal text-cream/80 flex flex-col">
            <SidebarContent
              pathname={pathname}
              session={session}
              onNavigate={() => setSidebarOpen(false)}
            />
          </aside>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="sticky top-0 z-20 bg-cream/95 backdrop-blur-md border-b border-charcoal/10">
          <div className="flex items-center justify-between px-4 md:px-6 h-16">
            <div className="flex items-center gap-3">
              <Button
                size="icon"
                variant="ghost"
                className="lg:hidden"
                onClick={() => setSidebarOpen(true)}
                aria-label="Menüyü aç"
              >
                <MenuIcon className="h-5 w-5" />
              </Button>
              <div className="font-display font-bold text-charcoal text-lg">
                {NAV.find((n) => (n.exact ? pathname === n.href : pathname.startsWith(n.href)) && !n.exact)?.label ||
                  "Gösterge Paneli"}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link href="/" target="_blank">
                <Button size="sm" variant="outline" className="hidden sm:flex">
                  <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
                  Siteyi gör
                </Button>
              </Link>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => signOut({ callbackUrl: "/admin/giris" })}
                className="text-charcoal/70 hover:text-ember"
              >
                <LogOut className="h-3.5 w-3.5 mr-1.5" />
                Çıkış
              </Button>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}

function SidebarContent({
  pathname,
  session,
  onNavigate,
}: {
  pathname: string;
  session: any;
  onNavigate?: () => void;
}) {
  return (
    <>
      {/* Logo */}
      <div className="p-5 border-b border-cream/10 flex items-center justify-between">
        <Link href="/admin" className="flex items-center gap-2" onClick={onNavigate}>
          <img src="/logo.svg" alt="Demos" className="h-9 brightness-0 invert" />
        </Link>
        {onNavigate && (
          <Button size="icon" variant="ghost" className="text-cream lg:hidden" onClick={onNavigate}>
            <X className="h-5 w-5" />
          </Button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto custom-scroll">
        {NAV.map((item) => {
          const Icon = item.icon;
          const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? "bg-saffron text-charcoal"
                  : "text-cream/70 hover:bg-cream/5 hover:text-cream"
              }`}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User card */}
      <div className="p-3 border-t border-cream/10">
        <div className="flex items-center gap-3 p-3 rounded-lg bg-cream/5">
          <div className="w-9 h-9 rounded-full bg-saffron flex items-center justify-center text-charcoal font-bold text-sm">
            {session?.user?.name?.charAt(0).toUpperCase() || "A"}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-cream truncate">
              {session?.user?.name || "Admin"}
            </div>
            <div className="text-[10px] text-cream/50 truncate">
              {session?.user?.email}
            </div>
          </div>
          <Flame className="h-4 w-4 text-saffron" />
        </div>
        <div className="mt-2 text-[10px] text-cream/40 px-3">
          © {new Date().getFullYear()} {BRAND.name}
        </div>
      </div>
    </>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <AdminShell>{children}</AdminShell>
    </SessionProvider>
  );
}
