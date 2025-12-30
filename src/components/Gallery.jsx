import { useState } from 'react';
import { Trophy, Award, Globe } from 'lucide-react';
import Achievements from './Achievements';
import HighScores from './HighScores';
import Ranking from './Ranking';

/**
 * ギャラリー画面
 * ACHIEVEMENTS / HIGH SCORES / RANKING をタブで切り替え表示
 */
export default function Gallery({ onBack, uid }) {
  const [activeTab, setActiveTab] = useState('achievements'); // 'achievements' | 'highscores' | 'ranking'

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* タブヘッダー */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-slate-900/80 backdrop-blur-sm border-b border-white/10">
        <div className="flex items-center justify-center gap-2 md:gap-4 p-4 flex-wrap">
          {/* ACHIEVEMENTSタブ */}
          <button
            onClick={() => setActiveTab('achievements')}
            className={`
              flex items-center gap-1.5 md:gap-2 px-4 md:px-6 py-2 md:py-3 rounded-lg font-bold text-sm md:text-base transition-all
              ${
                activeTab === 'achievements'
                  ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/30'
                  : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700 hover:text-white'
              }
            `}
          >
            <Award size={18} className="md:w-5 md:h-5" />
            <span>ACHIEVEMENTS</span>
          </button>

          {/* HIGH SCORESタブ */}
          <button
            onClick={() => setActiveTab('highscores')}
            className={`
              flex items-center gap-1.5 md:gap-2 px-4 md:px-6 py-2 md:py-3 rounded-lg font-bold text-sm md:text-base transition-all
              ${
                activeTab === 'highscores'
                  ? 'bg-yellow-500 text-slate-900 shadow-lg shadow-yellow-500/30'
                  : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700 hover:text-white'
              }
            `}
          >
            <Trophy size={18} className="md:w-5 md:h-5" />
            <span>HIGH SCORES</span>
          </button>

          {/* RANKINGタブ */}
          <button
            onClick={() => setActiveTab('ranking')}
            className={`
              flex items-center gap-1.5 md:gap-2 px-4 md:px-6 py-2 md:py-3 rounded-lg font-bold text-sm md:text-base transition-all
              ${
                activeTab === 'ranking'
                  ? 'bg-cyan-500 text-slate-900 shadow-lg shadow-cyan-500/30'
                  : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700 hover:text-white'
              }
            `}
          >
            <Globe size={18} className="md:w-5 md:h-5" />
            <span>RANKING</span>
          </button>
        </div>
      </div>

      {/* コンテンツエリア */}
      <div className="pt-20 min-h-full pb-8">
        {activeTab === 'achievements' && <Achievements onBack={onBack} />}
        {activeTab === 'highscores' && <HighScores onBack={onBack} />}
        {activeTab === 'ranking' && <Ranking onBack={onBack} uid={uid} />}
      </div>
    </div>
  );
}
