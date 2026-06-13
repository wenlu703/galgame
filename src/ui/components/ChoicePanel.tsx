/**
 * ============================================================
 * ChoicePanel — 选项面板组件
 *
 * 当剧情达到分支点时显示多个选项供玩家选择。
 * 支持条件选项（灰色不可用）、选择动画、鼠标悬停效果。
 * ============================================================
 */
import { useCallback, type CSSProperties } from 'react'
import { Box, Button, Typography } from '@mui/joy'
import useGameStore, { type ChoiceData } from '@/stores/gameStore'

/** 选项面板容器样式 */
const panelStyle: CSSProperties = {
  position: 'absolute',
  bottom: 200,
  left: '50%',
  transform: 'translateX(-50%)',
  width: '70%',
  maxWidth: 800,
  display: 'flex',
  flexDirection: 'column',
  gap: 12,
  zIndex: 100,
}

/** 基础选项按钮样式 */
const btnBase: CSSProperties = {
  width: '100%',
  padding: '16px 24px',
  fontSize: 17,
  fontWeight: 500,
  textAlign: 'center',
  color: '#fff',
  background: 'linear-gradient(135deg, rgba(60,60,80,0.9) 0%, rgba(40,40,60,0.9) 100%)',
  border: '1px solid rgba(255,255,255,0.15)',
  borderRadius: 12,
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  backdropFilter: 'blur(8px)',
  fontFamily: '"Noto Sans SC", "Microsoft YaHei", sans-serif',
}

export default function ChoicePanel() {
  const currentChoices = useGameStore((s: { currentChoices: ChoiceData[] }) => s.currentChoices)
  const waitingForChoice = useGameStore((s: { waitingForChoice: boolean }) => s.waitingForChoice)

  const handleChoice = useCallback((index: number) => {
    const cb = (window as unknown as Record<string, unknown>).__chooseCallback__ as
      | ((index: number) => void)
      | undefined
    if (cb) {
      cb(index)
    }
    useGameStore.getState().hideChoices()
  }, [])

  if (!waitingForChoice || currentChoices.length === 0) return null

  return (
    <Box style={panelStyle}>
      <Typography
        level="body-sm"
        sx={{
          color: 'rgba(255,255,255,0.5)',
          textAlign: 'center',
          mb: 1,
          fontSize: 14,
          letterSpacing: 2,
        }}
      >
        —— 请选择 ——
      </Typography>

      {currentChoices.map((choice: ChoiceData, index: number) => {
        const isDisabled = choice.condition === 'false'
        const delay = 0.4 + index * 0.1

        return (
          <Button
            key={index}
            disabled={isDisabled}
            onClick={() => handleChoice(index)}
            style={{
              ...btnBase,
              opacity: isDisabled ? 0.4 : 1,
              animation: `slideUpFade ${delay}s ease-out both`,
            }}
            sx={{
              '&:hover:not(:disabled)': {
                background: 'linear-gradient(135deg, rgba(100,100,160,0.95) 0%, rgba(60,60,100,0.95) 100%)',
                borderColor: 'rgba(200,180,255,0.5)',
                transform: 'scale(1.02)',
              },
              '&:disabled': {
                cursor: 'not-allowed',
              },
            }}
          >
            {choice.text}
          </Button>
        )
      })}

      {/* 滑入动画注入 */}
      <style>{`
        @keyframes slideUpFade {
          from { opacity: 0; transform: translateY(30px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </Box>
  )
}
