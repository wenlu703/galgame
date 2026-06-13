/**
 * ============================================================
 * endings.ts — 结局配置数据
 *
 * 定义游戏中全部 10 种结局的配置，包括触发条件、
 * 标题、描述和对应的剧本标签。
 *
 * 注册到 EndingSystem 使用。
 * ============================================================
 */
import endingSystem from '@/systems/EndingSystem'

/**
 * 注册所有结局到结局引擎
 */
export function registerAllEndings(): void {
  endingSystem.registerEndings(ENDINGS)
  console.log(`[结局] 已注册 ${ENDINGS.length} 种结局`)
}

/**
 * 10 种结局配置
 *
 * 判定逻辑（按优先级）：
 * 1. 隐藏结局 — 特殊复合条件
 * 2. True End — 好感度≥400 + 触发全部特殊事件
 * 3. Normal End — 好感度≥81
 * 4. 友情结局 — 兜底，无角色达到好感度≥81
 */
export const ENDINGS = [
  // ==================== 角色 True End（5 个） ====================

  {
    id: 'ending_true_lingyin',
    title: '平凡却温暖的日常',
    description:
      '樱花瓣飘落的春天，你和她并肩走在熟悉的街道上。没有惊天动地的告白，只有一句"明天，也想和你一起吃午饭"。',
    type: 'true' as const,
    characterId: 'lingyin',
    unlocked: false,
    isHidden: false,
    labelId: 'end_true_lingyin',
  },
  {
    id: 'ending_true_shigure',
    title: '融化的冰之心',
    description:
      '学生会办公室里，她第一次露出了不带任何防备的笑容。"我可能……比我自己想象中更依赖你。"窗外的雨不知何时停了。',
    type: 'true' as const,
    characterId: 'shigure',
    unlocked: false,
    isHidden: false,
    labelId: 'end_true_shigure',
  },
  {
    id: 'ending_true_yuki',
    title: '不再孤独的阅读者',
    description:
      '图书馆的窗边，她合上手中的书，轻声说："比起书中的故事，和你在一起的时光……更加精彩。"阳光洒在她微笑的脸上。',
    type: 'true' as const,
    characterId: 'yuki',
    unlocked: false,
    isHidden: false,
    labelId: 'end_true_yuki',
  },
  {
    id: 'ending_true_akane',
    title: '青梅竹马的真实心意',
    description:
      '"……从小时候开始，你就一直在逞强。"你轻声说道。茜红着脸别过头去，但嘴角却忍不住上扬——这次，她终于不再否认了。',
    type: 'true' as const,
    characterId: 'akane',
    unlocked: false,
    isHidden: false,
    labelId: 'end_true_akane',
  },
  {
    id: 'ending_true_chihaya',
    title: '跨越阶层的旋律',
    description:
      '音乐厅的舞台上，她弹完了最后一首曲子。在雷鸣般的掌声中，她的目光越过人群，落在了你身上。那首曲子的名字是——《你》。',
    type: 'true' as const,
    characterId: 'chihaya',
    unlocked: false,
    isHidden: false,
    labelId: 'end_true_chihaya',
  },

  // ==================== 角色 Normal End（3 个） ====================

  {
    id: 'ending_normal_sakura',
    title: '与你同行的明天',
    description:
      '"前辈！今天也一起回家吧！"小樱的笑容一如既往地灿烂。也许这不是最浪漫的结局，但我们还有大把的时间，去书写属于我们的故事。',
    type: 'normal' as const,
    characterId: 'sakura',
    unlocked: false,
    isHidden: false,
    labelId: 'end_normal_sakura',
  },
  {
    id: 'ending_normal_aoi',
    title: '纯真之恋',
    description:
      '"那个……我喜欢你！"葵红着脸说出了这句话，仿佛用尽了全身的力气。她的眼神天真而坚定，让人无法拒绝。',
    type: 'normal' as const,
    characterId: 'aoi',
    unlocked: false,
    isHidden: false,
    labelId: 'end_normal_aoi',
  },
  {
    id: 'ending_normal_rei',
    title: '成熟大人的约会',
    description:
      '"要一起去喝杯咖啡吗？"学姐笑着发出了邀请。和成熟稳重的她在一起，即使是平凡的日常，也显得格外安心。',
    type: 'normal' as const,
    characterId: 'rei',
    unlocked: false,
    isHidden: false,
    labelId: 'end_normal_rei',
  },

  // ==================== 友情结局（1 个） ====================

  {
    id: 'ending_friendship',
    title: '星空下的约定',
    description:
      '毕业典礼结束后，你和朋友们一起来到了天台。星空下，大家约定——不管走到哪里，都要记得这段共同度过的时光。也许不是爱情，但这份羁绊同样珍贵。',
    type: 'friendship' as const,
    unlocked: false,
    isHidden: false,
    labelId: 'end_friendship',
  },

  // ==================== 隐藏结局（1 个） ====================

  {
    id: 'ending_hidden_stargazer',
    title: '观星者',
    description:
      '天文台上，三个人同时望向你。黑羽、空、萤——这些平时独来独往的人，此刻都因为你的存在而聚集在这里。"你，看到了吗？"萤指着星空问道。你抬头，看见了从未见过的绚烂银河。',
    type: 'hidden' as const,
    unlocked: false,
    isHidden: true,
    labelId: 'end_hidden_stargazer',
  },
]
