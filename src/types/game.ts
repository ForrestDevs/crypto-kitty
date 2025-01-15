export interface AnimationConfig {
  name: string;
  frameCount: number;
  frameWidth: number;
  frameHeight: number;
  rowIndex: number;
  fps: number;
}

export interface AnimationState {
  name: AnimationName;
  currentFrame: number;
  loopCount: number;
  targetLoops: number;
  lastFrameTime: number;
}

export type AnimationName =
  // Idle animations
  | "idle_idle"
  | "idle_idle2"
  // Eating animations
  | "eat_eating"
  | "eat_hungry"
  | "eat_hungry2"
  // Sleep animations
  | "sleep_sleepstart"
  | "sleep_sleeping"
  | "sleep_sleepwake"
  | "sleep_sleepy"
  // Cleaning animations
  | "clean_dirty"
  | "clean_dirty2"
  | "clean_shower";

export const THRESHOLDS = {
  hungry1: 90,
  hungry2: 60,
  sleepy: 50,
  dirty1: 80,
  dirty2: 20,
} as const;

export const DECAY_RATES = {
  hunger: 4,
  energy: 3,
  cleanliness: 2,
} as const;

export interface GameStateData {
  hunger: number;
  energy: number;
  cleanliness: number;
  isDirty: boolean;
  isGameOver: boolean;
  isPaused: boolean;
}

export interface AnimationQueueItem {
  name: AnimationName;
  priority: number;
  loops: number;
}

export enum AnimationPriority {
  URGENT = 3,
  HIGH = 2,
  NORMAL = 1,
  LOW = 0,
}
