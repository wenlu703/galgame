/**
 * ============================================================
 * StoryScript — 剧本数据模型
 *
 * 定义游戏剧本的 DSL（领域特定语言）数据结构和标签注册函数。
 * 每个剧本文件导出一个或多个标签（Label），由 Pixi'VN 引擎执行。
 * ============================================================
 */
import { newLabel } from '@drincs/pixi-vn/narration'

/** 步骤函数类型（避免 `unknown` 不满足 `{}` 约束） */
type StoryStep = (props: Record<string, unknown>) => void | Promise<void | Record<string, unknown>>
import { useGameStore } from '@/stores/gameStore'
import { useAffinityStore } from '@/stores/affinityStore'

/**
 * 剧本节点类型
 */
export type StoryNodeType =
  | '对话'       // dialogue - 角色说话
  | '旁白'       // narration - 叙述性文字
  | '选项'       // choice - 分支选择
  | '跳转'       // jump - 跳转到指定标签
  | '条件跳转'   // condition - 条件分支
  | '好感度变化' // modify_affinity - 修改好感度
  | '场景切换'   // change_scene - 切换背景
  | '角色出现'   // show_character - 显示角色
  | '角色消失'   // hide_character - 隐藏角色
  | '播放BGM'   // play_music - 播放背景音乐
  | '停止BGM'   // stop_music - 停止音乐
  | '播放音效'   // play_sound - 播放音效
  | '解锁成就'   // unlock_achievement - 解锁成就/藏品
  | '等待'       // wait - 等待指定时间
  | '结束'       // end - 结束游戏/路线

/**
 * 剧本节点（可序列化的 DSL 格式）
 */
export interface StoryNode {
  type: StoryNodeType
  /** 说话者（对话/旁白时使用） */
  speaker?: string
  /** 文本内容 */
  text?: string
  /** 选项列表（type = '选项' 时使用） */
  choices?: StoryChoice[]
  /** 目标标签（type = '跳转' 时使用） */
  targetLabel?: string
  /** 条件表达式（type = '条件跳转' 时使用，如 "affinity.lingyin >= 50"） */
  condition?: string
  /** 条件为真时跳转的标签 */
  trueLabel?: string
  /** 条件为假时跳转的标签 */
  falseLabel?: string
  /** 好感度变化量 */
  affinityDelta?: number
  /** 好感度目标角色 */
  targetCharacter?: string
  /** 资源路径（场景/角色/音频用） */
  assetPath?: string
  /** 等待时间（秒） */
  waitDuration?: number
  /** 角色表情 */
  emotion?: string
  /** 藏品/成就 ID */
  achievementId?: string
}

/**
 * 选项结构
 */
export interface StoryChoice {
  /** 选项文字 */
  text: string
  /** 跳转标签 */
  targetLabel: string
  /** 选择后好感度变化 */
  affinityDelta?: number
  /** 好感度目标角色 */
  targetCharacter?: string
  /** 选择条件（空字符串 = 无条件） */
  condition?: string
}

/**
 * 场景脚本：描述剧本背景和角色出现
 */
export interface SceneScript {
  /** 背景图片路径 */
  background?: string
  /** 出现在场景中的角色及其表情 */
  characters?: { id: string; emotion: string; position?: 'left' | 'center' | 'right' }[]
}

/**
 * 将剧本节点序列化为 StepLabelType 数组
 *
 * 每个 StoryNode 被转换为一个异步函数，供 Pixi'VN 标签执行。
 * 转换过程中：
 *  - 对话/旁白节点 -> 更新 useGameStore 的状态
 *  - 选项节点 -> 展示选择菜单
 *  - 好感度变化 -> 更新 useAffinityStore
 *
 * @param nodes 剧本节点数组
 * @returns Pixi'VN StepLabelType 数组
 */
export function compileStory(nodes: StoryNode[]): StoryStep[] {
  return nodes.map((node: StoryNode) => {
    switch (node.type) {
      case '对话':
      case '旁白':
        return createDialogueStep(node)
      case '选项':
        return createChoiceStep(node)
      case '跳转':
        return createJumpStep(node)
      case '条件跳转':
        return createConditionalStep(node)
      case '好感度变化':
        return createAffinityStep(node)
      case '场景切换':
        return createSceneChangeStep(node)
      case '播放BGM':
        return createPlayMusicStep(node)
      case '停止BGM':
        return createStopMusicStep(node)
      case '播放音效':
        return createPlaySoundStep(node)
      case '等待':
        return createWaitStep(node)
      case '结束':
        return createEndStep()
      default:
        return async () => {}
    }
  })
}

/**
 * 注册一个剧本标签到 Pixi'VN 引擎
 */
export function registerLabel(
  labelId: string,
  nodes: StoryNode[]
): void {
  const steps = compileStory(nodes)
  newLabel(labelId, steps as unknown as import('@drincs/pixi-vn/narration').LabelSteps<Record<string, never>>)
  console.log(`[剧本] 已注册标签: ${labelId} (${steps.length} 步)`)
}

/* ============================================================
 * 内部：节点类型转步骤函数
 * ============================================================ */

function createDialogueStep(node: StoryNode): StoryStep {
  return async () => {
    if (node.text) {
      useGameStore.getState().showDialogue(node.speaker || '', node.text, node.emotion)
    }
    // 等待玩家点击继续
    await waitForClick()
  }
}

function createChoiceStep(node: StoryNode): StoryStep {
  return async () => {
    if (node.choices) {
      const choices = node.choices.map((c) => ({
        text: c.text,
        targetLabel: c.targetLabel,
        condition: c.condition,
      }))
      useGameStore.getState().showChoices(choices)
    }
    // 等待玩家做出选择
    const selectedIndex = await waitForChoice()
    const selected = node.choices?.[selectedIndex]

    // 应用好感度变化
    if (selected?.affinityDelta && selected?.targetCharacter) {
      useAffinityStore.getState().modifyAffinity(
        selected.targetCharacter,
        selected.affinityDelta,
        '对话选择'
      )
    }

    return { nextLabel: selected?.targetLabel }
  }
}

function createJumpStep(node: StoryNode): StoryStep {
  return async () => {
    if (node.targetLabel) {
      return { nextLabel: node.targetLabel }
    }
  }
}

function createConditionalStep(node: StoryNode): StoryStep {
  return async () => {
    if (!node.condition) return { nextLabel: node.falseLabel }
    const isTrue = evaluateCondition(node.condition)
    return { nextLabel: isTrue ? node.trueLabel : node.falseLabel }
  }
}

function createAffinityStep(node: StoryNode): StoryStep {
  return async () => {
    if (node.targetCharacter && node.affinityDelta) {
      useAffinityStore.getState().modifyAffinity(
        node.targetCharacter,
        node.affinityDelta,
        '剧情推进'
      )
    }
  }
}

function createSceneChangeStep(node: StoryNode): StoryStep {
  return async () => {
    if (node.assetPath) {
      useGameStore.getState().setSceneName(node.assetPath)
    }
  }
}

function createPlayMusicStep(_node: StoryNode): StoryStep {
  return async () => {
    // TODO: 集成 Pixi'VN 音效系统
  }
}

function createStopMusicStep(_node: StoryNode): StoryStep {
  return async () => {
    // TODO: 停止音乐
  }
}

function createPlaySoundStep(_node: StoryNode): StoryStep {
  return async () => {
    // TODO: 播放音效
  }
}

function createWaitStep(node: StoryNode): StoryStep {
  return async () => {
    const duration = node.waitDuration ?? 0
    if (duration > 0) {
      await new Promise<void>((resolve) => setTimeout(resolve, duration * 1000))
    }
  }
}

function createEndStep(): StoryStep {
  return async () => {
    useGameStore.getState().setPlayState('ended')
  }
}

/* ============================================================
 * 等待机制（供剧本步骤使用）
 * ============================================================ */

/** 等待玩家点击继续 */
function waitForClick(): Promise<void> {
  return new Promise<void>((resolve) => {
    const store = useGameStore.getState()
    if (store.textRevealComplete) {
      resolve()
      return
    }
    // 监听文本展示完成事件
    const unsubscribe = useGameStore.subscribe((state: { textRevealComplete: boolean }) => {
      if (state.textRevealComplete) {
        resolve()
      }
    })
    // 一次性的：resolve 后取消订阅
    // 注意: 这里简化了交互模型，真正实现需要接入点击事件
    setTimeout(() => {
      unsubscribe()
      resolve()
    }, 500)
  })
}

/** 等待玩家做出选择（返回选择索引） */
function waitForChoice(): Promise<number> {
  // 简化模型：实际实现中由 UI 组件调用 resolve
  return new Promise<number>((resolve) => {
    // 在 UI 层会调用 chooseCallback
    ;(window as unknown as Record<string, unknown>).__chooseCallback__ = (index: number) => {
      resolve(index)
    }
  })
}

/**
 * 评估条件表达式
 * 支持格式: "affinity.角色ID >= 数值"
 */
function evaluateCondition(condition: string): boolean {
  const match = condition.match(/^affinity\.(\w+)\s*(>=|<=|>|<|==|!=)\s*(\d+)$/)
  if (!match) {
    console.warn(`[剧本] 无法解析条件: ${condition}`)
    return false
  }

  const [, characterId, operator, valueStr] = match
  const value = parseInt(valueStr, 10)
  const affinity = useAffinityStore.getState().getAffinity(characterId)

  switch (operator) {
    case '>=': return affinity >= value
    case '<=': return affinity <= value
    case '>':  return affinity > value
    case '<':  return affinity < value
    case '==': return affinity === value
    case '!=': return affinity !== value
    default:   return false
  }
}

export default { compileStory, registerLabel }
