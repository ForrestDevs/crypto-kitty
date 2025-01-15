import React from 'react';
import { GameStateData, DECAY_RATES } from '../types/game';

interface GameUIProps {
  gameState: GameStateData;
  onFeed: () => void;
  onSleep: () => void;
  onClean: () => void;
  onPause: () => void;
  onRestart: () => void;
}

const StatusBar: React.FC<{
  value: number;
  label: string;
  decayRate: number;
  color: string;
}> = ({ value, label, decayRate, color }) => {
  const timeUntilEmpty = Math.floor(value / decayRate);
  const minutes = Math.floor(timeUntilEmpty / 60);
  const seconds = timeUntilEmpty % 60;

  const getStatusColor = () => {
    if (value <= 20) return 'bg-red-500';
    if (value <= 40) return 'bg-yellow-500';
    return color;
  };

  return (
    <div className="w-full bg-white/80 p-3 rounded-lg shadow-sm">
      <div className="flex justify-between mb-2">
        <span className="text-sm font-semibold text-gray-700">{label}</span>
        <div className="flex gap-2 items-center">
          <span className="text-sm font-medium text-gray-500">
            {minutes > 0 ? `${minutes}m ` : ''}{seconds}s
          </span>
          <span className="text-sm font-bold">{Math.round(value)}%</span>
        </div>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-3">
        <div
          className={`h-3 rounded-full transition-all duration-300 ${getStatusColor()}`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
};

export const GameUI: React.FC<GameUIProps> = ({
  gameState,
  onFeed,
  onSleep,
  onClean,
  onPause,
  onRestart,
}) => {
  return (
    <div className="p-4">
      <div className="max-w-md mx-auto space-y-4">
        {/* Status Bars */}
        <div className="space-y-2">
          <StatusBar
            value={gameState.hunger}
            label="Hunger"
            decayRate={DECAY_RATES.hunger}
            color="bg-green-500"
          />
          <StatusBar
            value={gameState.energy}
            label="Energy"
            decayRate={DECAY_RATES.energy}
            color="bg-blue-500"
          />
          <StatusBar
            value={gameState.cleanliness}
            label="Cleanliness"
            decayRate={DECAY_RATES.cleanliness}
            color="bg-purple-500"
          />
        </div>

        {/* Controls */}
        <div className="flex flex-wrap gap-2 justify-center">
          <div className="flex gap-2 sm:flex-row flex-col">
            <button
              onClick={onFeed}
              disabled={gameState.isDirty || gameState.isGameOver}
              className="px-4 py-3 sm:py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 min-w-[100px]"
            >
              <span>🍽️</span> Feed
              <span className="hidden sm:inline">(F)</span>
            </button>
            <button
              onClick={onSleep}
              disabled={gameState.isDirty || gameState.isGameOver}
              className="px-4 py-3 sm:py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 min-w-[100px]"
            >
              <span>😴</span> Sleep
              <span className="hidden sm:inline">(S)</span>
            </button>
            <button
              onClick={onClean}
              disabled={gameState.isGameOver}
              className="px-4 py-3 sm:py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 min-w-[100px]"
            >
              <span>🚿</span> Clean
              <span className="hidden sm:inline">(C)</span>
            </button>
            <button
              onClick={onPause}
              className="px-4 py-3 sm:py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center justify-center gap-2 min-w-[100px]"
            >
              {gameState.isPaused ? <span>▶️</span> : <span>⏸️</span>}
              <span className="hidden sm:inline">(P)</span>
            </button>
            <button
              onClick={onRestart}
              className="px-4 py-3 sm:py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors flex items-center justify-center gap-2 min-w-[100px]"
            >
              <span>🔄</span> Restart
              <span className="hidden sm:inline">(R)</span>
            </button>
          </div>
        </div>

        {/* Game State Indicators */}
        <div className="flex justify-center gap-4">
          {gameState.isDirty && (
            <span className="px-3 py-1 bg-red-500 text-white rounded-full text-sm">
              Kitty needs cleaning!
            </span>
          )}
          {gameState.isPaused && (
            <span className="px-3 py-1 bg-yellow-500 text-white rounded-full text-sm">
              Game Paused
            </span>
          )}
        </div>
      </div>

      {/* Game Over Modal */}
      {gameState.isGameOver && (
        <div className="h-screen fixed inset-0 translate-y-[-68.7%] flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg text-center w-[90%] max-w-md mx-4">
            <h2 className="text-2xl font-bold mb-4">Game Over!</h2>
            <button
              onClick={onRestart}
              className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-lg"
            >
              Play Again
            </button>
          </div>
        </div>
      )}
    </div>
  );
}; 