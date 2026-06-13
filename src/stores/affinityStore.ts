/**
 * ============================================================
 * affinityStore — 好感度/关系状态管理 (Zustand)
 *
 * 管理所有角色与主角之间的好感度数值、关系阶段和已触发事件。
 * 存档时会序列化到 SaveManager。
 * ============================================================
 */
import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import {
  characterDB,
  DEFAULT_AFFINITY_THRESHOLDS,
  type AffinityThreshold,
  type CharacterState,
  type RelationshipStatus,
} from '@/characters/CharacterDB'

/** 好感度变化来源类型 */
export type AffinityChangeReason =
  | '对话选择'       // 剧情分支中的选择
  | '手机聊天'       // 手机聊天互动
  | '送礼物'         // 赠送礼品
  | '特殊事件'       // 触发特殊事件
  | '能力培养'       // 能力培养互动
  | '日常互动'       // 普通互动
  | '剧情推进'       // 主线剧情自动推进

/** 好感度变化记录 */
export interface AffinityChangeLog {
  characterId: string
  /** 变化量 */
  delta: number
  /** 变化前好感度 */
  before: number
  /** 变化后好感度 */
  after: number
  /** 变化原因 */
  reason: AffinityChangeReason
  /** 游戏内时间戳/步数 */
  step: number
}

/** 好感度 Store 状态 */
interface AffinityState {
  /** 所有角色的运行时状态 (characterId -> CharacterState) */
  characterStates: Record<string, CharacterState>
  /** 好感度变化日志（最近 100 条） */
  recentLogs: AffinityChangeLog[]
  /** 好感度阶段阈值配置 */
  thresholds: AffinityThreshold[]
}

/** 好感度 Store 操作 */
interface AffinityActions {
  /** 初始化所有角色状态 */
  initializeStates: () => void
  /** 修改对角色的好感度 */
  modifyAffinity: (
    characterId: string,
    delta: number,
    reason: AffinityChangeReason
  ) => void
  /** 设置好感度到具体数值 */
  setAffinity: (characterId: string, value: number) => void
  /** 获取角色好感度 */
  getAffinity: (characterId: string) => number
  /** 获取关系阶段 */
  getRelationshipStatus: (characterId: string) => RelationshipStatus
  /** 标记事件为已触发 */
  markEventTriggered: (characterId: string, eventName: string) => void
  /** 检查特定事件是否已触发 */
  isEventTriggered: (characterId: string, eventName: string) => boolean
  /** 增加手机聊天计数 */
  incrementChatCount: (characterId: string) => void
  /** 解锁角色 */
  unlockCharacter: (characterId: string) => void
  /** 获取可触发特殊事件的角色列表 */
  getAvailableSpecialEvents: () => { characterId: string; eventName: string; labelId: string }[]
  /** 导出好感度数据（用于存档） */
  exportAffinityData: () => string
  /** 导入好感度数据（用于读档） */
  importAffinityData: (json: string) => void
  /** 重置所有好感度数据 */
  resetAllAffinity: () => void
}

/** 根据好感度数值计算关系阶段 */
function calculateStatus(affinity: number, thresholds: AffinityThreshold[]): RelationshipStatus {
  let status: RelationshipStatus = '陌生人'
  for (const t of thresholds) {
    if (affinity >= t.value) {
      status = t.name
    }
  }
  return status
}

/** 最大的日志条数 */
const MAX_LOG_SIZE = 100

export const useAffinityStore = create<AffinityState & AffinityActions>()(
  immer((set, get) => ({
    characterStates: {},
    recentLogs: [],
    thresholds: DEFAULT_AFFINITY_THRESHOLDS,

    initializeStates: () =>
      set((state) => {
        const ids = characterDB.getAllCharacterIds()
        for (const id of ids) {
          if (!state.characterStates[id]) {
            state.characterStates[id] = {
              characterId: id,
              affinity: 0,
              status: '陌生人',
              isUnlocked: false,
              triggeredEvents: [],
              chatCount: 0,
            }
          }
        }
      }),

    modifyAffinity: (characterId, delta, reason) =>
      set((state) => {
        const charState = state.characterStates[characterId]
        if (!charState) {
          console.warn(`[好感度] 角色 ${characterId} 不存在`)
          return
        }

        const before = charState.affinity
        const after = Math.max(0, Math.min(999, before + delta))
        charState.affinity = after
        charState.status = calculateStatus(after, state.thresholds)

        // 记录日志
        state.recentLogs.unshift({
          characterId,
          delta,
          before,
          after,
          reason,
          step: Date.now(),
        })
        if (state.recentLogs.length > MAX_LOG_SIZE) {
          state.recentLogs.length = MAX_LOG_SIZE
        }

        console.log(
          `[好感度] ${characterId}: ${before} → ${after} (${delta > 0 ? '+' : ''}${delta}) 原因: ${reason}`
        )
      }),

    setAffinity: (characterId, value) =>
      set((state) => {
        const charState = state.characterStates[characterId]
        if (!charState) return
        charState.affinity = Math.max(0, Math.min(999, value))
        charState.status = calculateStatus(charState.affinity, state.thresholds)
      }),

    getAffinity: (characterId) => {
      return get().characterStates[characterId]?.affinity ?? 0
    },

    getRelationshipStatus: (characterId) => {
      return get().characterStates[characterId]?.status ?? '陌生人'
    },

    markEventTriggered: (characterId, eventName) =>
      set((state) => {
        const charState = state.characterStates[characterId]
        if (!charState) return
        if (!charState.triggeredEvents.includes(eventName)) {
          charState.triggeredEvents.push(eventName)
        }
      }),

    isEventTriggered: (characterId, eventName) => {
      const charState = get().characterStates[characterId]
      return charState?.triggeredEvents.includes(eventName) ?? false
    },

    incrementChatCount: (characterId) =>
      set((state) => {
        const charState = state.characterStates[characterId]
        if (charState) charState.chatCount++
      }),

    unlockCharacter: (characterId) =>
      set((state) => {
        const charState = state.characterStates[characterId]
        if (charState) charState.isUnlocked = true
      }),

    getAvailableSpecialEvents: () => {
      const result: { characterId: string; eventName: string; labelId: string }[] = []
      const states = get().characterStates

      for (const [charId, charState] of Object.entries(states)) {
        const config = characterDB.getConfig(charId)
        if (!config?.specialEvents) continue

        for (const event of config.specialEvents) {
          if (
            charState.affinity >= event.requireAffinity &&
            !charState.triggeredEvents.includes(event.name)
          ) {
            result.push({ characterId: charId, eventName: event.name, labelId: event.labelId })
          }
        }
      }

      return result
    },

    exportAffinityData: () => {
      return JSON.stringify(get().characterStates)
    },

    importAffinityData: (json) =>
      set((state) => {
        try {
          const data = JSON.parse(json)
          for (const [id, charState] of Object.entries(data)) {
            if (state.characterStates[id]) {
              const cs = charState as CharacterState
              state.characterStates[id].affinity = cs.affinity
              state.characterStates[id].status = cs.status
              state.characterStates[id].isUnlocked = cs.isUnlocked
              state.characterStates[id].triggeredEvents = cs.triggeredEvents
              state.characterStates[id].chatCount = cs.chatCount
            }
          }
        } catch (e) {
          console.error('[好感度] 导入数据失败:', e)
        }
      }),

    resetAllAffinity: () =>
      set((state) => {
        for (const charState of Object.values(state.characterStates)) {
          charState.affinity = 0
          charState.status = '陌生人'
          charState.isUnlocked = false
          charState.triggeredEvents = []
          charState.chatCount = 0
        }
        state.recentLogs = []
      }),
  }))
)

export default useAffinityStore
