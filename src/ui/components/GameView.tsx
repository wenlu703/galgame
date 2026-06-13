/**
 * ============================================================
 * GameView — 游戏主画面（剧情模式）
 *
 * 组合了 PixiJS 画布层和 React UI 覆盖层：
 *  - 背景层：PixiVN 画布
 *  - 角色层：CharacterView 立绘
 *  - UI层：DialogBox / ChoicePanel / 系统菜单
 *  - 菜单层：SaveLoad / Settings（通过 Store 控制显示）
 * ============================================================
 */
import { useEffect, useRef } from 'react'
import { Box, CircularProgress } from '@mui/joy'
import engine from '@/core/GameEngine'
import DialogBox from '@/ui/components/DialogBox'
import ChoicePanel from '@/ui/components/ChoicePanel'
import CharacterView from '@/ui/components/CharacterView'
import useGameStore from '@/stores/gameStore'

/** 游戏画面容器样式 */
const gameViewStyle = {
  position: 'fixed' as const,
  inset: 0,
  overflow: 'hidden',
  backgroundColor: '#000',
}

/** PixiJS 画布容器样式（占满全屏） */
const canvasContainerStyle = {
  position: 'absolute' as const,
  inset: 0,
  zIndex: 1,
}

/** UI 覆盖层样式（在画布上方） */
const uiOverlayStyle = {
  position: 'absolute' as const,
  inset: 0,
  zIndex: 10,
}

/** 系统菜单栏（右上角） */
const menuBarStyle = {
  position: 'absolute' as const,
  top: 16,
  right: 16,
  zIndex: 50,
  display: 'flex',
  gap: 8,
}

/** 菜单按钮 */
const menuBtnStyle = {
  width: 40,
  height: 40,
  borderRadius: 8,
  backgroundColor: 'rgba(0,0,0,0.4)',
  border: '1px solid rgba(255,255,255,0.1)',
  color: '#fff',
  fontSize: 20,
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backdropFilter: 'blur(4px)',
  transition: 'all 0.2s',
}

export default function GameView() {
  const canvasRef = useRef<HTMLDivElement>(null)
  const engineReady = useGameStore((s: { engineReady: boolean }) => s.engineReady)
  const setEngineReady = useGameStore((s: { setEngineReady: (v: boolean) => void }) => s.setEngineReady)
  const toggleSettings = useGameStore((s: { toggleSettings: () => void }) => s.toggleSettings)
  const toggleSaveLoad = useGameStore((s: { toggleSaveLoad: () => void }) => s.toggleSaveLoad)
  const setScreen = useGameStore((s: { setScreen: (v: import('@/stores/gameStore').GameScreen) => void }) => s.setScreen)

  // 初始化 PixiVN 引擎
  useEffect(() => {
    if (!canvasRef.current || engineReady) return

    const initEngine = async () => {
      try {
        await engine.init(canvasRef.current!, {
          width: 1920,
          height: 1080,
          backgroundColor: '#1a1a2e',
          onNavigate: (path: string) => {
            console.log('[导航] 路径:', path)
          },
          onGameStart: () => {
            console.log('[导航] 游戏开始')
          },
        })
        setEngineReady(true)
        console.log('[GameView] 引擎初始化完成')
      } catch (error) {
        console.error('[GameView] 引擎初始化失败:', error)
      }
    }

    initEngine()

    return () => {
      // 清理
    }
  }, [engineReady, setEngineReady])

  // 返回标题画面
  const handleBackToTitle = () => {
    engine.resetGame()
    setScreen('标题画面')
  }

  return (
    <Box sx={gameViewStyle}>
      {/* PixiJS 画布层 */}
      <Box ref={canvasRef} sx={canvasContainerStyle} />

      {/* 加载中指示器 */}
      {!engineReady && (
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#1a1a2e',
            zIndex: 100,
          }}
        >
          <CircularProgress size="lg" />
        </Box>
      )}

      {/* UI 覆盖层 */}
      <Box sx={uiOverlayStyle}>
        {/* 立绘 */}
        <CharacterView />

        {/* 选项面板 */}
        <ChoicePanel />

        {/* 对话框 */}
        <DialogBox />

        {/* 系统菜单栏 */}
        <Box sx={menuBarStyle}>
          {/* 存档 */}
          <Box
            component="button"
            sx={menuBtnStyle}
            onClick={toggleSaveLoad}
            title="存档/读档"
          >
            💾
          </Box>
          {/* 设置 */}
          <Box
            component="button"
            sx={menuBtnStyle}
            onClick={toggleSettings}
            title="设置"
          >
            ⚙️
          </Box>
          {/* 返回标题 */}
          <Box
            component="button"
            sx={menuBtnStyle}
            onClick={handleBackToTitle}
            title="返回标题画面"
          >
            🏠
          </Box>
        </Box>
      </Box>
    </Box>
  )
}
