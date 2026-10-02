import { create } from 'zustand'
import type { TokenId } from './tokenCatalog'

/** 一个可标注的预览样例（组件卡片或页面卡片） */
export interface AnnotatedSample {
  /** 样例唯一标识，如 component-3 / page-landing */
  id: string
  /** 卡片标题，用于标注面板 */
  title: string
  tokenIds: TokenId[]
}

interface AnnotationState {
  /** 当前悬停预览的样例（离开一小段时间后自动收起） */
  hoveredId: string | null
  /** 用户钉选的样例，标注持续显示直到手动关闭 */
  pinnedId: string | null
  /** 鼠标悬停的具体令牌元素，用于标注行与画面元素联动高亮 */
  activeToken: TokenId | null
  /** 从标注跳转到左侧编辑项的目标；编辑项消费后清空 */
  editFocus: TokenId | null
  /** 每次请求自增，保证重复点击同一令牌也能重新触发跳转 */
  editFocusNonce: number
  hoverSample: (id: string | null) => void
  togglePinned: (id: string) => void
  pinSample: (id: string) => void
  closePinned: () => void
  /** 点击预览中的令牌元素：钉选该样例并定位到对应令牌 */
  inspectToken: (sampleId: string, token: TokenId) => void
  setActiveToken: (token: TokenId | null) => void
  requestEditFocus: (token: TokenId) => void
  clearEditFocus: () => void
}

const HOVER_DELAY = 140

export const useAnnotationStore = create<AnnotationState>((set, get) => {
  let hoverTimer: ReturnType<typeof setTimeout> | undefined

  const scheduleHoverClose = () => {
    clearTimeout(hoverTimer)
    hoverTimer = setTimeout(() => set({ hoveredId: null, activeToken: null }), HOVER_DELAY)
  }

  return {
    hoveredId: null,
    pinnedId: null,
    activeToken: null,
    editFocus: null,
    editFocusNonce: 0,

    hoverSample: (id) => {
      clearTimeout(hoverTimer)
      if (id) {
        // 钉选了某张卡片时，悬停不再切换到其他卡片的标注
        if (get().pinnedId) return
        set({ hoveredId: id })
      } else if (get().pinnedId) {
        set({ activeToken: null })
      } else {
        scheduleHoverClose()
      }
    },

    togglePinned: (id) => {
      clearTimeout(hoverTimer)
      set((state) => ({
        pinnedId: state.pinnedId === id ? null : id,
        hoveredId: state.pinnedId === id ? null : id,
        activeToken: null,
      }))
    },

    pinSample: (id) => {
      clearTimeout(hoverTimer)
      set((state) => (state.pinnedId === id ? state : { pinnedId: id, hoveredId: id, activeToken: null }))
    },

    closePinned: () => {
      clearTimeout(hoverTimer)
      set({ pinnedId: null, hoveredId: null, activeToken: null })
    },

    inspectToken: (sampleId, token) => {
      clearTimeout(hoverTimer)
      set({ pinnedId: sampleId, hoveredId: sampleId, activeToken: token })
    },

    setActiveToken: (token) => set({ activeToken: token }),

    requestEditFocus: (token) => set((state) => ({ editFocus: token, editFocusNonce: state.editFocusNonce + 1 })),

    clearEditFocus: () => set({ editFocus: null }),
  }
})
