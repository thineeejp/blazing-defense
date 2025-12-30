import { useState, useEffect, useCallback } from 'react';
import { Globe, ArrowLeft, Loader2 } from 'lucide-react';
import GameBackground from './ui/GameBackground';
import GlassCard from './ui/GlassCard';
import { fetchAllRankings } from '../firebase/ranking';
import { calculateRankings, calculateTopPercent } from '../utils/rateCalculator';

/**
 * グローバルランキング画面
 */
export default function Ranking({ onBack, uid }) {
  const [rankings, setRankings] = useState([]);
  const [myRank, setMyRank] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalPlayers, setTotalPlayers] = useState(0);

  // ランキングデータを取得
  const loadRankings = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const allScores = await fetchAllRankings();
      setTotalPlayers(allScores.length);

      if (allScores.length === 0) {
        setRankings([]);
        setMyRank(null);
        return;
      }

      // レート・順位を計算
      const rankedData = calculateRankings(allScores);

      // 上位20件を表示用に取得
      setRankings(rankedData.slice(0, 20));

      // 自分の順位を取得
      if (uid) {
        const me = rankedData.find(r => r.uid === uid);
        setMyRank(me || null);
      }
    } catch (err) {
      console.error('Failed to load rankings:', err);
      setError('ランキングの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  }, [uid]);

  useEffect(() => {
    loadRankings();
  }, [loadRankings]);

  return (
    <GameBackground className="flex flex-col items-center justify-start pt-6 px-3 md:px-6 pb-24 min-h-screen overflow-y-auto">
      {/* Header */}
      <div className="w-full max-w-3xl mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors mb-4"
        >
          <ArrowLeft size={18} />
          <span className="font-bold text-sm">BACK TO GALLERY</span>
        </button>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Globe size={38} className="text-cyan-400" />
            <div>
              <h1 className="font-orbitron text-3xl md:text-4xl font-black text-white">
                GLOBAL RANKING
              </h1>
              <p className="text-slate-400 text-sm">
                {totalPlayers > 0 ? `${totalPlayers} Players` : 'Loading...'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* コンテンツ */}
      <div className="w-full max-w-3xl space-y-4">
        {loading ? (
          <GlassCard className="p-12 text-center">
            <Loader2 size={48} className="text-cyan-400 mx-auto animate-spin mb-4" />
            <p className="text-slate-400">ランキングを読み込み中...</p>
          </GlassCard>
        ) : error ? (
          <GlassCard className="p-12 text-center">
            <p className="text-red-400 mb-4">{error}</p>
            <button
              onClick={loadRankings}
              className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-bold rounded-lg transition-colors"
            >
              再読み込み
            </button>
          </GlassCard>
        ) : rankings.length === 0 ? (
          <GlassCard className="p-12 text-center">
            <Globe size={56} className="text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400 text-lg">まだランキングに誰も登録されていません</p>
            <p className="text-slate-500 text-sm mt-2">最初のプレイヤーになりましょう！</p>
          </GlassCard>
        ) : (
          <>
            {/* ランキングリスト */}
            <GlassCard className="p-4 md:p-6">
              <div className="space-y-2">
                {rankings.map((player, index) => (
                  <RankingEntry
                    key={player.uid}
                    player={player}
                    isMe={uid && player.uid === uid}
                    delay={index * 30}
                  />
                ))}
              </div>
            </GlassCard>

            {/* 自分の順位（20位圏外の場合） */}
            {myRank && myRank.rank > 20 && (
              <GlassCard className="p-4 md:p-6 border-2 border-cyan-500/50">
                <div className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-3">
                  YOUR RANK
                </div>
                <RankingEntry player={myRank} isMe={true} />
                <div className="text-center text-slate-500 text-sm mt-3">
                  {totalPlayers}人中 上位{calculateTopPercent(myRank.rank, totalPlayers)}%
                </div>
              </GlassCard>
            )}

            {/* 自分が未登録の場合 */}
            {uid && !myRank && (
              <GlassCard className="p-4 md:p-6 border border-slate-600">
                <div className="text-center">
                  <p className="text-slate-400 text-sm">
                    あなたはまだランキングに登録されていません
                  </p>
                  <p className="text-slate-500 text-xs mt-1">
                    ハイスコア更新時にプレイヤー名を登録するとランキングに参加できます
                  </p>
                </div>
              </GlassCard>
            )}

            {/* レート説明 */}
            <div className="text-center text-slate-500 text-xs space-y-1 pt-4">
              <p>レート = 順位(80%) + スコア(20%)</p>
              <p>他のプレイヤーに抜かれると順位・レートが下がります</p>
            </div>
          </>
        )}
      </div>
    </GameBackground>
  );
}

/**
 * ランキングエントリ
 */
function RankingEntry({ player, isMe, delay = 0 }) {
  const { rank, playerName, score, rate, tier } = player;

  // 順位に応じたスタイル
  const getRankStyle = () => {
    if (rank === 1) return 'bg-yellow-500/20 border-yellow-500/50 text-yellow-400';
    if (rank === 2) return 'bg-slate-400/20 border-slate-400/50 text-slate-300';
    if (rank === 3) return 'bg-orange-500/20 border-orange-500/50 text-orange-400';
    return 'bg-slate-700/50 border-slate-600/50 text-slate-400';
  };

  return (
    <div
      className={`
        flex items-center gap-3 md:gap-4 p-3 md:p-4 rounded-xl transition-all
        ${isMe
          ? 'bg-cyan-500/10 border border-cyan-500/50'
          : 'bg-slate-800/30 hover:bg-slate-700/30'
        }
        animate-slideUpFade
      `}
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* 順位 */}
      <div className={`
        flex-shrink-0 w-10 h-10 md:w-12 md:h-12 rounded-full border-2 flex items-center justify-center font-bold text-sm md:text-base
        ${getRankStyle()}
      `}>
        #{rank}
      </div>

      {/* 称号・名前 */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-lg md:text-xl">{tier.emoji}</span>
          <span className={`font-bold text-base md:text-lg ${isMe ? 'text-cyan-300' : 'text-white'}`}>
            {playerName}
          </span>
          {isMe && (
            <span className="text-[10px] px-2 py-0.5 bg-cyan-500/30 text-cyan-300 rounded-full font-bold">
              YOU
            </span>
          )}
        </div>
        <div className={`text-xs ${tier.color} font-bold`}>
          {tier.name}
        </div>
      </div>

      {/* スコア */}
      <div className="text-right">
        <div className="font-mono font-bold text-base md:text-lg text-white">
          {score.toLocaleString()}
        </div>
        <div className="text-cyan-400 text-xs md:text-sm font-bold">
          ★{rate}
        </div>
      </div>
    </div>
  );
}
