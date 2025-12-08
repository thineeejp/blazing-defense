import { useState, useEffect, useRef } from 'react';
import { Clock, Users, ShieldCheck, RefreshCw, ArrowRight, Trophy, Award, Coins } from 'lucide-react';
import { isHighScore, addHighScore, serializeDeck } from '../utils/highScores';
import { checkAchievements, updateGameStats, analyzeDeck, trackUsedCards } from '../utils/achievements';

/**
 * ゲームオーバー / ミッション完了画面
 * サンプル.jsxのデザインをベースに実装
 */
export default function GameOver({ isVictory, scoreData, difficulty, deck, cost, onBackToMenu, onRetry }) {
  const [gameState, setGameState] = useState('finish'); // finish -> result
  const [highScoreInfo, setHighScoreInfo] = useState(null); // { isNewHighScore, rank }
  const [newAchievements, setNewAchievements] = useState([]); // 新規解除実績
  const hasSaved = useRef(false); // 重複保存防止フラグ

  // ハイスコア判定と保存（初回レンダリング時のみ）
  useEffect(() => {
    // 既に保存済みならスキップ（React.StrictModeの重複実行対策）
    if (hasSaved.current) return;
    hasSaved.current = true;

    const totalScore = scoreData.total;

    // トップ3に入るかチェック
    if (isHighScore(totalScore)) {
      // スコアエントリを作成
      const scoreEntry = {
        rank: 0, // addHighScore内で設定される
        score: totalScore,
        difficulty: difficulty,
        isVictory: isVictory,
        stats: {
          evacuated: scoreData.stats.evacuated,
          goal: scoreData.stats.goal,
          hp: scoreData.stats.hp,
          timeBonus: scoreData.stats.timeBonus,
          defeatedEnemies: scoreData.stats.defeatedEnemies,
          clearTime: scoreData.stats.clearTime,
          cost: scoreData.stats.cost,
        },
        usedDeck: serializeDeck(deck),
        timestamp: Date.now(),
      };

      // ランキングに追加
      const result = addHighScore(scoreEntry);
      setHighScoreInfo(result);
    }

    // 使用カード履歴を更新（デッキ分析の前に実行）
    trackUsedCards(deck);

    // デッキ分析
    const deckAnalysis = analyzeDeck(deck);

    // ゲーム結果オブジェクトを構築
    const gameResult = {
      isVictory: isVictory,
      difficulty: difficulty,
      stats: scoreData.stats,
      score: totalScore,
      cost: cost || 0,
      deckSize: deckAnalysis.deckSize,
      usedAllCards: deckAnalysis.usedAllCards,
      noTier3Used: deckAnalysis.noTier3Used,
    };

    // 実績判定（統計更新の前に実行）
    const unlocked = checkAchievements(gameResult);
    setNewAchievements(unlocked);

    // 統計更新（実績判定の後に実行）
    if (isVictory) {
      // 勝利時のみ統計を更新
      updateGameStats(difficulty);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Finish演出が終わったらResult画面へ遷移
  const handleFinishComplete = () => {
    setGameState('result');
  };

  const resultType = isVictory ? 'win' : 'lose';

  return (
    <div className="fixed inset-0 z-50 overflow-hidden font-sans select-none pointer-events-auto">
      {/* 1. FINISH インパクト演出 */}
      {gameState === 'finish' && (
        <FinishEffect
          type={resultType}
          onComplete={handleFinishComplete}
        />
      )}

      {/* 2. リザルト画面 */}
      {gameState === 'result' && (
        <ResultScreen
          type={resultType}
          scoreData={scoreData}
          highScoreInfo={highScoreInfo}
          newAchievements={newAchievements}
          onRetry={onRetry}
          onBackToMenu={onBackToMenu}
        />
      )}
    </div>
  );
}

/**
 * ------------------------------------------------------------------
 * コンポーネント: FinishEffect
 * 画面中央に「FINISH」などの文字を叩きつける演出
 * ------------------------------------------------------------------
 */
const FinishEffect = ({ type, onComplete }) => {
  useEffect(() => {
    // 2.5秒後にコールバックを呼んで次の画面へ
    const timer = setTimeout(onComplete, 2500);
    return () => clearTimeout(timer);
  }, [onComplete]);

  const text = type === 'win' ? 'MISSION\nCOMPLETE' : 'GAME\nOVER';
  const colorClass = type === 'win' ? 'text-cyan-400' : 'text-rose-500';
  const glowClass = type === 'win' ? 'drop-shadow-[0_0_30px_rgba(34,211,238,0.8)]' : 'drop-shadow-[0_0_30px_rgba(244,63,94,0.8)]';
  const borderColor = type === 'win' ? 'border-cyan-400' : 'border-rose-500';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
      {/* 背景暗転 + ブラー */}
      <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm animate-fadeIn" />

      {/* メインの衝撃波リング */}
      <div className={`absolute w-[200px] h-[200px] rounded-full border-4 ${borderColor} opacity-0 animate-shockwave`} />

      {/* セカンダリ衝撃波（白線） - 少し遅れて発生 */}
      <div
        className="absolute w-[150px] h-[150px] rounded-full border-2 border-white opacity-0 animate-shockwave"
        style={{ animationDelay: '0.1s', animationDuration: '1.2s' }}
      />

      {/* テキスト本体 */}
      <div className="relative z-10 text-center animate-slam">
        <h1
          className={`text-6xl md:text-8xl font-black italic tracking-tighter leading-none ${colorClass} ${glowClass}`}
          style={{
            fontFamily: "'Orbitron', sans-serif",
            WebkitTextStroke: "2px rgba(255,255,255,0.1)",
          }}
        >
          {text.split('\n').map((line, i) => (
            <div key={i}>{line}</div>
          ))}
        </h1>
      </div>

      {/* スパーク（パーティクル的な装飾） */}
      <div className="absolute inset-0 overflow-hidden">
        <div className={`absolute top-1/2 left-1/2 w-full h-2 bg-white/50 -translate-x-1/2 -translate-y-1/2 animate-ping`} style={{ animationDuration: '0.5s' }} />
      </div>
    </div>
  );
};

/**
 * ------------------------------------------------------------------
 * コンポーネント: ResultScreen
 * グラスモーフィズムを採用したリザルト表示
 * ------------------------------------------------------------------
 */
const ResultScreen = ({ type, scoreData, highScoreInfo, newAchievements, onRetry, onBackToMenu }) => {
  const isWin = type === 'win';
  const stats = scoreData.stats || {}; // App.jsxから渡される生データ

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4">
      {/* 完全に透明ではなく、うっすら背景が見えるオーバーレイ */}
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-fadeIn" />

      <div className="relative w-full max-w-3xl flex flex-col items-center">

        {/* リザルト詳細（中央配置） */}
        <div className="w-full flex flex-col justify-center">

          {/* ヘッダー */}
          <div className="mb-6 opacity-0 animate-slideUpFade delay-200">
            <div className="flex items-baseline justify-between border-b border-white/20 pb-2 mb-2">
              <h2 className={`text-4xl md:text-5xl font-black italic font-['Orbitron'] tracking-tight ${isWin ? 'text-white' : 'text-slate-400'}`}>
                {isWin ? 'RESULT' : 'FAILED'}
              </h2>
              <span className={`text-xl font-mono ${isWin ? 'text-cyan-400' : 'text-rose-400'}`}>
                {isWin ? 'MISSION CLEARED' : 'DEFENSE BREACHED'}
              </span>
            </div>

            {/* ハイスコア通知 */}
            {highScoreInfo?.isNewHighScore && (
              <div className="mb-2 flex items-center gap-2 bg-gradient-to-r from-yellow-500/20 to-transparent border border-yellow-500/50 rounded-lg px-4 py-2 animate-pulse">
                <Trophy size={24} className="text-yellow-400" />
                <span className="text-yellow-300 font-bold text-lg">
                  NEW HIGH SCORE - RANK #{highScoreInfo.rank}
                </span>
              </div>
            )}

            {/* 新規実績通知 */}
            {newAchievements && newAchievements.length > 0 && (
              <div className="mb-3 space-y-2">
                {newAchievements.map((ach) => (
                  <div
                    key={ach.id}
                    className="flex items-center gap-2 bg-gradient-to-r from-purple-500/20 to-transparent border border-purple-500/50 rounded-lg px-4 py-2 animate-slideUpFade"
                  >
                    <Award size={20} className="text-purple-400" />
                    <span className="text-purple-300 font-bold text-sm">
                      実績解除: {ach.name}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* スコアカード */}
          <div className="space-y-6 mb-8 opacity-0 animate-slideUpFade delay-300">
            {/* Total Score（上部、大きく表示） */}
            <div className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 border border-white/20 rounded-2xl p-8 backdrop-blur-md shadow-2xl relative overflow-hidden">
              {/* 光の反射エフェクト */}
              <div className="absolute top-0 -left-full w-1/2 h-full bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12 animate-[shimmer_3s_infinite]" />

              <div className="relative z-10 text-center">
                <div className="text-slate-400 text-sm uppercase tracking-[0.3em] mb-2 font-bold">
                  Total Score
                </div>
                <div className={`text-6xl font-['Orbitron'] font-black mb-3 ${isWin ? 'text-cyan-300' : 'text-slate-500'} drop-shadow-[0_0_20px_rgba(34,211,238,0.5)]`}>
                  {scoreData.total.toLocaleString()}
                </div>
                {scoreData.breakdown.multiplier > 1.0 && (
                  <div className="text-slate-400 text-sm font-mono">
                    Base: {scoreData.breakdown.base.toLocaleString()} × {scoreData.breakdown.multiplier.toFixed(3)}
                  </div>
                )}
              </div>
            </div>

            {/* 4列グリッド（詳細スコア） */}
            <div className="bg-slate-800/40 border border-white/10 rounded-xl p-6 backdrop-blur-md shadow-xl">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <ScoreItem
                  icon={Users}
                  label="EVACUATED"
                  value={`${stats.evacuated || 0}`}
                  sub={`/ ${stats.goal || 100}`}
                  color="text-green-400"
                />
                <ScoreItem
                  icon={Clock}
                  label="REMAINING"
                  value={`${Math.floor((stats.clearTime ? (5400 - stats.clearTime) / 60 : 0))}s`}
                  sub="TIME"
                  color="text-yellow-400"
                />
                <ScoreItem
                  icon={ShieldCheck}
                  label="DEFENSE HP"
                  value={`${stats.hp || 0}%`}
                  color="text-blue-400"
                />
                <ScoreItem
                  icon={Coins}
                  label="REMAINING"
                  value={`${stats.cost || 0}`}
                  sub="COST"
                  color="text-orange-400"
                />
              </div>
            </div>

            {/* バッジセクション（効果を明示） */}
            {isWin && (scoreData.badges.noDamage || scoreData.badges.evacuation || scoreData.badges.economy) && (
              <div className="bg-gradient-to-br from-amber-900/20 to-slate-900/40 border border-amber-500/30 rounded-xl p-6 backdrop-blur-md shadow-xl">
                <div className="text-amber-300 text-sm uppercase tracking-widest mb-4 font-bold flex items-center gap-2">
                  <Trophy size={16} />
                  Achievement Bonuses
                </div>

                <div className="space-y-3 mb-4">
                  {scoreData.badges.noDamage && (
                    <BadgeMultiplier
                      text="NO DAMAGE"
                      icon="🏅"
                      color="text-cyan-300"
                      multiplier="1.20"
                    />
                  )}
                  {scoreData.badges.evacuation && (
                    <BadgeMultiplier
                      text="EVACUATION COMPLETE"
                      icon="🚪"
                      color="text-green-300"
                      multiplier="1.20"
                    />
                  )}
                  {scoreData.badges.economy && (
                    <BadgeMultiplier
                      text="ECONOMY RUN"
                      icon="💎"
                      color="text-amber-300"
                      multiplier="1.20"
                    />
                  )}
                </div>

                {scoreData.breakdown.multiplier > 1.0 && (
                  <div className="pt-4 border-t border-white/10">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 text-sm font-bold tracking-wider">
                        🎯 TOTAL MULTIPLIER
                      </span>
                      <span className="text-2xl font-['Orbitron'] font-black text-amber-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.5)] animate-pulse-glow">
                        ×{scoreData.breakdown.multiplier.toFixed(3)}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* アクションボタン */}
          <div className="flex gap-4 opacity-0 animate-slideUpFade delay-400">
            <button
              onClick={onRetry}
              className="flex-1 py-4 px-6 rounded-full bg-slate-800/80 hover:bg-slate-700 text-white font-bold transition-all border border-white/10 flex items-center justify-center gap-2 group"
            >
              <RefreshCw size={20} className="group-hover:-rotate-180 transition-transform duration-500" />
              RETRY
            </button>
            <button
              onClick={onBackToMenu}
              className={`flex-1 py-4 px-6 rounded-full font-bold shadow-lg transition-all flex items-center justify-center gap-2 group
                ${isWin
                  ? 'bg-cyan-500 hover:bg-cyan-400 text-slate-900 shadow-cyan-500/30'
                  : 'bg-slate-600 hover:bg-slate-500 text-slate-200'
                }`}
            >
              <span className="group-hover:translate-x-1 transition-transform">BACK TO MENU</span>
              <ArrowRight size={20} />
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

// 小部品: スコアアイテム
const ScoreItem = ({ icon: Icon, label, value, sub, color }) => (
  <div className="flex flex-col">
    <div className="flex items-center gap-2 text-slate-400 text-xs font-bold mb-1 tracking-wider">
      <Icon size={14} />
      <span>{label}</span>
    </div>
    <div className="flex items-baseline gap-1">
      <span className={`font-mono font-bold text-2xl ${color}`}>{value}</span>
      {sub && <span className="text-slate-500 text-sm font-mono">{sub}</span>}
    </div>
  </div>
);

// 小部品: バッジ倍率表示
const BadgeMultiplier = ({ text, icon, color, multiplier }) => (
  <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg border border-white/5 hover:border-white/20 transition-all group">
    <div className="flex items-center gap-3">
      <span className="text-2xl">{icon}</span>
      <span className={`font-bold text-sm tracking-wider ${color}`}>
        {text}
      </span>
    </div>
    <div className="flex items-center gap-2">
      <span className={`text-xl font-['Orbitron'] font-black ${color} drop-shadow-[0_0_8px_currentColor] group-hover:scale-110 transition-transform`}>
        ×{multiplier}
      </span>
    </div>
  </div>
);
