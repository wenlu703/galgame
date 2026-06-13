# 星空协奏曲 — 完整执行方案

**项目经理**: Sisyphus (AI Orchestrator)  
**编制日期**: 2026-06-02  
**项目状态**: Phase 0 — 方案确认阶段  

---

## 一、项目总览

### 1.1 项目定位

中大型恋爱模拟视觉小说（Galgame），在手机和电脑双端均可游玩。

### 1.2 核心指标

| 指标 | 目标 |
|------|------|
| 可攻略角色 | 20+（含隐藏角色） |
| 最终结局 | ~10 种（单角色结局 + 复合条件结局 + 隐藏结局） |
| 特色系统 | 手机聊天、藏品鉴赏、好感度、特殊事件、能力培养 |
| 目标平台 | 手机竖屏 + 电脑横屏（响应式） |

### 1.3 技术栈

| 层 | 技术 | 用途 |
|----|------|------|
| 框架 | React 19 + TypeScript 6 | UI 层 |
| 引擎 | Pixi'VN 1.x + PixiJS | 视觉小说渲染引擎 |
| 状态管理 | Zustand 5 + Immer | 游戏状态管理 |
| UI 库 | MUI Joy | 组件库 |
| 存储 | Dexie.js (IndexedDB) | 存档/读档 |
| 音频 | Howler.js | BGM/音效 |
| 路由 | React Router | 画面切换 |
| 动画 | Motion | UI 动画 |
| 构建 | Vite 8 | 构建工具 |

---

## 二、当前已完成模块（Phase 0 交付物）

| 模块 | 完成度 | 文件 |
|------|--------|------|
| 游戏引擎封装 | 100% | `src/core/GameEngine.ts` |
| 存档管理器 | 100% | `src/core/SaveManager.ts` |
| 剧本 DSL | 100% | `src/narrative/StoryScript.ts` |
| 游戏主状态 | 100% | `src/stores/gameStore.ts` |
| 好感度状态 | 100% | `src/stores/affinityStore.ts` |
| 角色数据库 | 100% | `src/characters/CharacterDB.ts` |
| 角色定义(8名) | 100% | `src/data/characters.ts` |
| Demo 剧本 | 100% | `src/data/story-demo.ts` |
| 标题画面 | 100% | `src/ui/components/TitleScreen.tsx` |
| 游戏主视图 | 100% | `src/ui/components/GameView.tsx` |
| 对话框 | 100% | `src/ui/components/DialogBox.tsx` |
| 选项面板 | 100% | `src/ui/components/ChoicePanel.tsx` |
| 角色立绘占位 | 100% | `src/ui/components/CharacterView.tsx` |
| 应用入口 | 100% | `src/main.tsx`, `src/App.tsx` |
| 类型声明 | 100% | `src/types/pixi-vn.d.ts` |

---

## 三、总体架构设计

### 3.1 目录结构规划（终态）

```
src/
├── main.tsx                    # 入口
├── App.tsx                     # 根组件 + 画面路由
├── index.css                   # 全局样式 (含移动端适配)
│
├── core/                       # 核心引擎
│   ├── GameEngine.ts           # Pixi'VN 引擎封装
│   └── SaveManager.ts          # 存档管理器
│
├── characters/                 # 角色系统
│   ├── CharacterDB.ts          # 角色数据库（类型定义 + 注册）
│   ├── characters.ts           # 角色数据（20+）
│   └── relations.ts            # 角色关系图
│
├── narrative/                  # 剧本系统
│   ├── StoryScript.ts          # 剧本 DSL + 编译器
│   ├── story-main.ts           # 主线剧本
│   ├── story-routes/           # 各角色路线剧本
│   └── story-events/           # 特殊事件剧本
│
├── stores/                     # 状态管理
│   ├── gameStore.ts            # 游戏主状态
│   ├── affinityStore.ts        # 好感度状态
│   ├── phoneStore.ts           # 手机聊天状态
│   ├── galleryStore.ts         # 藏品/成就状态
│   └── settingsStore.ts        # 设置状态
│
├── ui/                         # UI 层
│   ├── components/             # 通用组件
│   │   ├── TitleScreen.tsx     # 标题画面
│   │   ├── GameView.tsx        # 游戏主画面
│   │   ├── DialogBox.tsx       # 对话框
│   │   ├── ChoicePanel.tsx     # 选项面板
│   │   └── CharacterView.tsx   # 角色立绘
│   │
│   ├── phone/                  # 手机聊天系统
│   │   ├── PhoneScreen.tsx     # 手机主画面
│   │   ├── ChatList.tsx        # 聊天列表
│   │   ├── ChatWindow.tsx      # 聊天窗口
│   │   └── MessageBubble.tsx   # 消息气泡
│   │
│   ├── gallery/                # 藏品鉴赏系统
│   │   ├── GalleryScreen.tsx   # 图鉴主画面
│   │   ├── CGGallery.tsx       # CG 图鉴
│   │   ├── AchievementPanel.tsx# 成就面板
│   │   └── CollectionProgress.tsx # 收集进度
│   │
│   ├── status/                 # 角色状态
│   │   └── CharacterStatus.tsx # 好感度/角色状态一览
│   │
│   ├── settings/               # 设置
│   │   └── SettingsScreen.tsx  # 设置画面
│   │
│   └── common/                 # 公共 UI 组件
│       ├── SaveLoadPanel.tsx   # 存档/读档面板
│       └── EndingScreen.tsx    # 结局画面
│
├── systems/                    # 游戏系统
│   ├── AudioSystem.ts          # 音频管理
│   ├── EndingSystem.ts         # 结局判定引擎
│   ├── EventSystem.ts          # 特殊事件触发
│   └── ScheduleSystem.ts       # 日程/时间系统
│
├── data/                       # 游戏数据
│   ├── characters.ts           # 角色注册
│   ├── story-demo.ts           # Demo 剧本
│   └── endings.ts              # 结局配置
│
├── types/                      # 类型声明
│   ├── pixi-vn.d.ts            # Pixi'VN 扩展类型
│   └── assets.d.ts             # 资源文件声明
│
└── utils/                      # 工具函数
    ├── conditions.ts           # 条件表达式引擎
    ├── format.ts               # 格式化工具
    └── storage.ts              # 本地存储工具
```

### 3.2 数据流架构

```
Pixi'VN Engine ←→ GameEngine (single)
      ↕
  React UI Layer
      ↕
  Zustand Stores (gameStore, affinityStore, phoneStore, galleryStore, settingsStore)
      ↕
  React Components (consume stores via hooks)
      ↕
  SaveManager (Dexie/IndexedDB)
```

### 3.3 状态流转

```
标题画面 → 剧情模式 → 游戏内菜单 ←→ 手机聊天
   ↕                      ↕             ↕
  存档界面              设置          角色状态
                          ↕
                       藏品鉴赏
```

---

## 四、分阶段执行计划

### Phase 1 — 核心基建完善（预计工作量：高）

**目标**：完善基础设施，让项目具备可扩展性。

#### 1.1 设置界面 (SettingsScreen)

| 内容 | 说明 |
|------|------|
| 📄 **文件** | `src/ui/settings/SettingsScreen.tsx`, `src/stores/settingsStore.ts` |
| 功能 | 音量设置（BGM/SE/语音三轨）、文字速度、全屏切换、语言切换 |
| 验证 | 设置面板可在标题和游戏内打开，所有滑块/开关生效 |
| **我不会做的** | 多语言实际翻译文本（只做切换框架） |

#### 1.2 角色状态面板 (CharacterStatus)

| 内容 | 说明 |
|------|------|
| 📄 **文件** | `src/ui/status/CharacterStatus.tsx` |
| 功能 | 所有已解锁角色的好感度条、关系阶段图标、角色简介卡片 |
| 验证 | 好感度变化后面板数据同步更新 |

#### 1.3 音频系统 (AudioSystem)

| 内容 | 说明 |
|------|------|
| 📄 **文件** | `src/systems/AudioSystem.ts` |
| 功能 | BGM循环/淡入淡出、SE一次播放、音量控制、音频预加载 |
| 库依赖 | Howler.js（已在 package.json） |
| 验证 | 调用 playBGM('title') 后音频播放 |
| **限制** | 需要你提供实际音频文件，我用占位逻辑确保代码完整可运行 |

#### 1.4 工具函数库 (Utils)

| 内容 | 说明 |
|------|------|
| 📄 **文件** | `src/utils/conditions.ts`, `src/utils/format.ts`, `src/utils/storage.ts` |
| 功能 | 条件表达式引擎增强、时间/数值格式化、localStorage 封装 |

#### 1.5 存档/读档 UI

| 内容 | 说明 |
|------|------|
| 📄 **文件** | `src/ui/common/SaveLoadPanel.tsx` |
| 功能 | 20个存档槽位的可视化网格、时间/场景预览、自动存档标记 |
| 验证 | 存档后重新打开页面可读档恢复进度 |

---

### Phase 2 — 聊天与藏品（预计工作量：高）

**目标**：实现最有特色的两个子系统。

#### 2.1 手机聊天系统

**核心文件**：`src/ui/phone/`, `src/stores/phoneStore.ts`

| 功能 | 详细说明 |
|------|----------|
| 聊天列表 | 类似微信的联系人列表，显示最后一条消息和时间 |
| 聊天窗口 | 消息气泡（左/右）、文字/选项/好感度通知卡片 |
| 角色回复逻辑 | 好感度影响对话树分支、特定对话触发特殊事件 |
| 日程限制 | 每日可聊次数、不同时间段（朝/昼/夜）话题不同 |
| 推送通知模拟 | 新消息到达时有提示动画 |

**手机界面方案**：游戏内点击"手机"按钮 → 全屏覆盖手机界面（模拟真实手机），UI采用竖屏布局。

#### 2.2 藏品鉴赏系统

**核心文件**：`src/ui/gallery/`, `src/stores/galleryStore.ts`

| 功能 | 详细说明 |
|------|----------|
| CG 图鉴 | 网格展示所有 CG，已解锁/未解锁状态 |
| 成就系统 | 成就列表（收集类/剧情类/隐藏类） |
| 收集进度 | 各角色收集百分比、总进度条 |
| 解锁动画 | 新藏品解锁时的特效展示 |

**数据结构**：

```typescript
interface GalleryItem {
  id: string
  type: 'cg' | 'achievement'
  title: string
  description: string
  characterId?: string
  unlockCondition: string   // 解锁条件描述
  unlocked: boolean
  assetPath: string         // 占位图路径
}
```

---

### Phase 3 — 多角色扩展（预计工作量：中）

**目标**：从 8 名角色扩展到 20+ 名,建立完整的角色生态。

#### 3.1 剩余角色生成（12+ 名）

我将生成符合 galgame 风格的角色配置数据，包含：
- 角色 ID、姓名（中日混合风格）
- 性格类型（覆盖 8 种已定义性格）
- 年龄、生日、喜好/厌恶
- 初始好感度事件触发条件
- 解锁条件（主线进度/好感度阈值）

> ⚠️ **这些角色是占位用的**，等你后续提供正式设定后替换。每个角色都会有一个"锁定/未解锁"状态，在主线中逐步解锁。

**建议角色类型分布**：

| 类型 | 数量 | 示例性格 |
|------|------|----------|
| 主要女主角 | 6-8 | 温柔、傲娇、冷酷、活泼、文静、成熟 |
| 次要攻略角色 | 8-10 | 天真、神秘、治愈系、元气、姐姐系、妹系 |
| 隐藏角色 | 2-4 | 特殊解锁条件 |

#### 3.2 角色关系图

```typescript
interface CharacterRelation {
  from: string
  to: string
  type: '友達' | 'ライバル' | '姉妹' | '先輩後輩' | '不明'
  description: string
}
```

---

### Phase 4 — 剧情与结局系统（预计工作量：非常高）

**目标**：实现完整的剧情框架和 10 种结局。

#### 4.1 主线剧情框架

每条角色线包含：
1. **相遇事件**（解锁角色）
2. **日常互动**（3-5 段，好感度缓慢增长）
3. **核心事件**（好感度到达阈值触发）
4. **感情转折**（选择分支决定走向）
5. **结局分岐**（最终选择决定结局）

#### 4.2 结局系统

**结局判定引擎**（`src/systems/EndingSystem.ts`）：

| 结局类型 | 条件 | 数量 |
|----------|------|------|
| 单人 True End | 特定角色好感度 ≥ 400 + 通关该角色全部特殊事件 | 8 |
| 单人 Normal End | 特定角色好感度 ≥ 200 | 8 |
| 友情结局 | 无角色达到恋人阶段 | 1 |
| 隐藏结局 | 满足特殊复合条件 | 1 |

**实际实现**：我会优先实现**3 条完整角色线 + 通用结局框架**，其余角色线在剧本内容提供后可通过配置文件快速添加。

#### 4.3 特殊事件系统

- 好感度触发（≥ 阈值时自动进入事件场景）
- 日程触发（特定天数/时段）
- 复合条件触发（多个角色的好感度组合）
- 事件锁定（必须先完成前置事件）

---

### Phase 5 — 双端适配（预计工作量：中）

| 项目 | 说明 |
|------|------|
| 响应式布局 | 手机竖屏（≤768px）vs 电脑横屏，对话框/选项/立绘自适应 |
| 触控优化 | 滑动手势（切换场景）、长按（快进）、双击（自动模式） |
| PWA | manifest.json + Service Worker，可安装到手机桌面 |
| 性能 | 移动端渲染优化、资源懒加载、内存管理 |

---

### Phase 6 — 整合与发布（预计工作量：中）

| 项目 | 说明 |
|------|------|
| 全流程测试 | 从标题→剧情→结局 完整流程走通 |
| 资源替换接口 | 占位图→正式图的替换方案（只需替换文件路径） |
| 构建配置 | Vite 构建优化、分包策略、CDN 部署 |
| 发布包 | 生成可直接运行的构建产物 |

---

## 五、风险与限制

### 已知限制

| 风险 | 影响 | 缓解方案 |
|------|------|----------|
| **大量剧本内容** | 高质量恋爱剧情文本需要人类创作 | Demo阶段我先用AI生成占位剧本，等正式内容到位后替换 |
| **20+角色立绘** | 每个角色需要多表情立绘 | 我用CSS占位块/Card开发全部功能，替换只需更改图片路径 |
| **手机触控体验** | 触控交互需要专门优化 | Phase 5 集中处理，先用鼠标交互开发全部功能 |
| **性能** | PixiJS + React 双端渲染 | 懒加载、虚拟列表、Canvas 缓存策略 |
| **我的能力边界** | 我无法处理native插件/原生模块 | 所有功能基于 Web 技术栈，不依赖原生插件 |

### 遇到问题的处理原则

1. **技术决策** → 我会先出 2-3 个方案并说明权衡，让你选择
2. **架构变更** → 先征求你的意见再执行
3. **功能取舍** → 优先保证核心玩法完整，非核心功能做框架
4. **错误处理** → 代码中全面加入错误捕获和降级策略

---

## 六、下一步

确认本方案后，我将：

1. 在 `todowrite` 中创建 Phase 1 的详细任务列表
2. 开始 Phase 1（核心基建）的开发和实现
3. 每个 Phase 完成后给你进度汇报，确认后再进入下一阶段

**请你回答**：这个方案整体是否符合你的预期？有没有需要调整的部分？
