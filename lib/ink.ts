import type { CSSProperties } from "react"

/**
 * Stagger helper for the page entrance animations. Elements marked with an
 * `ink ink-*` class play their animation when their page comes into view;
 * `inkDelay(320)` starts that element 320ms after the page is revealed.
 */
export function inkDelay(ms: number, style?: CSSProperties): CSSProperties {
  return { ...style, ["--d" as string]: `${ms}ms` }
}
