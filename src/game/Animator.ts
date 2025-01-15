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

  public queueAnimation(name: AnimationName, priority: number, loops: number = 1): void {
    this.animationQueue = this.animationQueue.filter(item => item.priority >= priority);
    
    if (!this.animationQueue.some(item => item.name === name && item.priority >= priority)) {
      this.animationQueue.push({ name, priority, loops });
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
    this.currentAnimation = this.createIdleState();
    this.isPlayingAnimation = false;
  }

  public render(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement): void {
    const spriteSheet = this.assets.getImage('spritesheet');
    const background = this.assets.getImage('background');
    const chair = this.assets.getImage('chair');
    
    if (!spriteSheet?.complete) return;

    // Calculate scale based on canvas size
    const baseWidth = 1920;
    const scale = canvas.width / baseWidth;

    // Draw background
    if (background?.complete) {
      ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
    }

    // Draw chair
    if (chair?.complete) {
      const chairScale = 0.9 * scale;
      const scaledChairWidth = chair.width * chairScale;
      const scaledChairHeight = chair.height * chairScale;
      const chairX = canvas.width / 2 - scaledChairWidth / 2;
      const chairY = canvas.height / 2 - scaledChairHeight / 2 + 200;
      ctx.drawImage(chair, chairX, chairY, scaledChairWidth, scaledChairHeight);
    }

    // Draw cat sprite
    const animation = this.animations[this.currentAnimation.name];
    const catScale = 2 * scale;
    const scaledWidth = animation.frameWidth * catScale;
    const scaledHeight = animation.frameHeight * catScale;
    const destX = canvas.width / 2 - scaledWidth / 2 - (25 * scale) - 10;
    const destY = canvas.height / 2 - scaledHeight / 2 - (50 * scale) - 150;

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

  public reset(): void {
    this.animationQueue = [];
    this.isPlayingAnimation = false;
    this.currentIdleState = 'idle_idle';
    this.currentAnimation = this.createIdleState();
  }
} 