// レート計算ユーティリティ（ハイブリッド方式）
// レート = 1000 + 順位ポイント×8 + スコアボーナス×2

/**
 * 称号定義
 */
export const RATE_TIERS = [
  { min: 2000, name: 'MASTER',   emoji: '👑', color: 'text-yellow-400' },
  { min: 1900, name: 'DIAMOND',  emoji: '💠', color: 'text-cyan-300' },
  { min: 1800, name: 'PLATINUM', emoji: '💎', color: 'text-purple-300' },
  { min: 1700, name: 'GOLD',     emoji: '🥇', color: 'text-yellow-500' },
  { min: 1500, name: 'SILVER',   emoji: '🥈', color: 'text-slate-300' },
  { min: 0,    name: 'BRONZE',   emoji: '🥉', color: 'text-amber-600' },
];

/**
 * レートから称号を取得
 * @param {number} rate
 * @returns {Object} { min, name, emoji, color }
 */
export function getRateTier(rate) {
  return RATE_TIERS.find(tier => rate >= tier.min) || RATE_TIERS[RATE_TIERS.length - 1];
}

/**
 * レートを計算
 * @param {number} rank - 順位（1始まり）
 * @param {number} totalPlayers - 全プレイヤー数
 * @param {number} score - スコア
 * @returns {number} レート
 */
export function calculateRate(rank, totalPlayers, score) {
  // 順位ポイント: パーセンタイル × 100 (上限800)
  const rankPercentile = totalPlayers <= 1
    ? 100
    : ((totalPlayers - rank) / (totalPlayers - 1)) * 100;

  // スコアボーナス: 上限なし
  // 0点 = 0, 100,000点 = 100, 200,000点 = 200...
  const SCORE_SCALE = 1000; // 1,000点ごとに+1ボーナス
  const scoreBonus = score / SCORE_SCALE;

  return Math.round(1000 + rankPercentile * 8 + scoreBonus * 2);
}

/**
 * 全プレイヤーのランキングを計算（同点処理対応）
 * @param {Array} allScores - { uid, playerName, score, ... } の配列
 * @returns {Array} { uid, playerName, score, rank, rate, tier, ... } の配列
 */
export function calculateRankings(allScores) {
  // スコア降順ソート
  const sorted = [...allScores].sort((a, b) => b.score - a.score);
  const total = sorted.length;

  return sorted.map((player) => {
    // 同点処理: rank = 1 + count(score > myScore)
    const rank = 1 + sorted.filter(p => p.score > player.score).length;
    const rate = calculateRate(rank, total, player.score);
    const tier = getRateTier(rate);
    return { ...player, rank, rate, tier };
  });
}

/**
 * 特定プレイヤーの順位・レートを取得
 * @param {Array} allScores - 全プレイヤーのスコア配列
 * @param {string} myUid - 対象プレイヤーのUID
 * @returns {Object|null} { rank, rate, tier, ... } または null
 */
export function findMyRank(allScores, myUid) {
  const rankings = calculateRankings(allScores);
  return rankings.find(r => r.uid === myUid) || null;
}

/**
 * 上位パーセンテージを計算
 * @param {number} rank - 順位
 * @param {number} total - 全員数
 * @returns {number} 上位何%か（小数点1桁）
 */
export function calculateTopPercent(rank, total) {
  if (total === 0) return 0;
  return Math.round((rank / total) * 1000) / 10;
}
