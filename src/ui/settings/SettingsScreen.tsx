/**
 * ============================================================
 * SettingsScreen — 游戏设置界面
 *
 * 全屏设置面板，支持：
 *  - BGM / SE / 语音 三轨独立音量滑块
 *  - 文字速度调节
 *  - 自动模式延迟
 *  - 全屏切换
 *  - 语言切换（框架）
 *  - 重置所有设置
 * ============================================================
 */
import { type CSSProperties } from 'react'
import {
  Box,
  Typography,
  Slider,
  Switch,
  Button,
  Select,
  Option,
  Divider,
  IconButton,
} from '@mui/joy'
import useSettingsStore from '@/stores/settingsStore'
import useGameStore from '@/stores/gameStore'
import audioSystem from '@/systems/AudioSystem'

/** 设置容器样式 */
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
  maxWidth: 600,
  width: '100%',
  margin: '0 auto',
  padding: '40px 24px',
}

const sectionTitleStyle: CSSProperties = {
  color: 'rgba(255,255,255,0.5)',
  fontSize: 13,
  fontWeight: 600,
  letterSpacing: 2,
  textTransform: 'uppercase',
  marginBottom: 16,
  marginTop: 8,
}

const labelStyle: CSSProperties = {
  color: 'rgba(255,255,255,0.8)',
  fontSize: 15,
  fontWeight: 500,
}

const valueStyle: CSSProperties = {
  color: 'rgba(255,255,255,0.4)',
  fontSize: 13,
  minWidth: 36,
  textAlign: 'right',
}

export default function SettingsScreen() {
  const {
    bgmVolume,
    seVolume,
    voiceVolume,
    textSpeed,
    autoDelay,
    fullscreen,
    language,
    showSpeakerLabel,
    setBgmVolume,
    setSeVolume,
    setVoiceVolume,
    setTextSpeed,
    setAutoDelay,
    toggleFullscreen,
    setLanguage,
    toggleSpeakerLabel,
    resetSettings,
  } = useSettingsStore()
  const setScreen = useGameStore((s) => s.setScreen)
  const goBackToPrevious = useGameStore((s) => s.goBackToPrevious)

  const handleVolumeChange = (
    setter: (v: number) => void,
    value: number
  ) => {
    setter(value)
    // 同步音频系统音量
    audioSystem.syncVolumes()
  }

  const handleClose = () => {
    // 如果是从标题画面来的，回标题；否则回游戏
    const prev = useGameStore.getState().previousScreen
    if (prev && prev !== '设置') {
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
        <Typography
          level="h4"
          sx={{ color: '#fff', fontWeight: 600, letterSpacing: 2 }}
        >
          设 置
        </Typography>
        <Button
          variant="plain"
          onClick={handleClose}
          sx={{
            color: 'rgba(255,255,255,0.5)',
            '&:hover': { color: '#fff', background: 'rgba(255,255,255,0.1)' },
          }}
        >
          关闭
        </Button>
      </Box>

      <Box style={innerStyle}>
        {/* ---- 音量 ---- */}
        <Typography style={sectionTitleStyle}>音量</Typography>

        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography style={labelStyle}>BGM</Typography>
            <Typography style={valueStyle}>{Math.round(bgmVolume * 100)}%</Typography>
          </Box>
          <Slider
            value={bgmVolume}
            min={0}
            max={1}
            step={0.05}
            onChange={(_e, v) => handleVolumeChange(setBgmVolume, v as number)}
            sx={{ '--Slider-trackSize': '6px' }}
          />
        </Box>

        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography style={labelStyle}>音效 (SE)</Typography>
            <Typography style={valueStyle}>{Math.round(seVolume * 100)}%</Typography>
          </Box>
          <Slider
            value={seVolume}
            min={0}
            max={1}
            step={0.05}
            onChange={(_e, v) => handleVolumeChange(setSeVolume, v as number)}
            sx={{ '--Slider-trackSize': '6px' }}
          />
        </Box>

        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography style={labelStyle}>语音</Typography>
            <Typography style={valueStyle}>{Math.round(voiceVolume * 100)}%</Typography>
          </Box>
          <Slider
            value={voiceVolume}
            min={0}
            max={1}
            step={0.05}
            onChange={(_e, v) => handleVolumeChange(setVoiceVolume, v as number)}
            sx={{ '--Slider-trackSize': '6px' }}
          />
        </Box>

        <Divider sx={{ my: 3, opacity: 0.1 }} />

        {/* ---- 文字 ---- */}
        <Typography style={sectionTitleStyle}>文字</Typography>

        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography style={labelStyle}>文字速度</Typography>
            <Typography style={valueStyle}>{textSpeed}ms/字</Typography>
          </Box>
          <Slider
            value={textSpeed}
            min={10}
            max={200}
            step={5}
            onChange={(_e, v) => setTextSpeed(v as number)}
            sx={{ '--Slider-trackSize': '6px' }}
          />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
            <Typography level="body-xs" sx={{ color: 'rgba(255,255,255,0.3)' }}>
              快
            </Typography>
            <Typography level="body-xs" sx={{ color: 'rgba(255,255,255,0.3)' }}>
              慢
            </Typography>
          </Box>
        </Box>

        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography style={labelStyle}>自动模式延迟</Typography>
            <Typography style={valueStyle}>{autoDelay}ms</Typography>
          </Box>
          <Slider
            value={autoDelay}
            min={500}
            max={10000}
            step={100}
            onChange={(_e, v) => setAutoDelay(v as number)}
            sx={{ '--Slider-trackSize': '6px' }}
          />
        </Box>

        <Divider sx={{ my: 3, opacity: 0.1 }} />

        {/* ---- 显示 ---- */}
        <Typography style={sectionTitleStyle}>显示</Typography>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography style={labelStyle}>全屏模式</Typography>
          <Switch
            checked={fullscreen}
            onChange={toggleFullscreen}
            color="primary"
          />
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography style={labelStyle}>显示角色名称</Typography>
          <Switch
            checked={showSpeakerLabel}
            onChange={toggleSpeakerLabel}
            color="primary"
          />
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography style={labelStyle}>界面语言</Typography>
          <Select
            value={language}
            onChange={(_e, v) => v && setLanguage(v as 'zh-CN' | 'en' | 'ja')}
            sx={{
              minWidth: 140,
              backgroundColor: 'rgba(255,255,255,0.08)',
              borderColor: 'rgba(255,255,255,0.15)',
              color: '#fff',
            }}
          >
            <Option value="zh-CN">简体中文</Option>
            <Option value="en">English</Option>
            <Option value="ja">日本語</Option>
          </Select>
        </Box>

        <Divider sx={{ my: 3, opacity: 0.1 }} />

        {/* ---- 操作 ---- */}
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mt: 4 }}>
          <Button
            variant="outlined"
            color="danger"
            onClick={resetSettings}
            sx={{
              color: 'rgba(255,255,255,0.6)',
              borderColor: 'rgba(255,255,255,0.15)',
              '&:hover': {
                borderColor: 'rgba(255,68,68,0.5)',
                color: '#ff4444',
              },
            }}
          >
            恢复默认
          </Button>
          <Button
            variant="solid"
            onClick={handleClose}
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              '&:hover': { opacity: 0.9 },
            }}
          >
            确认
          </Button>
        </Box>
      </Box>
    </Box>
  )
}
