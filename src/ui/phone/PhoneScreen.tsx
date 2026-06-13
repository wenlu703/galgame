/**
 * ============================================================
 * PhoneScreen — 手机聊天主界面
 *
 * 模拟真实手机的聊天应用界面，包含：
 *  - 联系人列表（已解锁角色自动显示）
 *  - 聊天窗口（消息气泡、输入框）
 *  - 未读消息标记
 *  - 手机状态栏（时间、信号等装饰）
 *
 * 在游戏中通过"手机"按钮或快捷键打开。
 * ============================================================
 */
import { useState, useEffect, useMemo, type CSSProperties } from 'react'
import {
  Box,
  Typography,
  Input,
  Button,
  IconButton,
  Badge,
  Avatar,
  Sheet,
} from '@mui/joy'
import { motion, AnimatePresence } from 'motion/react'
import { usePhoneStore, type ContactInfo } from '@/stores/phoneStore'
import useGameStore from '@/stores/gameStore'
import { characterDB } from '@/characters/CharacterDB'

/* ---------- 样式 ---------- */

const overlayStyle: CSSProperties = {
  position: 'fixed',
  inset: 0,
  zIndex: 800,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: 'rgba(0,0,0,0.6)',
  backdropFilter: 'blur(4px)',
}

const phoneFrameStyle: CSSProperties = {
  width: 380,
  height: '85vh',
  maxHeight: 700,
  backgroundColor: '#1a1a2e',
  borderRadius: 24,
  border: '2px solid rgba(255,255,255,0.1)',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
  boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
}

const statusBarStyle: CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '10px 20px 6px',
  color: 'rgba(255,255,255,0.6)',
  fontSize: 12,
}

const headerStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '8px 16px',
  borderBottom: '1px solid rgba(255,255,255,0.06)',
}

const contactListStyle: CSSProperties = {
  flex: 1,
  overflowY: 'auto',
  padding: '8px 0',
}

const contactItemStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: 12,
  padding: '12px 16px',
  cursor: 'pointer',
  transition: 'all 0.15s',
  borderBottom: '1px solid rgba(255,255,255,0.03)',
}

const chatAreaStyle: CSSProperties = {
  flex: 1,
  overflowY: 'auto',
  padding: '16px',
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
}

const inputAreaStyle: CSSProperties = {
  display: 'flex',
  gap: 8,
  padding: '12px 16px',
  borderTop: '1px solid rgba(255,255,255,0.06)',
  backgroundColor: 'rgba(255,255,255,0.03)',
}

/* ---------- 聊天气泡 ---------- */

function MessageBubble({
  text,
  isPlayer,
  senderName,
  senderColor,
  type,
}: {
  text: string
  isPlayer: boolean
  senderName: string
  senderColor: string
  type: string
}) {
  const isSystem = type === 'affinity_notice' || type === 'system'

  if (isSystem) {
    return (
      <Box sx={{ textAlign: 'center', my: 1 }}>
        <Typography
          level="body-xs"
          sx={{
            color: senderColor || 'rgba(255,255,255,0.4)',
            backgroundColor: 'rgba(255,255,255,0.04)',
            display: 'inline-block',
            px: 2,
            py: 0.5,
            borderRadius: 12,
            fontSize: 11,
          }}
        >
          {text}
        </Typography>
      </Box>
    )
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: isPlayer ? 'flex-end' : 'flex-start',
        gap: 0.5,
      }}
    >
      {!isPlayer && (
        <Typography level="body-xs" sx={{ color: senderColor || 'rgba(255,255,255,0.4)', fontSize: 11, ml: 1 }}>
          {senderName}
        </Typography>
      )}
      <Box
        sx={{
          maxWidth: '80%',
          px: 2,
          py: 1.2,
          borderRadius: isPlayer ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
          backgroundColor: isPlayer ? '#667eea' : 'rgba(255,255,255,0.08)',
          color: '#fff',
          fontSize: 14,
          lineHeight: 1.5,
          wordBreak: 'break-word',
        }}
      >
        {text}
      </Box>
    </Box>
  )
}

/* ---------- 联系人项 ---------- */

function ContactItem({
  contact,
  onClick,
}: {
  contact: ContactInfo
  onClick: () => void
}) {
  const config = characterDB.getConfig(contact.characterId)
  const name = config?.name ?? contact.characterId
  const color = config?.color ?? '#667eea'

  return (
    <Box sx={contactItemStyle} onClick={onClick}>
      <Badge
        variant={contact.hasUnread ? 'solid' : 'soft'}
        size="sm"
      >
        <Avatar
          size="md"
          sx={{
            backgroundColor: `${color}33`,
            color,
            fontWeight: 700,
            fontSize: 16,
            border: `2px solid ${color}`,
          }}
        >
          {name.charAt(0)}
        </Avatar>
      </Badge>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography level="title-sm" sx={{ color: '#fff', fontWeight: 600 }}>
            {name}
          </Typography>
          {contact.lastMessageTime && (
            <Typography level="body-xs" sx={{ color: 'rgba(255,255,255,0.3)', fontSize: 11 }}>
              {new Date(contact.lastMessageTime).toLocaleTimeString('zh-CN', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Typography>
          )}
        </Box>
        <Typography
          level="body-sm"
          sx={{
            color: 'rgba(255,255,255,0.4)',
            fontSize: 12,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            mt: 0.25,
          }}
        >
          {contact.lastMessage || '暂无消息'}
        </Typography>
      </Box>
    </Box>
  )
}

/* ---------- 聊天窗口 ---------- */

function ChatWindow({ characterId, onBack }: { characterId: string; onBack: () => void }) {
  const [inputText, setInputText] = useState('')
  const { conversations, sendMessage, closeChat } = usePhoneStore()
  const config = characterDB.getConfig(characterId)
  const name = config?.name ?? characterId
  const color = config?.color ?? '#667eea'
  const messages = conversations[characterId] ?? []

  const handleSend = () => {
    const text = inputText.trim()
    if (!text) return
    sendMessage(characterId, text)
    setInputText('')
    // 模拟角色自动回复
    setTimeout(() => {
      usePhoneStore.getState().receiveMessage(
        characterId,
        getAutoReply(name),
        'text'
      )
    }, 1000 + Math.random() * 2000)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* 聊天头部 */}
      <Box sx={headerStyle}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton
            size="sm"
            onClick={onBack}
            sx={{ color: 'rgba(255,255,255,0.5)', '&:hover': { color: '#fff' } }}
          >
            ←
          </IconButton>
          <Avatar
            size="sm"
            sx={{
              backgroundColor: `${color}33`,
              color,
              fontWeight: 700,
              fontSize: 12,
              width: 28,
              height: 28,
            }}
          >
            {name.charAt(0)}
          </Avatar>
          <Typography level="title-sm" sx={{ color: '#fff', fontWeight: 600 }}>
            {name}
          </Typography>
        </Box>
      </Box>

      {/* 消息区域 */}
      <Box sx={chatAreaStyle}>
        {messages.length === 0 ? (
          <Box sx={{ textAlign: 'center', mt: 8, color: 'rgba(255,255,255,0.2)' }}>
            <Typography level="body-sm">开始聊天吧</Typography>
          </Box>
        ) : (
          messages.map((msg) => (
            <MessageBubble
              key={msg.id}
              text={msg.text}
              isPlayer={msg.senderId === 'player'}
              senderName={msg.senderId === 'player' ? '你' : name}
              senderColor={msg.senderId === 'player' ? '#667eea' : color}
              type={msg.type}
            />
          ))
        )}
      </Box>

      {/* 输入区域 */}
      <Box sx={inputAreaStyle}>
        <Input
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="输入消息..."
          sx={{
            flex: 1,
            backgroundColor: 'rgba(255,255,255,0.06)',
            borderColor: 'rgba(255,255,255,0.1)',
            color: '#fff',
            '&:focus': { borderColor: '#667eea' },
          }}
        />
        <Button
          size="sm"
          onClick={handleSend}
          sx={{
            backgroundColor: '#667eea',
            '&:hover': { backgroundColor: '#5a6fd6' },
            '&.Mui-disabled': { backgroundColor: 'rgba(255,255,255,0.1)' },
          }}
        >
          发送
        </Button>
      </Box>
    </Box>
  )
}

/** 模拟角色自动回复 */
function getAutoReply(name: string): string {
  const replies = [
    `嗯嗯，我知道了`,
    `原来如此🤔`,
    `哈哈，说的也是呢`,
    `好的好的~`,
    `嗯，我在听`,
    `这样啊...`,
    `你说得对！`,
    `好巧，我也这么想`,
  ]
  return replies[Math.floor(Math.random() * replies.length)]
}

/* ---------- 主组件 ---------- */

export default function PhoneScreen() {
  const activeChat = usePhoneStore((s) => s.activeChat)
  const openChat = usePhoneStore((s) => s.openChat)
  const closeChat = usePhoneStore((s) => s.closeChat)
  const contacts = usePhoneStore((s) => s.getAllContacts())
  const setScreen = useGameStore((s) => s.setScreen)
  const [currentTime, setCurrentTime] = useState(new Date())

  // 更新时间
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 30000)
    return () => clearInterval(timer)
  }, [])

  const handleClose = () => {
    closeChat()
    setScreen('剧情模式')
  }

  const timeStr = currentTime.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <Box style={overlayStyle}>
      <AnimatePresence mode="wait">
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 40 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 40 }}
          transition={{ type: 'spring', duration: 0.4, bounce: 0.2 }}
          style={phoneFrameStyle}
        >
          {/* 状态栏 */}
          <Box style={statusBarStyle}>
            <Typography level="body-xs" sx={{ color: 'rgba(255,255,255,0.5)' }}>
              {timeStr}
            </Typography>
            <Typography level="body-xs" sx={{ color: 'rgba(255,255,255,0.5)' }}>
              📶 🔋
            </Typography>
          </Box>

          {/* 主内容区 */}
          {activeChat ? (
            <ChatWindow
              characterId={activeChat}
              onBack={() => closeChat()}
            />
          ) : (
            <>
              {/* 联系人列表头部 */}
              <Box sx={headerStyle}>
                <Typography level="title-md" sx={{ color: '#fff', fontWeight: 700 }}>
                  消息
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <IconButton
                    size="sm"
                    onClick={handleClose}
                    sx={{ color: 'rgba(255,255,255,0.5)', '&:hover': { color: '#667eea' } }}
                  >
                    ✕
                  </IconButton>
                </Box>
              </Box>

              {/* 联系人列表 */}
              <Box style={contactListStyle}>
                {contacts.length === 0 ? (
                  <Box sx={{ textAlign: 'center', mt: 8, px: 4 }}>
                    <Typography level="body-lg" sx={{ color: 'rgba(255,255,255,0.2)', mb: 1 }}>
                      💬
                    </Typography>
                    <Typography level="body-sm" sx={{ color: 'rgba(255,255,255,0.3)' }}>
                      暂无联系人
                    </Typography>
                    <Typography level="body-xs" sx={{ color: 'rgba(255,255,255,0.2)', mt: 1 }}>
                      在剧情中解锁角色后，他们会出现在这里
                    </Typography>
                  </Box>
                ) : (
                  contacts.map((contact) => (
                    <ContactItem
                      key={contact.characterId}
                      contact={contact}
                      onClick={() => openChat(contact.characterId)}
                    />
                  ))
                )}
              </Box>
            </>
          )}
        </motion.div>
      </AnimatePresence>
    </Box>
  )
}
