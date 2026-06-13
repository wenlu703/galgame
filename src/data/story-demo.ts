/**
 * ============================================================
 * story-demo.ts — 游戏开场 Demo 剧本
 *
 * 第一个演示剧本：游戏开场 + 初遇主要角色 + 首个选择分支。
 * 用于验证整个剧本引擎和 UI 系统的串联。
 * ============================================================
 */
import { registerLabel, type StoryNode } from '@/narrative/StoryScript'

/**
 * 开场剧本：新学期的第一天
 */
const openingStory: StoryNode[] = [
  // ---- 开场 ----
  {
    type: '旁白',
    text: '春天，樱花盛开的季节……',
  },
  {
    type: '场景切换',
    assetPath: 'bg_school_gate',
  },
  {
    type: '旁白',
    text: '这是你在这所学校的最后一年。\n转学来的这个小镇，不知不觉已经过了两年。',
  },
  {
    type: '旁白',
    text: '今天的校门口和往常一样热闹，新生们带着期待的眼神打量着校园。而你，只想平安无事地度过最后一年。',
  },

  // ---- 初遇绫音 ----
  {
    type: '场景切换',
    assetPath: 'bg_classroom',
  },
  {
    type: '角色出现',
    targetCharacter: 'lingyin',
    emotion: 'smile',
  },
  {
    type: '对话',
    speaker: '绫音',
    text: '早上好！今天也是新学期第一天呢。',
    emotion: 'smile',
  },
  {
    type: '旁白',
    text: '月宫绫音——你的同班同学。从你转学来的第一天就对你很照顾。温柔的微笑让人感到安心。',
  },
  {
    type: '对话',
    speaker: '绫音',
    text: '怎么站在门口发呆？快进来吧，座位我已经帮你擦过了哦。',
    emotion: 'smile',
  },
  {
    type: '旁白',
    text: '她总是这样，默默地为别人做事，从不张扬。你点了点头，走进了教室。',
  },

  // ---- 认识其他角色 ----
  {
    type: '角色消失',
    targetCharacter: 'lingyin',
  },
  {
    type: '角色出现',
    targetCharacter: 'shigure',
    emotion: 'default',
  },
  {
    type: '旁白',
    text: '讲台上，一个气质清冷的女生正在整理学生名册。她是学生会会长——如月诗织。',
  },
  {
    type: '对话',
    speaker: '诗织',
    text: '……（她抬头看了你一眼，又若无其事地低下头继续手中的工作）',
    emotion: 'default',
  },
  {
    type: '旁白',
    text: '那冷淡的一瞥让人有些不自在。不过你听说她对待所有人都是如此。',
  },
  {
    type: '角色消失',
    targetCharacter: 'shigure',
  },

  // ---- 初遇菖蒲（学生会副会长） ----
  {
    type: '角色出现',
    targetCharacter: 'ayame',
    emotion: 'default',
  },
  {
    type: '旁白',
    text: '在学生会长离开后，另一个女生走近了讲台。她带着温和的微笑，但眼神中似乎隐藏着别的什么。',
  },
  {
    type: '对话',
    speaker: '菖蒲',
    text: '你好，我是一色菖蒲，学生会的副会长。新学期有什么不懂的可以来找我。',
    emotion: 'default',
  },
  {
    type: '旁白',
    text: '她的语气很客气，但总觉得那笑容背后藏着什么。你点了点头，记下了这个名字。',
  },
  {
    type: '角色消失',
    targetCharacter: 'ayame',
  },

  // ---- 初遇梨花老师 ----
  {
    type: '角色出现',
    targetCharacter: 'rika',
    emotion: 'default',
  },
  {
    type: '旁白',
    text: '上课铃响了。走进教室的是一位看起来非常年轻的女性——这学期新来的实习老师，橘梨花。',
  },
  {
    type: '对话',
    speaker: '梨花',
    text: '大、大家好……我是新来的实习老师橘梨花。那个……请多关照！',
    emotion: 'default',
  },
  {
    type: '旁白',
    text: '她看起来比学生还紧张。教室里响起了善意的笑声。',
  },
  {
    type: '角色消失',
    targetCharacter: 'rika',
  },

  // ---- 走廊上的邂逅 ----
  {
    type: '角色出现',
    targetCharacter: 'tsubaki',
    emotion: 'default',
  },
  {
    type: '旁白',
    text: '下课后，你在走廊上被一个女生叫住了。她胸前挂着相机，笑容里带着一丝狡黠。',
  },
  {
    type: '对话',
    speaker: '椿',
    text: '嘿，你是新来的……哦不对，你已经是第三年了！我是新闻部的伊达椿，能问你几个问题吗？就几个！',
    emotion: 'default',
  },
  {
    type: '旁白',
    text: '看起来你已经被新闻部盯上了。你礼貌地婉拒了她的采访请求，她也不气馁，说了句"下次再来找你"就蹦蹦跳跳地走了。',
  },
  {
    type: '角色消失',
    targetCharacter: 'tsubaki',
  },

  // ---- 第一个选择 ----
  {
    type: '旁白',
    text: '午休时间到了。你正准备拿出便当……',
  },
  {
    type: '选项',
    choices: [
      {
        text: '去天台一个人吃午饭',
        targetLabel: 'route_rooftop',
        affinityDelta: 0,
      },
      {
        text: '去教室找绫音一起吃',
        targetLabel: 'route_with_lingyin',
        targetCharacter: 'lingyin',
        affinityDelta: 5,
      },
      {
        text: '去图书馆看书',
        targetLabel: 'route_library',
        affinityDelta: 0,
      },
      {
        text: '去中庭走走，熟悉校园',
        targetLabel: 'route_courtyard',
        affinityDelta: 0,
      },
    ],
  },
]

/**
 * 天台路线（选项1）
 */
const rooftopRoute: StoryNode[] = [
  {
    type: '场景切换',
    assetPath: 'bg_rooftop',
  },
  {
    type: '旁白',
    text: '天台的风很舒服。你找了个角落坐下，打开了便当。',
  },
  {
    type: '角色出现',
    targetCharacter: 'kuro',
    emotion: 'default',
  },
  {
    type: '旁白',
    text: '……有人已经在这里了。一个陌生的黑发男生靠在围栏上，望着远方的天空。',
  },
  {
    type: '对话',
    speaker: '黑羽',
    text: '……（他好像注意到了你，但没有说话，只是微微点了点头）',
    emotion: 'default',
  },
  {
    type: '旁白',
    text: '你隐约记得他似乎和你同级，但从未说过话。他身上的气质有些与众不同……',
  },
  {
    type: '好感度变化',
    targetCharacter: 'kuro',
    affinityDelta: 3,
  },
  {
    type: '选项',
    choices: [
      {
        text: '主动和他搭话',
        targetLabel: 'start_talk_kuro',
        targetCharacter: 'kuro',
        affinityDelta: 5,
      },
      {
        text: '安静地吃完就走',
        targetLabel: 'start_silent',
        affinityDelta: 0,
      },
    ],
  },
]

/**
 * 搭话路线
 */
const talkKuroRoute: StoryNode[] = [
  {
    type: '对话',
    speaker: '黑羽',
    text: '……你是新来的？……不，你已经在这里两年了吧。',
    emotion: 'default',
  },
  {
    type: '旁白',
    text: '他居然知道。你有些意外。',
  },
  {
    type: '对话',
    speaker: '黑羽',
    text: '我叫黑羽。……没什么特别的，只是一个喜欢天台的人。',
    emotion: 'default',
  },
  {
    type: '旁白',
    text: '他似乎没有继续交谈的意愿。但你隐隐觉得，这个神秘的男生身上藏着什么故事。',
  },
  {
    type: '好感度变化',
    targetCharacter: 'kuro',
    affinityDelta: 5,
  },
  {
    type: '结束',
  },
]

/**
 * 安静路线
 */
const silentRoute: StoryNode[] = [
  {
    type: '旁白',
    text: '你安静地吃完了午饭，偶尔看一眼那个黑发男生的背影。',
  },
  {
    type: '旁白',
    text: '午休结束时，你起身离开天台。他也已经不见了踪影，仿佛从未出现过一样。',
  },
  {
    type: '结束',
  },
]

/**
 * 绫音路线（选项2）
 */
const withLingyinRoute: StoryNode[] = [
  {
    type: '场景切换',
    assetPath: 'bg_classroom',
  },
  {
    type: '角色出现',
    targetCharacter: 'lingyin',
    emotion: 'smile',
  },
  {
    type: '对话',
    speaker: '绫音',
    text: '哎呀，你来找我了？正好，我今天做了咖喱饭，多带了一些呢！',
    emotion: 'smile',
  },
  {
    type: '旁白',
    text: '绫音笑着从书包里拿出一个粉色的便当盒。里面装着的咖喱饭散发着诱人的香气。',
  },
  {
    type: '对话',
    speaker: '绫音',
    text: '来，尝一口看看！如果好吃的话，以后我可以天天给你做哦～',
    emotion: 'smile_happy',
  },
  {
    type: '旁白',
    text: '她的笑容让人感到温暖。这或许就是所谓的"日常"吧——平凡但珍贵的时光。',
  },
  {
    type: '好感度变化',
    targetCharacter: 'lingyin',
    affinityDelta: 8,
  },
  {
    type: '选项',
    choices: [
      {
        text: '"真的很好吃！"（热情回应）',
        targetLabel: 'route_lingyin_praise',
        targetCharacter: 'lingyin',
        affinityDelta: 5,
      },
      {
        text: '"嗯，还不错。"（故作淡定）',
        targetLabel: 'route_lingyin_cool',
        targetCharacter: 'lingyin',
        affinityDelta: 2,
      },
    ],
  },
]

const lingyinPraiseRoute: StoryNode[] = [
  {
    type: '对话',
    speaker: '绫音',
    text: '真的吗？太好了！\\n……以后我可以多做一点带过来。反正，顺路嘛。',
    emotion: 'blush',
  },
  {
    type: '旁白',
    text: '她微微脸红的样子，在午后的阳光下显得格外动人。',
  },
  {
    type: '好感度变化',
    targetCharacter: 'lingyin',
    affinityDelta: 5,
  },
  {
    type: '结束',
  },
]

const lingyinCoolRoute: StoryNode[] = [
  {
    type: '对话',
    speaker: '绫音',
    text: '……只是"还不错"吗？（笑）好吧，那我下次得更加努力才行呢。',
    emotion: 'smile',
  },
  {
    type: '旁白',
    text: '她并没有生气，反而似乎把你的冷淡当作了一种挑战。',
  },
  {
    type: '结束',
  },
]

/**
 * 图书馆路线（选项3）
 */
const libraryRoute: StoryNode[] = [
  {
    type: '场景切换',
    assetPath: 'bg_library',
  },
  {
    type: '旁白',
    text: '图书馆里很安静，只有翻书的声音偶尔打破寂静。',
  },
  {
    type: '角色出现',
    targetCharacter: 'yuki',
    emotion: 'default',
  },
  {
    type: '旁白',
    text: '靠窗的位置上，一个银发少女正沉浸在书中。她是氷上雪乃——你们班的文学少女。',
  },
  {
    type: '对话',
    speaker: '雪乃',
    text: '……（她抬头看了你一眼，轻轻点了点头，然后继续看书）',
    emotion: 'default',
  },
  {
    type: '旁白',
    text: '你找了一本书，在她对面的位置坐了下来。阳光透过窗户洒在桌面上，一切都那么宁静。',
  },
  {
    type: '好感度变化',
    targetCharacter: 'yuki',
    affinityDelta: 3,
  },

  // 夏目登场
  {
    type: '角色出现',
    targetCharacter: 'natsume',
    emotion: 'default',
  },
  {
    type: '旁白',
    text: '过了一会儿，图书委员夏目走到了你们这边。她看到雪乃，露出了温柔的笑容。',
  },
  {
    type: '对话',
    speaker: '夏目',
    text: '雪乃，有读者在找那本《银河铁道之夜》，我记得你刚还回来？',
    emotion: 'default',
  },
  {
    type: '对话',
    speaker: '雪乃',
    text: '……在还书架上。右数第三本。',
    emotion: 'default',
  },
  {
    type: '旁白',
    text: '简短到几乎没有的对话，但两人之间似乎有一种无需言说的默契。夏目向你笑了笑，然后走向了书架。',
  },
  {
    type: '角色消失',
    targetCharacter: 'natsume',
  },

  {
    type: '结束',
  },
]

/**
 * 中庭路线（选项4）
 */
const courtyardRoute: StoryNode[] = [
  {
    type: '场景切换',
    assetPath: 'bg_courtyard',
  },
  {
    type: '旁白',
    text: '中庭的樱花正在盛开，花瓣在微风中飘落。几名学生坐在长椅上享受午休时光。',
  },

  // 初遇皐月
  {
    type: '角色出现',
    targetCharacter: 'satsuki',
    emotion: 'default',
  },
  {
    type: '旁白',
    text: '花坛边，一个矮个子女生正蹲在那里，认真地对着花丛说着什么。',
  },
  {
    type: '对话',
    speaker: '皐月',
    text: '今天也开得很精神呢～啊！你好！',
    emotion: 'default',
  },
  {
    type: '旁白',
    text: '她注意到了你，有些不好意思地站了起来。原来是园艺部的一年生——百瀬皐月。',
  },
  {
    type: '对话',
    speaker: '皐月',
    text: '这些花是园艺部种的，漂亮吧？绫音学姐每天都来浇水呢！',
    emotion: 'default',
  },
  {
    type: '旁白',
    text: '她的笑容和花朵一样灿烂。你和她聊了一会儿关于花的话题，发现她虽然年纪小，但对植物的了解却不少。',
  },
  {
    type: '好感度变化',
    targetCharacter: 'satsuki',
    affinityDelta: 5,
  },
  {
    type: '角色消失',
    targetCharacter: 'satsuki',
  },

  // 初遇阳向
  {
    type: '角色出现',
    targetCharacter: 'hinata',
    emotion: 'default',
  },
  {
    type: '旁白',
    text: '远处，田径部的几个学生在跑步。其中跑在最前面的一个男生向你挥了挥手。',
  },
  {
    type: '对话',
    speaker: '阳向',
    text: '哟！新……哦不对，你也是老生啦！下午要不要一起来踢球？',
    emotion: 'default',
  },
  {
    type: '旁白',
    text: '日下部阳向——田径部的开心果，永远精力充沛。你婉拒了邀请，他也不介意，笑着跑远了。',
  },
  {
    type: '角色消失',
    targetCharacter: 'hinata',
  },

  // 初遇萤
  {
    type: '角色出现',
    targetCharacter: 'hotaru',
    emotion: 'default',
  },
  {
    type: '旁白',
    text: '中庭角落的一张长椅上，一个女生正拿着一个奇怪的装置对着天空比划。',
  },
  {
    type: '对话',
    speaker: '萤',
    text: '……嗯，今日的紫外线指数是中等，花粉浓度偏高，风向东南……哦，你好。',
    emotion: 'default',
  },
  {
    type: '旁白',
    text: '她转过头来，推了推眼镜。科学部的药袋萤——她手里的那个装置据说是她自制的气象检测仪。',
  },
  {
    type: '对话',
    speaker: '萤',
    text: '根据我的计算，十分钟后会有一阵微风。建议你在这个位置多待一会儿——这里是全中庭最舒服的角落。',
    emotion: 'default',
  },
  {
    type: '旁白',
    text: '她说话的语气就像在陈述一个科学事实。你决定相信她的计算，在原地享受了一会儿春日和风。',
  },
  {
    type: '好感度变化',
    targetCharacter: 'hotaru',
    affinityDelta: 3,
  },
  {
    type: '角色消失',
    targetCharacter: 'hotaru',
  },

  {
    type: '结束',
  },
]

/**
 * 注册所有 Demo 标签
 */
export function registerDemoStory(): void {
  registerLabel('start', openingStory)
  registerLabel('route_rooftop', rooftopRoute)
  registerLabel('route_with_lingyin', withLingyinRoute)
  registerLabel('route_library', libraryRoute)
  registerLabel('route_courtyard', courtyardRoute)
  registerLabel('start_talk_kuro', talkKuroRoute)
  registerLabel('start_silent', silentRoute)
  registerLabel('route_lingyin_praise', lingyinPraiseRoute)
  registerLabel('route_lingyin_cool', lingyinCoolRoute)
  console.log('[剧本] Demo 剧本已注册 (9 个标签)')
}
