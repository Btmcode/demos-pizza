"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { SessionProvider, useSession, signOut } from "next-auth/react";
import {
  LayoutDashboard,
  UtensilsCrossed,
  ShoppingBag,
  MessageSquare,
  Settings,
  Activity,
  LogOut,
  ExternalLink,
  Menu as MenuIcon,
  X,
  Printer,
  Flame,
  Tag,
  BarChart3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { BRAND } from "@/lib/constants";

const NAV = [
  { href: "/demos", label: "Panel", icon: LayoutDashboard, exact: true },
  { href: "/demos/siparisler", label: "Siparişler", icon: ShoppingBag },
  { href: "/demos/menu", label: "Ürünler", icon: UtensilsCrossed },
  { href: "/demos/kampanyalar", label: "Kampanyalar", icon: Tag },
  { href: "/demos/raporlar", label: "Raporlar", icon: BarChart3 },
  { href: "/demos/mesajlar", label: "Mesajlar", icon: MessageSquare },
  { href: "/demos/ayarlar", label: "Ayarlar", icon: Settings },
  { href: "/demos/aktivite", label: "Aktivite", icon: Activity },
];

function AdminShell({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  const isLogin = pathname === "/demos/giris";

  React.useEffect(() => {
    if (status === "loading") return;
    if (!session && !isLogin) {
      router.replace("/demos/giris");
    }
  }, [session, status, isLogin, router]);

  if (isLogin) {
    return <>{children}</>;
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-ink text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-2 border-yellow/30 border-t-yellow animate-spin" />
          <div className="text-white/60 text-sm">Yükleniyor...</div>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-paper flex">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-60 bg-ink text-white/80 fixed inset-y-0 left-0 z-30">
        <SidebarContent pathname={pathname} session={session} />
      </aside>

      {/* Mobile drawer */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-40">
          <div className="absolute inset-0 bg-ink/50" onClick={() => setSidebarOpen(false)} />
          <aside className="absolute left-0 inset-y-0 w-60 bg-ink text-white/80 flex flex-col">
            <SidebarContent pathname={pathname} session={session} onNavigate={() => setSidebarOpen(false)} />
          </aside>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 lg:ml-60 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="sticky top-0 z-20 bg-paper border-b border-ink/10">
          <div className="flex items-center justify-between px-4 md:px-6 h-14 md:h-16">
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
              <div className="font-display font-bold text-ink text-base md:text-lg">
                {NAV.find((n) => (n.exact ? pathname === n.href : pathname.startsWith(n.href) && !n.exact))?.label || "Panel"}
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
                onClick={() => signOut({ callbackUrl: "/demos/giris" })}
                className="text-ink/70 hover:text-pink"
              >
                <LogOut className="h-3.5 w-3.5 mr-1.5" />
                <span className="hidden sm:inline">Çıkış</span>
              </Button>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6">{children}</main>
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
      <div className="p-4 border-b border-white/10 flex items-center justify-between">
        <Link href="/demos" className="flex items-center gap-2" onClick={onNavigate}>
          <div className="bg-ink-2 rounded-lg px-2 py-1">
            <img src="/logo.webp" alt="Demos" className="h-[46px] w-auto" />
          </div>
        </Link>
        {onNavigate && (
          <Button size="icon" variant="ghost" className="text-white lg:hidden" onClick={onNavigate}>
            <X className="h-5 w-5" />
          </Button>
        )}
      </div>

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
                  ? "bg-yellow text-ink shadow-sm"
                  : "text-white/70 hover:bg-white/5 hover:text-white"
              }`}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-white/10">
        <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5">
          <div className="w-9 h-9 rounded-full bg-yellow flex items-center justify-center text-ink font-bold text-sm">
            {session?.user?.name?.charAt(0).toUpperCase() || "A"}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-white truncate">
              {session?.user?.name || "Admin"}
            </div>
            <div className="text-[10px] text-white/50 truncate">
              {session?.user?.email}
            </div>
          </div>
          <Flame className="h-4 w-4 text-yellow" />
        </div>
        <div className="mt-2 text-[10px] text-white/40 px-3">
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
