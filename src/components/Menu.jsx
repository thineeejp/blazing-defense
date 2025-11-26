export default function Menu({ missions, onStartBattle }) {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900 text-white p-4">
      <h1 className="text-4xl md:text-6xl font-black text-red-500 mb-2 italic tracking-tighter drop-shadow-[0_4px_0_rgba(0,0,0,0.5)]">
        BLAZING DEFENSE
      </h1>
      <div className="bg-red-600 text-white font-bold px-4 py-1 skew-x-[-12deg] mb-8">Ver.4.4 Phase 2 &amp; Types</div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-4xl">
        {missions.map((m) => (
          <button
            key={m.id}
            onClick={() => onStartBattle(m)}
            className="bg-slate-800 border-2 border-slate-600 hover:border-yellow-400 p-6 rounded-xl text-left transition-all hover:-translate-y-2 group relative overflow-hidden"
          >
            <div
              className={`text-xs font-bold mb-1 ${
                m.difficulty === 'EASY' ? 'text-green-400' : m.difficulty === 'NORMAL' ? 'text-yellow-400' : 'text-red-400'
              }`}
            >
              MISSION: {m.difficulty}
            </div>
            <div className="text-xl font-bold text-white mb-2">{m.title}</div>
            <div className="text-gray-400 text-sm">{m.desc}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
