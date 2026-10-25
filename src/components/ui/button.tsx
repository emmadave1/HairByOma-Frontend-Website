import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium cursor-pointer luxury-button transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline:
          "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
        outlineOnDark:
          "border border-background/60 bg-transparent text-background hover:bg-background hover:text-foreground",
        secondary: "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  magnetic?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, magnetic = false, onPointerMove, onPointerLeave, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props}
        onPointerMove={event=>{
          onPointerMove?.(event);
          if(!magnetic||event.pointerType!=="mouse"||window.matchMedia("(prefers-reduced-motion: reduce)").matches)return;
          const rect=event.currentTarget.getBoundingClientRect();
          event.currentTarget.style.setProperty("--magnet-x",`${(event.clientX-rect.left-rect.width/2)*.09}px`);
          event.currentTarget.style.setProperty("--magnet-y",`${(event.clientY-rect.top-rect.height/2)*.09}px`);
        }}
        onPointerLeave={event=>{onPointerLeave?.(event);event.currentTarget.style.setProperty("--magnet-x","0px");event.currentTarget.style.setProperty("--magnet-y","0px");}}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
