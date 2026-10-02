import { useCallback, useEffect, useLayoutEffect, useRef, useState, type HTMLAttributes, type MouseEvent } from 'react'
import { createPortal } from 'react-dom'
import { useAnnotationStore } from './annotationStore'
import { tokenMeta, tokenSwatch, tokenValue, type TokenId } from './tokenCatalog'
import type { BrandTokens } from '../models/brandMirrorModels'

/**
 * 给预览里用到令牌的元素展开的属性：
 *   <button {...hotspot(tokens.primary ...)} />
 * data-tok 是空格分隔的令牌 id，供面板联动高亮查询。
 */
export function hotspot(sampleId: string, token: TokenId, extra?: TokenId[]): HTMLAttributes<HTMLElement> & { 'data-tok': string } {
  const ids = [token, ...(extra ?? [])].join(' ')
  return {
    'data-tok': ids,
    onMouseEnter: () => useAnnotationStore.getState().setActiveToken(token),
    onMouseLeave: () => useAnnotationStore.getState().setActiveToken(null),
    onClick: (event: MouseEvent<HTMLElement>) => {
      event.preventDefault()
      event.stopPropagation()
      useAnnotationStore.getState().inspectToken(sampleId, token)
    },
  }
}

const PANEL_WIDTH = 216

export function SampleAnnotation({ sample, tokens }: { sample: { id: string; title: string; tokenIds: TokenId[] }; tokens: BrandTokens }) {
  const chipRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const [cardEl, setCardEl] = useState<Element | null>(null)
  const [coords, setCoords] = useState<{ top: number; left: number; open: boolean }>({ top: 0, left: 0, open: false })

  const pinnedId = useAnnotationStore((state) => state.pinnedId)
  const hoveredId = useAnnotationStore((state) => state.hoveredId)
  const activeToken = useAnnotationStore((state) => state.activeToken)
  const store = useAnnotationStore.getState

  const isPinned = pinnedId === sample.id
  const open = isPinned || (hoveredId === sample.id && !pinnedId)

  const resolveCard = useCallback(() => chipRef.current?.closest('.annotated-card') ?? null, [])

  // 挂载后拿到卡片容器，绑定整块卡片的悬停与热点高亮
  useEffect(() => {
    const card = resolveCard()
    setCardEl(card)
    if (!card) return
    const enter = () => store().hoverSample(sample.id)
    const leave = () => store().hoverSample(null)
    card.addEventListener('mouseenter', enter)
    card.addEventListener('mouseleave', leave)
    return () => {
      card.removeEventListener('mouseenter', enter)
      card.removeEventListener('mouseleave', leave)
    }
  }, [resolveCard, sample.id, store])

  // 面板开关与卡片状态类
  useEffect(() => {
    if (!cardEl) return
    cardEl.classList.toggle('anno-open', open)
    cardEl.classList.toggle('anno-pinned', isPinned)
  }, [cardEl, open, isPinned])

  // 高亮当前悬停的令牌元素（data-tok 为空格分隔列表）
  useEffect(() => {
    if (!cardEl) return
    cardEl.querySelectorAll<HTMLElement>('[data-tok]').forEach((element) => {
      const ids = (element.dataset.tok ?? '').split(' ')
      element.toggleAttribute('data-tok-on', !!activeToken && ids.includes(activeToken))
    })
  }, [cardEl, activeToken, open])

  const reposition = useCallback(() => {
    const chip = chipRef.current
    if (!chip) return
    const rect = chip.getBoundingClientRect()
    const panelHeight = panelRef.current?.offsetHeight ?? 180
    const left = Math.min(Math.max(rect.right - PANEL_WIDTH, 8), window.innerWidth - PANEL_WIDTH - 8)
    const below = rect.bottom + 6
    const top = below + panelHeight + 12 > window.innerHeight ? rect.top - panelHeight - 6 : below
    setCoords({ top: Math.max(8, top), left, open: true })
  }, [])

  useLayoutEffect(() => {
    if (!open) {
      setCoords((value) => ({ ...value, open: false }))
      return
    }
    reposition()
    const rerender = () => requestAnimationFrame(reposition)
    window.addEventListener('scroll', rerender, true)
    window.addEventListener('resize', rerender)
    return () => {
      window.removeEventListener('scroll', rerender, true)
      window.removeEventListener('resize', rerender)
    }
  }, [open, reposition])

  // 点击空白或按 Esc 收起钉选
  useEffect(() => {
    if (!isPinned) return
    const onPointerDown = (event: globalThis.MouseEvent) => {
      const target = event.target as Node
      if (panelRef.current?.contains(target) || cardEl?.contains(target)) return
      store().closePinned()
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') store().closePinned()
    }
    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [isPinned, cardEl, store])

  const metas = sample.tokenIds.map(tokenMeta)

  return (
    <button
      ref={chipRef}
      type="button"
      className={`token-anno-chip ${isPinned ? 'is-pinned' : ''}`}
      aria-label={`查看「${sample.title}」使用的令牌`}
      aria-expanded={open}
      onMouseEnter={() => store().hoverSample(sample.id)}
      onClick={(event) => {
        event.stopPropagation()
        store().togglePinned(sample.id)
      }}
    >
      <span className="token-anno-dot" />
      <span className="token-anno-count">{sample.tokenIds.length}</span>
      {open && createPortal(
        <div
          ref={panelRef}
          className={`token-anno-panel ${isPinned ? 'is-pinned' : ''}`}
          style={{ position: 'fixed', top: coords.top, left: coords.left, width: PANEL_WIDTH, visibility: coords.open ? 'visible' : 'hidden' }}
          role="dialog"
          aria-label={`${sample.title} 的令牌标注`}
          onMouseEnter={() => store().hoverSample(sample.id)}
          onMouseLeave={() => store().hoverSample(null)}
          onClick={(event) => event.stopPropagation()}
        >
          <div className="token-anno-head">
            <div><strong>{sample.title}</strong><small>{sample.tokenIds.length} 个令牌在生效</small></div>
            {isPinned && <button type="button" className="token-anno-close" aria-label="关闭标注" onClick={() => store().closePinned()}>×</button>}
          </div>
          <div className="token-anno-list">
            {metas.map((meta) => {
              const swatch = tokenSwatch(meta.id, tokens)
              return (
                <button
                  type="button"
                  key={meta.id}
                  className={`token-anno-row ${activeToken === meta.id ? 'active' : ''}`}
                  onMouseEnter={() => store().setActiveToken(meta.id)}
                  onMouseLeave={() => store().setActiveToken(null)}
                  onClick={() => {
                    // 跳转期间滚动会让悬停态丢失，先钉住本张样例的标注
                    store().pinSample(sample.id)
                    store().requestEditFocus(meta.id)
                  }}
                >
                  <span className="token-anno-swatch" data-kind={swatch ? 'color' : 'radius'} style={swatch ? { background: swatch } : undefined}>{swatch ? '' : '⌐'}</span>
                  <span className="token-anno-name"><strong>{meta.label}</strong><small>{meta.id}</small></span>
                  <code>{tokenValue(meta.id, tokens)}</code>
                </button>
              )
            })}
          </div>
          <div className="token-anno-foot">{isPinned ? '点击令牌跳转左侧编辑 · Esc 关闭' : '点击固定标注'}</div>
        </div>,
        document.body,
      )}
    </button>
  )
}
