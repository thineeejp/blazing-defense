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
  ├── App.jsx       # メインゲームコンポーネント（全ゲームロジック）
  ├── main.jsx      # Reactアプリケーションのエントリーポイント
  └── index.css     # グローバルスタイル（Tailwindディレクティブ含む）

public/             # 静的アセット（あれば）
index.html          # HTMLテンプレート
vite.config.js      # Viteビルド設定
tailwind.config.js  # TailwindCSS設定
postcss.config.js   # PostCSS設定
```

### アーキテクチャの特徴

#### モノリシックコンポーネント設計
**重要**: このプロジェクトは意図的に単一の大きなコンポーネント（`App.jsx`）にすべてのロジックを集約しています。

- **BlazingDefense**: 約900行の単一コンポーネント
  - すべてのゲーム状態（HP、コスト、スコア、タワー、敵など）
  - すべてのゲームロジック（スポーン、戦闘、攻撃判定など）
  - すべてのUI描画（メニュー、試験、バトル、ゲームオーバー）
  - すべてのイベントハンドラー

この設計を採用した理由:
- 小規模なゲームプロジェクトとして、状態の共有が容易
- すべてのゲームロジックが一箇所にあるため、ゲーム全体の動作を理解しやすい
- コンポーネント間の複雑なprops受け渡しを避ける

**コード変更時の注意点**:
- コンポーネント分割を提案する前に、現在の設計意図を尊重してください
- 新機能追加時も基本的に`App.jsx`内に実装してください
- リファクタリングは必要性が明確な場合のみ提案してください

#### 状態管理
- **React Hooksベース**: `useState`、`useEffect`、`useRef`を使用
- **useRefの活用**: `requestAnimationFrame`ループ内で最新状態を参照するため、`towersRef`、`difficultyRef`などのrefを使用
- **直接的な状態更新**: グローバル状態管理ライブラリ（Redux、Zustandなど）は使用していません

#### ゲームループ
```javascript
// requestAnimationFrameベースのゲームループ
useEffect(() => {
  const loop = () => {
    frameRef.current += 1;
    updateBattleLogic();  // ゲームロジック更新
    gameLoopRef.current = requestAnimationFrame(loop);
  };
  gameLoopRef.current = requestAnimationFrame(loop);
  return () => cancelAnimationFrame(gameLoopRef.current);
}, [phase, isPaused]);
```

- フレームベースでゲーム状態を更新
- `phase`が`'BATTLE'`でかつ`isPaused`が`false`の時のみループが動作
- 敵のスポーン、移動、攻撃判定、タワーの発動などをフレームごとに処理

#### スタイリング
- **TailwindCSS**: ユーティリティクラスを直接JSX要素に適用
- **インラインスタイル**: 動的な配置（グリッド、敵の位置）はstyle属性を使用
- **CSS Modules / styled-components は使用していません**

#### アイコン
- **lucide-react**: すべてのアイコン（Flame、Wind、Shield、Bellなど）はlucide-reactから読み込み
- カスタムSVGアイコンは使用していません

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
- **コンポーネント**: 新機能は基本的に`App.jsx`内に追加してください
- **命名**: 既存のコードスタイルに従ってください（キャメルケース、わかりやすい変数名）

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
- 警告は0を目標としてください（`--max-warnings 0`）

## 新機能開発時の推奨アプローチ

1. **既存のパターンを模倣**: 新しいカードや敵タイプを追加する場合は、既存の定義を参考にしてください
2. **段階的な実装**: 大きな機能は小さなステップに分けて実装し、都度動作確認
3. **データとロジックの分離**: 新しいゲーム要素（ミッション、カードなど）は定数として定義
4. **UIの一貫性**: 既存のUIスタイル（色、レイアウト、アニメーション）を踏襲
