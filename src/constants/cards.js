import { Shield, Droplets, Zap, ShieldAlert, Bell, BellRing, Radio, AlertTriangle, ArrowDown, Lightbulb, ChevronDown, Waves, DoorClosed, MoveVertical, Package, Building, Flame, ShowerHead, Circle, Phone, Fan, CloudFog, ArrowDownFromLine } from 'lucide-react';

// 全カード定義（22種類）
export const ALL_CARDS = {
  // 🔴 消火設備（Tier1-3）
  extinguisher: {
    id: 'extinguisher',
    name: '消火器',
    category: 'fire',
    tier: 1,
    type: 'red',
    cost: 40,
    duration: 1500, // 25秒
    icon: Shield,
    desc: '【消火】周囲1マス(3×3)へ散水 [25秒]',
    rangeType: 'surround',
    power: 20,
    speed: 40,
    damageType: 'water',
  },

  portablePowder: {
    id: 'portablePowder',
    name: '移動式粉末消火設備',
    category: 'fire',
    tier: 1,
    type: 'red',
    cost: 60,
    duration: 1500, // 25秒
    icon: ShieldAlert,
    desc: '【特効】周囲1マス(3×3)に粉末散布（B火災2倍）[25秒]',
    rangeType: 'surround',
    power: 30,
    speed: 45,
    damageType: 'foam',
  },

  indoorHydrant: {
    id: 'indoorHydrant',
    name: '屋内消火栓設備',
    category: 'fire',
    tier: 2,
    type: 'red',
    cost: 80,
    duration: 2100, // 35秒
    icon: Droplets,
    desc: '【消火】縦1列に強力放水＋ノックバック [35秒]',
    rangeType: 'line',
    power: 40,
    speed: 50,
    damageType: 'water',
    knockback: 0.1,
  },

  sprinkler: {
    id: 'sprinkler',
    name: 'スプリンクラー設備',
    category: 'fire',
    tier: 2,
    type: 'red',
    cost: 90,
    duration: 3600, // 60秒
    icon: ShowerHead,
    desc: '【消火】横3行×全列を散水 [60秒]',
    rangeType: 'tripleRow',
    power: 30,
    speed: 60,
    damageType: 'water',
  },

  foamSystem: {
    id: 'foamSystem',
    name: '泡消火設備',
    category: 'fire',
    tier: 3,
    type: 'red',
    cost: 120,
    duration: 1500, // 25秒
    icon: Circle,
    desc: '【特効】周囲3×3＋横1行に大ダメージ（B火災2倍）[25秒]',
    rangeType: 'surroundRow',
    power: 80,
    speed: 60,
    damageType: 'foam',
  },

  inertGasSystem: {
    id: 'inertGasSystem',
    name: '不活性ガス消火設備',
    category: 'fire',
    tier: 3,
    type: 'red',
    cost: 120,
    duration: 1500, // 25秒
    icon: CloudFog,
    desc: '【特効】全画面へ持続ダメージ（C火災1.5倍）[25秒]',
    rangeType: 'global',
    power: 15,
    speed: 20,
    damageType: 'gas',
  },

  // 🟡 警報設備（Tier1-3）
  emergencyBell: {
    id: 'emergencyBell',
    name: '非常ベル',
    category: 'alarm',
    tier: 1,
    type: 'yellow',
    cost: 30,
    duration: 1800, // 30秒
    icon: Bell,
    desc: '【警報】コスト回復+3.0/秒 [30秒]',
    rangeType: 'self',
    effect: 'economy',
    value: 0.05,
  },

  autoFireAlarm: {
    id: 'autoFireAlarm',
    name: '自動火災報知設備',
    category: 'alarm',
    tier: 2,
    type: 'yellow',
    cost: 60,
    duration: 2700, // 45秒
    icon: BellRing,
    desc: '【警報】コスト+6.0/秒 [45秒]',
    rangeType: 'self',
    effect: 'economy',
    value: 0.1,
  },

  broadcastSystem: {
    id: 'broadcastSystem',
    name: '放送設備',
    category: 'alarm',
    tier: 3,
    type: 'yellow',
    cost: 100,
    duration: 3600, // 60秒
    icon: Radio,
    desc: '【警報】コスト+10.0/秒＋避難+0.5人/秒 [60秒]',
    rangeType: 'self',
    effect: 'economyAndEvacuation',
    economyValue: 0.167,
    evacuationValue: 0.5,
  },

  fireNotification: {
    id: 'fireNotification',
    name: '消防機関へ通報する火災報知設備',
    category: 'alarm',
    tier: 3,
    type: 'yellow',
    cost: 120,
    duration: null, // 永続（変身まで）
    icon: Phone,
    desc: '【警報】コスト+5.0/秒→10秒後ポンプ車に変身',
    rangeType: 'self',
    effect: 'economyWithTransform',
    value: 0.083,
    transformDelay: 600, // 10秒
    transformInto: 'fireEngine',
  },

  // 🟢 避難設備（Tier1-3）
  escapeLadder: {
    id: 'escapeLadder',
    name: '避難はしご',
    category: 'evacuation',
    tier: 1,
    type: 'green',
    cost: 40,
    duration: null, // 永続
    icon: ArrowDown,
    desc: '【避難】避難速度+0.5人/秒 [永続]',
    rangeType: 'self',
    effect: 'evacuation',
    value: 0.5,
  },

  guidanceLight: {
    id: 'guidanceLight',
    name: '誘導灯',
    category: 'evacuation',
    tier: 2,
    type: 'green',
    cost: 60,
    duration: null, // 永続
    icon: Lightbulb,
    desc: '【避難】避難+0.8人/秒＋HP回復+0.3/秒 [永続]',
    rangeType: 'self',
    effect: 'evacuationWithRegen',
    evacuationValue: 0.8,
    regenValue: 0.3,
  },

  descentDevice: {
    id: 'descentDevice',
    name: '緩降機',
    category: 'evacuation',
    tier: 2,
    type: 'green',
    cost: 80,
    duration: 3600, // 60秒
    icon: ChevronDown,
    desc: '【避難】避難速度+1.0人/秒 [60秒]',
    rangeType: 'self',
    effect: 'evacuation',
    value: 1.0,
  },

  rescueChute: {
    id: 'rescueChute',
    name: '救助袋',
    category: 'evacuation',
    tier: 3,
    type: 'green',
    cost: 120,
    duration: 2700, // 45秒
    icon: ArrowDownFromLine,
    desc: '【避難】避難+1.5人/秒＋HP+0.5/秒＋攻撃速度+10% [45秒]',
    rangeType: 'global',
    effect: 'evacuationWithRegenAndBuff',
    evacuationValue: 1.5,
    regenValue: 0.5,
    globalSpeedBuff: 0.1,
  },

  // 🔵 消火活動上必要な施設（Tier1-3）
  standpipe: {
    id: 'standpipe',
    name: '連結送水管',
    category: 'facility',
    tier: 1,
    type: 'blue',
    cost: 60,
    duration: null, // 永続
    icon: Waves,
    desc: '【施設】周囲3×3の攻撃力+30% [永続]',
    rangeType: 'surround',
    effect: 'buffPower',
    value: 0.3,
  },

  emergencyOutlet: {
    id: 'emergencyOutlet',
    name: '非常コンセント設備',
    category: 'facility',
    tier: 2,
    type: 'blue',
    cost: 100,
    duration: 3600, // 60秒
    icon: Zap,
    desc: '【施設】全攻撃速度+20%＋HP回復+0.4/秒 [60秒]',
    rangeType: 'global',
    effect: 'globalSpeedBuffWithRegen',
    speedBuff: 0.2,
    regenValue: 0.4,
  },

  smokeControl: {
    id: 'smokeControl',
    name: '排煙設備',
    category: 'facility',
    tier: 3,
    type: 'blue',
    cost: 150,
    duration: 2700, // 45秒
    icon: Fan,
    desc: '【施設】全敵-15%速度＋避難+0.5人/秒 [45秒]',
    rangeType: 'global',
    effect: 'globalSlowWithEvacuation',
    slowValue: 0.15,
    evacuationValue: 0.5,
  },

  // 🟣 その他（Tier1-3）
  fireDoor: {
    id: 'fireDoor',
    name: '防火戸',
    category: 'other',
    tier: 1,
    type: 'purple',
    cost: 120,
    duration: 300, // 5秒
    icon: DoorClosed,
    desc: '【特殊】横1列を5秒間完全停止→消滅',
    rangeType: 'row',
    effect: 'rowBlockTimed',
    blockDuration: 300,
    selfDestruct: true,
  },

  emergencyElevator: {
    id: 'emergencyElevator',
    name: '非常用エレベーター',
    category: 'other',
    tier: 1,
    type: 'purple',
    cost: 100,
    duration: null, // 永続
    icon: MoveVertical,
    desc: '【特殊】全攻撃速度+15%＋配置コスト-10% [永続]',
    rangeType: 'global',
    effect: 'firefighterSupport',
    globalSpeedBuff: 0.15,
    costReduction: 0.1,
  },

  packageFireSystem: {
    id: 'packageFireSystem',
    name: 'パッケージ型自動消火設備',
    category: 'other',
    tier: 2,
    type: 'red',
    cost: 60,
    duration: 2400, // 40秒
    icon: Package,
    desc: '【消火】横3行×全列を散水 [40秒]',
    rangeType: 'tripleRow',
    power: 15,
    speed: 35,
    damageType: 'water',
  },

  compactFireAlarm: {
    id: 'compactFireAlarm',
    name: '特小自火報',
    category: 'other',
    tier: 2,
    type: 'purple',
    cost: 50,
    duration: 2700, // 45秒
    icon: AlertTriangle,
    desc: '【特殊】コスト回復+5.0/秒 [45秒]',
    rangeType: 'self',
    effect: 'economy',
    value: 0.083,
  },

  disasterControlCenter: {
    id: 'disasterControlCenter',
    name: '防災センター',
    category: 'other',
    tier: 3,
    type: 'purple',
    cost: 200,
    duration: 3600, // 60秒
    icon: Building,
    desc: '【特殊】全能力+20%＋避難+1.0人/秒＋HP+0.8/秒 [60秒]',
    rangeType: 'global',
    effect: 'ultimateBuff',
    globalPowerBuff: 0.2,
    globalSpeedBuff: 0.2,
    evacuationValue: 1.0,
    regenValue: 0.8,
  },

  // ポンプ車（消防機関通報から変身）
  fireEngine: {
    id: 'fireEngine',
    name: 'ポンプ車',
    category: 'alarm',
    tier: 3,
    type: 'purple',
    cost: 0,
    duration: 300, // 5秒
    icon: Flame,
    desc: '【召喚】全敵を5秒間制圧',
    rangeType: 'global',
    power: 100,
    speed: 10,
    knockback: 1.5,
    damageType: 'water',
  },
};
