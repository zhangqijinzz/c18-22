import { describe, expect, it } from 'vitest'
import { listTokenEntries, resolveTokenEntries, scaleTokenKey, tokenEditAnchorId } from '../domain/tokenRefs'
import { INITIAL_TOKENS } from '../models/brandMirrorModels'

describe('token references', () => {
  it('lists every token with a stable key, label and formatted value', () => {
    const entries = listTokenEntries(INITIAL_TOKENS)
    expect(entries).toHaveLength(2 + 4 + 5 + 6)
    expect(entries[0]).toEqual({ key: 'color.primary', label: '主色', category: 'color', value: '#F15A47' })
    expect(entries[1]).toEqual({ key: 'color.secondary', label: '辅助色', category: 'color', value: '#24324A' })
    expect(entries.find((entry) => entry.key === 'radius.2')).toMatchObject({ label: '圆角 2', value: '12px' })
    expect(entries.find((entry) => entry.key === 'spacing.5')).toMatchObject({ label: '间距 5', value: '32px' })
    expect(entries.find((entry) => entry.key === 'type.6')).toMatchObject({ label: '字体 6', value: '40px' })
  })

  it('reflects updated token values when resolving annotations', () => {
    const tokens = { ...INITIAL_TOKENS, primary: '#123456', radiusScale: [3, 9, 15, 24] }
    const entries = resolveTokenEntries(tokens, ['radius.2', 'color.primary'])
    expect(entries.map((entry) => entry.value)).toEqual(['9px', '#123456'])
  })

  it('keeps the requested order and skips unknown keys', () => {
    const entries = resolveTokenEntries(INITIAL_TOKENS, ['radius.4', 'color.unknown', 'color.primary'])
    expect(entries.map((entry) => entry.key)).toEqual(['radius.4', 'color.primary'])
  })

  it('maps scale fields and token keys to stable editor anchors', () => {
    expect(scaleTokenKey('radiusScale', 1)).toBe('radius.2')
    expect(scaleTokenKey('typeScale', 5)).toBe('type.6')
    expect(tokenEditAnchorId('color.primary')).toBe('token-edit-color-primary')
    expect(tokenEditAnchorId('radius.2')).toBe('token-edit-radius-2')
  })
})
