import { useState, useEffect } from 'react';
import { Play, AlertTriangle, Award, Sword, HelpCircle, X, Flame, Bell, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import GameBackground from './ui/GameBackground';
import GlassCard from './ui/GlassCard';

export default function Menu({ missions, onStartBattle, onShowGallery, isFirstLaunch }) {
  const [showContent, setShowContent] = useState(!isFirstLaunch);
  const [menuMode, setMenuMode] = useState('main'); // 'main' | 'battle'
  const [showHowToPlay, setShowHowToPlay] = useState(false);

  useEffect(() => {
    if (isFirstLaunch) {
      const timer = setTimeout(() => setShowContent(true), 1500);
      return () => clearTimeout(timer);
    }
  }, [isFirstLaunch]);

  return (
    <GameBackground className="flex flex-col items-center justify-center p-4">
      {/* Boot Animation Overlay */}
      <AnimatePresence>
        {isFirstLaunch && !showContent && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.1, filter: 'blur(10px)' }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0 z-50 flex items-center justify-center bg-slate-950 text-cyan-500 font-mono"
          >
            <div className="text-center">
              <div className="text-2xl mb-4">INITIALIZING DEFENSE SYSTEM...</div>
              <div className="w-64 h-2 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-cyan-500 animate-pulse" style={{ width: '70%' }}></div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Menu Content */}
      {showContent && (
        <>
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-center mb-12"
          >
            <h1 className="
              font-orbitron text-6xl md:text-8xl font-black italic tracking-tighter
              text-transparent bg-clip-text bg-gradient-to-b from-white via-cyan-200 to-cyan-500
              drop-shadow-[0_0_30px_rgba(6,182,212,0.6)]
              mb-4 pr-4
            ">
              BLAZING
              <span className="block text-4xl md:text-6xl text-transparent bg-clip-text bg-gradient-to-b from-red-400 to-red-600 drop-shadow-[0_0_30px_rgba(220,38,38,0.6)]">
                DEFENSE
              </span>
            </h1>
            <div className="inline-block px-4 py-1 bg-cyan-900/30 border border-cyan-500/30 rounded text-cyan-400 font-mono text-sm tracking-widest backdrop-blur-sm">
              Ver.4.4 Phase 2 & Types
            </div>
          </motion.div>

          {/* メインメニュー: BATTLE / GALLERY選択 */}
          <AnimatePresence mode="wait">
            {menuMode === 'main' && (
              <motion.div
                key="main"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.4 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-6xl px-4"
              >
                {/* BATTLEボタン */}
                <GlassCard
                  onClick={() => setMenuMode('battle')}
                  className="p-12 flex flex-col items-center justify-center h-64 group-hover:border-red-500/50"
                  hoverEffect={true}
                >
                  <Sword size={64} className="text-red-400 mb-4 group-hover:scale-110 transition-transform duration-300" />
                  <h2 className="text-4xl font-black text-white mb-2 font-orbitron">BATTLE</h2>
                  <p className="text-slate-400 text-center text-sm">ミッション選択</p>
                </GlassCard>

                {/* GALLERYボタン */}
                <GlassCard
                  onClick={onShowGallery}
                  className="p-12 flex flex-col items-center justify-center h-64 group-hover:border-purple-500/50"
                  hoverEffect={true}
                >
                  <Award size={64} className="text-purple-400 mb-4 group-hover:scale-110 transition-transform duration-300" />
                  <h2 className="text-4xl font-black text-white mb-2 font-orbitron">GALLERY</h2>
                  <p className="text-slate-400 text-center text-sm">実績 & ハイスコア</p>
                </GlassCard>

                {/* HOW TO PLAYボタン */}
                <GlassCard
                  onClick={() => setShowHowToPlay(true)}
                  className="p-8 flex flex-col items-center justify-center h-64 group-hover:border-green-500/50"
                  hoverEffect={true}
                >
                  <HelpCircle size={64} className="text-green-400 mb-4 group-hover:scale-110 transition-transform duration-300" />
                  <h2 className="text-3xl font-black text-white mb-2 font-orbitron text-center">HOW TO<br />PLAY</h2>
                  <p className="text-slate-400 text-center text-sm">遊び方説明</p>
                </GlassCard>
              </motion.div>
            )}

            {/* バトルミッション選択 */}
            {menuMode === 'battle' && (
              <motion.div
                key="battle"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.4 }}
                className="w-full max-w-5xl flex flex-col items-center"
              >
                {/* 戻るボタン */}
                <div className="w-full px-4 mb-4">
                  <button
                    onClick={() => setMenuMode('main')}
                    className="px-4 py-2 bg-slate-800/80 hover:bg-slate-700 text-white font-bold rounded-lg transition-colors border border-white/10"
                  >
                    ← BACK
                  </button>
                </div>

                {/* ミッション選択グリッド */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full px-4">
                  {missions.map((m) => {
                    const difficultyColor =
                      m.difficulty === 'EASY' ? 'text-green-400' :
                        m.difficulty === 'NORMAL' ? 'text-yellow-400' : 'text-red-500';

                    const borderColor =
                      m.difficulty === 'EASY' ? 'group-hover:border-green-500/50' :
                        m.difficulty === 'NORMAL' ? 'group-hover:border-yellow-500/50' : 'group-hover:border-red-500/50';

                    return (
                      <GlassCard
                        key={m.id}
                        onClick={() => onStartBattle(m)}
                        className={`p-6 flex flex-col h-full ${borderColor}`}
                        hoverEffect={true}
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div className={`text-xs font-bold px-2 py-1 rounded bg-slate-800/50 border border-white/10 ${difficultyColor}`}>
                            {m.difficulty}
                          </div>
                          {m.difficulty === 'HARD' && <AlertTriangle size={16} className="text-red-500 animate-pulse" />}
                        </div>

                        <h3 className="text-2xl font-bold text-white mb-2 font-orbitron">{m.title}</h3>
                        <p className="text-slate-400 text-sm mb-6 flex-grow">{m.desc}</p>

                        <div className="flex items-center gap-2 text-sm font-bold text-cyan-400 group-hover:translate-x-2 transition-transform duration-300">
                          <span>DEPLOY</span>
                          <Play size={14} fill="currentColor" />
                        </div>
                      </GlassCard>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="absolute bottom-4 left-0 right-0 text-center text-slate-600 text-xs font-mono">
            SYSTEM READY // WAITING FOR INPUT
          </div>
        </>
      )}
      {/* How To Play Modal */}
      <AnimatePresence>
        {showHowToPlay && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-6xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
            >
              <div className="flex justify-between items-center p-6 border-b border-slate-700 bg-slate-800">
                <h2 className="text-2xl font-black font-orbitron text-white tracking-wider flex items-center gap-3">
                  <HelpCircle className="text-cyan-400" /> HOW TO PLAY
                </h2>
                <button
                  onClick={() => setShowHowToPlay(false)}
                  className="p-2 hover:bg-slate-700 rounded-full text-slate-400 hover:text-white transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 custom-scrollbar space-y-8">
                {/* Step 1: Briefing */}
                <section className="flex gap-6 flex-col md:flex-row">
                  <div className="flex-none flex flex-col items-center">
                    <div className="w-12 h-12 rounded-full bg-cyan-900/50 border border-cyan-500 text-cyan-400 flex items-center justify-center font-bold text-xl mb-2">1</div>
                    <div className="w-px h-full bg-slate-700"></div>
                  </div>
                  <div className="flex-1 pb-8 border-b border-slate-800">
                    <h3 className="text-xl font-bold text-cyan-400 mb-2 font-orbitron">BRIEFING PHASE</h3>
                    <p className="text-slate-300 mb-4">
                      ミッション開始前の準備フェーズです。<br />
                      5つの装備カテゴリから1つを選び、装備グレード(Tier)を上げたり、コストを獲得したりできます。
                    </p>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="bg-slate-950 p-3 rounded border border-slate-800 text-slate-400">
                        <strong className="text-white block mb-1">カテゴリー選択</strong>
                        強化したい装備系統を選択
                      </div>
                      <div className="bg-slate-950 p-3 rounded border border-slate-800 text-slate-400">
                        <strong className="text-white block mb-1">クイズ</strong>
                        正解数に応じてコストボーナス
                      </div>
                    </div>
                  </div>
                </section>

                {/* Step 2: Deck Build */}
                <section className="flex gap-6 flex-col md:flex-row">
                  <div className="flex-none flex flex-col items-center">
                    <div className="w-12 h-12 rounded-full bg-yellow-900/50 border border-yellow-500 text-yellow-400 flex items-center justify-center font-bold text-xl mb-2">2</div>
                    <div className="w-px h-full bg-slate-700"></div>
                  </div>
                  <div className="flex-1 pb-8 border-b border-slate-800">
                    <h3 className="text-xl font-bold text-yellow-400 mb-2 font-orbitron">DECK BUILD PHASE</h3>
                    <div className="flex gap-3">
                      {/* 左側: 説明文 */}
                      <div className="flex-1">
                        <p className="text-slate-300 mb-4">
                          現場に持ち込む装備（ユニット）を選定するフェーズです。<br />
                          最大6つまで選択可能です。トータルコストの上限に注意してください。<br />
                          <span className="text-slate-400">強力なユニットほどコストが高い</span>ため、<span className="text-yellow-400">予算内で最適な組み合わせ</span>を選びましょう。
                        </p>
                      </div>
                      {/* 右側: カードスロット */}
                      <div className="flex-none">
                        <div className="flex gap-1.5">
                          {[
                            { id: 1, icon: Flame, color: 'text-red-400' },
                            { id: 2, icon: Bell, color: 'text-yellow-400' },
                            { id: 3, icon: Users, color: 'text-green-400' },
                            { id: 4, icon: null, color: null },
                            { id: 5, icon: null, color: null },
                            { id: 6, icon: null, color: null },
                          ].map(slot => (
                            <div key={slot.id} className="w-10 h-14 bg-slate-800 rounded border border-slate-700 flex items-center justify-center">
                              {slot.icon ? (
                                <slot.icon size={16} className={slot.color} />
                              ) : (
                                <span className="text-slate-600 text-[10px]">{slot.id}</span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Step 3: Battle */}
                <section className="flex gap-6 flex-col md:flex-row">
                  <div className="flex-none flex flex-col items-center">
                    <div className="w-12 h-12 rounded-full bg-red-900/50 border border-red-500 text-red-400 flex items-center justify-center font-bold text-xl mb-2">3</div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-red-400 mb-2 font-orbitron">BATTLE PHASE</h3>
                    <p className="text-slate-300 mb-4">
                      迫りくる火災や危険から拠点を防衛し、避難完了を目指すフェーズです。<br />
                      コストを使用してユニットを配置し、敵（炎）を撃退してください。<br />
                      <span className="text-red-400">HPが0になると敗北</span>、<span className="text-yellow-400">避難完了 または 制限時間経過で勝利</span>となります。
                    </p>

                    {/* 敵のタイプと相性 */}
                    <div className="mt-6 pt-6 border-t border-slate-800">
                      <h4 className="text-lg font-bold text-cyan-300 mb-4">敵のタイプと相性</h4>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* A火災 */}
                        <div className="p-3 bg-slate-800/50 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                            <span className="font-bold text-red-400">A火災（標準火災）</span>
                          </div>
                          <p className="text-xs text-slate-300">
                            最も一般的な火災。すべての消火設備が通常効果を発揮します。
                          </p>
                        </div>

                        {/* B火災 */}
                        <div className="p-3 bg-slate-800/50 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                            <span className="font-bold text-yellow-400">B火災（油火災）</span>
                          </div>
                          <p className="text-xs text-slate-300">
                            耐久力が高い。<span className="text-red-400 font-bold">水攻撃は効果半減</span>、
                            <span className="text-green-400 font-bold">泡攻撃は2倍効果</span>
                          </p>
                        </div>

                        {/* C火災 */}
                        <div className="p-3 bg-slate-800/50 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                            <span className="font-bold text-blue-400">C火災（電気火災）</span>
                          </div>
                          <p className="text-xs text-slate-300">
                            移動速度が速い。<span className="text-green-400 font-bold">ガス攻撃は1.5倍効果</span>
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>
              </div>

              <div className="p-6 border-t border-slate-800 bg-slate-900 text-center">
                <button
                  onClick={() => setShowHowToPlay(false)}
                  className="px-8 py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-lg transition-colors tracking-widest font-orbitron"
                >
                  ALL CLEAR / CLOSE
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </GameBackground>
  );
}
