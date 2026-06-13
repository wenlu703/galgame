/**
 * ============================================================
 * DialogBox — 游戏对话框组件
 *
 * 显示在屏幕底部，展示角色对话或旁白文本。
 * 支持打字机逐字显示效果、角色名标签、文字渐入动画。
 * ============================================================
 */
import { useEffect, useState, useRef, useCallback, type CSSProperties } from 'react'
import { Box, Typography } from '@mui/joy'
import useGameStore from '@/stores/gameStore'

/** 打字机速度（每字符毫秒数） */
const TYPE_SPEED_MS = 35

/** 淡入动画 */
const fadeIn = 'fadeIn'

  // 在组件内注入 keyframes
  useEffect(() => {
    const style = document.createElement('style')
    style.textContent = `@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }`
    document.head.appendChild(style)
    return () => { style.remove() }
  }, [])

/** 对话框样式 */
const dialogBoxStyle: CSSProperties = {
  position: 'absolute',
  bottom: 40,
  left: '50%',
  transform: 'translateX(-50%)',
  width: '80%',
  maxWidth: 1200,
  minHeight: 140,
  background: 'linear-gradient(180deg, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.85) 100%)',
  borderRadius: 16,
  border: '1px solid rgba(255,255,255,0.1)',
  padding: '20px 32px',
  cursor: 'pointer',
  userSelect: 'none',
  backdropFilter: 'blur(8px)',
  animation: `${fadeIn} 0.3s ease-out`,
  transition: 'opacity 0.2s',
}

/** 说话者名称标签样式 */
const speakerStyle = (color: string): CSSProperties => ({
  position: 'absolute',
  top: -16,
  left: 24,
  padding: '4px 16px',
  borderRadius: 8,
  backgroundColor: color,
  color: '#fff',
  fontSize: 14,
  fontWeight: 600,
  lineHeight: '24px',
  boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
})

/** 文本样式 */
const textStyle: CSSProperties = {
  color: '#f0f0f0',
  fontSize: 18,
  lineHeight: 1.8,
  minHeight: 60,
  marginTop: 12,
  textShadow: '0 1px 4px rgba(0,0,0,0.5)',
  fontFamily: '"Noto Sans SC", "Source Han Sans CN", "Microsoft YaHei", sans-serif',
}

/** 点击提示样式 */
const clickHintStyle: CSSProperties = {
  position: 'absolute',
  bottom: 12,
  right: 24,
  color: 'rgba(255,255,255,0.4)',
  fontSize: 13,
  animation: 'pulse 1.5s ease-in-out infinite',
}

export default function DialogBox() {
  const currentDialogue = useGameStore((s: { currentDialogue: { speaker: string; text: string; emotion?: string } | null }) => s.currentDialogue)
  const textRevealComplete = useGameStore((s: { textRevealComplete: boolean }) => s.textRevealComplete)
  const setTextRevealComplete = useGameStore((s: { setTextRevealComplete: (v: boolean) => void }) => s.setTextRevealComplete)

  const [displayText, setDisplayText] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // ---- 打字机效果 ----
  useEffect(() => {
    // 清除之前的定时器
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }

    if (!currentDialogue) {
      setDisplayText('')
      setIsTyping(false)
      return
    }

    const fullText = currentDialogue.text
    setIsTyping(true)
    setTextRevealComplete(false)

    let index = 0
    setDisplayText('')

    timerRef.current = setInterval(() => {
      index++
      if (index <= fullText.length) {
        setDisplayText(fullText.slice(0, index))
      } else {
        // 打字完成
        if (timerRef.current) clearInterval(timerRef.current)
        setIsTyping(false)
        setTextRevealComplete(true)
      }
    }, TYPE_SPEED_MS)

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [currentDialogue, setTextRevealComplete])

  // ---- 点击对话框继续 ----
  const handleClick = useCallback(() => {
    if (!currentDialogue) return

    if (isTyping) {
      // 打字中 -> 立即显示全文
      if (timerRef.current) clearInterval(timerRef.current)
      setDisplayText(currentDialogue.text)
      setIsTyping(false)
      setTextRevealComplete(true)
    } else {
      // 打字完成 -> 触发 Pixi'VN 继续
      // 这里通过全局回调通知剧本引擎
      // 实际实现中由 GameEngine 监听到 store 变化后调用 narration.continue()
      setTextRevealComplete(true)
    }
  }, [currentDialogue, isTyping, setTextRevealComplete])

  // 无对话内容时不渲染
  if (!currentDialogue) return null

  const isNarration = !currentDialogue.speaker || currentDialogue.speaker === ''
  const speakerColor = isNarration ? '#666' : '#e8a0bf'

  return (
    <Box
      style={dialogBoxStyle}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === ' ' || e.key === 'Enter') handleClick() }}
    >
      {/* 说话者名签 */}
      {!isNarration && (
        <Box style={speakerStyle(speakerColor)}>
          {currentDialogue.speaker}
        </Box>
      )}

      {/* 对话文本 */}
      <Typography style={textStyle}>
        {displayText}
        {isTyping && <Box component="span" sx={{ animation: 'blink 0.6s step-end infinite' }}>▌</Box>}
      </Typography>

      {/* 点击提示 */}
      {!isTyping && textRevealComplete && (
        <Typography style={clickHintStyle}>
          ▼ 点击继续
        </Typography>
      )}
    </Box>
  )
}
