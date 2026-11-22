import type { HTMLAttributes, ReactNode } from "react";

// eslint-disable-next-line no-restricted-syntax
import styles from "./museum-scene.module.css";

export type SceneType =
  | "entrance"
  | "lobby"
  | "gallery"
  | "corridor"
  | "archive"
  | "chamber"
  | "closing";

export interface MuseumSceneProps extends HTMLAttributes<HTMLElement> {
  readonly scene: SceneType;
  readonly children: ReactNode;
  readonly title?: string;
  readonly subtitle?: string;
}

export function MuseumScene({ scene, title, subtitle, className, children, ...rest }: MuseumSceneProps) {
  const classes = [styles.scene, styles[scene], className].filter(Boolean).join(" ");
  return (
    <section className={classes} {...rest}>
      {title ? (
        <header className={styles.sceneHeader}>
          <h2 className={styles.sceneTitle}>{title}</h2>
          {subtitle ? <p className={styles.sceneSubtitle}>{subtitle}</p> : null}
        </header>
      ) : null}
      <div className={styles.sceneContent}>
        {children}
      </div>
    </section>
  );
}