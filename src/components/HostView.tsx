import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ZoomableImage } from './ZoomableImage';
import { CHARACTER_SCRIPTS, INVESTIGATION_LOCATIONS } from '../data/character-scripts';
import { CHARACTER_IMAGES, LOCATION_IMAGES } from '../data/visual-assets';
import { CrimeMap } from './CrimeMap';

interface Props {
  onBack: () => void;
}

const ALL_CHARS = Object.values(CHARACTER_SCRIPTS);
type TabId = 'overview' | 'scripts' | 'map' | 'answers';

export function HostView({ onBack }: Props) {
  const [tab, setTab] = useState<TabId>('overview');
  const [selectedChar, setSelectedChar] = useState(ALL_CHARS[0]?.id ?? '');
  const char = CHARACTER_SCRIPTS[selectedChar];

  const tabs: { id: TabId; label: string; icon: string }[] = [
    { id: 'overview', label: '案件总览', icon: '🎭' },
    { id: 'scripts', label: '全角色剧本', icon: '📜' },
    { id: 'map', label: '案发现场图', icon: '🗺️' },
    { id: 'answers', label: '答案与真相', icon: '🔑' },
  ];

  return (
    <div className="space-y-6">
      <div className="paper-card p-6">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-xl font-title font-bold text-ink">🎭 主持人全知视角</h1>
            <p className="text-xs text-sepia-light font-ui mt-1">月落华懋 · 密室杀人 · 问答终局</p>
          </div>
          <span className="tag-secret">仅主持人</span>
        </div>
        <div className="mt-3 pt-3 border-t border-sepia-light/10">
          <p className="text-xs text-vermilion font-body leading-relaxed">
            ⚠️ <b>此页面仅供主持人参考，请勿分享给任何玩家。</b>包含全部角色的完整剧本、隐藏内容、密室手法图解、以及终局问答的正确答案。
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-cream/50 rounded-lg p-1 border border-sepia-light/10">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 py-2 text-xs font-ui transition-all ${
              tab === t.id
                ? 'bg-white shadow-sm text-burgundy font-semibold rounded'
                : 'text-sepia-light hover:text-sepia'
            }`}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Tab: Overview */}
      {tab === 'overview' && (
        <div className="space-y-4">
          <div className="paper-card p-5">
            <div className="section-title text-sm mb-3">案件概要</div>
            <div className="text-xs text-sepia leading-relaxed whitespace-pre-line">
              民国十四年四月十二日，华懋饭店顶层套房（801室）。航运大亨方仲远（62岁）在订婚宴上暴毙。
              法医鉴定：双重致死——氰化物中毒（主要）+ 后脑撞击伤（辅助）。
              发现尸体时房门自内闩死——密室已成。
              下毒者：方敬尧（真凶）——用研钵碾碎氰化钾，撒入父亲专用酒杯。
              头击者：沈若兰——与方仲远对质时推搡致其撞上壁炉（非致命）。
              密室制造者：方敬尧——用细线从门外拉动门闩，制造"不可能犯罪"假象。
              毒药来源：赵启明从医学院偷走的氰化钾，被方敬尧盗用。
            </div>
          </div>

          <div className="paper-card p-5">
            <div className="section-title text-sm mb-3">关键时间线（校正后）</div>
            <div className="text-xs text-sepia leading-relaxed whitespace-pre-line">
              20:15 — 方敬尧在配餐间碾碎氰化物，撒入方仲远酒杯
              20:30 — 方仲远饮下毒酒（同时服用了血管扩张剂，毒发延长至30分钟）
              20:35 — 沈若兰进入801卧室与方仲远对质沈家旧事
              20:40 — 沈若兰推搡方仲远——后脑撞壁炉——沈若兰通过连接门逃往802
              20:45 — 唐文轩在802走廊看到沈若兰慌张逃出——随后进入801查看
              20:50 — 唐文轩离开801——带上门但未闩
              20:55 — 方敬尧通过连接门进入801——发现父亲垂死
              21:00 — 方敬尧从801正门离开——在走廊用细线操作门闩——密室形成
              21:30 — 众人发现门闩死——破门——发现尸体
            </div>
          </div>

          <div className="paper-card p-5">
            <div className="section-title text-sm mb-3">核心诡计一览</div>
            <div className="space-y-2 text-xs text-sepia">
              <div className="p-2 border border-vermilion/10 rounded bg-vermilion/[0.02]">
                <b className="text-vermilion">密室手法：</b>细棉线套住滑动门闩把手 → 线从门缝引出 → 关门 → 从门外拉线 → 门闩滑入槽 → 用力拉断线头 → 密室形成。关键证据：门闩上的线痕 + 门缝中的棉线纤维。
              </div>
              <div className="p-2 border border-burgundy/10 rounded bg-burgundy/[0.02]">
                <b className="text-burgundy">毒发延迟：</b>方仲远服用的实验性血管扩张剂（亚硝酸异戊酯）与氰化物竞争吸收——正常5分钟毒发延长到30分钟。造成下毒者以为失手——给沈若兰推搡和方敬尧二次进入提供了时间窗口。
              </div>
              <div className="p-2 border border-brass/10 rounded bg-brass/[0.02]">
                <b className="text-brass">双重伤痕：</b>法医发现头伤处皮下出血较少——证明受击时血压已因氰化物下降。毒先于伤至少15-20分钟——毒是主因，伤是辅助。
              </div>
              <div className="p-2 border border-sepia-light/10 rounded">
                <b>诡叙手法：</b>方敬尧（虚假记忆）、沈若兰（日记倒序）、唐文轩（三人称转一人称）、柳如烟（PTSD场景混淆——江水/月光）、马维仁（时间感知障碍）、赵启明（第二人称自白书）。
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Scripts */}
      {tab === 'scripts' && (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {ALL_CHARS.map(c => (
              <button
                key={c.id}
                onClick={() => setSelectedChar(c.id)}
                className={`px-3 py-1.5 text-xs font-ui border transition-all ${
                  selectedChar === c.id
                    ? 'border-burgundy bg-burgundy/[0.06] text-burgundy font-semibold'
                    : 'border-sepia-light/10 text-sepia-light hover:border-sepia-light/30'
                } ${c.isCulprit ? 'ring-1 ring-vermilion/20' : ''}`}
              >
                <span className="inline-flex items-center gap-1.5">
                  <ZoomableImage src={CHARACTER_IMAGES[c.id].url} alt={CHARACTER_IMAGES[c.id].alt} className="h-5 w-4 rounded object-cover object-top" stopPropagation />
                  {c.name}
                </span>
                {c.isCulprit && <span className="ml-1 text-vermilion text-[9px]">真凶</span>}
              </button>
            ))}
          </div>

          {char && (
            <div className="space-y-4">
              <div className="paper-card p-5">
                <div className="flex items-center gap-4">
                  <div className="h-20 w-16 overflow-hidden rounded-lg border border-sepia-light/15 bg-sepia-light/10">
                    <ZoomableImage src={CHARACTER_IMAGES[char.id].url} alt={CHARACTER_IMAGES[char.id].alt} className="h-full w-full object-cover object-top" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-title font-bold text-ink">{char.name}</h2>
                      {char.isCulprit && <span className="tag-secret">真凶</span>}
                    </div>
                    <p className="text-xs text-sepia-light">{char.title} · {char.age}岁</p>
                  </div>
                </div>
              </div>

              {char.acts.map(act => (
                <div key={act.actId} className="act-card current">
                  <div className="text-sm font-title font-bold text-ink mb-2">
                    {act.title}
                    {act.investigationTrigger && (
                      <span className="text-[9px] bg-brass/10 text-brass px-1.5 py-0.5 rounded-full ml-2">触发调查</span>
                    )}
                  </div>
                  <div className="text-xs text-sepia leading-relaxed whitespace-pre-line typing-text">
                    {act.content}
                  </div>
                  {act.newClues.length > 0 && (
                    <div className="mt-3 pt-2 border-t border-dashed border-brass/20">
                      <div className="text-[10px] font-ui text-brass mb-1">线索</div>
                      {act.newClues.map(clue => (
                        <div key={clue.id} className="text-xs text-sepia mb-1">
                          · <b>{clue.name}</b> <span className={`text-[9px] ${clue.canShare ? 'text-jade' : 'text-vermilion'}`}>{clue.canShare ? '可分享' : '隐藏'}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {char.hiddenActs && char.hiddenActs.map(act => (
                <div key={act.actId} className="act-card current border-vermilion/30 bg-vermilion/[0.02]">
                  <div className="text-sm font-title font-bold text-ink mb-2">
                    🔓 {act.title} <span className="text-[9px] text-vermilion ml-1">需线索解锁</span>
                  </div>
                  <div className="text-xs text-sepia leading-relaxed whitespace-pre-line typing-text">{act.content}</div>
                </div>
              ))}

              {char.finalQuestions.length > 0 && (
                <div className="paper-card p-4 border-burgundy/20 bg-burgundy/[0.02]">
                  <div className="text-xs font-title font-bold text-ink mb-2">❓ 终局问答（{char.finalQuestions.length}题 × 20分）</div>
                  {char.finalQuestions.map(q => {
                    const correct = q.options.find(o => o.id === q.correctOptionId);
                    return (
                      <div key={q.id} className="text-xs mb-2 ml-2">
                        <div className="text-sepia font-semibold">{q.question}</div>
                        <div className="text-jade mt-0.5">✓ 答案：{correct?.label ?? '未知'}</div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Tab: Map */}
      {tab === 'map' && (
        <div className="space-y-4">
          <CrimeMap />
          <div className="paper-card p-5">
            <div className="section-title text-sm mb-3">密室手法图解说明</div>
            <div className="space-y-2 text-xs text-sepia leading-relaxed">
              <p>1. 凶手（方敬尧）在801室内完成下毒后——从正门离开（门未闩）。</p>
              <p>2. 在走廊中，凶手取出预先准备好的细棉线——将线折叠成环，从门与门框的缝隙中塞入。</p>
              <p>3. 通过反复尝试，使线环套住滑动门闩的把手。</p>
              <p>4. 拉紧线环——使线环紧扣把手——缓缓拉动棉线——门闩沿滑槽滑入闩位。</p>
              <p>5. 继续用力拉——线环从把手上脱落——从门缝抽出整根棉线。</p>
              <p className="text-burgundy font-semibold">6. 关键证据：门闩上的细线勒痕 + 门缝底部残留的棉线纤维。</p>
              <p className="text-sepia-light/60 mt-2">注：连接门（801卧室↔802化妆间）在此案中至关重要——沈若兰通过此门逃离，方敬尧通过此门进入。门锁老旧——可用硬物挑开。</p>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Answers */}
      {tab === 'answers' && (
        <div className="space-y-4">
          <div className="paper-card p-5">
            <div className="section-title text-sm mb-3">真相答案键</div>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 border border-vermilion/10 rounded bg-vermilion/[0.02]">
                <div className="font-semibold text-vermilion mb-1">真凶</div>
                <div className="text-sepia">方敬尧（fang_jingyao）</div>
              </div>
              <div className="p-3 border border-vermilion/10 rounded bg-vermilion/[0.02]">
                <div className="font-semibold text-vermilion mb-1">致死原因</div>
                <div className="text-sepia">氰化物中毒（头伤为辅）</div>
              </div>
              <div className="p-3 border border-burgundy/10 rounded bg-burgundy/[0.02]">
                <div className="font-semibold text-burgundy mb-1">密室制造者</div>
                <div className="text-sepia">方敬尧（细线拉闩法）</div>
              </div>
              <div className="p-3 border border-burgundy/10 rounded bg-burgundy/[0.02]">
                <div className="font-semibold text-burgundy mb-1">头击造成者</div>
                <div className="text-sepia">沈若兰（推搡碰撞——非致命）</div>
              </div>
              <div className="p-3 border border-brass/10 rounded bg-brass/[0.02]">
                <div className="font-semibold text-brass mb-1">毒药来源</div>
                <div className="text-sepia">赵启明从医学院偷窃——方敬尧盗用</div>
              </div>
              <div className="p-3 border border-brass/10 rounded bg-brass/[0.02]">
                <div className="font-semibold text-brass mb-1">毒发延迟原因</div>
                <div className="text-sepia">血管扩张剂干扰氰化物吸收</div>
              </div>
            </div>
          </div>

          <div className="paper-card p-5">
            <div className="section-title text-sm mb-3">人物秘密关系图</div>
            <div className="space-y-2 text-xs text-sepia leading-relaxed">
              <div className="p-2 border border-sepia-light/10 rounded">
                <b>方敬尧 ↔ 马维仁：</b>生父子——马维仁与沈婉贞35年前的私生子。
              </div>
              <div className="p-2 border border-sepia-light/10 rounded">
                <b>方敬尧 ↔ 沈若兰：</b>表兄妹——两人的母亲（沈婉贞、沈蕙兰）是亲姐妹。
              </div>
              <div className="p-2 border border-sepia-light/10 rounded">
                <b>沈若兰 ↔ 赵启明：</b>表姐弟——在苏州育婴堂一起长大。
              </div>
              <div className="p-2 border border-sepia-light/10 rounded">
                <b>方仲远 ↔ 唐文轩：</b>鸦片走私共犯——华懋饭店地下室藏有鸦片膏。
              </div>
              <div className="p-2 border border-sepia-light/10 rounded">
                <b>柳如烟 → 方仲远：</b>政府调查员——以"情人"身份监视方仲远走私活动十五年。
              </div>
              <div className="p-2 border border-sepia-light/10 rounded">
                <b>方仲远 → 沈家：</b>设局骗取沈鹤年产业——导致沈家破产、沈蕙兰被送入育婴堂。
              </div>
            </div>
          </div>

          <div className="paper-card p-5">
            <div className="section-title text-sm mb-3">诡叙手法参考</div>
            <div className="space-y-2 text-xs text-sepia">
              {[
                { char: '方敬尧', tech: '虚假记忆', desc: '深信母亲被父亲"换药谋杀"——实为自我编造的虚构叙事以为弑父提供"正义"理由。' },
                { char: '沈若兰', tech: '日记倒序', desc: '内心独白按逆时间顺序书写——最先读到的是最晚发生的事。越往后读越接近真相。' },
                { char: '唐文轩', tech: '三人称转换', desc: '前两幕用第三人称叙述自己（"唐文轩看到..."）——第三幕转为第一人称，标志他开始面对真相。' },
                { char: '柳如烟', tech: '江水/月光——PTSD场景混淆', desc: '五年前码头爆炸致脑损伤——记忆将两个真实场景错误折叠。江水=五年前着火的码头。月光=今晚的华懋饭店。两者都是真实记忆，只是发生在不同时间。读者需自行分辨时间线。' },
                { char: '马维仁', tech: '时间感知障碍', desc: '所有时间陈述比实际晚15-20分钟——非故意说谎，而是颞叶癫痫导致的病理性偏差。' },
                { char: '赵启明', tech: '第二人称自白', desc: '全剧本用"你"来写——是一份在审讯压力下写出的自白书，充满自我谴责的语调。' },
              ].map(item => (
                <div key={item.char} className="p-2 border border-sepia-light/10 rounded">
                  <b>{item.char}：</b><span className="text-burgundy">{item.tech}</span>——{item.desc}
                </div>
              ))}
            </div>
          </div>

          <div className="paper-card p-5">
            <div className="section-title text-sm mb-3">隐藏幕触发指南</div>
            <div className="space-y-3 text-xs text-sepia leading-relaxed">
              <div className="p-3 border border-vermilion/20 rounded bg-vermilion/[0.02]">
                <div className="font-semibold text-vermilion mb-1">🔓 沈若兰 · 隐藏幕 — 「沈家女儿」</div>
                <p><b>触发线索：</b>【床垫下的旧照片】（<code>cl_photo</code>）— 位于 <b>801卧室</b></p>
                <p><b>触发方式：</b>沈若兰在调查阶段搜到 <b>床垫下的旧照片</b> 后，隐藏幕自动解锁。</p>
                <p className="mt-1"><b>隐藏幕内容：</b>揭示完整家族秘密——沈婉贞是沈蕙兰的亲姐姐（沈若兰的姨妈），方敬尧是沈若兰的表哥，马维仁是方敬尧的生父。"林先生"=方敬尧=沈若兰孩子的父亲。沈若兰必须决定是否告诉方敬尧真相。</p>
                <p className="mt-1 text-vermilion"><b>⚠️ 主持人注意：</b>此线索位于801卧室（<code>loc_bedroom</code>），为私有线索。若沈若兰未搜到此线索，她将无法获知自己的完整身世——这将严重影响她的终局体验。建议在调查阶段提醒沈若兰优先搜索801卧室。</p>
              </div>
              <div className="p-3 border border-burgundy/10 rounded bg-burgundy/[0.02]">
                <div className="font-semibold text-burgundy mb-1">🔓 其他隐藏线索解锁</div>
                <p>· <b>注射器的真正主人</b>（<code>hc_syringe</code>）：搜到 801卧室「床垫下的玻璃注射器」解锁</p>
                <p>· <b>医疗箱·林先生</b>（<code>hc_medkit</code>）：搜到 配餐间「储物柜内的旧医疗箱」解锁</p>
                <p>· <b>香水瓶底的合影</b>（<code>cl_perfume</code>）：802化妆间私有，解锁 <code>hc_cousin</code></p>
                <p>· <b>消火栓后的钥匙</b>（<code>cl_skeleton_key</code>）：8楼走廊私有，解锁 <code>hc_key</code></p>
              </div>
            </div>
          </div>

          <div className="paper-card p-5">
            <div className="section-title text-sm mb-3">全线索卡一览（含完整描述）</div>
            {INVESTIGATION_LOCATIONS.map(loc => (
              <div key={loc.id} className="mb-4">
                <div className="mb-2 overflow-hidden rounded-lg border border-sepia-light/10">
                  <ZoomableImage src={LOCATION_IMAGES[loc.id].url} alt={LOCATION_IMAGES[loc.id].alt} className="h-32 w-full object-cover" />
                </div>
                <div className="text-sm font-title font-bold text-ink mb-1">{loc.icon} {loc.name}</div>
                <p className="text-[10px] text-sepia-light/60 mb-2">{loc.description}</p>
                {loc.clues.map(clue => (
                  <div key={clue.id} className="text-xs ml-4 mb-2 p-2 border border-sepia-light/8 rounded bg-cream/30">
                    <div className="font-semibold text-ink mb-0.5">
                      {clue.name}
                      <span className={`text-[9px] ml-1.5 px-1 py-0.5 rounded-full ${clue.isPublic ? 'bg-jade/10 text-jade' : 'bg-vermilion/10 text-vermilion'}`}>
                        {clue.isPublic ? '📢公开' : '🔒私有'}
                      </span>
                      {clue.unlocksAct && <span className="text-[9px] bg-vermilion/10 text-vermilion ml-1 px-1 py-0.5 rounded-full">→ 解锁隐藏幕</span>}
                      {clue.unlocksClue && <span className="text-[9px] bg-brass/10 text-brass ml-1 px-1 py-0.5 rounded-full">→ 解锁隐藏线索</span>}
                    </div>
                    <p className="text-sepia-light leading-relaxed">{clue.description}</p>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
