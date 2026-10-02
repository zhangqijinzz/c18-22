// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest'

;(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true

import { createRoot, type Root } from 'react-dom/client'
import { act, type ReactElement } from 'react'
import { ComponentGallery } from '../../preview-gallery/ComponentGallery'
import { PageGallery } from '../../preview-gallery/PageGallery'
import { INITIAL_TOKENS, type BrandTokens } from '../../models/brandMirrorModels'
import { useAnnotationStore } from '../annotationStore'

const mounted: Root[] = []

function mount(node: ReactElement) {
  const container = document.createElement('div')
  document.body.appendChild(container)
  const root = createRoot(container)
  mounted.push(root)
  act(() => root.render(node))
  return { container, root }
}

afterEach(() => {
  act(() => {
    mounted.splice(0).forEach((root) => root.unmount())
  })
  document.body.innerHTML = ''
  useAnnotationStore.getState().closePinned()
})

describe('preview token annotations', () => {
  it('renders an annotation trigger on every component and page sample', () => {
    const { container: componentRoot } = mount(<ComponentGallery tokens={INITIAL_TOKENS} />)
    expect(componentRoot.querySelectorAll('.token-anno-chip')).toHaveLength(20)
    const { container: pageRoot } = mount(<PageGallery tokens={INITIAL_TOKENS} />)
    expect(pageRoot.querySelectorAll('.token-anno-chip')).toHaveLength(2)
  })

  it('shows live token values in the pinned panel and refreshes them when tokens change', () => {
    const { root, container } = mount(<ComponentGallery tokens={INITIAL_TOKENS} />)
    act(() => useAnnotationStore.getState().togglePinned('component-0'))
    let panel = container.ownerDocument.querySelector<HTMLElement>('.token-anno-panel')
    expect(panel).not.toBeNull()
    expect(panel?.textContent).toContain('#F15A47')
    expect(panel?.textContent).toContain('12px')

    const changed: BrandTokens = { ...INITIAL_TOKENS, primary: '#238B73', radiusScale: [8, 20, 18, 28] }
    act(() => root.render(<ComponentGallery tokens={changed} />))
    panel = container.ownerDocument.querySelector<HTMLElement>('.token-anno-panel')
    expect(panel?.textContent).toContain('#238B73')
    expect(panel?.textContent).toContain('20px')
  })

  it('marks tokenized elements with the tokens they consume', () => {
    const { container } = mount(<ComponentGallery tokens={INITIAL_TOKENS} />)
    const primaryButton = container.querySelector<HTMLElement>('.sample-0 button[data-tok]')
    expect(primaryButton?.dataset.tok).toContain('color.primary')
    expect(primaryButton?.dataset.tok).toContain('radius.2')
  })
})
