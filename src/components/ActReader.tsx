import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { CharacterAct, PrivateClue } from '../types';

interface Props {
  act: CharacterAct;
  characterName: string;
  isCurrent: boolean;
  isCompleted: boolean;
  onReadComplete: () => void;
  unlockedClues?: PrivateClue[];
}

export function ActReader({ act, characterName, isCurrent, isCompleted, onReadComplete, unlockedClues = [] }: Props) {
  const [revealed, setRevealed] = useState(isCompleted);
  const [showContent, setShowContent] = useState(isCompleted);

  useEffect(() => {
    if (isCompleted) {
      setRevealed(true);
      setShowContent(true);
    }
  }, [isCompleted]);

  const handleReveal = () => {
    setRevealed(true);
    setTimeout(() => setShowContent(true), 400);
  };

  return (
    <div className={`act-card ${isCompleted ? 'completed' : isCurrent ? 'current border-l-burgundy shadow-lg' : ''}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <span className={`text-lg font-game font-bold ${
            isCompleted ? 'text-jade' : isCurrent ? 'text-burgundy' : 'text-sepia'
          }`}>
            {act.title}
          </span>
          {isCompleted && <span className="text-[10px] text-jade font-ui">✓ 已读</span>}
          {isCurrent && !isCompleted && <span className="text-[10px] text-burgundy font-ui animate-pulse">新</span>}
        </div>
      </div>

      {/* Reveal button */}
      {!revealed && (
        <motion.button
          onClick={handleReveal}
          className="w-full py-4 border-2 border-dashed border-burgundy/20 text-burgundy/60
            font-title text-sm tracking-wider hover:border-burgundy/40 hover:text-burgundy
            transition-all duration-300 rounded"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          👁️ 点击阅读 {act.title}
        </motion.button>
      )}

      {/* Content */}
      <AnimatePresence>
        {revealed && showContent && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          >
            <div className="typing-text text-sm mt-3 leading-loose">
              {act.content}
            </div>

            {/* Regular clues */}
            {act.newClues.length > 0 && (
              <div className="mt-4 pt-3 border-t border-dashed border-brass/20">
                <div className="text-[10px] font-ui text-brass tracking-wider mb-2">🔍 本幕新线索</div>
                <div className="space-y-2">
                  {act.newClues.map(clue => (
                    <div key={clue.id} className="script-block text-xs">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="tag-clue">{clue.name}</span>
                        <span className={`text-[9px] ${clue.canShare ? 'text-jade' : 'text-vermilion'}`}>
                          {clue.canShare ? '可分享' : '建议隐藏'}
                        </span>
                      </div>
                      <p className="text-sepia">{clue.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Unlocked bonus clues (from investigation) */}
            {unlockedClues.length > 0 && (
              <div className="mt-4 pt-3 border-t border-dashed border-vermilion/20">
                <div className="text-[10px] font-ui text-vermilion tracking-wider mb-2">🔓 隐藏线索（由调查解锁）</div>
                <div className="space-y-2">
                  {unlockedClues.map(clue => (
                    <motion.div
                      key={clue.id}
                      className="script-block text-xs border-vermilion/20 bg-vermilion/[0.02]"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-ui text-vermilion font-semibold">🔓 {clue.name}</span>
                        <span className={`text-[9px] ${clue.canShare ? 'text-jade' : 'text-vermilion'}`}>
                          {clue.canShare ? '可分享' : '建议隐藏'}
                        </span>
                      </div>
                      <p className="text-sepia">{clue.description}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* New objectives */}
            {act.newObjectives.length > 0 && (
              <div className="mt-3 pt-3 border-t border-dashed border-brass/20">
                <div className="text-[10px] font-ui text-brass tracking-wider mb-2">🎯 本幕新任务</div>
                <div className="space-y-1.5">
                  {act.newObjectives.map(obj => (
                    <div key={obj.id} className="flex items-start gap-2 text-xs">
                      <span className={`mt-0.5 w-2 h-2 rounded-full flex-shrink-0 ${
                        obj.priority === 'high' ? 'bg-vermilion' :
                        obj.priority === 'medium' ? 'bg-brass' : 'bg-sepia-light/30'
                      }`} />
                      <span className="text-sepia">{obj.description}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Done button */}
            {isCurrent && !isCompleted && (
              <motion.button
                onClick={onReadComplete}
                className="w-full mt-4 py-3 bg-burgundy/5 border border-burgundy/20 text-burgundy
                  font-title text-xs tracking-wider hover:bg-burgundy/10 transition-all duration-300 rounded"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                ✓ 我已读完本幕
              </motion.button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
