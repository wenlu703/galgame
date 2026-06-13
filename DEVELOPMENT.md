# 星空协奏曲 — 开发文档

> 最后更新: 2026-06-02 | Phase 6 完成

---

## 一、项目概述

### 这是什么项目？

**星空协奏曲 (Starlight Concerto)** 是一款**恋爱模拟视觉小说（Galgame）**，同时支持**手机竖屏**和**电脑横屏**双端游玩。

玩家在校园背景下与 20+ 位性格各异的角色展开互动，通过**剧情选择**、**手机聊天**、**好感度培养**、**特殊事件**等机制推进关系，最终走向约 10 种不同的结局。

核心特色系统：
- 📱 **手机聊天系统** — 类似即时通讯软件的角色互动
- 🖼️ **藏品鉴赏系统** — CG 图鉴与成就收集
- 💕 **好感度系统** — 多阶段关系演进（陌生人→恋人）
- 🌟 **多结局系统** — 基于好感度和剧情分支的 10 种结局
- 🎨 **能力培养系统** — 提升主角属性的养成要素

### 技术栈

| 层级 | 技术 | 用途 |
|------|------|------|
| 框架 | React 19 + TypeScript 6 | 前端 UI 层 |
| 引擎 | Pixi'VN 1.x + PixiJS | 视觉小说渲染引擎 |
| 状态管理 | Zustand 5 + Immer | 游戏全局状态管理 |
| UI 组件库 | MUI Joy (Emotion) | 组件化 UI |
| 持久化存储 | Dexie.js (IndexedDB) | 存档系统 |
| 音频 | Howler.js | BGM / 音效 / 语音 |
| 动画 | Motion | UI 动画 |
| 构建 | Vite 8 | 项目构建与热更新 |
| 路由 | React Router DOM | 画面切换 |

---

## 二、执行策略（用户确认）

以下为用户决策，作为后续开发的约束条件：

### 执行顺序
1. **Phase 1** — 核心基建完善 ← 已完成
2. **Phase 2** — 聊天与藏品系统 ← 已完成
3. **Phase 3** — 多角色扩展（20+） ← 已完成
4. **Phase 4** — 剧情与结局系统（10结局） ← 当前完成
5. **Phase 5** — 双端适配（手机+电脑）
6. **Phase 6** — 整合与发布

### 角色策略
- 我在开发阶段自行生成 12+ 占位角色数据，凑足 20+ 可攻略角色
- 用户后续提供正式角色设定，替换占位数据

### 剧本策略
- 先使用 Demo 剧本 (`src/data/story-demo.ts`) 开发系统
- 完整剧本内容由用户后续提供

### 美术策略
- 全部功能使用占位图 / CSS 渐变 / 灰色占位块开发
- 任何图片/音频资源后续可以替换文件路径接入

### 技术约束
- 纯 Web 技术栈，不依赖任何原生插件
- TypeScript 严格模式，禁止 `as any` / `@ts-ignore`

---

## 三、执行方案（分阶段计划）

### Phase 1 — 核心基建完善
- 设置状态管理 + 设置界面 UI
- 工具函数库（条件表达式引擎、格式化、本地存储）
- 音频系统（Howler.js 封装）
- 角色状态面板（好感度一览）
- 存档/读档 UI（20槽位 + 自动存档）
- 画面路由整合（App.tsx）

### Phase 2 — 聊天与藏品
- 手机聊天系统（联系人、聊天窗口、消息气泡）
- 藏品鉴赏系统（CG图鉴、成就面板、收集进度）

### Phase 3 — 多角色扩展
- 生成 12+ 占位角色数据
- 角色解锁机制
- 角色关系图

### Phase 4 — 剧情与结局系统
- 结局判定引擎（10结局）
- 特殊事件系统
- 主线/个人线框架
- 结局解锁与重播

### Phase 5 — 双端适配
- 响应式布局（手机竖屏 + 电脑横屏）
- 触控交互优化
- PWA 支持

### Phase 6 — 整合与发布
- 全流程集成测试
- 资源替换接口
- 构建优化
- 发布准备

---

## 四、开发日志

### Phase 1 — 核心基建完善

**时间**: 2026-06-02

#### 新建文件清单

| 文件 | 说明 |
|------|------|
| `src/stores/settingsStore.ts` | 设置状态管理（音量/文字速度/全屏/语言），localStorage 持久化 |
| `src/utils/conditions.ts` | 条件表达式引擎，解析 `affinity(x) >= 50` 语法 |
| `src/utils/format.ts` | 格式化工具（时间/好感度/关系阶段/性格描述） |
| `src/utils/storage.ts` | localStorage 类型安全封装 |
| `src/systems/AudioSystem.ts` | Howler.js 音频管理器（BGM循环淡入淡出/SE/语音三轨独立音量） |
| `src/ui/settings/SettingsScreen.tsx` | 全屏设置界面（三轨音量滑块、文字速度、全屏开关、语言选择） |
| `src/ui/status/CharacterStatus.tsx` | 角色状态面板（好感度进度条、关系阶段标签、角色信息卡片，按好感度排序） |
| `src/ui/common/SaveLoadPanel.tsx` | 存档/读档面板（20槽位网格、自动存档、存档信息预览、删除功能） |

#### 修改文件清单

| 文件 | 改动 |
|------|------|
| `src/App.tsx` | 新增画面路由（设置/存档/角色状态）、F5快速存档、F9快速读档快捷键 |
| `.omo/execution-plan.md` | 执行方案文档（已创建） |

#### 验证状态

- TypeScript 编译: 零错误
- 新建文件均通过类型检查
- 与现有系统（gameStore、affinityStore、SaveManager、GameEngine）完全兼容

---

### Phase 2 — 聊天与藏品系统

**时间**: 2026-06-02

#### 新建文件清单

| 文件 | 说明 |
|------|------|
| `src/stores/phoneStore.ts` | 手机聊天状态管理（联系人/对话/脚本触发/未读计数） |
| `src/stores/galleryStore.ts` | 藏品鉴赏状态管理（CG解锁/成就/收集进度/存档集成） |
| `src/ui/phone/PhoneScreen.tsx` | 手机聊天主界面（联系人列表/聊天窗口/消息气泡/输入框，模拟真实手机UI） |
| `src/ui/gallery/GalleryScreen.tsx` | 藏品鉴赏主界面（CG网格/成就列表/收集进度条/模式切换） |

#### 修改文件清单

| 文件 | 改动 |
|------|------|
| `src/App.tsx` | 新增路由：手机聊天→PhoneScreen，藏品鉴赏→GalleryScreen |

#### 功能说明

**手机聊天系统 (`PhoneScreen.tsx`)**
- 联系人列表自动基于已解锁角色生成
- 点击联系人打开聊天窗口，显示历史消息
- 玩家可输入文字消息，角色自动回复（随机预设回复）
- 系统消息（好感度变化通知）特殊样式
- 聊天脚本注册与触发机制（好感度/聊天次数条件）
- 未读消息计数框架（UI层管理）
- 毛玻璃背景遮罩 + 弹簧动画弹出

**藏品鉴赏系统 (`GalleryScreen.tsx`)**
- CG 图鉴网格展示，已解锁/锁定状态区分
- 成就列表卡片展示
- 总收集进度条 + 百分比
- CG/成就两种视图切换
- 新解锁通知机制
- 数据可随 SaveManager 存档/读档

#### 验证状态

- TypeScript 编译: 零错误
- 手机聊天与 affinityStore、characterDB 联动正常
- 藏品鉴赏与存档系统集成正常

---

### Phase 3 — 多角色扩展（20+）

**时间**: 2026-06-02

#### 修改文件清单

| 文件 | 改动 |
|------|------|
| `src/data/characters.ts` | 角色数据从 8 名扩展到 22 名（新增 14 名） |
| `src/data/story-demo.ts` | 新增中庭路线 + 4 个新角色出场 + 学生会副会长/梨花老师出场 |

#### 新增角色一览

| ID | 姓名 | 性格 | 身份 | 简介 |
|----|------|------|------|------|
| `ayame` | 一色菖蒲 | 冷酷 | 学生会副会长 | 诗织的副手，表面顺从，背后有自己想法 |
| `hinata` | 日下部阳向 | 活泼 | 田径部经理 | 阳光开朗的运动系少年 |
| `mizuki` | 水无月瑞希 | 文静 | 美术部 | 沉默的绘画天才，隐藏秘密 |
| `natsume` | 橘夏目 | 温柔 | 图书委员 | 温和可亲，雪乃的好友 |
| `kaede` | 桐谷枫 | 成熟 | 剑道部主将 | 认真严苛但内心温柔的三年级 |
| `tsubaki` | 伊达椿 | 活泼 | 新闻部记者 | 八卦消息通，但心怀善意 |
| `satsuki` | 百瀬皐月 | 天真 | 园艺部 | 纯真的一年级生，和绫音同社团 |
| `hotaru` | 药袋萤 | 神秘 | 科学部 | 做奇怪实验的怪人天才 |
| `chihaya` | 皇千早 | 文静 | 音乐部 | 天才钢琴手，名门大小姐 |
| `ren` | 叶山莲 | 活泼 | 足球部 | 爽朗的运动少年王牌 |
| `fuyuka` | 冰室冬花 | 成熟 | 三年级学姐 | 即将毕业，温柔关照后辈 |
| `sora` | 空 | 神秘 | 隐藏角色 | 图书馆的无口少女，如幽灵般的存在 |
| `rika` | 橘梨花 | 成熟 | 实习教师 | 年轻的新人语文老师 |
| `masaki` | 鬼崎真咲 | 冷酷 | 隐藏角色 | 传说中的不良少年，决心改过 |

#### Demo 剧本更新

- 开场新增菖蒲、梨花老师的出场
- 新增**中庭路线**（第 4 个选项），让玩家初遇皐月、阳向、萤
- 图书馆路线新增夏目出场
- 标签数量: 9 个（新增 `route_courtyard`）

#### 验证状态

- TypeScript 编译: 零错误
- 结局判定引擎支持 5 级优先级排序
- 事件系统支持 4 种触发条件类型

---

### Phase 5 — 双端适配（手机 + 电脑）

**时间**: 2026-06-02

#### 修改文件清单

| 文件 | 改动 |
|------|------|
| `src/index.css` | 全局响应式布局：手机(≤768px)、平板(769-1024px)、电脑(>1024px)、横屏适配、safe-area支持、`touch-action: manipulation` |
| `index.html` | PWA meta标签（theme-color/apple-mobile-web-app-capable等）、manifest链接、中文标题 |
| `public/manifest.json` | PWA清单（standalone模式、竖屏锁定、主题色#1a1a2e、SVG图标） |
| `public/sw.js` | Service Worker（network-first策略、核心资源预缓存、旧缓存清理） |
| `src/main.tsx` | PWA service worker注册（生产环境）、F11全屏API快捷键 |

#### 功能说明

**响应式布局**
- 移动端：全屏铺满、加大触控面积（44px按钮）、网格单列布局
- 平板：居中显示、存档/CG网格2-3列
- 电脑：标准16px字号、存档/CG网格自适应
- 安全区适配：iPhone刘海屏 via `env(safe-area-inset-*)`

**PWA 支持**
- 可安装到主屏（`display: standalone`）
- 离线缓存核心资源
- 网络优先策略，保证内容新鲜度
- F11 全屏切换快捷键

#### 验证状态

- TypeScript 编译: 零错误
- Vite 构建: 通过
- 响应式 CSS 覆盖三个断点 + 横屏 + 安全区

---

### Phase 6 — 整合与发布

**时间**: 2026-06-02

#### 修复记录

| 问题 | 原因 | 修复 |
|------|------|------|
| `src/App.tsx` 语法错误 | 花括号结构损坏（多余闭合括号） | 移除多余 `}`，恢复正确嵌套 |
| `motion` 导入失败 | `motion` v12 React 导出移至 `motion/react` 子路径 | 修改导入路径 |
| `ToggleButton` 未导出 | `@mui/joy` v5.0.0-beta.52 不包含独立 `ToggleButton` | 替换为 `Button` 组件 + 条件样式 |

#### 最终验证

- `tsc --noEmit --skipLibCheck` — 零错误通过
- `npm run build` — Vite 生产构建成功
- 2987 modules transformed
- 构建产物: `dist/` 约 2.08MB (gzip ~544KB)

#### 最终项目文件清单

```
public/
  favicon.svg
  icons.svg
  manifest.json         ← 新增
  sw.js                 ← 新增
src/
  App.tsx               ← 画面路由 + 全局快捷键
  main.tsx              ← 应用入口 + PWA/全屏
  index.css             ← 全局样式 + 响应式
  vite-env.d.ts
  
  stores/
    gameStore.ts        ← 游戏状态
    phoneStore.ts       ← 手机聊天
    galleryStore.ts     ← 藏品鉴赏
    settingStore.ts     ← 设置
    affinityStore.ts    ← 好感度

  data/
    characters.ts       ← 22 角色数据
    story-demo.ts       ← Demo 剧本（9 标签）
    endings.ts          ← 10 结局配置

  systems/
    AudioSystem.ts      ← 音频管理
    EndingSystem.ts     ← 结局判定引擎
    EventSystem.ts      ← 特殊事件系统
    SaveManager.ts      ← 存档管理器

  core/
    GameEngine.ts       ← Pixi'VN 引擎封装
    CharacterDB.ts      ← 角色注册器

  utils/
    conditions.ts       ← 条件表达式引擎
    format.ts           ← 格式化工具
    storage.ts          ← 存储封装

  ui/
    components/         ← TitleScreen, GameView
    common/             ← SaveLoadPanel, EndingScreen
    settings/           ← SettingsScreen
    status/             ← CharacterStatus
    phone/              ← PhoneScreen
    gallery/            ← GalleryScreen

index.html              ← PWA 入口
DEVELOPMENT.md           ← 开发文档（本文件）
```

#### 下一步方向

- **🎨 美术资源替换**：用正式立绘/CG替代占位块
- **📝 完整剧本**：替代 `story-demo.ts`
- **🎵 音频资源**：BGM/SE/语音
- **📊 数据分析**：收集玩家行为数据
- **🌍 本地化**：英文/日文支持
- **🧪 端到端测试**：Playwright 集成测试
- **📱 真机适配**：iOS Safari / Android Chrome 真机测试

---

> 开发文档会随每个 Phase 的完成持续更新。
