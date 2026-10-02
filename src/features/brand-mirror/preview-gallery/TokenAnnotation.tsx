import { useEffect, useMemo, useState } from 'react'
import type { BrandTokens } from '../models/brandMirrorModels'
import { resolveTokenEntries } from '../domain/tokenRefs'

const PIN_DURATION_MS = 4200

interface TokenAnnotationProps {
  tokens: BrandTokens
  tokenKeys: string[]
  onJump: (tokenKey: string) => void
}

export function TokenAnnotation({ tokens, tokenKeys, onJump }: TokenAnnotationProps) {
  const [pinned, setPinned] = useState(false)
  const entries = useMemo(() => resolveTokenEntries(tokens, tokenKeys), [tokens, tokenKeys])

  useEffect(() => {
    if (!pinned) return
    const timer = setTimeout(() => setPinned(false), PIN_DURATION_MS)
    return () => clearTimeout(timer)
  }, [pinned])

  if (entries.length === 0) return null

  return (
    <div
      className={`token-annotation ${pinned ? 'open' : ''}`}
      onKeyDown={(event) => {
        if (event.key === 'Escape') setPinned(false)
      }}
    >
      <button
        type="button"
        className="token-annotation-toggle"
        aria-expanded={pinned}
        aria-label="查看本样例使用的令牌"
        title="查看本样例使用的令牌"
        onClick={() => setPinned((current) => !current)}
      >
        <span className="token-annotation-icon">⌗</span>
        <span>{entries.length} 令牌</span>
      </button>
      <div className="token-panel" role="group" aria-label="样例令牌标注">
        <div className="token-panel-head">
          <span>本样例使用的令牌</span>
          {pinned && (
            <button type="button" aria-label="关闭令牌标注" onClick={() => setPinned(false)}>
              ×
            </button>
          )}
        </div>
        <div className="token-chip-list">
          {entries.map((entry) => (
            <button
              key={entry.key}
              type="button"
              className="token-chip"
              title={`跳转到「${entry.label}」编辑项`}
              onClick={() => {
                onJump(entry.key)
                setPinned(false)
              }}
            >
              {entry.category === 'color' && <span className="token-chip-swatch" style={{ background: entry.value }} />}
              <span className="token-chip-label">{entry.label}</span>
              <code>{entry.value}</code>
            </button>
          ))}
        </div>
        <p className="token-panel-hint">点击令牌可定位到左侧编辑项</p>
      </div>
    </div>
  )
}
