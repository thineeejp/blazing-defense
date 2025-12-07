// 実績システム定数定義
import * as Icons from 'lucide-react';

/**
 * 全実績定義（12種類）
 * - パーフェクトディフェンス（ノーマル以上でHP100%）
 * - 無傷の要塞（ハードでHP100%）
 * - 全難易度制覇（EASY/NORMAL/HARDすべてクリア）
 * - ハイスコア（77777点以上）
 * - 完全勝利（ハードでHP100%＋避難達成）
 * - 大富豪（コスト2000以上）
 * - 倹約家（ノーマル以上でカード3枚以下）
 * - コンプリート（全22種類のカード使用）
 * - ハンデキャップ（Tier3未使用でハードクリア）
 * - 初クリア×3（EASY/NORMAL/HARD初回クリア）
 */
export const ACHIEVEMENTS = [
  // 戦闘系実績
  {
    id: 'perfect_defense',
    name: 'パーフェクトディフェンス',
    description: 'ノーマル以上でHP100%維持してクリア',
    icon: Icons.ShieldCheck,
    rarity: 'rare',
  },
  {
    id: 'fortress',
    name: '無傷の要塞',
    description: 'ハードでHP100%維持してクリア',
    icon: Icons.Shield,
    rarity: 'epic',
  },
  {
    id: 'all_difficulty_clear',
    name: '全難易度制覇',
    description: 'EASY/NORMAL/HARDすべてクリア',
    icon: Icons.Trophy,
    rarity: 'epic',
  },
  {
    id: 'high_score',
    name: 'ハイスコア',
    description: '77777点以上でクリア',
    icon: Icons.Star,
    rarity: 'rare',
  },
  {
    id: 'complete_victory',
    name: '完全勝利',
    description: 'ハードでHP100%＋避難達成',
    icon: Icons.Award,
    rarity: 'epic',
  },

  // 経済系実績
  {
    id: 'tycoon',
    name: '大富豪',
    description: 'コスト2000以上でクリア',
    icon: Icons.Coins,
    rarity: 'rare',
  },
  {
    id: 'economist',
    name: '倹約家',
    description: 'ノーマル以上でカード3枚以下でクリア',
    icon: Icons.Zap,
    rarity: 'rare',
  },

  // カード系実績
  {
    id: 'complete_collection',
    name: 'コンプリート',
    description: '累計で全21種類のカードを使用',
    icon: Icons.BookOpen,
    rarity: 'epic',
  },
  {
    id: 'handicap',
    name: 'ハンデキャップ',
    description: 'Tier3未使用でハードクリア',
    icon: Icons.Target,
    rarity: 'epic',
  },

  // 初回クリア系実績
  {
    id: 'first_clear_easy',
    name: '初クリア - EASY',
    description: 'EASYで初めてクリア',
    icon: Icons.CheckCircle,
    rarity: 'common',
  },
  {
    id: 'first_clear_normal',
    name: '初クリア - NORMAL',
    description: 'NORMALで初めてクリア',
    icon: Icons.CheckCircle,
    rarity: 'common',
  },
  {
    id: 'first_clear_hard',
    name: '初クリア - HARD',
    description: 'HARDで初めてクリア',
    icon: Icons.CheckCircle,
    rarity: 'common',
  },
];

/**
 * レアリティ別スタイル定義
 * common: 灰色（基本実績）
 * rare: 青色（レア実績）
 * epic: 紫色（エピック実績）
 */
export const RARITY_STYLES = {
  common: {
    border: 'border-slate-500',
    bg: 'bg-slate-500/10',
    text: 'text-slate-300',
    glow: 'shadow-slate-500/20',
  },
  rare: {
    border: 'border-blue-500',
    bg: 'bg-blue-500/10',
    text: 'text-blue-300',
    glow: 'shadow-blue-500/30',
  },
  epic: {
    border: 'border-purple-500',
    bg: 'bg-purple-500/10',
    text: 'text-purple-300',
    glow: 'shadow-purple-500/30',
  },
};
