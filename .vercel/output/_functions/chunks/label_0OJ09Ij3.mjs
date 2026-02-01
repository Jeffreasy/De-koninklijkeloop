import { jsx } from 'react/jsx-runtime';
import * as React from 'react';
import { c as cn } from './button_CPvoipf7.mjs';
import { cva } from 'class-variance-authority';

const Input = React.forwardRef(
  ({ className, type, ...props }, ref) => {
    return /* @__PURE__ */ jsx(
      "input",
      {
        type,
        className: cn(
          "flex h-12 w-full rounded-xl border border-glass-border bg-glass-bg px-4 py-2 text-sm text-primary shadow-sm transition-all file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary/50 focus-visible:border-accent-primary disabled:cursor-not-allowed disabled:opacity-50 backdrop-blur-xl hover:bg-glass-bg/80",
          className
        ),
        ref,
        ...props
      }
    );
  }
);
Input.displayName = "Input";

const labelVariants = cva(
  "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-primary"
);
const Label = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  "label",
  {
    ref,
    className: cn(labelVariants(), className),
    ...props
  }
));
Label.displayName = "Label";

export { Input as I, Label as L };
