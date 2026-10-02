// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import type { BrandDocument } from '../models/brandMirrorModels'
import type { BrandRepository } from '../repositories/brandRepository'
import { BrandMirrorViewModel } from '../viewmodels/brandMirrorViewModel'
import { BrandMirrorPage } from '../views/BrandMirrorPage'

class MemoryRepository implements BrandRepository {
  document: BrandDocument | null = null
  load(): BrandDocument | null { return this.document }
  save(document: BrandDocument): void { this.document = document }
}

;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true

const cleanups: (() => void)[] = []

function must<T>(value: T | null): T {
  if (value === null) throw new Error('expected element to exist')
  return value
}

function renderPage() {
  const viewModel = new BrandMirrorViewModel(new MemoryRepository())
  const container = document.createElement('div')
  document.body.appendChild(container)
  const root = createRoot(container)
  act(() => root.render(<BrandMirrorPage viewModel={viewModel} />))
  cleanups.push(() => {
    act(() => root.unmount())
    container.remove()
  })
  return { viewModel, container }
}

beforeEach(() => {
  Element.prototype.scrollIntoView = vi.fn()
})

afterEach(() => {
  cleanups.forEach((cleanup) => cleanup())
  cleanups.length = 0
  document.body.innerHTML = ''
})

describe('token annotations on preview samples', () => {
  it('annotates every component and page sample with the tokens it uses', () => {
    const { container } = renderPage()
    expect(container.querySelectorAll('.token-annotation-toggle')).toHaveLength(22)
    const firstCard = must(container.querySelector('.component-card'))
    const chips = firstCard.querySelectorAll('.token-chip')
    expect(chips).toHaveLength(2)
    expect(chips[0].textContent).toContain('主色')
    expect(chips[0].textContent).toContain('#F15A47')
    expect(chips[1].textContent).toContain('圆角 2')
    expect(chips[1].textContent).toContain('12px')
    const landingCard = must(container.querySelector('.landing-card'))
    expect(landingCard.querySelectorAll('.token-chip')).toHaveLength(4)
  })

  it('jumps from an annotation chip to the matching editor control and highlights it', () => {
    vi.useFakeTimers()
    try {
      const { viewModel, container } = renderPage()
      const firstCard = must(container.querySelector('.component-card'))
      const radiusChip = must(firstCard.querySelectorAll<HTMLButtonElement>('.token-chip')[1])
      act(() => radiusChip.click())
      expect(viewModel.getSnapshot().highlightedTokenKey).toBe('radius.2')
      const target = must(document.getElementById('token-edit-radius-2'))
      expect(target.className).toContain('token-target-active')
      act(() => vi.advanceTimersByTime(2000))
      expect(viewModel.getSnapshot().highlightedTokenKey).toBeNull()
      expect(must(document.getElementById('token-edit-radius-2')).className).not.toContain('token-target-active')
    } finally {
      vi.useRealTimers()
    }
  })

  it('refreshes annotation values after token edits', () => {
    const { viewModel, container } = renderPage()
    act(() => viewModel.updateColor('primary', '#123456'))
    const firstCard = must(container.querySelector('.component-card'))
    expect(must(firstCard.querySelector('.token-chip')).textContent).toContain('#123456')
  })

  it('dismisses a pinned annotation automatically so it does not linger', () => {
    vi.useFakeTimers()
    try {
      const { container } = renderPage()
      const toggle = must(container.querySelector<HTMLButtonElement>('.token-annotation-toggle'))
      act(() => toggle.click())
      expect(container.querySelector('.token-annotation.open')).not.toBeNull()
      act(() => vi.advanceTimersByTime(4300))
      expect(container.querySelector('.token-annotation.open')).toBeNull()
    } finally {
      vi.useRealTimers()
    }
  })
})
