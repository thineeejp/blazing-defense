# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

**BLAZING DEFENSE** は、消防設備の知識を学習できる教育的なタワーディフェンスゲームです。React + Vite + Tailwind CSSで構築された単一ページアプリケーション（SPA）で、消火設備、警報設備、避難設備などをタワーとして配置し、火災の進行を防ぎます。

## 開発コマンド

### 基本コマンド
```bash
npm install           # 初回セットアップ時の依存関係インストール
npm run dev          # 開発サーバー起動（ホットリロード有効）
npm run build        # プロダクションビルド（dist/に出力）
npm run preview      # ビルド後のプレビューサーバー起動
npm run lint         # ESLintでコードチェック（.jsx拡張子対象）
```

### 開発環境
- 開発サーバーはデフォルトで http://localhost:5173 で起動します
- ファイル変更時に自動的にブラウザがリロードされます

## アーキテクチャ

### プロジェクト構造
```
src/
  ├── components/
  │   ├── Menu.jsx            # メニュー画面（~30行）
  │   ├── GameOver.jsx        # ゲームオーバー画面（~15行）
  │   ├── BriefingPhase.jsx   # BRIEFINGフェーズ（~200行）- Tier強化システム
  │   └── BattleField.jsx     # バトル画面（~270行）
  ├── constants/
  │   ├── cards.js            # 全22種類のカード定義
  │   ├── equipment.js        # Tierシステム・オーバーフロー報酬定義
  │   └── quizzes.js          # クイズ問題プール（5種別×10問）
  ├── App.jsx                 # メインロジックと状態管理（~960行）
  ├── main.jsx                # Reactアプリケーションのエントリーポイント
  └── index.css               # グローバルスタイル（Tailwindディレクティブ含む）

public/                       # 静的アセット（あれば）
index.html                    # HTMLテンプレート
vite.config.js                # Viteビルド設定
tailwind.config.js            # TailwindCSS設定
postcss.config.js             # PostCSS設定
.eslintrc.json                # ESLint設定（React/JSX対応）
.eslintignore                 # ESLint除外設定
設計仕様書.md                # 詳細な設計ドキュメント（Ver.5.0）
```

### アーキテクチャの特徴

#### コンポーネントベース設計（Phase 1-3でリファクタリング済み）

**進化の履歴**:
- **当初**: 922行の単一コンポーネント（モノリシック設計）
- **Phase 1-3**: 560行のApp.jsx + 5つの画面コンポーネント（39%削減）
- **Phase 4以降**: BRIEFINGシステム導入でApp.jsx再拡大（~960行）+ 定数ファイル分離

**現在の設計方針（v2.0）**:
- **App.jsx**: すべてのゲーム状態とロジックを一元管理（~960行）
  - ゲーム状態（HP、コスト、避難人数、タワー、敵など）
  - ゲームロジック（スポーン、戦闘、攻撃判定、13種類のeffect処理）
  - Tierシステム、オーバーフロー報酬、変身/DoT/スロー/バフ等の特殊効果
  - イベントハンドラー
- **画面コンポーネント**: Propsベースの純粋なUIコンポーネント
  - `Menu.jsx`: 難易度選択画面
  - `BriefingPhase.jsx`: BRIEFING画面（Tier強化システム、3ラウンド制クイズ）
  - `BattleField.jsx`: バトル画面（グリッド、敵、タワー、デッキ、モーダル）
  - `GameOver.jsx`: ゲームオーバー画面
- **定数ファイル**: `src/constants/`で分離管理
  - `cards.js`: 全22種類のカード定義（13種類のeffect処理対応）
  - `equipment.js`: Tierシステム（5カテゴリ×3Tier）とオーバーフロー報酬定義
  - `quizzes.js`: クイズ問題プール（5種別×10問＝50問）

**この設計を採用した理由**:
- 小規模ゲームのため、Redux/Zustand等の状態管理ライブラリは不要
- データフローがシンプル（App.jsx → コンポーネント）
- 各画面の責務が明確で保守性が向上
- 定数ファイル分離でデータとロジックを分離
- 過度な細分化を避け、適切な粒度を維持

**欠点と今後の検討事項**:
- Props Drillingが深い（BattleFieldで25個以上のprops）
- App.jsx再拡大（960行）→ カスタムフック分離の検討
- 将来的な規模拡大時は状態管理ライブラリの導入を検討

#### 状態管理
- **React Hooksベース**: `useState`、`useEffect`、`useRef`を使用
- **useRefの活用**: `requestAnimationFrame`ループ内で最新状態を参照するため、`towersRef`、`difficultyRef`などのrefを使用
- **直接的な状態更新**: グローバル状態管理ライブラリ（Redux、Zustandなど）は現時点では使用していません
- **一元管理**: すべての状態はApp.jsxで管理し、Propsで子コンポーネントに渡す

#### ゲームループ
```javascript
// requestAnimationFrameベースのゲームループ
useEffect(() => {
  if (phase !== 'BATTLE' || isPaused) return;

  const loop = () => {
    frameRef.current += 1;
    updateBattleLogic();  // ゲームロジック更新
    gameLoopRef.current = requestAnimationFrame(loop);
  };
  gameLoopRef.current = requestAnimationFrame(loop);
  return () => cancelAnimationFrame(gameLoopRef.current);
}, [phase, isPaused]);
```

- フレームベースでゲーム状態を更新（60FPS）
- `phase`が`'BATTLE'`でかつ`isPaused`が`false`の時のみループが動作
- 敵のスポーン、移動、攻撃判定、タワーの発動などをフレームごとに処理

#### スタイリング
- **TailwindCSS**: ユーティリティクラスを直接JSX要素に適用
- **インラインスタイル**: 動的な配置（グリッド、敵の位置）はstyle属性を使用
- **CSS Modules / styled-components は使用していません**

#### アイコン
- **lucide-react**: すべてのアイコン（Flame、Wind、Shield、Bellなど）はlucide-reactから読み込み
- カスタムSVGアイコンは使用していません

### 開発履歴とコード品質改善

#### Phase 1: コード品質改善（2025-11-26 / コミット: ae703ca）
- **ESLint設定追加**: `.eslintrc.json`でReact/JSX推奨ルールを適用
- **非ブロッキングUI**: `window.confirm` → カスタムモーダル（`removeModal`）に置き換え
- **安全ガード**: `sizeSlow`計算でNaN/Infinite対策、0除算防止
- **結果**: lint/buildエラー0、警告0達成

#### Phase 2: コンポーネント分割（Menu/Draft/Exam/GameOver）（2025-11-26 / コミット: 36328bc）
- `src/components/`ディレクトリを新規作成
- Menu、GameOver、DraftPhase、ExamPhaseコンポーネントを分離
- App.jsx: 922行 → 780行（-15%削減）

#### Phase 3: BattleFieldコンポーネント分割（2025-11-26 / コミット: 13625ba）
- `BattleField.jsx`を作成（~240行）
- グリッド、敵、タワー、エフェクト、デッキ、モーダルを含む
- App.jsx: 780行 → 560行（累計-39%削減）

#### Phase 4: 勝利条件とスコアシステムの刷新（2025-11-28 / コミット: f4eda77）
- **BRIEFINGシステム導入**: DRAFT/EXAMフェーズを廃止し、Tier強化システムに置き換え
  - 3ラウンド制のクイズ形式
  - 5カテゴリ（消火/警報/避難/施設/その他）× 3Tier
  - Tier4以降でオーバーフロー報酬（コスト割引-10%、攻撃力+15%）
- **定数ファイル分離**: `src/constants/`ディレクトリ新設
  - `cards.js`: 全22カード定義
  - `equipment.js`: Tierシステム定義
  - `quizzes.js`: クイズ問題プール（50問）
- **勝利条件変更**: 時間制限 + 避難人数目標達成
- **BriefingPhase.jsx**: 新コンポーネント作成（~200行）
- App.jsx: 560行 → ~960行（BRIEFINGロジック追加で再拡大）

#### Phase 5: バグ修正（レビュー指摘対応）（2025-11-30 / コミット: 32749de）
- **アイコン描画修正**: `React.createElement(tower.card.icon, { size: 24 })`に統一
- **攻撃可能カード判定修正**: `power !== undefined && power > 0`で判定
- **effect処理完全実装**: 13種類のeffectをswitch-caseで実装
  - economy, evacuation, economyAndEvacuation, economyWithTransform
  - evacuationWithRegen, evacuationWithRegenAndBuff, buffPower
  - globalSpeedBuffWithRegen, globalSlowWithEvacuation, rowBlockTimed
  - firefighterSupport, areaDotWithSlow, ultimateBuff
- **特殊効果ロジック実装**: 変身、DoT、スロー、バフ、コスト割引

#### Phase 6: セルフレビュー対応（データ定義の整合性修正）（2025-11-30 / コミット: aac03a7）
- **fireNotificationのduration未定義を修正**: `duration: null`（永続・変身まで）を明示
- **autoFireAlarmのearlyWarning削除**: 未実装機能のプロパティを削除

#### コード品質保証
- **ESLint**: React/JSX推奨設定で静的解析
- **安全ガード**: NaN/Infinite対策、0除算防止
- **非ブロッキングUI**: window.confirm廃止、カスタムモーダル採用
- **ビルド最適化**: Viteによる高速ビルド（~3.8秒、187kB gzipped 62kB）
- **継続的なセルフレビュー**: 実装内容の整合性確認とバグ修正

### データ構造

#### ゲームフェーズ
```javascript
phase: 'MENU' | 'BRIEFING' | 'BATTLE' | 'GAMEOVER'
```

#### 主要な定数（`src/constants/`で定義）

**cards.js**:
- `ALL_CARDS`: 全22種類のカード定義（id, name, category, tier, type, cost, duration, effect, 等）
  - 消火設備（fire）: 5種類（extinguisher, indoorHydrant, sprinkler, foamSystem, inertGasSystem）
  - 警報設備（alarm）: 4種類（emergencyBell, autoFireAlarm, broadcastSystem, fireNotification）
  - 避難設備（evacuation）: 4種類（escapeLadder, guidanceLight, descentDevice, rescueChute）
  - 施設（facility）: 3種類（standpipe, emergencyOutlet, smokeControl）
  - その他（other）: 5種類（fireDoor, emergencyElevator, packageFireSystem, compactFireAlarm, disasterControlCenter）
  - 特別（alarm）: 1種類（fireEngine - fireNotificationから変身）

**equipment.js**:
- `EQUIPMENT_CATEGORIES`: 5カテゴリ定義（fire, alarm, evacuation, facility, other）
- `EQUIPMENT_TIERS`: 各カテゴリのTier1-3装備リスト
- `OVERFLOW_BONUSES`: Tier4以降の報酬（costDiscount: -10%, powerBuff: +15%）

**quizzes.js**:
- `QUIZ_POOL`: 5カテゴリ × 10問 = 50問のクイズ問題プール

**App.jsx内**:
- `DIFFICULTIES`: 難易度設定（EASY/NORMAL/HARD）- cols, spawnInterval, enemySpeedBase
- `SUPPLY_QUESTIONS`: 緊急補給クイズの問題
- `GRID_ROWS`: グリッド行数（6固定、BattleField.jsx内でも定義）
- `RANGE_LABEL`: 攻撃範囲ラベル（BattleField.jsx内で定義）

#### カードシステム
カードは以下のタイプに分類:
- **red（消火設備）**: 敵にダメージを与える攻撃タワー
- **yellow（警報設備）**: コスト回復を強化
- **green（避難設備）**: 避難速度を上げ、勝利条件達成を促進
- **blue（施設）**: バフ効果を周囲または全体に付与
- **purple（特殊）**: 強力な効果を持つ期間限定設備やサポート

各カードは以下のプロパティを持つ:
- **攻撃カード**: `rangeType`（攻撃範囲）、`damageType`（ダメージタイプ）、`power`（攻撃力）、`speed`（攻撃速度）
- **効果カード**: `effect`（効果タイプ）、`value`（効果値）、`duration`（持続時間）
- **特殊カード**: `transformInto`（変身先）、`dotDamage`（DoTダメージ）、`slowValue`（スロー効果）等

**13種類のeffectタイプ**:
1. `economy`: コスト回復強化
2. `evacuation`: 避難速度強化
3. `economyAndEvacuation`: コスト回復＋避難速度
4. `economyWithTransform`: コスト回復＋時間経過で変身
5. `evacuationWithRegen`: 避難速度＋HP回復
6. `evacuationWithRegenAndBuff`: 避難速度＋HP回復＋全体攻撃速度バフ
7. `buffPower`: 周囲の攻撃力バフ
8. `globalSpeedBuffWithRegen`: 全体攻撃速度バフ＋HP回復
9. `globalSlowWithEvacuation`: 全敵スロー＋避難速度強化
10. `rowBlockTimed`: 横1列を一定時間完全停止（自爆）
11. `firefighterSupport`: 全体攻撃速度バフ＋配置コスト割引
12. `areaDotWithSlow`: 周囲にDoT＋スロー
13. `ultimateBuff`: 全能力バフ＋避難速度＋HP回復

#### 座標系
- グリッドは`r`（行）と`c`（列）で管理
- `r`は上から下へ（0 ～ GRID_ROWS-1）
- `c`は左から右へ（0 ～ difficulty.cols-1）
- タワーの位置は`"r-c"`形式の文字列キーで管理（例: `"2-3"`）

### ゲームフロー（v2.0 - BRIEFINGシステム）

```
MENU → BRIEFING（Tier強化） → BATTLE → GAMEOVER → MENU
          ↓                      ↓
    3ラウンドクイズ          HP維持 + 避難目標達成
    Tier1-3を順次解放         勝利条件: 時間内に避難完了
    Tier4以降でボーナス       敗北条件: HP 0% or 時間切れ
```

1. **MENU**: 難易度選択（EASY/NORMAL/HARD）
2. **BRIEFING**: Tier強化システム（3ラウンド制）
   - 各ラウンドで5カテゴリ（消火/警報/避難/施設/その他）からランダム出題
   - 正解するとそのカテゴリのTierが1上昇（Tier1→2→3）
   - Tier3到達後もクイズに正解するとTier4, 5...と上昇
   - Tier4以降: オーバーフロー報酬（コスト割引-10%、攻撃力+15%）
   - Round 3終了後、獲得したTierに応じたカードデッキで戦闘開始
3. **BATTLE**: タワーディフェンス戦闘
   - タワー配置: デッキからカードを選択してグリッドに配置
   - 攻撃タワー: 敵にダメージを与える（rangeType: surround/line/wide/global）
   - 効果タワー: コスト回復、避難速度、バフ、デバフ等の効果を発揮
   - 緊急補給: クイズに正解してカードを獲得（クールダウン300フレーム）
   - 勝利条件: 時間内（難易度により変動）に避難目標人数を達成
   - 敗北条件: HP 0%到達 または 時間切れ

## コーディング規約

### 一般的なガイドライン
- **言語**: このプロジェクトのコメントとUI文言はすべて日本語です
- **コンポーネント分割**: 新しい画面やフェーズを追加する場合は、`src/components/`に新規コンポーネントを作成
- **状態管理**: すべての状態はApp.jsxで管理し、Propsで子コンポーネントに渡す
- **命名**: 既存のコードスタイルに従ってください（キャメルケース、わかりやすい変数名）

### コンポーネント設計
- **画面単位**: 各フェーズ（MENU/BRIEFING/BATTLE/GAMEOVER）は独立したコンポーネント
- **Propsベース**: コンポーネントは純粋なUI表示を担当し、ロジックはApp.jsxに配置
- **過度な細分化を避ける**: 画面レベルまでで止め、ボタンやカードなどの小さなUIは各コンポーネント内に記述
- **Props Drillingの認識**: BattleFieldのように多数のpropsが必要な場合は、将来的に状態管理ライブラリの導入を検討
- **定数ファイル分離**: カード定義、クイズ問題、Tierシステムは`src/constants/`で管理

### スタイリング
- Tailwindのユーティリティクラスを優先的に使用
- 複雑な動的スタイルはインラインstyle属性を使用
- 新しいカスタムCSSクラスの追加は最小限に

### パフォーマンス
- ゲームループ内での重い計算は避ける
- 状態更新は必要最小限に
- `useRef`を使ってレンダリングをトリガーせずに値を保持

### ESLint
- コミット前に `npm run lint` でコードチェック
- 警告は0を目標としてください
- 設定ファイル: `.eslintrc.json` (React/JSX推奨設定)

### 安全性
- **NaN/Infinite対策**: 数値計算後に`isNaN()`と`isFinite()`でチェック
- **0除算防止**: 除算前に分母が0でないことを確認
- **非ブロッキングUI**: `window.confirm`や`window.alert`は使用せず、カスタムモーダルを実装

## 新機能開発時の推奨アプローチ

1. **既存のパターンを模倣**: 新しいカードや敵タイプを追加する場合は、既存の定義を参考にしてください
2. **段階的な実装**: 大きな機能は小さなステップに分けて実装し、都度動作確認
3. **データとロジックの分離**: 新しいゲーム要素（ミッション、カードなど）は定数として定義
4. **UIの一貫性**: 既存のUIスタイル（色、レイアウト、アニメーション）を踏襲
5. **コンポーネント分割の検討**: 新しいフェーズや画面を追加する場合は、`src/components/`に新規ファイルを作成

## 今後の拡張案

詳細は`設計仕様書.md`を参照してください。

### 技術的改善の候補
- **TypeScript移行**: 型安全性の向上（特にcard定義、effect処理の型安全化）
- **状態管理ライブラリ**: Zustand/Jotai等でProps Drilling解消（BattleFieldの25個以上のprops対策）
- **カスタムフック**: `useGameLoop`, `useEnemies`, `useTowers`, `useEffects`への分離でApp.jsx簡素化
- **ユニットテスト**: Vitest導入でゲームロジックのテスト（effect処理、攻撃判定、勝利条件等）
- **パフォーマンス最適化**: React.memo、useMemo、useCallbackの適用（特にBattleFieldのレンダリング最適化）
- **エラーハンドリング強化**: カード定義の不整合検出、effectタイプの未実装検出
- **デバッグツール**: 開発モード時のゲーム状態可視化、タワー効果の詳細表示

### ゲームシステム拡張の候補
- **追加カテゴリ**: 避難誘導、消火活動（消防隊）、防災訓練等
- **追加難易度**: VERY EASY（チュートリアル）、VERY HARD（上級者向け）
- **追加敵タイプ**: 特殊火災（油火災、電気火災等）、複合災害
- **追加勝利条件**: パーフェクト勝利（HP 100%維持）、スピードクリア（時間短縮）
- **実績システム**: カード使用実績、敵撃破数、累計避難人数等
- **ストーリーモード**: 段階的な難易度上昇、チュートリアル統合

## 参考資料
- `設計仕様書.md`: ゲームシステム、フェーズ、カード、敵の詳細仕様
- Vite公式ドキュメント: https://vitejs.dev/
- Tailwind CSS公式ドキュメント: https://tailwindcss.com/
- lucide-react公式ドキュメント: https://lucide.dev/
