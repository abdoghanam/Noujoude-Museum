import type { HTMLAttributes, ReactNode } from "react";

// eslint-disable-next-line no-restricted-syntax
import styles from "./heading.module.css";

export type HeadingLevel = 1 | 2 | 3 | 4;

export interface HeadingProps extends HTMLAttributes<HTMLHeadingElement> {
  readonly level?: HeadingLevel;
  readonly children: ReactNode;
}

const TAGS = {
  1: "h1",
  2: "h2",
  3: "h3",
  4: "h4",
} as const;

export function Heading({ level = 2, className, children, ...rest }: HeadingProps) {
  const Tag = TAGS[level];
  const classes = [styles.heading, styles[`level${level}`], className]
    .filter(Boolean)
    .join(" ");
  return (
    <Tag className={classes} {...rest}>
      {children}
    </Tag>
  );
}