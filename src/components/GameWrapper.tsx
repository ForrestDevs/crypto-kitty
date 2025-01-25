/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useRef, useEffect, useState } from "react";
import { Game } from "../game/Game";
import { GameUI } from "./GameUI";
import { GameStateData } from "../types/game";
// import Image from "next/image";

const GameWrapper: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameRef = useRef<Game | null>(null);
  const [gameState, setGameState] = useState<GameStateData>({
    hunger: 100,
    energy: 100,
    cleanliness: 100,
    isDirty: false,
    isGameOver: false,
    isPaused: false,
  });
  const [showGameOverModal, setShowGameOverModal] = useState(false);

  // Handle responsive sizing
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current && canvasRef.current) {
        const container = containerRef.current;
        const canvas = canvasRef.current;

        // Get container dimensions
        const containerWidth = container.clientWidth;
        const maxWidth = Math.min(containerWidth, 1920); // Max width of 900px
        const height = maxWidth * (1440 / 1920); // Maintain 900:400 aspect ratio

        // Set canvas size
        canvas.style.width = `${maxWidth}px`;
        canvas.style.height = `${height}px`;

        // Set actual canvas dimensions (for rendering)
        canvas.width = maxWidth;
        canvas.height = height;

        // Update game if it exists
        if (gameRef.current) {
          gameRef.current.handleResize(maxWidth, height);
        }
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize(); // Initial size

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Update game state every 100ms
  useEffect(() => {
    const interval = setInterval(() => {
      if (gameRef.current) {
        const newState = gameRef.current.getState();
        setGameState(newState);

        // Show game over modal when game ends
        if (newState.isGameOver && !showGameOverModal) {
          setShowGameOverModal(true);
        }
      }
    }, 100);

    return () => clearInterval(interval);
  }, [showGameOverModal]);

  useEffect(() => {
    if (canvasRef.current && !gameRef.current) {
      gameRef.current = new Game(canvasRef.current);
    }

    return () => {
      if (gameRef.current) {
        gameRef.current.cleanup();
      }
    };
  }, []);

  const handleFeed = () => gameRef.current?.inputHandler.handleFeed();
  const handleSleep = () => gameRef.current?.inputHandler.handleSleep();
  const handleClean = () => gameRef.current?.inputHandler.handleClean();
  const handlePause = () => gameRef.current?.togglePause();
  const handleRestart = () => {
    gameRef.current?.restart();
    setShowGameOverModal(false);
  };

  return (
    <div ref={containerRef} className="w-full">
      <div className="flex flex-col gap-4">
        <div className="relative">
          <img
            src="/bgnew.png"
            alt="Cat with chair background"
            className="w-full h-screen object-cover"
          />
          <canvas
            ref={canvasRef}
            className="absolute top-0 left-0 w-full min-h-screen object-cover z-10"
          />
        </div>
        <GameUI
          gameState={gameState}
          onFeed={handleFeed}
          onSleep={handleSleep}
          onClean={handleClean}
          onPause={handlePause}
          onRestart={handleRestart}
        />

        {/* Game Over Modal */}
        {showGameOverModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-lg text-center w-[90%] max-w-md mx-4 space-y-4">
              <h2 className="text-2xl font-bold text-red-600">Oh no!</h2>
              <p className="text-gray-700">You let the kitty fade away... 😿</p>
              <button
                onClick={handleRestart}
                className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all transform hover:scale-105 text-lg font-medium shadow-lg"
              >
                Rebirth New Kitty 🐱
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GameWrapper;
