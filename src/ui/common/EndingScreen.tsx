/**
 * ============================================================
 * EndingScreen — 结局展示画面
 *
 * 展示游戏结局的标题、描述和好感度简报。
 * 提供"返回标题"和"查看结局列表"功能。
 * ============================================================
 */
import { type CSSProperties } from 'react'
import { Box, Typography, Button, Chip, Card, CardContent, LinearProgress } from '@mui/joy'
import { motion } from 'motion/react'
import useGameStore from '@/stores/gameStore'
import endingSystem, { type EndingResult } from '@/systems/EndingSystem'

const containerStyle: CSSProperties = {
  position: 'fixed',
  inset: 0,
  zIndex: 1000,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
  overflow: 'auto',
  padding: 32,
}

/** 结局类型对应的颜色和标签 */
const ENDING_TYPE_CONFIG: Record<string, { color: string; label: string }> = {
  true: { color: '#ffd700', label: 'True End' },
  normal: { color: '#4fc3f7', label: 'Normal End' },
  friendship: { color: '#81c784', label: 'Friendship End' },
  hidden: { color: '#ce93d8', label: 'Hidden End' },
}

export default function EndingScreen() {
  const setScreen = useGameStore((s) => s.setScreen)
  const { ending, reason, affinitySummary } = endingSystem.determineEnding()
  const config = ENDING_TYPE_CONFIG[ending.type] ?? { color: '#fff', label: 'End' }

  const handleBackToTitle = () => {
    setScreen('标题画面')
  }

  const handleViewGallery = () => {
    setScreen('藏品鉴赏')
  }

  return (
    <Box style={containerStyle}>
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: 'easeOut' }}
          style={{
            maxWidth: 600,
            width: '100%',
            textAlign: 'center',
          }}
        >
          {/* 结局类型标签 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            <Chip
              size="lg"
              sx={{
                backgroundColor: `${config.color}22`,
                color: config.color,
                fontWeight: 700,
                fontSize: 14,
                letterSpacing: 2,
                mb: 3,
                px: 3,
                py: 1,
              }}
            >
              {config.label}
            </Chip>
          </motion.div>

          {/* 结局标题 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.8 }}
          >
            <Typography
              level="h1"
              sx={{
                color: '#fff',
                fontWeight: 700,
                fontSize: { xs: 28, md: 36 },
                letterSpacing: 4,
                mb: 4,
                textShadow: `0 0 40px ${config.color}44`,
              }}
            >
              {ending.title}
            </Typography>
          </motion.div>

          {/* 结局描述 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.8, duration: 1 }}
          >
            <Typography
              level="body-lg"
              sx={{
                color: 'rgba(255,255,255,0.8)',
                lineHeight: 2,
                fontSize: 16,
                mb: 2,
                maxWidth: 480,
                mx: 'auto',
              }}
            >
              {ending.description}
            </Typography>

            <Typography
              level="body-sm"
              sx={{
                color: 'rgba(255,255,255,0.4)',
                fontStyle: 'italic',
                mb: 6,
              }}
            >
              —— {reason}
            </Typography>
          </motion.div>

          {/* 好感度简报 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2.5, duration: 0.6 }}
          >
            <Typography
              level="title-sm"
              sx={{ color: 'rgba(255,255,255,0.4)', mb: 2, letterSpacing: 2 }}
            >
              最终好感度
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 6, maxWidth: 400, mx: 'auto' }}>
              {affinitySummary.map((item) => (
                <Box key={item.characterId} sx={{ textAlign: 'left' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.25 }}>
                    <Typography level="body-sm" sx={{ color: 'rgba(255,255,255,0.6)', fontSize: 13 }}>
                      {item.name}
                    </Typography>
                    <Typography level="body-xs" sx={{ color: 'rgba(255,255,255,0.3)' }}>
                      {item.affinity} · {item.status}
                    </Typography>
                  </Box>
                  <LinearProgress
                    determinate
                    value={Math.min(100, (item.affinity / 400) * 100)}
                    sx={{
                      '--LinearProgress-thickness': '4px',
                      backgroundColor: 'rgba(255,255,255,0.06)',
                      borderRadius: 2,
                      '& .MuiLinearProgress-bar': {
                        background: item.affinity >= 400
                          ? 'linear-gradient(90deg, #ffd700, #ff6b6b)'
                          : item.affinity >= 200
                            ? 'linear-gradient(90deg, #667eea, #764ba2)'
                            : 'rgba(255,255,255,0.2)',
                        borderRadius: 2,
                      },
                    }}
                  />
                </Box>
              ))}
            </Box>
          </motion.div>

          {/* 操作按钮 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 3, duration: 0.5 }}
            style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}
          >
            <Button
              size="lg"
              variant="solid"
              onClick={handleBackToTitle}
              sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                px: 4,
                py: 1.5,
                fontSize: 16,
                letterSpacing: 2,
                '&:hover': { opacity: 0.9, transform: 'translateY(-2px)' },
              }}
            >
              返回标题
            </Button>
            <Button
              size="lg"
              variant="outlined"
              onClick={handleViewGallery}
              sx={{
                color: 'rgba(255,255,255,0.6)',
                borderColor: 'rgba(255,255,255,0.2)',
                px: 4,
                py: 1.5,
                fontSize: 16,
                letterSpacing: 2,
                '&:hover': {
                  borderColor: 'rgba(255,255,255,0.4)',
                  color: '#fff',
                  background: 'rgba(255,255,255,0.05)',
                },
              }}
            >
              查看结局收藏
            </Button>
          </motion.div>

          {/* 制作人员 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 4, duration: 0.8 }}
          >
            <Typography
              level="body-xs"
              sx={{
                color: 'rgba(255,255,255,0.15)',
                mt: 8,
                letterSpacing: 3,
              }}
            >
              — Starlight Concerto · 星空协奏曲 —
            </Typography>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </Box>
  )
}
