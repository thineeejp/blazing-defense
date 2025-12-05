// ハイスコア管理ユーティリティ

const STORAGE_KEY = 'BLAZING_DEFENSE_HIGH_SCORES';

/**
 * ハイスコアを読み込む
 * @returns {Array} ハイスコアリスト（最大3件）
 */
export function loadHighScores() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    const parsed = JSON.parse(data);
    return parsed.highScores || [];
  } catch (error) {
    console.error('Failed to load high scores:', error);
    return [];
  }
}

/**
 * ハイスコアを保存する
 * @param {Array} scores - ハイスコアリスト
 */
export function saveHighScores(scores) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ highScores: scores }));
  } catch (error) {
    console.error('Failed to save high scores:', error);
  }
}

/**
 * 新しいスコアがトップ3に入るか判定
 * @param {number} newScore - 新しいスコア
 * @returns {boolean} トップ3に入る場合true
 */
export function isHighScore(newScore) {
  const scores = loadHighScores();
  if (scores.length < 3) return true; // 3件未満なら必ず追加
  return newScore > scores[scores.length - 1].score; // 最低スコアより高いか
}

/**
 * 新しいスコアをランキングに追加
 * @param {Object} scoreEntry - スコアエントリ
 * @returns {Object} { isNewHighScore: boolean, rank: number }
 */
export function addHighScore(scoreEntry) {
  const scores = loadHighScores();

  // 新しいスコアを追加
  scores.push(scoreEntry);

  // スコアでソート（降順）
  scores.sort((a, b) => b.score - a.score);

  // トップ3のみ保持
  const topScores = scores.slice(0, 3);

  // 順位を更新
  topScores.forEach((entry, index) => {
    entry.rank = index + 1;
  });

  // 保存
  saveHighScores(topScores);

  // 新しいスコアの順位を取得
  const rank = topScores.findIndex(s => s.timestamp === scoreEntry.timestamp) + 1;

  return {
    isNewHighScore: rank > 0 && rank <= 3,
    rank: rank
  };
}

/**
 * デッキをシリアライズ（アイコンを文字列化）
 * @param {Object} deck - デッキオブジェクト
 * @returns {Array} シリアライズされたカード配列
 */
export function serializeDeck(deck) {
  return Object.values(deck).map(card => ({
    id: card.id,
    name: card.name,
    iconName: card.icon?.name || 'Shield', // lucide-reactアイコンの名前を取得
  }));
}
