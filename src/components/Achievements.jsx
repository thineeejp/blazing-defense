import { Lock } from 'lucide-react';
import { loadAchievements, getAchievementProgress } from '../utils/achievements';
import { ACHIEVEMENTS, RARITY_STYLES } from '../constants/achievements';
import GameBackground from './ui/GameBackground';
import GlassCard from './ui/GlassCard';

/**
 * 実績一覧画面
 * - 12実績をグリッドレイアウトで表示
 * - 解除/未解除の視覚的差異
 * - レアリティ別スタイリング（common/rare/epic）
 */
export default function Achievements({ onBack }) {
  const data = loadAchievements();
  const progress = getAchievementProgress();

  return (
    <GameBackground className="flex flex-col items-center justify-start pt-6 px-6 pb-24 h-screen overflow-y-auto">
      {/* ヘッダー */}
      <div className="w-full max-w-5xl mb-6">
        <button
          onClick={onBack}
          className="mb-4 px-4 py-2 bg-slate-800/80 hover:bg-slate-700 text-white font-bold rounded-lg transition-colors border border-white/10"
        >
          ← BACK
        </button>

        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="font-orbitron text-4xl font-black text-white mb-2">
              ACHIEVEMENTS
            </h1>
            <p className="text-slate-400 text-sm">
              ゲーム内で解除できる称号一覧
            </p>
          </div>

          {/* 達成率表示 */}
          <div className="text-right">
            <div className="text-3xl font-orbitron font-black text-cyan-300">
              {progress.percentage}%
            </div>
            <div className="text-slate-400 text-sm">
              {progress.unlocked} / {progress.total} 解除済み
            </div>
          </div>
        </div>

        {/* プログレスバー */}
        <div className="w-full h-3 bg-slate-800/50 rounded-full overflow-hidden border border-white/10">
          <div
            className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-1000"
            style={{ width: `${progress.percentage}%` }}
          />
        </div>
      </div>

      {/* 実績グリッド */}
      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {ACHIEVEMENTS.map((achievement, index) => {
          const isUnlocked = data.achievements[achievement.id]?.unlocked || false;
          const unlockedAt = data.achievements[achievement.id]?.unlockedAt;

          return (
            <AchievementCard
              key={achievement.id}
              achievement={achievement}
              isUnlocked={isUnlocked}
              unlockedAt={unlockedAt}
              index={index}
            />
          );
        })}
      </div>
    </GameBackground>
  );
}

/**
 * 実績カードコンポーネント
 */
function AchievementCard({ achievement, isUnlocked, unlockedAt, index }) {
  const rarity = RARITY_STYLES[achievement.rarity] || RARITY_STYLES.common;
  const Icon = achievement.icon;

  // 未解除の場合はロックアイコンと暗い表示
  const unlockDate = unlockedAt
    ? new Date(unlockedAt).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    })
    : null;

  return (
    <GlassCard
      className={`
        relative p-5 transition-all duration-300
        ${isUnlocked ? `${rarity.border} ${rarity.glow} border-2` : 'border border-slate-700 opacity-60'}
        animate-slideUpFade
      `}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      {/* レアリティバッジ */}
      <div
        className={`
          absolute top-3 right-3 px-2 py-1 rounded text-xs font-bold uppercase
          ${rarity.bg} ${rarity.text} border ${rarity.border}
        `}
      >
        {achievement.rarity}
      </div>

      {/* アイコン */}
      <div className="flex items-center justify-center mb-4">
        <div
          className={`
            w-16 h-16 rounded-full flex items-center justify-center
            ${isUnlocked ? rarity.bg : 'bg-slate-800/50'}
            ${isUnlocked ? rarity.border : 'border-slate-700'}
            border-2
          `}
        >
          {isUnlocked ? (
            <Icon
              size={32}
              className={isUnlocked ? rarity.text : 'text-slate-600'}
            />
          ) : (
            <Lock size={32} className="text-slate-600" />
          )}
        </div>
      </div>

      {/* タイトル */}
      <h3
        className={`
          text-lg font-bold text-center mb-2
          ${isUnlocked ? 'text-white' : 'text-slate-500'}
        `}
      >
        {isUnlocked ? achievement.name : '???'}
      </h3>

      {/* 説明 */}
      <p
        className={`
          text-xs text-center mb-3
          ${isUnlocked ? 'text-slate-300' : 'text-slate-600'}
        `}
      >
        {isUnlocked ? achievement.description : 'この実績はまだ解除されていません'}
      </p>

      {/* 解除日時 */}
      {isUnlocked && unlockDate && (
        <div className="text-center text-xs text-slate-500 border-t border-white/10 pt-3">
          解除日: {unlockDate}
        </div>
      )}

      {/* 未解除エフェクト */}
      {!isUnlocked && (
        <div className="absolute inset-0 bg-slate-900/40 rounded-xl pointer-events-none" />
      )}
    </GlassCard>
  );
}
