import * as React from "react"
import { cn } from "../../lib/utils"

const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
    ({ className, ...props }, ref) => {
        return (
            <textarea
                className={cn(
                    "flex min-h-[120px] w-full rounded-xl border border-glass-border bg-glass-bg px-4 py-3 text-sm text-primary shadow-sm transition-all placeholder:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange/50 focus-visible:border-brand-orange disabled:cursor-not-allowed disabled:opacity-50 backdrop-blur-xl hover:bg-glass-bg/80 resize-y",
                    className
                )}
                ref={ref}
                {...props}
            />
        )
    }
)
Textarea.displayName = "Textarea"

export { Textarea }
