import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CHARACTER_SCRIPTS, INVESTIGATION_LOCATIONS } from '../data/character-scripts';
import { CASE_BACKGROUND_IMAGE, CHARACTER_IMAGES } from '../data/visual-assets';
import { ZoomableImage } from './ZoomableImage';
import { QuestionPanel } from './QuestionPanel';
import { ActReader } from './ActReader';
import { InvestigationPanel } from './InvestigationPanel';
import { ClueBoard } from './ClueBoard';
import { CrimeMap } from './CrimeMap';
import { VotingPanel } from './VotingPanel';
import type { CharacterAct, InvestigationLocation, DiscoverableClue, PrivateClue, QuestionAnswer } from '../types';

interface Props {
  characterId: string;
  lockPin: string;
}

export function CharacterView({ characterId, lockPin }: Props) {
  const [showLock, setShowLock] = useState(true);
  const script = CHARACTER_SCRIPTS[characterId];

  // Self-managed progression state
  const [currentAct, setCurrentAct] = useState(1);
  const [completedActs, setCompletedActs] = useState<Set<string>>(new Set());
  const [showDiscussion, setShowDiscussion] = useState(false);
  const [investigationOpen, setInvestigationOpen] = useState(false);
  const [investigationRounds, setInvestigationRounds] = useState(2);
  const [locations, setLocations] = useState<InvestigationLocation[]>(() =>
    INVESTIGATION_LOCATIONS.map(l => ({ ...l, clues: l.clues.map(c => ({ ...c, found: false })) }))
  );
  const [publicClues, setPublicClues] = useState<DiscoverableClue[]>([]);
  const [unlockedHiddenActs, setUnlockedHiddenActs] = useState<Set<string>>(new Set());
  const [unlockedHiddenClues, setUnlockedHiddenClues] = useState<PrivateClue[]>([]);
  const [showMap, setShowMap] = useState(false);
  const [showVoting, setShowVoting] = useState(false);
  const [votedFor, setVotedFor] = useState<string | null>(null);
  const [showQuestions, setShowQuestions] = useState(false);
  const [questionAnswers, setQuestionAnswers] = useState<QuestionAnswer[] | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [showActsAfterReveal, setShowActsAfterReveal] = useState(false);

  if (!script) return null;

  // Get ALL available acts (main + hidden unlocked)
  const allVisibleActs = [...script.acts];
  if (script.hiddenActs) {
    for (const ha of script.hiddenActs) {
      if (unlockedHiddenActs.has(ha.actId)) {
        allVisibleActs.push(ha);
      }
    }
  }
  allVisibleActs.sort((a, b) => a.actNumber - b.actNumber);

  const handleActReadComplete = useCallback((act: CharacterAct) => {
    setCompletedActs(prev => new Set(prev).add(act.actId));

    if (act.investigationTrigger) {
      setInvestigationOpen(true);
      setInvestigationRounds(1);
    } else {
      setShowDiscussion(true);
    }
  }, []);

  const handleContinueFromDiscussion = useCallback(() => {
    setShowDiscussion(false);
    const nextActNum = currentAct + 1;
    const nextVisible = allVisibleActs.find(a => a.actNumber === nextActNum);
    if (nextVisible || (script.hiddenActs && unlockedHiddenActs.size > 0)) {
      setCurrentAct(nextActNum);
    } else if (currentAct >= 4) {
      setShowQuestions(true);
    } else {
      setCurrentAct(nextActNum);
    }
  }, [currentAct, allVisibleActs, script.hiddenActs, unlockedHiddenActs]);

  const handleSearchClue = useCallback((clueId: string): DiscoverableClue | null => {
    if (investigationRounds <= 0) return null;
    const loc = locations.find(l => l.clues.some(c => c.id === clueId));
    if (!loc) return null;
    const clue = loc.clues.find(c => c.id === clueId);
    if (!clue || clue.found) return null;

    setLocations(prev => prev.map(l => {
      if (l.id !== loc.id) return l;
      return { ...l, clues: l.clues.map(c => c.id === clue.id ? { ...c, found: true, foundBy: characterId } : c) };
    }));

    if (clue.isPublic) {
      setPublicClues(prev => [...prev, { ...clue, found: true, foundBy: characterId }]);
    }

    if (clue.unlocksAct) {
      setUnlockedHiddenActs(prev => new Set(prev).add(clue.unlocksAct!));
    }
    if (clue.unlocksClue && script.hiddenClues) {
      const hc = script.hiddenClues.find(c => c.id === clue.unlocksClue);
      if (hc && !unlockedHiddenClues.find(c => c.id === hc.id)) {
        setUnlockedHiddenClues(prev => [...prev, hc]);
      }
    }

    setInvestigationRounds(prev => prev - 1);
    return clue;
  }, [investigationRounds, locations, characterId, script.hiddenClues, unlockedHiddenClues]);

  const handleFinishInvestigation = useCallback(() => {
    setLocations(prev => {
      const autoRevealed: DiscoverableClue[] = [];
      const updated = prev.map(loc => ({
        ...loc,
        clues: loc.clues.map(c => {
          if (c.isPublic && !c.found) {
            autoRevealed.push({ ...c, found: true, foundBy: 'host' });
            return { ...c, found: true, foundBy: 'host' };
          }
          return c;
        }),
      }));
      if (autoRevealed.length > 0) {
        setPublicClues(p => [...p, ...autoRevealed]);
      }
      return updated;
    });
    setInvestigationOpen(false);
    setShowMap(false);
    setShowDiscussion(true);
  }, []);

  const handleQuestionsComplete = useCallback((answers: QuestionAnswer[]) => {
    setQuestionAnswers(answers);
    setShowQuestions(false);
    setRevealed(true);
  }, []);

  return (
    <div className="space-y-6">
      {/* Lock overlay */}
      <AnimatePresence>
        {showLock && (
          <motion.div
            className="fixed inset-0 z-50 bg-cream/98 flex flex-col items-center justify-center gap-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="h-40 w-32 overflow-hidden rounded-xl border border-sepia-light/20 shadow-xl">
              <ZoomableImage
                src={CHARACTER_IMAGES[characterId].url}
                alt={CHARACTER_IMAGES[characterId].alt}
                className="h-full w-full object-cover object-top"
              />
            </div>
            <h2 className="text-2xl font-title font-bold text-ink">{script.name}</h2>
            <p className="text-sepia-light text-sm font-body">你的角色锁定码</p>
            <div className="text-5xl font-game font-black text-burgundy tracking-[0.3em] select-all">
              {lockPin}
            </div>
            <p className="text-xs text-sepia-light/60 font-body text-center max-w-xs">
              请将屏幕交给扮演 <b>{script.name}</b> 的玩家。<br />
              其他人请回避——这是你的私有剧本。
            </p>
            <button
              onClick={() => setShowLock(false)}
              className="px-8 py-3 bg-burgundy text-cream font-title text-sm tracking-wider
                hover:bg-burgundy-light transition-colors duration-300"
            >
              我已就位，开始阅读
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="paper-card p-6">
        <div className="flex items-center gap-5">
          <div className="h-24 w-20 flex-shrink-0 overflow-hidden rounded-lg border border-sepia-light/15 bg-sepia-light/10">
            <ZoomableImage
              src={CHARACTER_IMAGES[characterId].url}
              alt={CHARACTER_IMAGES[characterId].alt}
              className="h-full w-full object-cover object-top"
            />
          </div>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-title font-bold text-ink">{script.name}</h1>
              <span className="tag-public">嫌疑人</span>
            </div>
            <p className="text-sm text-sepia-light">{script.title} · {script.age}岁</p>
            <p className="text-xs text-sepia-light/60 mt-1 font-body italic">{script.publicRole}</p>
          </div>
        </div>
        <div className="mt-4 pt-3 border-t border-sepia-light/10 flex items-center gap-2 text-[10px] text-sepia-light/40 font-ui">
          <span>🔒</span> 锁定码：{lockPin}（其他玩家请勿偷看）
        </div>
      </div>

      {/* Act progress dots */}
      <div className="flex items-center gap-2 px-2">
        {[1, 2, 3, 4].map(act => (
          <div key={act} className="flex items-center gap-2 flex-1">
            <div className={`w-3 h-3 rounded-full border-2 transition-all duration-300 ${
              completedActs.has(script.acts.find(a => a.actNumber === act)?.actId ?? '')
                ? 'bg-jade border-jade'
                : act === currentAct
                ? 'bg-burgundy border-burgundy ring-2 ring-burgundy/20'
                : 'bg-transparent border-sepia-light/20'
            }`} />
            {act < 4 && <div className={`flex-1 h-0.5 ${
              completedActs.has(script.acts.find(a => a.actNumber === act)?.actId ?? '')
                ? 'bg-jade/30' : 'bg-sepia-light/10'
            }`} />}
          </div>
        ))}
        {showQuestions && (
          <span className="text-[10px] font-ui text-burgundy animate-pulse ml-1">终局问答</span>
        )}
      </div>

      {/* Crime Map button */}
      {(investigationOpen || showDiscussion) && (
        <div className="flex justify-end">
          <button
            onClick={() => setShowMap(!showMap)}
            className="text-xs font-ui text-sepia-light hover:text-burgundy transition-colors underline underline-offset-2"
          >
            {showMap ? '收起案发现场图' : '🗺️ 查看案发现场图（密室分析）'}
          </button>
        </div>
      )}

      {/* Crime Map */}
      <AnimatePresence>
        {showMap && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <CrimeMap />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Investigation panel */}
      {investigationOpen && (
        <InvestigationPanel
          characterId={characterId}
          locations={locations}
          rounds={investigationRounds}
          onSearchClue={handleSearchClue}
          onFinish={handleFinishInvestigation}
          onSetTurnOrder={(order, totalPrivate) => {
            setInvestigationRounds(order === 1 ? 2 : 1);
          }}
        />
      )}

      {/* Clue board (public) — visible during investigation & discussion */}
      {publicClues.length > 0 && (
        <ClueBoard clues={publicClues} />
      )}

      {/* Discussion prompt */}
      <AnimatePresence>
        {showDiscussion && !investigationOpen && !showQuestions && !showVoting && !revealed && (
          <motion.div
            className="paper-card p-6 text-center space-y-4 border-burgundy/20 bg-burgundy/[0.02]"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
          >
            <div className="text-2xl">💬</div>
            <div className="text-sm text-sepia font-body leading-relaxed">
              {currentAct < 4 ? (
                <>
                  <p className="font-semibold text-ink mb-2">讨论阶段</p>
                  <p>你已完成本幕阅读{investigationOpen ? '和调查' : ''}。请与其他玩家讨论你愿意分享的信息——记住，<b>你可以撒谎、隐瞒、套话</b>。</p>
                  <p className="text-xs text-sepia-light/60 mt-2">讨论完毕后，点击下方按钮继续。</p>
                </>
              ) : (
                <>
                  <p className="font-semibold text-ink mb-2">最终讨论</p>
                  <p>所有幕次已读完。请进行最后一轮讨论——然后进入<b>终局投票</b>，投出你心中的真凶。</p>
                  <p className="text-xs text-sepia-light/60 mt-1">投票后进入终局问答——每个人的问题不同，考验你对案件的理解。</p>
                </>
              )}
            </div>
            <button
              onClick={currentAct >= 4 ? () => setShowVoting(true) : handleContinueFromDiscussion}
              className="px-6 py-2 bg-burgundy text-cream text-xs font-ui tracking-wider
                hover:bg-burgundy-light transition-colors"
            >
              {currentAct >= 4 ? '进入终局投票' : '我已讨论完毕，继续阅读'}
            </button>

            {/* Toggle to review past acts during discussion */}
            <button
              onClick={() => setShowActsAfterReveal(!showActsAfterReveal)}
              className="block w-full text-xs font-ui text-sepia-light hover:text-burgundy transition-colors underline underline-offset-2 mt-3"
            >
              {showActsAfterReveal ? '收起剧本' : '📜 回顾已读剧本（讨论时可翻阅）'}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Past acts viewable during discussion */}
      {showDiscussion && showActsAfterReveal && (
        <div className="space-y-4 mt-4 pt-4 border-t border-sepia-light/10">
          <div className="section-title text-base">📜 你的剧本（回顾）</div>
          {allVisibleActs.map(act => {
            const isCompleted = completedActs.has(act.actId);
            if (!isCompleted) return null;
            return (
              <ActReader
                key={act.actId}
                act={act}
                characterName={script.name}
                isCurrent={false}
                isCompleted={true}
                onReadComplete={() => {}}
                unlockedClues={unlockedHiddenClues.filter(c => c.actRevealed === act.actNumber)}
              />
            );
          })}
        </div>
      )}

      {/* Act reading */}
      {!investigationOpen && !showDiscussion && !showQuestions && !showVoting && !revealed && (
        <div className="space-y-4">
          <div className="relative h-44 overflow-hidden rounded-xl border border-sepia-light/15">
            <ZoomableImage
              src={CASE_BACKGROUND_IMAGE.url}
              alt={CASE_BACKGROUND_IMAGE.alt}
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-ink/80 via-ink/30 to-transparent" />
            <div className="relative z-10 flex h-full flex-col justify-end p-5">
              <div className="text-[10px] font-ui tracking-[0.24em] text-brass/80">剧本背景</div>
              <div className="mt-1 text-xl font-title font-bold tracking-wider text-cream">华懋饭店顶层夜宴</div>
              <p className="mt-1 max-w-lg text-xs leading-relaxed text-cream/70">
                外滩江风、密室门闩、碎杯与未说出口的旧债，构成这一夜所有角色的共同舞台。
              </p>
            </div>
          </div>
          <div className="section-title text-base">📜 你的剧本</div>

          {allVisibleActs.map(act => {
            const isLocked = act.actNumber > currentAct ||
              (act.requiresClue && !unlockedHiddenActs.has(act.actId));
            const isCurrent = act.actNumber === currentAct ||
              (act.requiresClue && unlockedHiddenActs.has(act.actId) && !completedActs.has(act.actId));
            const isCompleted = completedActs.has(act.actId);

            if (act.requiresClue && !unlockedHiddenActs.has(act.actId) && act.actNumber > 10) {
              return (
                <div key={act.actId} className="act-card locked">
                  <div className="text-center py-4 text-sepia-light/40 font-body text-sm italic">
                    <p>🔒 隐藏内容</p>
                    <p className="text-xs mt-1">{act.clueHint || '需要特定线索才能解锁'}</p>
                  </div>
                </div>
              );
            }

            if (act.actNumber > currentAct && !act.requiresClue) {
              return (
                <div key={act.actId} className="act-card locked">
                  <div className="text-center py-4 text-sepia-light/40 font-body text-sm italic">
                    <p>🔒 此幕尚未解锁</p>
                    <p className="text-xs mt-1">完成前面的内容后自动解锁</p>
                  </div>
                </div>
              );
            }

            return (
              <ActReader
                key={act.actId}
                act={act}
                characterName={script.name}
                isCurrent={!isCompleted}
                isCompleted={isCompleted}
                onReadComplete={() => handleActReadComplete(act)}
                unlockedClues={unlockedHiddenClues.filter(c => c.actRevealed === act.actNumber)}
              />
            );
          })}
        </div>
      )}

      {/* Voting panel */}
      {showVoting && !showQuestions && !revealed && (
        <VotingPanel
          options={[
            { characterId: 'fang_jingyao', name: '方敬尧', title: '方家长子' },
            { characterId: 'shen_ruolan', name: '沈若兰', title: '方仲远未婚妻' },
            { characterId: 'tang_wenxuan', name: '唐文轩', title: '华懋饭店主人' },
            { characterId: 'liu_ruyan', name: '柳如烟', title: '京剧名伶' },
            { characterId: 'ma_weiren', name: '马维仁', title: '航业竞争对手' },
            { characterId: 'zhao_qiming', name: '赵启明', title: '饭店领班' },
          ]}
          currentCharacterId={characterId}
          onVote={(targetId) => setVotedFor(targetId)}
          onVoteComplete={() => {
            setShowVoting(false);
            setShowQuestions(true);
          }}
        />
      )}

      {/* Question panel */}
      {showQuestions && !revealed && (
        <div>
          <QuestionPanel
            questions={script.finalQuestions}
            characterName={script.name}
            onComplete={handleQuestionsComplete}
          />
        </div>
      )}

      {/* Reveal */}
      {revealed && questionAnswers && (
        <motion.div
          className="paper-card p-6 space-y-5 text-center"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="text-4xl">🎭</div>
          <div className="section-title text-base justify-center">真相揭晓</div>

          {/* ─── Score Summary ─── */}
          {(() => {
            const totalScore = questionAnswers.reduce((s, a) => s + a.pointsAwarded, 0);
            const maxScore = script.finalQuestions.length * 20;
            return (
              <div className="space-y-3">
                <div className="py-3 border border-burgundy/15 rounded bg-burgundy/[0.02]">
                  <div className="text-[10px] font-ui text-sepia-light mb-1">你的终局成绩</div>
                  <div className="text-5xl font-game font-black text-burgundy">
                    {totalScore}<span className="text-xl text-sepia-light">/{maxScore}</span>
                  </div>
                  <div className="text-xs text-sepia-light font-body mt-1">
                    {totalScore >= 80 ? '🏆 你对真相的理解极为透彻。'
                      : totalScore >= 60 ? '🎖️ 你对大部分真相有清晰的认识——但仍有些迷雾未散。'
                      : totalScore >= 40 ? '📝 你看到了部分真相——但关键之处仍有误解。'
                      : '🤔 这个夜晚的秘密比你想象的更深。'}
                  </div>
                </div>

                {/* Voting result */}
                {votedFor && (
                  <div className={`py-2 px-3 rounded border text-xs text-center ${
                    votedFor === 'fang_jingyao'
                      ? 'border-jade/20 bg-jade/[0.03]'
                      : 'border-vermilion/10 bg-vermilion/[0.02]'
                  }`}>
                    <span className="text-sepia-light">你的投票：</span>
                    <span className={votedFor === 'fang_jingyao' ? 'text-jade font-semibold' : 'text-vermilion'}>
                      {{ fang_jingyao: '方敬尧', shen_ruolan: '沈若兰', tang_wenxuan: '唐文轩', liu_ruyan: '柳如烟', ma_weiren: '马维仁', zhao_qiming: '赵启明' }[votedFor]}
                    </span>
                    <span className="text-sepia-light ml-1">
                      {votedFor === 'fang_jingyao' ? '—— 你投对了。' : '—— 真凶是方敬尧。'}
                    </span>
                  </div>
                )}

                {script.finalQuestions.map((q, i) => {
                  const a = questionAnswers[i];
                  const selected = q.options.find(o => o.id === a?.selectedOptionId);
                  const correct = q.options.find(o => o.id === q.correctOptionId);
                  return (
                    <div key={q.id} className={`p-3 rounded border text-left text-xs ${
                      a?.isCorrect ? 'border-jade/20 bg-jade/[0.03]' : 'border-vermilion/10 bg-vermilion/[0.02]'
                    }`}>
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className={`font-semibold ${a?.isCorrect ? 'text-jade' : 'text-vermilion'}`}>
                          {a?.isCorrect ? '✓' : '✗'}
                        </span>
                        <span className="font-semibold text-ink">{i + 1}. {q.question}</span>
                        <span className={`ml-auto text-[10px] font-ui ${a?.isCorrect ? 'text-jade' : 'text-vermilion'}`}>
                          {a?.isCorrect ? `+${a.pointsAwarded}分` : '+0分'}
                        </span>
                      </div>
                      {selected && (
                        <p className="text-sepia-light ml-5">
                          你的答案：<span className={a?.isCorrect ? 'text-jade font-semibold' : 'text-vermilion'}>{selected.label}</span>
                        </p>
                      )}
                      {!a?.isCorrect && correct && (
                        <p className="text-jade ml-5 mt-0.5">正确答案：{correct.label}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })()}

          {/* ─── Truth Content ─── */}
          <div className="pt-2 border-t border-sepia-light/10">
            <div className="text-sm text-sepia leading-relaxed font-body">
              <p><b className="text-vermilion">方敬尧</b> 是真凶——</p>
              <p className="mt-1">他在订婚宴上于配餐间用研钵将氰化钾碾碎，撒入方仲远专用的水晶酒杯。</p>
              <p className="mt-1">方仲远因服用了血管扩张药，毒发延迟——给沈若兰留下了对质推搡的时间窗口。</p>
              <p className="mt-1">沈若兰那一推并非致命伤——法医证实毒先于伤。她是清白的。</p>
              <p className="mt-1">方敬尧事后用细线从门外闩住了801正门——制造了密室的假象。</p>
            </div>

            <div className="mt-3 p-3 border border-sepia-light/10 rounded text-xs text-sepia-light font-body space-y-1">
              <p><b>密室手法：</b>细线套住滑动门闩 → 从门缝引出 → 关门后拉线闩门 → 抽走线</p>
              <p><b>毒药来源：</b>方敬尧从赵启明的旧医疗箱中偷走氰化钾</p>
              <p><b>延死原因：</b>方仲远服用的血管扩张剂延缓了氰化物吸收</p>
            </div>
          </div>

          <p className="text-xs text-sepia-light/60 font-body mt-2">
            感谢参与《月落华懋》——分幕密室 · 诡叙交织 · 双痕致死 · 问答终局。
          </p>

          {/* Toggle to review past acts */}
          <button
            onClick={() => setShowActsAfterReveal(!showActsAfterReveal)}
            className="mt-3 text-xs font-ui text-sepia-light hover:text-burgundy transition-colors underline underline-offset-2"
          >
            {showActsAfterReveal ? '收起剧本回顾' : '📜 回顾你的完整剧本'}
          </button>
        </motion.div>
      )}

      {/* Past acts reviewable after reveal */}
      {revealed && showActsAfterReveal && (
        <div className="space-y-4 mt-4 pt-4 border-t border-sepia-light/10">
          <div className="section-title text-base">📜 你的剧本（回顾）</div>
          {allVisibleActs.map(act => {
            const isCompleted = completedActs.has(act.actId);
            if (!isCompleted && act.actNumber > currentAct && !act.requiresClue) return null;
            if (act.requiresClue && !unlockedHiddenActs.has(act.actId) && act.actNumber > 10) return null;
            return (
              <ActReader
                key={act.actId}
                act={act}
                characterName={script.name}
                isCurrent={false}
                isCompleted={isCompleted}
                onReadComplete={() => {}}
                unlockedClues={unlockedHiddenClues.filter(c => c.actRevealed === act.actNumber)}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
