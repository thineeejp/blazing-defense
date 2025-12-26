import React, { useState } from 'react';
import { Check, X, Info, Zap, Shield, Crosshair, Activity, BarChart3 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import GameBackground from './ui/GameBackground';
import GlassCard from './ui/GlassCard';
import { useDeviceTypeContext } from '../contexts/DeviceTypeContext';

export default function DeckBuildPhase({
  availableCards,
  selectedCards,
  remainingCost,
  totalCost,
  _tiers,
  _categoryBuffs,
  onSelectCard,
  onStartBattle,
  onBackToTitle,
}) {
  const [detailCard, setDetailCard] = useState(null);

  // カードのコスト計算（Tier1は無料）
  const getSelectCost = (card) => card.tier === 1 ? 0 : card.cost;

  // 選択可能判定
  const canSelect = (card) => {
    if (selectedCards.includes(card.id)) return true;  // 解除は常に可能
    if (selectedCards.length >= 6) return false;       // 上限
    return remainingCost >= getSelectCost(card);       // コスト
  };

  // ハンドラ: 選択トグル（詳細画面から呼び出し）
  const handleToggleSelect = (card) => {
    if (!canSelect(card) && !selectedCards.includes(card.id)) return;
    onSelectCard(card.id);
    setDetailCard(null); // 選択/解除後に閉じる
  };

  return (
    <GameBackground className="flex flex-col min-h-[100dvh] overflow-hidden">
      {/* Header */}
      <header className="flex-none pt-6 md:pt-12 pb-4 px-4 z-10">
        <div className="max-w-6xl mx-auto w-full">
          {/* Back Button (タイトルの上に配置) */}
          <button
            onClick={onBackToTitle}
            className="mb-4 px-4 py-2 text-sm font-bold text-slate-400 hover:text-white bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700 rounded transition-colors"
          >
            ← RETURN TO TITLE
          </button>

          {/* Centered Title */}
          <div className="text-center w-full">
            <h1 className="text-3xl md:text-4xl font-black font-orbitron text-white tracking-wider mb-2">
              <span className="text-cyan-400">{'///'}</span> DECK BUILD <span className="text-cyan-400">PHASE</span>
            </h1>
            <p className="text-slate-400 text-xs font-mono tracking-widest">最大6つまで選択可能</p>
          </div>

          {/* モバイル用コスト表示 */}
          <div className="lg:hidden text-center mt-3">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800/80 rounded-lg border border-slate-700">
              <Zap className="text-yellow-400" size={16} />
              <span className="text-sm font-mono text-yellow-400 font-bold">
                COST: {remainingCost} / {totalCost}
              </span>
            </div>
          </div>

          {/* Stats Card (PC用 - 右側固定) */}
          <div className="absolute right-4 top-1/2 -translate-y-1/2 hidden lg:block">
            <GlassCard className="px-6 py-3 flex items-center gap-4" hoverEffect={false}>
              <div className="text-right">
                <div className="text-[10px] text-slate-400 font-bold mb-1">TOTAL COST</div>
                <div className="text-2xl font-bold font-mono text-yellow-400 drop-shadow-lg flex items-baseline justify-end gap-2">
                  {remainingCost} <span className="text-slate-600 text-sm">/ {totalCost}</span>
                </div>
              </div>
              <div className="relative">
                <div className="absolute inset-0 bg-yellow-400/30 blur-xl rounded-full animate-pulse" />
                <Zap className="text-yellow-400 relative z-10" size={20} />
              </div>
            </GlassCard>
          </div>
        </div>
      </header>

      {/* Card Grid */}
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        <div className="max-w-6xl mx-auto pb-32" style={{ paddingBottom: 'max(8rem, calc(8rem + env(safe-area-inset-bottom)))' }}>
          <motion.div
            layout
            className="grid grid-cols-2 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-4 mt-4"
          >
            <AnimatePresence>
              {availableCards.map(card => (
                <CardItemThumbnail
                  key={card.id}
                  card={card}
                  isSelected={selectedCards.includes(card.id)}
                  onClick={() => setDetailCard(card)}
                />
              ))}
            </AnimatePresence>
          </motion.div>
          {availableCards.length === 0 && (
            <div className="text-center text-slate-500 mt-20 font-orbitron text-xl animate-pulse">
              NO UNITS FOUND IN SECTOR
            </div>
          )}
        </div>
      </div>

      {/* Detail Modal (Overlay) */}
      <AnimatePresence>
        {detailCard && (
          <CardDetailOverlay
            card={detailCard}
            isSelected={selectedCards.includes(detailCard.id)}
            canSelect={canSelect(detailCard)}
            selectCost={getSelectCost(detailCard)}
            onToggleSelect={() => handleToggleSelect(detailCard)}
            onClose={() => setDetailCard(null)}
          />
        )}
      </AnimatePresence>

      {/* Footer (Selected Deck) - Fixed Bottom */}
      <div className="fixed bottom-0 left-0 right-0 z-20 pointer-events-none" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
        {/* Gradient Fade */}
        <div className="absolute bottom-0 inset-x-0 h-36 bg-gradient-to-t from-slate-950 via-slate-900/90 to-transparent" />

        <div className="relative max-w-7xl mx-auto p-4 flex flex-col items-center pointer-events-auto">
          {/* Deck List */}
          <div className="w-full flex justify-center mb-4">
            <GlassCard className="flex items-center gap-2 p-2 pr-6 rounded-full border-slate-700/50 bg-slate-900/80 backdrop-blur-xl" hoverEffect={false}>
              <div className="px-4 py-2 bg-slate-800 rounded-full text-xs font-bold text-slate-400 mr-2 border border-slate-700">
                DECK SLOTS {selectedCards.length}/6
              </div>
              <div className="flex gap-2">
                {[...Array(6)].map((_, i) => {
                  const cardId = selectedCards[i];
                  const card = cardId ? availableCards.find(c => c.id === cardId) : null;
                  return (
                    <div
                      key={i}
                      className={`
                        w-10 h-10 rounded-lg border flex items-center justify-center transition-all relative group
                        ${card
                          ? 'bg-slate-800 border-cyan-500/50 shadow-[0_0_10px_rgba(6,182,212,0.2)]'
                          : 'bg-slate-900/50 border-slate-800 border-dashed'}
                      `}
                    >
                      {card ? (
                        <>
                          <div className="text-cyan-400">
                            {React.createElement(card.icon, { size: 24 })}
                          </div>
                          <button
                            onClick={() => onSelectCard(card.id)}
                            className="absolute -top-2 -right-2 bg-red-500 rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X size={10} className="text-white" />
                          </button>
                        </>
                      ) : (
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-800" />
                      )}
                    </div>
                  );
                })}
              </div>
            </GlassCard>
          </div>

          {/* Start Button */}
          <button
            onClick={onStartBattle}
            disabled={selectedCards.length === 0}
            className={`
              w-full max-w-md py-3 mb-4 rounded-lg font-black text-xl font-orbitron tracking-[0.2em] transition-all shadow-xl
              flex items-center justify-center gap-4 group overflow-hidden relative
              ${selectedCards.length > 0
                ? 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-cyan-500/30'
                : 'bg-slate-800 text-slate-600 cursor-not-allowed border border-slate-700'}
            `}
          >
            {selectedCards.length > 0 && (
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer-slide_1s_infinite]" />
            )}
            <span>戦闘開始</span>
            <span className="text-sm opacity-50 group-hover:translate-x-1 transition-transform">{">>>"}</span>
          </button>
        </div>
      </div>
    </GameBackground>
  );
}

// ----------------------------------------------------------------------------
// Sub Components
// ----------------------------------------------------------------------------

// Thumbnail Card in Grid
function CardItemThumbnail({ card, isSelected, onClick }) {
  const typeColors = {
    red: 'bg-red-500',
    yellow: 'bg-yellow-500',
    green: 'bg-green-500',
    blue: 'bg-blue-500',
    purple: 'bg-purple-500',
  };

  const tierFiles = {
    1: { color: 'text-slate-300', label: 'I', border: 'border-slate-600', bg: 'bg-slate-800' },
    2: { color: 'text-cyan-300', label: 'II', border: 'border-cyan-600', bg: 'bg-cyan-950' },
    3: { color: 'text-yellow-300', label: 'III', border: 'border-yellow-600', bg: 'bg-yellow-950' },
  };

  const t = tierFiles[card.tier] || tierFiles[1];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      onClick={onClick}
      className={`
        relative aspect-[3/4] rounded-xl cursor-pointer group transition-all duration-300
        bg-slate-900/80 backdrop-blur-sm border-2 overflow-hidden flex flex-col
        ${isSelected
          ? 'ring-2 ring-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.4)] translate-y-[-4px] border-cyan-400'
          : 'hover:-translate-y-1 hover:shadow-xl border-slate-700 hover:border-slate-500'}
      `}
    >
      {/* Type Color Stripe (Thin Top) */}
      <div className={`h-1 w-full ${typeColors[card.type] || 'bg-slate-500'} shadow-[0_0_5px_currentColor]`} />

      {/* Background Gradient */}
      <div className={`absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-${card.type === 'red' ? 'red' : 'slate'}-900/50 opacity-30`} />

      {/* Selection Indicator */}
      {isSelected && (
        <div className="absolute top-2 right-2 z-10 bg-cyan-500 text-black rounded-full p-1 shadow-lg animate-bounce">
          <Check size={12} strokeWidth={4} />
        </div>
      )}

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-2 relative z-0">
        <div className="mb-2 drop-shadow-[0_0_10px_currentColor] text-slate-200 group-hover:scale-110 transition-transform duration-500">
          {React.createElement(card.icon, { size: 34 })}
        </div>

        <div className="text-center w-full px-1">
          <div className="font-bold text-white text-sm leading-tight font-russo line-clamp-2 drop-shadow-md">
            {card.name}
          </div>
        </div>
      </div>

      {/* Footer Info (Tier & Cost) */}
      <div className="relative z-10 p-2 bg-slate-950/90 border-t border-white/5 flex gap-2 justify-between items-center">
        {/* Tier Badge */}
        <div className={`
          px-1.5 py-0.5 rounded text-[10px] font-black font-orbitron tracking-widest border
          ${t.bg} ${t.color} ${t.border}
        `}>
          TIER-{t.label}
        </div>

        {/* Cost */}
        <div className="flex flex-col items-end leading-none">
          <span className="text-[8px] text-slate-500 font-mono">COST</span>
          <span className={`font-mono font-bold text-sm ${card.cost === 0 ? 'text-green-400' : 'text-yellow-400'}`}>
            {card.cost === 0 ? 'FREE' : card.cost}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

// ----------------------------------------------------------------------------
// Detailed Overlay (The "Rich" Part)
// ----------------------------------------------------------------------------

function CardDetailOverlay({ card, isSelected, canSelect, selectCost: _selectCost, onToggleSelect, onClose }) {
  const { isMobile } = useDeviceTypeContext();
  const iconSize = isMobile ? 64 : 100;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        onClick={e => e.stopPropagation()}
        className="relative w-full max-w-3xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-y-auto flex flex-col md:flex-row max-h-[85dvh] md:max-h-[500px]"
      >
        {/* Left Side: Visual & Identity */}
        <div className="md:w-5/12 relative bg-slate-800 p-4 md:p-6 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-slate-700 overflow-hidden group">
          {/* Animated BG */}
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-cyan-900 via-slate-900 to-slate-900" />
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />

          {/* 設備名（1行目） */}
          <h2 className="relative z-10 text-lg md:text-2xl font-black text-white font-orbitron tracking-wide mb-3 text-center">
            {card.name}
          </h2>
          {/* Tier + コスト（2行目） */}
          <div className="relative z-10 flex items-center justify-center gap-3">
            <span className="px-3 py-1 bg-slate-700 rounded text-sm font-mono text-cyan-400 border border-cyan-500/30">
              Tier {card.tier}
            </span>
            <span className="px-3 py-1 bg-yellow-500/20 rounded text-sm font-mono font-bold text-yellow-400 border border-yellow-500/30">
              コスト {card.cost}
            </span>
          </div>
        </div>

        {/* Right Side: Data & Controls */}
        <div className="flex-1 flex flex-col bg-slate-900/50">
          {/* Content Scroll */}
          <div className="flex-1 overflow-y-auto p-6 pt-4 custom-scrollbar space-y-8">
            {/* Description */}
            <div>
              <h3 className="text-sm font-bold text-slate-300 mb-2 flex items-center gap-2">
                <Info size={16} className="text-cyan-500" /> SYSTEM DESCRIPTION
              </h3>
              <p className="text-slate-400 leading-relaxed text-sm bg-slate-950/50 p-4 rounded-lg border border-slate-800">
                {card.desc}
              </p>
            </div>

            {/* Range Viz */}
            <div className="flex gap-8">
              <div className="flex-1">
                <h3 className="text-sm font-bold text-slate-300 mb-4 flex items-center gap-2">
                  <BarChart3 size={16} className="text-cyan-500" /> PERFORMANCE
                </h3>
                <div className="space-y-4">
                  {/* Stats Bars */}
                  <StatBar label="攻撃力" value={card.power} max={100} color="bg-red-500" />
                  <StatBar
                    label="攻撃速度"
                    value={card.speed ? (60 / card.speed) : 0}
                    max={12}
                    color="bg-cyan-500"
                    formatValue={(v) => v > 0 ? `${v.toFixed(1)}/s` : '-'}
                  />
                  <StatBar
                    label="持続時間"
                    value={card.duration || 3600}
                    max={3600}
                    color="bg-purple-500"
                    formatValue={(v) => !card.duration ? '∞' : `${(v / 60).toFixed(0)}s`}
                  />
                </div>
              </div>

              <div className="flex-none">
                <h3 className="text-sm font-bold text-slate-300 mb-4 flex items-center gap-2">
                  <Crosshair size={16} className="text-cyan-500" /> RANGE
                </h3>
                <RangeVisualizer rangeType={card.rangeType} />
              </div>
            </div>
          </div>

          {/* Action Footer */}
          <div className="p-6 border-t border-slate-800 bg-slate-900 z-10 flex gap-4">
            {/* Back Button */}
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl font-bold font-orbitron tracking-widest text-sm md:text-base bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white transition-colors border border-slate-700"
            >
              戻る
            </button>

            {/* Select/Remove Button */}
            <button
              onClick={onToggleSelect}
              disabled={!isSelected && !canSelect}
              className={`
                  flex-[2] py-2.5 rounded-xl font-bold font-orbitron tracking-widest text-sm md:text-base flex items-center justify-center gap-3 transition-all
                  ${isSelected
                  ? 'bg-red-500/20 text-red-400 border border-red-500/50 hover:bg-red-500 hover:text-white'
                  : canSelect
                    ? 'bg-cyan-500 hover:bg-cyan-400 text-slate-900 shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:shadow-cyan-400/60 hover:-translate-y-1'
                    : 'bg-slate-800 text-slate-600 cursor-not-allowed border border-slate-700'
                }
               `}
            >
              {isSelected ? (
                <>
                  <X size={20} /> 解除する
                </>
              ) : (
                <>
                  {canSelect ? <Check size={20} /> : <Shield size={20} />}
                  {canSelect ? '選択する' : 'コスト不足'}
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function StatBar({ label, value, max, color, formatValue }) {
  const pct = Math.min(100, Math.max(0, ((value || 0) / max) * 100));

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs font-mono">
        <span className="text-slate-500">{label}</span>
        <span className="text-slate-200">{formatValue ? formatValue(value) : value}</span>
      </div>
      <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
        <div
          className={`h-full ${color} shadow-[0_0_10px_currentColor] transition-all duration-1000 ease-out`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function RangeVisualizer({ rangeType }) {
  // 5x5 Grid, Center is 2,2
  const gridSize = 5;
  const center = 2;

  // 範囲判定ロジック
  const isInRange = (r, c) => {
    const dr = r - center; // row delta (grid row)
    const dc = c - center; // col delta (grid col)

    // Tower is at 0,0 relative (Center)

    // Surround: 3x3 square
    if (rangeType === 'surround') {
      return Math.abs(dr) <= 1 && Math.abs(dc) <= 1;
    }

    // Line: Upward vertical line (IndoorHydrant)
    // ゲーム内の「前方」＝画面上方向（rowが減る方向）
    if (rangeType === 'line') {
      return c === center && r <= center;
    }

    // TripleRow (Sprinkler): 3 Horizontal Rows
    if (rangeType === 'tripleRow') {
      return Math.abs(dr) <= 1; // 横方向(c)は無限（全列）、縦(r)は3行
    }

    // SurroundRow (FoamSystem): 3x3 + Center Horizontal Row
    if (rangeType === 'surroundRow') {
      // 周囲3x3 + 横1行
      return (Math.abs(dr) <= 1 && Math.abs(dc) <= 1) || dr === 0;
    }

    // Row (FireDoor): Single Horizontal Row
    if (rangeType === 'row') {
      return dr === 0;
    }

    // Global
    if (rangeType === 'global') {
      return true;
    }

    // Self: Center only
    return r === center && c === center;
  };

  return (
    <div className="bg-slate-950 p-1.5 rounded border border-slate-800 inline-block shadow-inner">
      <div className="grid grid-cols-5 gap-0.5">
        {[...Array(gridSize * gridSize)].map((_, i) => {
          const r = Math.floor(i / gridSize);
          const c = i % gridSize;
          const isCenter = r === center && c === center;
          const active = isInRange(r, c);

          return (
            <div
              key={i}
              className={`
                   w-2.5 h-2.5 rounded-sm transition-all duration-300
                   ${isCenter ? 'bg-white shadow-[0_0_8px_white] z-10 scale-110' : ''}
                   ${active && !isCenter ? 'bg-cyan-500/50 shadow-[0_0_5px_rgba(6,182,212,0.5)]' : 'bg-slate-900'}
                   ${!isCenter && !active ? 'opacity-20' : ''}
                `}
            />
          );
        })}
      </div>
      <div className="text-[10px] text-center text-slate-500 mt-1 font-mono uppercase">{rangeType}</div>
    </div>
  );
}
