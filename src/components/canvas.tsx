"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  combinedConfig,
  type SpriteSheetMeta,
} from "../../public/sheets/config";

type AnimationName = string; // e.g., "eat_hungry", "sleep_sleeping", etc.

interface AnimationConfig {
  name: string;
  frameCount: number;
  frameWidth: number;
  frameHeight: number;
  rowIndex: number;
  fps?: number; // Frames per second for this animation
}

interface AnimationState {
  name: AnimationName | "idle";
  currentFrame: number;
  loopCount: number;
  targetLoops: number; // -1 for infinite
  lastFrameTime: number;
}

const Canvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | undefined>(undefined);
  const animationStateRef = useRef<AnimationState>({
    name: "idle",
    currentFrame: 0,
    loopCount: 0,
    targetLoops: 1,
    lastFrameTime: 0,
  });
  const speedMultiplierRef = useRef<number>(1);
  const [isLoading, setIsLoading] = useState(true);

  // Load animations from combined config with custom FPS settings
  const config = combinedConfig as SpriteSheetMeta;
  const animations: Record<string, AnimationConfig> = {
    idle: {
      name: "eat_eating",
      frameCount: 1,
      frameWidth: config.animations[0].frameWidth,
      frameHeight: config.animations[0].frameHeight,
      rowIndex: 0,
      fps: getFpsForAnimation(),
    },
    ...Object.fromEntries(
      config.animations.map((anim) => [
        anim.name,
        {
          name: anim.name,
          frameCount: anim.frameCount,
          frameWidth: anim.frameWidth,
          frameHeight: anim.frameHeight,
          rowIndex: anim.rowIndex,
          fps: getFpsForAnimation(),
        },
      ])
    ),
  };

  const spriteSheetRef = useRef<HTMLImageElement | null>(null);

  // Helper function to get FPS with speed multiplier
  function getFpsForAnimation(): number {
    const baseFps = 40; // Base FPS for all animations
    return baseFps * speedMultiplierRef.current;
  }

  const playAnimation = (animationName: AnimationName, loops: number = 1) => {
    animationStateRef.current = {
      name: animationName,
      currentFrame: 0,
      loopCount: 0,
      targetLoops: loops,
      lastFrameTime: 0,
    };
  };

  // Helper to stop current animation
  const stopAnimation = () => {
    animationStateRef.current = {
      name: "idle",
      currentFrame: 0,
      loopCount: 0,
      targetLoops: 1,
      lastFrameTime: 0,
    };
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth * 0.98;
      canvas.height = window.innerHeight * 0.6;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    if (!spriteSheetRef.current) {
      spriteSheetRef.current = new Image();
      spriteSheetRef.current.onload = () => {
        setIsLoading(false);
      };
      spriteSheetRef.current.onerror = () => {
        console.error("Failed to load sprite sheet");
        setIsLoading(false);
      };
      spriteSheetRef.current.src = "/sheets/combined-sprite.png";
    }

    const drawFrame = (
      animation: AnimationConfig,
      frameIndex: number,
      x: number,
      y: number
    ) => {
      if (!ctx || !spriteSheetRef.current?.complete) return;

      const safeFrameIndex = Math.min(frameIndex, animation.frameCount - 1);

      ctx.drawImage(
        spriteSheetRef.current,
        safeFrameIndex * animation.frameWidth,
        animation.rowIndex * animation.frameHeight,
        animation.frameWidth,
        animation.frameHeight,
        x,
        y,
        animation.frameWidth,
        animation.frameHeight
      );
    };

    const animate = (timestamp: number) => {
      if (!ctx || !spriteSheetRef.current?.complete) {
        animationFrameRef.current = requestAnimationFrame(animate);
        return;
      }

      const state = animationStateRef.current;
      const currentAnimation = animations[state.name];
      const frameInterval = 1000 / (currentAnimation.fps || 30);

      // Check if enough time has passed for next frame
      const elapsed = timestamp - state.lastFrameTime;
      if (elapsed < frameInterval) {
        animationFrameRef.current = requestAnimationFrame(animate);
        return;
      }

      // Clear and draw background
      //   ctx.fillStyle = "transparent";
      //   ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const destX = canvas.width / 2 - currentAnimation.frameWidth / 2 - 25;
      const destY = canvas.height / 2 - currentAnimation.frameHeight / 2;

      // Draw current frame
      ctx.globalCompositeOperation = "source-over";
      drawFrame(currentAnimation, state.currentFrame, destX, destY);

      // Update animation state
      if (state.name !== "idle") {
        if (state.currentFrame >= currentAnimation.frameCount - 1) {
          // Animation cycle complete
          if (
            state.targetLoops === -1 ||
            state.loopCount < state.targetLoops - 1
          ) {
            // Continue looping
            state.currentFrame = 0;
            state.loopCount++;
          } else {
            // Animation complete
            stopAnimation();
          }
        } else {
          // Next frame
          state.currentFrame++;
        }
      }

      state.lastFrameTime = timestamp;
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [animations]);

  // Group animations by category
  const animationsByCategory = Object.entries(animations)
    .filter(([name]) => name !== "idle")
    .reduce((acc, [name]) => {
      const [category] = name.split("_");
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(name);
      return acc;
    }, {} as Record<string, string[]>);

  return (
    <div className="flex flex-col items-center w-full max-w-lg relative">
      {isLoading ? (
        <div className="absolute inset-0 flex items-center justify-center bg-opacity-75">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-green-600 font-medium">Loading kitty...</p>
          </div>
        </div>
      ) : null}

      <canvas
        ref={canvasRef}
        className={isLoading ? "opacity-0" : "opacity-100"}
      />
      <div className="flex flex-col items-center w-full max-w-md p-4 gap-4">
        <div className="flex gap-4 w-full">
          <select
            className="text-black flex-1 p-2 border border-gray-300 rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            onChange={(e) => playAnimation(e.target.value)}
            disabled={isLoading}
          >
            <option value="">Select animation</option>
            {Object.entries(animationsByCategory).map(
              ([category, animations]) => (
                <optgroup key={category} label={category.toUpperCase()}>
                  {animations.map((animName) => (
                    <option key={animName} value={animName}>
                      {animName.split("_")[1]}
                    </option>
                  ))}
                </optgroup>
              )
            )}
          </select>
        </div>

        <div className="flex gap-2">
          <button
            className="flex items-center justify-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => {
              const select = document.querySelector(
                "select"
              ) as HTMLSelectElement;
              if (select.value) {
                playAnimation(select.value);
              }
            }}
            disabled={isLoading}
          >
            Play
          </button>

          <button
            className="flex items-center justify-center px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => {
              const select = document.querySelector(
                "select"
              ) as HTMLSelectElement;
              if (select.value) {
                playAnimation(select.value, 2);
              }
            }}
            disabled={isLoading}
          >
            2x
          </button>

          <button
            className="flex items-center justify-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => {
              const select = document.querySelector(
                "select"
              ) as HTMLSelectElement;
              if (select.value) {
                playAnimation(select.value, -1);
              }
            }}
            disabled={isLoading}
          >
            🔄
          </button>

          <button
            className="flex items-center justify-center px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={stopAnimation}
            disabled={isLoading}
          >
            ⏹️
          </button>
        </div>
      </div>
    </div>
  );
};

export default Canvas;
