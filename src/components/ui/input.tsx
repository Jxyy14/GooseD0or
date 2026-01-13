import * as React from "react";
import { cn } from "@/lib/utils";

/*
  Bold Typography Input
  =====================
  Sharp corners, minimal styling, accent border on focus.
*/

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-12 w-full border border-border bg-input px-4 py-3 text-base text-foreground placeholder:text-muted-foreground transition-colors duration-150 focus:border-accent focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
