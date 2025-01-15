// "use client";

// import React, {
//   useEffect,
//   useRef,
//   useState,
//   useMemo,
//   useCallback,
// } from "react";
// import {
//   combinedConfig,
//   type SpriteSheetMeta,
// } from "../../public/sheets/config";
// import {
//   GameState,
//   THRESHOLDS,
//   DECAY_RATES,
//   AnimationQueueItem,
//   AnimationPriority,
//   AnimationName,
// } from "../types/game";

// interface AnimationConfig {
//   name: string;
//   frameCount: number;
//   frameWidth: number;
//   frameHeight: number;
//   rowIndex: number;
//   fps?: number; // Frames per second for this animation
// }

// interface AnimationState {
//   name: AnimationName;
//   currentFrame: number;
//   loopCount: number;
//   targetLoops: number; // -1 for infinite
//   lastFrameTime: number;
// }

// const StatusBar: React.FC<{
//   value: number;
//   color: string;
//   label: string;
//   decayRate: number;
// }> = ({ value, color, label, decayRate }) => {
//   // Calculate time until empty in minutes and seconds
//   const timeUntilEmpty = Math.floor(value / decayRate);
//   const minutes = Math.floor(timeUntilEmpty / 60);
//   const seconds = timeUntilEmpty % 60;

//   // Get color based on value
//   const getStatusColor = () => {
//     if (value <= 20) return "bg-red-500";
//     if (value <= 40) return "bg-yellow-500";
//     return color;
//   };

//   return (
//     <div className="w-full bg-gray-100 p-3 rounded-lg shadow-sm">
//       <div className="flex justify-between mb-2">
//         <span className="text-sm font-semibold text-gray-700">{label}</span>
//         <div className="flex gap-2 items-center">
//           <span className="text-sm font-medium text-gray-500">
//             {minutes > 0 ? `${minutes}m ` : ""}
//             {seconds}s
//           </span>
//           <span className="text-sm font-bold">{Math.round(value)}%</span>
//         </div>
//       </div>
//       <div className="w-full bg-gray-200 rounded-full h-3">
//         <div
//           className={`h-3 rounded-full transition-all duration-300 ${getStatusColor()}`}
//           style={{
//             width: `${value}%`,
//             transition: "width 0.3s ease-in-out",
//           }}
//         />
//       </div>
//     </div>
//   );
// };

// // Move this outside the component
// const getFpsForAnimation = (speedMultiplier: number): number => {
//   const baseFps = 40;
//   return baseFps * speedMultiplier;
// };

// const Canvas: React.FC = () => {
//   const canvasRef = useRef<HTMLCanvasElement>(null);
//   // const animationFrameRef = useRef<number | undefined>(undefined);
//   const animationStateRef = useRef<AnimationState>({
//     name: "idle_idle" as const,
//     currentFrame: 0,
//     loopCount: 0,
//     targetLoops: 1,
//     lastFrameTime: 0,
//   });
//   const speedMultiplierRef = useRef<number>(1);
//   const [isLoading, setIsLoading] = useState(true);
//   const [gameState, setGameState] = useState<GameState>({
//     hunger: 100,
//     energy: 100,
//     cleanliness: 100,
//     isGameOver: false,
//     isDirty: false,
//     currentAnimation: null,
//     isPaused: false,
//   });
//   // Add animation queue state
//   const [animationQueue, setAnimationQueue] = useState<AnimationQueueItem[]>(
//     []
//   );
//   const isPlayingAnimation = useRef(false);
//   // Load animations from combined config with custom FPS settings
//   const config = combinedConfig as SpriteSheetMeta;
//   const animations = useMemo(
//     () =>
//       ({
//         ...Object.fromEntries(
//           config.animations.map((anim) => [
//             anim.name,
//             {
//               name: anim.name,
//               frameCount: anim.frameCount,
//               frameWidth: anim.frameWidth,
//               frameHeight: anim.frameHeight,
//               rowIndex: anim.rowIndex,
//               fps: getFpsForAnimation(speedMultiplierRef.current),
//             },
//           ])
//         ),
//       } as Record<AnimationName, AnimationConfig>),
//     [config.animations]
//   );
//   const spriteSheetRef = useRef<HTMLImageElement | null>(null);
//   const backgroundRef = useRef<HTMLImageElement | null>(null);
//   const chairRef = useRef<HTMLImageElement | null>(null);
//   // 1. Add a ref to track the current idle state to prevent flashing
//   const currentIdleRef = useRef<'idle_idle' | 'idle_idle2'>('idle_idle');

//   // Add queue management functions
//   const queueAnimation = (
//     name: AnimationName,
//     priority: number,
//     loops: number = 1
//   ) => {
//     setAnimationQueue((prev) => {
//       // Remove lower priority animations
//       const filteredQueue = prev.filter((item) => item.priority >= priority);

//       // Don't add if same animation is already in queue with same or higher priority
//       if (
//         filteredQueue.some(
//           (item) => item.name === name && item.priority >= priority
//         )
//       ) {
//         return filteredQueue;
//       }

//       return [...filteredQueue, { name, priority, loops }];
//     });
//   };

//   // Helper to stop current animation
//   const stopAnimation = useCallback(() => {
//     const shouldUseDirtyIdle = gameState.cleanliness <= THRESHOLDS.dirty2;
//     const nextIdle = shouldUseDirtyIdle ? 'idle_idle2' : 'idle_idle';
    
//     // Only change if needed
//     if (currentIdleRef.current !== nextIdle) {
//       currentIdleRef.current = nextIdle;
//       animationStateRef.current = {
//         name: nextIdle,
//         currentFrame: 0,
//         loopCount: 0,
//         targetLoops: 1,
//         lastFrameTime: 0,
//       };
//     }
//   }, [gameState.cleanliness]);

//   const playAnimation = useCallback((animationName: AnimationName, loops: number = 1): Promise<void> => {
//     return new Promise((resolve) => {
//       animationStateRef.current = {
//         name: animationName,
//         currentFrame: 0,
//         loopCount: 0,
//         targetLoops: loops,
//         lastFrameTime: 0,
//       };

//       // Set up a check for animation completion
//       const checkCompletion = setInterval(() => {
//         const shouldUseDirtyIdle = gameState.cleanliness <= THRESHOLDS.dirty2;
//         if (animationStateRef.current.name === (shouldUseDirtyIdle ? "idle_idle2" : "idle_idle")) {
//           clearInterval(checkCompletion);
//           resolve();
//         }
//       }, 100);
//     });
//   }, [gameState.cleanliness]);

//   const processAnimationQueue = useCallback(async () => {
//     if (isPlayingAnimation.current || animationQueue.length === 0) return;

//     isPlayingAnimation.current = true;
//     const currentAnimation = animationQueue[0];

//     try {
//       await playAnimation(currentAnimation.name, currentAnimation.loops);
//       setAnimationQueue((prev) => prev.slice(1));
//     } catch (error) {
//       console.error("Animation error:", error);
//     } finally {
//       isPlayingAnimation.current = false;
//     }
//   }, [animationQueue, playAnimation]);

//   // Process queue whenever it changes
//   useEffect(() => {
//     processAnimationQueue();
//   }, [animationQueue, processAnimationQueue]);

//   // 1. Move drawFrame outside the main effect to prevent recreation
//   const drawFrame = useCallback((
//     ctx: CanvasRenderingContext2D,
//     animation: AnimationConfig,
//     frameIndex: number,
//     canvas: HTMLCanvasElement
//   ) => {
//     if (!spriteSheetRef.current?.complete) return;

//     // Clear and draw background
//     ctx.clearRect(0, 0, canvas.width, canvas.height);
//     if (backgroundRef.current?.complete) {
//       ctx.drawImage(backgroundRef.current, 0, 0, canvas.width, canvas.height);
//     }

//     // Draw chair
//     if (chairRef.current?.complete) {
//       const chairScale = 0.6;
//       const scaledChairWidth = chairRef.current.width * chairScale;
//       const scaledChairHeight = chairRef.current.height * chairScale;
//       const chairX = canvas.width / 2 - scaledChairWidth / 2;
//       const chairY = canvas.height / 2 - scaledChairHeight / 2;
//       ctx.drawImage(chairRef.current, chairX, chairY, scaledChairWidth, scaledChairHeight);
//     }

//     // Draw cat sprite
//     const scale = 1.25;
//     const scaledWidth = animation.frameWidth * scale;
//     const scaledHeight = animation.frameHeight * scale;
//     const destX = canvas.width / 2 - scaledWidth / 2 - 25;
//     const destY = canvas.height / 2 - scaledHeight / 2 - 50;

//     ctx.drawImage(
//       spriteSheetRef.current,
//       frameIndex * animation.frameWidth,
//       animation.rowIndex * animation.frameHeight,
//       animation.frameWidth,
//       animation.frameHeight,
//       destX,
//       destY,
//       scaledWidth,
//       scaledHeight
//     );
//   }, []);

//   // 2. Update the main canvas effect
//   const animate = useCallback((timestamp: number) => {
//     const canvas = canvasRef.current;
//     const ctx = canvas?.getContext('2d', { alpha: false });
//     if (!ctx || !canvas || !spriteSheetRef.current?.complete) {
//       requestAnimationFrame(animate);
//       return;
//     }

//     const state = animationStateRef.current;
//     const currentAnimation = animations[state.name];
    
//     const frameInterval = 1000 / (currentAnimation.fps || 30);
//     const elapsed = timestamp - state.lastFrameTime;
//     if (elapsed < frameInterval) {
//       requestAnimationFrame(animate);
//       return;
//     }

//     drawFrame(ctx, currentAnimation, state.currentFrame, canvas);

//     // Only update frame if not in idle state
//     if (state.name !== currentIdleRef.current) {
//       if (state.currentFrame >= currentAnimation.frameCount - 1) {
//         if (state.targetLoops === -1 || state.loopCount < state.targetLoops - 1) {
//           state.currentFrame = 0;
//           state.loopCount++;
//         } else {
//           stopAnimation();
//         }
//       } else {
//         state.currentFrame++;
//       }
//     }

//     state.lastFrameTime = timestamp;
//     requestAnimationFrame(animate);
//   }, [animations, drawFrame, stopAnimation]);

//   useEffect(() => {
//     const canvas = canvasRef.current;
//     if (!canvas) return;

//     const ctx = canvas.getContext('2d', { alpha: false });
//     if (!ctx) return;

//     // Set up canvas once
//     const resizeCanvas = () => {
//       const aspectRatio = 900 / 400;
//       canvas.width = window.innerWidth * 0.98;
//       canvas.height = canvas.width / aspectRatio;
//     };

//     resizeCanvas();
//     window.addEventListener('resize', resizeCanvas);

//     // Start animation loop
//     const animationId = requestAnimationFrame(animate);

//     return () => {
//       window.removeEventListener('resize', resizeCanvas);
//       cancelAnimationFrame(animationId);
//     };
//   }, [animate]);

//   // Game state effect with proper cleanup
//   useEffect(() => {
//     if (gameState.isGameOver || gameState.isPaused) return;

//     const interval = setInterval(() => {
//       setGameState((prev) => {
//         const newState = {
//           hunger: Math.max(0, prev.hunger - DECAY_RATES.hunger),
//           energy: Math.max(0, prev.energy - DECAY_RATES.energy),
//           cleanliness: Math.max(0, prev.cleanliness - DECAY_RATES.cleanliness),
//           isDirty: prev.cleanliness <= THRESHOLDS.dirty2,
//           isGameOver: false,
//           currentAnimation: prev.currentAnimation,
//           isPaused: prev.isPaused,
//         };

//         // Queue animations based on priority
//         if (newState.hunger <= THRESHOLDS.hungry2) {
//           queueAnimation("eat_hungry2", AnimationPriority.URGENT);
//         } else if (newState.hunger <= THRESHOLDS.hungry1) {
//           queueAnimation("eat_hungry", AnimationPriority.HIGH);
//         }

//         if (newState.energy <= THRESHOLDS.sleepy) {
//           queueAnimation("sleep_sleepy", AnimationPriority.HIGH);
//         }

//         if (newState.cleanliness <= THRESHOLDS.dirty2) {
//           queueAnimation("clean_dirty2", AnimationPriority.URGENT);
//         } else if (newState.cleanliness <= THRESHOLDS.dirty1) {
//           queueAnimation("clean_dirty", AnimationPriority.HIGH);
//         }

//         // Game over check
//         if (
//           newState.hunger === 0 &&
//           newState.energy === 0 &&
//           newState.cleanliness === 0
//         ) {
//           newState.isGameOver = true;
//         }

//         return newState;
//       });
//     }, 1000);

//     return () => clearInterval(interval);
//   }, [gameState.isGameOver, gameState.isPaused]);

//   // 4. Update the cleanliness effect to use the ref
//   useEffect(() => {
//     const isDirty = gameState.cleanliness <= THRESHOLDS.dirty2;
//     const shouldBeIdle = isDirty ? 'idle_idle2' : 'idle_idle';
    
//     if (currentIdleRef.current !== shouldBeIdle) {
//       stopAnimation();
//     }
//   }, [gameState.cleanliness, stopAnimation]);

//   // Add this effect near the top of the component, before other effects
//   useEffect(() => {
//     const loadImages = async () => {
//       setIsLoading(true);
      
//       if (!spriteSheetRef.current) {
//         const img = new window.Image();
//         img.src = "/sheets/combined-sprite.png";
//         await new Promise((resolve) => {
//           img.onload = resolve;
//           img.onerror = () => {
//             console.error("Failed to load sprite sheet");
//             resolve(null);
//           };
//         });
//         spriteSheetRef.current = img;
//       }

//       if (!backgroundRef.current) {
//         const bgImg = new window.Image();
//         bgImg.src = "/catBG.png";
//         await new Promise((resolve) => {
//           bgImg.onload = resolve;
//         });
//         backgroundRef.current = bgImg;
//       }

//       if (!chairRef.current) {
//         const chairImg = new window.Image();
//         chairImg.src = "/chair.png";
//         await new Promise((resolve) => {
//           chairImg.onload = resolve;
//         });
//         chairRef.current = chairImg;
//       }

//       setIsLoading(false);
//     };

//     loadImages();
//   }, []); // Empty dependency array ensures this only runs once

//   return (
//     <div className="flex flex-col items-center w-full max-w-lg relative gap-4">
//       {isLoading ? (
//         <div className="absolute inset-0 flex items-center justify-center bg-opacity-75">
//           <div className="flex flex-col items-center gap-4">
//             <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
//             <p className="text-green-600 font-medium">Loading kitty...</p>
//           </div>
//         </div>
//       ) : null}

//       <canvas
//         ref={canvasRef}
//         className={isLoading ? "opacity-0" : "opacity-100"}
//       />

//       <div className="flex flex-col gap-4 w-full max-w-md px-4">
//         <StatusBar
//           value={gameState.hunger}
//           color="bg-green-500"
//           label="Hunger"
//           decayRate={DECAY_RATES.hunger}
//         />
//         <StatusBar
//           value={gameState.energy}
//           color="bg-blue-500"
//           label="Energy"
//           decayRate={DECAY_RATES.energy}
//         />
//         <StatusBar
//           value={gameState.cleanliness}
//           color="bg-purple-500"
//           label="Cleanliness"
//           decayRate={DECAY_RATES.cleanliness}
//         />
//       </div>

//       <div className="flex flex-col items-center w-full max-w-md p-4 gap-4">
//         <div className="flex gap-4 w-full">
//           <select
//             className="text-black flex-1 p-2 border border-gray-300 rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500"
//             onChange={(e) =>
//               queueAnimation(
//                 e.target.value as AnimationName,
//                 AnimationPriority.NORMAL
//               )
//             }
//             disabled={isLoading}
//           >
//             <option value="">Select animation</option>
//             {Object.entries(animations)
//               .filter(([name]) => name !== "idle")
//               .map(([name]) => (
//                 <option key={name} value={name}>
//                   {name}
//                 </option>
//               ))}
//           </select>
//         </div>

//         <div className="flex gap-2">
//           <button
//             className="flex items-center justify-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
//             onClick={() => {
//               const select = document.querySelector(
//                 "select"
//               ) as HTMLSelectElement;
//               if (select.value) {
//                 queueAnimation(
//                   select.value as AnimationName,
//                   AnimationPriority.NORMAL
//                 );
//               }
//             }}
//             disabled={isLoading}
//           >
//             Play
//           </button>

//           <button
//             className="flex items-center justify-center px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
//             onClick={() => {
//               const select = document.querySelector(
//                 "select"
//               ) as HTMLSelectElement;
//               if (select.value) {
//                 queueAnimation(
//                   select.value as AnimationName,
//                   AnimationPriority.NORMAL,
//                   2
//                 );
//               }
//             }}
//             disabled={isLoading}
//           >
//             2x
//           </button>

//           <button
//             className="flex items-center justify-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
//             onClick={() => {
//               const select = document.querySelector(
//                 "select"
//               ) as HTMLSelectElement;
//               if (select.value) {
//                 queueAnimation(
//                   select.value as AnimationName,
//                   AnimationPriority.NORMAL,
//                   -1
//                 );
//               }
//             }}
//             disabled={isLoading}
//           >
//             🔄
//           </button>

//           <button
//             className="flex items-center justify-center px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
//             onClick={stopAnimation}
//             disabled={isLoading}
//           >
//             ⏹️
//           </button>
//         </div>
//       </div>

//       <div className="flex gap-2 px-4">
//         <button
//           className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
//           onClick={() => {
//             if (!gameState.isDirty) {
//               queueAnimation("eat_eating", AnimationPriority.NORMAL);
//               setGameState((prev) => ({ ...prev, hunger: 100 }));
//             }
//           }}
//           disabled={gameState.isDirty || gameState.isGameOver}
//         >
//           Feed
//         </button>
//         <button
//           className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
//           onClick={async () => {
//             if (!gameState.isDirty) {
//               setGameState((prev) => ({ ...prev, currentAnimation: "sleep" }));
//               queueAnimation("sleep_sleepstart", AnimationPriority.NORMAL);
//               queueAnimation("sleep_sleeping", AnimationPriority.NORMAL, 3);
//               queueAnimation("sleep_sleepwake", AnimationPriority.NORMAL);
//               setGameState((prev) => ({ ...prev, energy: 100 }));
//             }
//           }}
//           disabled={
//             gameState.isDirty ||
//             gameState.isGameOver ||
//             gameState.currentAnimation === "sleep"
//           }
//         >
//           Sleep
//         </button>
//         <button
//           className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
//           onClick={() => {
//             setGameState((prev) => ({ ...prev, currentAnimation: "clean" }));
//             playAnimation("clean_shower", 1).then(() => {
//               setGameState((prev) => ({
//                 ...prev,
//                 cleanliness: 100,
//                 isDirty: false,
//                 currentAnimation: null,
//               }));
//             });
//           }}
//           disabled={
//             gameState.isGameOver || gameState.currentAnimation === "clean"
//           }
//         >
//           Clean
//         </button>
//         <button
//           className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
//           onClick={() =>
//             setGameState((prev) => ({ ...prev, isPaused: !prev.isPaused }))
//           }
//         >
//           {gameState.isPaused ? "▶️" : "⏸️"}
//         </button>
//         <button
//           className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
//           onClick={() => {
//             setGameState({
//               hunger: 100,
//               energy: 100,
//               cleanliness: 100,
//               isGameOver: false,
//               isDirty: false,
//               currentAnimation: null,
//               isPaused: false,
//             });
//             setAnimationQueue([]); // Clear animation queue
//             stopAnimation(); // Stop current animation
//           }}
//         >
//           �� Restart
//         </button>
//       </div>

//       {gameState.isGameOver && (
//         <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
//           <div className="bg-white p-8 rounded-lg text-center">
//             <h2 className="text-2xl font-bold mb-4">Game Over!</h2>
//             <button
//               className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
//               onClick={() => {
//                 setGameState({
//                   hunger: 100,
//                   energy: 100,
//                   cleanliness: 100,
//                   isGameOver: false,
//                   isDirty: false,
//                   currentAnimation: null,
//                   isPaused: false,
//                 });
//               }}
//             >
//               Play Again
//             </button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default Canvas;
