/**
 * ============================================================
 * gameStore — 游戏主状态管理 (Zustand)
 *
 * 管理游戏全局状态：当前场景、对话、菜单状态等。
 * 与 Pixi'VN 引擎状态同步，供 React UI 层消费。
 * ============================================================
 */
import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'

/** 当前游戏画面模式 */
export type GameScreen =
  | '标题画面'       // TitleScreen
  | '剧情模式'       // 正常剧情推进
  | '菜单'           // 游戏内菜单
  | '手机聊天'       // Phone Chat
  | '藏品鉴赏'       // Gallery
  | '角色状态'       // Character Status
  | '能力培养'       // Training
  | '设置'           // Settings
  | '存档'           // Save/Load Screen
  | '结局'           // Ending Screen

/** 对话气泡数据 */
export interface DialogueLine {
  /** 说话角色（空字符串表示旁白） */
  speaker: string
  /** 对话文本 */
  text: string
  /** 表情标识 */
  emotion?: string
}

/** 选项数据 */
export interface ChoiceData {
  /** 选项文字 */
  text: string
  /** 选择后跳转的标签 */
  targetLabel: string
  /** 此选项可用的条件（为空字符串表示无条件） */
  condition?: string
}

/** 游戏运行状态 */
export type GamePlayState = 'idle' | 'playing' | 'paused' | 'ended'

/** 游戏主状态 */
interface GameState {
  /* ---------- 全局状态 ---------- */
  /** 当前画面模式 */
  currentScreen: GameScreen
  /** 上一个画面（用于返回） */
  previousScreen: GameScreen | null
  /** 游戏运行状态 */
  playState: GamePlayState
  /** 是否正在加载 */
  isLoading: boolean
  /** 引擎是否已初始化 */
  engineReady: boolean

  /* ---------- 剧情状态 ---------- */
  /** 当前对话行 */
  currentDialogue: DialogueLine | null
  /** 对话历史 */
  dialogueHistory: DialogueLine[]
  /** 当前可选项 */
  currentChoices: ChoiceData[]
  /** 是否正在等待玩家选择 */
  waitingForChoice: boolean
  /** 打字机动画是否完成 */
  textRevealComplete: boolean

  /* ---------- 游戏元数据 ---------- */
  /** 当前场景名 */
  currentSceneName: string
  /** 游戏总时长（秒） */
  totalPlayTime: number
  /** 总步数 */
  totalSteps: number
  /** 是否显示设置面板 */
  showSettings: boolean
  /** 是否显示存档面板 */
  showSaveLoad: boolean
}

/** 游戏主操作 */
interface GameActions {
  /* ---------- 画面切换 ---------- */
  setScreen: (screen: GameScreen) => void
  goBackToPrevious: () => void

  /* ---------- 引擎状态 ---------- */
  setEngineReady: (ready: boolean) => void
  setPlayState: (state: GamePlayState) => void
  setLoading: (loading: boolean) => void

  /* ---------- 剧情操作 ---------- */
  showDialogue: (speaker: string, text: string, emotion?: string) => void
  showChoices: (choices: ChoiceData[]) => void
  hideChoices: () => void
  clearDialogue: () => void
  advanceDialogue: () => DialogueLine | undefined
  setTextRevealComplete: (complete: boolean) => void

  /* ---------- 游戏元数据 ---------- */
  setSceneName: (name: string) => void
  incrementStep: () => void
  tickPlayTime: () => void
  toggleSettings: () => void
  toggleSaveLoad: () => void
  resetGameState: () => void
}

/** 初始状态 */
const initialState: GameState = {
  currentScreen: '标题画面',
  previousScreen: null,
  playState: 'idle',
  isLoading: true,
  engineReady: false,

  currentDialogue: null,
  dialogueHistory: [],
  currentChoices: [],
  waitingForChoice: false,
  textRevealComplete: false,

  currentSceneName: '',
  totalPlayTime: 0,
  totalSteps: 0,
  showSettings: false,
  showSaveLoad: false,
}

/** 创建游戏主 store */
export const useGameStore = create<GameState & GameActions>()(
  immer((set, get) => ({
    /* ---------- 初始状态 ---------- */
    ...initialState,

    /* ---------- 画面切换 ---------- */
    setScreen: (screen) =>
      set((state) => {
        state.previousScreen = state.currentScreen
        state.currentScreen = screen
      }),

    goBackToPrevious: () =>
      set((state) => {
        if (state.previousScreen) {
          const prev = state.previousScreen
          state.previousScreen = state.currentScreen
          state.currentScreen = prev
        }
      }),

    /* ---------- 引擎状态 ---------- */
    setEngineReady: (ready) =>
      set((state) => {
        state.engineReady = ready
        if (ready) state.isLoading = false
      }),

    setPlayState: (playState) =>
      set((state) => {
        state.playState = playState
      }),

    setLoading: (loading) =>
      set((state) => {
        state.isLoading = loading
      }),

    /* ---------- 剧情操作 ---------- */
    showDialogue: (speaker, text, emotion) =>
      set((state) => {
        const line: DialogueLine = { speaker, text, emotion }
        state.currentDialogue = line
        state.dialogueHistory.push(line)
        state.textRevealComplete = false
        state.waitingForChoice = false
        state.currentChoices = []
      }),

    showChoices: (choices) =>
      set((state) => {
        state.currentChoices = choices
        state.waitingForChoice = true
        state.currentDialogue = null
      }),

    hideChoices: () =>
      set((state) => {
        state.currentChoices = []
        state.waitingForChoice = false
      }),

    clearDialogue: () =>
      set((state) => {
        state.currentDialogue = null
        state.dialogueHistory = []
      }),

    advanceDialogue: () => {
      const { dialogueHistory, currentDialogue } = get()
      if (!currentDialogue) return undefined

      const history = [...dialogueHistory]
      // 从历史中取下一个
      const currentIndex = history.findIndex(
        (d) => d.text === currentDialogue.text && d.speaker === currentDialogue.speaker
      )
      const next = history[currentIndex + 1]

      if (next) {
        set((state) => {
          state.currentDialogue = next
          state.textRevealComplete = false
        })
      } else {
        set((state) => {
          state.currentDialogue = null
        })
      }

      return next
    },

    setTextRevealComplete: (complete) =>
      set((state) => {
        state.textRevealComplete = complete
      }),

    /* ---------- 游戏元数据 ---------- */
    setSceneName: (name) =>
      set((state) => {
        state.currentSceneName = name
      }),

    incrementStep: () =>
      set((state) => {
        state.totalSteps++
      }),

    tickPlayTime: () =>
      set((state) => {
        state.totalPlayTime++
      }),

    toggleSettings: () =>
      set((state) => {
        state.showSettings = !state.showSettings
      }),

    toggleSaveLoad: () =>
      set((state) => {
        state.showSaveLoad = !state.showSaveLoad
      }),

    resetGameState: () =>
      set(() => ({
        ...initialState,
        engineReady: get().engineReady,
      })),
  }))
)

export default useGameStore
