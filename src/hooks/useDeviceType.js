import { useState, useEffect } from 'react';

/**
 * デバイスタイプを検出するカスタムフック
 * @returns {{ isMobile: boolean, isTouchDevice: boolean }}
 */
export function useDeviceType() {
  // SSR/テスト環境でのクラッシュ防止：遅延評価
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth < 768 : false
  );
  const [isTouchDevice, setIsTouchDevice] = useState(() =>
    typeof window !== 'undefined'
      ? 'ontouchstart' in window || navigator.maxTouchPoints > 0
      : false
  );

  useEffect(() => {
    // クライアントサイドでのみ実行
    const checkDevice = () => {
      setIsMobile(window.innerWidth < 768);
      setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);
    };

    checkDevice();
    window.addEventListener('resize', checkDevice);
    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  return { isMobile, isTouchDevice };
}
