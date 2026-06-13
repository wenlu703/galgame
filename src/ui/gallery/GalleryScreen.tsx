/**
 * ============================================================
 * GalleryScreen — 藏品鉴赏主界面
 *
 * 包含 CG 图鉴和成就收集功能：
 *  - CG 图鉴网格（锁定/解锁状态）
 *  - 成就面板
 *  - 收集进度条
 *  - 新解锁通知
 * ============================================================
 */
import { useState, useMemo, type CSSProperties } from 'react'
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Chip,
  LinearProgress,
} from '@mui/joy'
import { useGalleryStore, type GalleryItem } from '@/stores/galleryStore'
import useGameStore from '@/stores/gameStore'

type ViewMode = 'cg' | 'achievement'

const containerStyle: CSSProperties = {
  position: 'fixed',
  inset: 0,
  zIndex: 900,
  display: 'flex',
  flexDirection: 'column',
  background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
  overflow: 'auto',
}

const innerStyle: CSSProperties = {
  maxWidth: 800,
  width: '100%',
  margin: '0 auto',
  padding: '32px 24px',
}

/* ---------- CG 卡片 ---------- */

function CGItemCard({ item }: { item: GalleryItem }) {
  return (
    <Card
      variant="outlined"
      sx={{
        background: item.isUnlocked
          ? 'rgba(255,255,255,0.04)'
          : 'rgba(255,255,255,0.02)',
        borderColor: item.isUnlocked
          ? 'rgba(255,255,255,0.1)'
          : 'rgba(255,255,255,0.04)',
        opacity: item.isUnlocked ? 1 : 0.5,
        transition: 'all 0.2s',
        '&:hover': item.isUnlocked
          ? { transform: 'translateY(-2px)', borderColor: 'rgba(102,126,234,0.4)' }
          : {},
      }}
    >
      {/* 占位图区域 */}
      <Box
        sx={{
          width: '100%',
          aspectRatio: '16/9',
          borderRadius: 8,
          background: item.isUnlocked
            ? `linear-gradient(135deg, #667eea33, #764ba233)`
            : 'repeating-linear-gradient(45deg, rgba(255,255,255,0.03) 0px, rgba(255,255,255,0.03) 10px, rgba(255,255,255,0.06) 10px, rgba(255,255,255,0.06) 20px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mb: 1.5,
        }}
      >
        <Typography
          level="h2"
          sx={{
            color: item.isUnlocked ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.1)',
            fontSize: 32,
          }}
        >
          {item.isUnlocked ? '🖼️' : '🔒'}
        </Typography>
      </Box>

      <Typography
        level="title-sm"
        sx={{
          color: item.isUnlocked ? '#fff' : 'rgba(255,255,255,0.3)',
          fontWeight: 600,
          mb: 0.5,
        }}
      >
        {item.title}
      </Typography>

      <Typography
        level="body-xs"
        sx={{
          color: 'rgba(255,255,255,0.3)',
          fontSize: 11,
        }}
      >
        {item.isUnlocked ? item.description : '???'}
      </Typography>

      {!item.isUnlocked && (
        <Chip
          size="sm"
          variant="outlined"
          sx={{
            mt: 1,
            borderColor: 'rgba(255,255,255,0.1)',
            color: 'rgba(255,255,255,0.3)',
            fontSize: 10,
          }}
        >
          {item.conditionDescription}
        </Chip>
      )}
    </Card>
  )
}

/* ---------- 成就卡片 ---------- */

function AchievementCard({ item }: { item: GalleryItem }) {
  return (
    <Card
      variant="outlined"
      sx={{
        background: item.isUnlocked
          ? 'rgba(255,255,255,0.04)'
          : 'rgba(255,255,255,0.02)',
        borderColor: item.isUnlocked
          ? 'rgba(255,255,255,0.1)'
          : 'rgba(255,255,255,0.04)',
        opacity: item.isUnlocked ? 1 : 0.5,
      }}
    >
      <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 1.5 }}>
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: '50%',
            background: item.isUnlocked
              ? 'linear-gradient(135deg, #667eea, #764ba2)'
              : 'rgba(255,255,255,0.05)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Typography level="h4" sx={{ color: item.isUnlocked ? '#fff' : 'rgba(255,255,255,0.2)' }}>
            {item.isUnlocked ? '⭐' : '?'}
          </Typography>
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            level="title-sm"
            sx={{
              color: item.isUnlocked ? '#fff' : 'rgba(255,255,255,0.3)',
              fontWeight: 600,
            }}
          >
            {item.isUnlocked ? item.title : '???'}
          </Typography>
          <Typography
            level="body-xs"
            sx={{ color: 'rgba(255,255,255,0.3)', mt: 0.25 }}
          >
            {item.isUnlocked ? item.description : item.conditionDescription}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  )
}

/* ---------- 进度条 ---------- */

function ProgressBar({
  unlocked,
  total,
  label,
}: {
  unlocked: number
  total: number
  label: string
}) {
  const pct = total > 0 ? Math.round((unlocked / total) * 100) : 0
  return (
    <Box sx={{ mb: 1 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
        <Typography level="body-xs" sx={{ color: 'rgba(255,255,255,0.4)' }}>
          {label}
        </Typography>
        <Typography level="body-xs" sx={{ color: 'rgba(255,255,255,0.4)' }}>
          {unlocked}/{total} ({pct}%)
        </Typography>
      </Box>
      <LinearProgress
        determinate
        value={pct}
        sx={{
          '--LinearProgress-thickness': '6px',
          backgroundColor: 'rgba(255,255,255,0.06)',
          borderRadius: 3,
          '& .MuiLinearProgress-bar': {
            background: 'linear-gradient(90deg, #667eea, #764ba2)',
            borderRadius: 3,
          },
        }}
      />
    </Box>
  )
}

/* ---------- 主组件 ---------- */

export default function GalleryScreen() {
  const [view, setView] = useState<ViewMode>('cg')
  const {
    items,
    getItemsByType,
    getProgress,
  } = useGalleryStore()
  const goBackToPrevious = useGameStore((s) => s.goBackToPrevious)
  const previousScreen = useGameStore((s) => s.previousScreen)
  const setScreen = useGameStore((s) => s.setScreen)

  const cgItems = useMemo(() => getItemsByType('cg'), [items, getItemsByType])
  const achievementItems = useMemo(() => getItemsByType('achievement'), [items, getItemsByType])
  const progress = useMemo(() => getProgress(), [items, getProgress])

  const handleBack = () => {
    if (previousScreen) {
      goBackToPrevious()
    } else {
      setScreen('标题画面')
    }
  }

  return (
    <Box style={containerStyle}>
      {/* 顶栏 */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 3,
          py: 2,
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <Typography level="h4" sx={{ color: '#fff', fontWeight: 600, letterSpacing: 2 }}>
          藏品鉴赏
        </Typography>
        <Button
          variant="plain"
          onClick={handleBack}
          sx={{
            color: 'rgba(255,255,255,0.5)',
            '&:hover': { color: '#fff', background: 'rgba(255,255,255,0.1)' },
          }}
        >
          返回
        </Button>
      </Box>

      <Box style={innerStyle}>
        {/* 进度总览 */}
        <ProgressBar
          unlocked={progress.unlocked}
          total={progress.total}
          label="总收集进度"
        />

        {/* 模式切换 */}
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, my: 3 }}>
          <Button
            variant={view === 'cg' ? 'soft' : 'outlined'}
            onClick={() => setView('cg')}
            sx={{
              color: view === 'cg' ? '#fff' : 'rgba(255,255,255,0.4)',
              backgroundColor: view === 'cg' ? 'rgba(102,126,234,0.3)' : 'transparent',
              borderColor: 'rgba(255,255,255,0.15)',
              '&:hover': { backgroundColor: 'rgba(102,126,234,0.2)' },
            }}
          >
            CG 图鉴
          </Button>
          <Button
            variant={view === 'achievement' ? 'soft' : 'outlined'}
            onClick={() => setView('achievement')}
            sx={{
              color: view === 'achievement' ? '#fff' : 'rgba(255,255,255,0.4)',
              backgroundColor: view === 'achievement' ? 'rgba(102,126,234,0.3)' : 'transparent',
              borderColor: 'rgba(255,255,255,0.15)',
              '&:hover': { backgroundColor: 'rgba(102,126,234,0.2)' },
            }}
          >
            成就
          </Button>
        </Box>

        {/* CG 图鉴网格 */}
        {view === 'cg' && (
          <>
            {cgItems.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <Typography level="body-lg" sx={{ color: 'rgba(255,255,255,0.2)', mb: 1 }}>
                  🖼️
                </Typography>
                <Typography level="body-sm" sx={{ color: 'rgba(255,255,255,0.3)' }}>
                  暂无可用的 CG 图鉴
                </Typography>
                <Typography level="body-xs" sx={{ color: 'rgba(255,255,255,0.2)', mt: 1 }}>
                  推进剧情即可解锁 CG
                </Typography>
              </Box>
            ) : (
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                  gap: 2,
                }}
              >
                {cgItems.map((item) => (
                  <CGItemCard key={item.id} item={item} />
                ))}
              </Box>
            )}
          </>
        )}

        {/* 成就列表 */}
        {view === 'achievement' && (
          <>
            {achievementItems.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <Typography level="body-lg" sx={{ color: 'rgba(255,255,255,0.2)', mb: 1 }}>
                  ⭐
                </Typography>
                <Typography level="body-sm" sx={{ color: 'rgba(255,255,255,0.3)' }}>
                  暂无可用的成就
                </Typography>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {achievementItems.map((item) => (
                  <AchievementCard key={item.id} item={item} />
                ))}
              </Box>
            )}
          </>
        )}
      </Box>
    </Box>
  )
}
