function ScoreLine({ label, value, highlight = false }) {
  return (
    <div className={`flex justify-between items-center ${highlight ? 'text-yellow-400 font-bold' : 'text-gray-300'}`}>
      <span>{label}</span>
      <span className="font-mono">{value > 0 ? `+${value.toLocaleString()}` : '0'}</span>
    </div>
  );
}

export default function GameOver({ isVictory, scoreData, onBackToMenu }) {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-black/90 text-white p-8 overflow-y-auto">
      {/* タイトル */}
      {isVictory ? (
        <div>
          <h2 className="text-6xl font-black text-green-400 mb-4 animate-pulse text-center">
            MISSION COMPLETE!
          </h2>
          <p className="text-xl text-gray-300 mb-8 text-center">
            火災を制圧し、避難誘導に成功しました！
          </p>
        </div>
      ) : (
        <div>
          <h2 className="text-5xl font-black text-red-600 mb-4 animate-bounce text-center">
            GAME OVER
          </h2>
          <p className="text-xl text-gray-400 mb-8 text-center">
            敵が防衛ライン(手前)を突破しました
          </p>
        </div>
      )}

      {/* 最終スコア */}
      <div className="bg-slate-800 border-2 border-slate-600 rounded-xl p-6 mb-6 w-full max-w-md">
        <div className="text-center mb-4">
          <div className="text-5xl font-black text-yellow-400">
            {scoreData.total.toLocaleString()} Pt
          </div>
          <div className="text-sm text-gray-400">最終スコア</div>
        </div>

        {/* スコア内訳 */}
        <div className="space-y-2 border-t border-slate-600 pt-4">
          <ScoreLine label="避難達成" value={scoreData.breakdown.evacuation} />
          <ScoreLine label="時間ボーナス" value={scoreData.breakdown.time} />
          <ScoreLine label="HP残量" value={scoreData.breakdown.hp} />
          <ScoreLine label="コスト効率" value={scoreData.breakdown.cost} />
          <ScoreLine label="敵撃破" value={scoreData.breakdown.defeat} />

          {/* 特別ボーナス */}
          {scoreData.breakdown.noDamage > 0 && (
            <ScoreLine label="🔥 ノーダメージ!" value={scoreData.breakdown.noDamage} highlight />
          )}
          {scoreData.breakdown.speed > 0 && (
            <ScoreLine label="⚡ スピードクリア!" value={scoreData.breakdown.speed} highlight />
          )}
          {scoreData.breakdown.economy > 0 && (
            <ScoreLine label="💰 エコノミー達成!" value={scoreData.breakdown.economy} highlight />
          )}
        </div>
      </div>

      {/* ボタン */}
      <button
        onClick={onBackToMenu}
        className="bg-white text-black font-bold py-3 px-8 rounded-full hover:scale-105 transition-transform"
      >
        タイトルへ戻る
      </button>
    </div>
  );
}
