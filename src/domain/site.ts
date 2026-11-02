/**
 * `src/domain/site.ts` — the one string this shell is allowed to use for its own name.
 *
 * It lives here rather than beside the `<html>` it decorates because two places need it and neither may
 * disagree: `src/app/[locale]/layout.tsx` uses it as the document title and the wordmark band, and
 * `src/app/global-error.tsx` has to title its own document — a last-resort boundary renders outside that
 * layout by definition, and a page with no title fails WCAG 2.4.2 whatever else it gets right. A second
 * literal would be a name that can drift.
 *
 * It is not a brand claim. Zero brand files are approved (`BA-001`, OD-16), so this is the textual name
 * the baseline supplies, rendered as text, and `robots` in the layout keeps the whole shell
 * non-indexable until approved content replaces it.
 */
export const SITE_NAME = "Noujoude";
