import React, { useEffect, useRef, useState } from 'react';
import { Flame, ShieldAlert, Zap, AlertTriangle, Skull, Users } from 'lucide-react';
import GlassCard from './ui/GlassCard';

const GRID_ROWS = 6;
const RANGE_LABEL = {
  surround: 'Surround',
  wide: 'Wide',
  tripleRow: '3-Row',
  surroundRow: 'Surround+Row',
  line: 'Line',
  global: 'Global',
};

export default function BattleField({
  hp,
  cost,
  prevCost = 0,
  evacuatedCount,
  evacuationGoal,
  frameCount,
  timeLimit,
  towers,
  enemies,
  effects,
  attackEffects = [],
  hitEffects = [],
  deathEffects = [],
  placementEffects = [],
  areaEffects = [],
  scorchMarks = [],
  difficulty,
  difficultyRef,
  deck,
  selectedCard,
  removeModal,
  damaged,
  categoryBuffs,
  globalCostReduction = 0,
  handleSlotClick,
  setSelectedCard,
  confirmRemove,
  setRemoveModal,
  onSurrender,
}) {
  // HP遅延バー用
  const [hpLag, setHpLag] = useState(hp);
  const hpTargetRef = useRef(hp);

  useEffect(() => {
    hpTargetRef.current = hp;
  }, [hp]);

  useEffect(() => {
    let frame;
    const tick = () => {
      setHpLag((prev) => {
        const target = hpTargetRef.current;
        const diff = target - prev;
        if (Math.abs(diff) < 0.3) return target;
        const step = Math.max(0.5, Math.abs(diff) * 0.12);
        return diff > 0 ? Math.min(prev + step, target) : Math.max(prev - step, target);
      });
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);

  // カード選択時ボトムバー輝き
  const [deckFlash, setDeckFlash] = useState(false);
  useEffect(() => {
    if (selectedCard) {
      setDeckFlash(true);
      const t = setTimeout(() => setDeckFlash(false), 200);
      return () => clearTimeout(t);
    }
  }, [selectedCard]);

  // ジャックポット演出
  const [jackpot, setJackpot] = useState(false);
  useEffect(() => {
    if (cost >= 777 && prevCost < 777) {
      setJackpot(true);
      const t = setTimeout(() => setJackpot(false), 1000);
      return () => clearTimeout(t);
    }
  }, [cost, prevCost]);

  // 画面シェイク
  const [shake, setShake] = useState(false);
  useEffect(() => {
    const hasCritical = effects.some((e) => e.size === 'large');
    if (hasCritical) {
      setShake(true);
      const t = setTimeout(() => setShake(false), 120);
      return () => clearTimeout(t);
    }
  }, [effects]);

  // プレビュー用ホバーセル
  const [hoverCell, setHoverCell] = useState(null);

  // コスト変動検出
  const costDelta = cost - prevCost;
  const costIncreasing = costDelta > 0.5;
  const costDecreasing = costDelta < -0.5;
  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: `repeat(${difficulty.cols}, 1fr)`,
    gridTemplateRows: `repeat(${GRID_ROWS}, 1fr)`,
    transform: 'perspective(600px) rotateX(20deg)',
    transformStyle: 'preserve-3d',
  };

  return (
    <div className={`w-full h-full flex flex-col bg-slate-950 overflow-hidden relative transition-colors duration-100 ${damaged ? 'bg-red-900/50' : ''} ${shake ? 'animate-screen-shake' : ''}`}>
      {damaged && <div className="absolute inset-0 bg-red-600/30 z-50 pointer-events-none animate-pulse"></div>}

      {/* Header (HUD) */}
      <div className="absolute top-0 left-0 right-0 p-4 z-20 flex justify-between items-start pointer-events-none">
        <div className="flex gap-4 pointer-events-auto">
          <GlassCard className="flex items-center gap-3 px-4 py-2" hoverEffect={false}>
            <ShieldAlert size={20} className={damaged ? 'text-red-500 animate-pulse' : hp < 30 ? 'text-orange-400 animate-pulse' : 'text-blue-400'} />
            <div>
              <div className="text-[10px] font-bold text-slate-400">DEFENSE HP</div>
              <div className={`font-mono font-bold text-xl ${damaged ? 'text-red-500 animate-shake' : hp < 30 ? 'text-orange-400 animate-hp-danger' : 'text-white'}`}>
                {Math.floor(hp)}%
              </div>
              {/* HPゲージ */}
              <div className="relative w-24 h-2 bg-slate-800/70 rounded-full overflow-hidden mt-1 border border-white/5">
                {/* 遅延バー */}
                <div
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-red-600 to-orange-400 transition-all duration-500"
                  style={{ width: `${Math.max(0, Math.min(100, hpLag))}%` }}
                />
                {/* 即時バー */}
                <div
                  className={`absolute inset-y-0 left-0 ${hp > 50 ? 'bg-gradient-to-r from-green-500 to-green-400' : hp > 30 ? 'bg-gradient-to-r from-yellow-500 to-yellow-400' : 'bg-gradient-to-r from-red-600 to-red-400 animate-hp-danger'}`}
                  style={{ width: `${Math.max(0, Math.min(100, hp))}%` }}
                />
              </div>
            </div>
          </GlassCard>

          <GlassCard className={`relative flex items-center gap-3 px-4 py-2 ${jackpot ? 'animate-jackpot' : ''}`} hoverEffect={false}>
            <Zap size={20} className={`text-yellow-400 ${costIncreasing ? 'animate-pulse' : ''}`} />
            <div>
              <div className="text-[10px] font-bold text-slate-400">COST</div>
              <div className={`font-mono font-bold text-xl transition-all duration-150 ${cost >= 777 ? 'text-amber-300 drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]' : 'text-yellow-400'} ${costIncreasing ? 'animate-cost-pulse-up text-green-400' : ''} ${costDecreasing ? 'animate-cost-flash-down text-red-400' : ''}`}>
                {Math.floor(cost)}
              </div>
            </div>
            {jackpot && (
              <div className="absolute inset-0 pointer-events-none">
                {[...Array(8)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute w-1 h-1 bg-amber-300 rounded-full animate-jackpot-sparkle"
                    style={{
                      left: `${Math.random() * 100}%`,
                      top: `${Math.random() * 100}%`,
                      animationDelay: `${i * 0.05}s`,
                    }}
                  />
                ))}
              </div>
            )}
          </GlassCard>

          <GlassCard className="flex items-center gap-3 px-4 py-2" hoverEffect={false}>
            <Users size={20} className={`text-green-400 ${evacuatedCount >= evacuationGoal ? 'animate-pulse' : ''}`} />
            <div>
              <div className="text-[10px] font-bold text-slate-400">EVACUATED</div>
              <div className={`font-mono font-bold text-xl ${evacuatedCount >= evacuationGoal ? 'text-green-400' : 'text-white'}`}>
                {Math.floor(evacuatedCount)} <span className="text-sm text-slate-500">/ {evacuationGoal}</span>
              </div>
              {/* 避難進捗ゲージ */}
              <div className="w-20 h-1.5 bg-slate-700/50 rounded-full overflow-hidden mt-1">
                <div
                  className={`h-full transition-all duration-300 ${evacuatedCount >= evacuationGoal ? 'bg-gradient-to-r from-green-400 to-emerald-300' : 'bg-gradient-to-r from-green-600 to-green-500'}`}
                  style={{ width: `${Math.min(100, (evacuatedCount / evacuationGoal) * 100)}%` }}
                />
              </div>
            </div>
          </GlassCard>
        </div>

        <div className="flex gap-4 pointer-events-auto">
          <GlassCard className="px-6 py-2" hoverEffect={false}>
            <div className="text-[10px] font-bold text-slate-400 text-center">TIME LIMIT</div>
            <div className={`font-mono font-bold text-2xl w-24 text-center ${(timeLimit - frameCount) / 60 < 15 ? 'text-red-400 animate-pulse' : (timeLimit - frameCount) / 60 < 30 ? 'text-orange-400' : 'text-white'}`}>
              {Math.floor((timeLimit - frameCount) / 60)}<span className="text-sm">s</span>
            </div>
          </GlassCard>

          <button
            onClick={onSurrender}
            className="h-full px-4 bg-red-900/40 border border-red-500/50 rounded-xl text-red-400 font-bold hover:bg-red-500 hover:text-white transition-all shadow-[0_0_10px_rgba(239,68,68,0.2)]"
          >
            降参
          </button>
        </div>
      </div>

      {/* Main 3D Grid Area */}
      <div className={`flex-1 relative flex items-center justify-center px-4 pt-4 pb-0 ${damaged ? 'translate-x-1 translate-y-1' : ''}`}>
        <div className="absolute top-20 text-red-600/40 font-black text-6xl select-none z-0 font-orbitron tracking-widest pointer-events-none animate-neon-pulse blur-[1px] drop-shadow-lg">
          DANGER ZONE
        </div>

        <div className="relative w-full max-w-lg aspect-[3/4] transition-all duration-500" style={gridStyle}>
          {Array.from({ length: GRID_ROWS * difficulty.cols }).map((_, i) => {
            const r = Math.floor(i / difficulty.cols);
            const c = i % difficulty.cols;
            const tower = towers[`${r}-${c}`];
            const isDefenseLine = r === GRID_ROWS - 1;

            return (
              <div
                key={i}
                onClick={() => handleSlotClick(r, c)}
                onMouseEnter={() => setHoverCell({ r, c })}
                onMouseLeave={() => setHoverCell(null)}
                className={`
                  relative border border-white/5 flex items-center justify-center
                  ${isDefenseLine ? 'bg-blue-900/10 border-b-2 border-b-blue-500/50' : 'bg-slate-800/20'}
                  hover:bg-white/10 cursor-pointer transition-colors backdrop-blur-[1px]
                  ${hoverCell && hoverCell.r === r && hoverCell.c === c && selectedCard ? 'ring-2 ring-cyan-300' : ''}
                `}
              >
                {/* Grid Glow */}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20 pointer-events-none" />

                {isDefenseLine && (
                  <div className="absolute bottom-0 w-full h-[2px] bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.8)]" />
                )}

                {tower && (
                  <div
                    className={`relative z-10 flex flex-col items-center transform transition-transform duration-300 hover:scale-110
                      ${tower.card.type === 'red' ? 'text-red-400' : tower.card.type === 'green' ? 'text-green-400' : tower.card.type === 'purple' ? 'text-purple-400' : 'text-yellow-400'}
                      ${tower.isNew ? 'animate-tower-drop drop-shadow-[0_0_14px_rgba(56,189,248,0.7)]' : ''}
                      ${tower.isRemoving ? 'animate-shake opacity-70 invert scale-75' : ''}
                    `}
                  >
                    <div className="drop-shadow-[0_0_15px_rgba(0,0,0,0.5)] filter">
                      {React.createElement(tower.card.icon, { size: 28 })}
                    </div>

                    {/* Attack Timer Bar */}
                    <div className="w-8 h-1 bg-slate-700/50 mt-1 rounded-full overflow-hidden backdrop-blur-sm">
                      <div
                        className="h-full bg-current shadow-[0_0_5px_currentColor]"
                        style={{ width: `${(tower.timer / (tower.lastInterval || tower.card.speed || tower.card.interval)) * 100}%` }}
                      />
                    </div>

                    {/* Duration Bar */}
                    {tower.card.duration === null ? (
                      <div className="text-[8px] font-bold text-green-300 mt-0.5 font-mono">INF</div>
                    ) : (
                      (() => {
                        const remaining = tower.card.duration - tower.lifeTime;
                        const remainingSec = Math.ceil(remaining / 60);
                        const percentage = (remaining / tower.card.duration) * 100;
                        const barColor = percentage > 50 ? 'bg-green-400' : percentage > 20 ? 'bg-yellow-400' : 'bg-red-400';
                        return (
                          <>
                            <div className="w-8 h-0.5 bg-slate-900/50 mt-0.5 rounded-full overflow-hidden">
                              <div className={`h-full ${barColor}`} style={{ width: `${percentage}%` }} />
                            </div>
                            <div className={`text-[7px] font-bold mt-0.5 font-mono ${percentage > 20 ? 'text-white' : 'text-red-300 animate-pulse'}`}>
                              {remainingSec}s
                            </div>
                          </>
                        );
                      })()
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {areaEffects.map((ef) => {
            const topPct = (ef.r / GRID_ROWS) * 100;
            const leftPct = (ef.c / difficulty.cols) * 100;
            return (
              <div
                key={ef.id}
                className="absolute z-50 pointer-events-none overflow-visible"
                style={{
                  top: `${topPct}%`,
                  left: `${leftPct}%`,
                  width: '0px',
                  height: '0px',
                  transformStyle: 'preserve-3d',
                  transform: 'translateZ(10px)',
                }}
              >
                {ef.cardId === 'sprinkler' && (
                  <div className="absolute -translate-x-1/2 -translate-y-1/2 w-[80px] h-[80px]">
                    <div className="absolute inset-0 rounded-full border-4 border-cyan-400 opacity-60 animate-ping" />
                    <div className="absolute inset-2 rounded-full border-2 border-cyan-200 opacity-80 animate-ping" style={{ animationDelay: '0.1s' }} />
                    {[0, 1, 2].map(i => (
                      <div key={i} className="absolute bg-cyan-300 rounded-full w-1.5 h-1.5 top-1/2 left-1/2"
                        style={{ transform: `rotate(${i * 120 + Math.random() * 60}deg) translate(25px)`, opacity: 0, animation: 'ping 0.5s ease-out forwards' }} />
                    ))}
                  </div>
                )}
                {ef.cardId === 'foamSystem' && (
                  <div className="absolute -translate-x-1/2 -translate-y-1/2 w-[70px] h-[70px]">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="absolute bg-white rounded-full animate-foam-spray"
                        style={{
                          left: `${50 + (Math.random() - 0.5) * 60}%`,
                          top: `${50 + (Math.random() - 0.5) * 60}%`,
                          width: `${8 + Math.random() * 8}px`,
                          height: `${8 + Math.random() * 8}px`,
                          opacity: 0.8,
                          animationDuration: '0.8s',
                          animationDelay: `${Math.random() * 0.2}s`
                        }} />
                    ))}
                  </div>
                )}
                {ef.cardId === 'packageFireSystem' && (
                  <div
                    className="absolute -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full bg-purple-500/40 animate-radar-pulse"
                  />
                )}
                {ef.cardId === 'inertGasSystem' && (
                  <div className="absolute -translate-x-1/2 -translate-y-1/2 w-[60px] h-[60px] pointer-events-none">
                    {/* B案改: コンパクトでゆっくり (Steady Compact Pulse) */}
                    <div className="absolute inset-0 bg-purple-500/10 border border-purple-400/30 rounded-full animate-pulse"
                      style={{ animationDuration: '3s' }} />
                  </div>
                )}
              </div>
            );
          })}

          {/* Scorch marks on defense line */}
          {scorchMarks.map((m) => {
            const leftPct = (m.c / difficulty.cols) * 100;
            const widthPct = (1 / difficulty.cols) * 100;
            const opacity = m.life / 90;
            return (
              <div
                key={m.id}
                className="absolute pointer-events-none"
                style={{
                  bottom: '-2%',
                  left: `${leftPct}%`,
                  width: `${widthPct}%`,
                  height: '6%',
                  transform: 'translateX(-50%)',
                  background: 'radial-gradient(circle at 50% 50%, rgba(248,113,113,0.6), rgba(127,29,29,0.1))',
                  filter: 'blur(2px)',
                  opacity,
                }}
              />
            );
          })}

          {/* Enemies */}
          {enemies.map((e) => {
            const topPct = ((e.progress + e.size / 2) / GRID_ROWS) * 100;
            const leftPct = ((e.c + e.size / 2) / difficulty.cols) * 100;
            const widthPct = (e.size / difficulty.cols) * 100;
            const heightPct = (e.size / GRID_ROWS) * 100;

            return (
              <div
                key={e.id}
                className="absolute z-20 pointer-events-none flex items-center justify-center"
                style={{
                  top: `${topPct}%`,
                  left: `${leftPct}%`,
                  width: `${widthPct}%`,
                  height: `${heightPct}%`,
                  transform: 'translate(-50%, -50%)',
                }}
              >
                {/* 敵表示がマスへのクリックを阻害しないよう、子要素も pointer-events 無効化 */}
                <div className={`relative w-full h-full flex items-center justify-center ${e.color} ${e.isAttacking ? 'scale-150 opacity-80' : ''} ${e.isHit ? 'animate-hit-flash' : ''} pointer-events-none`}>
                  {e.isAttacking ? (
                    <Skull size={e.size * 32} className="animate-pulse text-white drop-shadow-[0_0_10px_red]" />
                  ) : (
                    <Flame
                      size={e.size * 32}
                      className="filter drop-shadow-[0_0_15px_rgba(255,100,0,0.8)] animate-pulse"
                      fill="currentColor"
                    />
                  )}
                  {!e.isAttacking && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-12 h-1 bg-black/60 rounded overflow-hidden shadow border border-white/10 pointer-events-none">
                      <div className="h-full bg-gradient-to-r from-red-600 to-red-400" style={{ width: `${(e.hp / e.maxHp) * 100}%` }} />
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Effects (ダメージ数値・テキスト) */}
          {effects.map((ef) => {
            const topPct = (ef.r / GRID_ROWS) * 100;
            const leftPct = (ef.c / difficultyRef.current.cols) * 100;
            const sizeClass = ef.size === 'large' ? 'text-xl' : ef.size === 'small' ? 'text-xs' : 'text-sm';
            return (
              <div
                key={ef.id}
                className={`absolute z-30 pointer-events-none ${ef.color} ${sizeClass} whitespace-nowrap font-bold drop-shadow-md animate-damage-pop`}
                style={{
                  top: `${topPct}%`,
                  left: `${leftPct}%`,
                  transform: `translate(-50%, -50%) translateY(${ef.y * 20}px)`,
                  opacity: ef.life / 30,
                }}
              >
                {ef.text}
              </div>
            );
          })}

          {/* Attack Effects (攻撃線) */}
          {/* Attack Effects (攻撃線) */}
          {attackEffects.map((ef) => {
            // ターゲット追従ロジック
            let targetR = ef.toR;
            let targetC = ef.toC;
            if (ef.targetId) {
              const targetEnemy = enemies.find((e) => e.id === ef.targetId);
              if (targetEnemy) {
                targetR = targetEnemy.progress + targetEnemy.size / 2;
                targetC = targetEnemy.c + targetEnemy.size / 2;
              }
            }

            const fromTopPct = (ef.fromR / GRID_ROWS) * 100;
            const fromLeftPct = (ef.fromC / difficulty.cols) * 100;
            const toTopPct = (targetR / GRID_ROWS) * 100;
            const toLeftPct = (targetC / difficulty.cols) * 100;

            // 攻撃線の角度と長さを計算
            const dx = toLeftPct - fromLeftPct;
            const dy = toTopPct - fromTopPct;
            const angle = Math.atan2(dy, dx) * (180 / Math.PI);
            const length = Math.sqrt(dx * dx + dy * dy);

            // ダメージタイプごとの演出分岐
            if (ef.damageType === 'water') {
              return (
                <div
                  key={ef.id}
                  className="absolute z-30 pointer-events-none animate-stream-flow"
                  style={{
                    top: `${fromTopPct}%`,
                    left: `${fromLeftPct}%`,
                    width: `${length}%`,
                    height: '8px',
                    transformOrigin: 'left center',
                    transform: `rotate(${angle}deg) translateY(-50%)`,
                    background: 'linear-gradient(90deg, transparent 0%, rgba(59,130,246,0.6) 20%, rgba(147,197,253,0.9) 50%, rgba(59,130,246,0.6) 80%, transparent 100%)',
                    backgroundSize: '50% 100%',
                    opacity: ef.life / 18,
                    filter: 'drop-shadow(0 0 5px rgba(59,130,246,0.8))',
                  }}
                />
              );
            } else if (ef.damageType === 'foam') {
              return (
                <div
                  key={ef.id}
                  className="absolute z-30 pointer-events-none"
                  style={{
                    top: `${fromTopPct}%`,
                    left: `${fromLeftPct}%`,
                    width: `${length}%`,
                    height: '20px',
                    transformOrigin: 'left center',
                    transform: `rotate(${angle}deg) translateY(-50%)`,
                  }}
                >
                  {/* 泡の粒を表現 */}
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className="absolute rounded-full bg-white animate-foam-spray"
                      style={{
                        left: `${i * 20}%`,
                        top: '50%',
                        width: '10px',
                        height: '10px',
                        animationDelay: `${i * 0.05}s`,
                        opacity: ef.life / 20,
                      }}
                    />
                  ))}
                </div>
              );
            } else if (ef.damageType === 'gas') {
              return (
                <React.Fragment key={ef.id}>
                  {/* ガスは発射線は薄く、着弾点の拡散を強調 */}
                  <div
                    className="absolute z-30 pointer-events-none bg-purple-500/20"
                    style={{
                      top: `${fromTopPct}%`,
                      left: `${fromLeftPct}%`,
                      width: `${length}%`,
                      height: '2px',
                      transformOrigin: 'left center',
                      transform: `rotate(${angle}deg)`,
                      opacity: ef.life / 30,
                    }}
                  />
                  <div
                    className="absolute z-30 pointer-events-none rounded-full animate-gas-expand bg-gradient-radial from-purple-600/60 to-transparent"
                    style={{
                      top: `${toTopPct}%`,
                      left: `${toLeftPct}%`,
                      width: '80px',
                      height: '80px',
                      transform: 'translate(-50%, -50%)',
                    }}
                  />
                </React.Fragment>
              );
            }

            // Normal / Default Beam
            return (
              <React.Fragment key={ef.id}>
                {/* Core Beam */}
                <div
                  className={`absolute z-30 pointer-events-none ${ef.color} animate-attack-line`}
                  style={{
                    top: `${fromTopPct}%`,
                    left: `${fromLeftPct}%`,
                    width: `${length}%`,
                    height: '3px',
                    transformOrigin: 'left center',
                    transform: `rotate(${angle}deg)`,
                    opacity: ef.life / 18,
                    boxShadow: '0 0 10px currentColor, 0 0 5px white',
                  }}
                />
                {/* Glow Aura */}
                <div
                  className={`absolute z-29 pointer-events-none ${ef.color}`}
                  style={{
                    top: `${fromTopPct}%`,
                    left: `${fromLeftPct}%`,
                    width: `${length}%`,
                    height: '8px',
                    transformOrigin: 'left center',
                    transform: `rotate(${angle}deg) translateY(-2.5px)`, // Center the thicker line
                    opacity: (ef.life / 18) * 0.5,
                    filter: 'blur(4px)',
                  }}
                />
              </React.Fragment>
            );
          })}

          {/* Hit Bursts */}
          {hitEffects.map((ef) => {
            const topPct = (ef.r / GRID_ROWS) * 100;
            const leftPct = (ef.c / difficulty.cols) * 100;
            return (
              <div
                key={ef.id}
                className={`absolute z-30 pointer-events-none ${ef.color} rounded-full animate-hit-burst`}
                style={{
                  top: `${topPct}%`,
                  left: `${leftPct}%`,
                  width: '14px',
                  height: '14px',
                  transform: 'translate(-50%, -50%)',
                  opacity: ef.life / 24,
                  boxShadow: '0 0 12px currentColor',
                }}
              />
            );
          })}

          {/* Hit particles */}
          {hitEffects.flatMap((ef) =>
            (ef.particles || []).map((p, idx) => {
              const topPct = (ef.r / GRID_ROWS) * 100;
              const leftPct = (ef.c / difficulty.cols) * 100;
              return (
                <div
                  key={`${ef.id}-p${idx}`}
                  className={`absolute z-29 pointer-events-none ${ef.color}`}
                  style={{
                    top: `${topPct}%`,
                    left: `${leftPct}%`,
                    width: `${p.size}px`,
                    height: `${p.size}px`,
                    borderRadius: '999px',
                    transform: `translate(calc(-50% + ${p.dx}% / ${difficulty.cols}), calc(-50% + ${p.dy}% / ${GRID_ROWS}))`,
                    opacity: ef.life / 24,
                    boxShadow: '0 0 6px currentColor',
                  }}
                />
              );
            })
          )}

          {/* Death Effects (敵死亡パーティクル) */}
          {deathEffects.map((ef) => {
            const topPct = (ef.r / GRID_ROWS) * 100;
            const leftPct = (ef.c / difficulty.cols) * 100;
            const progress = 1 - ef.life / 36;

            return (
              <div
                key={ef.id}
                className="absolute z-35 pointer-events-none"
                style={{
                  top: `${topPct}%`,
                  left: `${leftPct}%`,
                  transform: 'translate(-50%, -50%)',
                }}
              >
                {/* 中心のバースト */}
                <div
                  className={`absolute ${ef.color} rounded-full animate-death-burst`}
                  style={{
                    width: '20px',
                    height: '20px',
                    transform: 'translate(-50%, -50%)',
                  }}
                />
                {/* パーティクル */}
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className={`absolute ${ef.color} rounded-full animate-death-particle-${i}`}
                    style={{
                      width: '8px',
                      height: '8px',
                      transform: 'translate(-50%, -50%)',
                      opacity: 1 - progress,
                    }}
                  />
                ))}
              </div>
            );
          })}

          {/* Placement Effects (設置衝撃波) */}
          {placementEffects.map((ef) => {
            const topPct = (ef.r / GRID_ROWS) * 100;
            const leftPct = (ef.c / difficulty.cols) * 100;

            return (
              <React.Fragment key={ef.id}>
                <div
                  className={`absolute z-15 pointer-events-none rounded-full border-4 ${ef.color} animate-place-ring`}
                  style={{
                    top: `${topPct}%`,
                    left: `${leftPct}%`,
                    width: '40px',
                    height: '40px',
                    transform: 'translate(-50%, -50%)',
                    opacity: ef.life / 30,
                  }}
                />
                {[0, 1, 2].map((i) => (
                  <div
                    key={`${ef.id}-dust-${i}`}
                    className="absolute z-15 pointer-events-none bg-white/70 rounded-full"
                    style={{
                      top: `${topPct + (Math.random() - 0.5) * 6}%`,
                      left: `${leftPct + (Math.random() - 0.5) * 6}%`,
                      width: '6px',
                      height: '6px',
                      opacity: (ef.life / 30) * 0.8,
                      animation: `fadeIn 0.2s ease-out ${i * 0.05}s`,
                      transform: 'translate(-50%, -50%)',
                    }}
                  />
                ))}
              </React.Fragment>
            );
          })}
        </div>

        {/* 操作ガイダンス - グリッド下端に配置 */}
        <div className="absolute bottom-0 left-0 right-0 text-xs text-center text-slate-400 font-mono pb-1">
          カードをクリック → グリッドをクリックで配置
        </div>
      </div>

      {/* Deck (Bottom) */}
      <div className={`h-40 z-30 flex flex-col px-4 py-4 bg-gradient-to-t from-slate-950 via-slate-900/90 to-transparent ${deckFlash ? 'ring-2 ring-cyan-400/60 rounded-xl' : ''}`}>
        {/* Deck Cards Container */}
        <div className="flex-1 flex items-center justify-center">
          {/* Deck Cards */}
          <div className="flex items-center justify-center gap-3 overflow-x-auto overflow-y-visible w-full py-6">
            {Object.values(deck).map((card) => {
              // オーバーフロー報酬 + グローバル割引を反映したコスト計算
              const discount = (categoryBuffs[card.category]?.costDiscount || 0) + (globalCostReduction || 0);
              const actualCost = Math.floor(card.cost * (1 - discount));
              const hasDiscount = discount > 0;

              return (
                <button
                  key={card.id}
                  onClick={() => cost >= actualCost && setSelectedCard(card)}
                  disabled={cost < actualCost}
                  className={`
                relative flex-shrink-0 w-24 h-28 rounded-xl border border-white/10 flex flex-col items-center justify-center transition-all group
                ${selectedCard?.id === card.id
                      ? 'bg-slate-700 border-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.4)] scale-110'
                      : 'bg-slate-800/80 hover:bg-slate-700 hover:-translate-y-2'}
                ${cost < actualCost ? 'opacity-40 grayscale cursor-not-allowed' : ''}
                ${selectedCard && selectedCard.id !== card.id ? 'opacity-60' : ''}
              `}
                >
                  <div
                    className={`mb-1 transition-transform group-hover:scale-110 ${card.type === 'red'
                      ? 'text-red-400'
                      : card.type === 'green'
                        ? 'text-green-400'
                        : card.type === 'purple'
                          ? 'text-purple-400'
                          : 'text-yellow-400'
                      }`}
                  >
                    {React.createElement(card.icon, { size: 36 })}
                  </div>

                  <div className="text-[10px] font-bold text-gray-300 mb-1 text-center leading-tight px-1">{card.name}</div>

                  <div className="flex items-baseline gap-1 bg-black/40 px-2 py-0.5 rounded">
                    {hasDiscount && (
                      <div className="text-[10px] line-through text-gray-500">{card.cost}</div>
                    )}
                    <div className={`text-lg font-black font-mono ${hasDiscount ? 'text-yellow-300' : 'text-white'}`}>
                      {actualCost}
                    </div>
                  </div>

                  {/* Badges */}
                  <div className="absolute top-1 right-1 text-[8px] text-slate-300 bg-slate-700/80 px-1 rounded border border-white/10">
                    {card.rangeType ? RANGE_LABEL[card.rangeType] : 'SUP'}
                  </div>
                  <div className="absolute top-1 left-1 text-[8px] font-bold text-cyan-300 bg-slate-700/80 px-1 rounded border border-white/10">
                    {card.duration === null ? 'INF' : `${Math.floor(card.duration / 60)}s`}
                  </div>
                  {hasDiscount && (
                    <div className="absolute -top-2 -right-2 text-[8px] font-bold text-slate-900 bg-yellow-400 px-1.5 py-0.5 rounded-full shadow-sm">
                      -{Math.floor(discount * 100)}%
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>


      {/* Remove Confirmation Modal */}
      {removeModal && (
        <div className="absolute inset-0 z-50 bg-black/80 flex items-center justify-center p-6">
          <div className="bg-slate-800 border-2 border-red-500 p-6 rounded-xl w-full max-w-md animate-in zoom-in">
            <h3 className="text-red-400 font-bold text-xl mb-4 flex items-center gap-2">
              <AlertTriangle /> 装備を撤去
            </h3>
            <p className="text-white text-lg mb-6">この設備を撤去しますか？</p>
            <div className="flex gap-3">
              <button
                onClick={confirmRemove}
                className="flex-1 p-4 bg-red-600 hover:bg-red-500 text-white font-bold rounded transition-colors"
              >
                撤去する
              </button>
              <button
                onClick={() => setRemoveModal(null)}
                className="flex-1 p-4 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded transition-colors"
              >
                キャンセル
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

