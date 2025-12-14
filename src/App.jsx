import { useState, useEffect, useRef } from 'react';

// コンポーネントのインポート
import Menu from './components/Menu';
import GameOver from './components/GameOver';
import BriefingPhase from './components/BriefingPhase';
import DeckBuildPhase from './components/DeckBuildPhase';
import BattleField from './components/BattleField';
import Gallery from './components/Gallery';

// 新しい定数のインポート
import { ALL_CARDS } from './constants/cards';
import { BRIEFING_REWARD_TABLE, OVERFLOW_BONUS } from './constants/equipment';
import { QUIZ_QUESTIONS } from './constants/quizzes';
import { MAX_COST } from './constants/game';

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
    title: '事務所 (EASY)',
    difficulty: 'EASY',
    desc: '延べ面積は小さめ。',
    question: '図書館や書庫に最も適した、水損を最小限にする消火設備は？',
    options: [
      { id: 'A', text: 'スプリンクラー', correct: false },
      { id: 'B', text: '不活性ガス消火設備', correct: true },
    ],
    rewardCard: 'gasSystem',
    evacuationGoal: 100,
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
    evacuationGoal: 200,
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
    evacuationGoal: 300,
  },
];

const INITIAL_HP = 100;

export default function BlazingDefense() {
  const [phase, setPhase] = useState('MENU'); // 'MENU' | 'GALLERY' | 'BRIEFING' | 'DECK_BUILD' | 'BATTLE' | 'GAMEOVER'
  const [isFirstLaunch, setIsFirstLaunch] = useState(true); // 初回起動判定
  const [difficulty, setDifficulty] = useState(DIFFICULTIES.EASY);

  const [hp, setHp] = useState(INITIAL_HP);
  const [cost, setCost] = useState(100);
  const [towers, setTowers] = useState({});
  const [enemies, setEnemies] = useState([]);
  const [deck, setDeck] = useState({});
  const [selectedCard, setSelectedCard] = useState(null);
  const [effects, setEffects] = useState([]);
  const [damaged, setDamaged] = useState(false);

  // 戦闘エフェクト用state
  const [attackEffects, setAttackEffects] = useState([]);    // 攻撃線エフェクト
  const [hitEffects, setHitEffects] = useState([]);          // ヒットバースト
  const [deathEffects, setDeathEffects] = useState([]);      // 敵死亡エフェクト
  const [placementEffects, setPlacementEffects] = useState([]); // タワー設置エフェクト
  const [areaEffects, setAreaEffects] = useState([]);        // 範囲攻撃エフェクト（新規）
  const [scorchMarks, setScorchMarks] = useState([]);        // 防衛ライン残留痕
  const [prevCost, setPrevCost] = useState(0);               // コスト変動検出用
  const lastCostRef = useRef(cost);                          // 直前コスト保持

  // 戦闘エフェクトのクリア処理
  const clearBattleFx = () => {
    setEffects([]);
    setAttackEffects([]);
    setHitEffects([]);
    setDeathEffects([]);
    setPlacementEffects([]);
    setAreaEffects([]);
    setScorchMarks([]);
  };

  const [selectedMission, setSelectedMission] = useState(null);
  const [isPaused, setIsPaused] = useState(false);
  const [removeModal, setRemoveModal] = useState(null);

  // 新しいBRIEFINGシステムの状態
  const [tiers, setTiers] = useState({
    fire: 1,
    alarm: 1,
    evacuation: 1,
    facility: 1,
    other: 1,
  });

  const [categoryBuffs, setCategoryBuffs] = useState({
    fire: { costDiscount: 0, powerBuff: 0 },
    alarm: { costDiscount: 0, powerBuff: 0 },
    evacuation: { costDiscount: 0, powerBuff: 0 },
    facility: { costDiscount: 0, powerBuff: 0 },
    other: { costDiscount: 0, powerBuff: 0 },
  });

  const [briefingState, setBriefingState] = useState({
    round: 1,
    phase: 'SELECT', // 'SELECT' | 'QUIZ' | 'FEEDBACK' | 'RESULT'
    selectedCategory: null,
    quizzes: [],
    currentQIndex: 0,
    correctCount: 0,
    totalCost: 0,
    answerHistory: [], // 各問題の回答履歴
  });

  // DECK_BUILDフェーズの状態
  const [deckBuildState, setDeckBuildState] = useState({
    selectedCardIds: [],    // 選択済みカードIDの配列
    remainingCost: 0,       // 残りコスト
  });

  // 勝利条件とスコアシステム関連の状態
  const [isVictory, setIsVictory] = useState(false);
  const [evacuatedCount, setEvacuatedCount] = useState(0);
  const [timeLimit] = useState(5400); // 1.5分 = 90秒 × 60FPS
  const [evacuationGoal, setEvacuationGoal] = useState(100);
  const [defeatedEnemies, setDefeatedEnemies] = useState(0);
  const [clearTime, setClearTime] = useState(0);
  const [globalCostReduction, setGlobalCostReduction] = useState(0);

  const frameRef = useRef(0);
  const gameLoopRef = useRef(null);
  const towersRef = useRef(towers);
  const difficultyRef = useRef(difficulty);
  const globalBuffsRef = useRef({ speed: 0 });
  const evacuatedCountRef = useRef(0);

  // グローバルバフのキャッシュ（タワー変更時のみ再計算）
  const staticBuffsRef = useRef({
    recovery: 0.083,      // 基本コスト回復
    evacBoost: 0,         // 避難速度ブースト
    hpRegen: 0,           // HP回復
    globalSpeedBuff: 0,   // 攻撃速度バフ
    globalSlowDebuff: 0,  // 敵速度デバフ
    globalPowerBuff: 0,   // 攻撃力バフ
    globalCostReduction: 0, // コスト割引
  });

  // --- Handlers ---

  // タワー配置/削除時に呼び出すグローバルバフ再計算関数
  const recalculateStaticBuffs = (currentTowers) => {
    let recovery = 0.083;
    let evacBoost = 0;
    let hpRegen = 0;
    let globalSpeedBuff = 0;
    let globalSlowDebuff = 0;
    let globalPowerBuff = 0;
    let globalCostReduction = 0;

    Object.values(currentTowers).forEach((t) => {
      const card = t.card;
      if (!card.effect) return;

      switch (card.effect) {
        case 'economy':
          recovery += card.value;
          break;
        case 'economyAndEvacuation':
          recovery += card.economyValue;
          evacBoost += card.evacuationValue;
          break;
        case 'economyWithTransform':
          recovery += card.value;
          break;
        case 'evacuation':
          evacBoost += card.value;
          break;
        case 'evacuationWithRegen':
          evacBoost += card.evacuationValue;
          hpRegen += card.regenValue;
          break;
        case 'evacuationWithRegenAndBuff':
          evacBoost += card.evacuationValue;
          hpRegen += card.regenValue;
          globalSpeedBuff += card.globalSpeedBuff;
          break;
        case 'globalSpeedBuffWithRegen':
          globalSpeedBuff += card.speedBuff;
          hpRegen += card.regenValue;
          break;
        case 'globalSlowWithEvacuation':
          globalSlowDebuff += card.slowValue;
          evacBoost += card.evacuationValue;
          break;
        case 'firefighterSupport':
          globalSpeedBuff += card.globalSpeedBuff;
          globalCostReduction += card.costReduction;
          break;
        case 'ultimateBuff':
          globalPowerBuff += card.globalPowerBuff;
          globalSpeedBuff += card.globalSpeedBuff;
          evacBoost += card.evacuationValue;
          hpRegen += card.regenValue;
          break;
      }
    });

    // 上限チェック（敵が完全停止しないように）
    globalSlowDebuff = Math.min(globalSlowDebuff, 0.75);

    staticBuffsRef.current = {
      recovery,
      evacBoost,
      hpRegen,
      globalSpeedBuff,
      globalSlowDebuff,
      globalPowerBuff,
      globalCostReduction,
    };

    // 既存のglobalBuffsRef更新
    globalBuffsRef.current = { speed: globalSpeedBuff, power: globalPowerBuff };
    setGlobalCostReduction((prev) => (prev === globalCostReduction ? prev : globalCostReduction));
  };

  const handleBackToTitle = () => {
    clearBattleFx();
    // Reset minimal state for a fresh start from menu
    setPhase('MENU');
    setIsPaused(false);
  };

  const handleSurrender = () => {
    clearBattleFx();
    setIsVictory(false);
    setPhase('GAMEOVER');
  };

  useEffect(() => {
    towersRef.current = towers;
  }, [towers]);

  useEffect(() => {
    difficultyRef.current = difficulty;
  }, [difficulty]);

  useEffect(() => {
    evacuatedCountRef.current = evacuatedCount;
  }, [evacuatedCount]);

  // コスト変動検出用（前フレーム値を保持）
  useEffect(() => {
    setPrevCost(lastCostRef.current);
    lastCostRef.current = cost;
  }, [cost]);

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
    // キャッシュから取得（毎フレームのタワーループを削除）
    const {
      recovery,
      evacBoost,
      hpRegen,
    } = staticBuffsRef.current;

    // コスト回復適用
    setCost((c) => Math.min(MAX_COST, c + recovery));

    // HP回復適用（毎秒）
    if (frameRef.current % 60 === 0 && hpRegen > 0) {
      setHp((h) => Math.min(100, h + hpRegen));
    }

    // 避難速度適用（基本1.0 + ブースト）
    const currentEvacSpeed = 1.0 + evacBoost;
    if (frameRef.current % 60 === 0) {
      setEvacuatedCount((count) => {
        const newCount = Math.min(evacuationGoal, count + currentEvacSpeed);
        evacuatedCountRef.current = newCount;  // refを即座に更新
        return newCount;
      });
    }

    const spawnRate = Math.max(30, difficultyRef.current.spawnRate - Math.floor(frameRef.current / 500));
    if (frameRef.current % spawnRate === 0) {
      spawnEnemy();
    }

    // 防火戸で塞がれている行
    const blockedRows = new Set();
    Object.entries(towersRef.current).forEach(([key, t]) => {
      if (t.card.effect === 'rowBlockTimed' && t.lifeTime < (t.card.blockDuration || t.card.duration || 0)) {
        blockedRows.add(Number(key.split('-')[0]));
      }
    });

    setEnemies((prev) => {
      const next = [];
      const damageEvents = [];

      prev.forEach((e) => {
        if (e.slowTimer && e.slowTimer > 0) {
          e = { ...e, slowTimer: e.slowTimer - 1 };
          if (e.slowTimer <= 0) e.slowValue = 0;
        }

        // ヒットフラッシュをリセット
        if (e.isHit) {
          e = { ...e, isHit: false };
        }

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
        // globalSlowDebuff適用（smokeControl等の減速効果）
        const actualSpeed = e.speed * (1 - staticBuffsRef.current.globalSlowDebuff) * (1 - (e.slowValue || 0));
        let newProgress = isNaN(e.progress) || !isFinite(e.progress) ? -1 : e.progress + actualSpeed / sizeSlow;
        const enemyRow = Math.floor(e.progress + e.size / 2);
        if (blockedRows.has(enemyRow)) {
          newProgress = e.progress;
        }
        let newSize = e.size;
        // サイズ1→3に直接変化（サイズ2を廃止、HP回復を1回のみに）
        if (e.size === 1 && e.progress > 3.0) {
          newSize = 3;
        }
        // 成長時は中心を保ち、トップ/ボトムのワープ感を抑える
        if (newSize > e.size) {
          // 成長時に位置は据え置き（前フレームのtopを保持）してワープ感を排除
          newProgress = e.progress;
          // HPは全回復、maxHpは据え置き（耐久インフレを防ぐ）
          const centerC = e.c + e.size / 2;
          const newC = centerC - newSize / 2; // 中心を維持、はみ出しを許容
          e = { ...e, hp: e.maxHp, c: newC };
        }
        // グリッド外への大きな跳ねを抑制
        newProgress = Math.max(-1, newProgress);

        // 到達判定の前に、既に到達済みの敵をスキップ（2重ダメージ防止）
        if (e.isAttacking) {
          next.push({
            ...e,
            progress: newProgress,
            size: newSize,
            r: Math.floor(newProgress),
            attackAnimTimer: e.attackAnimTimer > 0 ? e.attackAnimTimer - 1 : 0,
          });
        } else {
          const enemyBottom = newProgress + newSize;
          // 中心が最終行を跨いだら到達とみなす（境界で一拍止めるイメージ）
          if (enemyBottom - (newSize / 2) >= GRID_ROWS - 0.5) {
            // 火災タイプ別のダメージ設定
            let damage = 20; // デフォルト
            if (e.fireType === 'A') {
              damage = 15; // A火災: 15固定
            } else if (e.fireType === 'B') {
              damage = 20; // B火災: 20固定
            } else if (e.fireType === 'C') {
              damage = 10; // C火災: 10固定
            }
            damageEvents.push({ damage, c: e.c + e.size / 2 });
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
        }
      });

      // 勝利条件チェック
      if (!isVictory) {
        // 条件1: 時間制限到達
        if (frameRef.current >= timeLimit) {
          setIsVictory(true);
          setClearTime(frameRef.current);
          setPhase('GAMEOVER');
          return next;
        }

        // 条件2: 避難目標達成
        if (evacuatedCountRef.current >= evacuationGoal) {
          setIsVictory(true);
          setClearTime(frameRef.current);
          setPhase('GAMEOVER');
          return next;
        }
      }

      // 敗北判定
      if (damageEvents.length > 0) {
        const totalDamage = damageEvents.reduce((acc, ev) => acc + ev.damage, 0);
        setHp((h) => {
          const val = h - totalDamage;
          if (val <= 0) {
            setIsVictory(false);
            setPhase('GAMEOVER');
          }
          return val;
        });
        setDamaged(true);
        setTimeout(() => setDamaged(false), 200);
        damageEvents.forEach((ev) => {
          setScorchMarks((prev) => [...prev, { id: Math.random(), c: ev.c, life: 90 }]);
        });
        damageEvents.forEach((ev) => {
          addEffect(ev.c, GRID_ROWS - 0.5, `BREAK! -${ev.damage}`, 'text-red-600 font-black text-2xl');
        });
      }
      return next;
    });

    const newTowers = { ...towersRef.current };
    let towerStructureChanged = false;
    Object.keys(newTowers).forEach((key) => {
      const t = { ...newTowers[key] };
      newTowers[key] = t;
      const [tr, tc] = key.split('-').map(Number);

      t.timer += 1;
      t.lifeTime = (t.lifeTime || 0) + 1;

      // 設置アニメーション終了後にisNewフラグをクリア（30フレーム = 0.5秒）
      if (t.isNew && t.lifeTime > 30) {
        t.isNew = false;
      }

      // duration処理（nullは永続なのでスキップ）
      if (t.card.duration !== null && t.lifeTime >= t.card.duration) {
        delete newTowers[key];
        addEffect(tc + 0.5, tr + 0.5, '停止！', 'text-gray-400');
        towerStructureChanged = true;
        return;
      }

      // fireNotificationの変身処理
      if (t.card.effect === 'economyWithTransform' && t.card.transformDelay && t.lifeTime >= t.card.transformDelay) {
        const fireEngine = ALL_CARDS[t.card.transformInto];
        if (fireEngine) {
          newTowers[key] = { card: fireEngine, timer: 0, lifeTime: 0 };
          addEffect(tc, tr, '🚒 出動！', 'text-red-500 font-bold');
          towerStructureChanged = true;
        }
      }

      // 攻撃可能カード（power定義あり）のみ攻撃処理
      if (t.card.power !== undefined && t.card.power > 0) {
        const triggerTime = Math.max(1, t.card.speed / (1 + (globalBuffsRef.current.speed || 0)));
        t.lastInterval = triggerTime;
        if (t.timer >= triggerTime) {
          t.timer = 0;
          fireAttack(t, tr, tc);
        }
      }
    });

    // タワー構造が変化した場合のみ再計算
    if (towerStructureChanged) {
      recalculateStaticBuffs(newTowers);
    }

    // タイマー進行を反映させるため毎フレーム更新
    setTowers(newTowers);
    towersRef.current = newTowers;
    setEffects((prev) =>
      prev.filter((e) => e.life > 0).map((e) => ({ ...e, life: e.life - 1, y: e.y - 0.05 }))
    );

    // 戦闘エフェクトのライフサイクル管理
    setAttackEffects((prev) =>
      prev.filter((e) => e.life > 0).map((e) => ({ ...e, life: e.life - 1 }))
    );
    setHitEffects((prev) =>
      prev.filter((e) => e.life > 0).map((e) => ({ ...e, life: e.life - 1 }))
    );
    setDeathEffects((prev) =>
      prev.filter((e) => e.life > 0).map((e) => ({ ...e, life: e.life - 1 }))
    );
    setPlacementEffects((prev) =>
      prev.filter((e) => e.life > 0).map((e) => ({ ...e, life: e.life - 1 }))
    );
    setAreaEffects((prev) =>
      prev.filter((e) => e.life > 0).map((e) => ({ ...e, life: e.life - 1 }))
    );
    setScorchMarks((prev) =>
      prev.filter((e) => e.life > 0).map((e) => ({ ...e, life: e.life - 1 }))
    );
  };

  const spawnEnemy = () => {
    const cols = difficultyRef.current.cols;
    const c = Math.floor(Math.random() * cols);
    const types = [
      { hp: 20, speed: 0.018, color: 'text-red-500', name: 'A火災', fireType: 'A' },
      { hp: 40, speed: 0.015, color: 'text-orange-500', name: 'B火災(油)', fireType: 'B' },
      { hp: 15, speed: 0.04, color: 'text-yellow-400', name: 'C火災(電気)', fireType: 'C' },
    ];

    // 難易度ごとの出現率（重み付け）
    const weights =
      difficultyRef.current.name === 'EASY' ? [90, 5, 5] :    // A多め、BC極少
        difficultyRef.current.name === 'NORMAL' ? [90, 5, 5] :  // A多め、BC極少（列数でバランス）
          [40, 35, 25];                                            // HARD: BCの比率アップ

    // 重み付けランダム選択
    const totalWeight = weights.reduce((sum, w) => sum + w, 0);
    const rand = Math.random() * totalWeight;
    let cumWeight = 0;
    let selectedIndex = 0;
    for (let i = 0; i < weights.length; i++) {
      cumWeight += weights[i];
      if (rand < cumWeight) {
        selectedIndex = i;
        break;
      }
    }
    const t = types[selectedIndex];

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
        slowValue: 0,
        slowTimer: 0,
        ...t,
      },
    ]);
  };

  const fireAttack = (tower, tr, tc) => {
    // 攻撃エフェクトの色を決定
    const attackColors = {
      water: 'bg-cyan-400',
      foam: 'bg-yellow-300',
      gas: 'bg-purple-400',
    };
    const attackColor = attackColors[tower.card.damageType] || 'bg-red-400';

    setEnemies((prev) => {
      let targets = [...prev];
      const card = tower.card;
      const hitEnemies = []; // ヒットした敵の情報を収集
      const killedEnemies = []; // 倒された敵の情報を収集

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
        } else if (card.rangeType === 'tripleRow') {
          // タワー行±1行（3行）× 全列
          const distR = Math.abs(tCenterR - eCenterR);
          if (distR <= 1.5) inRange = true;
        } else if (card.rangeType === 'surroundRow') {
          // 周囲3×3（surround）+ 横1列（タワー行全体）の複合
          let inRangeSurround = false;
          let inRangeRow = false;

          // surround判定
          const distR = Math.abs(eCenterR - tCenterR);
          const distC = Math.abs(eCenterC - tCenterC);
          if (distR < e.size / 2 + 1.2 && distC < e.size / 2 + 1.2) {
            inRangeSurround = true;
          }

          // row判定（タワーと同じ行）
          if (Math.abs(tCenterR - eCenterR) < e.size / 2 + 0.5) {
            inRangeRow = true;
          }

          inRange = inRangeSurround || inRangeRow;
        } else if (card.rangeType === 'line') {
          if (tc >= e.c && tc < e.c + e.size && e.progress < tr) inRange = true;
        } else if (card.rangeType === 'global') {
          inRange = true;
        }

        if (inRange) {
          // オーバーフロー報酬の攻撃力バフを適用
          const powerBuff = categoryBuffs[card.category]?.powerBuff || 0;

          // standpipeの周囲バフを計算（globalPowerBuffはキャッシュ済み）
          let localPowerBuff = 0;
          Object.entries(towersRef.current).forEach(([bKey, bTower]) => {
            if (bTower.card.effect === 'buffPower') {
              const [br, bc] = bKey.split('-').map(Number);
              const distR = Math.abs(br - tr);
              const distC = Math.abs(bc - tc);
              if (distR <= 1 && distC <= 1) {  // 周囲3x3
                localPowerBuff += bTower.card.value || 0;
              }
            }
          });

          const globalPowerBuff = staticBuffsRef.current.globalPowerBuff;
          let dmg = card.power * (1 + powerBuff + globalPowerBuff + localPowerBuff);
          let knockback = 0;
          let effectSize = 'normal';

          if (e.fireType === 'B') {
            if (card.damageType === 'water') {
              dmg *= 0.5;
              if (Math.random() > 0.8) addEffect(e.c + e.size / 2, e.progress + e.size / 2, 'Bad!', 'text-blue-300', 'small');
            } else if (card.damageType === 'foam') {
              dmg *= 2.0;
              effectSize = 'large';
              if (Math.random() > 0.7)
                addEffect(e.c + e.size / 2, e.progress + e.size / 2, 'Effective!', 'text-yellow-300 font-bold', 'large');
            }
          }
          if (e.fireType === 'C' && card.damageType === 'gas') {
            dmg *= 1.5;
            effectSize = 'large';
          }
          if (card.knockback) {
            knockback = -card.knockback;
          }

          // ヒット情報を収集（中心座標）
          hitEnemies.push({ id: e.id, r: e.progress + e.size / 2, c: e.c + e.size / 2, fireType: e.fireType });

          const newHp = e.hp - dmg;
          const newProgress = Math.max(-e.size, e.progress + knockback);

          // 死亡判定
          if (newHp <= 0 && !e.isAttacking) {
            killedEnemies.push({ r: e.progress + e.size / 2, c: e.c + e.size / 2, fireType: e.fireType, size: e.size });
          }

          // ダメージ表示（最小1）
          const displayDmg = Math.max(1, Math.floor(dmg));
          addEffect(e.c + e.size / 2, e.progress + e.size / 2, displayDmg.toString(), 'text-white font-bold', effectSize);
          return { ...e, hp: newHp, progress: newProgress, isHit: true };
        }
        return e.isHit ? { ...e, isHit: false } : e;
      });

      // エフェクト分岐
      // エフェクト分岐
      const areaEffectCards = ['sprinkler', 'foamSystem', 'packageFireSystem', 'inertGasSystem'];
      if (areaEffectCards.includes(card.id)) {
        // AoE: タワー中心に範囲エフェクトを表示（敵への線は出さない）
        // 敵が範囲内にいてヒットした場合のみエフェクト再生
        if (hitEnemies.length > 0) {
          addAreaEffect(tr + 0.5, tc + 0.5, card.id, card.damageType);
        }
      } else {
        // Projectile: 攻撃エフェクトを追加（最初のヒット敵のみ）
        if (hitEnemies.length > 0 && card.rangeType !== 'global') {
          const firstHit = hitEnemies[0];
          addAttackEffect(tr + 0.5, tc + 0.5, firstHit.r, firstHit.c, attackColor, firstHit.id, card.damageType);
        }
      }

      // ヒットバーストを追加（全ヒット対象）
      hitEnemies.forEach((hit) => {
        addHitEffect(hit.r, hit.c, attackColor);
      });

      // 死亡エフェクトを追加
      killedEnemies.forEach((killed) => {
        addDeathEffect(killed.r, killed.c, killed.fireType);
      });

      const survivors = targets.filter((e) => e.hp > 0 || e.isAttacking);
      const killedCount = targets.length - survivors.length;
      if (killedCount > 0) {
        setCost((c) => Math.min(MAX_COST, c + 15 * killedCount));
        setDefeatedEnemies((count) => count + killedCount);
      }
      return survivors;
    });
  };

  const addEffect = (c, r, text, color, size = 'normal') => {
    setEffects((prev) => [...prev, { id: Math.random(), c, r, y: 0, text, color, life: 30, size }]);
  };

  // 範囲攻撃エフェクト追加
  const addAreaEffect = (r, c, cardId, damageType) => {
    const id = Math.random();
    setAreaEffects((prev) => [...prev, { id, r, c, cardId, damageType, life: 30 }]);
  }

  // 攻撃エフェクト追加（タワー→敵への攻撃線）
  const addAttackEffect = (fromR, fromC, toR, toC, color, targetId = null, damageType = 'normal') => {
    const id = Math.random();
    setAttackEffects((prev) => [...prev, { id, fromR, fromC, toR, toC, color, life: 18, targetId, damageType }]);
  };

  // ヒットエフェクト追加（命中地点のバースト）
  const addHitEffect = (r, c, color) => {
    const id = Math.random();
    const particles = Array.from({ length: 5 + Math.floor(Math.random() * 3) }).map(() => ({
      dx: (Math.random() - 0.5) * 20,
      dy: (Math.random() - 0.5) * 20,
      size: 4 + Math.random() * 4,
    }));
    setHitEffects((prev) => [...prev, { id, r, c, color, life: 24, particles }]);
  };

  // 死亡エフェクト追加（敵撃破時のパーティクル）
  const addDeathEffect = (r, c, fireType) => {
    const colors = { A: 'bg-red-500', B: 'bg-orange-500', C: 'bg-yellow-400' };
    const id = Math.random();
    setDeathEffects((prev) => [...prev, { id, r, c, color: colors[fireType] || 'bg-red-500', life: 36 }]);
  };

  // 設置エフェクト追加（タワー配置時の衝撃波）
  const addPlacementEffect = (r, c, color) => {
    const id = Math.random();
    setPlacementEffects((prev) => [...prev, { id, r, c, color, life: 30 }]);
  };

  const calculateFinalScore = () => {
    // 基本スコア（避難重視）
    const evacuationScore = evacuatedCount * 100;

    // 時間ボーナス（早いほど高い）
    const timeBonus = isVictory ? Math.max(0, (timeLimit - clearTime) * 5) : 0;

    // HP残量ボーナス
    const hpBonus = Math.floor(hp) * 20;

    // コスト効率ボーナス
    const costBonus = Math.floor(cost) * 5;

    // 撃破ボーナス
    const defeatBonus = defeatedEnemies * 100;

    // 基本スコア合計
    const baseScore = evacuationScore + timeBonus + hpBonus + costBonus + defeatBonus;

    // バッジ判定（勝利時のみ）
    const hasNoDamageBadge = (isVictory && hp === INITIAL_HP);
    const hasEvacuationBadge = (isVictory && evacuatedCount >= evacuationGoal);
    const hasEconomyBadge = (isVictory && cost >= 777);

    // バッジ倍率適用
    let multiplier = 1.0;
    const allBadgesAchieved = hasNoDamageBadge && hasEvacuationBadge && hasEconomyBadge;
    if (allBadgesAchieved) {
      // 3つすべて達成で特別ボーナス
      multiplier = 2.0;
    } else {
      // 1-2つ達成時は従来通り各バッジ×1.2の累積
      if (hasNoDamageBadge) multiplier *= 1.2;
      if (hasEvacuationBadge) multiplier *= 1.2;
      if (hasEconomyBadge) multiplier *= 1.2;
    }

    const totalScore = Math.floor(baseScore * multiplier);

    return {
      total: totalScore,
      breakdown: {
        base: baseScore,
        multiplier: multiplier,
        evacuation: evacuationScore,
        time: timeBonus,
        hp: hpBonus,
        cost: costBonus,
        defeat: defeatBonus,
      },
      stats: {
        evacuated: Math.floor(evacuatedCount),
        goal: evacuationGoal,
        hp: Math.floor(hp),
        timeBonus: Math.floor(timeBonus),
        totalScore: totalScore,
        clearTime: clearTime,
        defeatedEnemies: defeatedEnemies,
        cost: Math.floor(cost)
      },
      badges: {
        noDamage: hasNoDamageBadge,
        evacuation: hasEvacuationBadge,
        economy: hasEconomyBadge,
      }
    };
  };

  const handleSlotClick = (r, c) => {
    const key = `${r}-${c}`;
    if (towers[key]) {
      if (towers[key].card.type !== 'purple') {
        setRemoveModal({ r, c, key });
      }
      return;
    }
    if (selectedCard) {
      // オーバーフロー報酬のコスト割引を適用
      const discount = categoryBuffs[selectedCard.category]?.costDiscount || 0;

      // emergencyElevatorのコスト割引を計算
      let globalCostReduction = 0;
      Object.values(towersRef.current).forEach((t) => {
        if (t.card.effect === 'firefighterSupport') {
          globalCostReduction += t.card.costReduction || 0;
        }
      });

      const totalDiscount = discount + globalCostReduction;
      const actualCost = Math.floor(selectedCard.cost * (1 - totalDiscount));

      if (cost >= actualCost) {
        setCost((val) => val - actualCost);
        setTowers((prev) => {
          const newTowers = { ...prev, [key]: { card: selectedCard, timer: 0, isNew: true } };
          recalculateStaticBuffs(newTowers);
          return newTowers;
        });
        // 設置エフェクトを追加（タワー中心座標）
        const placeColors = { red: 'border-red-400', yellow: 'border-yellow-400', green: 'border-green-400', blue: 'border-blue-400', purple: 'border-purple-400' };
        addPlacementEffect(r + 0.5, c + 0.5, placeColors[selectedCard.type] || 'border-cyan-400');
        addEffect(c + 0.5, r + 0.5, '設置!', 'text-cyan-300 font-bold', 'large');
        // カード選択を維持（連続配置を可能にする）
      }
    }
  };

  const confirmRemove = () => {
    if (removeModal) {
      const key = removeModal.key;
      // 簡易アニメ: isRemovingフラグを立て、少し遅れて削除
      setTowers((prev) => ({
        ...prev,
        [key]: prev[key] ? { ...prev[key], isRemoving: true } : prev[key],
      }));
      setTimeout(() => {
        setTowers((prev) => {
          const copy = { ...prev };
          delete copy[key];
          recalculateStaticBuffs(copy);
          return copy;
        });
      }, 300);
      addEffect(removeModal.c + 0.5, removeModal.r + 0.5, '撤去', 'text-gray-400');
    }
    setRemoveModal(null);
  };

  const startBattle = (mission) => {
    setIsFirstLaunch(false); // 初回アニメーション無効化
    setSelectedMission(mission);
    setDifficulty(DIFFICULTIES[mission.difficulty]);
    // BRIEFINGシステムの初期化
    setTiers({
      fire: 1,
      alarm: 1,
      evacuation: 1,
      facility: 1,
      other: 1,
    });
    setCategoryBuffs({
      fire: { costDiscount: 0, powerBuff: 0 },
      alarm: { costDiscount: 0, powerBuff: 0 },
      evacuation: { costDiscount: 0, powerBuff: 0 },
      facility: { costDiscount: 0, powerBuff: 0 },
      other: { costDiscount: 0, powerBuff: 0 },
    });
    setBriefingState({
      round: 1,
      phase: 'SELECT',
      selectedCategory: null,
      quizzes: [],
      currentQIndex: 0,
      correctCount: 0,
      totalCost: 0,
      answerHistory: [],
    });
    setPhase('BRIEFING');
  };

  const handleRetry = () => {
    clearBattleFx();
    // BRIEFINGシステムの初期化
    setTiers({
      fire: 1,
      alarm: 1,
      evacuation: 1,
      facility: 1,
      other: 1,
    });
    setCategoryBuffs({
      fire: { costDiscount: 0, powerBuff: 0 },
      alarm: { costDiscount: 0, powerBuff: 0 },
      evacuation: { costDiscount: 0, powerBuff: 0 },
      facility: { costDiscount: 0, powerBuff: 0 },
      other: { costDiscount: 0, powerBuff: 0 },
    });
    setBriefingState({
      round: 1,
      phase: 'SELECT',
      selectedCategory: null,
      quizzes: [],
      currentQIndex: 0,
      correctCount: 0,
      totalCost: 0,
      answerHistory: [],
    });
    setPhase('BRIEFING');
  };

  // BRIEFINGフェーズ: カテゴリ選択
  const handleBriefingCategorySelect = (categoryId) => {
    // 問題プールからランダムに3問選択
    const allQuestions = QUIZ_QUESTIONS[categoryId] || [];
    const shuffled = [...allQuestions].sort(() => Math.random() - 0.5);
    const selectedQuizzes = shuffled.slice(0, 3);

    setBriefingState(prev => ({
      ...prev,
      phase: 'QUIZ',
      selectedCategory: categoryId,
      quizzes: selectedQuizzes,
      currentQIndex: 0,
      correctCount: 0,
      answerHistory: [],
    }));
  };

  // BRIEFINGフェーズ: クイズ回答
  const handleBriefingAnswerQuiz = (answerIndex) => {
    const currentQuiz = briefingState.quizzes[briefingState.currentQIndex];
    const isCorrect = answerIndex === currentQuiz.answer;
    const newCorrectCount = briefingState.correctCount + (isCorrect ? 1 : 0);

    // 回答履歴に記録
    const newAnswerHistory = [
      ...briefingState.answerHistory,
      {
        questionIndex: briefingState.currentQIndex,
        selectedAnswer: answerIndex,
        correctAnswer: currentQuiz.answer,
        isCorrect: isCorrect,
        question: currentQuiz.question,
        options: currentQuiz.options,
      }
    ];

    // FEEDBACKフェーズへ遷移
    setBriefingState(prev => ({
      ...prev,
      phase: 'FEEDBACK',
      correctCount: newCorrectCount,
      answerHistory: newAnswerHistory,
    }));
  };

  // BRIEFINGフェーズ: FEEDBACK終了後の遷移
  const handleBriefingFeedbackNext = () => {
    if (briefingState.currentQIndex < briefingState.quizzes.length - 1) {
      // 次の問題へ
      setBriefingState(prev => ({
        ...prev,
        phase: 'QUIZ',
        currentQIndex: prev.currentQIndex + 1,
      }));
    } else {
      // 全問終了 → 結果画面へ
      const reward = BRIEFING_REWARD_TABLE[briefingState.correctCount] || 0;
      const newTotalCost = briefingState.totalCost + reward;

      // Tier更新
      const currentTier = tiers[briefingState.selectedCategory];
      const newTier = currentTier + 1;
      setTiers(prev => ({
        ...prev,
        [briefingState.selectedCategory]: newTier,
      }));

      // オーバーフロー報酬（Tier > 3の場合）
      if (newTier > 3) {
        setCategoryBuffs(prev => ({
          ...prev,
          [briefingState.selectedCategory]: {
            costDiscount: prev[briefingState.selectedCategory].costDiscount + OVERFLOW_BONUS.costDiscount,
            powerBuff: prev[briefingState.selectedCategory].powerBuff + OVERFLOW_BONUS.powerBuff,
          },
        }));
      }

      setBriefingState(prev => ({
        ...prev,
        phase: 'RESULT',
        totalCost: newTotalCost,
      }));
    }
  };

  // BRIEFINGフェーズ: ラウンド終了
  const handleBriefingFinishRound = () => {
    setBriefingState(prev => ({
      ...prev,
      round: prev.round + 1,
      phase: 'SELECT',
      selectedCategory: null,
      quizzes: [],
      currentQIndex: 0,
      correctCount: 0,
      answerHistory: [],
    }));
  };

  // BRIEFINGフェーズ: DECK_BUILDへ遷移
  const handleBriefingToDeckBuild = () => {
    setDeckBuildState({
      selectedCardIds: [],
      remainingCost: briefingState.totalCost,
    });
    setPhase('DECK_BUILD');
  };

  // DECK_BUILDフェーズ: カード選択/解除
  const handleDeckCardSelect = (cardId) => {
    const card = ALL_CARDS[cardId];
    if (!card) return;

    const selectCost = card.tier === 1 ? 0 : card.cost;

    setDeckBuildState(prev => {
      const isSelected = prev.selectedCardIds.includes(cardId);

      if (isSelected) {
        // 解除: コスト返却
        return {
          selectedCardIds: prev.selectedCardIds.filter(id => id !== cardId),
          remainingCost: prev.remainingCost + selectCost,
        };
      } else {
        // 選択: 上限・コストチェック
        if (prev.selectedCardIds.length >= 6) return prev;
        if (prev.remainingCost < selectCost) return prev;

        return {
          selectedCardIds: [...prev.selectedCardIds, cardId],
          remainingCost: prev.remainingCost - selectCost,
        };
      }
    });
  };

  // DECK_BUILDフェーズ: 戦闘開始（選択されたカードでデッキを構築）
  const handleDeckBuildStartBattle = () => {
    // 選択されたカードでデッキを構築
    const newDeck = {};
    deckBuildState.selectedCardIds.forEach(cardId => {
      newDeck[cardId] = ALL_CARDS[cardId];
    });

    setDeck(newDeck);
    setCost(deckBuildState.remainingCost);
    setPrevCost(deckBuildState.remainingCost);
    lastCostRef.current = deckBuildState.remainingCost;
    setHp(INITIAL_HP);
    setTowers({});
    recalculateStaticBuffs({});
    setEnemies([]);
    setEffects([]);
    setAttackEffects([]);
    setHitEffects([]);
    setDeathEffects([]);
    setPlacementEffects([]);
    setScorchMarks([]);
    setSelectedCard(null);
    setIsPaused(false);
    frameRef.current = 0;

    // 勝利条件・スコアシステムの初期化
    setIsVictory(false);
    setEvacuatedCount(0);
    evacuatedCountRef.current = 0;
    setDefeatedEnemies(0);
    setClearTime(0);
    if (selectedMission) {
      setEvacuationGoal(selectedMission.evacuationGoal || 100);
    }

    setPhase('BATTLE');
  };

  return (
    <div className="w-full h-screen overflow-hidden font-sans select-none">
      {phase === 'MENU' && (
        <Menu
          missions={DRAFT_MISSIONS}
          onStartBattle={startBattle}
          onShowGallery={() => setPhase('GALLERY')}
          isFirstLaunch={isFirstLaunch}
        />
      )}
      {phase === 'GALLERY' && (
        <Gallery onBack={() => setPhase('MENU')} />
      )}
      {phase === 'BRIEFING' && (
        <BriefingPhase
          round={briefingState.round}
          phase={briefingState.phase}
          selectedCategory={briefingState.selectedCategory}
          quizzes={briefingState.quizzes}
          currentQIndex={briefingState.currentQIndex}
          correctCount={briefingState.correctCount}
          totalCost={briefingState.totalCost}
          answerHistory={briefingState.answerHistory}
          tiers={tiers}
          onSelectCategory={handleBriefingCategorySelect}
          onAnswerQuiz={handleBriefingAnswerQuiz}
          onFeedbackNext={handleBriefingFeedbackNext}
          onFinishRound={handleBriefingFinishRound}
          onStartBattle={handleBriefingToDeckBuild}
          onBackToTitle={handleBackToTitle}
        />
      )}
      {phase === 'DECK_BUILD' && (
        <DeckBuildPhase
          availableCards={Object.values(ALL_CARDS).filter(card =>
            card.id !== 'fireEngine' && card.tier <= tiers[card.category]
          )}
          selectedCards={deckBuildState.selectedCardIds}
          remainingCost={deckBuildState.remainingCost}
          totalCost={briefingState.totalCost}
          tiers={tiers}
          categoryBuffs={categoryBuffs}
          onSelectCard={handleDeckCardSelect}
          onStartBattle={handleDeckBuildStartBattle}
          onBackToTitle={handleBackToTitle}
        />
      )}
      {phase === 'BATTLE' && (
        <BattleField
          hp={hp}
          cost={cost}
          prevCost={prevCost}
          evacuatedCount={evacuatedCount}
          evacuationGoal={evacuationGoal}
          frameCount={frameRef.current}
          timeLimit={timeLimit}
          towers={towers}
          enemies={enemies}
          effects={effects}
          attackEffects={attackEffects}
          hitEffects={hitEffects}
          deathEffects={deathEffects}
          placementEffects={placementEffects}
          areaEffects={areaEffects}
          scorchMarks={scorchMarks}
          difficulty={difficulty}
          difficultyRef={difficultyRef}
          deck={deck}
          selectedCard={selectedCard}
          removeModal={removeModal}
          damaged={damaged}
          categoryBuffs={categoryBuffs}
          globalCostReduction={globalCostReduction}
          handleSlotClick={handleSlotClick}
          setSelectedCard={setSelectedCard}
          confirmRemove={confirmRemove}
          setRemoveModal={setRemoveModal}
          onSurrender={handleSurrender}
        />
      )}
      {phase === 'GAMEOVER' && (
        <GameOver
          isVictory={isVictory}
          scoreData={calculateFinalScore()}
          difficulty={selectedMission?.difficulty || 'NORMAL'}
          deck={deck}
          cost={cost}
          onBackToMenu={() => setPhase('MENU')}
          onRetry={handleRetry}
        />
      )}
    </div>
  );
}
