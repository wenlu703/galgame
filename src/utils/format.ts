/**
 * ============================================================
 * format.ts — 格式化工具函数集
 * ============================================================
 */

/**
 * 格式化游戏内时间（秒 → HH:MM:SS）
 */
export function formatPlayTime(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600)
  const m = Math.floor((totalSeconds % 3600) / 60)
  const s = totalSeconds % 60

  if (h > 0) {
    return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

/**
 * 格式化好感度数值为进度百分比字符串
 */
export function formatAffinityProgress(current: number, max: number = 400): string {
  const pct = Math.min(100, Math.round((current / max) * 100))
  return `${pct}%`
}

/**
 * 格式化日期为游戏内显示格式
 * @param dateStr "MM-DD" 格式
 */
export function formatBirthday(dateStr: string): string {
  const [month, day] = dateStr.split('-')
  return `${month}月${day}日`
}

/**
 * 截断字符串到指定长度
 */
export function truncate(str: string, maxLen: number): string {
  if (str.length <= maxLen) return str
  return str.slice(0, maxLen - 1) + '…'
}

/**
 * 数字分段显示（如 1234567 → 1,234,567）
 */
export function formatNumber(num: number): string {
  return num.toLocaleString('zh-CN')
}

/**
 * 关系阶段索引 → 中文显示名
 */
const STATUS_NAMES = ['陌生', '初见', '相识', '相知', '情感顶点']

export function getRelationshipName(index: number): string {
  return STATUS_NAMES[Math.min(index, STATUS_NAMES.length - 1)] ?? '未知'
}

export function getRelationshipIndex(name: string): number {
  const idx = STATUS_NAMES.indexOf(name)
  return idx >= 0 ? idx : 0
}

/**
 * 性格类型 → 中文描述
 */
const PERSONALITY_DESCRIPTIONS: Record<string, string> = {
  '温柔': '温柔体贴，善解人意',
  '冷酷': '外表冷漠，内心炽热',
  '活泼': '开朗阳光，充满活力',
  '文静': '安静内敛，喜欢独处',
  '傲娇': '口是心非，傲娇别扭',
  '神秘': '若即若离，难以捉摸',
  '成熟': '稳重可靠，值得信赖',
  '天真': '纯真无邪，天真烂漫',
}

export function getPersonalityDescription(personality: string): string {
  return PERSONALITY_DESCRIPTIONS[personality] ?? '未知性格'
}
