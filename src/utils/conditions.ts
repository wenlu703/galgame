/**
 * ============================================================
 * conditions.ts — 条件表达式引擎
 *
 * 解析和求值剧本 DSL 中的条件表达式。
 * 支持简单的逻辑运算和好感度查询。
 * ============================================================
 */
import { useAffinityStore } from '@/stores/affinityStore'

/** 条件表达式节点 */
type ExprNode =
  | { type: 'literal'; value: boolean }
  | { type: 'and'; left: ExprNode; right: ExprNode }
  | { type: 'or'; left: ExprNode; right: ExprNode }
  | { type: 'not'; child: ExprNode }
  | { type: 'compare'; left: string; op: ComparisonOp; right: number }

type ComparisonOp = '>=' | '>' | '==' | '<' | '<='

/**
 * 友好的条件 DSL 语法：
 *
 *  "affinity(lingyin) >= 50"   — lingyin 好感度 ≥ 50
 *  "affinity(sakura) > 100"    — sakura 好感度 > 100
 *  "unlocked(rei)"             — rei 已解锁
 *  "true"                      — 恒真
 */
export type ConditionString = string

/** 分词器 */
function tokenize(expr: string): string[] {
  const tokens: string[] = []
  const regex = /([a-zA-Z_]\w*|[()]|>=|<=|>|<|==|&&|\|\||!|\s+)/g
  let match: RegExpExecArray | null
  let lastIndex = 0

  while ((match = regex.exec(expr)) !== null) {
    const token = match[1]
    if (token && !/^\s+$/.test(token)) {
      tokens.push(token)
    }
    lastIndex = regex.lastIndex
  }

  // 处理未匹配的剩余字符作为整体
  const rest = expr.slice(lastIndex).trim()
  if (rest) tokens.push(rest)

  return tokens
}

/** 简单的递归下降解析器 */
class ConditionParser {
  private tokens: string[]
  private pos: number

  constructor(expr: string) {
    this.tokens = tokenize(expr)
    this.pos = 0
  }

  parse(): ExprNode {
    return this.parseOr()
  }

  private peek(): string | undefined {
    return this.tokens[this.pos]
  }

  private consume(): string | undefined {
    return this.tokens[this.pos++]
  }

  private parseOr(): ExprNode {
    let left = this.parseAnd()
    while (this.peek() === '||') {
      this.consume()
      const right = this.parseAnd()
      left = { type: 'or', left, right }
    }
    return left
  }

  private parseAnd(): ExprNode {
    let left = this.parseNot()
    while (this.peek() === '&&') {
      this.consume()
      const right = this.parseNot()
      left = { type: 'and', left, right }
    }
    return left
  }

  private parseNot(): ExprNode {
    if (this.peek() === '!') {
      this.consume()
      return { type: 'not', child: this.parsePrimary() }
    }
    return this.parsePrimary()
  }

  private parsePrimary(): ExprNode {
    const token = this.peek()

    if (token === 'true') {
      this.consume()
      return { type: 'literal', value: true }
    }

    if (token === 'false') {
      this.consume()
      return { type: 'literal', value: false }
    }

    if (token === '(') {
      this.consume()
      const node = this.parseOr()
      this.consume() // )
      return node
    }

    // 函数调用形式: funcName(args...)
    if (token && /^[a-zA-Z_]\w*$/.test(token)) {
      const name = this.consume()!

      if (this.peek() === '(') {
        this.consume() // (
        const args: string[] = []
        while (this.peek() !== ')') {
          const arg = this.consume()
          if (arg && arg !== ',') args.push(arg)
          if (this.peek() === ',') this.consume()
        }
        this.consume() // )

        // 比较运算符: >=, <=, >, <, ==
        const opToken = this.peek()
        if (opToken && /^(>=|<=|>|<|==)$/.test(opToken)) {
          this.consume()
          const numToken = this.consume()
          const num = numToken ? Number(numToken) : 0
          return {
            type: 'compare',
            left: `${name}(${args.join(',')})`,
            op: opToken as ComparisonOp,
            right: num,
          }
        }

        // 无比较运算符的函数调用视为 boolean 断言
        return {
          type: 'compare',
          left: `${name}(${args.join(',')})`,
          op: '>=',
          right: 1,
        }
      }
    }

    // 纯数字
    if (token && /^\d+$/.test(token)) {
      this.consume()
      return { type: 'literal', value: token !== '0' }
    }

    // 未知 token → 当作 false
    this.consume()
    return { type: 'literal', value: false }
  }
}

/** 求值比较节点 */
function evalCompare(left: string, op: ComparisonOp, right: number): boolean {
  const state = useAffinityStore.getState()

  // affinity(characterId) → 获取好感度
  const affinityMatch = left.match(/^affinity\((\w+)\)$/)
  if (affinityMatch) {
    const charId = affinityMatch[1]
    const value = state.getAffinity(charId)
    return compareValues(value, op, right)
  }

  // unlocked(characterId) → 是否解锁
  const unlockedMatch = left.match(/^unlocked\((\w+)\)$/)
  if (unlockedMatch) {
    const charId = unlockedMatch[1]
    const charState = state.characterStates.get(charId)
    return compareValues(charState?.isUnlocked ? 1 : 0, op, right)
  }

  // relationship(characterId) ≥ N → 关系阶段索引
  const relMatch = left.match(/^relationship\((\w+)\)$/)
  if (relMatch) {
    const charId = relMatch[1]
    const charState = state.characterStates.get(charId)
    const statusOrder = ['陌生人', '相识', '朋友', '好友', '亲密', '恋人']
    const idx = charState ? statusOrder.indexOf(charState.status) : 0
    return compareValues(idx, op, right)
  }

  console.warn(`[条件引擎] 未知函数: ${left}`)
  return false
}

function compareValues(value: number, op: ComparisonOp, right: number): boolean {
  switch (op) {
    case '>=': return value >= right
    case '>':  return value > right
    case '==': return value === right
    case '<':  return value < right
    case '<=': return value <= right
  }
}

/** 求值表达式节点 */
function evalNode(node: ExprNode): boolean {
  switch (node.type) {
    case 'literal':
      return node.value
    case 'and':
      return evalNode(node.left) && evalNode(node.right)
    case 'or':
      return evalNode(node.left) || evalNode(node.right)
    case 'not':
      return !evalNode(node.child)
    case 'compare':
      return evalCompare(node.left, node.op, node.right)
  }
}

/**
 * 判断条件字符串是否为 true
 * @param condition 条件表达式，空字符串视为 true
 * @example
 *   evaluateCondition('affinity(lingyin) >= 50')
 *   evaluateCondition('unlocked(sakura) && affinity(sakura) > 100')
 *   evaluateCondition('') // true
 */
export function evaluateCondition(condition: ConditionString | undefined | null): boolean {
  if (!condition || condition.trim() === '') return true

  try {
    const parser = new ConditionParser(condition)
    const ast = parser.parse()
    return evalNode(ast)
  } catch (e) {
    console.warn(`[条件引擎] 解析失败: "${condition}"`, e)
    return false
  }
}

/**
 * 从条件列表中筛选出可用的选项索引
 */
export function filterAvailableChoices(
  conditions: (ConditionString | undefined)[]
): number[] {
  return conditions
    .map((cond, idx) => ({ idx, available: evaluateCondition(cond) }))
    .filter((item) => item.available)
    .map((item) => item.idx)
}
