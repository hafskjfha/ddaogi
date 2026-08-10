import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { forwardRef, type ComponentPropsWithoutRef, type ComponentRef } from "react";
import { cn } from "@/lib/cn";

/** Radix tooltip root that coordinates its trigger and content. */
export const Tooltip = TooltipPrimitive.Root;
/** Radix control that reveals its associated tooltip. */
export const TooltipTrigger = TooltipPrimitive.Trigger;
/** Radix provider that configures tooltip behavior for descendants. */
export const TooltipProvider = TooltipPrimitive.Provider;

/** Styled Radix overlay that presents concise contextual help. */
export const TooltipContent = forwardRef<
  ComponentRef<typeof TooltipPrimitive.Content>,
  ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
  <TooltipPrimitive.Content
    ref={ref}
    sideOffset={sideOffset}
    className={cn(
      "z-50 overflow-hidden rounded-md bg-slate-900 px-3 py-1.5 text-xs text-white shadow-md animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 dark:bg-slate-50 dark:text-slate-900",
      className,
    )}
    {...props}
  />
));

TooltipContent.displayName = TooltipPrimitive.Content.displayName;
