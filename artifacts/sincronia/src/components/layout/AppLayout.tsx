import { ReactNode, useEffect } from "react";
import { BottomNav } from "./BottomNav";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Loader2 } from "lucide-react";

export function AppLayout({ children }: { children: ReactNode }) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const [location, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && !isAuthenticated && !location.startsWith("/login") && !location.startsWith("/register") && !location.startsWith("/join")) {
      setLocation("/login");
    } else if (user && !user.coupleId && !location.startsWith("/invite") && !location.startsWith("/join")) {
      setLocation("/invite");
    }
  }, [user, isLoading, isAuthenticated, location, setLocation]);

  if (isLoading) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-background">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  // Auth pages handle their own layout
  if (["/login", "/register", "/invite", "/join"].some(path => location.startsWith(path))) {
    return <main className="min-h-[100dvh] bg-background relative overflow-hidden">{children}</main>;
  }

  return (
    <div className="min-h-[100dvh] bg-background pb-28 relative">
      <main className="max-w-md mx-auto h-full px-4 pt-6 md:pt-10">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
