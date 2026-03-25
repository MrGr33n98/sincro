import { Link, useLocation } from "wouter";
import { Home, Smile, Sparkles, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export function BottomNav() {
  const [location] = useLocation();

  const tabs = [
    { name: "Início", path: "/", icon: Home },
    { name: "Humor", path: "/mood", icon: Smile },
    { name: "IA Concierge", path: "/ai", icon: Sparkles },
    { name: "Perfil", path: "/couple", icon: User },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-6 pt-2 bg-gradient-to-t from-background via-background/90 to-transparent">
      <div className="clay-card !p-2 !rounded-full flex items-center justify-between">
        {tabs.map((tab) => {
          const isActive = location === tab.path || (tab.path !== "/" && location.startsWith(tab.path));
          const Icon = tab.icon;
          
          return (
            <Link key={tab.path} href={tab.path} className="relative w-full py-3 flex flex-col items-center justify-center text-xs font-semibold">
              <span className={cn(
                "relative z-10 transition-colors duration-300", 
                isActive ? "text-primary-foreground" : "text-muted-foreground hover:text-primary"
              )}>
                <Icon size={22} className="mb-1" />
              </span>
              {isActive && (
                <motion.div 
                  layoutId="bottom-nav-indicator"
                  className="absolute inset-0 bg-primary rounded-full shadow-md"
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                />
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
