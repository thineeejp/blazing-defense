import React from 'react';
import { EQUIPMENT_TREES } from '../constants/equipment';
import { QUIZ_QUESTIONS } from '../constants/quizzes';

export default function BriefingPhase({
  round,
  phase,
  selectedCategory,
  quizzes,
  currentQIndex,
  correctCount,
  totalCost,
  tiers,
  onSelectCategory,
  onAnswerQuiz,
  onFinishRound,
  onStartBattle,
}) {
  // CategorySelect: 5種別の選択画面
  if (phase === 'SELECT') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 text-white flex flex-col items-center justify-center p-8">
        <div className="max-w-4xl w-full">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-2">BRIEFING - ラウンド {round}/3</h1>
            <p className="text-xl text-gray-300">強化する設備種別を選択してください</p>
            <div className="mt-4 text-sm text-gray-400">
              獲得コスト: {totalCost} | 次のラウンドで3問出題されます
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {Object.entries(EQUIPMENT_TREES).map(([categoryId, tree]) => {
              const Icon = tree.icon;
              const currentTier = tiers[categoryId];
              const isMaxTier = currentTier >= 3;

              return (
                <button
                  key={categoryId}
                  onClick={() => onSelectCategory(categoryId)}
                  className={`
                    p-6 rounded-lg border-2 transition-all transform hover:scale-105
                    ${tree.color === 'red' ? 'border-red-500 hover:bg-red-900/30' : ''}
                    ${tree.color === 'yellow' ? 'border-yellow-500 hover:bg-yellow-900/30' : ''}
                    ${tree.color === 'green' ? 'border-green-500 hover:bg-green-900/30' : ''}
                    ${tree.color === 'blue' ? 'border-blue-500 hover:bg-blue-900/30' : ''}
                    ${tree.color === 'purple' ? 'border-purple-500 hover:bg-purple-900/30' : ''}
                    bg-gray-800/50
                  `}
                >
                  <div className="flex flex-col items-center">
                    <Icon size={48} className={`
                      ${tree.color === 'red' ? 'text-red-400' : ''}
                      ${tree.color === 'yellow' ? 'text-yellow-400' : ''}
                      ${tree.color === 'green' ? 'text-green-400' : ''}
                      ${tree.color === 'blue' ? 'text-blue-400' : ''}
                      ${tree.color === 'purple' ? 'text-purple-400' : ''}
                      mb-3
                    `} />
                    <div className="text-lg font-bold mb-2">{tree.name}</div>
                    <div className="text-sm">
                      現在: Tier {currentTier}
                    </div>
                    {!isMaxTier && (
                      <div className="text-xs text-gray-400 mt-1">
                        → Tier {currentTier + 1} へアップ
                      </div>
                    )}
                    {isMaxTier && (
                      <div className="text-xs text-yellow-400 mt-1">
                        オーバーフロー報酬
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // QuizSession: 3問のクイズ画面
  if (phase === 'QUIZ') {
    const currentQuiz = quizzes[currentQIndex];
    if (!currentQuiz) return null;

    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 text-white flex flex-col items-center justify-center p-8">
        <div className="max-w-2xl w-full bg-gray-800/70 p-8 rounded-lg border-2 border-blue-500">
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">
                {EQUIPMENT_TREES[selectedCategory].name} - 問題 {currentQIndex + 1}/3
              </h2>
              <span className="text-sm bg-blue-600 px-3 py-1 rounded">{currentQuiz.tag}</span>
            </div>
            <div className="text-sm text-gray-400 mb-4">
              正解数: {correctCount}/{currentQIndex}
            </div>
          </div>

          <div className="mb-8">
            <p className="text-xl mb-6">{currentQuiz.question}</p>
            <div className="space-y-3">
              {currentQuiz.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => onAnswerQuiz(index)}
                  className="w-full p-4 text-left rounded-lg border-2 border-gray-600 hover:border-blue-400 hover:bg-blue-900/30 transition-all"
                >
                  <span className="font-bold mr-2">{String.fromCharCode(65 + index)}.</span>
                  {option}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // RoundResult: ラウンド結果表示
  if (phase === 'RESULT') {
    const tree = EQUIPMENT_TREES[selectedCategory];
    const newTier = tiers[selectedCategory];
    const isOverflow = newTier > 3;
    const reward = correctCount === 3 ? 400 : correctCount * 100;

    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 text-white flex flex-col items-center justify-center p-8">
        <div className="max-w-2xl w-full bg-gray-800/70 p-8 rounded-lg border-2 border-green-500">
          <h1 className="text-3xl font-bold text-center mb-6">
            ラウンド {round} 完了！
          </h1>

          <div className="mb-6 text-center">
            <div className="text-xl mb-2">
              正解数: {correctCount}/3 {correctCount === 3 && '🎉 パーフェクト！'}
            </div>
            <div className="text-2xl font-bold text-yellow-400 mb-1">
              獲得コスト: +{reward}
            </div>
            <div className="text-gray-400">
              累積コスト: {totalCost}
            </div>
          </div>

          <div className="border-t-2 border-gray-600 pt-6 mb-6">
            <div className="text-xl font-bold mb-4 flex items-center justify-center">
              {React.createElement(tree.icon, { size: 32, className: `text-${tree.color}-400 mr-2` })}
              {tree.name} Tier {newTier - 1} → Tier {newTier > 3 ? 3 : newTier}
            </div>

            {!isOverflow && newTier <= 3 && tree.tiers[newTier] && (
              <div>
                <div className="text-sm text-gray-400 mb-2">新規解放:</div>
                <div className="space-y-2">
                  {tree.tiers[newTier].map(cardId => (
                    <div key={cardId} className="bg-gray-700/50 p-3 rounded">
                      {cardId}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {isOverflow && (
              <div className="bg-yellow-900/30 p-4 rounded border-2 border-yellow-500">
                <div className="text-lg font-bold text-yellow-400 mb-2">
                  ⭐ オーバーフロー報酬発動！
                </div>
                <div className="text-sm space-y-1">
                  <div>• {tree.name}の配置コスト: -10%</div>
                  <div>• {tree.name}の性能: +15%</div>
                </div>
              </div>
            )}
          </div>

          <div className="text-center">
            {round < 3 ? (
              <button
                onClick={onFinishRound}
                className="bg-blue-600 hover:bg-blue-700 px-8 py-3 rounded-lg text-lg font-bold"
              >
                次のラウンドへ ({round + 1}/3)
              </button>
            ) : (
              <button
                onClick={onStartBattle}
                className="bg-green-600 hover:bg-green-700 px-8 py-3 rounded-lg text-lg font-bold"
              >
                戦闘開始！
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return null;
}
