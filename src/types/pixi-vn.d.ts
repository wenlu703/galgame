/* ============================================================
 * Pixi'VN 模块增强声明
 * 扩展 StepLabelProps 添加导航和自定义方法
 * ============================================================ */
import 'react'

declare module '@drincs/pixi-vn' {
  /**
   * 扩展标签步骤的属性接口
   * 在每个剧情步骤中可通过 props 访问以下方法
   */
  interface StepLabelProps {
    /** 路由导航函数 */
    navigate: (route: string) => void
    /** 显示对话框文本 */
    showDialogue: (text: string, speaker?: string) => void
    /** 显示选项菜单 */
    showChoices: (choices: { text: string; label: string }[]) => void
    /** 播放音效 */
    playSound: (alias: string) => void
    /** 播放BGM */
    playMusic: (alias: string) => void
    /** 停止BGM */
    stopMusic: () => void
  }

  /**
   * 扩展步骤返回类型
   */
  interface StepLabelResult {
    nextLabel?: string
    [key: string]: unknown
  }
}

/* ============================================================
 * 全局 CSS 模块声明
 * ============================================================ */
declare module '*.css' {
  const content: Record<string, string>
  export default content
}

/* ============================================================
 * 资源文件声明
 * ============================================================ */
declare module '*.png' {
  const src: string
  export default src
}

declare module '*.jpg' {
  const src: string
  export default src
}

declare module '*.webp' {
  const src: string
  export default src
}

declare module '*.mp3' {
  const src: string
  export default src
}

declare module '*.ogg' {
  const src: string
  export default src
}

declare module '*.wav' {
  const src: string
  export default src
}
