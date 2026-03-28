import * as React from "react";
import { cn } from "@/lib/utils";
import { ProgressBar } from "@/components/atoms/ProgressBar";
import { motion } from "framer-motion";

export interface RHSBreakdownBarProps {
  label: string;
  value: number;
  icon?: React.ReactNode;
  color?: "burgundy" | "rose" | "electric" | "success";
  delay?: number;
  className?: string;
}

export function RHSBreakdownBar({
  label,
  value,
  icon,
  color = "burgundy",
  delay = 0,
  className,
}: RHSBreakdownBarProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.4 }}
      className={cn("space-y-1", className)}
    >
      <div className="flex items-center gap-2">
        {icon && <span className="text-lg">{icon}</span>}
        <span className="text-sm font-bold text-foreground">{label}</span>
        <span className="ml-auto text-sm font-black text-muted-foreground">
          {value}%
        </span>
      </div>
      <ProgressBar value={value} color={color} size="sm" showValue={false} />
    </motion.div>
  );
}
