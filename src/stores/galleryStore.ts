/**
 * ============================================================
 * galleryStore — 藏品/成就鉴赏系统状态管理 (Zustand + Immer)
 *
 * 管理游戏中的 CG 图鉴和成就系统：
 *  - CG 解锁/锁定状态
 *  - 成就进度追踪
 *  - 收集进度统计
 *  - 新解锁通知
 *
 * 数据通过 SaveManager 随游戏存档一起持久化。
 * ============================================================
 */
import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'

/* ---------- 类型定义 ---------- */

/** 藏品项类型 */
export type GalleryItemCategory = 'cg' | 'achievement'

/** 藏品项 */
export interface GalleryItem {
  id: string
  /** 类型 */
  type: GalleryItemCategory
  /** 标题 */
  title: string
  /** 描述 */
  description: string
  /** 关联角色（可选） */
  characterId?: string
  /** 类别分组标签 */
  category: string
  /** 解锁条件描述文本 */
  conditionDescription: string
  /** 是否已解锁 */
  isUnlocked: boolean
  /** 解锁时间戳 */
  unlockedAt?: number
  /** 资源路径（占位） */
  assetPath?: string
  /** 排序权重 */
  order: number
}

/** Store 状态 */
interface GalleryState {
  /** 所有藏品项 */
  items: GalleryItem[]
  /** 最近解锁的 ID 列表（用于通知动画） */
  newUnlocks: string[]
  /** 是否已初始化 */
  _hydrated: boolean
}

/** Store Actions */
interface GalleryActions {
  /** 初始化藏品数据 */
  initialize: (items: GalleryItem[]) => void
  /** 解锁指定藏品 */
  unlockItem: (id: string) => void
  /** 批量解锁 */
  unlockItems: (ids: string[]) => void
  /** 检查是否已解锁 */
  isUnlocked: (id: string) => boolean
  /** 获取总的收集进度 */
  getProgress: () => { unlocked: number; total: number; percentage: number }
  /** 获取某角色的收集进度 */
  getCharacterProgress: (characterId: string) => { unlocked: number; total: number; percentage: number }
  /** 按类型获取藏品列表 */
  getItemsByType: (type: GalleryItemCategory) => GalleryItem[]
  /** 按角色获取藏品列表 */
  getItemsByCharacter: (characterId: string) => GalleryItem[]
  /** 清除新解锁标记 */
  clearNewUnlocks: () => void
  /** 获取新解锁数量 */
  getNewUnlockCount: () => number
  /** 导出数据（用于存档） */
  exportData: () => string
  /** 导入数据（用于读档） */
  importData: (json: string) => void
  /** 重置 */
  reset: () => void
}

/** 初始状态 */
const initialState: GalleryState = {
  items: [],
  newUnlocks: [],
  _hydrated: false,
}

/** 创建 galleryStore */
export const useGalleryStore = create<GalleryState & GalleryActions>()(
  immer((set, get) => ({
    ...initialState,

    initialize: (items) =>
      set((state) => {
        state.items = items
        state._hydrated = true
      }),

    unlockItem: (id) =>
      set((state) => {
        const item = state.items.find((i) => i.id === id)
        if (item && !item.isUnlocked) {
          item.isUnlocked = true
          item.unlockedAt = Date.now()
          if (!state.newUnlocks.includes(id)) {
            state.newUnlocks.push(id)
          }
          console.log(`[图鉴] 解锁: ${item.title}`)
        }
      }),

    unlockItems: (ids) =>
      set((state) => {
        for (const id of ids) {
          const item = state.items.find((i) => i.id === id)
          if (item && !item.isUnlocked) {
            item.isUnlocked = true
            item.unlockedAt = Date.now()
            if (!state.newUnlocks.includes(id)) {
              state.newUnlocks.push(id)
            }
          }
        }
      }),

    isUnlocked: (id) => {
      const item = get().items.find((i) => i.id === id)
      return item?.isUnlocked ?? false
    },

    getProgress: () => {
      const items = get().items
      const total = items.length
      const unlocked = items.filter((i) => i.isUnlocked).length
      return {
        unlocked,
        total,
        percentage: total > 0 ? Math.round((unlocked / total) * 100) : 0,
      }
    },

    getCharacterProgress: (characterId) => {
      const items = get().items.filter((i) => i.characterId === characterId)
      const total = items.length
      const unlocked = items.filter((i) => i.isUnlocked).length
      return {
        unlocked,
        total,
        percentage: total > 0 ? Math.round((unlocked / total) * 100) : 0,
      }
    },

    getItemsByType: (type) => {
      return get().items.filter((i) => i.type === type)
    },

    getItemsByCharacter: (characterId) => {
      return get().items.filter((i) => i.characterId === characterId)
    },

    clearNewUnlocks: () =>
      set((state) => {
        state.newUnlocks = []
      }),

    getNewUnlockCount: () => {
      return get().newUnlocks.length
    },

    exportData: () => {
      const items = get().items
      const exportItems = items.map((i) => ({
        id: i.id,
        isUnlocked: i.isUnlocked,
        unlockedAt: i.unlockedAt,
      }))
      return JSON.stringify(exportItems)
    },

    importData: (json) =>
      set((state) => {
        try {
          const data: { id: string; isUnlocked: boolean; unlockedAt?: number }[] = JSON.parse(json)
          for (const d of data) {
            const item = state.items.find((i) => i.id === d.id)
            if (item) {
              item.isUnlocked = d.isUnlocked
              item.unlockedAt = d.unlockedAt
            }
          }
        } catch (e) {
          console.error('[图鉴] 导入数据失败:', e)
        }
      }),

    reset: () =>
      set((state) => {
        state.items.forEach((item) => {
          item.isUnlocked = false
          item.unlockedAt = undefined
        })
        state.newUnlocks = []
      }),
  }))
)

export default useGalleryStore
