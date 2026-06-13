/**
 * ============================================================
 * settingsStore — 游戏设置状态管理 (Zustand + Immer)
 *
 * 管理所有可持久化的游戏设置项：
 *  - 音量（BGM / SE / 语音 三轨独立）
 *  - 文字速度
 *  - 自动模式延迟
 *  - 全屏、语言等
 *
 * 设置变化自动写入 localStorage，启动时自动恢复。
 * ============================================================
 */
import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'

/* ---------- 类型定义 ---------- */

export interface SettingsState {
  /** BGM 音量 0~1 */
  bgmVolume: number
  /** 音效音量 0~1 */
  seVolume: number
  /** 语音音量 0~1 */
  voiceVolume: number
  /** 文字显示速度（ms/字） */
  textSpeed: number
  /** 自动模式延迟（ms） */
  autoDelay: number
  /** 是否全屏 */
  fullscreen: boolean
  /** 界面语言 */
  language: 'zh-CN' | 'en' | 'ja'
  /** 是否显示角色名称签 */
  showSpeakerLabel: boolean
  /** 是否已初始化 */
  _hydrated: boolean
}

export interface SettingsActions {
  /** 设置 BGM 音量 */
  setBgmVolume: (v: number) => void
  /** 设置音效音量 */
  setSeVolume: (v: number) => void
  /** 设置语音音量 */
  setVoiceVolume: (v: number) => void
  /** 设置文字速度 */
  setTextSpeed: (v: number) => void
  /** 设置自动延迟 */
  setAutoDelay: (v: number) => void
  /** 切换全屏 */
  toggleFullscreen: () => void
  /** 设置语言 */
  setLanguage: (lang: SettingsState['language']) => void
  /** 切换角色名称签显示 */
  toggleSpeakerLabel: () => void
  /** 重置所有设置为默认值 */
  resetSettings: () => void
}

/** 默认设置值 */
const DEFAULT_SETTINGS: SettingsState = {
  bgmVolume: 0.7,
  seVolume: 0.8,
  voiceVolume: 1.0,
  textSpeed: 40,
  autoDelay: 3000,
  fullscreen: false,
  language: 'zh-CN',
  showSpeakerLabel: true,
  _hydrated: false,
}

/** localStorage 存储键名 */
const STORAGE_KEY = 'galgame_settings'

/** 从 localStorage 加载设置 */
function loadSettings(): Partial<SettingsState> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw)
    // 只取已知字段，过滤掉 _hydrated
    const { _hydrated, ...rest } = parsed
    return rest as Partial<SettingsState>
  } catch {
    return {}
  }
}

/** 保存设置到 localStorage（防抖由外部控制） */
export function persistSettings(state: SettingsState): void {
  try {
    const { _hydrated, ...saveable } = state
    localStorage.setItem(STORAGE_KEY, JSON.stringify(saveable))
  } catch (e) {
    console.warn('[Settings] 持久化设置失败:', e)
  }
}

/** 创建 settings store */
export const useSettingsStore = create<SettingsState & SettingsActions>()(
  immer((set, get) => {
    // 从 localStorage 恢复
    const saved = loadSettings()

    return {
      ...DEFAULT_SETTINGS,
      ...saved,
      _hydrated: true,

      /* ---------- Actions ---------- */

      setBgmVolume: (v) =>
        set((state) => {
          state.bgmVolume = Math.max(0, Math.min(1, v))
          persistSettings(state)
        }),

      setSeVolume: (v) =>
        set((state) => {
          state.seVolume = Math.max(0, Math.min(1, v))
          persistSettings(state)
        }),

      setVoiceVolume: (v) =>
        set((state) => {
          state.voiceVolume = Math.max(0, Math.min(1, v))
          persistSettings(state)
        }),

      setTextSpeed: (v) =>
        set((state) => {
          state.textSpeed = Math.max(10, Math.min(200, v))
          persistSettings(state)
        }),

      setAutoDelay: (v) =>
        set((state) => {
          state.autoDelay = Math.max(500, Math.min(10000, v))
          persistSettings(state)
        }),

      toggleFullscreen: () =>
        set((state) => {
          state.fullscreen = !state.fullscreen
          persistSettings(state)
        }),

      setLanguage: (lang) =>
        set((state) => {
          state.language = lang
          persistSettings(state)
        }),

      toggleSpeakerLabel: () =>
        set((state) => {
          state.showSpeakerLabel = !state.showSpeakerLabel
          persistSettings(state)
        }),

      resetSettings: () =>
        set((state) => {
          Object.assign(state, DEFAULT_SETTINGS)
          state._hydrated = true
          persistSettings(state)
        }),
    }
  })
)

export default useSettingsStore
