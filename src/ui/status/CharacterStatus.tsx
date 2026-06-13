/**
 * ============================================================
 * CharacterStatus — 角色状态面板（好感度一览）
 *
 * 展示所有已解锁角色的好感度、关系阶段、角色信息卡片。
 * 用于游戏中查看角色攻略进度。
 * ============================================================
 */
import { type CSSProperties, useMemo } from 'react'
import { Box, Typography, Button, Chip, Card, CardContent, LinearProgress } from '@mui/joy'
import { useAffinityStore } from '@/stores/affinityStore'
import { characterDB } from '@/characters/CharacterDB'
import useGameStore from '@/stores/gameStore'
import { formatAffinityProgress, getPersonalityDescription } from '@/utils/format'

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

/** 性格对应的标签色 */
const PERSONALITY_COLORS: Record<string, string> = {
  '温柔': '#4fc3f7',
  '冷酷': '#90a4ae',
  '活泼': '#ffb74d',
  '文静': '#aed581',
  '傲娇': '#ef5350',
  '神秘': '#ce93d8',
  '成熟': '#78909c',
  '天真': '#f06292',
}

/** 关系阶段对应的颜色 */
const STATUS_COLORS: Record<string, string> = {
  '陌生人': '#757575',
  '相识': '#42a5f5',
  '朋友': '#66bb6a',
  '好友': '#ffa726',
  '亲密': '#ec407a',
  '恋人': '#e91e63',
}

export default function CharacterStatus() {
  const { characterStates } = useAffinityStore()
  const goBackToPrevious = useGameStore((s) => s.goBackToPrevious)
  const previousScreen = useGameStore((s) => s.previousScreen)
  const setScreen = useGameStore((s) => s.setScreen)

  // 合并角色配置和运行时状态
  const characters = useMemo(() => {
    const allConfigs = characterDB.getAllConfigs()
    return allConfigs.map((config) => ({
      config,
      state: characterStates[config.id],
    }))
  }, [characterStates])

  // 按好感度降序排列
  const sortedChars = useMemo(() => {
    return [...characters].sort((a, b) => {
      const affA = a.state?.affinity ?? 0
      const affB = b.state?.affinity ?? 0
      return affB - affA
    })
  }, [characters])

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
          角色状态
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
        {/* 攻略进度总览 */}
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <Typography level="body-sm" sx={{ color: 'rgba(255,255,255,0.4)', mb: 1 }}>
            攻略进度
          </Typography>
          <Typography level="h3" sx={{ color: '#fff', fontWeight: 700 }}>
            {sortedChars.filter((c) => c.state?.status === '恋人').length} / {sortedChars.length}
          </Typography>
          <Typography level="body-xs" sx={{ color: 'rgba(255,255,255,0.3)', mt: 0.5 }}>
            已达恋人关系的角色数
          </Typography>
        </Box>

        {/* 角色卡片列表 */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {sortedChars.map(({ config, state }) => {
            const affinity = state?.affinity ?? 0
            const status = state?.status ?? '陌生人'
            const isUnlocked = state?.isUnlocked ?? false
            const personalityColor = PERSONALITY_COLORS[config.personality] ?? '#999'
            const statusColor = STATUS_COLORS[status] ?? '#757575'

            return (
              <Card
                key={config.id}
                variant="outlined"
                sx={{
                  background: 'rgba(255,255,255,0.04)',
                  borderColor: 'rgba(255,255,255,0.08)',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  opacity: isUnlocked ? 1 : 0.4,
                  '&:hover': {
                    background: 'rgba(255,255,255,0.08)',
                    borderColor: personalityColor,
                    transform: 'translateY(-1px)',
                  },
                }}
              >
                <CardContent sx={{ p: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                    {/* 头像占位 */}
                    <Box
                      sx={{
                        width: 56,
                        height: 56,
                        borderRadius: '50%',
                        background: `linear-gradient(135deg, ${config.color}44, ${config.color}22)`,
                        border: `2px solid ${config.color}`,
                        flexShrink: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 22,
                        color: config.color,
                        fontWeight: 700,
                      }}
                    >
                      {isUnlocked ? config.name.charAt(0) : '?'}
                    </Box>

                    {/* 角色信息 */}
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <Typography level="title-md" sx={{ color: '#fff' }}>
                          {config.name}
                        </Typography>
                        <Chip
                          size="sm"
                          sx={{
                            backgroundColor: personalityColor + '33',
                            color: personalityColor,
                            fontSize: 11,
                            fontWeight: 500,
                          }}
                        >
                          {config.personality}
                        </Chip>
                        {!isUnlocked && (
                          <Chip
                            size="sm"
                            variant="outlined"
                            sx={{
                              borderColor: 'rgba(255,255,255,0.2)',
                              color: 'rgba(255,255,255,0.4)',
                              fontSize: 11,
                            }}
                          >
                            未解锁
                          </Chip>
                        )}
                      </Box>

                      <Typography
                        level="body-sm"
                        sx={{
                          color: 'rgba(255,255,255,0.4)',
                          fontSize: 12,
                          mb: 1,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {getPersonalityDescription(config.personality)}
                        {config.age && ` · ${config.age}岁`}
                      </Typography>

                      {/* 好感度条 */}
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ flex: 1 }}>
                          <LinearProgress
                            determinate
                            value={Math.min(100, (affinity / 400) * 100)}
                            sx={{
                              '--LinearProgress-thickness': '8px',
                              backgroundColor: 'rgba(255,255,255,0.06)',
                              '& .MuiLinearProgress-bar': {
                                background: `linear-gradient(90deg, ${statusColor}88, ${statusColor})`,
                                borderRadius: 4,
                              },
                              borderRadius: 4,
                            }}
                          />
                        </Box>
                        <Typography
                          level="body-xs"
                          sx={{
                            color: statusColor,
                            fontWeight: 600,
                            minWidth: 40,
                            textAlign: 'right',
                          }}
                        >
                          {formatAffinityProgress(affinity)}
                        </Typography>
                      </Box>

                      {/* 关系阶段 + 好感度数值 */}
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mt: 0.5 }}>
                        <Chip
                          size="sm"
                          sx={{
                            backgroundColor: statusColor + '22',
                            color: statusColor,
                            fontSize: 11,
                            fontWeight: 600,
                          }}
                        >
                          {status}
                        </Chip>
                        <Typography level="body-xs" sx={{ color: 'rgba(255,255,255,0.3)' }}>
                          好感度: {affinity}
                        </Typography>
                        {state && (
                          <Typography level="body-xs" sx={{ color: 'rgba(255,255,255,0.3)' }}>
                            聊天: {state.chatCount}次
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            )
          })}
        </Box>
      </Box>
    </Box>
  )
}
