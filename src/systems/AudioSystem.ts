/**
 * ============================================================
 * AudioSystem — 音频管理器 (Howler.js)
 *
 * 集中管理游戏中的所有音频播放：
 *  - BGM（背景音乐，自动循环、淡入淡出）
 *  - SE（音效，一次性播放）
 *  - Voice（角色语音，互斥）
 *
 * 音量设置与 settingsStore 同步。
 * 所有音频资源路径通过配置注入，开发阶段使用占位。
 * ============================================================
 */
import { Howl, type HowlOptions } from 'howler'
import { useSettingsStore } from '@/stores/settingsStore'

/** 音频资源映射类型 */
export interface AudioAssets {
  bgm: Record<string, string>
  se: Record<string, string>
  voice: Record<string, string>
}

/** 默认空资源映射（开发阶段用） */
const EMPTY_ASSETS: AudioAssets = {
  bgm: {},
  se: {},
  voice: {},
}

class AudioSystemClass {
  private howls: Map<string, Howl> = new Map()
  private currentBgmId: string | null = null
  private currentBgmHowl: Howl | null = null
  private assets: AudioAssets = EMPTY_ASSETS
  private _initialized = false

  /**
   * 初始化音频系统，注入资源映射
   */
  init(assets: AudioAssets = EMPTY_ASSETS): void {
    this.assets = assets
    this._initialized = true
    console.log('[AudioSystem] 初始化完成')
  }

  get initialized(): boolean {
    return this._initialized
  }

  /* ---------- 资源管理 ---------- */

  /**
   * 注册音频资源（可在运行时动态添加）
   */
  registerAssets(assets: Partial<AudioAssets>): void {
    if (assets.bgm) Object.assign(this.assets.bgm, assets.bgm)
    if (assets.se) Object.assign(this.assets.se, assets.se)
    if (assets.voice) Object.assign(this.assets.voice, assets.voice)
  }

  private getHowl(key: string, category: 'bgm' | 'se' | 'voice'): Howl | null {
    // 先检查是否已加载
    const cacheKey = `${category}:${key}`
    const cached = this.howls.get(cacheKey)
    if (cached) return cached

    // 查找资源路径
    const src = this.assets[category]?.[key]
    if (!src) {
      // 开发阶段：没有资源文件时返回 null，不报错
      if (import.meta.env.DEV) return null
      console.warn(`[AudioSystem] 未找到音频资源: ${category}:${key}`)
      return null
    }

    const options: HowlOptions = {
      src: [src],
      volume: category === 'bgm'
        ? useSettingsStore.getState().bgmVolume
        : category === 'se'
          ? useSettingsStore.getState().seVolume
          : useSettingsStore.getState().voiceVolume,
    }

    if (category === 'bgm') {
      options.loop = true
    }

    try {
      const howl = new Howl(options)
      this.howls.set(cacheKey, howl)
      return howl
    } catch {
      console.warn(`[AudioSystem] 加载音频失败: ${cacheKey}`)
      return null
    }
  }

  /* ---------- BGM 控制 ---------- */

  /**
   * 播放 BGM
   * @param key BGM 标识符
   * @param fadeIn 淡入时间（ms，默认 1000）
   */
  playBgm(key: string, fadeIn: number = 1000): void {
    const howl = this.getHowl(key, 'bgm')
    if (!howl) return

    // 停止当前 BGM
    this.stopBgm()

    howl.play()
    howl.fade(0, useSettingsStore.getState().bgmVolume, fadeIn)
    this.currentBgmId = key
    this.currentBgmHowl = howl
  }

  /**
   * 停止当前 BGM
   * @param fadeOut 淡出时间（ms，默认 500）
   */
  stopBgm(fadeOut: number = 500): void {
    if (this.currentBgmHowl) {
      this.currentBgmHowl.fade(
        useSettingsStore.getState().bgmVolume,
        0,
        fadeOut
      )
      setTimeout(() => {
        this.currentBgmHowl?.stop()
      }, fadeOut)
    }
    this.currentBgmId = null
    this.currentBgmHowl = null
  }

  /**
   * 切换 BGM（自动淡出当前 + 淡入新）
   */
  switchBgm(key: string, fadeOut: number = 500, fadeIn: number = 1000): void {
    if (this.currentBgmHowl) {
      this.currentBgmHowl.fade(
        useSettingsStore.getState().bgmVolume,
        0,
        fadeOut
      )
      setTimeout(() => {
        this.currentBgmHowl?.stop()
        this.playBgm(key, fadeIn)
      }, fadeOut)
    } else {
      this.playBgm(key, fadeIn)
    }
  }

  /** 获取当前 BGM ID */
  getCurrentBgm(): string | null {
    return this.currentBgmId
  }

  /* ---------- SE 控制 ---------- */

  /**
   * 播放音效
   * @param key 音效标识符
   * @param volume 音量倍率（0~1，默认 1）
   */
  playSe(key: string, volume: number = 1): void {
    const howl = this.getHowl(key, 'se')
    if (!howl) return
    howl.volume(useSettingsStore.getState().seVolume * volume)
    howl.play()
  }

  /* ---------- 语音控制 ---------- */

  /**
   * 播放角色语音
   * 同一时间只允许一个语音播放
   */
  playVoice(key: string): void {
    const howl = this.getHowl(key, 'voice')
    if (!howl) return
    // 停止之前的语音
    this.stopVoice()
    howl.volume(useSettingsStore.getState().voiceVolume)
    howl.play()
  }

  stopVoice(): void {
    this.howls.forEach((howl, cacheKey) => {
      if (cacheKey.startsWith('voice:')) {
        howl.stop()
      }
    })
  }

  /* ---------- 音量同步 ---------- */

  /**
   * 同步所有音频的音量与设置一致
   * 在设置变化后调用
   */
  syncVolumes(): void {
    const { bgmVolume, seVolume, voiceVolume } = useSettingsStore.getState()

    this.howls.forEach((howl, cacheKey) => {
      if (cacheKey.startsWith('bgm:')) {
        howl.volume(bgmVolume)
      } else if (cacheKey.startsWith('se:')) {
        howl.volume(seVolume)
      } else if (cacheKey.startsWith('voice:')) {
        howl.volume(voiceVolume)
      }
    })
  }

  /* ---------- 清理 ---------- */

  /**
   * 释放所有音频资源
   */
  destroy(): void {
    this.howls.forEach((howl) => {
      howl.stop()
      howl.unload()
    })
    this.howls.clear()
    this.currentBgmId = null
    this.currentBgmHowl = null
    this._initialized = false
  }
}

/** 全局音频管理器单例 */
export const audioSystem = new AudioSystemClass()
export default audioSystem
