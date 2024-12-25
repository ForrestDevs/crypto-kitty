"use client";

import React, { useEffect, useRef } from "react";
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
}

const Canvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | undefined>(undefined);
  const currentFrameRef = useRef<number>(0);
  const currentAnimationRef = useRef<AnimationName | "idle">("idle");

  // Load animations from combined config
  const config = combinedConfig as SpriteSheetMeta;
  const animations: Record<string, AnimationConfig> = {
    idle: {
      name: "eat_eating",
      frameCount: 1,
      frameWidth: config.animations[0].frameWidth,
      frameHeight: config.animations[0].frameHeight,
      rowIndex: 0,
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
        },
      ])
    ),
  };

  const spriteSheetRef = useRef<HTMLImageElement | null>(null);

  const playAnimation = (animationName: AnimationName) => {
    currentAnimationRef.current = animationName;
    currentFrameRef.current = 0;
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth * 0.8;
      canvas.height = window.innerHeight * 0.6;
      ctx.fillStyle = "#87CEEB";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    if (!spriteSheetRef.current) {
      spriteSheetRef.current = new Image();
      spriteSheetRef.current.src = "/sheets/combined-sprite.png";
    }

    let lastFrameTime = 0;
    const frameInterval = 0.005;

    const animate = (timestamp: number) => {
      if (!ctx || !spriteSheetRef.current?.complete) {
        animationFrameRef.current = requestAnimationFrame(animate);
        return;
      }

      const elapsed = timestamp - lastFrameTime;
      if (elapsed < frameInterval) {
        animationFrameRef.current = requestAnimationFrame(animate);
        return;
      }

      ctx.fillStyle = "#87CEEB";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const currentAnimation = animations[currentAnimationRef.current];
      const destX = canvas.width / 2 - currentAnimation.frameWidth / 2;
      const destY = canvas.height / 2 - currentAnimation.frameHeight / 2;

      ctx.globalCompositeOperation = "source-over";
      ctx.drawImage(
        spriteSheetRef.current,
        currentFrameRef.current * currentAnimation.frameWidth,
        currentAnimation.rowIndex * currentAnimation.frameHeight,
        currentAnimation.frameWidth,
        currentAnimation.frameHeight,
        destX,
        destY,
        currentAnimation.frameWidth,
        currentAnimation.frameHeight
      );

      if (currentAnimationRef.current !== "idle") {
        currentFrameRef.current =
          (currentFrameRef.current + 1) % currentAnimation.frameCount;
        if (currentFrameRef.current === 0) {
          currentAnimationRef.current = "idle";
        }
      }

      lastFrameTime = timestamp;
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

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
    <div className="canvas-container">
      <canvas
        ref={canvasRef}
        style={{
          border: "2px solid black",
          borderRadius: "8px",
        }}
      />
      <div className="controls-container">
        {Object.entries(animationsByCategory).map(([category, animations]) => (
          <div key={category} className="category-controls">
            <h3>{category}</h3>
            <div className="controls">
              {animations.map((animName) => (
                <button key={animName} onClick={() => playAnimation(animName)}>
                  {animName.split("_")[1]}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
      <style jsx>{`
        .canvas-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 20px;
          padding: 20px;
        }
        .controls-container {
          display: flex;
          gap: 20px;
          flex-wrap: wrap;
          justify-content: center;
        }
        .category-controls {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
        }
        .controls {
          display: flex;
          gap: 10px;
        }
        h3 {
          margin: 0;
          text-transform: capitalize;
          color: #333;
        }
        button {
          padding: 10px 20px;
          border-radius: 5px;
          border: none;
          background-color: #4caf50;
          color: white;
          cursor: pointer;
          text-transform: capitalize;
        }
        button:hover {
          background-color: #45a049;
        }
      `}</style>
    </div>
  );
};

export default Canvas;
