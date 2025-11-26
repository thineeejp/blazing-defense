import { useState, useEffect, useRef } from 'react';
import {
  Wind,
  Siren,
  DoorOpen,
  ShieldAlert,
  Zap,
  Shield,
  Bell,
  Truck,
} from 'lucide-react';

// コンポーネントのインポート
import Menu from './components/Menu';
import GameOver from './components/GameOver';
import DraftPhase from './components/DraftPhase';
import ExamPhase from './components/ExamPhase';
import BattleField from './components/BattleField';

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
  const [removeModal, setRemoveModal] = useState(null);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
        // 安全ガード: sizeが異常値でも0除算を防ぐ
        const sizeSlow = e.size >= 3 ? 2.0 : Math.max(0.1, 1 + (e.size - 1) * 0.6);
        let newProgress = isNaN(e.progress) || !isFinite(e.progress) ? -1 : e.progress + e.speed / sizeSlow;
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
        setRemoveModal({ r, c, key });
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

  const confirmRemove = () => {
    if (removeModal) {
      const newTowers = { ...towers };
      delete newTowers[removeModal.key];
      setTowers(newTowers);
      addEffect(removeModal.c, removeModal.r, '撤去', 'text-gray-400');
    }
    setRemoveModal(null);
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

  return (
    <div className="w-full h-screen overflow-hidden font-sans select-none">
      {phase === 'MENU' && (
        <Menu missions={DRAFT_MISSIONS} onStartBattle={startBattle} />
      )}
      {phase === 'DRAFT' && (
        <DraftPhase
          selectedMission={selectedMission}
          draftResult={draftResult}
          rewardCards={REWARD_CARDS}
          onAnswerDraft={answerDraft}
          onStartExam={startExam}
        />
      )}
      {phase === 'EXAM' && (
        <ExamPhase
          examQuestions={EXAM_QUESTIONS}
          examState={examState}
          onAnswerExam={answerExam}
          onGoBattle={goBattle}
        />
      )}
      {phase === 'BATTLE' && (
        <BattleField
          hp={hp}
          cost={cost}
          score={score}
          towers={towers}
          enemies={enemies}
          effects={effects}
          difficulty={difficulty}
          difficultyRef={difficultyRef}
          deck={deck}
          selectedCard={selectedCard}
          supplyModal={supplyModal}
          removeModal={removeModal}
          supplyCooldown={supplyCooldown}
          damaged={damaged}
          handleSlotClick={handleSlotClick}
          setSelectedCard={setSelectedCard}
          triggerSupply={triggerSupply}
          answerSupply={answerSupply}
          confirmRemove={confirmRemove}
          setRemoveModal={setRemoveModal}
        />
      )}
      {phase === 'GAMEOVER' && (
        <GameOver score={score} onBackToMenu={() => setPhase('MENU')} />
      )}
    </div>
  );
}
