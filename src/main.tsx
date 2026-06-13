/**
 * ============================================================
 * main.tsx — 应用入口
 *
 * 在 React 渲染前完成以下初始化：
 *  1. 注册所有角色数据
 *  2. 注册 Demo 剧情标签
 *  3. 挂载 React 应用
 * ============================================================
 */
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import { registerAllCharacters } from '@/data/characters'
import { registerDemoStory } from '@/data/story-demo'

// ---- 初始化游戏数据 ----
// 注册所有角色到 Pixi'VN 引擎
registerAllCharacters()
// 注册 Demo 剧情标签
registerDemoStory()

// ---- PWA Service Worker 注册 ----
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {
      // 静默失败，不影响游戏运行
    })
  })
}

// ---- 全屏 API 支持（F11 快捷键） ----
document.addEventListener('keydown', (e: KeyboardEvent) => {
  if (e.key === 'F11') {
    e.preventDefault()
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {
        // 某些浏览器可能不支持全屏
      })
    } else {
      document.exitFullscreen().catch(() => {})
    }
  }
})

// ---- 挂载 React 应用 ----
const rootElement = document.getElementById('root')
if (!rootElement) {
  throw new Error('找不到 root 元素')
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>
)
