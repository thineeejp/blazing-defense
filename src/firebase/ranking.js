// Firestoreランキング操作

import {
  collection,
  doc,
  getDoc,
  setDoc,
  getDocs,
  query,
  orderBy,
  serverTimestamp
} from 'firebase/firestore';
import { db } from './config';

const RANKINGS_COLLECTION = 'rankings';

/**
 * 全ランキングを取得（スコア降順）
 * @returns {Promise<Array>} { uid, playerName, score, difficulty, isVictory, ... } の配列
 */
export async function fetchAllRankings() {
  try {
    const q = query(
      collection(db, RANKINGS_COLLECTION),
      orderBy('score', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      uid: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Failed to fetch rankings:', error);
    return [];
  }
}

/**
 * 特定プレイヤーのスコアを取得
 * @param {string} uid
 * @returns {Promise<Object|null>}
 */
export async function fetchPlayerScore(uid) {
  try {
    const docRef = doc(db, RANKINGS_COLLECTION, uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return { uid, ...docSnap.data() };
    }
    return null;
  } catch (error) {
    console.error('Failed to fetch player score:', error);
    return null;
  }
}

/**
 * スコアを送信（新規登録または更新）
 * ハイスコア更新時のみFirestoreに書き込む
 * @param {string} uid
 * @param {Object} scoreData - { playerName, score, difficulty, isVictory }
 * @returns {Promise<{ success: boolean, isNewHighScore: boolean, error?: string }>}
 */
export async function submitScore(uid, scoreData) {
  try {
    const docRef = doc(db, RANKINGS_COLLECTION, uid);
    const existing = await getDoc(docRef);

    if (existing.exists()) {
      const existingData = existing.data();
      // 既存スコアより高い場合のみ更新
      if (scoreData.score > existingData.score) {
        await setDoc(docRef, {
          playerName: scoreData.playerName,
          score: scoreData.score,
          difficulty: scoreData.difficulty,
          isVictory: scoreData.isVictory,
          createdAt: existingData.createdAt, // 初回登録日時を維持
          updatedAt: serverTimestamp()
        });
        return { success: true, isNewHighScore: true };
      }
      // スコアが低いか同じ場合は更新しない
      return { success: true, isNewHighScore: false };
    } else {
      // 新規登録
      await setDoc(docRef, {
        playerName: scoreData.playerName,
        score: scoreData.score,
        difficulty: scoreData.difficulty,
        isVictory: scoreData.isVictory,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return { success: true, isNewHighScore: true };
    }
  } catch (error) {
    console.error('Failed to submit score:', error);
    return { success: false, isNewHighScore: false, error: error.message };
  }
}
