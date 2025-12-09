import { Shield, Bell, DoorOpen, Zap, Package } from 'lucide-react';

// 5種別の設備ツリー定義
export const EQUIPMENT_TREES = {
  fire: {
    id: 'fire',
    name: '消火設備',
    icon: Shield,
    color: 'red',
    initialUnlock: true,
    tiers: {
      1: ['extinguisher', 'portablePowder'],
      2: ['indoorHydrant', 'sprinkler'],
      3: ['foamSystem', 'inertGasSystem'],
    },
  },
  alarm: {
    id: 'alarm',
    name: '警報設備',
    icon: Bell,
    color: 'yellow',
    initialUnlock: true,
    tiers: {
      1: ['emergencyBell'],
      2: ['autoFireAlarm'],
      3: ['broadcastSystem', 'fireNotification'],
    },
  },
  evacuation: {
    id: 'evacuation',
    name: '避難設備',
    icon: DoorOpen,
    color: 'green',
    initialUnlock: true,
    tiers: {
      1: ['escapeLadder'],
      2: ['guidanceLight', 'descentDevice'],
      3: ['rescueChute'],
    },
  },
  facility: {
    id: 'facility',
    name: '消火活動上必要な施設',
    icon: Zap,
    color: 'blue',
    initialUnlock: true,
    tiers: {
      1: ['standpipe'],
      2: ['emergencyOutlet'],
      3: ['smokeControl'],
    },
  },
  other: {
    id: 'other',
    name: 'その他',
    icon: Package,
    color: 'purple',
    initialUnlock: true, // v2.0: 初期解放に変更
    tiers: {
      1: ['fireDoor', 'emergencyElevator'],
      2: ['packageFireSystem', 'compactFireAlarm'],
      3: ['disasterControlCenter'],
    },
  },
};

// 報酬テーブル
export const BRIEFING_REWARD_TABLE = {
  0: 0,
  1: 100,
  2: 200,
  3: 400, // 全問正解ボーナス
};

// オーバーフロー報酬の係数
export const OVERFLOW_BONUS = {
  costDiscount: 0.1,  // -10%
  powerBuff: 0.15,     // +15%
};
