import type { HTMLAttributes, ReactNode } from "react";

// eslint-disable-next-line no-restricted-syntax
import styles from "./state.module.css";

export type StateKind =
  | "loading"
  | "empty"
  | "error"
  | "not-found"
  | "restricted"
  | "unavailable"
  | "media-unavailable"
  | "translation-unavailable";

export interface StateProps extends HTMLAttributes<HTMLDivElement> {
  readonly kind: StateKind;
  readonly title: string;
  readonly description?: string;
  readonly children?: ReactNode;
}

export function State({ kind, title, description, className, children, ...rest }: StateProps) {
  const classes = [styles.state, styles[kind], className].filter(Boolean).join(" ");
  return (
    <div role="status" aria-live="polite" className={classes} {...rest}>
      <p className={styles.title}>{title}</p>
      {description ? <p className={styles.description}>{description}</p> : null}
      {children}
    </div>
  );
}