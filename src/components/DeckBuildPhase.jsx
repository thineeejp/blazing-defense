import React, { useState } from 'react';
import { EQUIPMENT_TREES } from '../constants/equipment';
import { Check, X, Info, Zap } from 'lucide-react';
import GameBackground from './ui/GameBackground';
import GlassCard from './ui/GlassCard';

export default function DeckBuildPhase({
  availableCards,
  selectedCards,
  remainingCost,
  totalCost,
  _tiers,
  _categoryBuffs,
  onSelectCard,
  onStartBattle,
}) {
  const [filter, setFilter] = useState('all');
  const [detailCard, setDetailCard] = useState(null);

  // フィルタリング
  const filteredCards = filter === 'all'
    ? availableCards
    : availableCards.filter(c => c.category === filter);

  // カードのコスト計算（Tier1は無料）
  const getSelectCost = (card) => card.tier === 1 ? 0 : card.cost;

  // 選択可能判定
  const canSelect = (card) => {
    if (selectedCards.includes(card.id)) return true;  // 解除は常に可能
    if (selectedCards.length >= 6) return false;       // 上限
    return remainingCost >= getSelectCost(card);       // コスト
  };

  return (
    <GameBackground className="flex flex-col h-screen overflow-hidden">
      {/* Header */}
      <header className="flex-none p-4 z-10">
        <div className="flex justify-between items-center max-w-7xl mx-auto w-full">
          <div>
            <h1 className="text-3xl font-black font-orbitron text-white tracking-wider">DECK BUILD</h1>
            <p className="text-slate-400 text-sm">SELECT EQUIPMENT (1-6)</p>
          </div>

          <GlassCard className="px-6 py-3 flex items-center gap-4" hoverEffect={false}>
            <div className="text-right">
              <div className="text-xs text-slate-400 font-bold">REMAINING COST</div>
              <div className="text-2xl font-bold font-mono text-yellow-400">
                {remainingCost} <span className="text-slate-500 text-lg">/ {totalCost}</span>
              </div>
            </div>
            <Zap className="text-yellow-400 fill-yellow-400/20" size={32} />
          </GlassCard>
        </div>
      </header>

      {/* Category Filter */}
      <div className="flex-none px-4 pb-4 z-10">
        <div className="flex justify-center gap-2 max-w-7xl mx-auto flex-wrap">
          <FilterButton active={filter === 'all'} onClick={() => setFilter('all')}>
            ALL ({availableCards.length})
          </FilterButton>
          {Object.entries(EQUIPMENT_TREES).map(([catId, tree]) => {
            const count = availableCards.filter(c => c.category === catId).length;
            return (
              <FilterButton
                key={catId}
                active={filter === catId}
                onClick={() => setFilter(catId)}
                category={catId}
              >
                {tree.name} ({count})
              </FilterButton>
            );
          })}
        </div>
      </div>

      {/* Card Grid */}
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        <div className="max-w-7xl mx-auto">
          {filteredCards.length === 0 ? (
            <div className="text-center text-slate-500 mt-20 font-orbitron text-xl">
              NO EQUIPMENT AVAILABLE IN THIS CATEGORY
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 pb-32">
              {filteredCards.map(card => (
                <CardItem
                  key={card.id}
                  card={card}
                  isSelected={selectedCards.includes(card.id)}
                  canSelect={canSelect(card)}
                  selectCost={getSelectCost(card)}
                  onSelect={() => onSelectCard(card.id)}
                  onShowDetail={() => setDetailCard(card)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer (Selected Deck) */}
      <div className="fixed bottom-0 left-0 right-0 p-4 z-20 bg-gradient-to-t from-slate-900 via-slate-900/90 to-transparent">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-4">

          {/* Selected Cards List */}
          <GlassCard className="flex-1 w-full p-3 flex items-center gap-2 overflow-x-auto min-h-[80px]" hoverEffect={false}>
            <div className="text-xs font-bold text-slate-500 mr-2 whitespace-nowrap">
              DECK ({selectedCards.length}/6)
            </div>
            {selectedCards.length === 0 ? (
              <div className="text-slate-600 text-sm italic">Select equipment to build your deck...</div>
            ) : (
              selectedCards.map(cardId => {
                const card = availableCards.find(c => c.id === cardId);
                if (!card) return null;
                return (
                  <div
                    key={cardId}
                    className="flex items-center gap-2 bg-slate-800/80 border border-slate-600 px-3 py-1.5 rounded-lg whitespace-nowrap animate-fadeIn"
                  >
                    {React.createElement(card.icon, { size: 16, className: "text-cyan-400" })}
                    <span className="text-sm font-bold text-slate-200">{card.name}</span>
                    <button
                      onClick={() => onSelectCard(cardId)}
                      className="ml-1 text-slate-500 hover:text-red-400 transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </div>
                );
              })
            )}
          </GlassCard>

          {/* Start Button */}
          <button
            onClick={onStartBattle}
            disabled={selectedCards.length === 0}
            className={`
              px-8 py-4 rounded-xl font-bold text-lg font-orbitron tracking-wider transition-all shadow-lg whitespace-nowrap
              ${selectedCards.length > 0
                ? 'bg-green-500 hover:bg-green-400 text-slate-900 shadow-green-500/30 hover:scale-105'
                : 'bg-slate-700 text-slate-500 cursor-not-allowed'}
            `}
          >
            START BATTLE
          </button>
        </div>
      </div>

      {/* Detail Modal */}
      {detailCard && (
        <CardDetailModal card={detailCard} onClose={() => setDetailCard(null)} />
      )}
    </GameBackground>
  );
}

// サブコンポーネント: フィルターボタン
function FilterButton({ active, onClick, category, children }) {
  const categoryColors = {
    fire: 'bg-red-600',
    alarm: 'bg-yellow-600',
    evacuation: 'bg-green-600',
    facility: 'bg-blue-600',
    other: 'bg-purple-600',
  };

  const activeClass = category
    ? categoryColors[category]
    : 'bg-slate-500';

  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-lg font-bold transition-all ${active
          ? `${activeClass} text-white`
          : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
        }`}
    >
      {children}
    </button>
  );
}

// サブコンポーネント: カードアイテム
function CardItem({ card, isSelected, canSelect, selectCost, onSelect, onShowDetail }) {
  const typeColors = {
    red: 'border-red-500 bg-red-900/20',
    yellow: 'border-yellow-500 bg-yellow-900/20',
    green: 'border-green-500 bg-green-900/20',
    blue: 'border-blue-500 bg-blue-900/20',
    purple: 'border-purple-500 bg-purple-900/20',
  };

  return (
    <div
      onClick={canSelect ? onSelect : undefined}
      className={`
        relative p-4 rounded-lg border-2 transition-all
        ${typeColors[card.type] || 'border-gray-600 bg-gray-900/20'}
        ${isSelected ? 'ring-2 ring-green-400 scale-105' : ''}
        ${!canSelect && !isSelected ? 'opacity-40 grayscale cursor-not-allowed' : 'hover:scale-105 cursor-pointer'}
      `}
    >
      {/* 選択済みマーク */}
      {isSelected && (
        <div className="absolute top-1 right-1 bg-green-500 rounded-full p-1">
          <Check size={14} />
        </div>
      )}

      {/* アイコン */}
      <div className="flex justify-center mb-2">
        {React.createElement(card.icon, { size: 40 })}
      </div>

      {/* カード名 */}
      <div className="text-center font-bold text-sm mb-1 line-clamp-2">{card.name}</div>

      {/* Tier表示 */}
      <div className="text-center text-xs text-gray-400 mb-2">Tier {card.tier}</div>

      {/* 選択コスト */}
      <div className="text-center">
        {selectCost === 0 ? (
          <span className="text-green-400 font-bold">無料</span>
        ) : (
          <span className="text-yellow-400 font-bold">{selectCost}</span>
        )}
      </div>

      {/* 詳細ボタン */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onShowDetail();
        }}
        className="absolute bottom-1 right-1 text-gray-400 hover:text-white transition-colors"
      >
        <Info size={16} />
      </button>
    </div>
  );
}

// サブコンポーネント: 詳細モーダル
function CardDetailModal({ card, onClose }) {
  const RANGE_LABELS = {
    surround: '周囲8マス',
    line: '横1列',
    wide: '周囲+横1列',
    global: '全体',
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-slate-800 border-2 border-slate-600 rounded-xl p-6 max-w-md w-full"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3">
            {React.createElement(card.icon, { size: 48 })}
            <div>
              <h3 className="text-xl font-bold">{card.name}</h3>
              <div className="text-sm text-gray-400">Tier {card.tier}</div>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        <p className="text-gray-300 mb-4">{card.desc}</p>

        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-400">配置コスト</span>
            <span className="font-bold">{card.cost}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">持続時間</span>
            <span className="font-bold">
              {card.duration === null ? '永続' : `${Math.floor(card.duration / 60)}秒`}
            </span>
          </div>
          {card.power !== undefined && (
            <div className="flex justify-between">
              <span className="text-gray-400">攻撃力</span>
              <span className="font-bold">{card.power}</span>
            </div>
          )}
          {card.rangeType && (
            <div className="flex justify-between">
              <span className="text-gray-400">攻撃範囲</span>
              <span className="font-bold">{RANGE_LABELS[card.rangeType] || card.rangeType}</span>
            </div>
          )}
          {card.speed && (
            <div className="flex justify-between">
              <span className="text-gray-400">攻撃速度</span>
              <span className="font-bold">{card.speed}フレーム</span>
            </div>
          )}
          {card.value !== undefined && (
            <div className="flex justify-between">
              <span className="text-gray-400">効果値</span>
              <span className="font-bold">{card.value}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
