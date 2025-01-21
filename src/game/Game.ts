import { AssetManager } from "./AssetManager";
import { Animator } from "./Animator";
import { InputHandler } from "./InputHandler";
import { GameState } from "./GameState";
import { GameStateData } from "../types/game";

export class Game {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private assets: AssetManager;
  private animator: Animator;
  private gameState: GameState;
  public inputHandler: InputHandler;
  private isRunning: boolean = false;
  private boundResizeCanvas: () => void;

  constructor(canvasElement: HTMLCanvasElement) {
    this.canvas = canvasElement;
    this.ctx = this.canvas.getContext("2d")!;
    this.assets = new AssetManager();
    this.gameState = new GameState();
    this.animator = new Animator(this.assets, this.gameState);
    this.gameState.setAnimator(this.animator);
    this.inputHandler = new InputHandler(this);
    this.boundResizeCanvas = this.resizeCanvas.bind(this);

    this.init();
  }

  private async init(): Promise<void> {
    await this.assets.loadAll();
    this.setupCanvas();
    this.start();
  }

  private setupCanvas(): void {
    this.boundResizeCanvas = this.resizeCanvas.bind(this);
    window.addEventListener("resize", this.boundResizeCanvas);
    this.boundResizeCanvas();
  }

  private resizeCanvas(): void {
    const aspectRatio = 1920 / 1440;
    this.canvas.width = window.innerWidth * 0.98;
    this.canvas.height = this.canvas.width / aspectRatio;
  }

  public start(): void {
    this.isRunning = true;
    this.gameLoop();
  }

  public pause(): void {
    this.isRunning = false;
  }

  public togglePause(): void {
    this.isRunning = !this.isRunning;
    if (this.isRunning) {
      this.gameLoop();
    }
  }

  public restart(): void {
    this.gameState.reset();
    this.animator.reset();
    if (!this.isRunning) {
      this.start();
    }
  }

  public getState(): GameStateData {
    return this.gameState.getData();
  }

  public getAnimator(): Animator {
    return this.animator;
  }

  private gameLoop(timestamp: number = 0): void {
    if (!this.isRunning) return;

    this.update(timestamp);
    this.render();

    requestAnimationFrame(this.gameLoop.bind(this));
  }

  private update(timestamp: number): void {
    this.gameState.update();
    this.animator.update(timestamp);
  }

  private render(): void {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.animator.render(this.ctx, this.canvas);
  }

  public cleanup(): void {
    this.pause();
    window.removeEventListener("resize", this.boundResizeCanvas);
    this.inputHandler.cleanup();
  }

  public getInputHandler(): InputHandler {
    return this.inputHandler;
  }

  public getCanvas(): HTMLCanvasElement {
    return this.canvas;
  }

  public isGameRunning(): boolean {
    return this.isRunning;
  }

  public getGameState(): GameState {
    return this.gameState;
  }

  public handleResize(width: number, height: number): void {
    this.canvas.width = width;
    this.canvas.height = height;
    // Force a render update
    this.render();
  }
}
