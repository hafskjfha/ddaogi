import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 dark:focus-visible:ring-slate-300 dark:focus-visible:ring-offset-slate-950",
  {
    variants: {
      variant: {
        default: "border-transparent bg-slate-900 text-white dark:bg-slate-50 dark:text-slate-900",
        outline: "border-slate-300 text-slate-700 dark:border-slate-700 dark:text-slate-300",
        muted: "border-transparent bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export type BadgeProps = ComponentProps<"span"> & VariantProps<typeof badgeVariants>;

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
