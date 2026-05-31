import { useState } from 'react';
import { motion } from 'framer-motion';
import { CASE_TITLE, CASE_SUBTITLE, CASE_BRIEF, PUBLIC_CASE_INFO, PUBLIC_CHARACTER_INFO, PUBLIC_TIMELINE } from '../data/character-scripts';

interface Props {
  onSelectCharacter: (charId: string) => void;
  onEnterHost: () => void;
}

const CHARACTER_CARDS = [
  { id: 'fang_jingyao', name: '方敬尧', title: '方家长子', age: 35, avatar: '🧑‍💼', tag: '长子', color: 'from-burgundy/10 to-burgundy/5' },
  { id: 'shen_ruolan', name: '沈若兰', title: '方仲远未婚妻', age: 28, avatar: '👩‍🦰', tag: '新娘', color: 'from-sepia/10 to-brass/5' },
  { id: 'tang_wenxuan', name: '唐文轩', title: '饭店主人', age: 55, avatar: '🧓', tag: '东道', color: 'from-jade/5 to-sepia/5' },
  { id: 'liu_ruyan', name: '柳如烟', title: '京剧名伶', age: 38, avatar: '👩‍🎤', tag: '旧爱', color: 'from-burgundy/5 to-cream' },
  { id: 'ma_weiren', name: '马维仁', title: '航业对手', age: 48, avatar: '👨‍💼', tag: '宿敌', color: 'from-brass/10 to-brass/5' },
  { id: 'zhao_qiming', name: '赵启明', title: '饭店领班', age: 30, avatar: '👨‍🍳', tag: '侍者', color: 'from-sepia/5 to-cream' },
];

export function CharacterSelect({ onSelectCharacter, onEnterHost }: Props) {
  const [showInfo, setShowInfo] = useState(false);
  const [selectedPreview, setSelectedPreview] = useState<string | null>(null);

  return (
    <div className="space-y-8">
      <motion.div
        className="text-center py-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="text-brass/40 text-xs tracking-[0.3em] font-ui mb-3">— 豪门惊情 · 分幕式剧本杀 —</div>
        <h1 className="text-4xl md:text-5xl font-title font-black text-ink tracking-[0.12em] mb-2">
          {CASE_TITLE}
        </h1>
        <p className="text-sepia-light text-sm font-ui tracking-wider">{CASE_SUBTITLE}</p>
        <p className="text-sepia-light/60 text-xs font-body mt-2 italic">{CASE_BRIEF}</p>
      </motion.div>

      <motion.div
        className="paper-card p-5 max-w-2xl mx-auto text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <div className="text-sm text-sepia font-body leading-relaxed">
          <p className="font-semibold mb-2">🎭 分幕式游戏规则</p>
          <ol className="text-xs text-sepia-light space-y-1 text-left max-w-lg mx-auto">
            <li>1. 选择角色，获取<b>第一幕</b>剧本</li>
            <li>2. 阅读后<b>口头讨论</b>——注意只能透露你愿意分享的信息</li>
            <li>3. 点击推进到<b>下一幕</b>——新剧情解锁</li>
            <li>4. <b>调查阶段</b>——搜索地点发现线索（公开/私有），可查看<b>案发现场图</b></li>
            <li>5. 四幕剧本逐层揭开——线索可解锁<b>隐藏幕</b>和<b>隐藏线索</b></li>
            <li>6. <b>终局问答</b>——每人5题（身份/关系/手法/物品/动机），每题20分，总分100</li>
          </ol>
          <p className="text-[10px] text-vermilion mt-2">⚠️ 真凶需回答他人秘密，其他人需回答作案手法。题数相同，总分相同。</p>
        </div>
      </motion.div>

      <motion.div
        className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-3xl mx-auto"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        {CHARACTER_CARDS.map((char, i) => (
          <motion.div
            key={char.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 + i * 0.08 }}
            whileHover={{ y: -4 }}
            className="relative"
          >
            <button
              onClick={() => onSelectCharacter(char.id)}
              onMouseEnter={() => setSelectedPreview(char.id)}
              onMouseLeave={() => setSelectedPreview(null)}
              className={`w-full text-left paper-card p-5 transition-all duration-300 cursor-pointer
                hover:border-burgundy/30 hover:shadow-lg
                ${selectedPreview === char.id ? 'ring-2 ring-burgundy/20' : ''}
              `}
            >
              <div className="flex flex-col items-center text-center gap-2">
                <span className="text-4xl">{char.avatar}</span>
                <div>
                  <div className="font-title font-bold text-ink text-base">{char.name}</div>
                  <div className="text-xs text-sepia-light font-ui">{char.title} · {char.age}岁</div>
                </div>
                <span className="text-[10px] font-ui px-2 py-0.5 rounded-full bg-burgundy/10 text-burgundy">
                  {char.tag}
                </span>
              </div>
            </button>
          </motion.div>
        ))}
      </motion.div>

      {selectedPreview && (
        <motion.div
          className="max-w-lg mx-auto paper-card p-4"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="text-xs font-ui text-sepia-light tracking-wider mb-1 uppercase">公开信息</div>
          <p className="text-xs text-sepia leading-relaxed">{PUBLIC_CHARACTER_INFO[selectedPreview]}</p>
        </motion.div>
      )}

      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => setShowInfo(!showInfo)}
          className="w-full text-center text-xs font-ui text-sepia-light/60 hover:text-sepia transition-colors py-2"
        >
          {showInfo ? '收起' : '查看'}案件公开信息与时间线 →
        </button>

        {showInfo && (
          <motion.div
            className="space-y-4 mt-3"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
          >
            <div className="paper-card p-5">
              <div className="section-title text-sm mb-3">案件公开信息</div>
              <div className="text-xs text-sepia leading-relaxed whitespace-pre-line font-body">{PUBLIC_CASE_INFO}</div>
            </div>
            <div className="paper-card p-5">
              <div className="section-title text-sm mb-3">公开时间线</div>
              <div className="text-xs text-sepia leading-relaxed whitespace-pre-line font-body">{PUBLIC_TIMELINE}</div>
            </div>
          </motion.div>
        )}
      </div>

      <div className="text-center pt-4 pb-8">
        <button
          onClick={onEnterHost}
          className="text-xs font-ui text-sepia-light/40 hover:text-sepia-light transition-colors underline underline-offset-4"
        >
          主持人模式（控制幕推进 + 全知视角）
        </button>
      </div>
    </div>
  );
}
