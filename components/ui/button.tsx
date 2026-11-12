import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { Loader2 } from "lucide-react"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  [
    "inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium",
    "cursor-pointer select-none transition-all duration-150 active:scale-[0.98]",
    // Keyboard focus: visible ring with offset so it works on any background
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-neutral-950",
    // Disabled / loading
    "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50",
    // Consistent icon handling for any <svg> child (lucide etc.)
    "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  ].join(" "),
  {
    variants: {
      variant: {
        default:
          "bg-neutral-900 text-white shadow-sm hover:bg-neutral-800 focus-visible:ring-neutral-500 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100 dark:focus-visible:ring-neutral-400",
        destructive:
          "bg-rose-600 text-white shadow-sm hover:bg-rose-700 focus-visible:ring-rose-500",
        outline:
          "border border-neutral-200/90 bg-white text-neutral-800 shadow-sm hover:bg-neutral-50 hover:text-neutral-900 focus-visible:ring-neutral-400 dark:border-neutral-800/90 dark:bg-[#121418] dark:text-neutral-200 dark:hover:bg-neutral-800/60 dark:hover:text-white",
        secondary:
          "bg-neutral-100 text-neutral-900 hover:bg-neutral-200/80 focus-visible:ring-neutral-400 dark:bg-neutral-800 dark:text-neutral-100 dark:hover:bg-neutral-700",
        ghost:
          "text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900 focus-visible:ring-neutral-400 dark:text-neutral-300 dark:hover:bg-neutral-800/60 dark:hover:text-white",
        link:
          "rounded-md text-neutral-900 underline-offset-4 hover:underline focus-visible:ring-neutral-400 dark:text-white",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 gap-1.5 rounded-lg px-3 text-xs",
        lg: "h-11 rounded-xl px-6 text-base",
        icon: "h-9 w-9 rounded-lg",
        "icon-sm": "h-8 w-8 rounded-lg",
        "icon-lg": "h-11 w-11 rounded-xl",
      },
    },
    compoundVariants: [
      // Link buttons shouldn't carry box padding/height
      { variant: "link", size: "default", className: "h-auto p-0" },
      { variant: "link", size: "sm", className: "h-auto p-0" },
      { variant: "link", size: "lg", className: "h-auto p-0" },
    ],
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  /** Shows a spinner, disables interaction and sets aria-busy. Ignored visually when `asChild` is true. */
  loading?: boolean
  /** Optional text announced/shown while loading, replaces children. */
  loadingText?: string
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      loading = false,
      loadingText,
      disabled,
      type,
      children,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : "button"
    const isDisabled = disabled || loading

    // Slot requires exactly one child, so spinner injection only applies to real buttons.
    const content = asChild ? (
      children
    ) : (
      <>
        {loading && <Loader2 className="animate-spin" aria-hidden="true" />}
        {loading && loadingText ? loadingText : children}
      </>
    )

    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        // Default to type="button" so buttons inside forms don't submit by accident
        {...(!asChild && { type: type ?? "button", disabled: isDisabled })}
        // Links (asChild) can't be natively disabled, so use aria-disabled
        {...(asChild && isDisabled && { "aria-disabled": true, tabIndex: -1 })}
        aria-busy={loading || undefined}
        {...props}
      >
        {content}
      </Comp>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }