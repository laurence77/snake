// Game Types and Interfaces

export interface Position {
  x: number;
  y: number;
}

export interface SnakeSegment extends Position {
  id?: string;
}

export enum FoodType {
  APPLE = 'apple',           // Basic food - grows snake by 1
  GOLDEN_APPLE = 'golden',   // Bonus points + growth
  SPEED_BERRY = 'speed',     // Temporary speed boost
  SHRINK_BERRY = 'shrink',   // Reduces snake size by 1-2 segments
  MULTI_APPLE = 'multi',     // Spawns 3-5 food items
  POWER_PELLET = 'power',    // Temporary invincibility
  MYSTERY_FOOD = 'mystery',  // Random effect
  BOMB_FOOD = 'bomb',        // Dangerous - ends game if eaten
  FREEZE_BERRY = 'freeze',   // Freezes obstacles temporarily
  COIN_FOOD = 'coin'         // Gives extra coins but no growth
}

export interface Food extends Position {
  type: FoodType;
  value: number;        // Points awarded
  rarity: number;       // Spawn chance (0-1)
  duration?: number;    // How long food stays on board (ms)
  effect?: FoodEffect;  // Special effect when consumed
}

export interface FoodEffect {
  type: 'speed' | 'slow' | 'invincible' | 'reverse' | 'shrink' | 'multi';
  duration: number;     // Effect duration in milliseconds
  magnitude?: number;   // Effect strength
}

export enum ObstacleType {
  WALL = 'wall',
  MOVING_WALL = 'moving_wall',
  TELEPORTER = 'teleporter',
  SPIKE = 'spike',
  LASER = 'laser'
}

export interface Obstacle extends Position {
  type: ObstacleType;
  width: number;
  height: number;
  active?: boolean;
  movePattern?: Position[];
  currentPatternIndex?: number;
  targetPosition?: Position;
}

export interface Level {
  id: number;
  name: string;
  difficulty: number;        // 1-10 scale
  targetScore: number;       // Score needed to complete level
  timeLimit?: number;        // Optional time limit in seconds
  obstacles: Obstacle[];     // Static and dynamic obstacles
  specialRules?: LevelRule[]; // Special gameplay modifications
  foodConfig: {
    spawnRate: number;       // Foods per second
    typeWeights: Record<FoodType, number>; // Probability weights
  };
  rewards: {
    coins: number;
    experience: number;
    unlocks?: string[];      // Item IDs unlocked
  };
  environment: {
    theme: string;           // Visual theme
    backgroundColor: string;
    musicTrack?: string;
  };
}

export enum LevelRule {
  NO_WALLS = 'no_walls',           // Snake wraps around edges
  DOUBLE_SPEED = 'double_speed',   // Snake moves twice as fast
  INVISIBLE_TAIL = 'invisible_tail', // Can't see snake tail
  REVERSE_CONTROLS = 'reverse_controls', // Controls are inverted
  SHRINKING_ARENA = 'shrinking_arena',  // Play area gets smaller
  GROWING_TAIL = 'growing_tail',   // Snake grows continuously
  MIRRORED_MOVEMENT = 'mirrored'   // Snake moves in mirror pattern
}

export interface GameState {
  currentLevel: number;
  score: number;
  lives: number;
  coins: number;
  experience: number;
  completedLevels: Set<number>;
  inventory: PlayerInventory;
  settings: GameSettings;
  statistics: GameStatistics;
}

export interface PlayerInventory {
  skins: string[];           // Owned snake skins
  powerups: Record<string, number>; // Powerup quantities
  themes: string[];          // Owned visual themes
  currentSkin: string;
  currentTheme: string;
}

export interface GameSettings {
  soundEnabled: boolean;
  musicEnabled: boolean;
  vibrationEnabled: boolean;
  controlScheme: 'swipe' | 'buttons' | 'keyboard';
  difficulty: 'easy' | 'normal' | 'hard';
}

export interface GameStatistics {
  totalScore: number;
  gamesPlayed: number;
  totalPlayTime: number;     // in milliseconds
  foodEaten: Record<FoodType, number>;
  levelsCompleted: number;
  longestSnake: number;
  perfectRuns: number;       // Levels completed without taking damage
}

export enum StoreItemType {
  SKIN = 'skin',
  POWERUP = 'powerup',
  THEME = 'theme',
  BOOSTER = 'booster',
  LIFE = 'life'
}

export interface StoreItem {
  id: string;
  name: string;
  description: string;
  type: StoreItemType;
  price: number;
  currency: 'coins' | 'gems';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  preview?: string;          // Preview image/animation
  unlockCondition?: {
    type: 'level' | 'score' | 'achievement';
    value: number | string;
  };
  isConsumable: boolean;     // Can be used multiple times
}

export interface PowerUp {
  id: string;
  name: string;
  description: string;
  effect: FoodEffect;
  duration: number;
  cooldown: number;
  icon: string;
}

export enum GameEvent {
  FOOD_EATEN = 'food_eaten',
  LEVEL_COMPLETED = 'level_completed',
  GAME_OVER = 'game_over',
  POWERUP_ACTIVATED = 'powerup_activated',
  ACHIEVEMENT_UNLOCKED = 'achievement_unlocked',
  STORE_PURCHASE = 'store_purchase'
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  condition: {
    type: 'score' | 'food_count' | 'level_complete' | 'time' | 'streak';
    target: number;
    foodType?: FoodType;
  };
  reward: {
    coins?: number;
    experience?: number;
    unlocks?: string[];
  };
  isUnlocked: boolean;
  progress: number;
}