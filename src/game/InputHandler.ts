import { Game } from "./Game";
import { AnimationPriority } from "../types/game";

export class InputHandler {
  private game: Game;
  private boundHandleKeyDown: (event: KeyboardEvent) => void;

  constructor(game: Game) {
    this.game = game;
    this.setupEventListeners();
    this.boundHandleKeyDown = this.handleKeyDown.bind(this);
  }

  private setupEventListeners(): void {
    this.boundHandleKeyDown = this.handleKeyDown.bind(this);
    document.addEventListener("keydown", this.boundHandleKeyDown);
  }

  public handleFeed(): void {
    const state = this.game.getState();
    if (!state.isDirty) {
      this.game
        .getAnimator()
        .queueAnimation("eat_eating", AnimationPriority.NORMAL);
      this.game.getGameState().hunger = 100;
    }
  }

  public handleSleep(): void {
    const state = this.game.getState();
    if (!state.isDirty) {
      this.game
        .getAnimator()
        .queueAnimation("sleep_sleepstart", AnimationPriority.NORMAL);
      this.game
        .getAnimator()
        .queueAnimation("sleep_sleeping", AnimationPriority.NORMAL, 2);
      this.game
        .getAnimator()
        .queueAnimation("sleep_sleepwake", AnimationPriority.NORMAL);
      this.game.getGameState().energy = 100;
    }
  }

  public handleClean(): void {
    this.game
      .getAnimator()
      .queueAnimation("clean_shower", AnimationPriority.NORMAL);
    this.game.getGameState().cleanliness = 100;
  }

  private handleKeyDown(event: KeyboardEvent): void {
    switch (event.key.toLowerCase()) {
      case "f":
        this.handleFeed();
        break;
      case "s":
        this.handleSleep();
        break;
      case "c":
        this.handleClean();
        break;
      case "p":
        this.game.togglePause();
        break;
      case "r":
        this.game.restart();
        break;
    }
  }

  public cleanup(): void {
    document.removeEventListener("keydown", this.boundHandleKeyDown);
  }
}
