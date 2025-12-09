import React from 'react';
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
  evacuatedCount,
  evacuationGoal,
  frameCount,
  timeLimit,
  towers,
  enemies,
  effects,
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
}) {
  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: `repeat(${difficulty.cols}, 1fr)`,
    gridTemplateRows: `repeat(${GRID_ROWS}, 1fr)`,
    transform: 'perspective(600px) rotateX(20deg)',
    transformStyle: 'preserve-3d',
  };

  return (
    <div className={`w-full h-full flex flex-col bg-slate-950 overflow-hidden relative transition-colors duration-100 ${damaged ? 'bg-red-900/50' : ''}`}>
      {damaged && <div className="absolute inset-0 bg-red-600/30 z-50 pointer-events-none animate-pulse"></div>}

      {/* Header (HUD) */}
      <div className="absolute top-0 left-0 right-0 p-4 z-20 flex justify-between items-start pointer-events-none">
        <div className="flex gap-4 pointer-events-auto">
          <GlassCard className="flex items-center gap-3 px-4 py-2" hoverEffect={false}>
            <ShieldAlert size={20} className={damaged ? 'text-red-500 animate-pulse' : 'text-blue-400'} />
            <div>
              <div className="text-[10px] font-bold text-slate-400">DEFENSE HP</div>
              <div className={`font-mono font-bold text-xl ${damaged ? 'text-red-500' : 'text-white'}`}>
                {Math.floor(hp)}%
              </div>
            </div>
          </GlassCard>

          <GlassCard className="flex items-center gap-3 px-4 py-2" hoverEffect={false}>
            <Zap size={20} className="text-yellow-400" />
            <div>
              <div className="text-[10px] font-bold text-slate-400">COST</div>
              <div className="font-mono font-bold text-xl text-yellow-400">
                {Math.floor(cost)}
              </div>
            </div>
          </GlassCard>

          <GlassCard className="flex items-center gap-3 px-4 py-2" hoverEffect={false}>
            <Users size={20} className="text-green-400" />
            <div>
              <div className="text-[10px] font-bold text-slate-400">EVACUATED</div>
              <div className="font-mono font-bold text-xl text-white">
                {Math.floor(evacuatedCount)} <span className="text-sm text-slate-500">/ {evacuationGoal}</span>
              </div>
            </div>
          </GlassCard>
        </div>

        <GlassCard className="px-6 py-2 pointer-events-auto" hoverEffect={false}>
          <div className="text-[10px] font-bold text-slate-400 text-center">TIME LIMIT</div>
          <div className="font-mono font-bold text-2xl text-white w-24 text-center">
            {Math.floor((timeLimit - frameCount) / 60)}<span className="text-sm">s</span>
          </div>
        </GlassCard>
      </div>

      {/* Main 3D Grid Area */}
      <div className={`flex-1 relative flex items-center justify-center p-4 ${damaged ? 'translate-x-1 translate-y-1' : ''}`}>
        <div className="absolute top-20 text-red-900/20 font-black text-6xl select-none z-0 font-orbitron tracking-widest pointer-events-none">
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
                className={`
                  relative border border-white/5 flex items-center justify-center
                  ${isDefenseLine ? 'bg-blue-900/10 border-b-2 border-b-blue-500/50' : 'bg-slate-800/20'}
                  hover:bg-white/10 cursor-pointer transition-colors backdrop-blur-[1px]
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

          {/* Enemies */}
          {enemies.map((e) => {
            const topPct = (e.progress / GRID_ROWS) * 100;
            const leftPct = (e.c / difficulty.cols) * 100;
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
                }}
              >
                {/* 敵表示がマスへのクリックを阻害しないよう、子要素も pointer-events 無効化 */}
                <div className={`relative w-full h-full flex items-center justify-center ${e.color} ${e.isAttacking ? 'scale-150 opacity-80' : ''} pointer-events-none`}>
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

          {/* Effects */}
          {effects.map((ef) => {
            const topPct = (Math.floor(ef.r) / GRID_ROWS) * 100;
            const leftPct = (ef.c / difficultyRef.current.cols) * 100;
            return (
              <div
                key={ef.id}
                className={`absolute z-30 pointer-events-none ${ef.color} whitespace-nowrap font-bold drop-shadow-md`}
                style={{
                  top: `${topPct}%`,
                  left: `${leftPct}%`,
                  transform: `translateY(${ef.y * 20}px)`,
                }}
              >
                {ef.text}
              </div>
            );
          })}
        </div>
      </div>

      {/* Deck (Bottom) */}
      <div className="h-36 z-30 flex flex-col p-4 bg-gradient-to-t from-slate-950 via-slate-900/90 to-transparent">
        {/* 操作ガイダンス */}
        <div className="text-xs text-center mb-3 text-slate-400 font-mono pt-1">
          カードをクリック → グリッドをクリックで配置
        </div>
        {/* Deck Cards Container */}
        <div className="flex-1 flex items-center justify-center">
        {/* Deck Cards */}
        <div className="flex items-center justify-center gap-3 overflow-x-auto w-full">
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
                  ? 'bg-slate-700 border-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.4)] -translate-y-4 scale-110'
                  : 'bg-slate-800/80 hover:bg-slate-700 hover:-translate-y-2'}
                ${cost < actualCost ? 'opacity-40 grayscale cursor-not-allowed' : ''}
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
              <AlertTriangle /> Remove Equipment
            </h3>
            <p className="text-white text-lg mb-6">Do you want to remove this equipment?</p>
            <div className="flex gap-3">
              <button
                onClick={confirmRemove}
                className="flex-1 p-4 bg-red-600 hover:bg-red-500 text-white font-bold rounded transition-colors"
              >
                Remove
              </button>
              <button
                onClick={() => setRemoveModal(null)}
                className="flex-1 p-4 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
