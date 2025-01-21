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
  | "sleep_full"
  | "sleep_sleepy"
  // Cleaning animations
  | "clean_dirty"
  | "clean_dirty2"
  | "clean_shower";
  
export const THRESHOLDS = {
  hungry1: 80, // Lowered from 90 to give more time before first warning
  hungry2: 50, // Lowered from 60 to space out the warnings better
  sleepy: 45,  // Lowered slightly from 50 to balance with hunger
  dirty1: 70,  // Lowered from 80 to give more time before first warning
  dirty2: 30,  // Raised from 20 to trigger second warning sooner
} as const;

export const DECAY_RATES = {
  hunger: 3,    // Lowered from 4 to make food last longer
  energy: 2,    // Lowered from 3 to require less frequent sleep
  cleanliness: 2, // Kept the same as it was already balanced
} as const;

export interface GameStateData {
  hunger: number;
  energy: number;
  cleanliness: number;
  isDirty: boolean;
  isGameOver: boolean;
  isPaused: boolean;
  isLoaded: boolean;
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
