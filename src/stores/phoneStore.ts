/**
 * ============================================================
 * phoneStore — 手机聊天系统状态管理 (Zustand + Immer)
 *
 * 管理游戏内手机聊天的全部状态：
 *  - 联系人列表（基于已解锁角色自动生成）
 *  - 每个角色的聊天对话历史
 *  - 未读消息计数
 *  - 聊天可用性（日程/好感度限制）
 *
 * 与 affinityStore 联动：聊天影响好感度，好感度解锁新对话。
 * ============================================================
 */
import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { characterDB } from '@/characters/CharacterDB'
import { useAffinityStore } from '@/stores/affinityStore'

/* ---------- 类型定义 ---------- */

/** 消息类型 */
export type MessageType = 'text' | 'system' | 'choice' | 'affinity_notice' | 'image'

/** 单条聊天消息 */
export interface ChatMessage {
  id: string
  /** 发送者 characterId（'player' 表示玩家） */
  senderId: string
  /** 消息内容 */
  text: string
  /** 消息类型 */
  type: MessageType
  /** 时间戳 */
  timestamp: number
  /** 可选的选择分支（type='choice' 时使用） */
  choices?: { text: string; nextDialogueId: string }[]
  /** 好感度变化显示（type='affinity_notice' 时使用） */
  affinityDelta?: number
}

/** 联系人信息 */
export interface ContactInfo {
  characterId: string
  /** 是否有未读消息 */
  hasUnread: boolean
  /** 最后一条消息预览 */
  lastMessage?: string
  /** 最后消息时间戳 */
  lastMessageTime?: number
  /** 是否置顶 */
  pinned: boolean
  /** 今日是否已聊过（日程限制） */
  hasChattedToday: boolean
}

/** 完整的对话记录 */
export interface Conversation {
  characterId: string
  messages: ChatMessage[]
}

/** 预定义的对话脚本（好感度触发） */
export interface ChatDialogueScript {
  id: string
  characterId: string
  /** 触发所需的最低好感度 */
  minAffinity: number
  /** 触发所需的聊天次数 */
  minChatCount: number
  /** 对话内容序列 */
  messages: Omit<ChatMessage, 'id' | 'timestamp'>[]
  /** 完成后增加的好感度 */
  affinityReward: number
  /** 是否已被触发过 */
  triggered: boolean
}

/** Store 状态 */
interface PhoneState {
  /** 对话列表（characterId → messages） */
  conversations: Record<string, ChatMessage[]>
  /** 当前打开的聊天对象（null = 联系人列表） */
  activeChat: string | null
  /** 是否正在输入（对方） */
  isTyping: boolean
  /** 预定义的聊天对话脚本 */
  chatScripts: ChatDialogueScript[]
  /** 已触发的脚本 ID 列表 */
  triggeredScripts: string[]
  /** 上次打开手机的时间（用于模拟新消息） */
  lastPhoneOpenTime: number
}

/** Store Actions */
interface PhoneActions {
  /** 打开与指定角色的聊天 */
  openChat: (characterId: string) => void
  /** 关闭聊天，返回联系人列表 */
  closeChat: () => void
  /** 玩家发送消息 */
  sendMessage: (characterId: string, text: string) => void
  /** 角色回复消息（可由剧本引擎触发） */
  receiveMessage: (characterId: string, text: string, type?: MessageType) => void
  /** 添加系统消息（好感度变化通知等） */
  addSystemMessage: (characterId: string, text: string, affinityDelta?: number) => void
  /** 获取指定角色的对话 */
  getConversation: (characterId: string) => ChatMessage[]
  /** 获取联系人的未读状态 */
  getContactInfo: (characterId: string) => ContactInfo
  /** 获取所有联系人信息（已解锁角色自动成为联系人） */
  getAllContacts: () => ContactInfo[]
  /** 标记已读 */
  markRead: (characterId: string) => void
  /** 获取总未读数 */
  getTotalUnread: () => number
  /** 注册聊天脚本 */
  registerChatScript: (script: ChatDialogueScript) => void
  /** 检查并触发可用聊天脚本 */
  checkAndTriggerScripts: () => void
  /** 记录手机打开时间 */
  recordPhoneOpen: () => void
  /** 重置聊天数据 */
  resetPhone: () => void
}

/** 生成唯一消息 ID */
let msgIdCounter = 0
function generateMsgId(): string {
  return `msg_${Date.now()}_${++msgIdCounter}`
}

/** 初始状态 */
const initialState: PhoneState = {
  conversations: {},
  activeChat: null,
  isTyping: false,
  chatScripts: [],
  triggeredScripts: [],
  lastPhoneOpenTime: Date.now(),
}

/** 创建 phoneStore */
export const usePhoneStore = create<PhoneState & PhoneActions>()(
  immer((set, get) => ({
    ...initialState,

    openChat: (characterId) =>
      set((state) => {
        state.activeChat = characterId
        state.isTyping = false
        // 自动检查可触发的脚本
      }),

    closeChat: () =>
      set((state) => {
        state.activeChat = null
        state.isTyping = false
      }),

    sendMessage: (characterId, text) =>
      set((state) => {
        if (!state.conversations[characterId]) {
          state.conversations[characterId] = []
        }
        state.conversations[characterId].push({
          id: generateMsgId(),
          senderId: 'player',
          text,
          type: 'text',
          timestamp: Date.now(),
        })
      }),

    receiveMessage: (characterId, text, type = 'text') =>
      set((state) => {
        if (!state.conversations[characterId]) {
          state.conversations[characterId] = []
        }
        state.conversations[characterId].push({
          id: generateMsgId(),
          senderId: characterId,
          text,
          type,
          timestamp: Date.now(),
        })
      }),

    addSystemMessage: (characterId, text, affinityDelta) =>
      set((state) => {
        if (!state.conversations[characterId]) {
          state.conversations[characterId] = []
        }
        state.conversations[characterId].push({
          id: generateMsgId(),
          senderId: 'system',
          text,
          type: 'affinity_notice',
          timestamp: Date.now(),
          affinityDelta,
        })
      }),

    getConversation: (characterId) => {
      return get().conversations[characterId] ?? []
    },

    getContactInfo: (characterId) => {
      const { conversations, triggeredScripts } = get()
      const msgs = conversations[characterId] ?? []
      const lastMsg = msgs.length > 0 ? msgs[msgs.length - 1] : undefined

      return {
        characterId,
        hasUnread: false, // 默认无未读，由 UI 层管理
        lastMessage: lastMsg?.text.slice(0, 30),
        lastMessageTime: lastMsg?.timestamp,
        pinned: false,
        hasChattedToday: false,
      }
    },

    getAllContacts: () => {
      const state = get()
      const allChars = characterDB.getAllConfigs()
      const affinityStates = useAffinityStore.getState().characterStates

      return allChars
        .filter((c) => affinityStates[c.id]?.isUnlocked)
        .map((c) => {
          const msgs = state.conversations[c.id] ?? []
          const lastMsg = msgs.length > 0 ? msgs[msgs.length - 1] : undefined
          return {
            characterId: c.id,
            hasUnread: false,
            lastMessage: lastMsg?.text.slice(0, 30),
            lastMessageTime: lastMsg?.timestamp,
            pinned: false,
            hasChattedToday: false,
          } as ContactInfo
        })
    },

    markRead: (characterId) =>
      set((state) => {
        // 未读状态由 UI 组件本地管理，store 层面不做额外处理
      }),

    getTotalUnread: () => 0, // 由 UI 层基于本地状态计算

    registerChatScript: (script) =>
      set((state) => {
        const exists = state.chatScripts.some((s) => s.id === script.id)
        if (!exists) {
          state.chatScripts.push(script)
        }
      }),

    checkAndTriggerScripts: () => {
      const state = get()
      const affinityState = useAffinityStore.getState()

      for (const script of state.chatScripts) {
        if (state.triggeredScripts.includes(script.id)) continue

        const charState = affinityState.characterStates[script.characterId]
        if (!charState?.isUnlocked) continue

        const affinity = charState.affinity
        const chatCount = charState.chatCount

        if (affinity >= script.minAffinity && chatCount >= script.minChatCount) {
          // 触发脚本：逐个发送消息
          set((state) => {
            state.triggeredScripts.push(script.id)
            if (!state.conversations[script.characterId]) {
              state.conversations[script.characterId] = []
            }
            for (const msg of script.messages) {
              state.conversations[script.characterId].push({
                ...msg,
                id: generateMsgId(),
                timestamp: Date.now(),
              })
            }
          })

          // 好感度奖励
          if (script.affinityReward !== 0) {
            affinityState.modifyAffinity(script.characterId, script.affinityReward, '手机聊天')
          }
        }
      }
    },

    recordPhoneOpen: () =>
      set((state) => {
        state.lastPhoneOpenTime = Date.now()
      }),

    resetPhone: () =>
      set(() => ({
        ...initialState,
        chatScripts: get().chatScripts, // 保留脚本定义
        lastPhoneOpenTime: Date.now(),
      })),
  }))
)

export default usePhoneStore
