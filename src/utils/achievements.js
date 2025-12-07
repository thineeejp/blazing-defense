// 実績管理ユーティリティ
import { ACHIEVEMENTS } from '../constants/achievements';
import { ALL_CARDS } from '../constants/cards';

const STORAGE_KEY = 'BLAZING_DEFENSE_ACHIEVEMENTS';

/**
 * 初期データ構造を生成
 * @returns {Object} 初期化された実績データ
 */
function getInitialData() {
  const achievements = {};
  ACHIEVEMENTS.forEach(ach => {
    achievements[ach.id] = {
      unlocked: false,
      unlockedAt: null,
    };
  });

  return {
    version: '1.0',
    achievements,
    stats: {
      victoriesByDifficulty: { EASY: 0, NORMAL: 0, HARD: 0 },
      usedCards: [], // 累計使用カードIDの配列
    },
    meta: {
      totalAchievementsUnlocked: 0,
      totalAchievements: ACHIEVEMENTS.length,
      lastPlayedAt: null,
    },
  };
}

/**
 * 実績データを読み込む
 * @returns {Object} 実績データ
 */
export function loadAchievements() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return getInitialData();

    const parsed = JSON.parse(data);

    // バージョンチェック（将来のマイグレーション用）
    if (parsed.version !== '1.0') {
      console.warn('Unknown achievements data version, resetting...');
      return getInitialData();
    }

    // マイグレーション: usedCards が存在しない場合の対応
    if (!parsed.stats.usedCards) {
      parsed.stats.usedCards = [];
    }

    return parsed;
  } catch (error) {
    console.error('Failed to load achievements:', error);
    return getInitialData();
  }
}

/**
 * 実績データを保存する
 * @param {Object} data - 実績データ
 */
export function saveAchievements(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save achievements:', error);
  }
}

/**
 * ゲーム統計を更新する（勝利時のみ呼び出し）
 * @param {string} difficulty - 難易度（'EASY'/'NORMAL'/'HARD'）
 */
export function updateGameStats(difficulty) {
  const data = loadAchievements();
  data.stats.victoriesByDifficulty[difficulty]++;
  data.meta.lastPlayedAt = Date.now();
  saveAchievements(data);
}

/**
 * 使用カード履歴を更新する
 * @param {Object|Array} deck - デッキオブジェクトまたは配列
 */
export function trackUsedCards(deck) {
  const data = loadAchievements();
  const usedCards = new Set(data.stats.usedCards || []);

  // deckがオブジェクトの場合は配列に変換
  const deckArray = Array.isArray(deck) ? deck : Object.values(deck);

  deckArray.forEach(card => {
    usedCards.add(card.id);
  });

  data.stats.usedCards = Array.from(usedCards);
  saveAchievements(data);
}

/**
 * 実績をチェックして解除する
 * @param {Object} gameResult - ゲーム結果オブジェクト
 * @param {boolean} gameResult.isVictory - 勝利したか
 * @param {string} gameResult.difficulty - 難易度
 * @param {Object} gameResult.stats - 統計（hp, evacuated, goal等）
 * @param {number} gameResult.score - スコア
 * @param {number} gameResult.cost - 終了時コスト
 * @param {number} gameResult.deckSize - デッキサイズ
 * @param {boolean} gameResult.usedAllCards - 全22種類使用したか
 * @param {boolean} gameResult.noTier3Used - Tier3未使用か
 * @returns {Array} 新規解除された実績のリスト
 */
export function checkAchievements(gameResult) {
  const data = loadAchievements();
  const newlyUnlocked = [];

  ACHIEVEMENTS.forEach(ach => {
    // 既に解除済みならスキップ
    if (data.achievements[ach.id]?.unlocked) return;

    let shouldUnlock = false;

    switch (ach.id) {
      case 'perfect_defense':
        // ノーマル以上でHP100%維持してクリア
        shouldUnlock =
          gameResult.isVictory &&
          gameResult.stats.hp === 100 &&
          gameResult.difficulty !== 'EASY';
        break;

      case 'fortress':
        // ハードでHP100%維持してクリア
        shouldUnlock =
          gameResult.isVictory &&
          gameResult.stats.hp === 100 &&
          gameResult.difficulty === 'HARD';
        break;

      case 'all_difficulty_clear':
        // 全難易度でクリア（現在の難易度クリアをカウントに含める）
        {
          const easyCleared = data.stats.victoriesByDifficulty.EASY > 0 ||
                              (gameResult.isVictory && gameResult.difficulty === 'EASY');
          const normalCleared = data.stats.victoriesByDifficulty.NORMAL > 0 ||
                                (gameResult.isVictory && gameResult.difficulty === 'NORMAL');
          const hardCleared = data.stats.victoriesByDifficulty.HARD > 0 ||
                              (gameResult.isVictory && gameResult.difficulty === 'HARD');
          shouldUnlock = easyCleared && normalCleared && hardCleared;
        }
        break;

      case 'high_score':
        // 77777点以上でクリア
        shouldUnlock = gameResult.isVictory && gameResult.score >= 77777;
        break;

      case 'complete_victory':
        // ハードでHP100%＋避難達成
        shouldUnlock =
          gameResult.isVictory &&
          gameResult.difficulty === 'HARD' &&
          gameResult.stats.hp === 100 &&
          gameResult.stats.evacuated >= gameResult.stats.goal;
        break;

      case 'tycoon':
        // コスト2000以上でクリア
        shouldUnlock = gameResult.isVictory && gameResult.cost >= 2000;
        break;

      case 'economist':
        // ノーマル以上でカード3枚以下でクリア
        shouldUnlock =
          gameResult.isVictory &&
          gameResult.difficulty !== 'EASY' &&
          gameResult.deckSize <= 3;
        break;

      case 'complete_collection':
        // 全22種類のカードをデッキに入れる
        shouldUnlock = gameResult.usedAllCards === true;
        break;

      case 'handicap':
        // Tier3未使用でハードクリア
        shouldUnlock =
          gameResult.isVictory &&
          gameResult.difficulty === 'HARD' &&
          gameResult.noTier3Used === true;
        break;

      case 'first_clear_easy':
      case 'first_clear_normal':
      case 'first_clear_hard':
        // 各難易度の初回クリア
        {
          const diff = ach.id.replace('first_clear_', '').toUpperCase();
          shouldUnlock =
            gameResult.isVictory &&
            gameResult.difficulty === diff &&
            data.stats.victoriesByDifficulty[diff] === 0;
        }
        break;

      default:
        break;
    }

    if (shouldUnlock) {
      data.achievements[ach.id].unlocked = true;
      data.achievements[ach.id].unlockedAt = Date.now();
      data.meta.totalAchievementsUnlocked++;
      newlyUnlocked.push(ach);
    }
  });

  saveAchievements(data);
  return newlyUnlocked;
}

/**
 * 実績の達成率を取得
 * @returns {Object} { unlocked: 解除数, total: 総数, percentage: 達成率 }
 */
export function getAchievementProgress() {
  const data = loadAchievements();
  return {
    unlocked: data.meta.totalAchievementsUnlocked,
    total: data.meta.totalAchievements,
    percentage: Math.round(
      (data.meta.totalAchievementsUnlocked / data.meta.totalAchievements) * 100
    ),
  };
}

/**
 * デッキから実績判定用のデータを計算
 * @param {Object} deck - デッキオブジェクト
 * @returns {Object} { deckSize, usedAllCards, noTier3Used }
 */
export function analyzeDeck(deck) {
  const data = loadAchievements();
  const deckArray = Object.values(deck);
  const deckSize = deckArray.length;

  // 全21種類のカードを累計で使用したか（fireEngineは変身カードなので除外）
  const totalCards = Object.keys(ALL_CARDS).filter(id => id !== 'fireEngine').length;
  const usedAllCards = data.stats.usedCards.length >= totalCards;

  // Tier3未使用か
  const noTier3Used = deckArray.every(card => card.tier !== 3);

  return {
    deckSize,
    usedAllCards,
    noTier3Used,
  };
}
