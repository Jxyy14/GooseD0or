import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/*
  Bold Typography Button System
  =============================
  Primary: Text-only with animated underline
  Secondary/Outline: Border with hover inversion
  Ghost: Minimal with subtle underline on hover
*/

const buttonVariants = cva(
  // Base styles: inline-flex, no rounded corners, fast transitions
  "inline-flex items-center justify-center whitespace-nowrap font-semibold uppercase tracking-wider transition-all duration-150 ease-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 active:translate-y-px",
  {
    variants: {
      variant: {
        // Primary: Text with animated underline
        default:
          "relative text-accent bg-transparent px-0 gap-2 group",
        // Secondary/Outline: Border with hover inversion
        outline:
          "border border-foreground text-foreground bg-transparent px-6 hover:bg-foreground hover:text-background",
        // Ghost: Minimal, subtle underline on hover
        ghost:
          "relative text-muted-foreground bg-transparent px-4 hover:text-foreground group",
        // Destructive
        destructive:
          "border border-destructive text-destructive bg-transparent px-6 hover:bg-destructive hover:text-destructive-foreground",
        // Link style
        link: "text-accent underline-offset-4 hover:underline px-0",
        // Secondary (muted)
        secondary:
          "border border-border text-foreground bg-transparent px-6 hover:border-foreground",
      },
      size: {
        default: "h-12 py-3 text-sm [&_svg]:size-4",
        sm: "h-10 py-2 text-xs [&_svg]:size-3.5",
        lg: "h-14 py-4 text-base [&_svg]:size-5",
        icon: "h-12 w-12 p-0 [&_svg]:size-5",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, children, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    const needsUnderline = variant === "default" || variant === undefined;
    const needsGhostUnderline = variant === "ghost";

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      >
        {children}
        {/* Animated underline for primary buttons */}
        {needsUnderline && (
          <span
            className="absolute bottom-2 left-0 h-0.5 w-full bg-accent origin-left transform scale-x-100 transition-transform duration-150 ease-bold group-hover:scale-x-110"
            aria-hidden="true"
          />
        )}
        {/* Thinner underline for ghost buttons */}
        {needsGhostUnderline && (
          <span
            className="absolute bottom-2 left-4 right-4 h-px bg-foreground origin-left transform scale-x-0 transition-transform duration-150 ease-bold group-hover:scale-x-100"
            aria-hidden="true"
          />
        )}
      </Comp>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
