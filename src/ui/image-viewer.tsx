"use client";


import { useState, useCallback, useRef, useEffect } from "react";

// eslint-disable-next-line no-restricted-syntax
import styles from "./image-viewer.module.css";

export interface ImageViewerProps {
  readonly src: string;
  readonly alt: string;
  readonly width: number;
  readonly height: number;
  readonly caption?: string;
  readonly credit?: string;
}

export function ImageViewer({ src, alt, width, height, caption, credit }: ImageViewerProps) {
  const [zoomed, setZoomed] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);

  const open = useCallback(() => {
    setZoomed(true);
    dialogRef.current?.showModal();
  }, []);

  const close = useCallback(() => {
    setZoomed(false);
    dialogRef.current?.close();
  }, []);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const handleClose = () => setZoomed(false);
    dialog.addEventListener("close", handleClose);
    return () => dialog.removeEventListener("close", handleClose);
  }, []);

  useEffect(() => {
    if (!zoomed) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [zoomed, close]);

  return (
    <div className={styles.viewer}>
      <button
        type="button"
        className={styles.trigger}
        onClick={open}
        aria-label={`View larger image: ${alt}`}
      >
        <img
          alt={alt}
          className={styles.thumbnail}
          height={height}
          src={src}
          width={width}
        />
      </button>
      {caption ? <p className={styles.caption}>{caption}</p> : null}
      {credit ? <p className={styles.credit}>{credit}</p> : null}

      <dialog ref={dialogRef} className={styles.dialog} aria-label={alt}>
        <div className={styles.dialogContent}>
          <button
            type="button"
            className={styles.closeButton}
            onClick={close}
            aria-label="Close image viewer"
          >
            ×
          </button>
          <img
            alt={alt}
            className={styles.fullImage}
            height={height}
            src={src}
            width={width}
          />
          {caption ? <p className={styles.dialogCaption}>{caption}</p> : null}
          {credit ? <p className={styles.dialogCredit}>{credit}</p> : null}
        </div>
      </dialog>
    </div>
  );
}