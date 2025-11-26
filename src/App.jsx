import React, { useState, useEffect, useRef } from 'react';
import {
  Flame,
  Wind,
  Siren,
  DoorOpen,
  ShieldAlert,
  Zap,
  Shield,
  Bell,
  Truck,
  BookOpen,
  CheckCircle,
  AlertTriangle,
  HelpCircle,
  Skull,
  PenTool,
} from 'lucide-react';

// --- データ定義 ---

const DIFFICULTIES = {
  EASY: { cols: 3, name: '初級 (3列)', spawnRate: 150 },
  NORMAL: { cols: 5, name: '中級 (5列)', spawnRate: 120 },
  HARD: { cols: 7, name: '上級 (7列)', spawnRate: 90 },
};

const GRID_ROWS = 6;

const DRAFT_MISSIONS = [
  {
    id: 'library',
    title: '中央図書館 (EASY)',
    difficulty: 'EASY',
    desc: '延べ面積は小さめ。まずは水損を避ける消火から学ぶ。',
    question: '図書館や書庫に最も適した、水損を最小限にする消火設備は？',
    options: [
      { id: 'A', text: 'スプリンクラー', correct: false },
      { id: 'B', text: '不活性ガス消火設備', correct: true },
    ],
    rewardCard: 'gasSystem',
  },
  {
    id: 'department',
    title: '百貨店 (NORMAL)',
    difficulty: 'NORMAL',
    desc: '広い売場。多数の避難経路確保が必要。',
    question: '不特定多数の客がいる場所で、早期に煙を感知する設備は？',
    options: [
      { id: 'A', text: '熱感知器', correct: false },
      { id: 'B', text: '光電式スポット型感知器', correct: true },
    ],
    rewardCard: 'superSmoke',
  },
  {
    id: 'factory',
    title: '化学工場 (HARD)',
    difficulty: 'HARD',
    desc: '危険物多数。初期爆発と延焼の巨大化に注意。',
    question: '第4類危険物（油）火災に適した消火原理は？',
    options: [
      { id: 'A', text: '棒状注水', correct: false },
      { id: 'B', text: '泡による窒息', correct: true },
    ],
    rewardCard: 'foamHead',
  },
];

const EXAM_QUESTIONS = [
  { q: '屋内消火栓設備の放水圧力は、0.17MPa以上であることが求められる。', a: true },
  { q: '自動火災報知設備の音響装置は、中間距離で70dB以上でよい。', a: false, note: '正しくは90dB以上' },
  { q: '避難はしごは、地下階には設置できない場合がある。', a: true },
  { q: '第4類危険物（引火性液体）火災には、注水消火が常に有効である。', a: false, note: '油火災に注水は危険（拡大の恐れ）' },
  { q: '誘導灯の有効範囲は、歩行距離で原則20m以下となるよう設置する。', a: true },
];

const SUPPLY_QUESTIONS = [
  { q: '消火器の「黄」マークの適応火災は？', options: ['A火災', 'B火災', 'C火災'], ans: 1 },
  { q: '屋内消火栓の放水圧力として正しいのは？', options: ['0.17 MPa以上', '0.25 MPa以上', '0.35 MPa以上'], ans: 0 },
  { q: '避難はしごで地下設置がNGなのは？', options: ['固定はしご', '吊下げはしご', '金属製'], ans: 1 },
];

const CARDS_BASE = {
  extinguisher: {
    id: 'extinguisher',
    name: '10型消火器',
    type: 'red',
    cost: 30,
    icon: <Shield size={24} />,
    desc: '【消火】周囲1マス(3x3)へ短距離散水',
    rangeType: 'surround',
    power: 2,
    speed: 40,
    damageType: 'water',
  },
  sprinkler: {
    id: 'sprinkler',
    name: 'スプリンクラーヘッド',
    type: 'red',
    cost: 90,
    icon: <Zap size={24} />,
    desc: '【消火】横一列×縦3マスを散水で制圧',
    rangeType: 'wide',
    power: 1.0,
    speed: 60,
    damageType: 'water',
  },
  alarm: {
    id: 'alarm',
    name: '感知器',
    type: 'yellow',
    cost: 25,
    icon: <Bell size={24} />,
    desc: '【警報】コスト回復UP',
    effect: 'economy',
    value: 0.6,
  },
  exitSign: {
    id: 'exitSign',
    name: '誘導灯',
    type: 'green',
    cost: 50,
    icon: <DoorOpen size={24} />,
    desc: '【避難】定期的に救助スコアを獲得',
    effect: 'score',
    value: 20,
    interval: 60,
  },
  fireEngine: {
    id: 'fireEngine',
    name: 'ポンプ車',
    type: 'purple',
    cost: 200,
    icon: <Truck size={24} />,
    desc: '【召喚】縦1列の敵をまとめて押し戻す！',
    rangeType: 'line',
    power: 10,
    speed: 10,
    duration: 300,
    knockback: 1.5,
    damageType: 'water',
  },
};

const REWARD_CARDS = {
  gasSystem: {
    id: 'gasSystem',
    name: '不活性ガス',
    type: 'red',
    cost: 70,
    icon: <Wind size={24} />,
    desc: '【特効】全画面へ持続ダメージ(DoT)',
    rangeType: 'global',
    power: 0.3,
    speed: 5,
    damageType: 'gas',
  },
  foamHead: {
    id: 'foamHead',
    name: '泡消火ヘッド',
    type: 'red',
    cost: 100,
    icon: <ShieldAlert size={24} />,
    desc: '【特効】周囲1マスに大ダメージ（油に強い）',
    rangeType: 'surround',
    power: 20,
    speed: 80,
    damageType: 'foam',
  },
  superSmoke: {
    id: 'superSmoke',
    name: '光電式分離型感知器',
    type: 'yellow',
    cost: 40,
    icon: <Siren size={24} />,
    desc: '【特効】コスト回復(特大)',
    effect: 'economy',
    value: 1.5,
  },
};

const RANGE_LABEL = {
  surround: '周囲',
  wide: '横列',
  line: '縦列',
  global: '全体',
};

const INITIAL_HP = 100;

export default function BlazingDefense() {
  const [phase, setPhase] = useState('MENU');
  const [difficulty, setDifficulty] = useState(DIFFICULTIES.EASY);

  const [hp, setHp] = useState(INITIAL_HP);
  const [cost, setCost] = useState(100);
  const [score, setScore] = useState(0);
  const [towers, setTowers] = useState({});
  const [enemies, setEnemies] = useState([]);
  const [deck, setDeck] = useState(CARDS_BASE);
  const [selectedCard, setSelectedCard] = useState(null);
  const [effects, setEffects] = useState([]);
  const [damaged, setDamaged] = useState(false);

  const [selectedMission, setSelectedMission] = useState(null);
  const [draftResult, setDraftResult] = useState(null);
  const [examState, setExamState] = useState({ qIndex: 0, correctCount: 0, history: [], finished: false });
  const [supplyModal, setSupplyModal] = useState(null);
  const [supplyCooldown, setSupplyCooldown] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const frameRef = useRef(0);
  const gameLoopRef = useRef(null);
  const towersRef = useRef(towers);
  const difficultyRef = useRef(difficulty);
  const supplyCooldownRef = useRef(supplyCooldown);

  useEffect(() => {
    towersRef.current = towers;
  }, [towers]);

  useEffect(() => {
    difficultyRef.current = difficulty;
  }, [difficulty]);

  useEffect(() => {
    supplyCooldownRef.current = supplyCooldown;
  }, [supplyCooldown]);

  useEffect(() => {
    if (phase !== 'BATTLE' || isPaused) {
      if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
      return;
    }

    const loop = () => {
      frameRef.current += 1;
      updateBattleLogic();
      gameLoopRef.current = requestAnimationFrame(loop);
    };
    gameLoopRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(gameLoopRef.current);
  }, [phase, isPaused]);

  const updateBattleLogic = () => {
    if (supplyCooldownRef.current > 0) {
      setSupplyCooldown((c) => Math.max(0, c - 1));
    }

    let recovery = 0.05;
    Object.values(towersRef.current).forEach((t) => {
      if (t.card.effect === 'economy') recovery += t.card.value;
    });
    setCost((c) => Math.min(999, c + recovery));

    const spawnRate = Math.max(30, difficultyRef.current.spawnRate - Math.floor(frameRef.current / 500));
    if (frameRef.current % spawnRate === 0) {
      spawnEnemy();
    }

    setEnemies((prev) => {
      const next = [];
      const damageEvents = [];

      prev.forEach((e) => {
        if (e.isAttacking) {
          if (e.attackAnimTimer > 0) {
            next.push({ ...e, attackAnimTimer: e.attackAnimTimer - 1 });
          }
          return;
        }

        // サイズが大きくなるほど移動速度をわずかに減速させる
        // サイズが大きいほど減速。特にサイズ3は強めにブレーキをかける。
        const sizeSlow = e.size >= 3 ? 2.0 : 1 + (e.size - 1) * 0.6;
        let newProgress = e.progress + e.speed / sizeSlow;
        let newSize = e.size;
        const currentBottom = e.progress + e.size;
        if (e.size === 1 && currentBottom > 3.0) newSize = 2;
        if (e.size === 2 && currentBottom > 5.0) newSize = 3;
        // 成長時は中心を保ち、トップ/ボトムのワープ感を抑える
        if (newSize > e.size) {
          // 成長時に位置は据え置き（前フレームのtopを保持）してワープ感を排除
          newProgress = e.progress;
          // HPは全回復、maxHpは据え置き（耐久インフレを防ぐ）
          e = { ...e, hp: e.maxHp };
        }
        // グリッド外への大きな跳ねを抑制
        newProgress = Math.max(-1, newProgress);

        const enemyBottom = newProgress + newSize;
        // 中心が最終行を跨いだら到達とみなす（境界で一拍止めるイメージ）
        if (enemyBottom - (newSize / 2) >= GRID_ROWS - 0.5) {
          // 被ダメージを少し緩和
          const damage = 20;
          damageEvents.push({ damage, c: e.c });
          next.push({
            ...e,
            progress: newProgress,
            size: newSize,
            r: Math.floor(newProgress),
            isAttacking: true,
            attackAnimTimer: 30,
          });
        } else {
          next.push({ ...e, progress: newProgress, size: newSize, r: Math.floor(newProgress) });
        }
      });

      if (damageEvents.length > 0) {
        const totalDamage = damageEvents.reduce((acc, ev) => acc + ev.damage, 0);
        setHp((h) => {
          const val = h - totalDamage;
          if (val <= 0) setPhase('GAMEOVER');
          return val;
        });
        setDamaged(true);
        setTimeout(() => setDamaged(false), 200);
        damageEvents.forEach((ev) => {
          addEffect(ev.c, GRID_ROWS - 1, `BREAK! -${ev.damage}`, 'text-red-600 font-black text-2xl');
        });
      }
      return next;
    });

    const newTowers = { ...towersRef.current };
    Object.keys(newTowers).forEach((key) => {
      const t = { ...newTowers[key] };
      newTowers[key] = t;
      const [tr, tc] = key.split('-').map(Number);

      t.timer += 1;
      t.lifeTime = (t.lifeTime || 0) + 1;

      if (t.card.duration && t.lifeTime >= t.card.duration) {
        delete newTowers[key];
        addEffect(tc, tr, '帰隊', 'text-purple-300');
        return;
      }

      const triggerTime = t.card.type === 'green' ? t.card.interval : t.card.speed;
      if (t.timer >= triggerTime) {
        t.timer = 0;
        if (t.card.type === 'green') {
          setScore((s) => s + t.card.value);
          addEffect(tc, tr, `+${t.card.value}`, 'text-green-400');
        } else {
          fireAttack(t, tr, tc);
        }
      }
    });
    // タイマー進行を反映させるため毎フレーム更新
    setTowers(newTowers);
    towersRef.current = newTowers;
    setEffects((prev) =>
      prev.filter((e) => e.life > 0).map((e) => ({ ...e, life: e.life - 1, y: e.y - 0.05 }))
    );
  };

  const spawnEnemy = () => {
    const cols = difficultyRef.current.cols;
    const c = Math.floor(Math.random() * cols);
    const types = [
      { hp: 20, speed: 0.02, color: 'text-red-500', name: 'A火災', fireType: 'A' },
      { hp: 40, speed: 0.015, color: 'text-orange-500', name: 'B火災(油)', fireType: 'B' },
      { hp: 15, speed: 0.04, color: 'text-yellow-400', name: 'C火災(電気)', fireType: 'C' },
    ];
    const level = Math.min(2, Math.floor(frameRef.current / 1500));
    const t = types[Math.min(types.length - 1, Math.floor(Math.random() * (level + 1.5)))];

    setEnemies((prev) => [
      ...prev,
      {
        id: Math.random(),
        r: -1,
        c,
        progress: -1,
        size: 1,
        maxHp: t.hp,
        hp: t.hp,
        ...t,
      },
    ]);
  };

  const fireAttack = (tower, tr, tc) => {
    setEnemies((prev) => {
      let targets = [...prev];
      let hit = false;
      const card = tower.card;

      targets = targets.map((e) => {
        if (e.isAttacking) return e;

        const eCenterR = e.progress + e.size / 2;
        const eCenterC = e.c + e.size / 2;
        const tCenterR = tr + 0.5;
        const tCenterC = tc + 0.5;
        let inRange = false;

        if (card.rangeType === 'surround') {
          const distR = Math.abs(eCenterR - tCenterR);
          const distC = Math.abs(eCenterC - tCenterC);
          if (distR < e.size / 2 + 1.2 && distC < e.size / 2 + 1.2) inRange = true;
        } else if (card.rangeType === 'wide') {
          const distR = Math.abs(eCenterR - tCenterR);
          if (distR < e.size / 2 + 1.2) inRange = true;
        } else if (card.rangeType === 'line') {
          if (tc >= e.c && tc < e.c + e.size && e.progress < tr) inRange = true;
        } else if (card.rangeType === 'global') {
          inRange = true;
        }

        if (inRange) {
          hit = true;
          let dmg = card.power;
          let knockback = 0;

          if (e.fireType === 'B') {
            if (card.damageType === 'water') {
              dmg *= 0.1;
              if (Math.random() > 0.8) addEffect(e.c, Math.floor(e.progress), 'Bad!', 'text-blue-300 text-xs');
            } else if (card.damageType === 'foam') {
              dmg *= 2.0;
              if (Math.random() > 0.7)
                addEffect(e.c, Math.floor(e.progress), 'Effective!', 'text-yellow-300 text-xs');
            }
          }
          if (e.fireType === 'C' && card.damageType === 'gas') {
            dmg *= 1.5;
          }
          if (card.id === 'fireEngine') knockback = -card.knockback;

          const newProgress = Math.max(-e.size, e.progress + knockback);
          addEffect(e.c, Math.floor(e.progress), 'Hit', 'text-white text-xs');
          return { ...e, hp: e.hp - dmg, progress: newProgress };
        }
        return e;
      });

      if (hit && Math.random() > 0.7) addEffect(tc, tr, '!', 'text-white');

      const survivors = targets.filter((e) => e.hp > 0 || e.isAttacking);
      const killedCount = targets.length - survivors.length;
      if (killedCount > 0) {
        setCost((c) => c + 15 * killedCount);
        setScore((s) => s + 100 * killedCount);
      }
      return survivors;
    });
  };

  const addEffect = (c, r, text, color) => {
    setEffects((prev) => [...prev, { id: Math.random(), c, r, y: 0, text, color, life: 30 }]);
  };

  const handleSlotClick = (r, c) => {
    const key = `${r}-${c}`;
    if (towers[key]) {
      if (towers[key].card.type !== 'purple') {
        if (window.confirm('撤去しますか？')) {
          const newTowers = { ...towers };
          delete newTowers[key];
          setTowers(newTowers);
        }
      }
      return;
    }
    if (selectedCard && cost >= selectedCard.cost) {
      setCost((val) => val - selectedCard.cost);
      setTowers((prev) => ({ ...prev, [key]: { card: selectedCard, timer: 0 } }));
      addEffect(c, r, '設置', 'text-white');
      setSelectedCard(null);
    }
  };

  const startBattle = (mission) => {
    setSelectedMission(mission);
    setDifficulty(DIFFICULTIES[mission.difficulty]);
    setDraftResult(null);
    setDeck(CARDS_BASE);
    setSelectedCard(null);
    setPhase('DRAFT');
  };

  const answerDraft = (isCorrect) => {
    setDraftResult(isCorrect ? 'correct' : 'wrong');
    let newDeck = { ...CARDS_BASE };
    if (isCorrect && selectedMission.rewardCard) {
      newDeck[selectedMission.rewardCard] = REWARD_CARDS[selectedMission.rewardCard];
    }
    setDeck(newDeck);
  };

  const startExam = () => {
    setExamState({ qIndex: 0, correctCount: 0, history: [], finished: false });
    setPhase('EXAM');
  };

  const answerExam = (answer) => {
    const currentQ = EXAM_QUESTIONS[examState.qIndex];
    const isCorrect = currentQ.a === answer;
    const newHistory = [...examState.history, { ...currentQ, userAns: answer, isCorrect }];

    if (examState.qIndex < EXAM_QUESTIONS.length - 1) {
      setExamState({
        qIndex: examState.qIndex + 1,
        correctCount: examState.correctCount + (isCorrect ? 1 : 0),
        history: newHistory,
        finished: false,
      });
    } else {
      const finalCorrectCount = examState.correctCount + (isCorrect ? 1 : 0);
      setExamState({
        ...examState,
        finished: true,
        correctCount: finalCorrectCount,
        history: newHistory,
      });
    }
  };

  const goBattle = () => {
    const bonus = examState.correctCount * 40;
    setCost(100 + bonus);
    setHp(INITIAL_HP);
    setTowers({});
    setEnemies([]);
    setEffects([]);
    setSelectedCard(null);
    setSupplyCooldown(0);
    setIsPaused(false);
    frameRef.current = 0;
    setScore(0);
    setPhase('BATTLE');
  };

  const triggerSupply = () => {
    if (supplyCooldown > 0) return;
    setIsPaused(true);
    setSupplyModal(SUPPLY_QUESTIONS[Math.floor(Math.random() * SUPPLY_QUESTIONS.length)]);
  };

  const answerSupply = (idx) => {
    if (idx === supplyModal.ans) {
      setCost((c) => c + 150);
      addEffect(Math.floor(difficulty.cols / 2), 5, '補給!', 'text-blue-400 font-bold text-2xl');
    } else {
      setSupplyCooldown(300);
    }
    setSupplyModal(null);
    setIsPaused(false);
  };

  const renderMenu = () => (
    <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900 text-white p-4">
      <h1 className="text-4xl md:text-6xl font-black text-red-500 mb-2 italic tracking-tighter drop-shadow-[0_4px_0_rgba(0,0,0,0.5)]">
        BLAZING DEFENSE
      </h1>
      <div className="bg-red-600 text-white font-bold px-4 py-1 skew-x-[-12deg] mb-8">Ver.4.4 Phase 2 &amp; Types</div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-4xl">
        {DRAFT_MISSIONS.map((m) => (
          <button
            key={m.id}
            onClick={() => startBattle(m)}
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

  const renderDraft = () => (
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
                  onClick={() => answerDraft(opt.correct)}
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
                  特別報酬として<span className="text-yellow-400 font-bold"> {REWARD_CARDS[selectedMission.rewardCard].name} </span>
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
              onClick={startExam}
              className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-8 rounded-full w-full"
            >
              次へ: 予算獲得試験 (Phase 2)
            </button>
          </div>
        )}
      </div>
    </div>
  );

  const renderExam = () => {
    const currentQ = EXAM_QUESTIONS[examState.qIndex];

    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900 text-white p-4">
        <div className="max-w-2xl w-full bg-slate-800 p-8 rounded-xl border-2 border-yellow-500 relative">
          <h2 className="text-2xl font-bold text-yellow-300 mb-6 flex items-center gap-2">
            <PenTool /> Phase 2: 予算獲得ライセンス試験
          </h2>

          {!examState.finished ? (
            <div className="animate-in fade-in slide-in-from-right duration-300">
              <div className="flex justify-between text-sm text-gray-400 mb-4">
                <span>Question {examState.qIndex + 1} / {EXAM_QUESTIONS.length}</span>
                <span>Score: {examState.correctCount}</span>
              </div>
              <p className="text-xl font-bold mb-8 min-h-[80px]">{currentQ.q}</p>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => answerExam(true)}
                  className="p-6 bg-blue-600 hover:bg-blue-500 rounded-xl text-2xl font-bold transition-transform hover:scale-105"
                >
                  ◯ 正しい
                </button>
                <button
                  onClick={() => answerExam(false)}
                  className="p-6 bg-red-600 hover:bg-red-500 rounded-xl text-2xl font-bold transition-transform hover:scale-105"
                >
                  × 誤り
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center animate-in zoom-in">
              <h3 className="text-3xl font-bold mb-4">試験終了</h3>
              <div className="text-6xl font-black text-yellow-400 mb-2">{examState.correctCount} / {EXAM_QUESTIONS.length}</div>
              <p className="text-gray-400 mb-6">正解数に応じて初期予算が決定されます。</p>

              <div className="bg-slate-900 p-4 rounded mb-6 text-left max-h-40 overflow-y-auto">
                {examState.history.map((h, i) => (
                  <div key={i} className={`flex items-start gap-2 mb-2 text-sm ${h.isCorrect ? 'text-green-400' : 'text-red-400'}`}>
                    <span>{h.isCorrect ? '◯' : '×'}</span>
                    <span>Q{i + 1}: {h.note || (h.isCorrect ? '正解' : '不正解')}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={goBattle}
                className="bg-green-600 hover:bg-green-500 text-white font-bold py-3 px-8 rounded-full w-full animate-pulse"
              >
                出動開始 (BATTLE START)
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderBattle = () => {
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
          </div>
          <div className="font-mono font-bold text-green-400 text-xl">{score} Pt</div>
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
                      <div className="drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)]">{tower.card.icon}</div>
                      <div className="w-8 h-1 bg-gray-700 mt-1 rounded overflow-hidden">
                        <div
                          className="h-full bg-current"
                          style={{ width: `${(tower.timer / (tower.card.speed || tower.card.interval)) * 100}%` }}
                        />
                      </div>
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
          {Object.values(deck).map((card) => (
            <button
              key={card.id}
              onClick={() => cost >= card.cost && setSelectedCard(card)}
              disabled={cost < card.cost}
              className={`
                relative flex-shrink-0 w-24 h-24 rounded-lg border-b-4 flex flex-col items-center justify-center transition-all
                ${selectedCard?.id === card.id ? 'bg-slate-700 border-white -translate-y-2' : 'bg-slate-800 border-black/30 hover:bg-slate-700'}
                ${cost < card.cost ? 'opacity-40 grayscale cursor-not-allowed' : ''}
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
                {card.icon}
              </div>
              <div className="text-[10px] font-bold text-gray-300 mt-1">{card.name}</div>
              <div className="text-lg font-black text-white">{card.cost}</div>
              <div className="absolute top-1 right-1 text-[8px] text-gray-500 bg-black/50 px-1 rounded">
                {card.rangeType ? RANGE_LABEL[card.rangeType] : '支援'}
              </div>
            </button>
          ))}
        </div>

        {/* Emergency Modal */}
        {supplyModal && (
          <div className="absolute inset-0 z-50 bg-black/80 flex items-center justify-center p-6">
            <div className="bg-slate-800 border-2 border-yellow-500 p-6 rounded-xl w-full max-w-md animate-in zoom-in">
              <h3 className="text-yellow-400 font-bold text-xl mb-4 flex items-center gap-2">
                <AlertTriangle /> 緊急補給クイズ
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
      </div>
    );
  };

  return (
    <div className="w-full h-screen overflow-hidden font-sans select-none">
      {phase === 'MENU' && renderMenu()}
      {phase === 'DRAFT' && renderDraft()}
      {phase === 'EXAM' && renderExam()}
      {phase === 'BATTLE' && renderBattle()}
      {phase === 'GAMEOVER' && (
        <div className="w-full h-full flex flex-col items-center justify-center bg-black/90 text-white">
          <h2 className="text-5xl font-black text-red-600 mb-4 animate-bounce">GAME OVER</h2>
          <div className="text-2xl mb-8">救助人数: {score}人</div>
          <div className="text-gray-400 mb-8">敵が防衛ライン(手前)を突破しました</div>
          <button
            onClick={() => setPhase('MENU')}
            className="bg-white text-black font-bold py-3 px-8 rounded-full hover:scale-105 transition-transform"
          >
            タイトルへ戻る
          </button>
        </div>
      )}
    </div>
  );
}
