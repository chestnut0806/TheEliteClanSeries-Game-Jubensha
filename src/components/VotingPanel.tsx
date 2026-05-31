import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import type { VotingOption } from '../types';

interface Props {
  options: VotingOption[];
  currentCharacterId: string;
  onVoteComplete?: () => void;
  votedFor?: string | null;
  onVote?: (targetId: string) => void;
}

const STORAGE_KEY = 'mystery-mansion-3-votes';

function loadVotes(): Record<string, string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

function saveVote(voterId: string, targetId: string) {
  const votes = loadVotes();
  votes[voterId] = targetId;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(votes));
}

export function VotingPanel({ options, currentCharacterId, onVoteComplete, onVote }: Props) {
  const [selected, setSelected] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => {
    const votes = loadVotes();
    if (votes[currentCharacterId]) {
      setSelected(votes[currentCharacterId]);
      setConfirmed(true);
    }
  }, [currentCharacterId]);

  const handleVote = (targetId: string) => {
    if (confirmed) return;
    setSelected(targetId);
  };

  const handleConfirm = () => {
    if (!selected || confirmed) return;
    saveVote(currentCharacterId, selected);
    setConfirmed(true);
    onVote?.(selected);
  };

  const targetOption = confirmed ? options.find(o => o.characterId === selected) : null;

  return (
    <div className="paper-card p-6 space-y-5">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xl">🗳️</span>
          <span className="text-base font-title font-bold text-ink">终局投票</span>
        </div>
        <p className="text-xs text-sepia-light font-body">
          {confirmed ? '你的投票已锁定。' : '根据所有讨论和调查——你认为谁是毒杀方仲远的真凶？'}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {options.map((opt, i) => {
          const isMe = opt.characterId === currentCharacterId;
          const isSelected = selected === opt.characterId;

          return (
            <motion.button
              key={opt.characterId}
              onClick={() => handleVote(opt.characterId)}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              disabled={confirmed}
              className={`text-left p-3 border transition-all duration-200 ${
                confirmed && isSelected
                  ? 'border-vermilion bg-vermilion/5 ring-1 ring-vermilion/30'
                  : isSelected
                  ? 'border-burgundy bg-burgundy/[0.04] ring-1 ring-burgundy/20'
                  : 'border-sepia-light/10 hover:border-burgundy/30'
              } ${confirmed && !isSelected ? 'opacity-40' : ''}`}
            >
              <div className="text-sm font-title font-bold text-ink">{opt.name}</div>
              <div className="text-[10px] text-sepia-light font-ui mt-0.5">
                {opt.title}{isMe ? '（你）' : ''}
              </div>
              {confirmed && isSelected && (
                <div className="text-[10px] text-vermilion font-ui mt-1">✓ 已投票</div>
              )}
            </motion.button>
          );
        })}
      </div>

      {confirmed && targetOption && (
        <motion.div
          className="p-4 bg-burgundy/[0.03] border border-burgundy/20 rounded"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="text-xs text-sepia font-body">
            你已投票给 <b className="text-burgundy">{targetOption.name}</b>（{targetOption.title}）。
          </div>
        </motion.div>
      )}

      <div className="flex items-center gap-3">
        {!confirmed ? (
          <button
            onClick={handleConfirm}
            disabled={!selected}
            className="px-6 py-2 bg-burgundy text-cream text-xs font-ui tracking-wider
              hover:bg-burgundy-light transition-colors duration-200
              disabled:opacity-30 disabled:cursor-not-allowed"
          >
            确认投票
          </button>
        ) : (
          <div className="flex items-center gap-3">
            <p className="text-xs text-jade font-ui">✓ 投票已记录</p>
            {onVoteComplete && (
              <button
                onClick={onVoteComplete}
                className="px-5 py-1.5 border border-burgundy/30 text-burgundy text-xs font-ui tracking-wider
                  hover:bg-burgundy/[0.04] transition-colors"
              >
                进入终局问答 →
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
