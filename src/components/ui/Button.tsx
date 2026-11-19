import type { ButtonHTMLAttributes } from "react";
import { cn } from "../../utils/cn";

type Variant = "primary" | "outline" | "ghost" | "danger";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: "sm" | "md";
}

const variantStyles: Record<Variant, string> = {
  primary:
    "bg-navy text-paper border border-transparent hover:bg-navy-deep shadow-[0_1px_0_rgb(0_0_0/0.35)] disabled:opacity-45 disabled:shadow-none",
  outline:
    "bg-transparent border border-rule-strong text-ink hover:border-gold hover:text-gold-text disabled:opacity-45 disabled:hover:border-rule-strong disabled:hover:text-ink",
  ghost:
    "bg-transparent border border-transparent text-muted hover:text-ink underline-offset-4 hover:underline disabled:opacity-45",
  danger:
    "bg-brick/15 border border-brick text-brick-text hover:bg-brick hover:text-ink disabled:opacity-45",
};

export function Button({ variant = "primary", size = "md", className, type, ...rest }: ButtonProps) {
  return (
    <button
      type={type ?? "button"}
      className={cn(
        "inline-flex items-center justify-center gap-2 font-sans font-semibold uppercase tracking-[0.1em] rounded-control transition-[background-color,border-color,color,transform] duration-150 min-h-[44px] active:translate-y-[1px]",
        size === "sm" ? "px-3 text-[10px]" : "px-5 text-[11px]",
        variantStyles[variant],
        className,
      )}
      {...rest}
    />
  );
}
