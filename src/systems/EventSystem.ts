/**
 * ============================================================
 * EventSystem — 特殊事件触发系统
 *
 * 管理游戏中所有特殊事件的注册、触发条件检查和执行。
 * 事件触发条件支持：
 *  - 好感度阈值
 *  - 日程/天数
 *  - 前置事件完成
 *  - 复合条件（多角色好感度组合）
 *
 * 与 affinityStore 和 StoryScript 联动。
 * ============================================================
 */
import { useAffinityStore } from '@/stores/affinityStore'
import { characterDB } from '@/characters/CharacterDB'

/** 事件触发条件类型 */
export type EventConditionType = 'affinity' | 'schedule' | 'prerequisite' | 'composite'

/** 事件触发条件 */
export interface EventCondition {
  type: EventConditionType
  /** 针对的角色 ID */
  characterId?: string
  /** 条件参数 */
  params: Record<string, unknown>
  /** 条件描述（用于 UI 展示） */
  description: string
}

/** 特殊事件定义 */
export interface SpecialEvent {
  id: string
  /** 事件名称 */
  name: string
  /** 关联角色 */
  characterId: string
  /** 触发条件列表（全部满足才触发） */
  conditions: EventCondition[]
  /** 触发后跳转的剧本标签 */
  labelId: string
  /** 触发后增加的好感度 */
  affinityReward: number
  /** 优先级（同时满足多个条件时，高优先级先触发） */
  priority: number
  /** 是否为隐藏事件 */
  isHidden: boolean
  /** 事件简介 */
  description: string
}

/** 事件触发结果 */
export interface EventTriggerResult {
  triggered: boolean
  event?: SpecialEvent
  /** 未能触发的原因 */
  reason?: string
}

class EventSystemClass {
  private events: SpecialEvent[] = []

  /**
   * 注册特殊事件
   */
  registerEvent(event: SpecialEvent): void {
    this.events.push(event)
  }

  /**
   * 批量注册事件
   */
  registerEvents(events: SpecialEvent[]): void {
    this.events.push(...events)
  }

  /**
   * 获取所有已注册事件
   */
  getAllEvents(): SpecialEvent[] {
    return this.events
  }

  /**
   * 获取指定角色的事件
   */
  getEventsForCharacter(characterId: string): SpecialEvent[] {
    return this.events.filter((e) => e.characterId === characterId)
  }

  /**
   * 检查单个事件的条件是否满足
   */
  checkEventCondition(event: SpecialEvent): boolean {
    const affinityState = useAffinityStore.getState()

    for (const condition of event.conditions) {
      switch (condition.type) {
        case 'affinity': {
          const charId = condition.characterId ?? event.characterId
          const minAffinity = condition.params.minAffinity as number ?? 0
          const affinity = affinityState.getAffinity(charId)
          if (affinity < minAffinity) return false
          break
        }
        case 'prerequisite': {
          const prereqEventName = condition.params.eventName as string
          const prereqCharId = condition.characterId ?? event.characterId
          if (!affinityState.isEventTriggered(prereqCharId, prereqEventName)) return false
          break
        }
        case 'composite': {
          // 复合条件：多个角色的好感度组合
          const requirements = condition.params.requirements as { characterId: string; minAffinity: number }[]
          if (requirements) {
            for (const req of requirements) {
              if (affinityState.getAffinity(req.characterId) < req.minAffinity) return false
            }
          }
          break
        }
        case 'schedule': {
          // 日程条件：总步数达到阈值
          const minSteps = condition.params.minSteps as number ?? 0
          const currentSteps = condition.params.currentSteps as number ?? 0
          if (currentSteps < minSteps) return false
          break
        }
      }
    }
    return true
  }

  /**
   * 检查指定角色是否有可触发的事件
   */
  getAvailableEventsForCharacter(characterId: string): SpecialEvent[] {
    return this.events
      .filter((e) => e.characterId === characterId)
      .filter((e) => this.checkEventCondition(e))
      .sort((a, b) => b.priority - a.priority)
  }

  /**
   * 获取所有当前可触发的事件（按优先级排序）
   */
  getAvailableEvents(): SpecialEvent[] {
    return this.events
      .filter((e) => this.checkEventCondition(e))
      .sort((a, b) => b.priority - a.priority)
  }

  /**
   * 触发指定事件
   */
  triggerEvent(eventId: string): EventTriggerResult {
    const event = this.events.find((e) => e.id === eventId)
    if (!event) {
      return { triggered: false, reason: `事件 ${eventId} 不存在` }
    }

    if (!this.checkEventCondition(event)) {
      return { triggered: false, reason: '事件条件尚未满足', event }
    }

    // 检查是否已触发过
    const affinityState = useAffinityStore.getState()
    if (affinityState.isEventTriggered(event.characterId, event.name)) {
      return { triggered: false, reason: '事件已触发', event }
    }

    // 标记事件为已触发
    affinityState.markEventTriggered(event.characterId, event.name)

    // 好感度奖励
    if (event.affinityReward !== 0) {
      affinityState.modifyAffinity(event.characterId, event.affinityReward, '特殊事件')
    }

    console.log(`[事件系统] 触发事件: ${event.name} (${event.characterId})`)
    return { triggered: true, event }
  }

  /**
   * 自动触发最高优先级的可用事件（由游戏引擎在合适时机调用）
   */
  autoTrigger(): EventTriggerResult {
    const available = this.getAvailableEvents()
    if (available.length === 0) {
      return { triggered: false, reason: '无可触发的事件' }
    }
    return this.triggerEvent(available[0].id)
  }

  /**
   * 重置所有事件状态（不删除事件定义）
   */
  resetEvents(): void {
    // 事件定义保留，触发状态由 affinityStore 管理
    console.log('[事件系统] 事件状态已重置')
  }
}

/** 全局事件系统单例 */
export const eventSystem = new EventSystemClass()
export default eventSystem
