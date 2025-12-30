// 匿名認証ヘルパー

import { signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { auth } from './config';

/**
 * 匿名認証を実行し、UIDを取得
 * 既にログイン済みの場合はそのUIDを返す
 * @returns {Promise<string>} UID
 */
export async function ensureAnonymousAuth() {
  return new Promise((resolve, reject) => {
    // 現在の認証状態を確認
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      unsubscribe(); // リスナーを解除

      if (user) {
        // 既にログイン済み
        resolve(user.uid);
      } else {
        // 匿名認証を実行
        try {
          const result = await signInAnonymously(auth);
          resolve(result.user.uid);
        } catch (error) {
          console.error('匿名認証に失敗しました:', error);
          reject(error);
        }
      }
    });
  });
}

/**
 * 現在のUIDを取得（未ログインならnull）
 * @returns {string|null}
 */
export function getCurrentUid() {
  return auth.currentUser?.uid || null;
}
