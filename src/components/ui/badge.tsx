import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/*
  Bold Typography Badge
  =====================
  Sharp corners, minimal styling, monospace font.
*/

const badgeVariants = cva(
  "inline-flex items-center border px-2 py-0.5 font-mono text-xs tracking-wide transition-colors duration-150",
  {
    variants: {
      variant: {
        default: "border-accent bg-accent/10 text-accent",
        secondary: "border-border bg-muted text-muted-foreground",
        destructive: "border-destructive bg-destructive/10 text-destructive",
        outline: "border-border text-foreground bg-transparent",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
