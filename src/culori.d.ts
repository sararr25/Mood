declare module 'culori' {
  export function parse(value: string): unknown
  export function formatHex(value: unknown): string
  export function wcagContrast(first: unknown, second: unknown): number | undefined
  export function differenceEuclidean(mode: string): (first: unknown, second: unknown) => number | undefined
}
