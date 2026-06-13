/**
 * ============================================================
 * SaveManager — 存档/读档管理器
 *
 * 使用 Dexie.js (IndexedDB) 持久化 Pixi'VN 的游戏状态。
 * 支持多存档槽位、自动存档、存档信息预览。
 * ============================================================
 */
import Dexie, { type EntityTable } from 'dexie'
import engine from './GameEngine'

/** 存档信息（用于存档列表预览） */
export interface SaveSlotInfo {
  /** 槽位 ID (1-based) */
  slotId: number
  /** 存档时间戳 */
  timestamp: number
  /** 游戏内章节/场景名 */
  sceneName: string
  /** 游戏时长（秒） */
  playTime: number
  /** 存档截图的 base64（可选） */
  thumbnail?: string
  /** 是否自动存档 */
  isAutoSave: boolean
}

/** 存档数据（存入 IndexedDB） */
export interface SaveData {
  /** 槽位 ID */
  slotId: number
  /** 存档时间 */
  timestamp: number
  /** Pixi'VN 导出的 JSON 状态 */
  gameState: string
  /** 好感度数据 JSON */
  affinityData: string
  /** 藏品数据 JSON */
  collectionData: string
  /** 游戏内变量快照 */
  variables: Record<string, unknown>
}

/** IndexedDB 数据库定义 */
class SaveDatabase extends Dexie {
  saves!: EntityTable<SaveData, 'slotId'>
  autoSave!: EntityTable<SaveData, 'slotId'>

  constructor() {
    super('GalGameSaves')
    this.version(1).stores({
      saves: 'slotId, timestamp',
      autoSave: 'slotId',
    })
  }
}

const db = new SaveDatabase()

/** 存档管理器（单例） */
class SaveManager {
  private static instance: SaveManager
  /** 存档槽位数 */
  readonly MAX_SLOTS = 20
  /** 自动存档固定使用槽位 0 */
  readonly AUTO_SAVE_SLOT = 0

  private constructor() {}

  static getInstance(): SaveManager {
    if (!SaveManager.instance) {
      SaveManager.instance = new SaveManager()
    }
    return SaveManager.instance
  }

  /**
   * 保存到指定槽位
   * @param slotId 槽位编号（1-MAX_SLOTS）
   * @param sceneName 当前场景名
   * @param affinityData 好感度数据 JSON
   * @param collectionData 藏品数据 JSON
   * @param playTime 游戏时长（秒）
   */
  async saveToSlot(
    slotId: number,
    sceneName: string,
    affinityData: string,
    collectionData: string,
    playTime: number
  ): Promise<void> {
    if (slotId < 0 || slotId > this.MAX_SLOTS) {
      throw new Error(`存档槽位编号无效: ${slotId}，有效范围 0-${this.MAX_SLOTS}`)
    }

    const gameState = engine.exportSaveData()
    if (!gameState) {
      throw new Error('无法导出游戏状态')
    }

    const saveData: SaveData = {
      slotId,
      timestamp: Date.now(),
      gameState,
      affinityData,
      collectionData,
      variables: {
        sceneName,
        playTime,
        isAutoSave: slotId === this.AUTO_SAVE_SLOT,
      },
    }

    await db.saves.put(saveData)
    console.log(`[SaveManager] 已保存到槽位 ${slotId}: ${sceneName}`)
  }

  /**
   * 从指定槽位读取存档
   */
  async loadFromSlot(slotId: number): Promise<SaveData | undefined> {
    if (slotId < 0 || slotId > this.MAX_SLOTS) return undefined

    const data = await db.saves.get(slotId)
    if (!data) {
      console.warn(`[SaveManager] 槽位 ${slotId} 无存档`)
      return undefined
    }

    const success = await engine.loadSaveData(data.gameState)
    if (!success) {
      throw new Error(`从槽位 ${slotId} 读档失败：游戏状态恢复出错`)
    }

    console.log(`[SaveManager] 已从槽位 ${slotId} 读档`)
    return data
  }

  /**
   * 自动存档
   */
  async autoSave(
    sceneName: string,
    affinityData: string,
    collectionData: string,
    playTime: number
  ): Promise<void> {
    await this.saveToSlot(this.AUTO_SAVE_SLOT, sceneName, affinityData, collectionData, playTime)
  }

  /**
   * 删除指定槽位的存档
   */
  async deleteSlot(slotId: number): Promise<void> {
    if (slotId < 0 || slotId > this.MAX_SLOTS) return
    await db.saves.delete(slotId)
    console.log(`[SaveManager] 已删除槽位 ${slotId}`)
  }

  /**
   * 获取所有存档槽位信息
   */
  async getAllSaveInfo(): Promise<(SaveSlotInfo | null)[]> {
    const allSaves = await db.saves.toArray()
    const result: (SaveSlotInfo | null)[] = []

    // 按槽位编号填充（自动存档在 0 号位）
    for (let i = 0; i <= this.MAX_SLOTS; i++) {
      const save = allSaves.find((s) => s.slotId === i)
      if (save) {
        result.push({
          slotId: save.slotId,
          timestamp: save.timestamp,
          sceneName: (save.variables.sceneName as string) || '',
          playTime: (save.variables.playTime as number) || 0,
          isAutoSave: save.slotId === this.AUTO_SAVE_SLOT,
        })
      } else {
        result.push(null)
      }
    }

    return result
  }

  /**
   * 检查指定槽位是否有存档
   */
  async hasSave(slotId: number): Promise<boolean> {
    const count = await db.saves.where('slotId').equals(slotId).count()
    return count > 0
  }

  /**
   * 获取所有存档数量
   */
  async getTotalSaveCount(): Promise<number> {
    return await db.saves.count()
  }

  /**
   * 清除所有存档
   */
  async clearAllSaves(): Promise<void> {
    await db.saves.clear()
    console.log('[SaveManager] 已清除所有存档')
  }
}

export const saveManager = SaveManager.getInstance()
export default saveManager
