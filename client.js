window.__ModuleLoader__.load({
  id: '@local/dsh-persona',
  factory(require) {
    const React = require('react')
    const h = React.createElement
    const { useCallback, useEffect, useMemo, useRef, useState } = React

    const API = '/dsh-persona/api'

    const ZH = {
      'dock.active': '人格',
      'dock.choose': '选择人格',
      'dock.off': '关闭人格',
      'dock.none': '不使用人格',
      'dock.search': '搜索人格…',
      'dock.refresh': '刷新',
      'dock.manage': '在 设置 → 人格库 中新建和编辑',
      'dock.empty': '还没有人格卡。可以在聊天里说“创建一个人格，叫…”。',
      'dock.loading': '载入中…',
      'dock.error': '操作失败',
      'dock.close': '关闭',
      'dock.preview': '查看自我认知',
      'dock.previewHint': '当前会话这一步实际注入的内容（静态人格卡 + 场景与正史）',
      'dock.previewChars': '字符',
      'dock.thin': '这张卡的自我认知还比较薄。可以点下面的“补完自我认知”，让模型把性格、喜好、习惯和过去补具体。',
      'settings.title': '人格库',
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
      'settings.selfCognition': '自我认知',
      'settings.saved': '已保存',
      'settings.deleted': '已删除',
      'settings.confirmDelete': '确定删除这张人格卡？绑定它的会话会回到默认助手。',
      'settings.nameRequired': '名字不能为空',
      'settings.imported': '已导入',
      'settings.exported': '已导出',
      'settings.empty': '还没有人格卡',
      'settings.emptyHint': '先写一个名字和一句话设定，之后可以在聊天里继续补完。',
      'settings.load': '载入中…',
      'settings.error': '操作失败',
      'settings.importMerge': '导入会合并同 id 的卡片，是否继续？',
      'settings.current': '当前',
      'settings.untitled': '未命名人格',
      'settings.chars': '字符',
      'settings.noPreview': '保存后可预览',
      'settings.deleteShort': '删',
      'settings.hint': '保存后，绑定了这张卡的所有会话从下一步起生效。',
    }

    const EN = {
      'dock.active': 'Persona',
      'dock.choose': 'Choose persona',
      'dock.off': 'Turn off persona',
      'dock.none': 'No persona',
      'dock.search': 'Search personas…',
      'dock.refresh': 'Refresh',
      'dock.manage': 'Create and edit in Settings → Persona Studio',
      'dock.empty': 'No persona cards yet. Say “create a persona named …” in chat.',
      'dock.loading': 'Loading…',
      'dock.error': 'Action failed',
      'dock.close': 'Close',
      'dock.preview': 'View self-knowledge',
      'dock.previewHint': 'What this session will actually inject on the next step (static card + scene and canon)',
      'dock.previewChars': 'chars',
      'dock.thin': 'This card is still thin. Use “Complete self-knowledge” below to let the model fill in temperament, tastes, habits and history.',
      'settings.title': 'Persona Studio',
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
      'settings.selfCognition': 'Self-knowledge',
      'settings.saved': 'Saved',
      'settings.deleted': 'Deleted',
      'settings.confirmDelete': 'Delete this persona card? Sessions bound to it return to the default assistant.',
      'settings.nameRequired': 'A name is required',
      'settings.imported': 'Imported',
      'settings.exported': 'Exported',
      'settings.empty': 'No persona cards yet',
      'settings.emptyHint': 'Start with a name and a one-line premise; continue refining it in chat.',
      'settings.load': 'Loading…',
      'settings.error': 'Action failed',
      'settings.importMerge': 'Import will merge cards with the same id. Continue?',
      'settings.current': 'Active',
      'settings.untitled': 'Untitled persona',
      'settings.chars': 'chars',
      'settings.noPreview': 'Save to preview',
      'settings.deleteShort': 'Del',
      'settings.hint': 'Sessions bound to this card will use the change from their next step.',
    }

    const CSS = `
.dsh-persona-dock { margin: 0 0 6px; color: var(--dsw-alias-label-primary); font-size: 12px; }
.dsh-persona-bar { display: flex; align-items: center; gap: 6px; min-height: 26px; }
.dsh-persona-chip { display: inline-flex; align-items: center; gap: 6px; max-width: min(420px, 100%); padding: 3px 9px; border: 1px solid var(--dsw-alias-border-l1); border-radius: 999px; background: var(--dsw-alias-bg-layer-2); color: var(--dsw-alias-label-secondary); font: inherit; cursor: pointer; }
.dsh-persona-chip:hover { border-color: var(--dsw-alias-border-l2); color: var(--dsw-alias-label-primary); }
.dsh-persona-chip[aria-expanded="true"] { border-color: var(--dsw-alias-brand-primary); color: var(--dsw-alias-label-primary); }
.dsh-persona-dot { width: 7px; height: 7px; border-radius: 50%; background: var(--dsw-alias-state-idle-primary); flex: 0 0 auto; }
.dsh-persona-dot.on { background: var(--dsw-alias-brand-primary); }
.dsh-persona-name { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.dsh-persona-mini { border: 0; background: transparent; color: var(--dsw-alias-label-secondary); cursor: pointer; padding: 2px 4px; font: inherit; }
.dsh-persona-mini:hover { color: var(--dsw-alias-state-error-primary); }
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
                h('span', null, t('dock.manage')),
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
      }
    }

    function PersonaSettings(props) {
      // Keep the whole operation surface Chinese regardless of the host locale.
      const t = (key) => ZH[key] ?? key
      const [personas, setPersonas] = useState([])
      const [selectedId, setSelectedId] = useState('')
      const [draft, setDraft] = useState(null)
      const [tagsText, setTagsText] = useState('')
      const [preview, setPreview] = useState(null)
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

      const select = useCallback(async (id) => {
        setSelectedId(id)
        setStatus('')
        setError('')
        try {
          const data = await api('get', { id })
          setDraft(data.persona)
          setTagsText((data.persona.tags ?? []).join(', '))
          await loadPreview(id)
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
                  h('div', { className: 'dsh-persona-grid' },
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
                  h('div', { className: `dsh-persona-status${error ? ' error' : ''}` }, error || status || t('settings.hint')),
                ),
          ),
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

        ctx.slots.inject('conversation.input.dock', () => ctx.slots.register({
          name: 'conversation.input.dock',
          id: 'dsh-persona',
          order: 30,
        }, PersonaDock))

        ctx.slots.inject('settings.section', () => ctx.slots.register({
          name: 'settings.section',
          id: 'dsh-persona',
          order: 25,
          label: () => t('settings.title'),
        }, PersonaSettings))
      },
    }
  },
})
