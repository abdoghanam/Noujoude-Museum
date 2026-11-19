import type { HTMLAttributes, ReactNode } from "react";

// eslint-disable-next-line no-restricted-syntax
import styles from "./stack.module.css";

export interface StackProps extends HTMLAttributes<HTMLDivElement> {
  readonly children: ReactNode;
  readonly gap?: "1" | "2" | "3" | "4" | "5";
  readonly direction?: "block" | "inline";
}

export function Stack({
  gap = "3",
  direction = "block",
  className,
  children,
  style,
  ...rest
}: StackProps) {
  const classes = [
    styles.stack,
    styles[`gap${gap}`],
    styles[direction],
    className,
  ]
    .filter(Boolean)
    .join(" ");
  return (
    <div className={classes} style={style} {...rest}>
      {children}
    </div>
  );
}
