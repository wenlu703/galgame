/**
 * ============================================================
 * storage.ts — 本地存储工具封装
 *
 * 提供类型安全的 localStorage 读写，支持 JSON 序列化。
 * ============================================================
 */

/**
 * 从 localStorage 读取并解析 JSON 数据
 */
export function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    if (raw === null) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

/**
 * 序列化并写入 localStorage
 */
export function saveToStorage<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data))
  } catch (e) {
    console.warn(`[Storage] 写入失败 key="${key}":`, e)
  }
}

/**
 * 从 localStorage 删除指定键
 */
export function removeFromStorage(key: string): void {
  try {
    localStorage.removeItem(key)
  } catch {
    // ignore
  }
}

/**
 * 检查 localStorage 是否可用
 */
export function isStorageAvailable(): boolean {
  try {
    const key = '__storage_test__'
    localStorage.setItem(key, '1')
    localStorage.removeItem(key)
    return true
  } catch {
    return false
  }
}
