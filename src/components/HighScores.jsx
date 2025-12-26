import { Trophy, Medal, ArrowLeft, Users, Clock, Shield, Coins } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { loadHighScores } from '../utils/highScores';
import GameBackground from './ui/GameBackground';
import GlassCard from './ui/GlassCard';

export default function HighScores({ onBack }) {
  const highScores = loadHighScores();

  return (
    <GameBackground className="flex flex-col items-center justify-start pt-6 px-3 md:px-6 pb-24 min-h-screen overflow-y-auto">
      {/* Header */}
      <div className="w-full max-w-5xl mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors mb-4"
        >
          <ArrowLeft size={18} />
          <span className="font-bold text-sm">BACK TO MENU</span>
        </button>

        <div className="flex items-center gap-4 mb-2">
          <Trophy size={38} className="text-yellow-400" />
          <h1 className="font-orbitron text-4xl font-black text-white">
            HIGH SCORES
          </h1>
        </div>
        <p className="text-slate-400 text-sm">Top 3 Records - All Difficulties</p>
      </div>

      {/* High Score List */}
      <div className="w-full max-w-5xl space-y-5">
        {highScores.length === 0 ? (
          <GlassCard className="p-10 text-center">
            <Trophy size={56} className="text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400 text-xl">まだ記録がありません。最初のミッションをクリアしましょう！</p>
          </GlassCard>
        ) : (
          highScores.map((entry, index) => (
            <HighScoreEntry key={entry.timestamp} entry={entry} index={index} />
          ))
        )}
      </div>
    </GameBackground>
  );
}

/**
 * ハイスコアエントリコンポーネント
 */
function HighScoreEntry({ entry, index }) {
  const rankColors = ['text-yellow-400', 'text-slate-300', 'text-orange-400'];
  const rankBgColors = ['bg-yellow-500/20', 'bg-slate-500/20', 'bg-orange-500/20'];
  const rankBorderColors = ['border-yellow-500/50', 'border-slate-500/50', 'border-orange-500/50'];

  const rankColor = rankColors[index] || 'text-slate-400';
  const rankBgColor = rankBgColors[index] || 'bg-slate-500/20';
  const rankBorderColor = rankBorderColors[index] || 'border-slate-500/50';

  const difficultyColor =
    entry.difficulty === 'EASY' ? 'text-green-400' :
      entry.difficulty === 'NORMAL' ? 'text-yellow-400' : 'text-red-400';

  const date = new Date(entry.timestamp);
  const dateStr = `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;

  return (
    <GlassCard className={`p-5 ${rankBorderColor} border-2 animate-slideUpFade`} style={{ animationDelay: `${index * 100}ms` }}>
      <div className="flex items-start gap-3 md:gap-5">
        {/* Rank Badge */}
        <div className={`flex-shrink-0 w-16 h-16 rounded-full ${rankBgColor} border-2 ${rankBorderColor} flex flex-col items-center justify-center`}>
          {index === 0 ? (
            <Trophy size={24} className={rankColor} />
          ) : (
            <Medal size={24} className={rankColor} />
          )}
          <span className={`text-xs font-bold ${rankColor} mt-1`}>RANK {entry.rank}</span>
        </div>

        {/* Main Info */}
        <div className="flex-1">
          {/* Score & Difficulty */}
          <div className="flex items-baseline justify-between mb-3">
            <div className="flex items-baseline gap-3">
              <h2 className="font-orbitron text-3xl font-black text-cyan-300">
                {entry.score.toLocaleString()}
              </h2>
              <span className={`text-sm font-bold px-2 py-1 rounded bg-slate-800/50 border border-white/10 ${difficultyColor}`}>
                {entry.difficulty}
              </span>
              <span className={`text-sm font-bold px-2 py-1 rounded ${entry.isVictory ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50' : 'bg-rose-500/20 text-rose-300 border border-rose-500/50'}`}>
                {entry.isVictory ? 'VICTORY' : 'DEFEAT'}
              </span>
            </div>
            <span className="text-slate-500 text-xs font-mono">{dateStr}</span>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4 mb-4">
            <StatItem icon={Users} label="Evacuated" value={`${entry.stats.evacuated}/${entry.stats.goal}`} />
            <StatItem icon={Shield} label="HP" value={`${entry.stats.hp}%`} />
            <StatItem
              icon={Clock}
              label="Remaining Time"
              value={`${Math.floor((entry.stats.clearTime ? (5400 - entry.stats.clearTime) / 60 : 0))}s`}
            />
            <StatItem
              icon={Coins}
              label="Remaining Cost"
              value={`${entry.stats.cost || 0}`}
            />
          </div>

          {/* Used Deck */}
          <div className="border-t border-white/10 pt-3">
            <div className="text-slate-400 text-xs font-bold mb-2 uppercase tracking-wider">Used Equipment</div>
            <div className="flex gap-2 flex-wrap">
              {entry.usedDeck.map((card, idx) => {
                // アイコン名からlucide-reactアイコンを取得
                const IconComponent = LucideIcons[card.iconName] || LucideIcons.Shield;

                return (
                  <div
                    key={idx}
                    className="flex items-center gap-1 bg-slate-800/50 border border-white/10 rounded px-1.5 md:px-2 py-0.5 md:py-1"
                  >
                    <IconComponent size={10} className="text-cyan-400" />
                    <span className="text-white text-[10px] md:text-xs">{card.name}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </GlassCard>
  );
}

/**
 * 統計アイテム
 */
function StatItem({ icon: Icon, label, value }) {
  return (
    <div className="flex flex-col">
      <div className="flex items-center gap-1 text-slate-400 text-xs mb-1">
        {Icon && <Icon size={12} />}
        <span>{label}</span>
      </div>
      <span className="text-white font-mono font-bold text-base">{value}</span>
    </div>
  );
}
