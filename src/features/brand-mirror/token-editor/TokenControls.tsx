import { useEffect } from 'react'
import type { BrandMirrorSnapshot, BrandTheme } from '../models/brandMirrorModels'
import { useAnnotationStore } from '../token-annotations/annotationStore'

interface TokenControlsProps {
  snapshot: BrandMirrorSnapshot
  onThemeChange: (theme: BrandTheme) => void
  onColorChange: (field: 'primary' | 'secondary', value: string) => void
  onScaleChange: (field: 'radiusScale' | 'spacingScale' | 'typeScale', index: number, value: number) => void
  onReset: () => void
}

const themes: { id: BrandTheme; label: string; note: string }[] = [
  { id: 'studio', label: 'Studio warm', note: '热烈 · 友好' },
  { id: 'editorial', label: 'Editorial green', note: '克制 · 自然' },
  { id: 'night', label: 'Night signal', note: '锐利 · 数字' },
]

export function TokenControls({ snapshot, onThemeChange, onColorChange, onScaleChange, onReset }: TokenControlsProps) {
  const editFocus = useAnnotationStore((state) => state.editFocus)
  const editFocusNonce = useAnnotationStore((state) => state.editFocusNonce)

  // 从预览标注跳转过来：滚动到对应编辑项、短暂高亮并聚焦输入
  useEffect(() => {
    if (!editFocus) return
    const target = document.querySelector<HTMLElement>(`[data-token-edit="${editFocus}"]`)
    if (!target) return
    target.scrollIntoView({ behavior: 'smooth', block: 'center' })
    target.classList.add('token-edit-flash')
    const focusInput = window.setTimeout(() => target.querySelector<HTMLInputElement>('input')?.focus(), 260)
    const stopFlash = () => {
      target.classList.remove('token-edit-flash')
      useAnnotationStore.getState().clearEditFocus()
    }
    const onBlur = (event: FocusEvent) => {
      if (!target.contains(event.relatedTarget as Node)) stopFlash()
    }
    target.addEventListener('focusout', onBlur)
    const timer = window.setTimeout(stopFlash, 2600)
    return () => {
      window.clearTimeout(focusInput)
      window.clearTimeout(timer)
      target.removeEventListener('focusout', onBlur)
      target.classList.remove('token-edit-flash')
    }
  }, [editFocus, editFocusNonce])

  return (
    <aside className="control-panel">
      <div className="panel-heading">
        <div>
          <span className="eyebrow">01 / TOKENS</span>
          <h2>视觉令牌</h2>
        </div>
        <button className="text-button" type="button" onClick={onReset}>恢复默认</button>
      </div>

      <section className="control-section">
        <div className="section-label"><span>基础主题</span><span className="muted">快速起点</span></div>
        <div className="theme-list">
          {themes.map((theme) => (
            <button className={`theme-option ${snapshot.theme === theme.id ? 'selected' : ''}`} key={theme.id} onClick={() => onThemeChange(theme.id)} type="button">
              <span className={`theme-dot ${theme.id}`} />
              <span><strong>{theme.label}</strong><small>{theme.note}</small></span>
              {snapshot.theme === theme.id && <span className="check-mark">✓</span>}
            </button>
          ))}
        </div>
      </section>

      <section className="control-section">
        <div className="section-label"><span>品牌色</span><span className="muted">HEX / 6 位</span></div>
        <div className="color-fields">
          <ColorField tokenId="color.primary" label="主色" value={snapshot.tokens.primary} onChange={(value) => onColorChange('primary', value)} />
          <ColorField tokenId="color.secondary" label="辅助色" value={snapshot.tokens.secondary} onChange={(value) => onColorChange('secondary', value)} />
        </div>
        <div className={`contrast-note ${snapshot.contrastWarning ? 'warning' : ''}`}>
          <span className="contrast-icon">◐</span>
          <span>对比度 <strong>{snapshot.contrastRatio.toFixed(1)}:1</strong> · {snapshot.contrastWarning ? '建议提高对比度' : '适合界面使用'}</span>
        </div>
      </section>

      <ScaleControl tokenIds={snapshot.tokens.radiusScale.map((_, index) => `radius.${index + 1}`)} label="圆角尺度" hint="px" values={snapshot.tokens.radiusScale} field="radiusScale" onChange={onScaleChange} />
      <ScaleControl tokenIds={snapshot.tokens.spacingScale.map((_, index) => `spacing.${index + 1}`)} label="间距体系" hint="px" values={snapshot.tokens.spacingScale} field="spacingScale" onChange={onScaleChange} />
      <ScaleControl tokenIds={snapshot.tokens.typeScale.map((_, index) => `type.${index + 1}`)} label="字体比例" hint="px" values={snapshot.tokens.typeScale} field="typeScale" onChange={onScaleChange} />

      <div className="panel-footer"><span className="live-dot" />所有调整实时同步到预览</div>
    </aside>
  )
}

function ColorField({ tokenId, label, value, onChange }: { tokenId: string; label: string; value: string; onChange: (value: string) => void }) {
  return <label className="color-field" data-token-edit={tokenId}><span>{label}</span><div className="color-input"><input aria-label={label} type="color" value={value} onChange={(event) => onChange(event.target.value)} /><input aria-label={`${label} HEX`} value={value} onChange={(event) => onChange(event.target.value)} /></div></label>
}

function ScaleControl({ tokenIds, label, hint, values, field, onChange }: { tokenIds: string[]; label: string; hint: string; values: number[]; field: 'radiusScale' | 'spacingScale' | 'typeScale'; onChange: (field: 'radiusScale' | 'spacingScale' | 'typeScale', index: number, value: number) => void }) {
  return <section className="control-section scale-section"><div className="section-label"><span>{label}</span><span className="muted">{hint}</span></div><div className="scale-inputs">{values.map((value, index) => <label key={`${field}-${index}`} data-token-edit={tokenIds[index]}><span>{index + 1}</span><input aria-label={`${label}${index + 1}`} type="number" min={field === 'typeScale' ? 10 : 0} max={field === 'typeScale' ? 72 : field === 'spacingScale' ? 64 : 40} value={value} onChange={(event) => onChange(field, index, Number(event.target.value))} /></label>)}</div></section>
}
