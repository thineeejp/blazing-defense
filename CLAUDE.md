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
  │   ├── Menu.jsx          # メニュー画面（~30行）
  │   ├── GameOver.jsx      # ゲームオーバー画面（~15行）
  │   ├── DraftPhase.jsx    # Phase 1: 現場診断フェーズ（~60行）
  │   ├── ExamPhase.jsx     # Phase 2: 予算獲得試験フェーズ（~70行）
  │   └── BattleField.jsx   # Phase 3: バトル画面（~240行）
  ├── App.jsx               # メインロジックと状態管理（~560行）
  ├── main.jsx              # Reactアプリケーションのエントリーポイント
  └── index.css             # グローバルスタイル（Tailwindディレクティブ含む）

public/                     # 静的アセット（あれば）
index.html                  # HTMLテンプレート
vite.config.js              # Viteビルド設定
tailwind.config.js          # TailwindCSS設定
postcss.config.js           # PostCSS設定
.eslintrc.json              # ESLint設定（React/JSX対応）
.eslintignore               # ESLint除外設定
設計仕様書.md              # 詳細な設計ドキュメント
```

### アーキテクチャの特徴

#### コンポーネントベース設計（Phase 1-3でリファクタリング済み）

**進化の履歴**:
- **当初**: 922行の単一コンポーネント（モノリシック設計）
- **現在**: 560行のApp.jsx + 5つの画面コンポーネント（39%削減）

**現在の設計方針**:
- **App.jsx**: すべてのゲーム状態とロジックを一元管理（~560行）
  - ゲーム状態（HP、コスト、スコア、タワー、敵など）
  - ゲームロジック（スポーン、戦闘、攻撃判定、ゲームループ）
  - イベントハンドラー
- **画面コンポーネント**: Propsベースの純粋なUIコンポーネント
  - `Menu.jsx`: ミッション選択画面
  - `DraftPhase.jsx`: Phase 1 現場診断クイズ
  - `ExamPhase.jsx`: Phase 2 予算獲得試験
  - `BattleField.jsx`: Phase 3 バトル画面（グリッド、敵、タワー、デッキ、モーダル）
  - `GameOver.jsx`: ゲームオーバー画面

**この設計を採用した理由**:
- 小規模ゲームのため、Redux/Zustand等の状態管理ライブラリは不要
- データフローがシンプル（App.jsx → コンポーネント）
- 各画面の責務が明確で保守性が向上
- 過度な細分化を避け、適切な粒度を維持

**欠点と今後の検討事項**:
- Props Drillingが深い（BattleFieldで20個のprops）
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

#### コード品質保証
- **ESLint**: React/JSX推奨設定で静的解析
- **安全ガード**: NaN/Infinite対策、0除算防止
- **非ブロッキングUI**: window.confirm廃止、カスタムモーダル採用
- **ビルド最適化**: Viteによる高速ビルド（~3.7秒、167kB gzipped 55kB）

### データ構造

#### ゲームフェーズ
```javascript
phase: 'MENU' | 'DRAFT' | 'EXAM' | 'BATTLE' | 'GAMEOVER'
```

#### 主要な定数
- `DIFFICULTIES`: 難易度設定（EASY/NORMAL/HARD）
- `DRAFT_MISSIONS`: ミッション定義（現場診断）
- `EXAM_QUESTIONS`: 予算獲得試験の問題
- `SUPPLY_QUESTIONS`: 緊急補給クイズの問題
- `CARDS_BASE`: 基本カードデッキ
- `REWARD_CARDS`: ミッションクリア報酬カード
- `GRID_ROWS`: グリッド行数（6固定、BattleField.jsx内で定義）
- `RANGE_LABEL`: 攻撃範囲ラベル（BattleField.jsx内で定義）

#### カードシステム
カードは以下のタイプに分類:
- **red（消火設備）**: 敵にダメージを与える
- **yellow（警報設備）**: コスト回復を強化
- **green（避難設備）**: 定期的にスコアを獲得
- **purple（特殊）**: 強力な効果を持つ期間限定設備

各カードは`rangeType`（攻撃範囲）と`damageType`（ダメージタイプ）を持ち、敵の`fireType`との相性でダメージが変動します。

#### 座標系
- グリッドは`r`（行）と`c`（列）で管理
- `r`は上から下へ（0 ～ GRID_ROWS-1）
- `c`は左から右へ（0 ～ difficulty.cols-1）
- タワーの位置は`"r-c"`形式の文字列キーで管理（例: `"2-3"`）

### ゲームフロー

```
MENU → DRAFT（現場診断） → EXAM（予算獲得試験） → BATTLE → GAMEOVER → MENU
                  ↓                    ↓
          ミッション選択         正解数で初期コスト決定
          正解で報酬カード獲得
```

1. **DRAFT**: ミッション選択後、現場に関するクイズに回答。正解すると特別カードを獲得
2. **EXAM**: ○×形式の消防設備試験。正解数×40のコストボーナスを獲得
3. **BATTLE**: タワーを配置して火災（敵）を防衛。HPが0になるとゲームオーバー

## コーディング規約

### 一般的なガイドライン
- **言語**: このプロジェクトのコメントとUI文言はすべて日本語です
- **コンポーネント分割**: 新しい画面やフェーズを追加する場合は、`src/components/`に新規コンポーネントを作成
- **状態管理**: すべての状態はApp.jsxで管理し、Propsで子コンポーネントに渡す
- **命名**: 既存のコードスタイルに従ってください（キャメルケース、わかりやすい変数名）

### コンポーネント設計
- **画面単位**: 各フェーズ（MENU/DRAFT/EXAM/BATTLE/GAMEOVER）は独立したコンポーネント
- **Propsベース**: コンポーネントは純粋なUI表示を担当し、ロジックはApp.jsxに配置
- **過度な細分化を避ける**: 画面レベルまでで止め、ボタンやカードなどの小さなUIは各コンポーネント内に記述
- **Props Drillingの認識**: BattleFieldのように多数のpropsが必要な場合は、将来的に状態管理ライブラリの導入を検討

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

詳細は`設計仕様書.md`の第8章を参照してください。

### 技術的改善の候補
- **TypeScript移行**: 型安全性の向上
- **状態管理ライブラリ**: Zustand/Jotai等でProps Drilling解消
- **カスタムフック**: `useGameLoop`, `useEnemies`, `useTowers`への分離
- **定数ファイル分離**: `constants/cards.js`, `missions.js`, `questions.js`
- **ユニットテスト**: Vitest導入でゲームロジックのテスト
- **パフォーマンス最適化**: React.memo、useMemo、useCallbackの適用

## 参考資料
- `設計仕様書.md`: ゲームシステム、フェーズ、カード、敵の詳細仕様
- Vite公式ドキュメント: https://vitejs.dev/
- Tailwind CSS公式ドキュメント: https://tailwindcss.com/
- lucide-react公式ドキュメント: https://lucide.dev/
