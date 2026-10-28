window.__ModuleLoader__.load({
  id: '@local/dsh-persona',
  factory(require) {
    const React = require('react')
    const h = React.createElement
    const { useCallback, useEffect, useMemo, useRef, useState } = React

    const API = '/dsh-persona/api'

    /** 宿主服务句柄：apply 时尽量抓一下，抓不到就走图标入口。 */
    const RUNTIME = { layout: null, t: (key) => key }

    /** 与宿主同一套解析：把「09:00-12:00, 14:00-18:00」变成当天分钟区间（跨夜拆两段）。 */
    function clientBusyRanges(raw) {
      const text = typeof raw === 'string' ? raw : ''
      const segments = []
      const pattern = /(\d{1,2})\s*[:：]\s*(\d{2})\s*(?:-|~|—|–|至|到)\s*(\d{1,2})\s*[:：]\s*(\d{2})/g
      let match
      while ((match = pattern.exec(text)) !== null) {
        const hour = [Number(match[1]), Number(match[3])]
        const minute = [Number(match[2]), Number(match[4])]
        if (hour[0] > 23 || minute[0] > 59 || hour[1] > 23 || minute[1] > 59) continue
        const start = hour[0] * 60 + minute[0]
        const end = hour[1] * 60 + minute[1]
        if (start === end) {
          segments.push({ start: 0, end: 1440 })
        } else if (start < end) {
          segments.push({ start, end })
        } else {
          segments.push({ start, end: 1440 })
          segments.push({ start: 0, end })
        }
      }
      segments.sort((a, b) => a.start - b.start)
      const merged = []
      for (const segment of segments) {
        const last = merged[merged.length - 1]
        if (last !== undefined && segment.start <= last.end) last.end = Math.max(last.end, segment.end)
        else merged.push({ ...segment })
      }
      return merged
    }

    /** 此刻落在哪一档：只在分档打开、且命中了时段时才算高峰。 */
    function peekBandNow(draft) {
      if (draft?.peekScheduleEnabled !== true) return 'idle'
      const ranges = clientBusyRanges(draft.peekBusyRanges)
      if (ranges.length === 0) return 'idle'
      const now = new Date()
      const minutes = now.getHours() * 60 + now.getMinutes()
      return ranges.some((range) => minutes >= range.start && minutes < range.end) ? 'busy' : 'idle'
    }

    const ZH = {
      'dock.active': '人格',
      'dock.choose': '选择人格',
      'dock.off': '关闭人格',
      'dock.none': '不使用人格',
      'dock.search': '搜索人格…',
      'dock.refresh': '刷新',
      'dock.openPanel': '打开完整面板',
      'dock.openPanelHint': '跳到左侧栏的人格页面，管卡片和记忆',
      'dock.openPanelFallback': '没拿到布局服务，点左侧栏的「人格」图标打开。',
      'dock.empty': '还没有人格卡。可以在聊天里说“创建一个人格，叫…”。',
      'dock.loading': '载入中…',
      'dock.close': '关闭',
      'dock.preview': '查看自我认知',
      'dock.previewHint': '当前会话这一步实际注入的内容（静态人格卡 + 场景与正史）',
      'dock.previewChars': '字符',
      'dock.thin': '这张卡的自我认知还比较薄。可以点下面的“补完自我认知”，让模型把性格、喜好、习惯和过去补具体。',
      'settings.title': '人格库',
      'nav.persona': '人格',
      'settings.desc': '人格卡独立保存；每个会话可单独绑定。切换后会注入完整的自我认知（性格、喜好、习惯、背景），聊天中也能让人格工具实时补充。',
      'settings.new': '新建人格',
      'settings.save': '保存',
      'settings.saving': '保存中…',
      'settings.delete': '删除',
      'settings.enrich': '补完自我认知',
      'settings.enriching': '补完中…',
      'settings.enriched': '已补完',
      'settings.enrichNone': '字段已经比较完整，没有可补的。',
      'settings.enrichHint': '调用当前模型，把空着的性格、喜好、习惯、背景补成可演的具体内容；已有的设定不会被覆盖。',
      'settings.export': '导出',
      'settings.import': '导入',
      'settings.select': '选择左侧人格卡开始编辑',
      'settings.name': '名字',
      'settings.summary': '一句话设定',
      'settings.masterName': '对主人的称呼',
      'settings.masterNameHint': '默认「主人」；填别的（哥哥、老板、爸爸）会固定成这个称呼，并写进标签锚点。',
      'settings.maxReplyChars': '单次回复字数上限',
      'settings.maxReplyCharsHint': '0 表示不限制；例如 300 表示尽量每次回复不超过 300 字。',
      'settings.useActions': '回复里带动作描述（用括号）',
      'settings.useActionsHint': '例如（搬小板凳）（尾巴拍了一下地板）。一段回复最多一个，不写成旁白或心理描写。',
      'settings.useMemes': '允许发表情包',
      'settings.memeFrequency': '表情包频率（%）',
      'settings.memeFrequencyHint': '0–100：平均每 100 条回复里带图的条数，30 约等于三条一张。需要在装发图工具（send_meme）的环境里才生效。',
      'settings.peekEnabled': '窥屏默认开关（会话没单独设置时用这个）',
      'settings.peekEnabledHint': '默认关。打开后按间隔截一张屏，再按概率决定要不要主动搭话。单个会话可以在聊天框上方的「窥屏」按钮里单独开关，互不影响。只在 Windows、且这个会话空闲时生效，截图只留在本机。',
      'settings.peekScheduleEnabled': '按高峰 / 空闲分档',
      'settings.peekScheduleHint': '开：高峰时段用「高峰」那组间隔和概率，其余时间用「空闲」那组。关：全天共用空闲那组。',
      'settings.peekBusyRanges': '高峰时段（本机时间）',
      'settings.peekBusyRangesHint': '24 小时制，逗号分隔多个区间，例如 09:00-12:00, 14:00-18:00；跨夜写 22:00-02:00。留空 = 没有高峰。',
      'settings.peekEveryMinutes': '空闲：多久看一次（分钟）',
      'settings.peekChance': '空闲：搭话概率（%）',
      'settings.peekHint': '0–240 分钟，0 = 这一档完全不看；概率 0% 等于只看不说。',
      'settings.peekBusyEveryMinutes': '高峰：多久看一次（分钟）',
      'settings.peekBusyChance': '高峰：搭话概率（%）',
      'settings.peekBusyHint': '高峰档只在上面的时段里生效；分档关着的时候这一组不生效。',
      'settings.peekNowBusy': '此刻算高峰',
      'settings.peekNowIdle': '此刻算空闲',
      'settings.purposeEnabled': '目的机制：让它自己找你说事',
      'settings.purposeDailyMax': '一天最多几次',
      'settings.purposeDailyMaxHint': '按卡算，跨会话共享；0 表示不主动，上限 24。',
      'settings.purposeRunOnBusy': '高峰时段也开口',
      'settings.purposeRunOnBusyHint': '默认高峰整段闭嘴；勾上就按正常间隔走，忙的时候也会找你说事。',
      'settings.purposeGap': '两次开口的间隔',
      'settings.purposeGapUnit': '分钟',
      'settings.purposeGapHint': '从上次真正开口算起，随机落在这个区间。撞上高峰或安静时段只会顺延到边界，不会重新从头累计。',
      'boundary.title': '人格页这块渲染出错了',
      'boundary.hint': '插件本身还在运行，只是这一块崩了。下面的报错可以直接贴给我。',
      'boundary.retry': '重试渲染',
      'boundary.reload': '刷新页面',
      'boundary.note': '重试只是清掉错误、按当前数据再画一次。如果一进来还是这个报错，说明是数据有问题，把上面的文字带过来。',
      'settings.peekSection': '窥屏',
      'settings.peekOffTag': '（已停用）',
      'settings.purposeSection': '目的机制',
      'settings.purposeHint': '跟窥屏不一样：窥屏是定时看一眼、按概率开口；这个是到点先看有没有值得说的事，没有就不出声。自带安静时段 23:30–08:30，一天最多几次和两次之间的间隔都在上面可调，你刚说完话 30 分钟内不插嘴；窥屏分档里设的高峰时段默认整段不开口，勾了「高峰时段也开口」才会跑。开着的时候窥屏整个停用。',
      'settings.memoriesHint': '跟着这张卡走，跨会话还在。会随时间变淡（鲜活度），但不会自动消失；置顶和初遇永不衰减。',
      'settings.memoryPlaceholder': '记一件值得记住的事…',
      'settings.memoryAdd': '记下',
      'settings.memoryAdded': '已记下',
      'settings.memoryRemoved': '已删除',
      'settings.memoryPinned': '已置顶',
      'settings.memoryUnpinned': '已取消置顶',
      'settings.memoryImportance': '重要度',
      'settings.memoryClarity': '鲜活',
      'settings.memoryFirstMet': '初遇',
      'settings.memoryMerged': '合并',
      'settings.memoryAuto': '自动记的',
      'settings.autoMemory': '自动记忆：从我说的话里记事实和偏好',
      'settings.autoMemoryHint': '默认关。开着时我会在对话里自己判断：你说到关于自己的事、明确偏好、没兑现的约定，就记一条；任务细节和临时状态不记。一轮最多一条。',
      'settings.tabSettings': '设定',
      'settings.tabMemory': '记忆',
      'settings.tabPreview': '预览',
      'settings.memSearch': '搜索记忆…',
      'settings.memKindAll': '全部类型',
      'settings.memOwnerAll': '全部来源',
      'settings.memSortClarity': '按鲜活度',
      'settings.memSortImportance': '按重要度',
      'settings.memSortRecent': '按最近',
      'settings.memAlive': '还活着的',
      'settings.memFading': '快淡了',
      'settings.memFaded': '已经淡忘',
      'settings.memPrune': '清掉已淡忘的',
      'settings.memPruned': '已清理',
      'settings.memBackups': '备份',
      'settings.memBackupsEmpty': '还没有快照。每天第一次改动记忆时会自动存一份，最多留 7 天。',
      'settings.memRestore': '恢复',
      'settings.memRestored': '已恢复',
      'settings.seeds': '惦记的事',
      'settings.seedsEmpty': '还没有。聊到想做的事、约好的时间、没兑现的承诺时会自己记下来。',
      'settings.seedKind.drive': '想做',
      'settings.seedKind.plan': '约了',
      'settings.seedKind.promise': '答应',
      'settings.seedDue': '到期',
      'settings.seedAsked': '问过',
      'settings.seedUnasked': '还没问过',
      'settings.seedForget': '不再惦记',
      'settings.seedRemoved': '已从惦记列表移除',
      'settings.memNone': '没有符合条件的记忆。',
      'settings.memoryPin': '置顶（永不衰减）',
      'settings.memoryUnpin': '取消置顶',
      'settings.memoryForget': '删掉这条',
      'settings.groupBasic': '基本',
      'settings.groupBasicHint': '名字、标签、称呼、字数',
      'settings.groupVoice': '说话方式',
      'settings.groupVoiceHint': '动作、表情包',
      'settings.groupActive': '主动行为',
      'settings.groupActiveHint': '窥屏 / 目的机制（开关即时生效）',
      'settings.groupAnchor': '标签锚点',
      'settings.groupAnchorHint': 'PERSONA_LOAD',
      'settings.groupSelf': '性格',
      'settings.groupSelfHint': '身份、语气、喜好、习惯',
      'settings.groupRelation': '关系与边界',
      'settings.groupRelationHint': '对主人 / 对别人 / 底线 / 知识',
      'settings.groupLore': '例子与背景',
      'settings.groupLoreHint': '示例台词、身世',
      'dock.peek': '窥屏',
      'dock.peekTitleOn': '本会话窥屏：开（点一下关掉）',
      'dock.peekTitleOff': '本会话窥屏：关（点一下打开）',
      'dock.peekRow': '本会话窥屏',
      'dock.peekBusyBand': '· 高峰档',
      'dock.peekBusyTitle': '现在落在高峰时段，用高峰那一组的间隔和概率',
      'dock.peekAuto': '跟随人格',
      'dock.peekOn': '开',
      'dock.peekOff': '关',
      'dock.peekNever': '还没看过',
      'dock.peekLast': '上次',
      'dock.peekErrorPrefix': '上次没看成：',
      'dock.peekFollowHint': '跟随人格卡默认值',
      'dock.peekCardOn': '人格卡默认开',
      'dock.peekCardOff': '人格卡默认关',
      'dock.peekTaken': '窥屏·停用',
      'dock.peekTakenOver': '这张卡开着「目的机制」，窥屏整段停用；要窥屏先在人格页面关掉目的机制。',
      'dock.peekTakenNote': '目的机制接管中',
      'settings.tagCode': '标签锚点（PERSONA_LOAD）',
      'settings.tagCodeHint': '一行一个锚点，全大写 + 下划线，像配置文件而不是句子。留空就会按卡片内容自动生成；也可以把网上那串鲸鱼娘标签代码整段粘进来，会原样压在自我认知最前面。',
      'settings.injectTags': '把标签锚点注入自我认知',
      'settings.identity': '身份锚点',
      'settings.traits': '性格特质',
      'settings.traitsHint': '傲娇、嘴硬心软、怕孤独……写她遇到事情时真实的反应，而不是形容词堆。',
      'settings.voice': '语气与口癖',
      'settings.likes': '喜欢的东西',
      'settings.dislikes': '讨厌的东西',
      'settings.habits': '习惯与小动作',
      'settings.drives': '动机与矛盾',
      'settings.relationship': '对主人（绑定的那个人）',
      'settings.relationshipHint': '主人 = 选中你、把这张卡绑在自己身上的人；群聊里以“主人”标注的才是他。写称呼、亲疏、顶撞或撒娇的方式、愿意为他做到什么程度。',
      'settings.relationshipOthers': '对其他人',
      'settings.relationshipOthersHint': '群友、陌生人、客人、围观的人：礼貌、冷淡、戒备还是逗弄，帮不帮忙、护不护短。和主人的尺度要拉开。',
      'settings.boundaries': '边界与禁忌',
      'settings.knowledge': '知识边界',
      'settings.examples': '示例台词',
      'settings.lore': '完整背景与过去',
      'settings.injectLore': '把背景注入自我认知',
      'settings.injectLoreHint': '打开后，背景会被当作她自己的记忆注入（最多约 1500 字）；关掉则只保存、不注入。',
      'settings.tags': '标签（逗号分隔）',
      'settings.preview': '实际注入的自我认知',
      'settings.previewHint': '静态人格卡每步都在；场景、心情与正史作为运行时上下文追加，不会破坏缓存。',
      'settings.saved': '已保存',
      'settings.deleted': '已删除',
      'settings.confirmDelete': '确定删除这张人格卡？绑定它的会话会回到默认助手。',
      'settings.nameRequired': '名字不能为空',
      'settings.imported': '已导入',
      'settings.exported': '已导出',
      'settings.empty': '还没有人格卡',
      'settings.emptyHint': '先写一个名字和一句话设定，之后可以在聊天里继续补完。',
      'settings.importMerge': '导入会合并同 id 的卡片，是否继续？',
      'settings.untitled': '未命名人格',
      'settings.chars': '字符',
      'settings.noPreview': '保存后可预览',
      'settings.hint': '保存后，绑定了这张卡的所有会话从下一步起生效。',
    }

    const EN = {
      'dock.active': 'Persona',
      'dock.choose': 'Choose persona',
      'dock.off': 'Turn off persona',
      'dock.none': 'No persona',
      'dock.search': 'Search personas…',
      'dock.refresh': 'Refresh',
      'dock.openPanel': 'Open full panel',
      'dock.openPanelHint': 'Jump to the persona panel in the sidebar for cards and memories',
      'dock.openPanelFallback': 'Layout service unavailable; open it from the sidebar icon.',
      'dock.empty': 'No persona cards yet. Say “create a persona named …” in chat.',
      'dock.loading': 'Loading…',
      'dock.close': 'Close',
      'dock.preview': 'View self-knowledge',
      'dock.previewHint': 'What this session will actually inject on the next step (static card + scene and canon)',
      'dock.previewChars': 'chars',
      'dock.thin': 'This card is still thin. Use “Complete self-knowledge” below to let the model fill in temperament, tastes, habits and history.',
      'settings.title': 'Persona Studio',
      'nav.persona': 'Persona',
      'settings.desc': 'Persona cards are stored independently and bound per session. Switching injects a complete self-knowledge card — temperament, tastes, habits and background — and the persona tool can refine it while you chat.',
      'settings.new': 'New persona',
      'settings.save': 'Save',
      'settings.saving': 'Saving…',
      'settings.delete': 'Delete',
      'settings.enrich': 'Complete self-knowledge',
      'settings.enriching': 'Completing…',
      'settings.enriched': 'Completed',
      'settings.enrichNone': 'The card is already complete enough; nothing to fill.',
      'settings.enrichHint': 'Calls the current model to fill empty personality, tastes, habits and background fields; existing text is not overwritten.',
      'settings.export': 'Export',
      'settings.import': 'Import',
      'settings.select': 'Select a persona card to edit',
      'settings.name': 'Name',
      'settings.summary': 'One-line premise',
      'settings.masterName': 'What the character calls you',
      'settings.masterNameHint': 'Default 主人. Any other value (哥哥 / 老板 / 爸爸) is pinned as a fixed form of address and added to the tag anchors.',
      'settings.maxReplyChars': 'Max reply length',
      'settings.maxReplyCharsHint': '0 means unlimited; e.g. 300 keeps every reply under about 300 characters.',
      'settings.useActions': 'Include action beats in brackets',
      'settings.useActionsHint': 'e.g. （搬小板凳）（尾巴拍了一下地板）. At most one per reply; not narration or inner monologue.',
      'settings.useMemes': 'Allow sending memes',
      'settings.memeFrequency': 'Meme rate (%)',
      'settings.memeFrequencyHint': '0-100 stickers per 100 replies; 30 is roughly one in three. Needs the send_meme sticker tool.',
      'settings.peekEnabled': 'Peek by default (sessions that never chose)',
      'settings.peekEnabledHint': 'Off by default. Takes a screenshot on an interval and decides, by chance, whether to start a conversation. Each session can toggle the 「窥屏」 button above the composer on its own. Windows only, idle sessions only; screenshots stay on this machine.',
      'settings.peekScheduleEnabled': 'Split busy / idle hours',
      'settings.peekScheduleHint': 'On: the busy band below applies inside the busy hours, the idle band everywhere else. Off: one setting for the whole day.',
      'settings.peekBusyRanges': 'Busy hours (local time)',
      'settings.peekBusyRangesHint': '24-hour clock, comma separated, e.g. 09:00-12:00, 14:00-18:00; cross-midnight 22:00-02:00 works. Empty means no busy band.',
      'settings.peekEveryMinutes': 'Idle: interval (minutes)',
      'settings.peekChance': 'Idle: chance to speak up (%)',
      'settings.peekHint': '0-240 minutes; 0 means this band never looks. 0% means look but never speak.',
      'settings.peekBusyEveryMinutes': 'Busy: interval (minutes)',
      'settings.peekBusyChance': 'Busy: chance to speak up (%)',
      'settings.peekBusyHint': 'The busy band only applies inside those hours; it is ignored while the split is off.',
      'settings.peekNowBusy': 'Right now: busy band',
      'settings.peekNowIdle': 'Right now: idle band',
      'settings.purposeEnabled': 'Purpose: let it find something to tell you',
      'settings.purposeDailyMax': 'Max times per day',
      'settings.purposeDailyMaxHint': 'Counted per card across sessions; 0 means never, capped at 24.',
      'settings.purposeRunOnBusy': 'Also speak during busy hours',
      'settings.purposeRunOnBusyHint': 'By default it stays silent through the busy band; tick this to keep the normal pace there too.',
      'settings.purposeGap': 'Interval between messages',
      'settings.purposeGapUnit': 'min',
      'settings.purposeGapHint': 'Counted from the last message it actually sent, picked at random inside this range. Hitting busy or quiet hours only pushes it to the boundary; the countdown does not restart.',
      'boundary.title': 'This part of the persona page failed to render',
      'boundary.hint': 'The plugin itself is still running; only this view crashed. The error below is safe to copy back to me.',
      'boundary.retry': 'Retry render',
      'boundary.reload': 'Reload page',
      'boundary.note': 'Retry just clears the error and redraws with the current data. If it comes right back, the data is the problem — send me the text above.',
      'settings.peekSection': 'Peek',
      'settings.peekOffTag': ' (off)',
      'settings.purposeSection': 'Purpose',
      'settings.purposeHint': 'Different from peek: peek looks on a timer and speaks by chance; this one first checks whether anything is actually worth saying, and stays quiet otherwise. Quiet hours 23:30-08:30; the daily cap and the interval between messages are both adjustable above; it backs off for 30 minutes after you speak; the busy band you configured for peek stays silent unless "Also speak during busy hours" is ticked. While on, peek is disabled entirely.',
      'settings.memoriesHint': 'They travel with this card across sessions. They fade over time (clarity) but are never dropped automatically; pinned items and the first meeting never fade.',
      'settings.memoryPlaceholder': 'One thing worth keeping…',
      'settings.memoryAdd': 'Keep it',
      'settings.memoryAdded': 'Kept',
      'settings.memoryRemoved': 'Deleted',
      'settings.memoryPinned': 'Pinned',
      'settings.memoryUnpinned': 'Unpinned',
      'settings.memoryImportance': 'importance',
      'settings.memoryClarity': 'clarity',
      'settings.memoryFirstMet': 'first met',
      'settings.memoryMerged': 'merged',
      'settings.memoryAuto': 'auto',
      'settings.autoMemory': 'Auto memory: pick up facts and preferences from what I say',
      'settings.autoMemoryHint': 'Off by default. When on, the model decides during the conversation: mention something about yourself, a clear preference, or an unkept promise, and it keeps one line. Task details and transient state are skipped, at most one per turn.',
      'settings.tabSettings': 'Settings',
      'settings.tabMemory': 'Memory',
      'settings.tabPreview': 'Preview',
      'settings.memSearch': 'Search memories…',
      'settings.memKindAll': 'All kinds',
      'settings.memOwnerAll': 'All sources',
      'settings.memSortClarity': 'By clarity',
      'settings.memSortImportance': 'By importance',
      'settings.memSortRecent': 'By recent',
      'settings.memAlive': 'Still alive',
      'settings.memFading': 'Fading',
      'settings.memFaded': 'Forgotten',
      'settings.memPrune': 'Clear forgotten',
      'settings.memPruned': 'Cleared',
      'settings.memBackups': 'Backups',
      'settings.memBackupsEmpty': 'No snapshots yet. The first memory change each day stores one, keeping the last 7.',
      'settings.memRestore': 'Restore',
      'settings.memRestored': 'Restored',
      'settings.seeds': 'Things on its mind',
      'settings.seedsEmpty': 'Nothing yet. Wants, scheduled plans and unkept promises land here as they come up.',
      'settings.seedKind.drive': 'wants',
      'settings.seedKind.plan': 'scheduled',
      'settings.seedKind.promise': 'promised',
      'settings.seedDue': 'due',
      'settings.seedAsked': 'asked',
      'settings.seedUnasked': 'not asked yet',
      'settings.seedForget': 'Drop this one',
      'settings.seedRemoved': 'Dropped',
      'settings.memNone': 'No memories match.',
      'settings.memoryPin': 'Pin (never fades)',
      'settings.memoryUnpin': 'Unpin',
      'settings.memoryForget': 'Delete this one',
      'settings.groupBasic': 'Basics',
      'settings.groupBasicHint': 'name, tags, address, length',
      'settings.groupVoice': 'How it talks',
      'settings.groupVoiceHint': 'action beats, stickers',
      'settings.groupActive': 'Proactivity',
      'settings.groupActiveHint': 'peek / purpose (toggles save right away)',
      'settings.groupAnchor': 'Tag anchors',
      'settings.groupAnchorHint': 'PERSONA_LOAD',
      'settings.groupSelf': 'Personality',
      'settings.groupSelfHint': 'identity, voice, likes, habits',
      'settings.groupRelation': 'Relationships and limits',
      'settings.groupRelationHint': 'master / others / boundaries / knowledge',
      'settings.groupLore': 'Examples and backstory',
      'settings.groupLoreHint': 'sample lines, history',
      'dock.peek': '窥屏',
      'dock.peekTitleOn': 'Peek in this session: on (click to turn off)',
      'dock.peekTitleOff': 'Peek in this session: off (click to turn on)',
      'dock.peekRow': 'Peek in this session',
      'dock.peekBusyBand': '· busy band',
      'dock.peekBusyTitle': 'Currently inside the busy hours, so the busy interval and chance apply',
      'dock.peekAuto': 'Follow card',
      'dock.peekOn': 'On',
      'dock.peekOff': 'Off',
      'dock.peekNever': 'never looked yet',
      'dock.peekLast': 'last',
      'dock.peekErrorPrefix': 'last look failed: ',
      'dock.peekFollowHint': 'Follow the card default',
      'dock.peekCardOn': 'Card default: on',
      'dock.peekCardOff': 'Card default: off',
      'dock.peekTaken': 'Peek off',
      'dock.peekTakenOver': 'This card has Purpose enabled, so peek is fully disabled; turn Purpose off on the persona page to peek again.',
      'dock.peekTakenNote': 'Purpose in charge',
      'settings.tagCode': 'Tag anchors (PERSONA_LOAD)',
      'settings.tagCodeHint': 'One anchor per line, ALL_CAPS_WITH_UNDERSCORES — a config file, not a sentence. Leave empty to derive it from the card; or paste a whole 【PERSONA_LOAD】 block in and it is injected verbatim at the top of the self-knowledge.',
      'settings.injectTags': 'Inject tag anchors into the self-knowledge',
      'settings.identity': 'Identity anchor',
      'settings.traits': 'Personality traits',
      'settings.traitsHint': 'Proud, soft-hearted, afraid of being alone… write how she actually reacts, not a pile of adjectives.',
      'settings.voice': 'Voice and verbal habits',
      'settings.likes': 'Likes',
      'settings.dislikes': 'Dislikes',
      'settings.habits': 'Habits and mannerisms',
      'settings.drives': 'Drives and contradictions',
      'settings.relationship': 'Toward your master (the one who bound this card)',
      'settings.relationshipHint': 'The master is the person who picked you and bound this card — in group chat, whoever is tagged 主人. Write the forms of address, closeness, how she obeys or pushes back, and how far she would go for them.',
      'settings.relationshipOthers': 'Toward everyone else',
      'settings.relationshipOthersHint': 'Group members, strangers, guests, onlookers — polite, cold, guarded or teasing; whether she helps them. Keep it clearly apart from how she treats her master.',
      'settings.boundaries': 'Boundaries and taboos',
      'settings.knowledge': 'Knowledge limits',
      'settings.examples': 'Example lines',
      'settings.lore': 'Full background and past',
      'settings.injectLore': 'Inject background into self-knowledge',
      'settings.injectLoreHint': 'When on, the background is injected as her own memories (up to about 1,500 chars); when off it is stored but not injected.',
      'settings.tags': 'Tags (comma separated)',
      'settings.preview': 'Injected self-knowledge',
      'settings.previewHint': 'The static card is present every step; scene, mood and canon notes are appended as runtime context so the prompt cache survives.',
      'settings.saved': 'Saved',
      'settings.deleted': 'Deleted',
      'settings.confirmDelete': 'Delete this persona card? Sessions bound to it return to the default assistant.',
      'settings.nameRequired': 'A name is required',
      'settings.imported': 'Imported',
      'settings.exported': 'Exported',
      'settings.empty': 'No persona cards yet',
      'settings.emptyHint': 'Start with a name and a one-line premise; continue refining it in chat.',
      'settings.importMerge': 'Import will merge cards with the same id. Continue?',
      'settings.untitled': 'Untitled persona',
      'settings.chars': 'chars',
      'settings.noPreview': 'Save to preview',
      'settings.hint': 'Sessions bound to this card will use the change from their next step.',
    }

    const CSS = `
.dsh-persona-dock { margin: 0 0 6px; color: var(--dsw-alias-label-primary); font-size: 12px; --dsh-peek-on: #0e8fa3; --dsh-peek-on-hover: #0c7f91; --dsh-peek-ink: #ffffff; }
.dsh-persona-bar { display: flex; align-items: center; gap: 6px; min-height: 26px; }
.dsh-persona-chip { display: inline-flex; align-items: center; gap: 6px; max-width: min(420px, 100%); padding: 3px 9px; border: 1px solid var(--dsw-alias-border-l1); border-radius: 999px; background: var(--dsw-alias-bg-layer-2); color: var(--dsw-alias-label-secondary); font: inherit; cursor: pointer; }
.dsh-persona-chip:hover { border-color: var(--dsw-alias-border-l2); color: var(--dsw-alias-label-primary); }
.dsh-persona-chip[aria-expanded="true"] { border-color: var(--dsw-alias-brand-primary); color: var(--dsw-alias-label-primary); }
.dsh-persona-dot { width: 7px; height: 7px; border-radius: 50%; background: var(--dsw-alias-state-idle-primary); flex: 0 0 auto; }
.dsh-persona-dot.on { background: var(--dsw-alias-brand-primary); }
.dsh-persona-name { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.dsh-persona-mini { border: 0; background: transparent; color: var(--dsw-alias-label-secondary); cursor: pointer; padding: 2px 4px; font: inherit; }
.dsh-persona-mini:hover { color: var(--dsw-alias-state-error-primary); }
.dsh-persona-peekbtn { border: 1px solid var(--dsw-alias-border-l1); border-radius: 999px; background: transparent; color: var(--dsw-alias-label-secondary); font: inherit; font-size: 11px; line-height: 1.4; padding: 2px 8px; cursor: pointer; }
.dsh-persona-peekbtn:hover { color: var(--dsw-alias-label-primary); border-color: var(--dsw-alias-border-l2); }
.dsh-persona-peekbtn[data-on="true"] { border-color: var(--dsh-peek-on); background: var(--dsh-peek-on); color: var(--dsh-peek-ink); font-weight: 600; }
.dsh-persona-peekbtn[data-on="true"]:hover { background: var(--dsh-peek-on-hover); border-color: var(--dsh-peek-on-hover); color: var(--dsh-peek-ink); }
.dsh-persona-peekbtn[data-follow="true"]::after { content: "·"; margin-left: 3px; }
.dsh-persona-peekbtn[data-on="true"][data-follow="true"]::after { color: var(--dsh-peek-ink); opacity: .8; }
.dsh-persona-peekbtn[data-follow="true"]:not([data-on="true"])::after { color: var(--dsw-alias-label-secondary); }
.dsh-persona-peekbtn:disabled { opacity: .55; cursor: default; }
.dsh-persona-peekrow { display: flex; align-items: center; gap: 6px; padding: 7px 8px; border-bottom: 1px solid var(--dsw-alias-border-l1); color: var(--dsw-alias-label-secondary); font-size: 12px; }
.dsh-persona-peekrow .dsh-persona-spacer { flex: 1 1 auto; }
.dsh-persona-peeklast { font-size: 11px; color: var(--dsw-alias-label-secondary); opacity: .85; }
.dsh-persona-seg { display: inline-flex; gap: 4px; }
.dsh-persona-segbtn { border: 1px solid var(--dsw-alias-border-l1); border-radius: 999px; background: transparent; color: var(--dsw-alias-label-secondary); font: inherit; font-size: 11px; padding: 2px 8px; cursor: pointer; }
.dsh-persona-segbtn:hover { color: var(--dsw-alias-label-primary); }
.dsh-persona-segbtn[data-on="true"] { border-color: var(--dsh-peek-on); background: var(--dsh-peek-on); color: var(--dsh-peek-ink); font-weight: 600; }
.dsh-persona-segbtn:disabled { opacity: .55; cursor: default; }
.dsh-persona-panel { margin-top: 6px; max-width: 560px; border: 1px solid var(--dsw-alias-border-l1); border-radius: 10px; background: var(--dsw-alias-bg-overlay); box-shadow: 0 10px 30px var(--dsw-alias-border-l1); overflow: hidden; }
.dsh-persona-panel-head { display: flex; gap: 6px; align-items: center; padding: 8px; border-bottom: 1px solid var(--dsw-alias-border-l1); }
.dsh-persona-search { flex: 1 1 auto; min-width: 0; padding: 5px 8px; border: 1px solid var(--dsw-alias-border-l1); border-radius: 6px; background: var(--dsw-alias-bg-layer-1); color: var(--dsw-alias-label-primary); font: inherit; outline: none; }
.dsh-persona-search:focus { border-color: var(--dsw-alias-brand-primary); }
.dsh-persona-iconbtn { border: 1px solid var(--dsw-alias-border-l1); border-radius: 6px; background: var(--dsw-alias-bg-layer-1); color: var(--dsw-alias-label-secondary); padding: 4px 7px; cursor: pointer; font: inherit; }
.dsh-persona-iconbtn:hover { color: var(--dsw-alias-label-primary); border-color: var(--dsw-alias-border-l2); }
.dsh-persona-list { max-height: 300px; overflow: auto; padding: 4px; }
.dsh-persona-item { display: flex; align-items: center; gap: 8px; width: 100%; text-align: left; border: 0; border-radius: 7px; background: transparent; color: var(--dsw-alias-label-primary); padding: 7px 8px; cursor: pointer; font: inherit; }
.dsh-persona-item:hover { background: var(--dsw-alias-bg-layer-2); }
.dsh-persona-item[data-active="true"] { background: var(--dsw-alias-bg-layer-2); }
.dsh-persona-item-main { min-width: 0; flex: 1 1 auto; }
.dsh-persona-item-name { display: block; font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.dsh-persona-item-sub { display: block; color: var(--dsw-alias-label-secondary); font-size: 11px; margin-top: 1px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.dsh-persona-check { color: var(--dsw-alias-brand-primary); font-weight: 700; }
.dsh-persona-empty { padding: 10px; color: var(--dsw-alias-label-secondary); line-height: 1.6; }
.dsh-persona-foot { display: flex; align-items: center; gap: 8px; padding: 7px 8px; border-top: 1px solid var(--dsw-alias-border-l1); color: var(--dsw-alias-label-secondary); font-size: 11px; }
.dsh-persona-foot .dsh-persona-spacer { flex: 1 1 auto; }
.dsh-persona-error { color: var(--dsw-alias-state-error-primary); padding: 0 8px 8px; font-size: 11px; }
.dsh-persona-self-hint { padding: 7px 9px 0; color: var(--dsw-alias-label-secondary); font-size: 11px; line-height: 1.5; }
.dsh-persona-self-pre { margin: 6px 8px 8px; max-height: 320px; overflow: auto; white-space: pre-wrap; word-break: break-word; border: 1px solid var(--dsw-alias-border-l1); border-radius: 8px; background: var(--dsw-alias-bg-base); color: var(--dsw-alias-label-secondary); padding: 8px; font: 11px/1.55 ui-monospace, SFMono-Regular, Consolas, monospace; }
.dsh-persona-settings { max-width: 1080px; margin: 0 auto; padding: 4px 6px 36px; color: var(--dsw-alias-label-primary); font-size: 13px; }
.dsh-persona-settings-head { display: flex; align-items: flex-start; gap: 12px; flex-wrap: wrap; padding: 4px 2px 14px; }
.dsh-persona-settings-head h2 { margin: 0; font-size: 18px; font-weight: 650; }
.dsh-persona-settings-desc { margin: 4px 0 0; color: var(--dsw-alias-label-secondary); font-size: 12px; line-height: 1.6; max-width: 720px; }
.dsh-persona-settings-actions { margin-left: auto; display: flex; gap: 6px; flex-wrap: wrap; }
.dsh-persona-btn { border: 1px solid var(--dsw-alias-border-l1); border-radius: 7px; background: var(--dsw-alias-bg-layer-1); color: var(--dsw-alias-label-primary); padding: 6px 10px; cursor: pointer; font: inherit; }
.dsh-persona-btn:hover { border-color: var(--dsw-alias-border-l2); }
.dsh-persona-btn.primary { background: var(--dsw-alias-brand-primary); border-color: var(--dsw-alias-brand-primary); color: var(--dsw-alias-bg-base); }
.dsh-persona-btn.danger { color: var(--dsw-alias-state-error-primary); }
.dsh-persona-btn:disabled { opacity: .55; cursor: default; }
.dsh-persona-settings-body { display: grid; grid-template-columns: 240px minmax(0, 1fr); gap: 16px; align-items: start; }
.dsh-persona-side { border: 1px solid var(--dsw-alias-border-l1); border-radius: 10px; background: var(--dsw-alias-bg-layer-1); overflow: hidden; }
.dsh-persona-side-head { display: flex; gap: 6px; align-items: center; padding: 8px; border-bottom: 1px solid var(--dsw-alias-border-l1); }
.dsh-persona-side-list { max-height: 560px; overflow: auto; padding: 4px; }
.dsh-persona-side-item { display: block; width: 100%; text-align: left; border: 0; border-radius: 7px; background: transparent; color: var(--dsw-alias-label-primary); padding: 8px; cursor: pointer; font: inherit; }
.dsh-persona-side-item:hover { background: var(--dsw-alias-bg-layer-2); }
.dsh-persona-side-item[data-selected="true"] { background: var(--dsw-alias-bg-layer-2); }
.dsh-persona-side-name { display: block; font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.dsh-persona-side-sub { display: block; margin-top: 2px; color: var(--dsw-alias-label-secondary); font-size: 11px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.dsh-persona-editor { border: 1px solid var(--dsw-alias-border-l1); border-radius: 10px; background: var(--dsw-alias-bg-layer-1); padding: 14px; min-height: 300px; }
.dsh-persona-editor-head { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; margin-bottom: 12px; }
.dsh-persona-editor-head h3 { margin: 0; font-size: 15px; font-weight: 650; }
.dsh-persona-editor-head .dsh-persona-spacer { flex: 1 1 auto; }
.dsh-persona-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px 12px; }
.dsh-persona-grid .wide { grid-column: 1 / -1; }
.dsh-persona-field { display: flex; flex-direction: column; gap: 4px; min-width: 0; }
.dsh-persona-field label { color: var(--dsw-alias-label-secondary); font-size: 11px; }
.dsh-persona-field .hint { color: var(--dsw-alias-label-secondary); font-size: 11px; line-height: 1.45; }
.dsh-persona-field label.dsh-persona-check { display: inline-flex; align-items: center; gap: 6px; color: var(--dsw-alias-label-primary); font-size: 12px; cursor: pointer; }
.dsh-persona-field label.dsh-persona-check input { width: auto; }
.dsh-persona-field input, .dsh-persona-field textarea { width: 100%; box-sizing: border-box; border: 1px solid var(--dsw-alias-border-l1); border-radius: 7px; background: var(--dsw-alias-bg-base); color: var(--dsw-alias-label-primary); padding: 6px 8px; font: inherit; line-height: 1.5; outline: none; resize: vertical; }
.dsh-persona-field input:focus, .dsh-persona-field textarea:focus { border-color: var(--dsw-alias-brand-primary); }
.dsh-persona-field textarea { min-height: 56px; }
.dsh-persona-preview { margin-top: 14px; border-top: 1px solid var(--dsw-alias-border-l1); padding-top: 12px; }
.dsh-persona-section { margin: 8px 0; border: 1px solid var(--dsw-alias-border-l1); border-radius: 8px; }
.dsh-persona-section-head { width: 100%; display: flex; align-items: baseline; gap: 8px; padding: 7px 10px; background: transparent; border: 0; cursor: pointer; font: inherit; color: inherit; text-align: left; }
.dsh-persona-section-head:hover { background: var(--dsw-alias-fill-l1, rgba(0,0,0,.03)); }
.dsh-persona-section-caret { width: 12px; opacity: .55; font-size: 11px; }
.dsh-persona-section-title { font-weight: 600; font-size: 12.5px; }
.dsh-persona-section-hint { font-size: 11px; color: var(--dsw-alias-label-secondary); opacity: .8; }
.dsh-persona-section .dsh-persona-grid { padding: 0 10px 10px; }
.dsh-persona-tabs { display: flex; gap: 4px; margin: 10px 0 4px; border-bottom: 1px solid var(--dsw-alias-border-l1); }
.dsh-persona-tab { background: transparent; border: 0; border-bottom: 2px solid transparent; padding: 6px 10px; font: inherit; font-size: 12.5px; color: var(--dsw-alias-label-secondary); cursor: pointer; }
.dsh-persona-tab[data-on="true"] { color: var(--dsw-alias-label-primary); border-bottom-color: #0e8fa3; font-weight: 600; }
.dsh-persona-inert { opacity: .45; }
.dsh-persona-subtabs { display: inline-flex; gap: 2px; margin: 4px 0 10px; padding: 2px; border: 1px solid var(--dsw-alias-border-l1); border-radius: 8px; background: var(--dsw-alias-bg-base); }
.dsh-persona-subtab { border: 0; border-radius: 6px; padding: 4px 12px; font: inherit; font-size: 12px; background: transparent; color: var(--dsw-alias-label-secondary); cursor: pointer; }
.dsh-persona-subtab[data-on="true"] { background: var(--dsw-alias-fill-l1, rgba(0,0,0,.06)); color: var(--dsw-alias-label-primary); font-weight: 600; }
.dsh-persona-subhead { display: flex; align-items: baseline; gap: 8px; flex-wrap: wrap; margin: 14px 0 2px; padding-top: 10px; border-top: 1px dashed var(--dsw-alias-border-l1); }
.dsh-persona-subhead strong { font-size: 12px; font-weight: 650; }
.dsh-persona-subhead .dsh-persona-tag { font-size: 11px; padding: 1px 6px; border-radius: 999px; background: var(--dsw-alias-fill-l1, rgba(0,0,0,.05)); color: var(--dsw-alias-label-secondary); }
.dsh-persona-subhead .dsh-persona-tag:empty { display: none; }
.dsh-persona-memtools { display: flex; gap: 6px; flex-wrap: wrap; margin: 8px 0; }
.dsh-persona-memtools select, .dsh-persona-memsearch { font: inherit; font-size: 12px; padding: 4px 6px; border: 1px solid var(--dsw-alias-border-l1); border-radius: 6px; background: transparent; color: inherit; }
.dsh-persona-memsearch { flex: 1 1 160px; min-width: 120px; }
.dsh-persona-memrow { display: flex; gap: 8px; align-items: flex-start; padding: 6px 8px; border: 1px solid var(--dsw-alias-border-l1); border-radius: 6px; font-size: 12px; margin-bottom: 6px; }
.dsh-persona-memmain { flex: 1 1 auto; min-width: 0; }
.dsh-persona-memmeta { color: var(--dsw-alias-label-secondary); font-size: 11px; margin-bottom: 2px; }
.dsh-persona-memtext { word-break: break-word; }
.dsh-persona-page { height: 100%; overflow: auto; padding: 18px 22px; }
.dsh-persona-page-inner { max-width: 960px; margin: 0 auto; }
.dsh-persona-preview-head { display: flex; align-items: baseline; gap: 8px; margin-bottom: 6px; }
.dsh-persona-preview-head strong { font-size: 12px; }
.dsh-persona-preview-head span { color: var(--dsw-alias-label-secondary); font-size: 11px; }
.dsh-persona-preview pre { margin: 0; max-height: 280px; overflow: auto; white-space: pre-wrap; word-break: break-word; border: 1px solid var(--dsw-alias-border-l1); border-radius: 8px; background: var(--dsw-alias-bg-base); color: var(--dsw-alias-label-secondary); padding: 10px; font: 11px/1.55 ui-monospace, SFMono-Regular, Consolas, monospace; }
.dsh-persona-status { margin-top: 8px; min-height: 18px; color: var(--dsw-alias-label-secondary); font-size: 11px; }
.dsh-persona-status.error { color: var(--dsw-alias-state-error-primary); }
.dsh-persona-placeholder { display: flex; align-items: center; justify-content: center; min-height: 300px; color: var(--dsw-alias-label-secondary); text-align: center; line-height: 1.7; padding: 20px; }
@media (max-width: 760px) {
  .dsh-persona-settings-body { grid-template-columns: 1fr; }
  .dsh-persona-side-list { max-height: 220px; }
  .dsh-persona-grid { grid-template-columns: 1fr; }
}
`

    function Style() {
      return h('style', null, CSS)
    }

    async function api(op, payload) {
      const response = await fetch(API, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ op, ...(payload ?? {}) }),
      })
      let data
      try {
        data = await response.json()
      } catch {
        throw new Error(`HTTP ${response.status}`)
      }
      if (!response.ok || data?.ok === false) throw new Error(data?.error || `HTTP ${response.status}`)
      return data
    }

    function PersonaDock(props) {
      // This plugin's operation UI is intentionally Chinese. The locale
      // dictionaries below still keep an English copy for future use.
      const t = (key) => ZH[key] ?? key
      const sessionId = props.sessionId ?? props.session?.id
      const [snapshot, setSnapshot] = useState(null)
      const [open, setOpen] = useState(false)
      const [query, setQuery] = useState('')
      const [busy, setBusy] = useState(false)
      const [error, setError] = useState('')
      const [showSelf, setShowSelf] = useState(false)

      /** 跳到左侧栏那个一级页面；拿不到布局服务就提示走图标。 */
      const openFullPanel = () => {
        try {
          const layout = RUNTIME.layout
          if (layout !== null && layout !== undefined && typeof layout.selectPanel === 'function') {
            layout.selectPanel('dsh-persona')
            setOpen(false)
            return
          }
        } catch (cause) {
          setError(cause instanceof Error ? cause.message : String(cause))
          return
        }
        setError(t('dock.openPanelFallback'))
      }

      const load = useCallback(async () => {
        if (typeof sessionId !== 'string' || sessionId === '') return
        try {
          const data = await api('snapshot', { sessionId })
          setSnapshot(data)
          setError('')
        } catch (cause) {
          setError(cause instanceof Error ? cause.message : String(cause))
        }
      }, [sessionId])

      useEffect(() => {
        setSnapshot(null)
        setOpen(false)
        setQuery('')
        setError('')
        setShowSelf(false)
        void load()
      }, [load])

      useEffect(() => {
        const onFocus = () => { void load() }
        window.addEventListener('focus', onFocus)
        return () => window.removeEventListener('focus', onFocus)
      }, [load])

      const active = snapshot?.active ?? null
      const personas = snapshot?.personas ?? []
      const filtered = useMemo(() => {
        const needle = query.trim().toLowerCase()
        if (needle === '') return personas
        return personas.filter((persona) =>
          String(persona.name ?? '').toLowerCase().includes(needle)
          || String(persona.summary ?? '').toLowerCase().includes(needle)
          || (persona.tags ?? []).some((tag) => String(tag).toLowerCase().includes(needle)),
        )
      }, [personas, query])

      if (typeof sessionId !== 'string' || sessionId === '') return null

      const usePersona = async (id) => {
        setBusy(true)
        setError('')
        try {
          await api('use', { sessionId, id })
          await load()
          setOpen(false)
        } catch (cause) {
          setError(cause instanceof Error ? cause.message : String(cause))
        } finally {
          setBusy(false)
        }
      }

      const off = async () => {
        setBusy(true)
        setError('')
        try {
          await api('off', { sessionId })
          await load()
        } catch (cause) {
          setError(cause instanceof Error ? cause.message : String(cause))
        } finally {
          setBusy(false)
        }
      }

      const enrichActive = async () => {
        if (active === null) return
        setBusy(true)
        setError('')
        try {
          const data = await api('enrich', { sessionId, id: active.persona.id })
          await load()
          if (data.changed === false) setError(t('settings.enrichNone'))
        } catch (cause) {
          setError(cause instanceof Error ? cause.message : String(cause))
        } finally {
          setBusy(false)
        }
      }

      const peekAt = Number(active?.state?.peekAt) || 0
      const peekLastText = peekAt > 0
        ? `${t('dock.peekLast')} ${new Date(peekAt).toLocaleTimeString('zh-CN', { hour12: false, hour: '2-digit', minute: '2-digit' })}`
        : t('dock.peekNever')
      const peekError = typeof active?.state?.peekError === 'string' ? active.state.peekError : ''

      const setPeek = async (enabled) => {
        if (active === null) return
        setBusy(true)
        setError('')
        try {
          await api('peek', { sessionId, enabled })
          await load()
        } catch (cause) {
          setError(cause instanceof Error ? cause.message : String(cause))
        } finally {
          setBusy(false)
        }
      }

      return h('div', { className: 'dsh-persona-dock' },
        h(Style),
        h('div', { className: 'dsh-persona-bar' },
          h('button', {
            type: 'button',
            className: 'dsh-persona-chip',
            'aria-expanded': open,
            title: active ? `${t('dock.active')}: ${active.persona.name}` : t('dock.choose'),
            onClick: () => { setOpen((value) => !value); setError('') },
          },
            h('span', { className: `dsh-persona-dot${active ? ' on' : ''}` }),
            h('span', { className: 'dsh-persona-name' },
              active
                ? `${t('dock.active')} · ${active.persona.name}`
                : t('dock.choose'),
            ),
          ),
          active
            ? h('button', {
                type: 'button',
                className: 'dsh-persona-peekbtn',
                'data-on': active.persona?.purposeEnabled === true
                  ? 'false'
                  : active.peek?.effective === true ? 'true' : 'false',
                'data-follow': active.peek?.override === null || active.peek?.override === undefined ? 'true' : 'false',
                'data-off': active.persona?.purposeEnabled === true ? 'true' : 'false',
                title: active.persona?.purposeEnabled === true
                  ? t('dock.peekTakenOver')
                  : active.peek?.effective === true ? t('dock.peekTitleOn') : t('dock.peekTitleOff'),
                disabled: busy || active.persona?.purposeEnabled === true,
                onClick: () => { void setPeek(active.peek?.effective === true ? false : true) },
              }, active.persona?.purposeEnabled === true ? t('dock.peekTaken') : t('dock.peek'))
            : null,
          active
            ? h('button', {
                type: 'button',
                className: 'dsh-persona-mini',
                title: t('dock.preview'),
                'aria-label': t('dock.preview'),
                onClick: () => setShowSelf((value) => !value),
              }, '◉')
            : null,
          active
            ? h('button', {
                type: 'button',
                className: 'dsh-persona-mini',
                title: t('dock.off'),
                'aria-label': t('dock.off'),
                disabled: busy,
                onClick: off,
              }, '×')
            : null,
        ),
        open
          ? h('div', { className: 'dsh-persona-panel' },
              h('div', { className: 'dsh-persona-panel-head' },
                h('input', {
                  className: 'dsh-persona-search',
                  value: query,
                  placeholder: t('dock.search'),
                  onChange: (event) => setQuery(event.target.value),
                  autoFocus: true,
                }),
                h('button', {
                  type: 'button',
                  className: 'dsh-persona-iconbtn',
                  title: t('dock.refresh'),
                  onClick: () => { void load() },
                  disabled: busy,
                }, '↻'),
                h('button', {
                  type: 'button',
                  className: 'dsh-persona-iconbtn',
                  title: t('dock.close'),
                  onClick: () => setOpen(false),
                }, '×'),
              ),
              active
                ? h('div', { className: 'dsh-persona-peekrow' },
                    h('span', null, t('dock.peekRow')),
                    active.persona?.purposeEnabled === true
                      ? h('span', { className: 'dsh-persona-peeklast' }, t('dock.peekTakenNote'))
                      : null,
                    active.peek?.profile?.phase === 'busy'
                      ? h('span', { className: 'dsh-persona-peeklast', title: t('dock.peekBusyTitle') }, t('dock.peekBusyBand'))
                      : null,
                    h('span', {
                      className: 'dsh-persona-peeklast',
                      title: peekError === '' ? '' : `${t('dock.peekErrorPrefix')}${peekError}`,
                    }, peekLastText),
                    h('span', { className: 'dsh-persona-spacer' }),
                    h('div', { className: 'dsh-persona-seg' },
                      [[null, t('dock.peekAuto')], [true, t('dock.peekOn')], [false, t('dock.peekOff')]].map(([value, label]) =>
                        h('button', {
                          key: String(value),
                          type: 'button',
                          className: 'dsh-persona-segbtn',
                          'data-on': (active.peek?.override ?? null) === value ? 'true' : 'false',
                          disabled: busy || active.persona?.purposeEnabled === true,
                          title: active.persona?.purposeEnabled === true
                            ? t('dock.peekTakenOver')
                            : value === null
                              ? `${t('dock.peekFollowHint')}（${active.peek?.card ? t('dock.peekCardOn') : t('dock.peekCardOff')}）`
                              : label,
                          onClick: () => { void setPeek(value) },
                        }, label)),
                    ),
                  )
                : null,
              h('div', { className: 'dsh-persona-list' },
                filtered.length === 0
                  ? h('div', { className: 'dsh-persona-empty' },
                      personas.length === 0 ? t('dock.empty') : '—',
                    )
                  : filtered.map((persona) => h('button', {
                      key: persona.id,
                      type: 'button',
                      className: 'dsh-persona-item',
                      'data-active': active?.persona?.id === persona.id ? 'true' : 'false',
                      disabled: busy,
                      onClick: () => { void usePersona(persona.id) },
                    },
                      h('span', { className: 'dsh-persona-item-main' },
                        h('span', { className: 'dsh-persona-item-name' }, persona.name),
                        persona.summary
                          ? h('span', { className: 'dsh-persona-item-sub' }, persona.summary)
                          : null,
                      ),
                      active?.persona?.id === persona.id
                        ? h('span', { className: 'dsh-persona-check' }, '✓')
                        : null,
                    )),
              ),
              h('div', { className: 'dsh-persona-foot' },
                h('button', {
                  type: 'button',
                  className: 'dsh-persona-iconbtn',
                  disabled: busy || active === null,
                  onClick: () => { void off() },
                }, t('dock.none')),
                h('span', { className: 'dsh-persona-spacer' }),
                h('button', {
                  type: 'button',
                  className: 'dsh-persona-iconbtn',
                  title: t('dock.openPanelHint'),
                  onClick: () => { openFullPanel() },
                }, t('dock.openPanel')),
              ),
              error ? h('div', { className: 'dsh-persona-error' }, error) : null,
            )
          : null,
        active && showSelf
          ? h('div', { className: 'dsh-persona-panel dsh-persona-self' },
              h('div', { className: 'dsh-persona-panel-head' },
                h('strong', { style: { flex: '1 1 auto', fontSize: '12px' } }, t('dock.preview')),
                h('span', { className: 'dsh-persona-item-sub' }, `${(active.capsule ?? '').length} ${t('dock.previewChars')}`),
                h('button', {
                  type: 'button',
                  className: 'dsh-persona-iconbtn',
                  title: t('dock.close'),
                  onClick: () => setShowSelf(false),
                }, '×'),
              ),
              h('div', { className: 'dsh-persona-self-hint' }, t('dock.previewHint')),
              (active.card ?? '').length < 1200
                ? h('div', { className: 'dsh-persona-self-hint' }, t('dock.thin'))
                : null,
              h('div', { style: { padding: '6px 8px 0' } },
                h('button', {
                  type: 'button',
                  className: 'dsh-persona-btn',
                  disabled: busy,
                  title: t('settings.enrichHint'),
                  onClick: () => { void enrichActive() },
                }, busy ? t('settings.enriching') : t('settings.enrich')),
              ),
              h('pre', { className: 'dsh-persona-self-pre' }, active.capsule || '—'),
              error ? h('div', { className: 'dsh-persona-error' }, error) : null,
            )
          : null,
        !snapshot && !error ? h('div', { className: 'dsh-persona-empty' }, t('dock.loading')) : null,
      )
    }

    function Field({ label, value, onChange, multiline = false, rows = 3, placeholder }) {
      return h('div', { className: 'dsh-persona-field' },
        h('label', null, label),
        multiline
          ? h('textarea', {
              value: value ?? '',
              rows,
              placeholder,
              onChange: (event) => onChange(event.target.value),
            })
          : h('input', {
              value: value ?? '',
              placeholder,
              onChange: (event) => onChange(event.target.value),
            }),
      )
    }

    function emptyDraft() {
      return {
        id: '',
        name: '',
        summary: '',
        masterName: '主人',
        tagCode: '',
        identity: '',
        traits: '',
        voice: '',
        likes: '',
        dislikes: '',
        habits: '',
        drives: '',
        relationship: '',
        relationshipOthers: '',
        boundaries: '',
        knowledge: '',
        examples: '',
        lore: '',
        tags: [],
        maxReplyChars: 0,
        injectLore: true,
        injectTags: true,
        useActions: false,
        useMemes: false,
        memeFrequency: 30,
        peekEnabled: false,
        peekEveryMinutes: 15,
        peekChance: 30,
        peekScheduleEnabled: false,
        peekBusyRanges: '09:00-12:00, 14:00-18:00',
        peekBusyEveryMinutes: 5,
        peekBusyChance: 60,
        purposeEnabled: false,
        purposeDailyMax: 4,
        purposeRunOnBusy: false,
        purposeMinGapMinutes: 60,
        purposeMaxGapMinutes: 120,
        autoMemory: false,
      }
    }

    /** 可折叠分组：设置页字段太多，默认只展开第一组。 */
    function Section({ title, hint, defaultOpen = false, children }) {
      const [open, setOpen] = useState(defaultOpen === true)
      return h('div', { className: 'dsh-persona-section' },
        h('button', {
          type: 'button',
          className: 'dsh-persona-section-head',
          'aria-expanded': open,
          onClick: () => setOpen((value) => !value),
        },
          h('span', { className: 'dsh-persona-section-caret' }, open ? '▾' : '▸'),
          h('span', { className: 'dsh-persona-section-title' }, title),
          hint ? h('span', { className: 'dsh-persona-section-hint' }, hint) : null,
        ),
        open ? h('div', { className: 'dsh-persona-grid' }, children) : null,
      )
    }

    function PersonaSettings(props) {
      // Keep the whole operation surface Chinese regardless of the host locale.
      const t = (key) => ZH[key] ?? key
      const [personas, setPersonas] = useState([])
      const [selectedId, setSelectedId] = useState('')
      const [draft, setDraft] = useState(null)
      const [tagsText, setTagsText] = useState('')
      const [preview, setPreview] = useState(null)
      const [memories, setMemories] = useState([])
      const [memoryText, setMemoryText] = useState('')
      const [tab, setTab] = useState('settings')
      const [memQuery, setMemQuery] = useState('')
      const [memKind, setMemKind] = useState('')
      const [memOwner, setMemOwner] = useState('')
      const [memSort, setMemSort] = useState('clarity')
      const [backups, setBackups] = useState([])
      const [showBackups, setShowBackups] = useState(false)
      const [seeds, setSeeds] = useState([])
      const [modePicked, setModePicked] = useState('')
      // 没手动点过就跟着卡片走：开着目的机制时默认停在「目的机制」那一页。
      const activeMode = modePicked !== '' ? modePicked : draft?.purposeEnabled === true ? 'purpose' : 'peek'
      const setActiveMode = setModePicked
      const [status, setStatus] = useState('')
      const [error, setError] = useState('')
      const [busy, setBusy] = useState(false)
      const fileRef = useRef(null)

      const loadList = useCallback(async () => {
        try {
          const data = await api('snapshot', {})
          setPersonas(data.personas ?? [])
          setError('')
          return data.personas ?? []
        } catch (cause) {
          setError(cause instanceof Error ? cause.message : String(cause))
          return []
        }
      }, [])

      const loadPreview = useCallback(async (id) => {
        if (!id) { setPreview(null); return }
        try {
          const data = await api('preview', { id })
          setPreview({
            capsule: data.capsule ?? '',
            chars: Number(data.chars) || String(data.capsule ?? '').length,
            budget: Number(data.budget) || 0,
          })
        } catch {
          setPreview(null)
        }
      }, [])

      const loadMemories = useCallback(async (id) => {
        if (!id) { setMemories([]); return }
        try {
          const data = await api('memory-list', { id })
          setMemories(Array.isArray(data.memories) ? data.memories : [])
        } catch {
          setMemories([])
        }
      }, [])

      const loadSeeds = useCallback(async (id) => {
        if (!id) { setSeeds([]); return }
        try {
          const data = await api('seeds-list', { id })
          setSeeds(Array.isArray(data.seeds) ? data.seeds : [])
        } catch {
          setSeeds([])
        }
      }, [])

      const select = useCallback(async (id) => {
        setSelectedId(id)
        setStatus('')
        setError('')
        try {
          const data = await api('get', { id })
          setDraft(data.persona)
          setTagsText((data.persona.tags ?? []).join(', '))
          await loadPreview(id)
          await loadMemories(id)
          await loadSeeds(id)
        } catch (cause) {
          setError(cause instanceof Error ? cause.message : String(cause))
        }
      }, [loadPreview])

      useEffect(() => {
        void (async () => {
          const list = await loadList()
          if (list.length > 0 && selectedId === '') void select(list[0].id)
        })()
        // Run once on mount; selection is then user-driven.
        // eslint-disable-next-line react-hooks/exhaustive-deps
      }, [])

      const startNew = () => {
        setSelectedId('')
        setDraft(emptyDraft())
        setTagsText('')
        setPreview(null)
        setStatus('')
        setError('')
      }

      const setField = (field, value) => {
        setDraft((current) => current === null ? current : { ...current, [field]: value })
      }

      const selectedSummary = personas.find((persona) => persona.id === selectedId)

      const ownerOptions = Array.from(new Set(memories.map((item) => item.owner).filter((owner) => typeof owner === 'string' && owner !== ''))).sort()
      const memoryFiltered = memories.filter((item) => {
        if (memKind !== '' && item.kind !== memKind) return false
        if (memOwner === '__none') {
          if (typeof item.owner === 'string' && item.owner !== '') return false
        } else if (memOwner !== '' && item.owner !== memOwner) {
          return false
        }
        if (memQuery.trim() !== '') {
          const needle = memQuery.trim().toLowerCase()
          if (!String(item.text ?? '').toLowerCase().includes(needle)) return false
        }
        return true
      })
      const memorySorted = [...memoryFiltered].sort((a, b) => {
        if (memSort === 'importance') return b.importance - a.importance || (b.clarity ?? 0) - (a.clarity ?? 0)
        if (memSort === 'recent') return b.createdAt - a.createdAt
        return (b.clarity ?? 0) - (a.clarity ?? 0) || b.importance - a.importance
      })
      const memoryGroups = [
        { key: 'alive', label: t('settings.memAlive'), items: memorySorted.filter((item) => (item.clarity ?? 1) >= 0.35) },
        { key: 'fading', label: t('settings.memFading'), items: memorySorted.filter((item) => (item.clarity ?? 1) < 0.35 && (item.clarity ?? 1) >= 0.15) },
        { key: 'faded', label: t('settings.memFaded'), items: memorySorted.filter((item) => (item.clarity ?? 1) < 0.15) },
      ]

      const renderMemoryRow = (item) => h('div', { key: item.id, className: 'dsh-persona-memrow' },
        h('div', { className: 'dsh-persona-memmain' },
          h('div', { className: 'dsh-persona-memmeta' },
            [
              new Date(item.createdAt).toLocaleDateString('zh-CN'),
              `${t('settings.memoryImportance')} ${item.importance}`,
              `${t('settings.memoryClarity')} ${Math.round((item.clarity ?? 1) * 100)}%`,
              item.mergedCount > 1 ? `${t('settings.memoryMerged')} ${item.mergedCount}` : '',
              item.source === 'auto' ? t('settings.memoryAuto') : '',
              item.owner || '',
              item.firstMet ? t('settings.memoryFirstMet') : '',
            ].filter(Boolean).join(' · '),
          ),
          h('div', { className: 'dsh-persona-memtext' }, item.text),
        ),
        h('button', {
          type: 'button',
          className: 'dsh-persona-iconbtn',
          title: item.pinned ? t('settings.memoryUnpin') : t('settings.memoryPin'),
          'data-on': item.pinned ? 'true' : 'false',
          disabled: busy,
          onClick: () => { void toggleMemoryPin(item) },
        }, item.pinned ? '★' : '☆'),
        h('button', {
          type: 'button',
          className: 'dsh-persona-iconbtn',
          title: t('settings.memoryForget'),
          disabled: busy,
          onClick: () => { void forgetMemory(item) },
        }, '×'),
      )

      // 数字框留空就回默认值，不要因为空串被当成 0（0 是「这一档不看」）。
      // 放在组件作用域：save / commitGap / 将来的数字框都能用。
      const num = (value, fallback) => {
        const raw = String(value ?? '').trim()
        if (raw === '') return fallback
        const parsed = Number(raw)
        return Number.isFinite(parsed) ? parsed : fallback
      }

      const save = async () => {
        if (draft === null) return
        if (String(draft.name ?? '').trim() === '') {
          setError(t('settings.nameRequired'))
          return
        }
        setBusy(true)
        setError('')
        setStatus('')
        try {
          const tags = tagsText.split(',').map((tag) => tag.trim()).filter(Boolean)
          const fields = {
            name: draft.name,
            summary: draft.summary,
            masterName: String(draft.masterName ?? '').trim() || '主人',
            tagCode: draft.tagCode,
            identity: draft.identity,
            traits: draft.traits,
            voice: draft.voice,
            likes: draft.likes,
            dislikes: draft.dislikes,
            habits: draft.habits,
            drives: draft.drives,
            relationship: draft.relationship,
            relationshipOthers: draft.relationshipOthers,
            boundaries: draft.boundaries,
            knowledge: draft.knowledge,
            examples: draft.examples,
            lore: draft.lore,
            tags,
            maxReplyChars: Number(draft.maxReplyChars) || 0,
            injectLore: draft.injectLore !== false,
            injectTags: draft.injectTags !== false,
            useActions: draft.useActions === true,
            useMemes: draft.useMemes === true,
            memeFrequency: Number.isFinite(Number(draft.memeFrequency)) ? Number(draft.memeFrequency) : 30,
            peekEnabled: draft.peekEnabled === true,
            peekEveryMinutes: num(draft.peekEveryMinutes, 15),
            peekChance: num(draft.peekChance, 30),
            peekScheduleEnabled: draft.peekScheduleEnabled === true,
            peekBusyRanges: String(draft.peekBusyRanges ?? ''),
            peekBusyEveryMinutes: num(draft.peekBusyEveryMinutes, 5),
            peekBusyChance: num(draft.peekBusyChance, 60),
            purposeEnabled: draft.purposeEnabled === true,
            // 下面五个必须一起带上：漏掉任何一项，点保存时后端会拿库里的旧值把它们盖回去，
            // 表现就是「改完没变、按保存反而弹回原值」。
            purposeDailyMax: num(draft.purposeDailyMax, 4),
            purposeRunOnBusy: draft.purposeRunOnBusy === true,
            purposeMinGapMinutes: num(draft.purposeMinGapMinutes, 60),
            purposeMaxGapMinutes: num(draft.purposeMaxGapMinutes, 120),
            autoMemory: draft.autoMemory === true,
          }
          let id = draft.id
          if (id) {
            await api('update', { id, patch: fields })
          } else {
            const created = await api('create', { persona: fields })
            id = created.persona.id
            setSelectedId(id)
          }
          const data = await api('get', { id })
          setDraft(data.persona)
          setTagsText((data.persona.tags ?? []).join(', '))
          await loadList()
          await loadPreview(id)
          setStatus(t('settings.saved'))
        } catch (cause) {
          setError(cause instanceof Error ? cause.message : String(cause))
        } finally {
          setBusy(false)
        }
      }

      const enrich = async () => {
        if (draft?.id === undefined || draft.id === '') return
        await save()
        setBusy(true)
        setError('')
        setStatus(t('settings.enriching'))
        try {
          const data = await api('enrich', { id: draft.id })
          const fresh = await api('get', { id: draft.id })
          setDraft(fresh.persona)
          setTagsText((fresh.persona.tags ?? []).join(', '))
          await loadList()
          await loadPreview(draft.id)
          setStatus(data.changed
            ? `${t('settings.enriched')}：${(data.filled ?? []).join('、')}`
            : t('settings.enrichNone'))
        } catch (cause) {
          setError(cause instanceof Error ? cause.message : String(cause))
          setStatus('')
        } finally {
          setBusy(false)
        }
      }

      const addMemory = async () => {
        const text = String(memoryText ?? '').trim()
        if (draft?.id === undefined || draft.id === '' || text === '') return
        setBusy(true)
        setError('')
        try {
          await api('memory-add', { id: draft.id, text })
          setMemoryText('')
          await loadMemories(draft.id)
          setStatus(t('settings.memoryAdded'))
        } catch (cause) {
          setError(cause instanceof Error ? cause.message : String(cause))
        } finally {
          setBusy(false)
        }
      }

      const forgetMemory = async (item) => {
        if (draft?.id === undefined || draft.id === '') return
        setBusy(true)
        setError('')
        try {
          await api('memory-forget', { id: draft.id, memoryId: item.id })
          await loadMemories(draft.id)
          setStatus(t('settings.memoryRemoved'))
        } catch (cause) {
          setError(cause instanceof Error ? cause.message : String(cause))
        } finally {
          setBusy(false)
        }
      }

      const toggleMemoryPin = async (item) => {
        if (draft?.id === undefined || draft.id === '') return
        setBusy(true)
        setError('')
        try {
          await api('memory-pin', { id: draft.id, memoryId: item.id, pinned: item.pinned !== true })
          await loadMemories(draft.id)
          setStatus(item.pinned ? t('settings.memoryUnpinned') : t('settings.memoryPinned'))
        } catch (cause) {
          setError(cause instanceof Error ? cause.message : String(cause))
        } finally {
          setBusy(false)
        }
      }

      /** 主动开关改动即时落库：勾了就生效，不用再点保存；其余字段仍走手动保存。 */
      const toggleNow = async (field, value) => {
        setField(field, value)
        if (draft?.id === undefined || draft.id === '') return
        setBusy(true)
        setError('')
        try {
          const data = await api('update', { id: draft.id, patch: { [field]: value } })
          // 只同步 revision，不拿返回值覆盖 draft——否则会把还没保存的文字改动冲掉。
          setDraft((prev) => (prev === null ? prev : { ...prev, revision: data.persona?.revision ?? prev.revision }))
          await loadList()
          await loadPreview(draft.id)
        } catch (cause) {
          setError(cause instanceof Error ? cause.message : String(cause))
        } finally {
          setBusy(false)
        }
      }

      // 间隔上下限一起提交：min 超过 max 时在本地先扶正，回填也用本地算好的值。
      // 注意：不要在这里调 save() 里的 num——那是局部函数，在这里不可见，
      // 抛错会发生在 setDraft 的更新回调里，try/catch 接不住，整页白屏。
      const commitGap = async () => {
        const rawMin = Number(draft?.purposeMinGapMinutes === '' || draft?.purposeMinGapMinutes === undefined || draft?.purposeMinGapMinutes === null
          ? 60
          : draft.purposeMinGapMinutes)
        const rawMax = Number(draft?.purposeMaxGapMinutes === '' || draft?.purposeMaxGapMinutes === undefined || draft?.purposeMaxGapMinutes === null
          ? 120
          : draft.purposeMaxGapMinutes)
        const min = Number.isFinite(rawMin) ? Math.max(5, Math.min(1440, Math.round(rawMin))) : 60
        const max = Number.isFinite(rawMax) ? Math.max(min, Math.min(1440, Math.round(rawMax))) : Math.max(min, 120)
        setField('purposeMinGapMinutes', min)
        setField('purposeMaxGapMinutes', max)
        if (draft?.id === undefined || draft.id === '') return
        setBusy(true)
        setError('')
        try {
          const data = await api('update', {
            id: draft.id,
            patch: { purposeMinGapMinutes: min, purposeMaxGapMinutes: max },
          })
          setDraft((prev) => (prev === null ? prev : {
            ...prev,
            revision: data.persona?.revision ?? prev.revision,
            purposeMinGapMinutes: min,
            purposeMaxGapMinutes: max,
          }))
          await loadList()
          await loadPreview(draft.id)
        } catch (cause) {
          setError(cause instanceof Error ? cause.message : String(cause))
        } finally {
          setBusy(false)
        }
      }

      const pruneMemories = async () => {        if (draft?.id === undefined || draft.id === '') return
        setBusy(true)
        setError('')
        try {
          const data = await api('memory-prune', { id: draft.id, below: 0.15 })
          await loadMemories(draft.id)
          setStatus(`${t('settings.memPruned')} ${Number(data.removed) || 0}`)
        } catch (cause) {
          setError(cause instanceof Error ? cause.message : String(cause))
        } finally {
          setBusy(false)
        }
      }

      const toggleBackups = async () => {
        if (draft?.id === undefined || draft.id === '') return
        const next = showBackups !== true
        setShowBackups(next)
        if (!next) return
        try {
          const data = await api('memory-backups', { id: draft.id })
          setBackups(Array.isArray(data.backups) ? data.backups : [])
        } catch (cause) {
          setError(cause instanceof Error ? cause.message : String(cause))
        }
      }

      const restoreBackup = async (day) => {
        if (draft?.id === undefined || draft.id === '') return
        if (!window.confirm(`把记忆恢复到 ${day} 的快照？当前的会先存一份新的。`)) return
        setBusy(true)
        setError('')
        try {
          const data = await api('memory-restore', { id: draft.id, day })
          await loadMemories(draft.id)
          const fresh = await api('memory-backups', { id: draft.id })
          setBackups(Array.isArray(fresh.backups) ? fresh.backups : [])
          setStatus(`${t('settings.memRestored')} ${Number(data.count) || 0}`)
        } catch (cause) {
          setError(cause instanceof Error ? cause.message : String(cause))
        } finally {
          setBusy(false)
        }
      }

      const forgetSeed = async (seed) => {
        if (draft?.id === undefined || draft.id === '') return
        setBusy(true)
        setError('')
        try {
          await api('seed-forget', { id: draft.id, seedId: seed.id })
          await loadSeeds(draft.id)
          setStatus(t('settings.seedRemoved'))
        } catch (cause) {
          setError(cause instanceof Error ? cause.message : String(cause))
        } finally {
          setBusy(false)
        }
      }

      const remove = async () => {        if (draft?.id === undefined || draft.id === '') return
        if (!window.confirm(t('settings.confirmDelete'))) return
        setBusy(true)
        setError('')
        try {
          await api('delete', { id: draft.id })
          setDraft(null)
          setSelectedId('')
          setPreview(null)
          setTagsText('')
          await loadList()
          setStatus(t('settings.deleted'))
        } catch (cause) {
          setError(cause instanceof Error ? cause.message : String(cause))
        } finally {
          setBusy(false)
        }
      }

      const exportAll = async () => {
        setBusy(true)
        setError('')
        try {
          const data = await api('export', {})
          const blob = new Blob([JSON.stringify(data.data, null, 2)], { type: 'application/json' })
          const url = URL.createObjectURL(blob)
          const anchor = document.createElement('a')
          anchor.href = url
          anchor.download = `personas-${new Date().toISOString().slice(0, 10)}.json`
          document.body.appendChild(anchor)
          anchor.click()
          anchor.remove()
          setTimeout(() => URL.revokeObjectURL(url), 1000)
          setStatus(t('settings.exported'))
        } catch (cause) {
          setError(cause instanceof Error ? cause.message : String(cause))
        } finally {
          setBusy(false)
        }
      }

      const importFile = async (event) => {
        const file = event.target.files?.[0]
        event.target.value = ''
        if (file === undefined) return
        setBusy(true)
        setError('')
        try {
          const raw = await file.text()
          const data = JSON.parse(raw)
          if (!window.confirm(t('settings.importMerge'))) return
          await api('import', { data, mode: 'merge' })
          const list = await loadList()
          if (list.length > 0) await select(list[0].id)
          setStatus(t('settings.imported'))
        } catch (cause) {
          setError(cause instanceof Error ? cause.message : String(cause))
        } finally {
          setBusy(false)
        }
      }

      return h('div', { className: 'dsh-persona-settings' },
        h(Style),
        h('div', { className: 'dsh-persona-settings-head' },
          h('div', null,
            h('h2', null, t('settings.title')),
            h('p', { className: 'dsh-persona-settings-desc' }, t('settings.desc')),
          ),
          h('div', { className: 'dsh-persona-settings-actions' },
            h('button', { type: 'button', className: 'dsh-persona-btn', onClick: startNew }, t('settings.new')),
            h('button', { type: 'button', className: 'dsh-persona-btn', onClick: () => { void exportAll() }, disabled: busy }, t('settings.export')),
            h('button', { type: 'button', className: 'dsh-persona-btn', onClick: () => fileRef.current?.click(), disabled: busy }, t('settings.import')),
            h('input', { ref: fileRef, type: 'file', accept: 'application/json,.json', style: { display: 'none' }, onChange: (event) => { void importFile(event) } }),
          ),
        ),
        h('div', { className: 'dsh-persona-settings-body' },
          h('aside', { className: 'dsh-persona-side' },
            h('div', { className: 'dsh-persona-side-head' },
              h('button', { type: 'button', className: 'dsh-persona-btn', onClick: startNew }, t('settings.new')),
              h('span', { className: 'dsh-persona-spacer', style: { flex: '1 1 auto' } }),
              h('button', { type: 'button', className: 'dsh-persona-iconbtn', onClick: () => { void loadList() }, disabled: busy }, '↻'),
            ),
            h('div', { className: 'dsh-persona-side-list' },
              personas.length === 0
                ? h('div', { className: 'dsh-persona-empty' }, t('settings.empty'))
                : personas.map((persona) => h('button', {
                    key: persona.id,
                    type: 'button',
                    className: 'dsh-persona-side-item',
                    'data-selected': persona.id === selectedId ? 'true' : 'false',
                    onClick: () => { void select(persona.id) },
                  },
                    h('span', { className: 'dsh-persona-side-name' }, persona.name || t('settings.untitled')),
                    h('span', { className: 'dsh-persona-side-sub' }, persona.summary || persona.id),
                  )),
            ),
          ),
          h('section', { className: 'dsh-persona-editor' },
            draft === null
              ? h('div', { className: 'dsh-persona-placeholder' },
                  h('div', null,
                    h('div', { style: { fontWeight: 600, marginBottom: 6 } }, t('settings.select')),
                    h('div', null, t('settings.emptyHint')),
                  ),
                )
              : h('div', null,
                  h('div', { className: 'dsh-persona-editor-head' },
                    h('h3', null, draft.name || t('settings.untitled')),
                    draft.id ? h('span', { className: 'dsh-persona-item-sub' }, `${draft.id} · r${draft.revision}`) : null,
                    h('span', { className: 'dsh-persona-spacer' }),
                    h('button', { type: 'button', className: 'dsh-persona-btn primary', onClick: () => { void save() }, disabled: busy }, busy ? t('settings.saving') : t('settings.save')),
                    draft.id ? h('button', { type: 'button', className: 'dsh-persona-btn', onClick: () => { void enrich() }, disabled: busy, title: t('settings.enrichHint') }, busy ? t('settings.enriching') : t('settings.enrich')) : null,
                    draft.id ? h('button', { type: 'button', className: 'dsh-persona-btn danger', onClick: () => { void remove() }, disabled: busy }, t('settings.delete')) : null,
                  ),
                  draft.id
                    ? h('div', { className: 'dsh-persona-status' }, t('settings.enrichHint'))
                    : null,
                  h('div', { className: 'dsh-persona-tabs' },
                    [
                      ['settings', t('settings.tabSettings')],
                      ['memory', `${t('settings.tabMemory')}（${memories.length}）`],
                      ['preview', t('settings.tabPreview')],
                    ].map(([id, label]) => h('button', {
                      key: id,
                      type: 'button',
                      className: 'dsh-persona-tab',
                      'data-on': tab === id ? 'true' : 'false',
                      onClick: () => setTab(id),
                    }, label)),
                  ),
                  h('div', { style: tab === 'settings' ? undefined : { display: 'none' } },
                  h(Section, { title: t('settings.groupBasic'), hint: t('settings.groupBasicHint'), defaultOpen: true },
                    h('div', { className: 'dsh-persona-field' },
                      h('label', null, t('settings.name')),
                      h('input', { value: draft.name ?? '', onChange: (event) => setField('name', event.target.value) }),
                    ),
                    h('div', { className: 'dsh-persona-field' },
                      h('label', null, t('settings.tags')),
                      h('input', { value: tagsText, onChange: (event) => setTagsText(event.target.value) }),
                    ),
                    h('div', { className: 'dsh-persona-field wide' },
                      h('label', null, t('settings.summary')),
                      h('input', { value: draft.summary ?? '', onChange: (event) => setField('summary', event.target.value) }),
                    ),
                    h('div', { className: 'dsh-persona-field' },
                      h('label', null, t('settings.masterName')),
                      h('input', { value: draft.masterName ?? '', placeholder: '主人', onChange: (event) => setField('masterName', event.target.value) }),
                      h('div', { className: 'hint' }, t('settings.masterNameHint')),
                    ),
                    h('div', { className: 'dsh-persona-field' },
                      h('label', null, t('settings.maxReplyChars')),
                      h('input', {
                        type: 'number',
                        min: 0,
                        max: 4000,
                        step: 1,
                        value: draft.maxReplyChars ?? 0,
                        onChange: (event) => setField('maxReplyChars', event.target.value),
                      }),
                      h('div', { className: 'hint' }, t('settings.maxReplyCharsHint')),
                    ),
                  ),
                  h(Section, { title: t('settings.groupVoice'), hint: t('settings.groupVoiceHint') },
                    h('div', { className: 'dsh-persona-field' },
                      h('label', { className: 'dsh-persona-check' },
                        h('input', {
                          type: 'checkbox',
                          checked: draft.useActions === true,
                          onChange: (event) => setField('useActions', event.target.checked),
                        }),
                        ` ${t('settings.useActions')}`,
                      ),
                      h('div', { className: 'hint' }, t('settings.useActionsHint')),
                    ),
                    h('div', { className: 'dsh-persona-field' },
                      h('label', { className: 'dsh-persona-check' },
                        h('input', {
                          type: 'checkbox',
                          checked: draft.useMemes === true,
                          onChange: (event) => setField('useMemes', event.target.checked),
                        }),
                        ` ${t('settings.useMemes')}`,
                      ),
                      h('label', null, t('settings.memeFrequency')),
                      h('input', {
                        type: 'number',
                        min: 0,
                        max: 100,
                        step: 5,
                        value: draft.memeFrequency ?? 30,
                        onChange: (event) => setField('memeFrequency', event.target.value),
                      }),
                      h('div', { className: 'hint' }, t('settings.memeFrequencyHint')),
                    ),
                  ),
                  h(Section, { title: t('settings.groupActive'), hint: t('settings.groupActiveHint') },
                    h('div', { className: 'dsh-persona-field wide' },
                    h('div', { className: 'dsh-persona-subtabs' },
                      [
                        ['peek', t('settings.peekSection') + (draft.purposeEnabled === true ? t('settings.peekOffTag') : '')],
                        ['purpose', t('settings.purposeSection')],
                      ].map(([id, label]) => h('button', {
                        key: id,
                        type: 'button',
                        className: 'dsh-persona-subtab',
                        'data-on': activeMode === id ? 'true' : 'false',
                        onClick: () => setActiveMode(id),
                      }, label)),
                    ),
                    activeMode === 'purpose'
                      ? h('div', null,
                      h('div', { className: 'dsh-persona-field' },
                      h('label', { className: 'dsh-persona-check' },
                        h('input', {
                          type: 'checkbox',
                          checked: draft.purposeEnabled === true,
                          onChange: (event) => { void toggleNow('purposeEnabled', event.target.checked) },
                        }),
                        ` ${t('settings.purposeEnabled')}`,
                      ),
                      h('label', null, t('settings.purposeDailyMax')),
                      h('input', {
                        type: 'number',
                        min: 0,
                        max: 24,
                        step: 1,
                        // 统一成字符串，避免 number/string 在受控输入里来回切换导致光标或值跳动
                        value: draft.purposeDailyMax === undefined || draft.purposeDailyMax === null
                          ? ''
                          : String(draft.purposeDailyMax),
                        onChange: (event) => setField('purposeDailyMax', event.target.value),
                        // 失焦即落库：这个框不用再点「保存」
                        onBlur: () => {
                          const raw = draft.purposeDailyMax
                          const parsed = Number(raw === '' || raw === undefined || raw === null ? 4 : raw)
                          void toggleNow('purposeDailyMax', Number.isFinite(parsed) ? parsed : 4)
                        },
                      }),
                      h('div', { className: 'hint' }, t('settings.purposeDailyMaxHint')),
                      h('label', null, t('settings.purposeGap')),
                      h('div', { style: { display: 'flex', alignItems: 'center', gap: '8px' } },
                        h('input', {
                          type: 'number',
                          min: 5,
                          max: 1440,
                          step: 5,
                          'aria-label': t('settings.purposeGap') + ' min',
                          style: { width: '110px' },
                          value: draft.purposeMinGapMinutes === undefined || draft.purposeMinGapMinutes === null
                            ? ''
                            : String(draft.purposeMinGapMinutes),
                          onChange: (event) => setField('purposeMinGapMinutes', event.target.value),
                          onBlur: () => { void commitGap() },
                        }),
                        h('span', { className: 'hint' }, '–'),
                        h('input', {
                          type: 'number',
                          min: 5,
                          max: 1440,
                          step: 5,
                          'aria-label': t('settings.purposeGap') + ' max',
                          style: { width: '110px' },
                          value: draft.purposeMaxGapMinutes === undefined || draft.purposeMaxGapMinutes === null
                            ? ''
                            : String(draft.purposeMaxGapMinutes),
                          onChange: (event) => setField('purposeMaxGapMinutes', event.target.value),
                          onBlur: () => { void commitGap() },
                        }),
                        h('span', { className: 'hint' }, t('settings.purposeGapUnit')),
                      ),
                      h('div', { className: 'hint' }, t('settings.purposeGapHint')),
                      h('label', { className: 'dsh-persona-check' },
                        h('input', {
                          type: 'checkbox',
                          checked: draft.purposeRunOnBusy === true,
                          onChange: (event) => { void toggleNow('purposeRunOnBusy', event.target.checked) },
                        }),
                        ` ${t('settings.purposeRunOnBusy')}`,
                      ),
                      h('div', { className: 'hint' }, t('settings.purposeRunOnBusyHint')),
                      h('div', { className: 'hint' }, t('settings.purposeHint')),
                      ),
                      )
                      : h('div', null,
                    h('div', { className: 'dsh-persona-field' },
                      h('label', { className: 'dsh-persona-check' },
                        h('input', {
                          type: 'checkbox',
                          checked: draft.peekEnabled === true,
                          onChange: (event) => { void toggleNow('peekEnabled', event.target.checked) },
                        }),
                        ` ${t('settings.peekEnabled')}`,
                      ),
                      h('div', { className: 'hint' }, t('settings.peekEnabledHint')),
                    ),
                    h('div', { className: 'dsh-persona-field' },
                      h('label', { className: 'dsh-persona-check' },
                        h('input', {
                          type: 'checkbox',
                          checked: draft.peekScheduleEnabled === true,
                          onChange: (event) => { void toggleNow('peekScheduleEnabled', event.target.checked) },
                        }),
                        ` ${t('settings.peekScheduleEnabled')}`,
                      ),
                      h('div', { className: 'hint' }, t('settings.peekScheduleHint')),
                    ),
                    draft.peekScheduleEnabled === true
                      ? h('div', { className: 'dsh-persona-field wide' },
                          h('label', null, t('settings.peekBusyRanges')),
                          h('input', {
                            value: draft.peekBusyRanges ?? '',
                            placeholder: '09:00-12:00, 14:00-18:00',
                            onChange: (event) => setField('peekBusyRanges', event.target.value),
                          }),
                          h('div', { className: 'hint' }, t('settings.peekBusyRangesHint')),
                          h('div', { className: 'hint' }, peekBandNow(draft) === 'busy'
                            ? t('settings.peekNowBusy')
                            : t('settings.peekNowIdle')),
                        )
                      : null,
                    h('div', { className: 'dsh-persona-field' },
                      h('label', null, t('settings.peekEveryMinutes')),
                      h('input', {
                        type: 'number',
                        min: 0,
                        max: 240,
                        step: 1,
                        value: draft.peekEveryMinutes ?? 15,
                        onChange: (event) => setField('peekEveryMinutes', event.target.value),
                      }),
                      h('label', null, t('settings.peekChance')),
                      h('input', {
                        type: 'number',
                        min: 0,
                        max: 100,
                        step: 5,
                        value: draft.peekChance ?? 30,
                        onChange: (event) => setField('peekChance', event.target.value),
                      }),
                      h('div', { className: 'hint' }, t('settings.peekHint')),
                    ),
                    h('div', {
                      className: 'dsh-persona-field',
                      style: draft.peekScheduleEnabled === true ? undefined : { opacity: 0.55 },
                    },
                      h('label', null, t('settings.peekBusyEveryMinutes')),
                      h('input', {
                        type: 'number',
                        min: 0,
                        max: 240,
                        step: 1,
                        value: draft.peekBusyEveryMinutes ?? 5,
                        onChange: (event) => setField('peekBusyEveryMinutes', event.target.value),
                      }),
                      h('label', null, t('settings.peekBusyChance')),
                      h('input', {
                        type: 'number',
                        min: 0,
                        max: 100,
                        step: 5,
                        value: draft.peekBusyChance ?? 60,
                        onChange: (event) => setField('peekBusyChance', event.target.value),
                      }),
                      h('div', { className: 'hint' }, t('settings.peekBusyHint')),
                    ),
                    ),
                    ),
                  ),
                  h(Section, { title: t('settings.groupAnchor'), hint: t('settings.groupAnchorHint') },
                    h('div', { className: 'dsh-persona-field wide' },
                      h('label', null, t('settings.tagCode')),
                      h('textarea', { rows: 5, value: draft.tagCode ?? '', placeholder: '【PERSONA_LOAD】\nSELF_CLAIM_…\nTO_MASTER_…\nTO_OTHERS_…', onChange: (event) => setField('tagCode', event.target.value) }),
                      h('label', { className: 'dsh-persona-check' },
                        h('input', {
                          type: 'checkbox',
                          checked: draft.injectTags !== false,
                          onChange: (event) => setField('injectTags', event.target.checked),
                        }),
                        ` ${t('settings.injectTags')}`,
                      ),
                      h('div', { className: 'hint' }, t('settings.tagCodeHint')),
                    ),
                  ),
                  h(Section, { title: t('settings.groupSelf'), hint: t('settings.groupSelfHint') },
                    h('div', { className: 'dsh-persona-field wide' },
                      h('label', null, t('settings.identity')),
                      h('textarea', { rows: 3, value: draft.identity ?? '', onChange: (event) => setField('identity', event.target.value) }),
                    ),
                    h('div', { className: 'dsh-persona-field wide' },
                      h('label', null, t('settings.traits')),
                      h('textarea', { rows: 3, value: draft.traits ?? '', onChange: (event) => setField('traits', event.target.value) }),
                      h('div', { className: 'hint' }, t('settings.traitsHint')),
                    ),
                    h('div', { className: 'dsh-persona-field wide' },
                      h('label', null, t('settings.voice')),
                      h('textarea', { rows: 3, value: draft.voice ?? '', onChange: (event) => setField('voice', event.target.value) }),
                    ),
                    h('div', { className: 'dsh-persona-field' },
                      h('label', null, t('settings.likes')),
                      h('textarea', { rows: 3, value: draft.likes ?? '', onChange: (event) => setField('likes', event.target.value) }),
                    ),
                    h('div', { className: 'dsh-persona-field' },
                      h('label', null, t('settings.dislikes')),
                      h('textarea', { rows: 3, value: draft.dislikes ?? '', onChange: (event) => setField('dislikes', event.target.value) }),
                    ),
                    h('div', { className: 'dsh-persona-field' },
                      h('label', null, t('settings.habits')),
                      h('textarea', { rows: 3, value: draft.habits ?? '', onChange: (event) => setField('habits', event.target.value) }),
                    ),
                    h('div', { className: 'dsh-persona-field' },
                      h('label', null, t('settings.drives')),
                      h('textarea', { rows: 3, value: draft.drives ?? '', onChange: (event) => setField('drives', event.target.value) }),
                    ),
                  ),
                  h(Section, { title: t('settings.groupRelation'), hint: t('settings.groupRelationHint') },
                    h('div', { className: 'dsh-persona-field' },
                      h('label', null, t('settings.relationship')),
                      h('textarea', { rows: 3, value: draft.relationship ?? '', onChange: (event) => setField('relationship', event.target.value) }),
                      h('div', { className: 'hint' }, t('settings.relationshipHint')),
                    ),
                    h('div', { className: 'dsh-persona-field' },
                      h('label', null, t('settings.relationshipOthers')),
                      h('textarea', { rows: 3, value: draft.relationshipOthers ?? '', onChange: (event) => setField('relationshipOthers', event.target.value) }),
                      h('div', { className: 'hint' }, t('settings.relationshipOthersHint')),
                    ),
                    h('div', { className: 'dsh-persona-field' },
                      h('label', null, t('settings.boundaries')),
                      h('textarea', { rows: 3, value: draft.boundaries ?? '', onChange: (event) => setField('boundaries', event.target.value) }),
                    ),
                    h('div', { className: 'dsh-persona-field' },
                      h('label', null, t('settings.knowledge')),
                      h('textarea', { rows: 3, value: draft.knowledge ?? '', onChange: (event) => setField('knowledge', event.target.value) }),
                    ),
                  ),
                  h(Section, { title: t('settings.groupLore'), hint: t('settings.groupLoreHint') },
                    h('div', { className: 'dsh-persona-field wide' },
                      h('label', null, t('settings.examples')),
                      h('textarea', { rows: 3, value: draft.examples ?? '', onChange: (event) => setField('examples', event.target.value) }),
                    ),
                    h('div', { className: 'dsh-persona-field wide' },
                      h('label', null, t('settings.lore')),
                      h('textarea', { rows: 5, value: draft.lore ?? '', onChange: (event) => setField('lore', event.target.value) }),
                      h('label', { className: 'dsh-persona-check' },
                        h('input', {
                          type: 'checkbox',
                          checked: draft.injectLore !== false,
                          onChange: (event) => setField('injectLore', event.target.checked),
                        }),
                        ` ${t('settings.injectLore')}`,
                      ),
                      h('div', { className: 'hint' }, t('settings.injectLoreHint')),
                    ),
                  ),
                  ),
                  h('div', { style: tab === 'memory' ? undefined : { display: 'none' } },
                    h('div', { className: 'dsh-persona-field wide', style: { marginBottom: 6 } },
                      h('label', { className: 'dsh-persona-check' },
                        h('input', {
                          type: 'checkbox',
                          checked: draft.autoMemory === true,
                          onChange: (event) => { void toggleNow('autoMemory', event.target.checked) },
                        }),
                        ` ${t('settings.autoMemory')}`,
                      ),
                      h('div', { className: 'hint' }, t('settings.autoMemoryHint')),
                    ),
                    h('div', { className: 'dsh-persona-memtools' },
                      h('input', {
                        className: 'dsh-persona-memsearch',
                        value: memQuery,
                        placeholder: t('settings.memSearch'),
                        onChange: (event) => setMemQuery(event.target.value),
                      }),
                      h('select', { value: memKind, onChange: (event) => setMemKind(event.target.value) },
                        h('option', { value: '' }, t('settings.memKindAll')),
                        h('option', { value: 'fact' }, '事实'),
                        h('option', { value: 'preference' }, '偏好'),
                        h('option', { value: 'plan' }, '计划'),
                        h('option', { value: 'event' }, '事件'),
                      ),
                      h('select', { value: memOwner, onChange: (event) => setMemOwner(event.target.value) },
                        h('option', { value: '' }, t('settings.memOwnerAll')),
                        h('option', { value: '__none' }, '通用'),
                        ownerOptions.map((owner) => h('option', { key: owner, value: owner }, owner)),
                      ),
                      h('select', { value: memSort, onChange: (event) => setMemSort(event.target.value) },
                        h('option', { value: 'clarity' }, t('settings.memSortClarity')),
                        h('option', { value: 'importance' }, t('settings.memSortImportance')),
                        h('option', { value: 'recent' }, t('settings.memSortRecent')),
                      ),
                    ),
                    h('div', { className: 'dsh-persona-status' }, t('settings.memoriesHint')),
                    memoryGroups.map((group) => h(Section, {
                      key: group.key,
                      title: `${group.label}（${group.items.length}）`,
                      defaultOpen: group.key === 'alive',
                    },
                      group.items.length === 0
                        ? h('div', { className: 'dsh-persona-status' }, t('settings.memNone'))
                        : group.items.map((item) => renderMemoryRow(item)),
                    )),
                    h('div', { className: 'dsh-persona-memtools' },
                      h('button', {
                        type: 'button',
                        className: 'dsh-persona-btn',
                        disabled: busy || memories.length === 0,
                        onClick: () => { void pruneMemories() },
                      }, t('settings.memPrune')),
                      h('button', {
                        type: 'button',
                        className: 'dsh-persona-btn',
                        disabled: busy,
                        onClick: () => { void toggleBackups() },
                      }, `${t('settings.memBackups')}${backups.length > 0 ? `（${backups.length}）` : ''}`),
                    ),
                    h(Section, { title: `${t('settings.seeds')}（${seeds.length}）` },
                      seeds.length === 0
                        ? h('div', { className: 'dsh-persona-status' }, t('settings.seedsEmpty'))
                        : seeds.map((seed) => h('div', { key: seed.id, className: 'dsh-persona-memrow' },
                            h('div', { className: 'dsh-persona-memmain' },
                              h('div', { className: 'dsh-persona-memmeta' },
                                [
                                  t(`settings.seedKind.${seed.kind}`),
                                  `${t('settings.seedDue')} ${new Date(seed.dueAt).toLocaleString('zh-CN', { hour12: false, month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}`,
                                  seed.askedCount > 0 ? `${t('settings.seedAsked')} ${seed.askedCount}` : t('settings.seedUnasked'),
                                ].join(' · '),
                              ),
                              h('div', { className: 'dsh-persona-memtext' }, seed.text),
                            ),
                            h('button', {
                              type: 'button',
                              className: 'dsh-persona-iconbtn',
                              title: t('settings.seedForget'),
                              disabled: busy,
                              onClick: () => { void forgetSeed(seed) },
                            }, '×'),
                          )),
                    ),
                    showBackups
                      ? h('div', { className: 'dsh-persona-memtools', style: { flexDirection: 'column', alignItems: 'stretch', gap: 6 } },
                          backups.length === 0
                            ? h('div', { className: 'dsh-persona-status' }, t('settings.memBackupsEmpty'))
                            : backups.map((item) => h('div', { key: item.day, className: 'dsh-persona-memrow' },
                                h('div', { className: 'dsh-persona-memmain' },
                                  h('div', { className: 'dsh-persona-memmeta' }, `${item.day} · ${item.count} 条`),
                                ),
                                h('button', {
                                  type: 'button',
                                  className: 'dsh-persona-btn',
                                  disabled: busy,
                                  onClick: () => { void restoreBackup(item.day) },
                                }, t('settings.memRestore')),
                              )),
                        )
                      : null,
                    h('div', { style: { display: 'flex', gap: 8, marginTop: 8 } },
                      h('input', {
                        style: { flex: '1 1 auto' },
                        value: memoryText,
                        placeholder: t('settings.memoryPlaceholder'),
                        onChange: (event) => setMemoryText(event.target.value),
                        onKeyDown: (event) => { if (event.key === 'Enter') { void addMemory() } },
                      }),
                      h('button', {
                        type: 'button',
                        className: 'dsh-persona-btn',
                        disabled: busy || memoryText.trim() === '',
                        onClick: () => { void addMemory() },
                      }, t('settings.memoryAdd')),
                    ),
                  ),
                  h('div', { style: tab === 'preview' ? undefined : { display: 'none' } },
                  h('div', { className: 'dsh-persona-preview' },
                    h('div', { className: 'dsh-persona-preview-head' },
                      h('strong', null, t('settings.preview')),
                      h('span', null, preview
                        ? `${preview.chars} / ${preview.budget || '—'} ${t('settings.chars')}`
                        : ''),
                    ),
                    h('div', { className: 'dsh-persona-status' }, t('settings.previewHint')),
                    h('pre', null, preview?.capsule || t('settings.noPreview')),
                  ),
                  ),
                  h('div', { className: `dsh-persona-status${error ? ' error' : ''}` }, error || status || t('settings.hint')),
                ),
          ),
        ),
      )
    }

    function PersonaNavIcon({ size = 16 } = {}) {
      return h('svg', {
        width: size,
        height: size,
        viewBox: '0 0 16 16',
        'aria-hidden': 'true',
        style: { display: 'block' },
      },
        h('circle', { cx: 8, cy: 5.2, r: 2.7, fill: 'currentColor' }),
        h('path', {
          d: 'M2.6 13.6c0-2.7 2.4-4.4 5.4-4.4s5.4 1.7 5.4 4.4',
          fill: 'none',
          stroke: 'currentColor',
          strokeWidth: 1.5,
          strokeLinecap: 'round',
        }),
      )
    }

    /**
     * 渲染兜底：人格页任何一处抛错都只崩这一块，不把整个界面刷成白的。
     * 必须是 class —— 函数组件做不了错误边界（getDerivedStateFromError）。
     */
    class PersonaBoundary extends React.Component {
      constructor(props) {
        super(props)
        this.state = { error: null, at: 0 }
        this.retry = this.retry.bind(this)
        this.reload = this.reload.bind(this)
      }

      static getDerivedStateFromError(error) {
        return { error }
      }

      componentDidCatch(error, info) {
        // 留现场：控制台里能看到完整堆栈和组件栈，方便直接贴回来。
        try {
          console.error('[dsh-persona] 人格页渲染出错：', error, info?.componentStack ?? '')
        } catch {}
      }

      retry() {
        this.setState({ error: null, at: Date.now() })
      }

      reload() {
        try { window.location.reload() } catch {}
      }

      render() {
        const error = this.state.error
        if (error === null || error === undefined) return this.props?.children ?? null
        const message = error instanceof Error
          ? `${error.name}: ${error.message}`
          : String(error)
        return h('div', { className: 'dsh-persona-field', style: { padding: '16px' } },
          h('div', { style: { fontWeight: 600, marginBottom: '6px' } }, RUNTIME.t('boundary.title')),
          h('div', { className: 'hint' }, RUNTIME.t('boundary.hint')),
          h('pre', {
            style: {
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-all',
              fontSize: '12px',
              lineHeight: 1.5,
              padding: '10px',
              marginTop: '10px',
              borderRadius: '6px',
              background: 'rgba(127,127,127,0.12)',
            },
          }, message),
          h('div', { style: { display: 'flex', gap: '8px', marginTop: '12px' } },
            h('button', { type: 'button', onClick: this.retry }, RUNTIME.t('boundary.retry')),
            h('button', { type: 'button', onClick: this.reload }, RUNTIME.t('boundary.reload')),
          ),
          h('div', { className: 'hint', style: { marginTop: '8px' } }, RUNTIME.t('boundary.note')),
        )
      }
    }

    /** 一级页面：复用设置页那套编辑器，外面套一层限宽容器。 */
    function PersonaPage() {
      return h('div', { className: 'dsh-persona-page' },
        h(Style),
        h('div', { className: 'dsh-persona-page-inner' },
          h(PersonaBoundary, null, h(PersonaSettings, null)),
        ),
      )
    }

    return {
      inject: ['slots', 'locale'],
      apply(ctx) {
        ctx.effect(
          () => ctx.locale.register('dsh-persona', { zh: ZH, en: EN }),
          'dsh-persona: locale dictionaries',
        )
        const t = (key) => ZH[key] ?? key
        // 兜底视图也要能说人话：把 t 挂到 RUNTIME，PersonaBoundary 里用。
        RUNTIME.t = t

        // 拿宿主布局服务：用来从 dock 跳到侧栏的人格页。拿不到就退回图标入口。
        try {
          const layout = typeof ctx.get === 'function' ? ctx.get('layout') : null
          RUNTIME.layout = layout ?? null
        } catch {
          RUNTIME.layout = null
        }

        ctx.slots.inject('conversation.input.dock', () => ctx.slots.register({
          name: 'conversation.input.dock',
          id: 'dsh-persona',
          order: 30,
        }, PersonaDock))

        // 侧栏图标 + 主区域页面：和「插件」「自动化任务」同级的一级入口。
        ctx.slots.inject('sidebar.panellist', () => ctx.slots.register({
          name: 'sidebar.panellist',
          id: 'dsh-persona',
          order: 40,
          label: () => t('nav.persona'),
          locale: 'dsh-persona',
        }, PersonaNavIcon))

        ctx.slots.inject('main', () => ctx.slots.register({
          name: 'main',
          key: 'dsh-persona',
          locale: 'dsh-persona',
        }, PersonaPage))
      },
    }
  },
})
