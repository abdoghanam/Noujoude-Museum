import type { HTMLAttributes, ReactNode } from "react";

// eslint-disable-next-line no-restricted-syntax
import styles from "./card.module.css";

export interface CardProps extends HTMLAttributes<HTMLElement> {
  readonly children: ReactNode;
  readonly as?: "article" | "section" | "div";
}

export function Card({
  as: Tag = "article",
  className,
  children,
  ...rest
}: CardProps) {
  const classes = [styles.card, className].filter(Boolean).join(" ");
  return (
    <Tag className={classes} {...rest}>
      {children}
    </Tag>
  );
}
