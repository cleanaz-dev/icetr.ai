import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive cursor-pointer",
  {
    variants: {
      variant: {
        default:
          "bg-primary/80 text-primary-foreground  hover:bg-primary transition-all duration-200",
          actionGreen: "bg-emerald-600 text-white shadow-xs hover:bg-emerald-700 focus-visible:ring-emerald-200 dark:focus-visible:ring-emerald-400 dark:bg-emerald-700/90",
        destructive:
          "bg-destructive text-white shadow-xs hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        destructiveAlt:
          "bg-background text-destructive border border-destructive/30 hover:bg-destructive/10 hover:border-destructive/40 focus-visible:ring-destructive/20",
        warn: "bg-amber-500 text-white shadow-xs hover:bg-amber-600 focus-visible:ring-amber-200 dark:focus-visible:ring-amber-400 dark:bg-amber-600/90",
        outline:
          "border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
        secondary:
          "bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80",
        ghost:
          "bg-transparent hover:bg-primary/75 transition-all duration-300 text-primary hover:text-white",
        ghostMuted: "bg-transparent transition-all duration-300 text-primary hover:text-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        transparent: "bg-transparent transition-all duration-300 text-primary hover:scale-110 transition-all duration-300",
        muted: "bg-muted animated-pulse hover:bg-muted-foreground transition-all duration-200",
        menu: "bg-transparent" ,
        outlineHero: "bg-transparent border-primary border-2 rounded-full hover:bg-primary transition-all duration-200"
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        xs: "h-6 rounded-md px-2 has-[>svg]:px-2",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        huge: "h-10 md:h-12 rounded-full px-8 has-[>svg]:px-6 text-lg hover:scale-110 duration-500 transition-all",
        hugeTransparent: "h-12 bg-transparent rounded-full px-8 has-[>svg]:px-6 text-lg hover:bg-secondary/50",
        icon: "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props} />
  );
}

export { Button, buttonVariants }
