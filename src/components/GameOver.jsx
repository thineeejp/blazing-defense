export default function GameOver({ score, onBackToMenu }) {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-black/90 text-white">
      <h2 className="text-5xl font-black text-red-600 mb-4 animate-bounce">GAME OVER</h2>
      <div className="text-2xl mb-8">救助人数: {score}人</div>
      <div className="text-gray-400 mb-8">敵が防衛ライン(手前)を突破しました</div>
      <button
        onClick={onBackToMenu}
        className="bg-white text-black font-bold py-3 px-8 rounded-full hover:scale-105 transition-transform"
      >
        タイトルへ戻る
      </button>
    </div>
  );
}
