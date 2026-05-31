import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { PlayerQuestion, QuestionAnswer } from '../types';

interface Props {
  questions: PlayerQuestion[];
  characterName: string;
  onComplete: (answers: QuestionAnswer[]) => void;
}

const CATEGORY_LABELS: Record<string, string> = {
  identity: '身份秘密',
  relationship: '隐藏关系',
  method: '作案手法',
  item: '关键物品',
  motive: '动机真相',
};

const CATEGORY_ICONS: Record<string, string> = {
  identity: '🪪',
  relationship: '🔗',
  method: '🔪',
  item: '📎',
  motive: '💭',
};

export function QuestionPanel({ questions, characterName, onComplete }: Props) {
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<QuestionAnswer[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);

  const question = questions[currentQ];
  const currentAnswer = answers[currentQ];

  const handleSelect = useCallback((optionId: string) => {
    if (currentAnswer?.selectedOptionId) return;
    const isCorrect = optionId === question.correctOptionId;
    const newAnswer: QuestionAnswer = {
      questionId: question.id,
      selectedOptionId: optionId,
      isCorrect,
      pointsAwarded: isCorrect ? question.points : 0,
    };
    const newAnswers = [...answers, newAnswer];
    setAnswers(newAnswers);
    setTimeout(() => setShowExplanation(true), 500);
  }, [currentAnswer, question, answers]);

  const handleNext = useCallback(() => {
    setShowExplanation(false);
    if (currentQ < questions.length - 1) {
      setCurrentQ(prev => prev + 1);
    } else {
      setShowResult(true);
      onComplete(answers);
    }
  }, [currentQ, questions.length, answers, onComplete]);

  const totalScore = answers.reduce((sum, a) => sum + a.pointsAwarded, 0);
  const maxScore = questions.length * 20;

  if (showResult) {
    return (
      <motion.div
        className="paper-card p-6 space-y-5 text-center"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <div className="text-4xl mb-2">
          {totalScore >= 80 ? '🏆' : totalScore >= 60 ? '🎖️' : totalScore >= 40 ? '📝' : '🤔'}
        </div>
        <h3 className="text-lg font-title font-bold text-ink">问答终局 · 结果</h3>

        <div className="py-4">
          <div className="text-5xl font-game font-black text-burgundy mb-2">
            {totalScore}<span className="text-xl text-sepia-light">/{maxScore}</span>
          </div>
          <p className="text-xs text-sepia-light font-body">
            {totalScore >= 80
              ? '你对真相的理解极为透彻。'
              : totalScore >= 60
              ? '你对大部分真相有清晰的认识——但仍有些迷雾未散。'
              : totalScore >= 40
              ? '你看到了部分真相——但关键之处仍有误解。'
              : '这个夜晚的秘密比你想象的更深。'}
          </p>
        </div>

        <div className="space-y-2 text-left">
          {answers.map((a, i) => {
            const q = questions[i];
            const selected = q.options.find(o => o.id === a.selectedOptionId);
            const correct = q.options.find(o => o.id === q.correctOptionId);
            return (
              <div key={a.questionId} className={`p-3 rounded border text-xs ${
                a.isCorrect ? 'border-jade/20 bg-jade/[0.03]' : 'border-vermilion/10 bg-vermilion/[0.02]'
              }`}>
                <div className="flex items-center gap-2 mb-1">
                  <span>{CATEGORY_ICONS[q.category]}</span>
                  <span className="font-semibold text-ink">{i + 1}. {q.question}</span>
                  <span className={`ml-auto text-[10px] font-ui ${a.isCorrect ? 'text-jade' : 'text-vermilion'}`}>
                    {a.isCorrect ? `✓ +${a.pointsAwarded}分` : '✗ +0分'}
                  </span>
                </div>
                {selected && (
                  <p className="text-sepia-light ml-6">你的答案：<span className={a.isCorrect ? 'text-jade font-semibold' : 'text-vermilion'}>{selected.label}</span></p>
                )}
                {!a.isCorrect && correct && (
                  <p className="text-jade ml-6 mt-0.5">正确答案：{correct.label}</p>
                )}
                <p className="text-[10px] text-sepia-light/70 ml-6 mt-0.5 italic">{q.explanation}</p>
              </div>
            );
          })}
        </div>

        <p className="text-[10px] text-sepia-light/60 font-body mt-4">
          你对真相的理解——由你的答案证明。
        </p>
      </motion.div>
    );
  }

  return (
    <div className="paper-card p-6 space-y-5">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-sm">❓</span>
            <span className="text-sm font-title font-bold text-ink">终局问答</span>
          </div>
          <span className="text-[10px] font-ui text-sepia-light/60">
            {currentQ + 1} / {questions.length}
          </span>
        </div>
        {/* Progress bar */}
        <div className="flex gap-1 mb-2">
          {questions.map((q, i) => (
            <div
              key={q.id}
              className={`flex-1 h-1 rounded-full transition-all duration-300 ${
                answers[i]
                  ? answers[i].isCorrect ? 'bg-jade' : 'bg-vermilion'
                  : i === currentQ ? 'bg-burgundy' : 'bg-sepia-light/10'
              }`}
            />
          ))}
        </div>
        <p className="text-xs text-sepia-light font-body">
          你需要回答关于作案手法、身份和动机的问题。每题20分，共5题。
        </p>
      </div>

      {/* Question */}
      <AnimatePresence mode="wait">
        <motion.div
          key={question.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="space-y-4"
        >
          <div>
            <span className="text-[10px] font-ui px-2 py-0.5 rounded-full bg-burgundy/10 text-burgundy">
              {CATEGORY_ICONS[question.category]} {CATEGORY_LABELS[question.category]} · {question.points} 分
            </span>
            <h4 className="text-sm font-title font-semibold text-ink mt-2 leading-relaxed">
              {question.question}
            </h4>
          </div>

          {/* Options — only labels, no hint descriptions */}
          <div className="space-y-2">
            {question.options.map((opt, i) => {
              const isSelected = currentAnswer?.selectedOptionId === opt.id;
              const isCorrectOption = opt.id === question.correctOptionId;
              const showCorrect = currentAnswer && showExplanation;

              return (
                <motion.button
                  key={opt.id}
                  onClick={() => !currentAnswer && handleSelect(opt.id)}
                  disabled={!!currentAnswer}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className={`w-full text-left p-3 rounded border transition-all duration-200 ${
                    showCorrect && isCorrectOption
                      ? 'border-jade/40 bg-jade/[0.06] ring-1 ring-jade/20'
                      : showCorrect && isSelected && !isCorrectOption
                      ? 'border-vermilion/30 bg-vermilion/[0.04]'
                      : isSelected
                      ? 'border-burgundy/30 bg-burgundy/[0.04]'
                      : currentAnswer
                      ? 'border-sepia-light/10 opacity-40'
                      : 'border-sepia-light/10 hover:border-burgundy/30 hover:bg-burgundy/[0.02] cursor-pointer'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center text-[10px] flex-shrink-0 ${
                      showCorrect && isCorrectOption
                        ? 'border-jade bg-jade/10 text-jade'
                        : showCorrect && isSelected && !isCorrectOption
                        ? 'border-vermilion bg-vermilion/10 text-vermilion'
                        : isSelected
                        ? 'border-burgundy bg-burgundy/10 text-burgundy'
                        : 'border-sepia-light/20 text-sepia-light'
                    }`}>
                      {showCorrect && isCorrectOption ? '✓' :
                       showCorrect && isSelected && !isCorrectOption ? '✗' :
                       String.fromCharCode(65 + i)}
                    </span>
                    <span className="text-xs text-ink">{opt.label}</span>
                  </div>
                </motion.button>
              );
            })}
          </div>

          {/* Explanation — only shown AFTER answering */}
          <AnimatePresence>
            {showExplanation && (
              <motion.div
                className="p-4 rounded border border-burgundy/15 bg-burgundy/[0.02]"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs">{currentAnswer?.isCorrect ? '✅' : '❌'}</span>
                  <span className={`text-xs font-semibold ${currentAnswer?.isCorrect ? 'text-jade' : 'text-vermilion'}`}>
                    {currentAnswer?.isCorrect ? '回答正确！+20分' : '回答错误 +0分'}
                  </span>
                </div>
                <p className="text-xs text-sepia leading-relaxed">{question.explanation}</p>
                <button
                  onClick={handleNext}
                  className="mt-3 px-5 py-1.5 bg-burgundy text-cream text-xs font-ui tracking-wider
                    hover:bg-burgundy-light transition-colors"
                >
                  {currentQ < questions.length - 1 ? '下一题 →' : '查看结果'}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
