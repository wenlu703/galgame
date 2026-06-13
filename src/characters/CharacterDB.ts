/**
 * ============================================================
 * CharacterDB — 角色数据类型定义和注册管理器
 *
 * 管理游戏中所有可互动角色的定义、元数据和好感度阈值。
 * 使用 Pixi'VN 内置的 CharacterBaseModel 和 RegisteredCharacters 注册。
 * ============================================================
 */
import { CharacterBaseModel, RegisteredCharacters } from '@drincs/pixi-vn'

/**
 * 角色性别
 */
export type CharacterGender = '男' | '女' | '其他'

/**
 * 角色性格类型（影响对话风格和互动反应）
 */
export type CharacterPersonality =
  | '温柔'   // 体贴型，容易提升好感
  | '冷酷'   // 高冷型，需要特定条件
  | '活泼'   // 开朗型，喜欢被关注
  | '文静'   // 安静型，喜欢安静陪伴
  | '傲娇'   // 口是心非型
  | '神秘'   // 难以捉摸型
  | '成熟'   // 稳重可靠型
  | '天真'   // 纯真型

/**
 * 角色关系状态
 */
export type RelationshipStatus = '陌生' | '初见' | '相识' | '相知' | '情感顶点'

/**
 * 好感度阶段划分
 */
export interface AffinityThreshold {
  /** 阶段名称 */
  name: RelationshipStatus
  /** 所需好感度最小值 */
  value: number
}

/** 默认好感度阶段划分 */
export const DEFAULT_AFFINITY_THRESHOLDS: AffinityThreshold[] = [
  { name: '陌生', value: 0 },
  { name: '初见', value: 21 },
  { name: '相识', value: 41 },
  { name: '相知', value: 61 },
  { name: '情感顶点', value: 81 },
]

/**
 * 角色定义配置
 */
export interface CharacterConfig {
  /** 唯一标识 ID（英文字符） */
  id: string
  /** 角色名 */
  name: string
  /** 姓氏（可选） */
  surname?: string
  /** 年龄 */
  age?: number
  /** 性别 */
  gender: CharacterGender
  /** 性格 */
  personality: CharacterPersonality
  /** 角色主色调 */
  color: string
  /** 角色头像路径 */
  icon: string
  /** 角色简介 */
  description: string
  /** 生日（MM-DD 格式） */
  birthday?: string
  /** 身高（cm） */
  height?: number
  /** 喜好 */
  likes?: string[]
  /** 厌恶 */
  dislikes?: string[]
  /** 特殊事件触发条件 */
  specialEvents?: {
    /** 事件名 */
    name: string
    /** 触发最低好感度 */
    requireAffinity: number
    /** 触发场景标签 */
    labelId: string
  }[]
}

/**
 * 角色运行时数据（游戏内可变状态）
 */
export interface CharacterState {
  /** 角色 ID */
  characterId: string
  /** 当前好感度 */
  affinity: number
  /** 当前关系阶段 */
  status: RelationshipStatus
  /** 是否已解锁 */
  isUnlocked: boolean
  /** 已触发的事件列表 */
  triggeredEvents: string[]
  /** 已发送的手机消息数 */
  chatCount: number
  /** 当前正在进行的特殊事件 */
  activeEvent?: string
}

/**
 * 角色数据库（管理所有角色定义和运行时状态）
 */
class CharacterDatabase {
  private characters: Map<string, CharacterConfig> = new Map()

  /**
   * 注册一个角色到 Pixi'VN 引擎和本地数据库
   */
  registerCharacter(config: CharacterConfig): CharacterBaseModel {
    if (this.characters.has(config.id)) {
      console.warn(`[CharacterDB] 角色 ${config.id} 已存在，覆盖注册`)
    }

    // 注册到 Pixi'VN
    const model = new CharacterBaseModel(config.id, {
      name: config.name,
      surname: config.surname,
      age: config.age,
      icon: config.icon,       // 开发阶段用占位图
      color: config.color,
    })
    RegisteredCharacters.add(model)

    // 注册到本地数据库
    this.characters.set(config.id, config)
    console.log(`[CharacterDB] 角色已注册: ${config.name} (${config.id})`)

    return model
  }

  /**
   * 批量注册角色
   */
  registerCharacters(configs: CharacterConfig[]): void {
    configs.forEach((config) => this.registerCharacter(config))
  }

  /**
   * 获取角色配置
   */
  getConfig(characterId: string): CharacterConfig | undefined {
    return this.characters.get(characterId)
  }

  /**
   * 获取所有角色配置
   */
  getAllConfigs(): CharacterConfig[] {
    return Array.from(this.characters.values())
  }

  /**
   * 获取已解锁的角色列表
   */
  getUnlockedCharacters(states: Map<string, CharacterState>): CharacterConfig[] {
    return this.getAllConfigs().filter((c) => {
      const state = states.get(c.id)
      return state?.isUnlocked ?? false
    })
  }

  /**
   * 获取所有角色 ID
   */
  getAllCharacterIds(): string[] {
    return Array.from(this.characters.keys())
  }

  /**
   * 根据性格筛选角色
   */
  getCharactersByPersonality(personality: CharacterPersonality): CharacterConfig[] {
    return this.getAllConfigs().filter((c) => c.personality === personality)
  }

  /**
   * 检查角色是否存在
   */
  hasCharacter(characterId: string): boolean {
    return this.characters.has(characterId)
  }
}

/** 全局角色数据库单例 */
export const characterDB = new CharacterDatabase()
export default characterDB
