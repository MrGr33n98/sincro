import * as React from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export interface StatCardProps {
  icon: React.ReactNode;
  value: string | number;
  label: string;
  trend?: "up" | "down" | "stable";
  trendValue?: number;
  color?: "orange" | "primary" | "accent" | "green";
  className?: string;
  onClick?: () => void;
}

const colorClasses = {
  orange: "text-orange-400 bg-orange-50",
  primary: "text-primary bg-pink-50",
  accent: "text-accent bg-purple-50",
  green: "text-green-500 bg-green-50",
};

export function StatCard({
  icon,
  value,
  label,
  trend,
  trendValue,
  color = "primary",
  className,
  onClick,
}: StatCardProps) {
  const trendIcons = {
    up: "↗",
    down: "↘",
    stable: "→",
  };

  const trendColors = {
    up: "text-green-600",
    down: "text-red-600",
    stable: "text-gray-500",
  };

  return (
    <motion.div
      whileHover={onClick ? { scale: 1.02, y: -2 } : {}}
      whileTap={onClick ? { scale: 0.98 } : {}}
      onClick={onClick}
      className={cn(
        "flex flex-col items-center justify-center p-4 rounded-3xl bg-white border border-muted shadow-soft-sm cursor-pointer transition-all",
        className
      )}
    >
      <div
        className={cn(
          "w-10 h-10 rounded-2xl flex items-center justify-center mb-2",
          colorClasses[color]
        )}
      >
        {icon}
      </div>

      <span className="text-2xl font-black text-foreground">{value}</span>

      <div className="flex items-center gap-1 mt-1">
        <span className="text-xs font-bold uppercase text-muted-foreground">
          {label}
        </span>
        {trend && (
          <span className={cn("text-xs font-bold", trendColors[trend])}>
            {trendIcons[trend]} {trendValue && `${trendValue}%`}
          </span>
        )}
      </div>
    </motion.div>
  );
}
