import { AnimationName, AnimationConfig, AnimationState, AnimationQueueItem, THRESHOLDS } from "../types/game";
import { AssetManager } from "./AssetManager";
import { GameState } from "./GameState";
import { combinedConfig } from "../../public/sheets/config";

export class Animator {
  private currentAnimation: AnimationState;
  private animations: Record<AnimationName, AnimationConfig>;
  private animationQueue: AnimationQueueItem[] = [];
  private isPlayingAnimation: boolean = false;
  private assets: AssetManager;
  private gameState: GameState;
  private currentIdleState: 'idle_idle' | 'idle_idle2' = 'idle_idle';
  private animationCallbacks: Map<AnimationName, () => void> = new Map();

  constructor(assets: AssetManager, gameState: GameState) {
    this.assets = assets;
    this.gameState = gameState;
    this.animations = this.loadAnimations();
    this.currentAnimation = this.createIdleState();
  }

  private loadAnimations(): Record<AnimationName, AnimationConfig> {
    const baseFps = 40;
    return Object.fromEntries(
      combinedConfig.animations.map(anim => [
        anim.name as AnimationName,
        {
          name: anim.name,
          frameCount: anim.frameCount,
          frameWidth: anim.frameWidth,
          frameHeight: anim.frameHeight,
          rowIndex: anim.rowIndex,
          fps: baseFps,
        }
      ])
    ) as Record<AnimationName, AnimationConfig>;
  }

  private createIdleState(): AnimationState {
    return {
      name: this.currentIdleState,
      currentFrame: 0,
      loopCount: 0,
      targetLoops: 1,
      lastFrameTime: 0,
    };
  }

  private isDirty2Animation(name: AnimationName): boolean {
    return name === 'clean_dirty2' || name === 'idle_idle2';
  }

  public queueAnimation(name: AnimationName, priority: number, loops: number = 1, onComplete?: () => void): void {
    this.animationQueue = this.animationQueue.filter(item => item.priority >= priority);
    
    if (!this.animationQueue.some(item => item.name === name && item.priority >= priority)) {
      this.animationQueue.push({ name, priority, loops });
      if (onComplete) {
        this.animationCallbacks.set(name, onComplete);
      }
    }
  }

  public update(timestamp: number): void {
    if (!this.isPlayingAnimation && this.animationQueue.length > 0) {
      this.startNextAnimation();
    }

    const animation = this.animations[this.currentAnimation.name];
    const frameInterval = 1000 / animation.fps;
    const elapsed = timestamp - this.currentAnimation.lastFrameTime;

    if (elapsed < frameInterval) return;

    if (this.currentAnimation.name !== this.currentIdleState) {
      if (this.currentAnimation.currentFrame >= animation.frameCount - 1) {
        if (this.currentAnimation.targetLoops === -1 || 
            this.currentAnimation.loopCount < this.currentAnimation.targetLoops - 1) {
          this.currentAnimation.currentFrame = 0;
          this.currentAnimation.loopCount++;
        } else {
          this.stopAnimation();
        }
      } else {
        this.currentAnimation.currentFrame++;
      }
    }

    this.currentAnimation.lastFrameTime = timestamp;
    this.updateIdleState();
  }

  private updateIdleState(): void {
    const shouldBeDirty = this.gameState.getData().cleanliness <= THRESHOLDS.dirty2;
    const nextIdle = shouldBeDirty ? 'idle_idle2' : 'idle_idle';
    
    if (this.currentIdleState !== nextIdle) {
      if (nextIdle === 'idle_idle2') {
        this.animationQueue = this.animationQueue.filter(item => this.isDirty2Animation(item.name));
      }
      
      this.currentIdleState = nextIdle;
      if (this.currentAnimation.name.startsWith('idle_')) {
        this.stopAnimation();
      }
    }
  }

  private startNextAnimation(): void {
    this.isPlayingAnimation = true;
    const nextAnimation = this.animationQueue[0];
    this.currentAnimation = {
      name: nextAnimation.name,
      currentFrame: 0,
      loopCount: 0,
      targetLoops: nextAnimation.loops,
      lastFrameTime: 0,
    };
    this.animationQueue = this.animationQueue.slice(1);
  }

  public stopAnimation(): void {
    const completedAnimation = this.currentAnimation.name;
    this.currentAnimation = this.createIdleState();
    this.isPlayingAnimation = false;
    
    // Call and remove the callback if it exists
    const callback = this.animationCallbacks.get(completedAnimation);
    if (callback) {
      callback();
      this.animationCallbacks.delete(completedAnimation);
    }
  }

  public render(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement): void {
    const spriteSheet = this.assets.getImage('spritesheet');
    
    if (!spriteSheet?.complete) return;

    // Clear the canvas with transparency
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Calculate scale based on canvas size
    const baseWidth = 1920;
    const scale = canvas.width / baseWidth;

    // Draw cat sprite
    const animation = this.animations[this.currentAnimation.name];
    const catScale = 2 * scale;
    const scaledWidth = animation.frameWidth * catScale;
    const scaledHeight = animation.frameHeight * catScale;
    
    // Position cat relative to canvas size, with offset adjustments
    const destX = (canvas.width / 2) - (scaledWidth / 2) - (45 * scale); // Move left by 40 scaled pixels
    const destY = (canvas.height * 0.37) - (scaledHeight / 2); // Move up by changing from 0.45 to 0.42

    ctx.drawImage(
      spriteSheet,
      this.currentAnimation.currentFrame * animation.frameWidth,
      animation.rowIndex * animation.frameHeight,
      animation.frameWidth,
      animation.frameHeight,
      destX,
      destY,
      scaledWidth,
      scaledHeight
    );
  }

  public clearAnimationQueue(): void {
    this.animationQueue = [];
  }

  public reset(): void {
    this.animationQueue = [];
    this.isPlayingAnimation = false;
    this.currentIdleState = 'idle_idle';
    this.currentAnimation = this.createIdleState();
  }
} 