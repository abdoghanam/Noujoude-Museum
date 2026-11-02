"use client";

import styles from "@/ui/render-failure.module.css";

/**
 * `src/ui/render-failure.tsx` — the one sentence the application says when a render fails, and the one
 * place it is written.
 *
 * `SR-05` in the security register named the defect plainly: there was no `error.tsx` and no
 * `global-error.tsx`, so the one throw this shell can make — `src/lib/server/media/registry.ts`
 * refusing to decide a media slot without the register — turned every page into an unstyled 500, and
 * in development that response carries the absolute path of the repository on the machine. The control
 * it is mapped to is `docs/SECURITY_AND_PERMISSIONS.md` §6.8, Standard §5 line 176: "Safe error
 * responses without stack traces, secrets, or internal implementation details", whose enforcement plan
 * is "error boundary + handler mapping; details to logs, correlation ID to client".
 *
 * So the shape here is the contract: it takes the *digest*, not the message.
 *
 *   * `error.message` never reaches this component, which is the structural version of the rule. A
 *     boundary that receives a message and chooses not to print it is one prop-refactor away from
 *     printing it; a boundary that cannot receive one has no such moment. The full error stays where
 *     §6.8 puts it — in the server log, where Next writes it with the same digest the visitor sees.
 *   * The digest is the correlation ID. Next derives it by hashing the error server-side, so it is
 *     safe to hand a visitor: it identifies the log line without describing the failure.
 *   * `reset` is React's own retry, which re-renders the failed subtree. Nothing here claims the page
 *     was repaired, and nothing here is a placeholder count, an invented status code or an apology
 *     that implies the visitor did something wrong.
 *
 * English, marked `lang="en"`, for the reason the whole shell already gives: Arabic structural copy is
 * an Owner input that has not been supplied, and writing it here would be inventing content in the
 * other language.
 */

export interface RenderFailureProps {
  /** The server-side correlation ID, when the failure produced one. */
  readonly digest: string | null;
  /** React's retry for the failed subtree. */
  readonly reset: () => void;
}

export const RENDER_FAILURE_SENTENCE =
  "This page could not be rendered. The reason was recorded in the server log, and it is deliberately not printed here.";

export function RenderFailure({ digest, reset }: RenderFailureProps) {
  return (
    <div className={styles.failure} data-slot="render-failure" lang="en">
      <p className={styles.sentence}>{RENDER_FAILURE_SENTENCE}</p>
      {digest === null ? null : (
        <p className={styles.reference}>
          {/* The ID is addressed to the log line, so a report can name the failure without the page
              ever having to carry its detail. */}
          <span>Server reference</span>
          <code>{digest}</code>
        </p>
      )}
      <button className={styles.retry} onClick={reset} type="button">
        Try again
      </button>
    </div>
  );
}
