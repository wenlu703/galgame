/**
 * ============================================================
 * CharacterView — 角色立绘展示组件
 *
 * 在剧情对话时，在画面中展示角色立绘（半身像），
 * 支持表情切换、淡入淡出动效、左右站位。
 * ============================================================
 */
import { useState, useEffect, type CSSProperties } from 'react'
import { Box } from '@mui/joy'
import useGameStore from '@/stores/gameStore'

/** 立绘位置映射 */
type CharacterPosition = 'left' | 'center' | 'right'

/** 立绘配置 */
interface CharacterSprite {
  id: string
  emotion: string
  position: CharacterPosition
  visible: boolean
}

/** 立绘处于不同位置时的偏移 */
const positionOffset: Record<CharacterPosition, number> = {
  left: 10,
  center: 50,
  right: 90,
}

/** 立绘容器样式（半个屏幕高度，底部对齐） */
const containerStyle: CSSProperties = {
  position: 'absolute',
  bottom: 200,
  left: 0,
  right: 0,
  height: '60%',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'flex-end',
  pointerEvents: 'none',
  zIndex: 5,
}

/** 单个立绘样式 */
const spriteStyle = (position: CharacterPosition, visible: boolean): CSSProperties => ({
  position: 'absolute',
  bottom: 0,
  left: `${positionOffset[position]}%`,
  transform: 'translateX(-50%)',
  height: '90%',
  maxHeight: 600,
  opacity: visible ? 1 : 0,
  transition: 'opacity 0.5s ease, transform 0.5s ease',
  transformOrigin: 'bottom center',
  pointerEvents: 'none',
})

export default function CharacterView() {
  const currentDialogue = useGameStore((s: { currentDialogue: { speaker: string; emotion?: string } | null }) => s.currentDialogue)
  const [sprites, setSprites] = useState<CharacterSprite[]>([])

  // 根据对话内容更新立绘
  useEffect(() => {
    if (!currentDialogue?.speaker) {
      // 旁白时逐渐隐藏立绘
      setSprites((prev) =>
        prev.map((s) => ({ ...s, visible: false }))
      )
      return
    }

    // 检查当前说话的角色是否有立绘
    const speakerId = currentDialogue.speaker
    const emotion = currentDialogue.emotion || 'default'

    setSprites((prev) => {
      // 如果该角色已在画面中，更新表情
      const existing = prev.find((s) => s.id === speakerId)
      if (existing) {
        return prev.map((s) =>
          s.id === speakerId
            ? { ...s, emotion, visible: true }
            : s
        )
      }

      // 新角色从左侧或右侧出现
      const existingCount = prev.filter((s) => s.visible).length
      const position: CharacterPosition = existingCount === 0 ? 'center' : existingCount === 1 ? 'left' : 'right'

      return [
        ...prev.map((s) => ({ ...s, visible: s.visible })),
        { id: speakerId, emotion, position, visible: true },
      ]
    })
  }, [currentDialogue])

  if (sprites.length === 0) return null

  return (
    <Box style={containerStyle}>
      {sprites.map((sprite) => (
        <Box
          key={sprite.id}
          style={spriteStyle(sprite.position, sprite.visible)}
          data-character={sprite.id}
          data-emotion={sprite.emotion}
        >
          {/* 占位立绘 */}
          <div
            style={{
              width: 200,
              height: 400,
              background: `linear-gradient(180deg, rgba(200,150,200,0.2) 0%, rgba(100,80,120,0.3) 100%)`,
              borderRadius: 8,
              border: '1px solid rgba(255,255,255,0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'rgba(255,255,255,0.3)',
              fontSize: 14,
              fontFamily: '"Noto Sans SC", sans-serif',
            }}
          >
            {sprite.id} · {sprite.emotion}
          </div>
        </Box>
      ))}
    </Box>
  )
}
