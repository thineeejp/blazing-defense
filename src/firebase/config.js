// Firebase設定・初期化

import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: 'AIzaSyAdkylfh-FSN4ChzPmw_Ck5jPcDwV6Ttqw',
  authDomain: 'blazing-defense.firebaseapp.com',
  projectId: 'blazing-defense',
  storageBucket: 'blazing-defense.firebasestorage.app',
  messagingSenderId: '19668192274',
  appId: '1:19668192274:web:e2234b1a3f49822bc09ccb'
};

// Firebase初期化
const app = initializeApp(firebaseConfig);

// Firestore
export const db = getFirestore(app);

// Auth
export const auth = getAuth(app);

export default app;
