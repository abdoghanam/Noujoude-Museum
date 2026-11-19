import type { HTMLAttributes, ReactNode } from "react";

// eslint-disable-next-line no-restricted-syntax
import styles from "./text.module.css";

export type TextVariant = "body" | "secondary" | "caption";

export interface TextProps extends HTMLAttributes<HTMLParagraphElement> {
  readonly children: ReactNode;
  readonly variant?: TextVariant;
}

export function Text({ variant = "body", className, children, ...rest }: TextProps) {
  const classes = [styles.text, styles[variant], className].filter(Boolean).join(" ");
  return (
    <p className={classes} {...rest}>
      {children}
    </p>
  );
}