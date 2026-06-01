import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { InvestigationLocation, DiscoverableClue, ClueItem } from '../types';
import { LOCATION_IMAGES } from '../data/visual-assets';

interface Props {
  characterId: string;
  locations: InvestigationLocation[];
  rounds: number;
  onSearchClue: (clueId: string) => DiscoverableClue | null;
  onFinish: () => void;
  onSetTurnOrder?: (order: number, totalPrivateClues: number) => void;
}

export function InvestigationPanel({ characterId, locations, rounds, onSearchClue, onFinish, onSetTurnOrder }: Props) {
  const [turnOrder, setTurnOrder] = useState<number>(0);
  const [grayedIds, setGrayedIds] = useState<Set<string>>(new Set());
  const [searching, setSearching] = useState(false);
  const [foundClue, setFoundClue] = useState<DiscoverableClue | null>(null);
  const [justUnlocked, setJustUnlocked] = useState<string | null>(null);
  const [confirmGrayId, setConfirmGrayId] = useState<string | null>(null);

  // Build flat clue item list from locations — only private clues are searchable
  const allClues: ClueItem[] = useMemo(() => {
    const items: ClueItem[] = [];
    for (const loc of locations) {
      for (const c of loc.clues) {
        if (c.isPublic) continue; // 公开线索不加入搜索列表 — 调查结束后自动发放
        items.push({
          id: c.id,
          name: c.name,
          locationName: loc.name,
          locationIcon: loc.icon,
          isPublic: c.isPublic,
          takenByPrevious: false,
          found: c.found,
          foundBy: c.foundBy,
        });
      }
    }
    return items;
  }, [locations]);

  const availableClues = allClues.filter(c => !grayedIds.has(c.id) && !c.found);
  const foundByMe = allClues.filter(c => c.found && c.foundBy === characterId);

  const handleSelectOrder = (n: number) => {
    setTurnOrder(n);
    onSetTurnOrder?.(n, allClues.length);
  };

  const handleGrayClue = (clueId: string) => {
    setConfirmGrayId(clueId);
  };

  const confirmGray = () => {
    if (confirmGrayId) {
      setGrayedIds(prev => new Set(prev).add(confirmGrayId));
      setConfirmGrayId(null);
    }
  };

  const cancelGray = () => {
    setConfirmGrayId(null);
  };

  const handleSearchClue = (clueId: string) => {
    if (rounds <= 0 || grayedIds.has(clueId)) return;
    setSearching(true);
    setFoundClue(null);
    setJustUnlocked(null);

    setTimeout(() => {
      const clue = onSearchClue(clueId);
      setFoundClue(clue);
      setSearching(false);
      if (clue?.unlocksAct || clue?.unlocksClue) {
        setJustUnlocked(clue.unlockMessage || '线索解锁了新内容！');
      }
    }, 1200);
  };

  // Phase 1: Select entry order
  if (turnOrder === 0) {
    return (
      <motion.div
        className="paper-card p-6 space-y-5 text-center"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div>
          <div className="text-3xl mb-3">🔍</div>
          <div className="section-title justify-center text-base">调查阶段 — 进场顺序</div>
          <p className="text-xs text-sepia-light font-body mt-1 max-w-sm mx-auto leading-relaxed">
            在正式调查之前，请确认你的进场顺序。<br />
            主持人会告知你——在你之前进场的人拿走了哪些线索。<br />
            你需要手动将这些已被拿走的线索<b>灰度</b>——灰度后的线索你不可搜索。
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3 max-w-sm mx-auto">
          {[1, 2, 3, 4, 5, 6].map(n => (
            <button
              key={n}
              onClick={() => handleSelectOrder(n)}
              className="px-4 py-3 border-2 border-sepia-light/20 rounded-lg
                bg-cream/60 hover:border-burgundy/40 hover:bg-burgundy/[0.04]
                transition-all duration-200"
            >
              <div className="text-xl font-game font-black text-ink">第 {n} 个</div>
              <div className="text-[10px] text-sepia-light/60 font-ui mt-0.5">进场</div>
            </button>
          ))}
        </div>
      </motion.div>
    );
  }

  // Phase 2: Investigation
  return (
    <div className="space-y-4">
      {/* Header bar */}
      <div className="paper-card p-4 flex items-center justify-between">
        <div>
          <span className="text-sm font-title font-bold text-ink">🔍 调查阶段</span>
          <span className="text-[10px] text-sepia-light ml-2 font-ui">
            你是第 <b className="text-burgundy">{turnOrder}</b> 个进场 · 剩余 <b className="text-burgundy">{rounds}</b> 次搜索
          </span>
        </div>
        <button
          onClick={() => setTurnOrder(0)}
          className="text-[10px] text-sepia-light/40 hover:text-sepia underline underline-offset-2"
        >
          重新选择顺序
        </button>
      </div>

      {/* Gray confirmation modal */}
      <AnimatePresence>
        {confirmGrayId && (
          <motion.div
            className="paper-card p-5 border-vermilion/30 bg-vermilion/[0.03] text-center space-y-3"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <div className="text-lg">⚠️</div>
            <p className="text-sm text-ink font-body">
              确认将线索 <b className="text-vermilion">「{allClues.find(c => c.id === confirmGrayId)?.name}」</b> 标记为<b>已被前面的人拿走</b>？
            </p>
            <p className="text-[10px] text-sepia-light">灰度后将无法搜索此线索。</p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={confirmGray}
                className="px-5 py-1.5 bg-vermilion text-cream text-xs font-ui tracking-wider
                  hover:bg-vermilion/80 transition-colors"
              >
                确认灰度
              </button>
              <button
                onClick={cancelGray}
                className="px-5 py-1.5 border border-sepia-light/20 text-sepia-light text-xs font-ui
                  hover:border-sepia-light/40 transition-colors"
              >
                取消
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Left: Location cards — 不展示房间内物品 */}
        <div className="md:col-span-1 space-y-3">
          <div className="text-[10px] font-ui text-sepia-light tracking-wider mb-1">📍 调查地点</div>
          {locations.map(loc => (
            <div
              key={loc.id}
              className="overflow-hidden border border-sepia-light/10 rounded bg-cream/40"
            >
              <div className="h-24 overflow-hidden bg-sepia-light/10">
                <img
                  src={LOCATION_IMAGES[loc.id].url}
                  alt={LOCATION_IMAGES[loc.id].alt}
                  className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                />
              </div>
              <div className="p-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">{loc.icon}</span>
                  <span className="text-xs font-title font-bold text-ink">{loc.name}</span>
                </div>
                <p className="text-[9px] text-sepia-light/70 leading-relaxed line-clamp-2">{loc.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Right: Clue item list */}
        <div className="md:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-ui text-sepia-light tracking-wider">📋 线索物品清单</span>
            <span className="text-[8px] text-sepia-light/50 font-ui">
              点击线索灰度（已被拿走）· 非灰度线索可搜索
            </span>
          </div>

          <div className="space-y-1.5 max-h-[420px] overflow-y-auto pr-1">
            {allClues.map(clue => {
              const isGrayed = grayedIds.has(clue.id);
              const isFound = clue.found;
              const isDisabled = isGrayed || isFound || rounds <= 0 || searching;

              return (
                <div
                  key={clue.id}
                  className={`flex items-center gap-3 p-2.5 rounded border transition-all duration-200 ${
                    isFound
                      ? 'border-jade/10 bg-jade/[0.03]'
                      : isGrayed
                      ? 'border-sepia-light/5 bg-cream/20 opacity-35'
                      : 'border-sepia-light/10 bg-cream/60 hover:border-burgundy/20 hover:bg-burgundy/[0.02]'
                  }`}
                >
                  {/* Status indicator */}
                  <div className="flex-shrink-0">
                    {isFound ? (
                      <span className="text-jade text-sm">✓</span>
                    ) : isGrayed ? (
                      <span className="text-sepia-light/25 text-sm">✕</span>
                    ) : (
                      <span className="text-sepia-light/30 text-sm">○</span>
                    )}
                  </div>

                  {/* Clue info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-semibold truncate ${
                        isGrayed ? 'text-sepia-light/40' : isFound ? 'text-jade' : 'text-ink'
                      }`}>
                        {clue.name}
                      </span>
                      <span className={`text-[8px] font-ui flex-shrink-0 ${
                        clue.isPublic ? 'text-jade/60' : 'text-vermilion/60'
                      }`}>
                        {clue.isPublic ? '公开' : '私有'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-[8px] text-sepia-light/50 font-ui">
                      <span>{clue.locationIcon}</span>
                      <span>{clue.locationName}</span>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {isFound ? (
                      <span className="text-[9px] text-jade font-ui">已发现</span>
                    ) : isGrayed ? (
                      <span className="text-[9px] text-sepia-light/30 font-ui">已拿走</span>
                    ) : (
                      <>
                        <button
                          onClick={() => handleGrayClue(clue.id)}
                          disabled={isDisabled}
                          className="text-[9px] px-2 py-0.5 border border-sepia-light/15 rounded
                            text-sepia-light/50 hover:text-sepia hover:border-sepia-light/30
                            disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                          title="灰度：已被前面的人拿走"
                        >
                          灰度
                        </button>
                        <button
                          onClick={() => handleSearchClue(clue.id)}
                          disabled={isDisabled}
                          className="text-[9px] px-2 py-0.5 bg-burgundy/10 border border-burgundy/20 rounded
                            text-burgundy hover:bg-burgundy/20
                            disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                          title="搜索此线索"
                        >
                          搜索
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Found items summary */}
          {foundByMe.length > 0 && (
            <div className="pt-2 border-t border-sepia-light/8">
              <div className="text-[9px] font-ui text-jade mb-1">我发现的线索（{foundByMe.length} 条）：</div>
              <div className="flex flex-wrap gap-1">
                {foundByMe.map(c => (
                  <span key={c.id} className="text-[9px] px-1.5 py-0.5 bg-jade/[0.06] border border-jade/10 rounded text-jade">
                    {c.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Search animation & result */}
      <AnimatePresence>
        {searching && (
          <motion.div
            className="paper-card p-6 text-center"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="text-3xl animate-bounce mb-2">🔎</div>
            <p className="text-sm text-sepia-light font-body">正在搜索线索...</p>
          </motion.div>
        )}

        {foundClue && !searching && (
          <motion.div
            className="paper-card p-5 border-brass/30 bg-brass/[0.02]"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="text-xs font-ui text-brass tracking-wider mb-2">发现线索！</div>
            <div className="text-sm font-title font-bold text-ink mb-2">{foundClue.name}</div>
            <p className="text-sm text-sepia leading-relaxed whitespace-pre-line">{foundClue.description}</p>
            <div className="mt-3 pt-2 border-t border-brass/10">
              <span className={`text-[10px] font-ui ${foundClue.isPublic ? 'text-jade' : 'text-vermilion'}`}>
                {foundClue.isPublic ? '📢 公开线索——请向全桌展示' : '🔒 私有线索——仅你可见'}
              </span>
            </div>
          </motion.div>
        )}

        {justUnlocked && (
          <motion.div
            className="paper-card p-4 border-vermilion/30 bg-vermilion/[0.03] text-center"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="text-lg mb-1">🔓</div>
            <p className="text-sm text-vermilion font-body font-semibold">{justUnlocked}</p>
            <p className="text-[10px] text-sepia-light mt-1">返回剧本可查看新解锁的内容</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Finish button */}
      {rounds <= 0 && !searching && (
        <motion.div
          className="paper-card p-5 text-center space-y-3 border-jade/20 bg-jade/[0.02]"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <p className="text-sm text-sepia font-body">
            你已用完调查次数。请与其他玩家分享你发现的公开线索——私有线索<b>可以</b>选择保守秘密。
          </p>
          <button
            onClick={onFinish}
            className="px-6 py-2 bg-burgundy text-cream text-xs font-ui tracking-wider
              hover:bg-burgundy-light transition-colors"
          >
            结束调查，继续讨论
          </button>
        </motion.div>
      )}
    </div>
  );
}
