import { PenTool } from 'lucide-react';

export default function ExamPhase({ examQuestions, examState, onAnswerExam, onGoBattle }) {
  const currentQ = examQuestions[examState.qIndex];

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900 text-white p-4">
      <div className="max-w-2xl w-full bg-slate-800 p-8 rounded-xl border-2 border-yellow-500 relative">
        <h2 className="text-2xl font-bold text-yellow-300 mb-6 flex items-center gap-2">
          <PenTool /> Phase 2: 予算獲得ライセンス試験
        </h2>

        {!examState.finished ? (
          <div className="animate-in fade-in slide-in-from-right duration-300">
            <div className="flex justify-between text-sm text-gray-400 mb-4">
              <span>
                Question {examState.qIndex + 1} / {examQuestions.length}
              </span>
              <span>Score: {examState.correctCount}</span>
            </div>
            <p className="text-xl font-bold mb-8 min-h-[80px]">{currentQ.q}</p>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => onAnswerExam(true)}
                className="p-6 bg-blue-600 hover:bg-blue-500 rounded-xl text-2xl font-bold transition-transform hover:scale-105"
              >
                ◯ 正しい
              </button>
              <button
                onClick={() => onAnswerExam(false)}
                className="p-6 bg-red-600 hover:bg-red-500 rounded-xl text-2xl font-bold transition-transform hover:scale-105"
              >
                × 誤り
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center animate-in zoom-in">
            <h3 className="text-3xl font-bold mb-4">試験終了</h3>
            <div className="text-6xl font-black text-yellow-400 mb-2">
              {examState.correctCount} / {examQuestions.length}
            </div>
            <p className="text-gray-400 mb-6">正解数に応じて初期予算が決定されます。</p>

            <div className="bg-slate-900 p-4 rounded mb-6 text-left max-h-40 overflow-y-auto">
              {examState.history.map((h, i) => (
                <div
                  key={i}
                  className={`flex items-start gap-2 mb-2 text-sm ${h.isCorrect ? 'text-green-400' : 'text-red-400'}`}
                >
                  <span>{h.isCorrect ? '◯' : '×'}</span>
                  <span>
                    Q{i + 1}: {h.note || (h.isCorrect ? '正解' : '不正解')}
                  </span>
                </div>
              ))}
            </div>

            <button
              onClick={onGoBattle}
              className="bg-green-600 hover:bg-green-500 text-white font-bold py-3 px-8 rounded-full w-full animate-pulse"
            >
              出動開始 (BATTLE START)
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
