import React from 'react';
import { EQUIPMENT_TREES } from '../constants/equipment';
import { ALL_CARDS } from '../constants/cards';
import { ArrowRight, Star, CheckCircle, XCircle } from 'lucide-react';
import GameBackground from './ui/GameBackground';
import GlassCard from './ui/GlassCard';

export default function BriefingPhase({
  round,
  phase,
  selectedCategory,
  quizzes,
  currentQIndex,
  correctCount,
  totalCost,
  answerHistory,
  tiers,
  onSelectCategory,
  onAnswerQuiz,
  onFeedbackNext,
  onFinishRound,
  onStartBattle,
  onBackToTitle,
}) {
  // CategorySelect: 5種別の選択画面
  if (phase === 'SELECT') {
    return (
      <GameBackground className="flex flex-col items-center justify-start pt-6 md:pt-12 px-4 md:px-6 pb-8 min-h-screen overflow-y-auto">
        <div className="max-w-5xl w-full animate-fadeIn">
          <div className="text-center mb-12 relative">
            <button
              onClick={onBackToTitle}
              className="absolute left-0 top-0 px-4 py-2 text-sm font-bold text-slate-400 hover:text-white bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700 rounded transition-colors"
            >
              ← RETURN TO TITLE
            </button>
            <h1 className="text-3xl md:text-4xl font-black font-orbitron text-white mb-2 tracking-wider">
              BRIEFING <span className="text-cyan-400">PHASE</span>
            </h1>
            <div className="text-slate-300 text-sm mb-3">
              強化したいカテゴリを選んでください ({round}/3)
            </div>
            <div className="flex items-center justify-center gap-4 text-slate-400 font-mono">
              <span className="bg-slate-800 px-3 py-1 rounded border border-slate-700">ROUND {round} / 3</span>
              <span className="bg-slate-800 px-3 py-1 rounded border border-slate-700 text-yellow-400">COST: {totalCost}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {Object.entries(EQUIPMENT_TREES).map(([categoryId, tree], index) => {
              const Icon = tree.icon;
              const currentTier = tiers[categoryId];
              const isMaxTier = currentTier >= 3;

              const colorClass =
                tree.color === 'red' ? 'text-red-400 group-hover:text-red-300' :
                  tree.color === 'yellow' ? 'text-yellow-400 group-hover:text-yellow-300' :
                    tree.color === 'green' ? 'text-green-400 group-hover:text-green-300' :
                      tree.color === 'blue' ? 'text-blue-400 group-hover:text-blue-300' :
                        'text-purple-400 group-hover:text-purple-300';

              return (
                <GlassCard
                  key={categoryId}
                  onClick={() => onSelectCategory(categoryId)}
                  className={`p-5 flex flex-col items-center text-center animate-slideUpFade`}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className={`mb-4 transition-transform duration-300 group-hover:scale-110 ${colorClass}`}>
                    <Icon size={38} />
                  </div>

                  <div className="text-base font-bold mb-2 font-orbitron">{tree.name}</div>

                  <div className="w-full bg-slate-800 h-2 rounded-full mb-2 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${tree.color === 'red' ? 'bg-red-500' :
                        tree.color === 'yellow' ? 'bg-yellow-500' :
                          tree.color === 'green' ? 'bg-green-500' :
                            tree.color === 'blue' ? 'bg-blue-500' : 'bg-purple-500'
                        }`}
                      style={{ width: `${(currentTier / 3) * 100}%` }}
                    />
                  </div>

                  <div className="text-xs text-slate-400 font-mono mb-4">
                    TIER {currentTier} {currentTier < 3 ? `/ 3` : '(MAX)'}
                  </div>

                  {!isMaxTier ? (
                    <div className="mt-auto text-xs text-cyan-400 font-bold border border-cyan-500/30 px-2 py-1 rounded bg-cyan-900/20">
                      UPGRADE
                    </div>
                  ) : (
                    <div className="mt-auto text-xs text-yellow-400 font-bold border border-yellow-500/30 px-2 py-1 rounded bg-yellow-900/20 flex items-center gap-1">
                      <Star size={10} fill="currentColor" /> 追加ボーナス
                    </div>
                  )}
                </GlassCard>
              );
            })}
          </div>
        </div>
      </GameBackground>
    );
  }

  // QuizSession: 3問のクイズ画面
  if (phase === 'QUIZ') {
    const currentQuiz = quizzes[currentQIndex];
    if (!currentQuiz) return null;

    return (
      <GameBackground className="flex flex-col items-center justify-start pt-6 md:pt-12 px-4 md:px-8 pb-8 min-h-screen overflow-y-auto">
        <div className="max-w-3xl w-full animate-fadeIn">
          <GlassCard className="p-8 md:p-12" hoverEffect={false}>
            <div className="flex justify-between items-start mb-8 border-b border-white/10 pb-4">
              <div>
                <h2 className="text-2xl font-bold font-orbitron text-cyan-400 mb-1">
                  {EQUIPMENT_TREES[selectedCategory].name} QUIZ
                </h2>
                <div className="text-sm text-slate-400 font-mono">
                  QUESTION {currentQIndex + 1} / 3
                </div>
              </div>
            </div>

            <p className="text-xl md:text-2xl font-bold mb-8 leading-relaxed">
              {currentQuiz.question}
            </p>

            <div className="space-y-3">
              {currentQuiz.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => onAnswerQuiz(index)}
                  className="w-full p-5 min-h-[52px] text-left rounded-xl bg-slate-800/50 border border-slate-600 hover:border-cyan-400 hover:bg-cyan-900/20 hover:shadow-[0_0_15px_rgba(34,211,238,0.2)] active:scale-[0.98] transition-all group flex items-center"
                >
                  <span className="w-8 h-8 rounded-full bg-slate-700 text-slate-300 flex items-center justify-center font-bold mr-4 group-hover:bg-cyan-500 group-hover:text-slate-900 transition-colors">
                    {String.fromCharCode(65 + index)}
                  </span>
                  <span className="text-lg font-bold group-hover:text-cyan-100">{option}</span>
                </button>
              ))}
            </div>
          </GlassCard>
        </div>
      </GameBackground>
    );
  }

  // Feedback: 回答直後のフィードバック画面
  if (phase === 'FEEDBACK') {
    const currentQuiz = quizzes[currentQIndex];
    const latestAnswer = answerHistory[answerHistory.length - 1];
    if (!currentQuiz || !latestAnswer) return null;

    return (
      <GameBackground className="flex flex-col items-center justify-start pt-6 md:pt-12 px-4 md:px-8 pb-8 min-h-screen overflow-y-auto">
        <div className="max-w-3xl w-full animate-fadeIn">
          <GlassCard className="p-8 md:p-12" hoverEffect={false}>
            <div className="flex justify-between items-start mb-8 border-b border-white/10 pb-4">
              <div>
                <h2 className="text-2xl font-bold font-orbitron text-cyan-400 mb-1">
                  {EQUIPMENT_TREES[selectedCategory].name} QUIZ
                </h2>
                <div className="text-sm text-slate-400 font-mono">
                  QUESTION {currentQIndex + 1} / 3
                </div>
              </div>
            </div>

            <p className="text-xl md:text-2xl font-bold mb-8 leading-relaxed">
              {currentQuiz.question}
            </p>

            {/* 選択肢（フィードバック表示） */}
            <div className="space-y-4">
              {currentQuiz.options.map((option, index) => {
                const isCorrectOption = index === latestAnswer.correctAnswer;
                const isSelectedOption = index === latestAnswer.selectedAnswer;

                // スタイル決定
                let bgClass = 'bg-slate-800/50 border-slate-600';
                let icon = null;

                if (isCorrectOption) {
                  bgClass = 'bg-green-600/30 border-green-400 shadow-[0_0_20px_rgba(34,197,94,0.6)]';
                  icon = <CheckCircle className="text-green-400" size={24} />;
                } else if (isSelectedOption && !isCorrectOption) {
                  bgClass = 'bg-red-600/30 border-red-400 shadow-[0_0_20px_rgba(239,68,68,0.6)] animate-shake';
                  icon = <XCircle className="text-red-400" size={24} />;
                }

                return (
                  <div
                    key={index}
                    className={`w-full p-5 rounded-xl border transition-all duration-500 flex items-center ${bgClass}`}
                  >
                    <span className="w-8 h-8 rounded-full bg-slate-700 text-slate-300 flex items-center justify-center font-bold mr-4">
                      {String.fromCharCode(65 + index)}
                    </span>
                    <span className="text-lg font-bold flex-1">{option}</span>
                    {icon && <div className="ml-4">{icon}</div>}
                  </div>
                );
              })}
            </div>

            {/* フィードバックメッセージ */}
            <div className="mt-8 text-center">
              {latestAnswer.isCorrect ? (
                <div className="text-green-400 font-bold text-2xl animate-bounce flex items-center justify-center gap-2">
                  <CheckCircle size={28} />
                  正解！
                </div>
              ) : (
                <div className="text-red-400 font-bold text-2xl flex items-center justify-center gap-2">
                  <XCircle size={28} />
                  不正解
                </div>
              )}
            </div>

            {/* 手動遷移ボタン */}
            <div className="mt-8 flex justify-center">
              <button
                onClick={onFeedbackNext}
                className="px-8 py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-lg transition-all shadow-[0_0_20px_rgba(8,145,178,0.4)] hover:shadow-[0_0_30px_rgba(8,145,178,0.6)] flex items-center gap-2 group"
              >
                <span>{currentQIndex < quizzes.length - 1 ? '次の問題へ' : '結果を見る'}</span>
                <ArrowRight className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </GlassCard>
        </div>
      </GameBackground>
    );
  }

  // RoundResult: ラウンド結果表示
  if (phase === 'RESULT') {
    const tree = EQUIPMENT_TREES[selectedCategory];
    const newTier = tiers[selectedCategory];
    const isOverflow = newTier > 3;
    const reward = correctCount === 3 ? 400 : correctCount * 100;

    return (
      <GameBackground className="flex flex-col items-center justify-start pt-6 md:pt-12 px-4 md:px-6 pb-8 min-h-screen overflow-y-auto">
        <div className="max-w-xl w-full animate-slam">
          <GlassCard className="p-6 text-center border-t-4 border-t-cyan-500" hoverEffect={false}>
            <div className="mb-5">
              <h2 className="text-3xl font-black font-orbitron italic text-white mb-2">
                ROUND COMPLETE
              </h2>
              <div className="text-cyan-400 font-mono tracking-widest">
                UPGRADE SUCCESSFUL
              </div>
            </div>

            <div className="bg-slate-800/50 rounded-xl p-4 mb-5 border border-white/5">
              <div className="flex items-center justify-center gap-4 mb-4">
                {React.createElement(tree.icon, { size: 40, className: `text-${tree.color}-400` })}
                <div className="text-left">
                  <div className="text-sm text-slate-400 font-bold">TIER UPGRADE</div>
                  <div className="text-2xl font-bold font-orbitron">
                    TIER {newTier - 1} <ArrowRight className="inline mx-2" size={20} /> TIER {newTier > 3 ? 3 : newTier}
                  </div>
                </div>
              </div>

              {isOverflow ? (
                <div className="bg-yellow-900/20 border border-yellow-500/30 p-4 rounded-lg text-yellow-300">
                  <div className="font-bold flex items-center justify-center gap-2 mb-2">
                    <Star size={16} fill="currentColor" /> OVERFLOW BONUS ACTIVE
                  </div>
                  <div className="text-sm opacity-80">Cost -10% / Power +15%</div>
                </div>
              ) : (
                newTier <= 3 && tree.tiers[newTier] && (
                  <div className="text-left bg-slate-900/50 p-4 rounded border border-white/5">
                    <div className="text-xs text-slate-400 mb-2 font-bold">UNLOCKED EQUIPMENT:</div>
                    <div className="flex flex-wrap gap-2">
                      {tree.tiers[newTier].map(cardId => (
                        <span key={cardId} className="px-2 py-1 bg-slate-700 rounded text-xs font-mono text-cyan-300">
                          {ALL_CARDS[cardId]?.name || cardId}
                        </span>
                      ))}
                    </div>
                  </div>
                )
              )}
            </div>

            {/* 問題別結果セクション */}
            {answerHistory && answerHistory.length > 0 && (
              <div className="bg-slate-800/50 rounded-xl p-4 mb-6 border border-white/5">
                <div className="text-sm text-slate-400 font-bold mb-4">問題別結果</div>
                <div className="space-y-3">
                  {answerHistory.map((answer, idx) => (
                    <div key={idx} className="flex items-start gap-3 text-sm">
                      {answer.isCorrect ? (
                        <CheckCircle className="text-green-400 flex-shrink-0 mt-0.5" size={18} />
                      ) : (
                        <XCircle className="text-red-400 flex-shrink-0 mt-0.5" size={18} />
                      )}
                      <div className="flex-1">
                        <div className={answer.isCorrect ? 'text-green-300 font-bold' : 'text-red-300 font-bold'}>
                          問題{idx + 1}: {answer.isCorrect ? '正解' : '不正解'}
                        </div>
                        {!answer.isCorrect && (
                          <div className="text-xs text-slate-500 mt-1">
                            あなたの回答: {String.fromCharCode(65 + answer.selectedAnswer)} /
                            正解: {String.fromCharCode(65 + answer.correctAnswer)}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-center gap-8 mb-6">
              <div className="text-center">
                <div className="text-xs text-slate-400 font-bold mb-1">CORRECT</div>
                <div className="text-2xl font-black text-white">{correctCount} / 3</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-slate-400 font-bold mb-1">REWARD</div>
                <div className="text-2xl font-black text-yellow-400">+{reward}</div>
              </div>
            </div>

            <button
              onClick={round < 3 ? onFinishRound : onStartBattle}
              className="w-full py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-lg transition-all shadow-[0_0_20px_rgba(8,145,178,0.4)] hover:shadow-[0_0_30px_rgba(8,145,178,0.6)] flex items-center justify-center gap-2 group"
            >
              <span>{round < 3 ? 'NEXT ROUND' : 'PROCEED TO DECK BUILD'}</span>
              <ArrowRight className="group-hover:translate-x-1 transition-transform" />
            </button>
          </GlassCard>
        </div>
      </GameBackground>
    );
  }

  return null;
}
