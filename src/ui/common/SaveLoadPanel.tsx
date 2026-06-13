/**
 * ============================================================
 * SaveLoadPanel — 存档/读档面板
 *
 * 20 个存档槽位可视化网格 + 自动存档位。
 * 每个槽位显示：编号、时间戳、场景名、游戏时长。
 * ============================================================
 */
import { useState, useEffect, type CSSProperties } from 'react'
import { Box, Typography, Button, Card, CardContent } from '@mui/joy'
import useGameStore from '@/stores/gameStore'
import { useAffinityStore } from '@/stores/affinityStore'
import saveManager, { type SaveSlotInfo } from '@/core/SaveManager'
import { formatPlayTime } from '@/utils/format'

type Mode = 'save' | 'load'

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

/** 格式化时间戳 */
function formatTimestamp(ts: number): string {
  const d = new Date(ts)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export default function SaveLoadPanel() {
  const [mode, setMode] = useState<Mode>('save')
  const [slots, setSlots] = useState<(SaveSlotInfo | null)[]>([])
  const [loading, setLoading] = useState(true)
  const [savingSlot, setSavingSlot] = useState<number | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const toggleSaveLoad = useGameStore((s) => s.toggleSaveLoad)
  const currentSceneName = useGameStore((s) => s.currentSceneName)
  const totalPlayTime = useGameStore((s) => s.totalPlayTime)

  // 加载存档列表
  const loadSlots = async () => {
    setLoading(true)
    try {
      const infos = await saveManager.getAllSaveInfo()
      setSlots(infos)
    } catch (e) {
      console.error('[存档] 加载存档列表失败:', e)
    }
    setLoading(false)
  }

  useEffect(() => {
    loadSlots()
  }, [])

  // 显示临时消息
  const showMessage = (msg: string) => {
    setMessage(msg)
    setTimeout(() => setMessage(null), 2000)
  }

  // 执行存档
  const handleSave = async (slotId: number) => {
    if (mode !== 'save') return
    setSavingSlot(slotId)
    try {
      const affinityData = useAffinityStore.getState().exportAffinityData()
      await saveManager.saveToSlot(
        slotId,
        currentSceneName || '未知场景',
        affinityData,
        '',
        totalPlayTime
      )
      showMessage(`已保存到槽位 ${slotId}`)
      await loadSlots()
    } catch (e) {
      console.error('[存档] 保存失败:', e)
      showMessage('保存失败')
    }
    setSavingSlot(null)
  }

  // 执行读档
  const handleLoad = async (slotId: number) => {
    if (mode !== 'load') return
    try {
      const data = await saveManager.loadFromSlot(slotId)
      if (data) {
        // 恢复好感度数据
        if (data.affinityData) {
          useAffinityStore.getState().importAffinityData(data.affinityData)
        }
        showMessage(`已从槽位 ${slotId} 读档`)
        // 关闭面板
        toggleSaveLoad()
      } else {
        showMessage('该槽位无存档')
      }
    } catch (e) {
      console.error('[存档] 读档失败:', e)
      showMessage('读档失败')
    }
  }

  // 删除存档
  const handleDelete = async (slotId: number, e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      await saveManager.deleteSlot(slotId)
      showMessage(`已删除槽位 ${slotId}`)
      await loadSlots()
    } catch {
      showMessage('删除失败')
    }
  }

  // 自动存档
  const handleAutoSave = async () => {
    try {
      const affinityData = useAffinityStore.getState().exportAffinityData()
      await saveManager.autoSave(
        currentSceneName || '未知场景',
        affinityData,
        '',
        totalPlayTime
      )
      showMessage('已自动存档')
      await loadSlots()
    } catch {
      showMessage('自动存档失败')
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
          存档 / 读档
        </Typography>
        <Button
          variant="plain"
          onClick={toggleSaveLoad}
          sx={{
            color: 'rgba(255,255,255,0.5)',
            '&:hover': { color: '#fff', background: 'rgba(255,255,255,0.1)' },
          }}
        >
          关闭
        </Button>
      </Box>

      <Box style={innerStyle}>
        {/* 模式切换 */}
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mb: 3 }}>
          <Button
            variant={mode === 'save' ? 'soft' : 'outlined'}
            onClick={() => setMode('save')}
            sx={{
              color: mode === 'save' ? '#fff' : 'rgba(255,255,255,0.4)',
              backgroundColor: mode === 'save' ? 'rgba(102,126,234,0.3)' : 'transparent',
              borderColor: 'rgba(255,255,255,0.15)',
              '&:hover': { backgroundColor: 'rgba(102,126,234,0.2)' },
            }}
          >
            存档
          </Button>
          <Button
            variant={mode === 'load' ? 'soft' : 'outlined'}
            onClick={() => setMode('load')}
            sx={{
              color: mode === 'load' ? '#fff' : 'rgba(255,255,255,0.4)',
              backgroundColor: mode === 'load' ? 'rgba(102,126,234,0.3)' : 'transparent',
              borderColor: 'rgba(255,255,255,0.15)',
              '&:hover': { backgroundColor: 'rgba(102,126,234,0.2)' },
            }}
          >
            读档
          </Button>
        </Box>

        {/* 快速操作 */}
        {mode === 'save' && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
            <Button
              variant="outlined"
              size="sm"
              onClick={handleAutoSave}
              sx={{
                color: 'rgba(255,255,255,0.6)',
                borderColor: 'rgba(255,255,255,0.15)',
                '&:hover': { borderColor: 'rgba(255,255,255,0.3)' },
              }}
            >
              快速存档
            </Button>
          </Box>
        )}

        {/* 消息提示 */}
        {message && (
          <Box
            sx={{
              textAlign: 'center',
              mb: 2,
              p: 1,
              borderRadius: 8,
              backgroundColor: 'rgba(102,126,234,0.2)',
            }}
          >
            <Typography level="body-sm" sx={{ color: '#667eea' }}>
              {message}
            </Typography>
          </Box>
        )}

        {/* 存档槽位网格 */}
        {loading ? (
          <Typography sx={{ textAlign: 'center', color: 'rgba(255,255,255,0.3)', py: 4 }}>
            加载中...
          </Typography>
        ) : (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
              gap: 2,
            }}
          >
            {slots.map((slot, index) => {
              const slotId = index // 0 = auto-save, 1-20 = manual
              const isEmpty = !slot

              return (
                <Card
                  key={slotId}
                  variant="outlined"
                  sx={{
                    background: isEmpty
                      ? 'rgba(255,255,255,0.02)'
                      : 'rgba(255,255,255,0.06)',
                    borderColor: isEmpty
                      ? 'rgba(255,255,255,0.06)'
                      : 'rgba(255,255,255,0.12)',
                    cursor: mode === 'save' || !isEmpty ? 'pointer' : 'not-allowed',
                    opacity: mode === 'load' && isEmpty ? 0.3 : 1,
                    transition: 'all 0.2s',
                    '&:hover': {
                      borderColor: 'rgba(102,126,234,0.4)',
                      transform: 'translateY(-2px)',
                    },
                  }}
                  onClick={() => {
                    if (mode === 'save') handleSave(slotId)
                    else if (!isEmpty) handleLoad(slotId)
                  }}
                >
                  <CardContent sx={{ p: 1.5 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography
                        level="title-sm"
                        sx={{
                          color: slot?.isAutoSave ? '#667eea' : 'rgba(255,255,255,0.7)',
                          fontWeight: 600,
                        }}
                      >
                        {slot?.isAutoSave ? '自动存档' : `槽位 ${slotId}`}
                      </Typography>
                      {slot && (
                        <Button
                          size="sm"
                          variant="plain"
                          color="danger"
                          onClick={(e) => handleDelete(slotId, e)}
                          sx={{
                            minWidth: 24,
                            height: 24,
                            fontSize: 12,
                            color: 'rgba(255,255,255,0.2)',
                            '&:hover': { color: '#ef5350' },
                          }}
                        >
                          删除
                        </Button>
                      )}
                    </Box>

                    {slot ? (
                      <>
                        <Typography
                          level="body-xs"
                          sx={{ color: 'rgba(255,255,255,0.5)', mb: 0.5 }}
                        >
                          {formatTimestamp(slot.timestamp)}
                        </Typography>
                        <Typography
                          level="body-xs"
                          sx={{ color: 'rgba(255,255,255,0.7)', mb: 0.25 }}
                        >
                          📍 {slot.sceneName || '未知场景'}
                        </Typography>
                        <Typography level="body-xs" sx={{ color: 'rgba(255,255,255,0.3)' }}>
                          ⏱ {formatPlayTime(slot.playTime)}
                        </Typography>
                      </>
                    ) : (
                      <Typography
                        level="body-xs"
                        sx={{ color: 'rgba(255,255,255,0.2)', fontStyle: 'italic' }}
                      >
                        {mode === 'save' ? '点击保存' : '空'}
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </Box>
        )}
      </Box>
    </Box>
  )
}
