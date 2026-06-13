/**
 * ============================================================
 * GameEngine — Pixi'VN 游戏引擎初始化与管理
 *
 * 职责：
 *  - 初始化 PixiJS 画布和 Pixi'VN 引擎
 *  - 管理游戏生命周期（开始、结束、重置）
 *  - 注册全局导航和错误处理
 * ============================================================
 */
import { Game } from '@drincs/pixi-vn'

/** 引擎配置选项 */
export interface EngineOptions {
  /** 画布宽度（像素） */
  width?: number
  /** 画布高度（像素） */
  height?: number
  /** 背景色 */
  backgroundColor?: string
  /** 导航回调：当剧情需要切换场景时调用 */
  onNavigate?: (path: string) => void
  /** 游戏结束回调 */
  onGameEnd?: () => void
  /** 游戏开始回调 */
  onGameStart?: () => void
}

/** 默认引擎配置 */
const DEFAULT_OPTIONS: Required<EngineOptions> = {
  width: 1920,
  height: 1080,
  backgroundColor: '#1a1a2e',
  onNavigate: () => {},
  onGameEnd: () => {},
  onGameStart: () => {},
}

/**
 * 引擎管理器（单例）
 */
class GameEngine {
  private static instance: GameEngine
  private options: Required<EngineOptions>
  private _initialized = false

  private constructor() {
    this.options = { ...DEFAULT_OPTIONS }
  }

  /** 获取引擎单例 */
  static getInstance(): GameEngine {
    if (!GameEngine.instance) {
      GameEngine.instance = new GameEngine()
    }
    return GameEngine.instance
  }

  /** 引擎是否已初始化 */
  get initialized(): boolean {
    return this._initialized
  }

  /**
   * 初始化 Pixi'VN 引擎
   * @param container 挂载画布的 DOM 元素
   * @param opts 配置选项
   */
  async init(container: HTMLElement, opts?: EngineOptions): Promise<void> {
    if (this._initialized) {
      console.warn('[GameEngine] 引擎已经初始化，跳过')
      return
    }

    this.options = { ...DEFAULT_OPTIONS, ...opts }
    const { width, height, backgroundColor, onNavigate, onGameEnd } = this.options

    // 注册导航处理
    Game.onNavigate(async (path: string) => {
      onNavigate(path)
    })

    // 注册游戏结束处理
    Game.onEnd(async () => {
      onGameEnd()
    })

    // 注册错误处理
    Game.addOnError((error) => {
      console.error('[GameEngine] 运行时错误:', error)
    })

    try {
      await Game.init(container, {
        width,
        height,
        backgroundColor,
      })
      this._initialized = true
      console.log('[GameEngine] 引擎初始化完成')
    } catch (error) {
      console.error('[GameEngine] 初始化失败:', error)
      throw error
    }
  }

  /**
   * 开始新游戏
   * @param labelId 起始标签 ID
   */
  async startNewGame(labelId = 'start'): Promise<void> {
    if (!this._initialized) {
      throw new Error('[GameEngine] 引擎尚未初始化')
    }

    try {
      Game.clear()
      await Game.start(labelId, {} as Parameters<typeof Game.start>[1])
      this.options.onGameStart()
      console.log(`[GameEngine] 新游戏开始，起始标签: ${labelId}`)
    } catch (error) {
      console.error('[GameEngine] 开始游戏失败:', error)
      throw error
    }
  }

  /**
   * 导出游戏状态（用于存档）
   */
  exportSaveData(): string {
    if (!this._initialized) return ''
    try {
      const state = Game.exportGameState()
      return JSON.stringify(state)
    } catch (error) {
      console.error('[GameEngine] 导出存档失败:', error)
      return ''
    }
  }

  /**
   * 导入游戏状态（用于读档）
   * @param json 存档 JSON 字符串
   */
  async loadSaveData(json: string): Promise<boolean> {
    if (!this._initialized) return false
    try {
      const state = JSON.parse(json)
      await Game.restoreGameState(state)
      console.log('[GameEngine] 读档成功')
      return true
    } catch (error) {
      console.error('[GameEngine] 读档失败:', error)
      return false
    }
  }

  /**
   * 重置游戏数据
   */
  resetGame(): void {
    if (!this._initialized) return
    Game.clear()
    console.log('[GameEngine] 游戏数据已重置')
  }

  /**
   * 获取画布容器大小（用于响应式）
   */
  getCanvasSize(): { width: number; height: number } {
    return {
      width: this.options.width,
      height: this.options.height,
    }
  }
}

/** 导出引擎单例 */
export const engine = GameEngine.getInstance()
export default engine
