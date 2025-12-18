import { useState, useEffect } from 'react';
import { Play, AlertTriangle, Award, Sword, HelpCircle, X, Flame, Bell, Users, Shield, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import GameBackground from './ui/GameBackground';
import GlassCard from './ui/GlassCard';
import playImg from '../assets/play.png';

export default function Menu({ missions, onStartBattle, onShowGallery, isFirstLaunch }) {
  const [showContent, setShowContent] = useState(!isFirstLaunch);
  const [menuMode, setMenuMode] = useState('main'); // 'main' | 'battle'
  const [showHowToPlay, setShowHowToPlay] = useState(false);
  const [howToPlayStep, setHowToPlayStep] = useState(0);

  useEffect(() => {
    if (isFirstLaunch) {
      const timer = setTimeout(() => setShowContent(true), 1500);
      return () => clearTimeout(timer);
    }
  }, [isFirstLaunch]);

  return (
    <GameBackground className="flex flex-col items-center justify-start pt-40 pb-4 px-4">
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
              font-orbitron text-5xl md:text-7xl font-black italic tracking-tighter
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
                className="grid grid-cols-1 md:grid-cols-3 gap-5 w-full max-w-5xl px-4"
              >
                {/* BATTLEボタン */}
                <GlassCard
                  onClick={() => setMenuMode('battle')}
                  className="p-8 flex flex-col items-center justify-center h-56 group-hover:border-red-500/50"
                  hoverEffect={true}
                >
                  <Sword size={50} className="text-red-400 mb-4 group-hover:scale-110 transition-transform duration-300" />
                  <h2 className="text-3xl font-black text-white mb-2 font-orbitron">BATTLE</h2>
                  <p className="text-slate-400 text-center text-sm">ミッション選択</p>
                </GlassCard>

                {/* GALLERYボタン */}
                <GlassCard
                  onClick={onShowGallery}
                  className="p-8 flex flex-col items-center justify-center h-56 group-hover:border-purple-500/50"
                  hoverEffect={true}
                >
                  <Award size={50} className="text-purple-400 mb-4 group-hover:scale-110 transition-transform duration-300" />
                  <h2 className="text-3xl font-black text-white mb-2 font-orbitron">GALLERY</h2>
                  <p className="text-slate-400 text-center text-sm">実績 & ハイスコア</p>
                </GlassCard>

                {/* HOW TO PLAYボタン */}
                <GlassCard
                  onClick={() => { setShowHowToPlay(true); setHowToPlayStep(0); }}
                  className="p-8 flex flex-col items-center justify-center h-56 group-hover:border-green-500/50"
                  hoverEffect={true}
                >
                  <HelpCircle size={50} className="text-green-400 mb-4 group-hover:scale-110 transition-transform duration-300" />
                  <h2 className="text-2xl font-black text-white mb-2 font-orbitron text-center">HOW TO<br />PLAY</h2>
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

                className="w-full max-w-5xl flex flex-col items-center relative"
              >
                {/* 戻るボタン */}
                <div className="absolute left-4 -top-14">
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
              className="relative w-full max-w-4xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[600px]"
            >
              <div className="flex justify-between items-center p-5 border-b border-slate-700 bg-slate-800">
                <h2 className="text-xl font-black font-orbitron text-white tracking-wider flex items-center gap-3">
                  <HelpCircle className="text-cyan-400" size={20} /> HOW TO PLAY
                </h2>
                <button
                  onClick={() => setShowHowToPlay(false)}
                  className="p-1.5 hover:bg-slate-700 rounded-full text-slate-400 hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-hidden p-5 relative">
                <AnimatePresence mode="wait">
                  {howToPlayStep === 0 && (
                    <motion.div
                      key="step1"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="h-full flex flex-col"
                    >
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-10 h-10 rounded-full bg-cyan-900/50 border border-cyan-500 text-cyan-400 flex items-center justify-center font-bold text-lg">1</div>
                        <h3 className="text-xl font-bold text-cyan-400 font-orbitron">BRIEFING PHASE</h3>
                      </div>

                      <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
                        <p className="text-slate-300 mb-6 text-sm leading-relaxed">
                          ミッション開始前の準備フェーズです。<br />
                          5つの装備カテゴリから1つを選び、装備グレード(Tier)を上げたり、コストを獲得したりできます。
                        </p>
                        <div className="grid grid-cols-2 gap-4 text-xs">
                          <div className="bg-slate-950 p-4 rounded border border-slate-800 text-slate-400">
                            <strong className="text-white block mb-1 text-sm">カテゴリー選択</strong>
                            特定の装備系統（スプリンクラー等）を選択すると、そのバトル中の<span className="text-cyan-400">性能が強化</span>されます。戦略に合わせて選びましょう。
                          </div>
                          <div className="bg-slate-950 p-4 rounded border border-slate-800 text-slate-400">
                            <strong className="text-white block mb-1 text-sm">クイズ</strong>
                            防災知識クイズに正解すると、<span className="text-yellow-400">初期コストボーナス</span>を獲得できます。開幕の展開が楽になります。
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {howToPlayStep === 1 && (
                    <motion.div
                      key="step2"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="h-full flex flex-col"
                    >
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-10 h-10 rounded-full bg-yellow-900/50 border border-yellow-500 text-yellow-400 flex items-center justify-center font-bold text-lg">2</div>
                        <h3 className="text-xl font-bold text-yellow-400 font-orbitron">DECK BUILD PHASE</h3>
                      </div>

                      <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
                        <div className="flex flex-col gap-6">
                          <p className="text-slate-300 text-sm leading-relaxed">
                            現場に持ち込む装備（ユニット）を選定するフェーズです。<br />
                            最大6つまで選択可能です。予算（トータルコスト）の上限に注意してください。<br />
                            <span className="text-slate-400">高コスト = 強力だが少数精鋭</span><br />
                            <span className="text-slate-400">低コスト = 展開力重視</span><br />
                            バランス良く組み合わせて、<span className="text-yellow-400">あらゆる状況に対応できるデッキ</span>を構築しましょう。
                          </p>

                          <div className="bg-slate-950 p-4 rounded-lg border border-slate-800">
                            <div className="flex justify-center gap-2">
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
                            <p className="text-center text-xs text-slate-500 mt-2">デッキスロット例</p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {howToPlayStep === 2 && (
                    <motion.div
                      key="step3"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="h-full flex flex-col"
                    >
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-10 h-10 rounded-full bg-red-900/50 border border-red-500 text-red-400 flex items-center justify-center font-bold text-lg">3</div>
                        <h3 className="text-xl font-bold text-red-400 font-orbitron">BATTLE PHASE</h3>
                      </div>

                      <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
                        <div className="grid grid-cols-2 gap-6 mb-4">
                          {/* Left Column: Rules & Intro */}
                          <div className="space-y-4">
                            <p className="text-slate-300 text-sm leading-relaxed">
                              迫りくる火災（敵）から拠点を守り抜くメインフェーズです。<br />
                            </p>

                            <div className="space-y-3 text-sm">
                              {/* Rule List */}
                              <div className="bg-slate-800/50 p-3 rounded flex items-start gap-3 border border-slate-700">
                                <Shield className="text-green-400 shrink-0" size={18} />
                                <div>
                                  <strong className="text-white block mb-0.5">勝利条件</strong>
                                  <span className="text-slate-300">
                                    制限時間を耐えきるか、指定数の敵を撃破して「避難完了」となれば勝利です。
                                  </span>
                                </div>
                              </div>

                              <div className="bg-slate-800/50 p-3 rounded flex items-start gap-3 border border-slate-700">
                                <Activity className="text-red-400 shrink-0" size={18} />
                                <div>
                                  <strong className="text-white block mb-0.5">敗北・ダメージ条件</strong>
                                  <span className="text-slate-300">
                                    敵（炎）は<span className="text-red-400 font-bold">画面上部から下へ</span>向かってきます。
                                    一番下の<span className="text-blue-400 font-bold">青い防衛ライン</span>に到達されるとダメージを受け、HPが尽きると敗北です。
                                  </span>
                                </div>
                              </div>

                              <div className="bg-slate-800/50 p-3 rounded flex items-start gap-3 border border-slate-700">
                                <Users className="text-cyan-400 shrink-0" size={18} />
                                <div>
                                  <strong className="text-white block mb-0.5">ユニット配置</strong>
                                  <span className="text-slate-300">
                                    下部のカードをクリックして選択し、配置したいグリッド（マス）をクリックします。<span className="text-yellow-400">コスト</span>が必要です。
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Fire Types Legend */}
                            <div className="grid grid-cols-3 gap-2 mt-2">
                              <div className="p-2 bg-slate-800/50 rounded border border-slate-700/50">
                                <div className="flex items-center gap-2 mb-1">
                                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                  <div className="font-bold text-red-400 text-[10px]">A火災 (標準)</div>
                                </div>
                                <p className="text-[9px] text-slate-400 ml-4">通常効果</p>
                              </div>
                              <div className="p-2 bg-slate-800/50 rounded border border-slate-700/50">
                                <div className="flex items-center gap-2 mb-1">
                                  <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                                  <div className="font-bold text-yellow-400 text-[10px]">B火災 (油)</div>
                                </div>
                                <p className="text-[9px] text-slate-400 ml-4">水半減、泡2倍</p>
                              </div>
                              <div className="p-2 bg-slate-800/50 rounded border border-slate-700/50">
                                <div className="flex items-center gap-2 mb-1">
                                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                                  <div className="font-bold text-blue-400 text-[10px]">C火災 (電気)</div>
                                </div>
                                <p className="text-[9px] text-slate-400 ml-4">高速、ガス1.5倍</p>
                              </div>
                            </div>
                          </div>

                          {/* Right Column: Image */}
                          <div className="flex flex-col justify-start items-center">
                            <div className="bg-slate-950 rounded-lg border border-slate-800 overflow-hidden w-[70%]">
                              <img
                                src={playImg}
                                alt="Battle Screen Explanation"
                                className="w-full h-auto block"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Footer Controls */}
              <div className="p-5 border-t border-slate-800 bg-slate-900 flex justify-between items-center">
                <button
                  onClick={() => setHowToPlayStep(prev => Math.max(0, prev - 1))}
                  disabled={howToPlayStep === 0}
                  className={`px-6 py-2 rounded font-bold text-sm transition-colors border border-slate-700 
                    ${howToPlayStep === 0 ? 'bg-slate-800 text-slate-600 opacity-50 cursor-not-allowed' : 'bg-slate-800 hover:bg-slate-700 text-white'}`}
                >
                  PREV
                </button>

                <div className="flex gap-2">
                  {[0, 1, 2].map(step => (
                    <div
                      key={step}
                      className={`w-2 h-2 rounded-full transition-colors ${howToPlayStep === step ? 'bg-cyan-400' : 'bg-slate-700'}`}
                    />
                  ))}
                </div>

                <button
                  onClick={() => {
                    if (howToPlayStep < 2) {
                      setHowToPlayStep(prev => prev + 1);
                    } else {
                      setShowHowToPlay(false);
                    }
                  }}
                  className="px-6 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded text-sm transition-colors min-w-[100px]"
                >
                  {howToPlayStep < 2 ? 'NEXT' : 'CLOSE'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </GameBackground>
  );
}
