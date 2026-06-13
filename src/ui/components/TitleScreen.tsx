/**
 * ============================================================
 * TitleScreen — 游戏标题画面组件
 *
 * 全屏标题画面，包含：
 *  - 动态背景（粒子/星空效果）
 *  - 游戏标题
 *  - 新游戏 / 继续游戏 / 设置 按钮
 * ============================================================
 */
import { useState, type CSSProperties } from 'react'
import { Box, Typography, Button } from '@mui/joy'
import useGameStore from '@/stores/gameStore'

/** 全屏背景样式 */
const containerStyle: CSSProperties = {
  position: 'fixed',
  inset: 0,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
  zIndex: 1000,
  overflow: 'hidden',
}

/** 标题文字样式 */
const titleStyle: CSSProperties = {
  fontSize: 72,
  fontWeight: 700,
  color: '#fff',
  textShadow: '0 0 40px rgba(150,120,255,0.4), 0 4px 20px rgba(0,0,0,0.5)',
  letterSpacing: 8,
  fontFamily: '"Noto Sans SC", "Microsoft YaHei", sans-serif',
  marginBottom: 8,
}

/** 副标题 */
const subtitleStyle: CSSProperties = {
  fontSize: 18,
  color: 'rgba(255,255,255,0.5)',
  letterSpacing: 6,
  fontWeight: 300,
  marginBottom: 60,
  fontFamily: '"Noto Sans SC", sans-serif',
}

/** 菜单按钮通用样式 */
const menuButtonStyle = {
  width: 280,
  padding: '14px 0',
  fontSize: 18,
  fontWeight: 500,
  fontFamily: '"Noto Sans SC", "Microsoft YaHei", sans-serif',
  letterSpacing: 4,
  borderRadius: 8,
  transition: 'all 0.3s ease',
}

/** 版本信息样式 */
const versionStyle: CSSProperties = {
  position: 'absolute',
  bottom: 24,
  color: 'rgba(255,255,255,0.2)',
  fontSize: 13,
}

export default function TitleScreen() {
  const setScreen = useGameStore((s: { setScreen: (v: import('@/stores/gameStore').GameScreen) => void }) => s.setScreen)
  const setPlayState = useGameStore((s: { setPlayState: (v: import('@/stores/gameStore').GamePlayState) => void }) => s.setPlayState)
  const [hoveredBtn, setHoveredBtn] = useState<string | null>(null)

  const handleNewGame = async () => {
    // 转到剧情模式，并触发引擎开始游戏
    setPlayState('idle')
    setScreen('剧情模式')

    // 通知引擎开始新游戏（通过全局引用）
    const startGame = (window as unknown as Record<string, unknown>).__startNewGame__ as
      | (() => Promise<void>)
      | undefined
    if (startGame) {
      await startGame()
    }
  }

  const handleContinue = () => {
    setScreen('存档')
  }

  const handleSettings = () => {
    setScreen('设置')
  }

  return (
    <Box style={containerStyle}>
      {/* 装饰性光效 */}
      <Box
        sx={{
          position: 'absolute',
          top: '20%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: 600,
          height: 600,
          background:
            'radial-gradient(circle, rgba(150,120,255,0.08) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      {/* 标题 */}
      <Typography style={titleStyle}>
        星 空 协 奏 曲
      </Typography>
      <Typography style={subtitleStyle}>
        — Starlight Concerto —
      </Typography>

      {/* 菜单按钮 */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'center' }}>
        <Button
          size="lg"
          variant="solid"
          onClick={handleNewGame}
          onMouseEnter={() => setHoveredBtn('newgame')}
          onMouseLeave={() => setHoveredBtn(null)}
          sx={{
            ...menuButtonStyle,
            background:
              hoveredBtn === 'newgame'
                ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                : 'linear-gradient(135deg, rgba(102,126,234,0.8) 0%, rgba(118,75,162,0.8) 100%)',
            boxShadow:
              hoveredBtn === 'newgame'
                ? '0 8px 32px rgba(102,126,234,0.4)'
                : '0 4px 16px rgba(0,0,0,0.3)',
            '&:hover': {
              transform: 'scale(1.03)',
            },
          }}
        >
          开 始 新 游 戏
        </Button>

        <Button
          size="lg"
          variant="outlined"
          onClick={handleContinue}
          sx={{
            ...menuButtonStyle,
            color: 'rgba(255,255,255,0.7)',
            borderColor: 'rgba(255,255,255,0.2)',
            background: 'rgba(255,255,255,0.05)',
            '&:hover': {
              background: 'rgba(255,255,255,0.1)',
              borderColor: 'rgba(255,255,255,0.4)',
              transform: 'scale(1.02)',
            },
          }}
        >
          继 续 游 戏
        </Button>

        <Button
          size="lg"
          variant="plain"
          onClick={handleSettings}
          sx={{
            ...menuButtonStyle,
            color: 'rgba(255,255,255,0.4)',
            '&:hover': {
              color: 'rgba(255,255,255,0.7)',
              background: 'rgba(255,255,255,0.05)',
            },
          }}
        >
          设 置
        </Button>
      </Box>

      {/* 底部信息 */}
      <Typography style={versionStyle}>
        v0.1.0 · 开发中 · Powered by Pixi'VN
      </Typography>
    </Box>
  )
}
