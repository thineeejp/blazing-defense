// プレイヤー名のlocalStorage管理

const PLAYER_NAME_KEY = 'BLAZING_DEFENSE_PLAYER_NAME';

/**
 * プレイヤー名を取得
 * @returns {string|null}
 */
export function loadPlayerName() {
  try {
    return localStorage.getItem(PLAYER_NAME_KEY);
  } catch {
    return null;
  }
}

/**
 * プレイヤー名を保存
 * @param {string} name
 */
export function savePlayerName(name) {
  try {
    localStorage.setItem(PLAYER_NAME_KEY, name);
  } catch (error) {
    console.error('Failed to save player name:', error);
  }
}

/**
 * プレイヤー名のバリデーション
 * 半角英数1〜5文字を許可
 * @param {string} name
 * @returns {boolean}
 */
export function isValidPlayerName(name) {
  return /^[A-Za-z0-9]{1,5}$/.test(name);
}
