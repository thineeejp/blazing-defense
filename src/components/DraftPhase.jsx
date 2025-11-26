import { BookOpen, CheckCircle, AlertTriangle } from 'lucide-react';

export default function DraftPhase({
  selectedMission,
  draftResult,
  rewardCards,
  onAnswerDraft,
  onStartExam
}) {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900 text-white p-4">
      <div className="max-w-2xl w-full bg-slate-800 p-8 rounded-xl border-2 border-blue-500 relative">
        <h2 className="text-2xl font-bold text-blue-300 mb-6 flex items-center gap-2">
          <BookOpen /> Phase 1: 現場診断 (DRAFT)
        </h2>

        {draftResult === null ? (
          <>
            <p className="text-lg mb-6">{selectedMission.question}</p>
            <div className="space-y-4">
              {selectedMission.options.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => onAnswerDraft(opt.correct)}
                  className="w-full p-4 bg-slate-700 hover:bg-slate-600 border border-slate-500 rounded text-left transition-colors"
                >
                  {opt.text}
                </button>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center animate-in zoom-in">
            {draftResult === 'correct' ? (
              <div className="mb-6">
                <CheckCircle size={64} className="mx-auto text-green-400 mb-2" />
                <h3 className="text-2xl font-bold text-green-400">正解！的確な判断だ。</h3>
                <p className="text-gray-400 mt-2">
                  特別報酬として<span className="text-yellow-400 font-bold"> {rewardCards[selectedMission.rewardCard].name} </span>
                  を支給する。
                </p>
              </div>
            ) : (
              <div className="mb-6">
                <AlertTriangle size={64} className="mx-auto text-red-500 mb-2" />
                <h3 className="text-2xl font-bold text-red-500">判断ミス...</h3>
                <p className="text-gray-400 mt-2">初期装備のみで出動する。健闘を祈る。</p>
              </div>
            )}
            <button
              onClick={onStartExam}
              className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-8 rounded-full w-full"
            >
              次へ: 予算獲得試験 (Phase 2)
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
