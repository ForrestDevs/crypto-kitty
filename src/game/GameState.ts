import { GameStateData, DECAY_RATES, THRESHOLDS, AnimationPriority } from "../types/game";
import { Animator } from "./Animator";

export class GameState {
  private state: GameStateData;
  private lastUpdateTime: number;
  private readonly updateInterval = 1000; // Update every second
  private animator?: Animator; // Add reference to animator

  constructor() {
    this.state = this.getInitialState();
    this.lastUpdateTime = Date.now();
  }

  public setAnimator(animator: Animator) {
    this.animator = animator;
  }

  private getInitialState(): GameStateData {
    return {
      hunger: 100,
      energy: 100,
      cleanliness: 100,
      isDirty: false,
      isGameOver: false,
      isPaused: false
    };
  }

  public update(): void {
    if (this.state.isGameOver || this.state.isPaused) return;

    const currentTime = Date.now();
    const deltaTime = currentTime - this.lastUpdateTime;

    if (deltaTime >= this.updateInterval) {
      const intervals = Math.floor(deltaTime / this.updateInterval);
      
      // Previous values for threshold checks
      const prevHunger = this.state.hunger;
      const prevEnergy = this.state.energy;
      const prevCleanliness = this.state.cleanliness;

      // Update stats
      this.state.hunger = Math.max(0, this.state.hunger - DECAY_RATES.hunger * intervals);
      this.state.energy = Math.max(0, this.state.energy - DECAY_RATES.energy * intervals);
      this.state.cleanliness = Math.max(0, this.state.cleanliness - DECAY_RATES.cleanliness * intervals);
      
      // Check thresholds and play animations
      if (this.animator) {
        // Hunger animations
        if (prevHunger > THRESHOLDS.hungry2 && this.state.hunger <= THRESHOLDS.hungry2) {
          this.animator.queueAnimation("eat_hungry2", AnimationPriority.URGENT);
        } else if (prevHunger > THRESHOLDS.hungry1 && this.state.hunger <= THRESHOLDS.hungry1) {
          this.animator.queueAnimation("eat_hungry", AnimationPriority.HIGH);
        }

        // Energy animations
        if (prevEnergy > THRESHOLDS.sleepy && this.state.energy <= THRESHOLDS.sleepy) {
          this.animator.queueAnimation("sleep_sleepy", AnimationPriority.HIGH);
        }

        // Cleanliness animations
        if (prevCleanliness > THRESHOLDS.dirty2 && this.state.cleanliness <= THRESHOLDS.dirty2) {
          this.animator.queueAnimation("clean_dirty2", AnimationPriority.URGENT);
        } else if (prevCleanliness > THRESHOLDS.dirty1 && this.state.cleanliness <= THRESHOLDS.dirty1) {
          this.animator.queueAnimation("clean_dirty", AnimationPriority.HIGH);
        }
      }
      
      // Update dirty state
      this.state.isDirty = this.state.cleanliness <= THRESHOLDS.dirty2;
      
      // Check game over condition
      if (this.state.hunger <= 0 && this.state.energy <= 0 && this.state.cleanliness <= 0) {
        this.state.isGameOver = true;
      }

      this.lastUpdateTime = currentTime;
    }
  }

  public getData(): GameStateData {
    return { ...this.state };
  }

  public reset(): void {
    this.state = this.getInitialState();
    this.lastUpdateTime = Date.now();
  }

  // Getters and setters for individual stats
  public get hunger(): number {
    return this.state.hunger;
  }

  public set hunger(value: number) {
    this.state.hunger = Math.max(0, Math.min(100, value));
  }

  public get energy(): number {
    return this.state.energy;
  }

  public set energy(value: number) {
    this.state.energy = Math.max(0, Math.min(100, value));
  }

  public get cleanliness(): number {
    return this.state.cleanliness;
  }

  public set cleanliness(value: number) {
    this.state.cleanliness = Math.max(0, Math.min(100, value));
    this.state.isDirty = this.state.cleanliness <= THRESHOLDS.dirty2;
  }

  public get isDirty(): boolean {
    return this.state.isDirty;
  }

  public get isGameOver(): boolean {
    return this.state.isGameOver;
  }

  public get isPaused(): boolean {
    return this.state.isPaused;
  }

  public set isPaused(value: boolean) {
    this.state.isPaused = value;
  }
} 