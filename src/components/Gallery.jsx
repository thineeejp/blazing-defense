import { useState } from 'react';
import { Trophy, Award } from 'lucide-react';
import Achievements from './Achievements';
import HighScores from './HighScores';

/**
 * ギャラリー画面
 * ACHIEVEMENTSとHIGH SCORESをタブで切り替え表示
 */
export default function Gallery({ onBack }) {
  const [activeTab, setActiveTab] = useState('achievements'); // 'achievements' | 'highscores'

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* タブヘッダー */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-slate-900/80 backdrop-blur-sm border-b border-white/10">
        <div className="flex items-center justify-center gap-4 p-4">
          {/* ACHIEVEMENTSタブ */}
          <button
            onClick={() => setActiveTab('achievements')}
            className={`
              flex items-center gap-2 px-6 py-3 rounded-lg font-bold transition-all
              ${
                activeTab === 'achievements'
                  ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/30'
                  : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700 hover:text-white'
              }
            `}
          >
            <Award size={20} />
            <span>ACHIEVEMENTS</span>
          </button>

          {/* HIGH SCORESタブ */}
          <button
            onClick={() => setActiveTab('highscores')}
            className={`
              flex items-center gap-2 px-6 py-3 rounded-lg font-bold transition-all
              ${
                activeTab === 'highscores'
                  ? 'bg-yellow-500 text-slate-900 shadow-lg shadow-yellow-500/30'
                  : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700 hover:text-white'
              }
            `}
          >
            <Trophy size={20} />
            <span>HIGH SCORES</span>
          </button>
        </div>
      </div>

      {/* コンテンツエリア */}
      <div className="pt-20 h-full">
        {activeTab === 'achievements' && <Achievements onBack={onBack} />}
        {activeTab === 'highscores' && <HighScores onBack={onBack} />}
      </div>
    </div>
  );
}
