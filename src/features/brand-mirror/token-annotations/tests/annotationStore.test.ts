import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useAnnotationStore } from '../annotationStore'
import { radiusToken, sampleTokens, tokenSwatch, tokenValue, PRIMARY_TOKEN } from '../tokenCatalog'
import { INITIAL_TOKENS, THEME_PRESETS } from '../../models/brandMirrorModels'

describe('tokenCatalog', () => {
  it('reads live values out of the current tokens', () => {
    expect(tokenValue('color.primary', INITIAL_TOKENS)).toBe('#F15A47')
    expect(tokenValue('color.secondary', INITIAL_TOKENS)).toBe('#24324A')
    expect(tokenValue(radiusToken(0).id, INITIAL_TOKENS)).toBe('8px')
    expect(tokenValue(radiusToken(3).id, INITIAL_TOKENS)).toBe('28px')
  })

  it('refreshes values after a token change', () => {
    const night = THEME_PRESETS.night.tokens
    expect(tokenValue('color.primary', night)).toBe('#A98BFF')
    expect(tokenValue(radiusToken(2).id, night)).toBe('14px')
  })

  it('exposes color swatches only for color tokens', () => {
    expect(tokenSwatch('color.primary', INITIAL_TOKENS)).toBe('#F15A47')
    expect(tokenSwatch(radiusToken(1).id, INITIAL_TOKENS)).toBeNull()
  })

  it('dedupes tokens referenced by one sample', () => {
    const tokens = sampleTokens(PRIMARY_TOKEN, radiusToken(1), PRIMARY_TOKEN)
    expect(tokens.map((token) => token.id)).toEqual(['color.primary', 'radius.2'])
  })
})

describe('annotationStore', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => {
    vi.useRealTimers()
    useAnnotationStore.getState().closePinned()
  })

  it('previews a sample on hover and collapses shortly after leaving', () => {
    const store = useAnnotationStore.getState()
    store.hoverSample('component-0')
    expect(useAnnotationStore.getState().hoveredId).toBe('component-0')
    store.hoverSample(null)
    vi.advanceTimersByTime(100)
    expect(useAnnotationStore.getState().hoveredId).toBe('component-0')
    vi.advanceTimersByTime(80)
    expect(useAnnotationStore.getState().hoveredId).toBeNull()
  })

  it('moves the hover preview directly between samples without flickering', () => {
    const store = useAnnotationStore.getState()
    store.hoverSample('component-0')
    store.hoverSample('component-1')
    vi.advanceTimersByTime(300)
    expect(useAnnotationStore.getState().hoveredId).toBe('component-1')
  })

  it('pins a sample, keeps it open on leave and closes via closePinned', () => {
    const store = useAnnotationStore.getState()
    store.togglePinned('page-landing')
    store.hoverSample(null)
    vi.advanceTimersByTime(500)
    expect(useAnnotationStore.getState().pinnedId).toBe('page-landing')
    store.closePinned()
    expect(useAnnotationStore.getState().pinnedId).toBeNull()
  })

  it('does not let hovering another sample steal the pinned panel', () => {
    const store = useAnnotationStore.getState()
    store.togglePinned('component-0')
    store.hoverSample('component-1')
    expect(useAnnotationStore.getState().pinnedId).toBe('component-0')
    expect(useAnnotationStore.getState().hoveredId).toBe('component-0')
  })

  it('inspects a tokenized element by pinning its sample and highlighting the token', () => {
    useAnnotationStore.getState().inspectToken('component-3', 'color.secondary')
    const state = useAnnotationStore.getState()
    expect(state.pinnedId).toBe('component-3')
    expect(state.activeToken).toBe('color.secondary')
  })

  it('pinSample keeps an already pinned sample and clears a pending hover close', () => {
    const store = useAnnotationStore.getState()
    store.togglePinned('component-1')
    store.hoverSample(null)
    store.pinSample('component-1')
    vi.advanceTimersByTime(500)
    expect(useAnnotationStore.getState().pinnedId).toBe('component-1')
  })

  it('requests editor focus with an incrementing nonce so repeats re-trigger', () => {
    const store = useAnnotationStore.getState()
    store.requestEditFocus('radius.2')
    expect(useAnnotationStore.getState().editFocus).toBe('radius.2')
    expect(useAnnotationStore.getState().editFocusNonce).toBe(1)
    store.requestEditFocus('radius.2')
    expect(useAnnotationStore.getState().editFocusNonce).toBe(2)
  })
})
