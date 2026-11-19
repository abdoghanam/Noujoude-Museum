import type { HTMLAttributes, ReactNode } from "react";

// eslint-disable-next-line no-restricted-syntax
import styles from "./container.module.css";

export interface ContainerProps extends HTMLAttributes<HTMLDivElement> {
  readonly children: ReactNode;
  readonly measure?: "reading" | "wide";
}

export function Container({
  measure = "wide",
  className,
  children,
  ...rest
}: ContainerProps) {
  const classes = [styles.container, styles[measure], className]
    .filter(Boolean)
    .join(" ");
  return (
    <div className={classes} {...rest}>
      {children}
    </div>
  );
}
