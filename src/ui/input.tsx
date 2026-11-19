import type { InputHTMLAttributes } from "react";

// eslint-disable-next-line no-restricted-syntax
import styles from "./input.module.css";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  readonly label?: string;
  readonly hint?: string;
}

export function Input({ label, hint, className, ...rest }: InputProps) {
  const classes = [styles.input, className].filter(Boolean).join(" ");
  return (
    <label className={styles.field}>
      {label ? <span className={styles.label}>{label}</span> : null}
      <input className={classes} {...rest} />
      {hint ? <span className={styles.hint}>{hint}</span> : null}
    </label>
  );
}
