# BLAZING DEFENSE: BRIEFINGフェーズ 詳細設計書 v2.0

## 📋 目次
1. [概要](#概要)
2. [システム全体像](#システム全体像)
3. [設備種別とTierシステム](#設備種別とtierシステム)
4. [制限時間システム](#制限時間システム)
5. [クイズシステム](#クイズシステム)
6. [オーバーフロー報酬システム](#オーバーフロー報酬システム)
7. [データ構造](#データ構造)
8. [UI/UX仕様](#uiux仕様)
9. [戦略パターン例](#戦略パターン例)

---

## 概要

### 目的
既存のDRAFT/EXAMフェーズを統合し、デッキビルド要素を強化した新しいBRIEFINGフェーズを実装する。

### 主な変更点
- **旧システム**: DRAFT（1問）→ EXAM（5問○×）→ BATTLE
- **新システム**: BRIEFING（3ラウンド×3問＝計9問）→ BATTLE

### v2.0での追加変更点
- **制限時間システム**: 全設備に持続時間を設定（永続/有限）
- **バランス調整**: 経済効率・火力効率の平準化
- **現実整合性向上**: 排煙設備等の効果を現実に即して修正

### コンセプト
「知識で装備を解放せよ」— クイズに正解することで強力なユニットをアンロックし、自分だけのデッキを構築する。

---

## システム全体像

### ゲームフロー

```
MENU（ミッション選択）
  ↓
BRIEFING
  ├─ ラウンド1: 設備種別選択 → クイズ3問 → Tier解放 + コスト獲得
  ├─ ラウンド2: 設備種別選択 → クイズ3問 → Tier解放 + コスト獲得
  └─ ラウンド3: 設備種別選択 → クイズ3問 → Tier解放 + コスト獲得
  ↓
BATTLE（獲得したコストとアンロックしたカードで戦闘）
  ↓
GAMEOVER
```

### BRIEFINGの構成

**3ラウンド制:**
- 各ラウンドで5種の設備種別から1つを選択
- 選択した種別のクイズに3問挑戦
- 正解数に応じてコスト獲得
- 選択した種別のTierが1段階上昇

**選択の自由度:**
- 同じ種別を複数回選択可能（特化型ビルド）
- 毎回違う種別を選択可能（バランス型ビルド）
- 選択履歴に応じてTierが段階的にアンロック

---

## 設備種別とTierシステム

### 5つの設備種別

| 種別ID | 名称 | 色 | 初期状態 | 特徴 |
|--------|------|-----|----------|------|
| `fire` | 消火設備 | 🔴 Red | Tier1アンロック済み | 敵にダメージを与える攻撃型 |
| `alarm` | 警報設備 | 🟡 Yellow | Tier1アンロック済み | コスト回復を強化する経済型 |
| `evacuation` | 避難設備 | 🟢 Green | Tier1アンロック済み | 避難速度を加速する勝利支援型 |
| `facility` | 消火活動上必要な施設 | 🔵 Blue | Tier1アンロック済み | 他のタワーを強化するバフ型 |
| `other` | その他 | 🟣 Purple | Tier1アンロック済み | 特殊効果を持つユニーク型 |

### Tierシステム

```
初期状態（BRIEFING開始時）:
├─ 消火設備       [Tier1: ✓] [Tier2: 🔒] [Tier3: 🔒]
├─ 警報設備       [Tier1: ✓] [Tier2: 🔒] [Tier3: 🔒]
├─ 避難設備       [Tier1: ✓] [Tier2: 🔒] [Tier3: 🔒]
├─ 消火活動施設   [Tier1: ✓] [Tier2: 🔒] [Tier3: 🔒]
└─ その他         [Tier1: ✓] [Tier2: 🔒] [Tier3: 🔒]

ラウンド1で「消火設備」選択:
└─ 消火設備       [Tier1: ✓] [Tier2: ✓] [Tier3: 🔒]

ラウンド2で「消火設備」再選択:
└─ 消火設備       [Tier1: ✓] [Tier2: ✓] [Tier3: ✓]

ラウンド3で「消火設備」再々選択:
└─ 消火設備       [Tier1: ✓] [Tier2: ✓] [Tier3: ✓] → オーバーフロー報酬発動
```

**Tier解放ルール:**
- 各ラウンドで選択した種別のTierが+1される
- Tier1: 全種別が初期アンロック済み
- Tier2: 1回選択で解放
- Tier3: 2回選択で解放
- Tier3以上: オーバーフロー報酬（後述）

---

## 制限時間システム

### 概要

全ての設備に**持続時間**を設定。時間経過で設備が消滅し、再配置が必要になる。

### 設計原則

```
強い効果 → 短い持続時間（実質コスト増）
弱い効果 → 長い持続時間（使いやすさ向上）
現実的な消耗 → 消火剤は切れる、電子機器・構造物は長持ち
```

### 時間カテゴリ

| カテゴリ | 時間 | 意味 | 3分間の再配置回数 |
|----------|------|------|-------------------|
| 超短 | 30秒 | 消耗が激しい | 6回 |
| 短 | 45秒 | すぐ切れる | 4回 |
| 中 | 60秒 | 標準的 | 3回 |
| 長 | 90秒 | 長持ち | 2回 |
| 超長 | 120秒 | ほぼ持つ | 1-2回 |
| 永続 | ∞ | 消えない | 1回 |

### 種別ごとの持続時間設計

#### 🔴 消火設備（消火剤は有限）

| 設備 | コスト | 持続時間 | 理由（現実） | 理由（バランス） |
|------|--------|----------|--------------|------------------|
| 消火器 | 30 | 45秒 | 薬剤が切れる | コスト効率調整 |
| 屋内消火栓 | 80 | 90秒 | 水源接続だが疲労 | 標準効率 |
| スプリンクラー | 90 | 120秒 | 自動散水、水源豊富 | DPS効率が低いので長め |
| 泡消火設備 | 120 | 60秒 | 泡原液タンクは有限 | 高火力なので短め |
| 不活性ガス | 100 | 45秒 | ガスボンベは有限 | 全体攻撃が強いので短め |

#### 🟡 警報設備（電子機器）

| 設備 | コスト | 持続時間 | 理由（現実） | 理由（バランス） |
|------|--------|----------|--------------|------------------|
| 非常ベル | 30 | 60秒 | 電池消耗、打鐘疲労 | 経済効率調整（コスト増） |
| 自動火災報知 | 60 | 90秒 | 電源接続で安定 | 警告機能の価値考慮 |
| 放送設備 | 100 | 120秒 | 電源接続で安定 | 高コストなので長め |
| 消防機関通報 | 120 | 特殊 | 10秒後ポンプ車変身 | 既存仕様維持 |

#### 🟢 避難設備（構造物・電気設備）

| 設備 | コスト | 持続時間 | 理由（現実） | 理由（バランス） |
|------|--------|----------|--------------|------------------|
| 避難はしご | 40 | **永続** | 金属製の固定設備 | 基本設備なので安定 |
| 誘導灯 | 60 | **永続** | 電気設備、常時点灯 | HP回復の継続性 |
| 緩降機 | 80 | 120秒 | ロープ/ベルトの消耗 | 高効率避難なので制限 |
| 救助袋 | 120 | 90秒 | 布製、摩耗がある | 攻撃速度バフが強い |

#### 🔵 消火活動上必要な施設（建物設備）

| 設備 | コスト | 持続時間 | 理由（現実） | 理由（バランス） |
|------|--------|----------|--------------|------------------|
| 連結送水管 | 60 | **永続** | 建物の配管設備 | 周囲バフで配置依存 |
| 非常コンセント | 100 | 120秒 | 電源設備だが過負荷 | グローバルバフなので制限 |
| 排煙設備 | 150 | 90秒 | モーター過熱 | 強効果なので短め |

#### 🟣 その他設備（特殊）

| 設備 | コスト | 持続時間 | 理由（現実） | 理由（バランス） |
|------|--------|----------|--------------|------------------|
| 防火戸 | 120 | 5秒 | 閉鎖後に開放 | 既存仕様 |
| 非常用エレベーター | 100 | **永続** | 建物設備 | コスト割引の継続性 |
| パッケージ型 | 120 | 60秒 | 消火剤タンク有限 | DoT+減速が強い |
| 特小自火報 | 50 | 90秒 | 電池式、寿命あり | 経済設備なので中程度 |
| 防災センター | 200 | 120秒 | 機器の過負荷 | 全能力バフが強いので制限 |

### 永続設備一覧（4種）

```
🟢 避難はしご（40コスト）- 基本避難設備
🟢 誘導灯（60コスト）- 避難+HP回復
🔵 連結送水管（60コスト）- 周囲攻撃力バフ
🟣 非常用エレベーター（100コスト）- コスト割引+攻撃速度
```

**設計意図:**
- 安価で基本的な設備は永続
- 配置場所が重要な設備は永続（連結送水管）
- 早期配置が有利な設備は永続（非常用エレベーター）

### UI表示

**カード情報に持続時間を表示:**
```
┌────────────┐
│ [🔥消火器] │
│ コスト: 30 │
│ 時間: 45秒 │
└────────────┘

┌────────────┐
│ [🚪誘導灯] │
│ コスト: 60 │
│ 時間: ∞   │
└────────────┘
```

**設置済みタワーの残り時間:**
```
残り時間多い（緑）:     残り時間少ない（黄→赤）:
┌──────────┐           ┌──────────┐
│ [🔥]     │           │ [🔥]     │
│ ████████ │           │ ██░░░░░░ │ ← 点滅
│  38秒    │           │  8秒!    │
└──────────┘           └──────────┘
```

**消滅時のエフェクト:**
```
消火設備: 「薬剤切れ！」
警報設備: 「電源ダウン！」
避難設備: 「疲労限界！」
施設設備: 「過負荷！」
その他:   「停止！」
```

---

## クイズシステム

### クイズの構造

**各ラウンドの流れ:**
1. 設備種別を選択
2. その種別の問題プールからランダムに3問出題
3. 各問題に回答（3択形式）
4. 正解数に応じてコスト獲得

### 報酬テーブル

| 正解数 | 基本報酬 | 全問正解ボーナス | 合計 |
|--------|----------|------------------|------|
| 0問    | 0        | -                | **0** |
| 1問    | 100      | -                | **100** |
| 2問    | 200      | -                | **200** |
| 3問    | 300      | +100             | **400** |

**計算式:**
```javascript
const baseReward = correctCount * 100;
const perfectBonus = (correctCount === 3) ? 100 : 0;
const totalReward = baseReward + perfectBonus;
```

**全ラウンド満点時の総獲得コスト:**
- 400 × 3 = **1,200コスト**

### 問題プールの構成

各種別につき10問程度を用意し、ランダムに3問選出する。

**問題の形式:**
- 3択問題
- 消防設備士試験の知識に基づく
- 実務的な内容（法規・技術基準・運用）
- 類別タグを表示（乙4、乙6等）

---

## オーバーフロー報酬システム

### 概要

Tier3まで解放済みの種別を再度選択した場合、その種別のカード全体が強化される。

### 報酬内容

**種別ごとのバフ（1回のオーバーフローごとに累積）:**
- **コスト割引**: -10%
- **性能強化**: +15%

**例:**
```
消火設備をラウンド1,2で選択 → Tier3解放
消火設備をラウンド3で選択 → オーバーフロー1回目

結果:
- 消火設備のカード設置コスト: -10%
- 消火設備のカード性能: +15%
```

### 実装の詳細

**状態管理:**
```javascript
const [categoryBuffs, setCategoryBuffs] = useState({
  fire: { costDiscount: 0, powerBuff: 0 },
  alarm: { costDiscount: 0, powerBuff: 0 },
  evacuation: { costDiscount: 0, powerBuff: 0 },
  facility: { costDiscount: 0, powerBuff: 0 },
  other: { costDiscount: 0, powerBuff: 0 },
});
```

**コスト割引の適用:**
```javascript
// カード設置時
const category = getCardCategory(selectedCard.id);
const discount = categoryBuffs[category].costDiscount;
const finalCost = Math.floor(selectedCard.cost * (1 - discount));
```

**性能バフの適用:**
```javascript
// 攻撃計算時
const category = getCardCategory(tower.card.id);
const powerBuff = categoryBuffs[category].powerBuff;
const finalDamage = tower.card.power * (1 + powerBuff);
```

---

## データ構造

### EQUIPMENT_TREES定義

```javascript
const EQUIPMENT_TREES = {
  fire: {
    name: '消火設備',
    icon: <Shield size={32} />,
    color: 'red',
    initialUnlock: true,
    tiers: {
      1: ['extinguisher'],
      2: ['indoorHydrant', 'sprinkler'],
      3: ['foamSystem', 'inertGasSystem'],
    },
  },
  alarm: {
    name: '警報設備',
    icon: <Bell size={32} />,
    color: 'yellow',
    initialUnlock: true,
    tiers: {
      1: ['emergencyBell'],
      2: ['autoFireAlarm'],
      3: ['broadcastSystem', 'fireNotification'],
    },
  },
  evacuation: {
    name: '避難設備',
    icon: <DoorOpen size={32} />,
    color: 'green',
    initialUnlock: true,
    tiers: {
      1: ['escapeLadder'],
      2: ['guidanceLight', 'descentDevice'],
      3: ['rescueChute'],
    },
  },
  facility: {
    name: '消火活動上必要な施設',
    icon: <Zap size={32} />,
    color: 'blue',
    initialUnlock: true,
    tiers: {
      1: ['standpipe'],
      2: ['emergencyOutlet'],
      3: ['smokeControl'],
    },
  },
  other: {
    name: 'その他',
    icon: <Package size={32} />,
    color: 'purple',
    initialUnlock: true,  // v2.0: 初期解放に変更
    tiers: {
      1: ['fireDoor', 'emergencyElevator'],
      2: ['packageFireSystem', 'compactFireAlarm'],
      3: ['disasterControlCenter'],
    },
  },
};
```

### 全カード一覧

```javascript
const ALL_CARDS = {
  // 🔴 消火設備
  extinguisher: {
    id: 'extinguisher', name: '消火器', type: 'red',
    cost: 30, duration: 2700, // 45秒
    power: 2, speed: 40, damageType: 'water', rangeType: 'surround',
    desc: '【消火】周囲1マス(3×3)へ散水 [45秒]',
  },
  indoorHydrant: {
    id: 'indoorHydrant', name: '屋内消火栓設備', type: 'red',
    cost: 80, duration: 5400, // 90秒
    power: 4, speed: 50, damageType: 'water', rangeType: 'line',
    knockback: 0.3,
    desc: '【消火】縦1列に強力放水＋ノックバック [90秒]',
  },
  sprinkler: {
    id: 'sprinkler', name: 'スプリンクラー設備', type: 'red',
    cost: 90, duration: 7200, // 120秒
    power: 1.5, speed: 30, damageType: 'water', rangeType: 'wide',
    desc: '【消火】横1列×縦3マスを高速散水 [120秒]',
  },
  foamSystem: {
    id: 'foamSystem', name: '泡消火設備', type: 'red',
    cost: 120, duration: 3600, // 60秒
    power: 8, speed: 60, damageType: 'foam', rangeType: 'surround',
    desc: '【特効】周囲1マスに大ダメージ（B火災2倍）[60秒]',
  },
  inertGasSystem: {
    id: 'inertGasSystem', name: '不活性ガス消火設備', type: 'red',
    cost: 100, duration: 2700, // 45秒
    power: 0.4, speed: 5, damageType: 'gas', rangeType: 'global',
    desc: '【特効】全画面へ持続ダメージ（C火災1.5倍）[45秒]',
  },

  // 🟡 警報設備
  emergencyBell: {
    id: 'emergencyBell', name: '非常ベル', type: 'yellow',
    cost: 30, duration: 3600, // 60秒
    effect: 'economy', value: 0.6, rangeType: 'self',
    desc: '【警報】コスト回復+0.6/秒 [60秒]',
  },
  autoFireAlarm: {
    id: 'autoFireAlarm', name: '自動火災報知設備', type: 'yellow',
    cost: 60, duration: 5400, // 90秒
    effect: 'economy', value: 1.2, earlyWarning: true, rangeType: 'self',
    desc: '【警報】コスト+1.2/秒＋敵感知警告 [90秒]',
  },
  broadcastSystem: {
    id: 'broadcastSystem', name: '放送設備', type: 'yellow',
    cost: 100, duration: 7200, // 120秒
    effect: 'economyAndEvacuation', economyValue: 2.0, evacuationValue: 0.5,
    rangeType: 'self',
    desc: '【警報】コスト+2.0/秒＋避難+0.5人/秒 [120秒]',
  },
  fireNotification: {
    id: 'fireNotification', name: '消防機関へ通報する火災報知設備', type: 'yellow',
    cost: 120,
    effect: 'economyWithTransform', value: 1.0,
    transformDelay: 600, transformInto: 'fireEngine', rangeType: 'self',
    desc: '【警報】コスト+1.0/秒→10秒後ポンプ車に変身',
  },

  // 🟢 避難設備
  escapeLadder: {
    id: 'escapeLadder', name: '避難はしご', type: 'green',
    cost: 40, duration: null, // 永続
    effect: 'evacuation', value: 0.5, rangeType: 'self',
    desc: '【避難】避難速度+0.5人/秒 [永続]',
  },
  guidanceLight: {
    id: 'guidanceLight', name: '誘導灯', type: 'green',
    cost: 60, duration: null, // 永続
    effect: 'evacuationWithRegen', evacuationValue: 0.8, regenValue: 0.1,
    rangeType: 'self',
    desc: '【避難】避難+0.8人/秒＋HP回復+0.1/秒 [永続]',
  },
  descentDevice: {
    id: 'descentDevice', name: '緩降機', type: 'green',
    cost: 80, duration: 7200, // 120秒
    effect: 'evacuation', value: 1.0, rangeType: 'self',
    desc: '【避難】避難速度+1.0人/秒 [120秒]',
  },
  rescueChute: {
    id: 'rescueChute', name: '救助袋', type: 'green',
    cost: 120, duration: 5400, // 90秒
    effect: 'evacuationWithRegenAndBuff',
    evacuationValue: 1.5, regenValue: 0.2, globalSpeedBuff: 0.1,
    rangeType: 'global',
    desc: '【避難】避難+1.5人/秒＋HP+0.2/秒＋攻撃速度+10% [90秒]',
  },

  // 🔵 消火活動上必要な施設
  standpipe: {
    id: 'standpipe', name: '連結送水管', type: 'blue',
    cost: 60, duration: null, // 永続
    effect: 'buffPower', value: 0.3, rangeType: 'surround',
    desc: '【施設】周囲3×3の攻撃力+30% [永続]',
  },
  emergencyOutlet: {
    id: 'emergencyOutlet', name: '非常コンセント設備', type: 'blue',
    cost: 100, duration: 7200, // 120秒
    effect: 'globalSpeedBuffWithRegen', speedBuff: 0.2, regenValue: 0.15,
    rangeType: 'global',
    desc: '【施設】全攻撃速度+20%＋HP回復+0.15/秒 [120秒]',
  },
  smokeControl: {
    id: 'smokeControl', name: '排煙設備', type: 'blue',
    cost: 150, duration: 5400, // 90秒
    effect: 'globalSlowWithEvacuation',
    slowValue: 0.15, evacuationValue: 0.5, rangeType: 'global',
    desc: '【施設】全敵-15%速度＋避難+0.5人/秒 [90秒]',
  },

  // 🟣 その他
  fireDoor: {
    id: 'fireDoor', name: '防火戸', type: 'purple',
    cost: 120, duration: 300, // 5秒
    effect: 'rowBlockTimed', blockDuration: 300, selfDestruct: true,
    rangeType: 'row',
    desc: '【特殊】横1列を5秒間完全停止→消滅',
  },
  emergencyElevator: {
    id: 'emergencyElevator', name: '非常用エレベーター', type: 'purple',
    cost: 100, duration: null, // 永続
    effect: 'firefighterSupport', globalSpeedBuff: 0.15, costReduction: 0.1,
    rangeType: 'global',
    desc: '【特殊】全攻撃速度+15%＋配置コスト-10% [永続]',
  },
  packageFireSystem: {
    id: 'packageFireSystem', name: 'パッケージ型自動消火設備', type: 'purple',
    cost: 120, duration: 3600, // 60秒
    effect: 'areaDotWithSlow', dotDamage: 1.0, slowValue: 0.3,
    rangeType: 'surround',
    desc: '【特殊】周囲3×3にDoT1.0/秒＋移動-30% [60秒]',
  },
  compactFireAlarm: {
    id: 'compactFireAlarm', name: '特小自火報', type: 'purple',
    cost: 50, duration: 5400, // 90秒
    effect: 'economy', value: 1.0, rangeType: 'self',
    desc: '【特殊】コスト回復+1.0/秒 [90秒]',
  },
  disasterControlCenter: {
    id: 'disasterControlCenter', name: '防災センター', type: 'purple',
    cost: 200, duration: 7200, // 120秒
    effect: 'ultimateBuff',
    globalPowerBuff: 0.2, globalSpeedBuff: 0.2,
    evacuationValue: 1.0, regenValue: 0.3, rangeType: 'global',
    desc: '【特殊】全能力+20%＋避難+1.0人/秒＋HP+0.3/秒 [120秒]',
  },

  // ポンプ車（消防機関通報から変身）
  fireEngine: {
    id: 'fireEngine', name: 'ポンプ車', type: 'purple',
    cost: 0, duration: 300, // 5秒
    power: 10, speed: 10, knockback: 1.5, damageType: 'water',
    rangeType: 'line',
    desc: '【召喚】縦1列を5秒間制圧',
  },
};
```

---

## UI/UX仕様

### 1. 種別選択画面

```
┌─────────────────────────────────────────────┐
│ BRIEFING - ラウンド 1/3                      │
├─────────────────────────────────────────────┤
│                                             │
│ 強化する設備種別を選択:                     │
│                                             │
│ ┌─────────┐ ┌─────────┐ ┌─────────┐         │
│ │ 🔴      │ │ 🟡      │ │ 🟢      │         │
│ │ 消火設備│ │ 警報設備│ │ 避難設備│         │
│ │ Tier 1  │ │ Tier 1  │ │ Tier 1  │         │
│ └─────────┘ └─────────┘ └─────────┘         │
│                                             │
│ ┌─────────┐ ┌─────────┐                     │
│ │ 🔵      │ │ 🟣      │                     │
│ │ 施設    │ │ その他  │                     │
│ │ Tier 1  │ │ Tier 1  │                     │
│ └─────────┘ └─────────┘                     │
│                                             │
└─────────────────────────────────────────────┘
```

### 2. クイズ画面

```
┌─────────────────────────────────────────────┐
│ 消火設備 - 問題 2/3                [乙6]    │
├─────────────────────────────────────────────┤
│                                             │
│ 消火器の「黄」マークが示す適応火災は？      │
│                                             │
│ ┌─────────────────────────────────────────┐ │
│ │ A. A火災（普通火災）                    │ │
│ └─────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────┐ │
│ │ B. B火災（油火災）                      │ │
│ └─────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────┐ │
│ │ C. C火災（電気火災）                    │ │
│ └─────────────────────────────────────────┘ │
│                                             │
│ 正解数: 1/2                                 │
│                                             │
└─────────────────────────────────────────────┘
```

### 3. ラウンド結果画面

```
┌─────────────────────────────────────────────┐
│ ラウンド 1 完了！                           │
├─────────────────────────────────────────────┤
│                                             │
│ 正解数: 3/3 🎉 パーフェクト！               │
│ 獲得コスト: +400                            │
│ 累積コスト: 400                             │
│                                             │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━         │
│                                             │
│ 🔴 消火設備 Tier1 → Tier2                   │
│ 新規解放:                                   │
│ ├─ 屋内消火栓設備（80コスト / 90秒）        │
│ └─ スプリンクラー設備（90コスト / 120秒）   │
│                                             │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━         │
│                                             │
│ [次のラウンドへ] (2/3)                      │
│                                             │
└─────────────────────────────────────────────┘
```

### 4. BATTLE画面でのタワー表示

```
通常時:                    残り少ない:
┌──────────┐              ┌──────────┐
│ [🔥]     │              │ [🔥]     │
│ ████████ │ 緑          │ ██░░░░░░ │ 黄→赤点滅
│  38秒    │              │  8秒!    │
└──────────┘              └──────────┘

永続設備:
┌──────────┐
│ [💡]     │
│    ∞     │
└──────────┘
```

---

## 戦略パターン例

### パターン1: 超特化型（同種3回選択）

```
選択履歴: [消火設備, 消火設備, 消火設備]

結果:
- 消火設備: Tier3解放 + オーバーフロー1回
- コスト割引: -10%
- 性能強化: +15%
- 初期コスト: 1,200（全問正解時）

使用可能カード:
🔴 消火器（27コスト / 45秒 / 性能1.15倍）
🔴 屋内消火栓（72コスト / 90秒 / 性能1.15倍）
🔴 スプリンクラー（81コスト / 120秒 / 性能1.15倍）
🔴 泡消火設備（108コスト / 60秒 / 性能1.15倍）
🔴 不活性ガス（90コスト / 45秒 / 性能1.15倍）

＋他種別Tier1（永続設備含む）

戦術:
- 消火設備を大量配置して火力で圧倒
- 短い持続時間を回転させて継続火力
- 永続の連結送水管・誘導灯と組み合わせ
```

### パターン2: バランス型（3種分散）

```
選択履歴: [消火設備, 警報設備, 避難設備]

結果:
- 消火設備: Tier2解放
- 警報設備: Tier2解放
- 避難設備: Tier2解放
- 初期コスト: 1,200（全問正解時）

使用可能カード:
🔴 消火器、屋内消火栓、スプリンクラー
🟡 非常ベル、自動火災報知設備
🟢 避難はしご、誘導灯、緩降機

戦術:
- 永続設備（避難はしご、誘導灯、連結送水管）を先に配置
- 経済設備で資金回収しながら消火設備を回転
- 状況に応じて柔軟に対応
```

### パターン3: 永続重視型

```
選択履歴: [避難設備, 施設, その他]

結果:
- 避難設備: Tier2解放（避難はしご、誘導灯、緩降機）
- 施設: Tier2解放（連結送水管、非常コンセント）
- その他: Tier2解放（防火戸、非常用エレベーター、パッケージ型、特小自火報）

永続設備:
🟢 避難はしご（40コスト）
🟢 誘導灯（60コスト）
🔵 連結送水管（60コスト）
🟣 非常用エレベーター（100コスト）

戦術:
- 永続設備を先に配置して安定基盤を作る
- 非常用エレベーターで以降のコスト-10%
- 連結送水管の周囲に消火器を配置（永続バフ）
- HP回復＋避難速度で長期戦対応
```

### パターン4: 制限時間を活用した回転型

```
選択履歴: [消火設備, 消火設備, 警報設備]

結果:
- 消火設備: Tier3解放
- 警報設備: Tier2解放

戦術:
1. 序盤（0〜60秒）:
   - 永続設備を配置（誘導灯、連結送水管）
   - 非常ベル×2で経済開始

2. 中盤（60〜120秒）:
   - 消火器が45秒で消える → 再配置
   - 不活性ガスを配置 → 45秒後に再配置
   - 常に「どこを再配置するか」を判断

3. 終盤（120〜180秒）:
   - 泡消火設備を配置（B火災対策）
   - 経済設備の回収が完了、火力に全振り
   - 最後まで再配置を続ける

結果:
「設置して放置」ができない！
常にアクティブな操作が必要
```

---

## 変更履歴

| 日付 | バージョン | 変更内容 |
|------|-----------|----------|
| 2025-11-28 | 1.0 | 初版作成 |
| 2025-11-29 | 2.0 | 制限時間システム追加、バランス調整、「その他」初期解放、排煙設備の効果変更 |

---

## 主な変更点まとめ（v1.0 → v2.0）

### 1. 制限時間システム
- 全設備に持続時間を設定
- 永続設備は4種に限定
- 強い効果は短い時間、弱い効果は長い時間

### 2. バランス調整
- 非常ベル: コスト25→30（経済効率の平準化）
- 消火器: 持続45秒（実質コスト増）
- 不活性ガス: 持続45秒（強効果なので短め）
- 排煙設備: 効果を「減速+避難」に変更（現実整合性）

### 3. 「その他」の初期解放
- Tier1を初期アンロックに変更
- 他種別と同様に1回選択でTier2、2回選択でTier3

### 4. 現実整合性の向上
- 排煙設備: 「煙を排出→視界確保→避難促進」という現実の役割を反映
- 非常用エレベーター: 永続に変更（建物設備）
- 消火剤を使う設備は短い持続時間

---

**以上、BRIEFING設計書 v2.0**
