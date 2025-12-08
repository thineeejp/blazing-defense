import { useState, useEffect } from 'react';
import { Play, AlertTriangle, Award, Sword } from 'lucide-react';
import GameBackground from './ui/GameBackground';
import GlassCard from './ui/GlassCard';

export default function Menu({ missions, onStartBattle, onShowGallery, isFirstLaunch }) {
  const [showContent, setShowContent] = useState(!isFirstLaunch);
  const [menuMode, setMenuMode] = useState('main'); // 'main' | 'battle'

  useEffect(() => {
    if (isFirstLaunch) {
      const timer = setTimeout(() => setShowContent(true), 2500);
      return () => clearTimeout(timer);
    }
  }, [isFirstLaunch]);

  return (
    <GameBackground className="flex flex-col items-center justify-center p-4">
      {/* Boot Animation Overlay */}
      {isFirstLaunch && !showContent && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-950 text-cyan-500 font-mono">
          <div className="text-center">
            <div className="text-2xl mb-4">INITIALIZING DEFENSE SYSTEM...</div>
            <div className="w-64 h-2 bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-cyan-500 animate-pulse" style={{ width: '70%' }}></div>
            </div>
          </div>
        </div>
      )}

      {/* Main Menu Content */}
      {showContent && (
        <>
          <div className="text-center mb-12 animate-fadeIn">
            <h1 className="
              font-orbitron text-6xl md:text-8xl font-black italic tracking-tighter
              text-transparent bg-clip-text bg-gradient-to-b from-white via-cyan-200 to-cyan-500
              drop-shadow-[0_0_30px_rgba(6,182,212,0.6)]
              mb-4
            ">
              BLAZING
              <span className="block text-4xl md:text-6xl text-transparent bg-clip-text bg-gradient-to-b from-red-400 to-red-600 drop-shadow-[0_0_30px_rgba(220,38,38,0.6)]">
                DEFENSE
              </span>
            </h1>
            <div className="inline-block px-4 py-1 bg-cyan-900/30 border border-cyan-500/30 rounded text-cyan-400 font-mono text-sm tracking-widest backdrop-blur-sm">
              Ver.4.4 Phase 2 & Types
            </div>
          </div>

          {/* メインメニュー: BATTLE / GALLERY選択 */}
          {menuMode === 'main' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl px-4 animate-slideUpFade delay-200">
              {/* BATTLEボタン */}
              <GlassCard
                onClick={() => setMenuMode('battle')}
                className="p-12 flex flex-col items-center justify-center h-64 group-hover:border-red-500/50"
              >
                <Sword size={64} className="text-red-400 mb-4 group-hover:scale-110 transition-transform" />
                <h2 className="text-4xl font-black text-white mb-2 font-orbitron">BATTLE</h2>
                <p className="text-slate-400 text-center text-sm">ミッション選択</p>
              </GlassCard>

              {/* GALLERYボタン */}
              <GlassCard
                onClick={onShowGallery}
                className="p-12 flex flex-col items-center justify-center h-64 group-hover:border-purple-500/50"
              >
                <Award size={64} className="text-purple-400 mb-4 group-hover:scale-110 transition-transform" />
                <h2 className="text-4xl font-black text-white mb-2 font-orbitron">GALLERY</h2>
                <p className="text-slate-400 text-center text-sm">実績 & ハイスコア</p>
              </GlassCard>
            </div>
          )}

          {/* バトルミッション選択 */}
          {menuMode === 'battle' && (
            <>
              {/* 戻るボタン */}
              <div className="w-full max-w-5xl px-4 mb-4 animate-fadeIn">
                <button
                  onClick={() => setMenuMode('main')}
                  className="px-4 py-2 bg-slate-800/80 hover:bg-slate-700 text-white font-bold rounded-lg transition-colors border border-white/10"
                >
                  ← BACK
                </button>
              </div>

              {/* ミッション選択グリッド */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl px-4 animate-slideUpFade delay-100">
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
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className={`text-xs font-bold px-2 py-1 rounded bg-slate-800/50 border border-white/10 ${difficultyColor}`}>
                          {m.difficulty}
                        </div>
                        {m.difficulty === 'HARD' && <AlertTriangle size={16} className="text-red-500 animate-pulse" />}
                      </div>

                      <h3 className="text-2xl font-bold text-white mb-2 font-orbitron">{m.title}</h3>
                      <p className="text-slate-400 text-sm mb-6 flex-grow">{m.desc}</p>

                      <div className="flex items-center gap-2 text-sm font-bold text-cyan-400 group-hover:translate-x-2 transition-transform">
                        <span>DEPLOY</span>
                        <Play size={14} fill="currentColor" />
                      </div>
                    </GlassCard>
                  );
                })}
              </div>
            </>
          )}

          <div className="absolute bottom-4 left-0 right-0 text-center text-slate-600 text-xs font-mono">
            SYSTEM READY // WAITING FOR INPUT
          </div>
        </>
      )}
    </GameBackground>
  );
}
