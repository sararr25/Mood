import { differenceEuclidean, formatHex, parse, wcagContrast } from 'culori'

export const contrastRatio = (foreground: string, background: string) => wcagContrast(parse(foreground), parse(background)) ?? 0
export const contrastLabel = (ratio: number) => ratio >= 7 ? 'AAA' : ratio >= 4.5 ? 'AA' : 'Needs work'
export const paletteDistance = (first: string, second: string) => {
  const distance = differenceEuclidean('lab')(parse(first), parse(second))
  return Math.round(distance ?? 0)
}
export const normaliseHex = (value: string) => formatHex(parse(value))
