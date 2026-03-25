import { ReactNode, useEffect, useRef } from "react";
import { BottomNav } from "./BottomNav";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Loader2 } from "lucide-react";

const PUBLIC_ROUTES = ["/", "/login", "/register"];
const AUTH_LAYOUT_ROUTES = ["/login", "/register", "/invite", "/join"];
const APP_ROUTES = ["/app", "/mood", "/ai", "/couple", "/upgrade", "/invite"];

export function AppLayout({ children }: { children: ReactNode }) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const [location, setLocation] = useLocation();
  const didRedirect = useRef(false);

  useEffect(() => {
    if (isLoading) return;

    const isPublic = PUBLIC_ROUTES.some(r => location === r) || location.startsWith("/join/");
    const isInviteFlow = location.startsWith("/invite") || location.startsWith("/join");

    if (!isAuthenticated && !isPublic && !isInviteFlow) {
      if (!didRedirect.current) {
        didRedirect.current = true;
        setLocation("/login");
      }
      return;
    }

    didRedirect.current = false;

    if (isAuthenticated && user) {
      if (!user.coupleId && !isInviteFlow && !isPublic) {
        setLocation("/invite");
        return;
      }
      if (user.coupleId && (location === "/login" || location === "/register")) {
        setLocation("/app");
      }
    }
  }, [isLoading, isAuthenticated, user?.id, user?.coupleId, location]);

  if (isLoading) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-background">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  // Landing page — no chrome
  if (location === "/") {
    return <>{children}</>;
  }

  // Auth / invite pages — minimal layout
  if (AUTH_LAYOUT_ROUTES.some(r => location === r || location.startsWith("/join/"))) {
    return (
      <main className="min-h-[100dvh] bg-background relative overflow-hidden">
        {children}
      </main>
    );
  }

  // App pages — bottom nav
  const showNav = APP_ROUTES.some(r => location === r || (r.length > 1 && location.startsWith(r)));

  return (
    <div className="min-h-[100dvh] bg-background pb-28 relative">
      <main className="max-w-md mx-auto h-full px-4 pt-6 md:pt-10">
        {children}
      </main>
      {showNav && <BottomNav />}
    </div>
  );
}
