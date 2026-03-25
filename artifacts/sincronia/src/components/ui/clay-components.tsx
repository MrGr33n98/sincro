import React from "react";
import { cn } from "@/lib/utils";
import { motion, HTMLMotionProps } from "framer-motion";

export const ClayCard = React.forwardRef<HTMLDivElement, HTMLMotionProps<"div">>(
  ({ className, children, ...props }, ref) => (
    <motion.div
      ref={ref}
      className={cn("clay-card p-6 md:p-8", className)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      {...props}
    >
      {children}
    </motion.div>
  )
);
ClayCard.displayName = "ClayCard";

interface ClayButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary";
  isLoading?: boolean;
}

export const ClayButton = React.forwardRef<HTMLButtonElement, ClayButtonProps>(
  ({ className, variant = "primary", isLoading, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          variant === "primary" ? "clay-btn-primary" : "clay-btn-secondary",
          "relative flex items-center justify-center gap-2",
          className
        )}
        disabled={isLoading || props.disabled}
        {...props}
      >
        {isLoading && (
          <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        )}
        {children}
      </button>
    );
  }
);
ClayButton.displayName = "ClayButton";

export const ClayInput = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn("clay-input", className)}
      {...props}
    />
  )
);
ClayInput.displayName = "ClayInput";
