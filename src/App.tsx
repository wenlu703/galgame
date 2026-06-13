/**
 * ============================================================
 * App.tsx — 根组件（画面路由）
 *
 * 根据 useGameStore 的 currentScreen 状态切换显示画面：
 *  - 标题画面 → TitleScreen
 *  - 剧情模式 → GameView (PixiJS + UI)
 *  - 其他画面 → （后续追加：手机聊天、藏品等）
 *
 * 同时也挂载全局的键盘快捷键处理。
 * ============================================================
 */
import { useEffect, useCallback } from 'react'
import TitleScreen from '@/ui/components/TitleScreen'
import GameView from '@/ui/components/GameView'
import SettingsScreen from '@/ui/settings/SettingsScreen'
import CharacterStatus from '@/ui/status/CharacterStatus'
import SaveLoadPanel from '@/ui/common/SaveLoadPanel'
import PhoneScreen from '@/ui/phone/PhoneScreen'
import GalleryScreen from '@/ui/gallery/GalleryScreen'
import EndingScreen from '@/ui/common/EndingScreen'
import useGameStore from '@/stores/gameStore'
import engine from '@/core/GameEngine'
import { useAffinityStore } from '@/stores/affinityStore'
import saveManager from '@/core/SaveManager'
import { registerAllEndings } from '@/data/endings'

/**
 * 注册全局引用，供 Pixi'VN 剧本引擎和游戏引擎通信
 */
function setupGlobalBridge(): void {
  // 注册结局配置
  registerAllEndings()

  // 新游戏：重置好感度数据，唤引擎启动
  ;(window as unknown as Record<string, unknown>).__startNewGame__ = async () => {
    const gameStore = useGameStore.getState()
    const affinityStore = useAffinityStore.getState()

    // 重置好感度
    affinityStore.resetAllAffinity()
    // 初始化角色状态
    affinityStore.initializeStates()
    // 重置游戏状态
    gameStore.resetGameState()
    gameStore.setPlayState('playing')

    // 启动 Pixi'VN 引擎从 'start' 标签开始
    try {
      await engine.startNewGame('start')
    } catch (error) {
      console.error('[全局] 开始游戏失败:', error)
    }
  }
}

export default function App() {
  const currentScreen = useGameStore((s: { currentScreen: string }) => s.currentScreen)

  // 初始化全局桥接
  useEffect(() => {
    setupGlobalBridge()
  }, [])

  // ---- 全局快捷键 ----
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const store = useGameStore.getState()

    switch (e.key) {
      case 'Escape':
        if (store.showSettings) {
          store.toggleSettings()
        } else if (store.showSaveLoad) {
          store.toggleSaveLoad()
        } else if (store.currentScreen === '剧情模式') {
          store.toggleSettings()
        }
        break

      case 'F5':
        // F5 快速存档
        e.preventDefault()
        if (store.currentScreen === '剧情模式') {
          saveManager.autoSave(
            store.currentSceneName || '快速存档',
            useAffinityStore.getState().exportAffinityData(),
            '',
            store.totalPlayTime
          ).then(() => {
            console.log('[快捷键] 已快速存档')
          }).catch((err) => {
            console.error('[快捷键] 快速存档失败:', err)
          })
        }
        break

      case 'F9':
        // F9 快速读档（读取自动存档槽位）
        e.preventDefault()
        if (store.currentScreen === '剧情模式') {
          saveManager.loadFromSlot(0).then((data) => {
            if (data?.affinityData) {
              useAffinityStore.getState().importAffinityData(data.affinityData)
            }
            console.log('[快捷键] 已快速读档')
          }).catch((err) => {
            console.error('[快捷键] 快速读档失败:', err)
          })
        }
        break

      case ' ':
        // 空格等价于点击继续（由 DialogBox 处理）
        e.preventDefault()
        break
    }
  }, [])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  // ---- 画面路由 ----
  return (
    <div className="game-area">
      {currentScreen === '标题画面' && <TitleScreen />}
      {currentScreen === '剧情模式' && <GameView />}
      {currentScreen === '设置' && <SettingsScreen />}
      {currentScreen === '存档' && <SaveLoadPanel />}
      {currentScreen === '角色状态' && <CharacterStatus />}
      {currentScreen === '手机聊天' && <PhoneScreen />}
      {currentScreen === '藏品鉴赏' && <GalleryScreen />}
      {currentScreen === '结局' && <EndingScreen />}
    </div>
  )
}
