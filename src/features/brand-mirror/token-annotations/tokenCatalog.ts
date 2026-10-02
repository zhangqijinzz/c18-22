import type { BrandTokens } from '../models/brandMirrorModels'

/**
 * 预览标注使用的令牌标识，与令牌搜索里的 key 保持一致：
 * color.primary / color.secondary / radius.1-4
 */
export type TokenId = 'color.primary' | 'color.secondary' | `radius.${number}`

export type TokenCategory = 'color' | 'radius'

export interface TokenMeta {
  id: TokenId
  label: string
  category: TokenCategory
}

export const PRIMARY_TOKEN: TokenMeta = { id: 'color.primary', label: '主色', category: 'color' }
export const SECONDARY_TOKEN: TokenMeta = { id: 'color.secondary', label: '辅助色', category: 'color' }

export function radiusToken(index: number): TokenMeta {
  return { id: `radius.${index + 1}`, label: `圆角 ${index + 1}`, category: 'radius' }
}

/** 由令牌 id 反查展示元信息（标注面板与搜索共用同一套命名） */
export function tokenMeta(id: TokenId): TokenMeta {
  if (id === 'color.primary') return PRIMARY_TOKEN
  if (id === 'color.secondary') return SECONDARY_TOKEN
  return radiusToken(Number(id.slice('radius.'.length)) - 1)
}

/** 同一个元素可能用到多个令牌（如图表柱子同时引用主色与圆角 1） */
export function sampleTokens(...tokens: TokenMeta[]): TokenMeta[] {
  const seen = new Set<TokenId>()
  return tokens.filter((token) => {
    if (seen.has(token.id)) return false
    seen.add(token.id)
    return true
  })
}

/** 从当前令牌快照读取某个令牌的实时取值 */
export function tokenValue(id: TokenId, tokens: BrandTokens): string {
  if (id === 'color.primary') return tokens.primary
  if (id === 'color.secondary') return tokens.secondary
  const index = Number(id.slice('radius.'.length)) - 1
  return `${tokens.radiusScale[index] ?? 0}px`
}

/** 颜色令牌返回色值，用于标注上的色块预览 */
export function tokenSwatch(id: TokenId, tokens: BrandTokens): string | null {
  if (id === 'color.primary') return tokens.primary
  if (id === 'color.secondary') return tokens.secondary
  return null
}
