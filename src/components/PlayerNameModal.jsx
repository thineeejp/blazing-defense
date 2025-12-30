import { useState, useEffect, useRef } from 'react';
import { Trophy, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { isValidPlayerName, loadPlayerName } from '../utils/playerName';

/**
 * プレイヤー名入力モーダル
 * ハイスコア更新時に表示される
 */
export default function PlayerNameModal({ isOpen, score, onSubmit, onSkip }) {
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  // モーダルが開いたときにフォーカスと初期値設定
  useEffect(() => {
    if (isOpen) {
      const savedName = loadPlayerName();
      if (savedName) {
        setName(savedName);
      }
      setError('');
      // フォーカスを遅延させる（アニメーション完了後）
      setTimeout(() => {
        inputRef.current?.focus();
      }, 300);
    }
  }, [isOpen]);

  const handleInputChange = (e) => {
    const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 5);
    setName(value);
    setError('');
  };

  const handleSubmit = () => {
    if (!isValidPlayerName(name)) {
      setError('半角英数1〜5文字で入力してください');
      return;
    }
    onSubmit(name);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && isValidPlayerName(name)) {
      handleSubmit();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          {/* オーバーレイ */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
            onClick={onSkip}
          />

          {/* モーダル */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-md bg-gradient-to-br from-slate-800/90 to-slate-900/90 border border-white/20 rounded-2xl shadow-2xl backdrop-blur-xl overflow-hidden"
          >
            {/* 光の反射エフェクト */}
            <div className="absolute top-0 -left-full w-1/2 h-full bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-12 animate-[shimmer_3s_infinite]" />

            {/* 閉じるボタン */}
            <button
              onClick={onSkip}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-full transition-colors"
            >
              <X size={20} />
            </button>

            {/* コンテンツ */}
            <div className="relative p-8">
              {/* ヘッダー */}
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-yellow-500/20 to-amber-500/20 border border-yellow-500/50 rounded-full mb-4">
                  <Trophy size={32} className="text-yellow-400" />
                </div>
                <h2 className="text-2xl font-black text-white font-orbitron tracking-wide">
                  NEW HIGH SCORE!
                </h2>
                <div className="text-3xl font-bold text-cyan-400 font-mono mt-2">
                  {score?.toLocaleString()} pts
                </div>
              </div>

              {/* 入力フォーム */}
              <div className="mb-6">
                <label className="block text-slate-300 text-sm font-bold mb-2 text-center">
                  プレイヤー名を入力してください
                </label>
                <p className="text-slate-500 text-xs text-center mb-4">
                  半角英数1〜5文字
                </p>

                <div className="relative">
                  <input
                    ref={inputRef}
                    type="text"
                    value={name}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    maxLength={5}
                    placeholder="ABCDE"
                    className={`
                      w-full text-center text-3xl font-mono font-bold tracking-[0.5em] py-4 px-6
                      bg-slate-900/50 border-2 rounded-xl outline-none transition-all
                      ${error
                        ? 'border-red-500 text-red-400'
                        : 'border-slate-600 focus:border-cyan-500 text-white'
                      }
                    `}
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 text-sm font-mono">
                    {name.length}/5
                  </div>
                </div>

                {error && (
                  <p className="text-red-400 text-xs text-center mt-2">{error}</p>
                )}
              </div>

              {/* ボタン */}
              <div className="flex gap-3">
                <button
                  onClick={onSkip}
                  className="flex-1 py-3 px-4 rounded-lg bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 font-bold transition-colors border border-slate-600"
                >
                  SKIP
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={name.length === 0}
                  className={`
                    flex-1 py-3 px-4 rounded-lg font-bold transition-all
                    ${name.length > 0
                      ? 'bg-cyan-500 hover:bg-cyan-400 text-slate-900 shadow-lg shadow-cyan-500/30'
                      : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                    }
                  `}
                >
                  SUBMIT
                </button>
              </div>

              {/* SKIP説明 */}
              <p className="text-slate-500 text-xs text-center mt-4">
                ※SKIPすると、このスコアはグローバルランキングに登録されません
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
