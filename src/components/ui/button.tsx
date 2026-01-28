import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "../../lib/utils"

const buttonVariants = cva(
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 cursor-pointer",
    {
        variants: {
            variant: {
                default: "bg-brand-primary text-white font-bold hover:bg-[oklch(60%_0.24_260)] hover:text-white shadow-lg shadow-brand-primary/20",
                destructive: "bg-red-500 text-white hover:bg-red-500/90",
                outline: "border border-glass-border bg-transparent hover:bg-glass-bg text-text-body",
                secondary: "bg-glass-bg text-text-body hover:bg-glass-bg/80",
                ghost: "hover:bg-glass-bg text-text-body",
                link: "text-text-body underline-offset-4 hover:underline hover:text-brand-primary",
                glass: "bg-glass-bg backdrop-blur-md border border-glass-border text-text-body hover:bg-glass-bg/80 shadow-xl",
            },
            size: {
                default: "h-10 px-4 py-2",
                sm: "h-9 rounded-lg px-3",
                lg: "h-12 rounded-xl px-8 text-base",
                icon: "h-10 w-10",
            },
        },
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
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant, size, asChild = false, ...props }, ref) => {
        const Comp = asChild ? Slot : "button"
        return (
            <Comp
                className={cn(buttonVariants({ variant, size, className }))}
                ref={ref}
                {...props}
            />
        )
    }
)
Button.displayName = "Button"

export { Button, buttonVariants }
