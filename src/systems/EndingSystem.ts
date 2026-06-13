/**
 * ============================================================
 * EndingSystem — 结局判定引擎
 *
 * 评估当前游戏状态（好感度、触发事件、游戏进度），
 * 判定玩家应进入哪个结局。
 *
 * 支持结局类型：
 *  - 角色 True End（好感度 ≥ 400 + 触发全部特殊事件）
 *  - 角色 Normal End（好感度 ≥ 200）
 *  - 友情结局（无角色达到恋人阶段）
 *  - 隐藏结局（特殊复合条件）
 * ============================================================
 */
import { useAffinityStore } from '@/stores/affinityStore'
import { useGalleryStore } from '@/stores/galleryStore'
import { characterDB } from '@/characters/CharacterDB'

/** 结局类型 */
export type EndingType = 'true' | 'normal' | 'friendship' | 'hidden'

/** 结局定义 */
export interface Ending {
  id: string
  /** 结局标题 */
  title: string
  /** 结局描述 */
  description: string
  /** 结局类型 */
  type: EndingType
  /** 关联角色（如有） */
  characterId?: string
  /** 是否已解锁 */
  unlocked: boolean
  /** 解锁时间 */
  unlockedAt?: number
  /** 是否为隐藏结局 */
  isHidden: boolean
  /** 对应的剧本标签 */
  labelId: string
}

/** 结局判定结果 */
export interface EndingResult {
  ending: Ending
  /** 判定理由（用于结局画面展示） */
  reason: string
  /** 最终好感度简报 */
  affinitySummary: { characterId: string; name: string; affinity: number; status: string }[]
}

/** 结局条件评估函数 */
type EndingCondition = () => { met: boolean; priority: number; reason: string }

class EndingSystemClass {
  private endings: Ending[] = []

  /**
   * 注册结局定义
   */
  registerEnding(ending: Ending): void {
    this.endings.push(ending)
  }

  /**
   * 批量注册结局
   */
  registerEndings(endings: Ending[]): void {
    this.endings.push(...endings)
  }

  /**
   * 获取所有已注册的结局
   */
  getAllEndings(): Ending[] {
    return this.endings
  }

  /**
   * 获取已解锁的结局
   */
  getUnlockedEndings(): Ending[] {
    return this.endings.filter((e) => e.unlocked)
  }

  /**
   * 标记结局为已解锁
   */
  unlockEnding(endingId: string): void {
    const ending = this.endings.find((e) => e.id === endingId)
    if (ending && !ending.unlocked) {
      ending.unlocked = true
      ending.unlockedAt = Date.now()
      console.log(`[结局] 解锁: ${ending.title}`)
    }
  }

  /**
   * 重置所有结局解锁状态
   */
  resetEndings(): void {
    this.endings.forEach((e) => {
      e.unlocked = false
      e.unlockedAt = undefined
    })
  }

  /**
   * 获取所有角色的好感度简报（按好感度降序）
   */
  private getAffinitySummary() {
    const affinityState = useAffinityStore.getState()
    const summary = characterDB.getAllConfigs().map((config) => {
      const cs = affinityState.characterStates[config.id]
      return {
        characterId: config.id,
        name: config.name,
        affinity: cs?.affinity ?? 0,
        status: cs?.status ?? '陌生人',
      }
    })
    return summary.sort((a, b) => b.affinity - a.affinity)
  }

  /**
   * 判断当前游戏状态应进入哪个结局
   *
   * 判定优先级：隐藏结局 > True End > Normal End > 友情结局
   */
  determineEnding(): EndingResult {
    const summary = this.getAffinitySummary()
    const affinityState = useAffinityStore.getState()
    let selectedEnding: Ending | null = null
    let reason = ''

    // 检查每个已注册结局的条件
    const candidates: { ending: Ending; priority: number; reason: string }[] = []

    for (const ending of this.endings) {
      switch (ending.type) {
        case 'hidden': {
          // 隐藏结局：特殊复合条件
          const met = this.checkHiddenCondition(ending.id)
          if (met) {
            candidates.push({ ending, priority: 100, reason: '达成隐藏条件！' })
          }
          break
        }
        case 'true': {
          if (!ending.characterId) break
          const cs = affinityState.characterStates[ending.characterId]
          if (!cs) break
          const config = characterDB.getConfig(ending.characterId)
          if (!config?.specialEvents) break
          // True End: 好感度≥400 + 触发所有特殊事件
          const allEventsTriggered = config.specialEvents.every(
            (ev) => affinityState.isEventTriggered(ending.characterId!, ev.name)
          )
          if (cs.affinity >= 400 && allEventsTriggered) {
            candidates.push({
              ending,
              priority: 80,
              reason: `${config.name} 好感度达到最高，且经历了所有特殊事件……`,
            })
          }
          break
        }
        case 'normal': {
          if (!ending.characterId) break
          const cs = affinityState.characterStates[ending.characterId]
          if (!cs) break
          const config = characterDB.getConfig(ending.characterId)
          // Normal End: 好感度≥200（恋人阶段）
          if (cs.affinity >= 200) {
            candidates.push({
              ending,
              priority: 60,
              reason: `${config?.name ?? ending.characterId} 好感度达到 ${cs.affinity}，关系已经足够亲密……`,
            })
          }
          break
        }
        case 'friendship': {
          // 友情结局：兜底，没有角色达到 Normal End 条件
          const hasRomance = summary.some((s) => s.affinity >= 200)
          if (!hasRomance) {
            candidates.push({
              ending,
              priority: 10,
              reason: '虽然没能和谁走到一起，但这段校园时光仍然值得珍惜……',
            })
          }
          break
        }
      }
    }

    // 按优先级降序选择最高优先级的结局
    candidates.sort((a, b) => b.priority - a.priority)

    if (candidates.length > 0) {
      selectedEnding = candidates[0].ending
      reason = candidates[0].reason
    } else {
      // 兜底：如果没有匹配任何结局，选第一个（通常为友情结局）
      selectedEnding = this.endings.find((e) => e.type === 'friendship') ?? this.endings[0]
      reason = '一段难忘的校园回忆……'
    }

    // 解锁结局
    if (selectedEnding) {
      this.unlockEnding(selectedEnding.id)
    }

    return {
      ending: selectedEnding!,
      reason,
      affinitySummary: summary.slice(0, 5), // 只显示前 5 名
    }
  }

  /**
   * 检查隐藏结局条件
   * 各种隐藏结局的特殊条件在此实现
   */
  private checkHiddenCondition(endingId: string): boolean {
    const affinityState = useAffinityStore.getState()
    const galleryState = useGalleryStore.getState()

    switch (endingId) {
      case 'ending_hidden_stargazer': {
        // 观星者结局：黑羽好感度≥300 + 空好感度≥300 + 萤好感度≥200
        const kuro = affinityState.getAffinity('kuro')
        const sora = affinityState.getAffinity('sora')
        const hotaru = affinityState.getAffinity('hotaru')
        return kuro >= 300 && sora >= 300 && hotaru >= 200
      }
      case 'ending_hidden_dream': {
        // 幻梦结局：已解锁全部 CG
        const progress = galleryState.getProgress()
        return progress.percentage >= 80
      }
      default:
        return false
    }
  }

  /**
   * 获取结局的描述性标题（基于好感度排名）
   */
  getEndingTitle(): string {
    const summary = this.getAffinitySummary()
    const top = summary[0]
    if (!top || top.affinity < 200) return '友情结局'
    const config = characterDB.getConfig(top.characterId)
    if (top.affinity >= 400) return `${config?.name ?? top.characterId} — True End`
    return `${config?.name ?? top.characterId} — Normal End`
  }
}

/** 全局结局引擎单例 */
export const endingSystem = new EndingSystemClass()
export default endingSystem
