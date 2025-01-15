"use client";

import React, { useRef, useEffect, useState } from 'react';
import { Game } from '../game/Game';
import { GameUI } from './GameUI';
import { GameStateData } from '../types/game';

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
    isPaused: false
  });

  // Handle responsive sizing
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current && canvasRef.current) {
        const container = containerRef.current;
        const canvas = canvasRef.current;
        
        // Get container dimensions
        const containerWidth = container.clientWidth;
        const maxWidth = Math.min(containerWidth, 1920); // Max width of 900px
        const height = maxWidth * (1440/1920); // Maintain 900:400 aspect ratio
        
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

    window.addEventListener('resize', handleResize);
    handleResize(); // Initial size

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Update game state every 100ms
  useEffect(() => {
    const interval = setInterval(() => {
      if (gameRef.current) {
        setGameState(gameRef.current.getState());
      }
    }, 100);

    return () => clearInterval(interval);
  }, []);

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
  const handleRestart = () => gameRef.current?.restart();

  return (
    <div ref={containerRef} className="w-full">
      <div className="flex flex-col gap-4">
        <canvas 
          ref={canvasRef}
          className="rounded-lg shadow-lg overflow-hidden"
        />
        <GameUI
          gameState={gameState}
          onFeed={handleFeed}
          onSleep={handleSleep}
          onClean={handleClean}
          onPause={handlePause}
          onRestart={handleRestart}
        />
      </div>
    </div>
  );
};

export default GameWrapper; 