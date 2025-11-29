import React from 'react';
import { Flame, ShieldAlert, Zap, AlertTriangle, HelpCircle, Skull, Users } from 'lucide-react';

const GRID_ROWS = 6;
const RANGE_LABEL = {
  surround: 'Surround',
  wide: 'Wide',
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
  supplyModal,
  removeModal,
  supplyCooldown,
  damaged,
  categoryBuffs,
  globalCostReduction = 0,
  handleSlotClick,
  setSelectedCard,
  triggerSupply,
  answerSupply,
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

      {/* Header */}
      <div className="h-16 bg-slate-900 border-b border-slate-700 flex justify-between items-center px-4 z-20 shadow-lg">
        <div className="flex gap-4">
          <div className={`flex items-center gap-2 px-3 py-1 rounded border transition-colors ${damaged ? 'bg-red-600 text-white border-white scale-110' : 'bg-red-900/40 text-red-400 border-red-900'}`}>
            <ShieldAlert size={18} /> <span className="font-mono font-bold text-xl">{Math.floor(hp)}%</span>
          </div>
          <div className="flex items-center gap-2 bg-yellow-900/40 text-yellow-400 px-3 py-1 rounded border border-yellow-900">
            <Zap size={18} /> <span className="font-mono font-bold text-xl">{Math.floor(cost)}</span>
          </div>
          <div className="flex items-center gap-2 bg-green-900/40 text-green-400 px-3 py-1 rounded border border-green-900">
            <Users size={18} />
            <span className="font-mono font-bold text-xl">{Math.floor(evacuatedCount)}/{evacuationGoal}</span>
          </div>
        </div>
        <div className="font-mono font-bold text-white text-xl">
          谿九ｊ譎る俣: {Math.floor((timeLimit - frameCount) / 60)}遘・        </div>
      </div>

      {/* Main 3D Grid Area */}
      <div className={`flex-1 relative flex items-center justify-center p-4 ${damaged ? 'translate-x-1 translate-y-1' : ''}`}>
        <div className="absolute top-4 text-red-900/30 font-bold text-4xl select-none z-0">DANGER ZONE</div>

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
                  relative border border-slate-700/50 flex items-center justify-center
                  ${isDefenseLine ? 'bg-blue-900/10 border-b-4 border-b-blue-500/80 shadow-[0_0_15px_rgba(59,130,246,0.3)]' : 'bg-slate-800/30'}
                  hover:bg-white/10 cursor-pointer transition-colors
                `}
              >
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20 pointer-events-none" />
                {isDefenseLine && <div className="absolute bottom-0 text-[8px] text-blue-500 font-bold opacity-50">DEFENSE LINE</div>}

                {tower && (
                  <div
                    className={`relative z-10 flex flex-col items-center transform transition-transform duration-300 hover:scale-110
                      ${tower.card.type === 'red' ? 'text-red-400' : tower.card.type === 'green' ? 'text-green-400' : tower.card.type === 'purple' ? 'text-purple-400' : 'text-yellow-400'}
                    `}
                  >
                    <div className="drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)]">
                      {React.createElement(tower.card.icon, { size: 24 })}
                    </div>

                    {/* 謾ｻ謦・ち繧､繝槭・繝舌・ */}
                    <div className="w-8 h-1 bg-gray-700 mt-1 rounded overflow-hidden">
                      <div
                        className="h-full bg-current"
                        style={{ width: `${(tower.timer / (tower.lastInterval || tower.card.speed || tower.card.interval)) * 100}%` }}
                      />
                    </div>

                    {/* 謖∫ｶ壽凾髢楢｡ｨ遉ｺ */}
                    {tower.card.duration === null ? (
                      <div className="text-[8px] font-bold text-green-300 mt-0.5">INF</div>
                    ) : (
                      (() => {
                        const remaining = tower.card.duration - tower.lifeTime;
                        const remainingSec = Math.ceil(remaining / 60);
                        const percentage = (remaining / tower.card.duration) * 100;
                        const barColor = percentage > 50 ? 'bg-green-400' : percentage > 20 ? 'bg-yellow-400' : 'bg-red-400';
                        return (
                          <>
                            <div className="w-8 h-0.5 bg-gray-900 mt-0.5 rounded overflow-hidden">
                              <div className={`h-full ${barColor}`} style={{ width: `${percentage}%` }} />
                            </div>
                            <div className={`text-[7px] font-bold mt-0.5 ${percentage > 20 ? 'text-white' : 'text-red-300 animate-pulse'}`}>
                              {remainingSec}遘・                            </div>
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
                <div className={`relative w-full h-full flex items-center justify-center ${e.color} ${e.isAttacking ? 'scale-150 opacity-80' : ''}`}>
                  {e.isAttacking ? (
                    <Skull size={e.size * 32} className="animate-pulse text-white drop-shadow-[0_0_10px_red]" />
                  ) : (
                    <Flame
                      size={e.size * 32}
                      className="filter drop-shadow-[0_0_10px_rgba(255,100,0,0.6)] animate-pulse"
                      fill="currentColor"
                    />
                  )}
                  {!e.isAttacking && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-12 h-1 bg-black/60 rounded overflow-hidden shadow">
                      <div className="h-full bg-red-500" style={{ width: `${(e.hp / e.maxHp) * 100}%` }} />
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
                className={`absolute z-30 pointer-events-none ${ef.color} whitespace-nowrap`}
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

      {/* Emergency Button */}
      <button
        onClick={triggerSupply}
        disabled={supplyCooldown > 0}
        className={`absolute top-20 right-4 z-40 bg-slate-800 border-2 border-blue-500 p-3 rounded-full shadow-xl transition-all
          ${supplyCooldown > 0 ? 'opacity-50 grayscale' : 'hover:scale-110 active:scale-95 animate-pulse'}
        `}
      >
        <HelpCircle size={32} className="text-blue-400" />
        {supplyCooldown > 0 && (
          <span className="absolute -bottom-6 right-0 text-xs font-bold text-white bg-black px-1 rounded">
            {Math.ceil(supplyCooldown / 30)}
          </span>
        )}
      </button>

      {/* Deck (Bottom) */}
      <div className="h-32 bg-slate-900 border-t border-slate-700 z-30 flex items-center justify-center gap-2 p-2 overflow-x-auto">
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
                relative flex-shrink-0 w-24 h-24 rounded-lg border-b-4 flex flex-col items-center justify-center transition-all
                ${selectedCard?.id === card.id ? 'bg-slate-700 border-white -translate-y-2' : 'bg-slate-800 border-black/30 hover:bg-slate-700'}
                ${cost < actualCost ? 'opacity-40 grayscale cursor-not-allowed' : ''}
              `}
            >
              <div
                className={`${
                  card.type === 'red'
                    ? 'text-red-400'
                    : card.type === 'green'
                      ? 'text-green-400'
                      : card.type === 'purple'
                        ? 'text-purple-400'
                        : 'text-yellow-400'
                }`}
              >
                {React.createElement(card.icon, { size: 32 })}
              </div>
              <div className="text-[10px] font-bold text-gray-300 mt-1">{card.name}</div>
              <div className="flex items-baseline gap-1">
                {hasDiscount && (
                  <div className="text-xs line-through text-gray-500">{card.cost}</div>
                )}
                <div className={`text-lg font-black ${hasDiscount ? 'text-yellow-300' : 'text-white'}`}>
                  {actualCost}
                </div>
              </div>
              <div className="absolute top-1 right-1 text-[8px] text-gray-500 bg-black/50 px-1 rounded">
                {card.rangeType ? RANGE_LABEL[card.rangeType] : '謾ｯ謠ｴ'}
              </div>
              <div className="absolute top-1 left-1 text-[8px] font-bold text-cyan-300 bg-black/50 px-1 rounded">
                {card.duration === null ? 'INF' : `${Math.floor(card.duration / 60)}s`}
              </div>
              {hasDiscount && (
                <div className="absolute bottom-0 right-0 text-[8px] font-bold text-yellow-400 bg-black/70 px-1 rounded">
                  -{Math.floor(discount * 100)}%
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Emergency Modal */}
      {supplyModal && (
        <div className="absolute inset-0 z-50 bg-black/80 flex items-center justify-center p-6">
          <div className="bg-slate-800 border-2 border-yellow-500 p-6 rounded-xl w-full max-w-md animate-in zoom-in">
            <h3 className="text-yellow-400 font-bold text-xl mb-4 flex items-center gap-2">
              <AlertTriangle /> 邱頑･陬懃ｵｦ繧ｯ繧､繧ｺ
            </h3>
            <p className="text-white text-lg font-bold mb-6">{supplyModal.q}</p>
            <div className="space-y-3">
              {supplyModal.options.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => answerSupply(i)}
                  className="w-full p-4 bg-slate-700 hover:bg-yellow-600 text-white font-bold rounded text-left transition-colors"
                >
                  {i + 1}. {opt}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

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
