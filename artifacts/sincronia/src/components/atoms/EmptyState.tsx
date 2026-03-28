import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  actionLabel,
  onAction,
  className,
  ...props
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center p-8 bg-muted/30 rounded-3xl border-2 border-dashed border-muted-foreground/20",
        className
      )}
      {...props}
    >
      {icon && (
        <div className="w-16 h-16 flex items-center justify-center rounded-full bg-muted mb-4 text-4xl">
          {icon}
        </div>
      )}

      <h3 className="text-xl font-bold text-foreground mb-2">{title}</h3>

      {description && (
        <p className="text-muted-foreground mb-6 max-w-sm">{description}</p>
      )}

      {(action || (actionLabel && onAction)) && (
        <div>
          {action || (
            <Button onClick={onAction} size="lg" className="rounded-full">
              {actionLabel}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
