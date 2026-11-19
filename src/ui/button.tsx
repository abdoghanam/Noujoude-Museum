// Noujoude — Phase 3 design system primitive.
//
// A single button primitive that draws every value from the token layer
// (src/ui/styles/global.css). No literal colour, spacing or timing appears
// here; the only properties are logical (inline/block) so the same component
// serves ltr and rtl without a fork.

import type { ButtonHTMLAttributes, ReactNode } from "react";

// eslint-disable-next-line no-restricted-syntax
import styles from "./button.module.css";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  readonly variant?: "primary" | "ghost";
  readonly children: ReactNode;
}

export function Button({
  variant = "primary",
  className,
  children,
  ...rest
}: ButtonProps) {
  const classes = [styles.button, styles[variant], className]
    .filter(Boolean)
    .join(" ");
  return (
    <button type="button" className={classes} {...rest}>
      {children}
    </button>
  );
}
