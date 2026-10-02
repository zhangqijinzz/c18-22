import type { BrandTokens } from '../models/brandMirrorModels'

export type TokenCategory = 'color' | 'radius' | 'spacing' | 'type'
export type ScaleField = 'radiusScale' | 'spacingScale' | 'typeScale'

export interface TokenEntry {
  key: string
  label: string
  category: TokenCategory
  value: string
}

const SCALE_META: Record<ScaleField, { category: TokenCategory; label: string; prefix: string }> = {
  radiusScale: { category: 'radius', label: '圆角', prefix: 'radius' },
  spacingScale: { category: 'spacing', label: '间距', prefix: 'spacing' },
  typeScale: { category: 'type', label: '字体', prefix: 'type' },
}

const SCALE_FIELDS = Object.keys(SCALE_META) as ScaleField[]

export function scaleTokenKey(field: ScaleField, index: number): string {
  return `${SCALE_META[field].prefix}.${index + 1}`
}

export function listTokenEntries(tokens: BrandTokens): TokenEntry[] {
  return [
    { key: 'color.primary', label: '主色', category: 'color', value: tokens.primary },
    { key: 'color.secondary', label: '辅助色', category: 'color', value: tokens.secondary },
    ...SCALE_FIELDS.flatMap((field) =>
      tokens[field].map((value, index) => ({
        key: scaleTokenKey(field, index),
        label: `${SCALE_META[field].label} ${index + 1}`,
        category: SCALE_META[field].category,
        value: `${value}px`,
      })),
    ),
  ]
}

export function resolveTokenEntries(tokens: BrandTokens, keys: string[]): TokenEntry[] {
  const entries = listTokenEntries(tokens)
  return keys
    .map((key) => entries.find((entry) => entry.key === key))
    .filter((entry): entry is TokenEntry => Boolean(entry))
}

export function tokenEditAnchorId(key: string): string {
  return `token-edit-${key.replace(/\./g, '-')}`
}
