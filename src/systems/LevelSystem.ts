import { Level, LevelRule, ObstacleType, FoodType } from '../types/GameTypes';

/**
 * Level System - Manages all 147 levels with progressive difficulty
 */
export class LevelSystem {
  private levels: Level[] = [];
  
  constructor() {
    this.generateAllLevels();
  }
  
  /**
   * Generate all 147 levels with increasing complexity
   */
  private generateAllLevels(): void {
    // Tutorial Levels (1-5)
    this.generateTutorialLevels();
    
    // Basic Levels (6-20)
    this.generateBasicLevels();
    
    // Intermediate Levels (21-50)
    this.generateIntermediateLevels();
    
    // Advanced Levels (51-100)
    this.generateAdvancedLevels();
    
    // Expert Levels (101-130)
    this.generateExpertLevels();
    
    // Master Levels (131-147)
    this.generateMasterLevels();
  }
  
  private generateTutorialLevels(): void {
    // Level 1: Basic movement and eating
    this.levels.push({
      id: 1,
      name: "First Bite",
      difficulty: 1,
      targetScore: 50,
      obstacles: [],
      foodConfig: {
        spawnRate: 0.8,
        typeWeights: { 
          [FoodType.APPLE]: 1,
          [FoodType.GOLDEN_APPLE]: 0,
          [FoodType.SPEED_BERRY]: 0,
          [FoodType.SHRINK_BERRY]: 0,
          [FoodType.MULTI_APPLE]: 0,
          [FoodType.POWER_PELLET]: 0,
          [FoodType.MYSTERY_FOOD]: 0,
          [FoodType.BOMB_FOOD]: 0,
          [FoodType.FREEZE_BERRY]: 0,
          [FoodType.COIN_FOOD]: 0
        }
      },
      rewards: { coins: 10, experience: 25 },
      environment: {
        theme: 'tutorial',
        backgroundColor: '#0b0d10'
      }
    });
    
    // Level 2: Introduction to golden apples
    this.levels.push({
      id: 2,
      name: "Golden Opportunity",
      difficulty: 1,
      targetScore: 100,
      obstacles: [],
      foodConfig: {
        spawnRate: 0.9,
        typeWeights: { 
          [FoodType.APPLE]: 0.8,
          [FoodType.GOLDEN_APPLE]: 0.2,
          [FoodType.SPEED_BERRY]: 0,
          [FoodType.SHRINK_BERRY]: 0,
          [FoodType.MULTI_APPLE]: 0,
          [FoodType.POWER_PELLET]: 0,
          [FoodType.MYSTERY_FOOD]: 0,
          [FoodType.BOMB_FOOD]: 0,
          [FoodType.FREEZE_BERRY]: 0,
          [FoodType.COIN_FOOD]: 0
        }
      },
      rewards: { coins: 15, experience: 30 },
      environment: {
        theme: 'tutorial',
        backgroundColor: '#0b0d10'
      }
    });
    
    // Level 3: First obstacle - single wall
    this.levels.push({
      id: 3,
      name: "Wall Walker",
      difficulty: 2,
      targetScore: 150,
      obstacles: [{
        x: 20, y: 10, type: ObstacleType.WALL, width: 1, height: 8
      }],
      foodConfig: {
        spawnRate: 0.9,
        typeWeights: { 
          [FoodType.APPLE]: 0.7,
          [FoodType.GOLDEN_APPLE]: 0.3,
          [FoodType.SPEED_BERRY]: 0,
          [FoodType.SHRINK_BERRY]: 0,
          [FoodType.MULTI_APPLE]: 0,
          [FoodType.POWER_PELLET]: 0,
          [FoodType.MYSTERY_FOOD]: 0,
          [FoodType.BOMB_FOOD]: 0,
          [FoodType.FREEZE_BERRY]: 0,
          [FoodType.COIN_FOOD]: 0
        }
      },
      rewards: { coins: 20, experience: 35 },
      environment: {
        theme: 'basic',
        backgroundColor: '#0b0d10'
      }
    });
    
    // Level 4: Speed berries introduction
    this.levels.push({
      id: 4,
      name: "Need for Speed",
      difficulty: 2,
      targetScore: 200,
      obstacles: [
        { x: 15, y: 5, type: ObstacleType.WALL, width: 1, height: 5 },
        { x: 25, y: 15, type: ObstacleType.WALL, width: 1, height: 5 }
      ],
      foodConfig: {
        spawnRate: 1.0,
        typeWeights: { 
          [FoodType.APPLE]: 0.6,
          [FoodType.GOLDEN_APPLE]: 0.2,
          [FoodType.SPEED_BERRY]: 0.2,
          [FoodType.SHRINK_BERRY]: 0,
          [FoodType.MULTI_APPLE]: 0,
          [FoodType.POWER_PELLET]: 0,
          [FoodType.MYSTERY_FOOD]: 0,
          [FoodType.BOMB_FOOD]: 0,
          [FoodType.FREEZE_BERRY]: 0,
          [FoodType.COIN_FOOD]: 0
        }
      },
      rewards: { coins: 25, experience: 40 },
      environment: {
        theme: 'basic',
        backgroundColor: '#0b0d10'
      }
    });
    
    // Level 5: All basic foods introduced
    this.levels.push({
      id: 5,
      name: "Variety Pack",
      difficulty: 3,
      targetScore: 300,
      obstacles: [
        { x: 10, y: 8, type: ObstacleType.WALL, width: 5, height: 1 },
        { x: 25, y: 12, type: ObstacleType.WALL, width: 5, height: 1 },
        { x: 35, y: 16, type: ObstacleType.WALL, width: 1, height: 6 }
      ],
      foodConfig: {
        spawnRate: 1.2,
        typeWeights: { 
          [FoodType.APPLE]: 0.4,
          [FoodType.GOLDEN_APPLE]: 0.2,
          [FoodType.SPEED_BERRY]: 0.15,
          [FoodType.SHRINK_BERRY]: 0.1,
          [FoodType.MULTI_APPLE]: 0.1,
          [FoodType.POWER_PELLET]: 0.05,
          [FoodType.MYSTERY_FOOD]: 0,
          [FoodType.BOMB_FOOD]: 0,
          [FoodType.FREEZE_BERRY]: 0,
          [FoodType.COIN_FOOD]: 0
        }
      },
      rewards: { coins: 35, experience: 50, unlocks: ['basic_skin_pack'] },
      environment: {
        theme: 'basic',
        backgroundColor: '#0b0d10'
      }
    });
  }
  
  private generateBasicLevels(): void {
    for (let i = 6; i <= 20; i++) {
      const difficulty = 2 + Math.floor((i - 6) / 3);
      const obstacleCount = Math.min(1 + Math.floor((i - 6) / 2), 6);
      
      this.levels.push({
        id: i,
        name: `Basic Challenge ${i - 5}`,
        difficulty: difficulty,
        targetScore: 200 + (i - 6) * 50,
        obstacles: this.generateRandomObstacles(obstacleCount, ['wall']),
        foodConfig: {
          spawnRate: 1.0 + (i - 6) * 0.1,
          typeWeights: this.getBasicFoodWeights()
        },
        rewards: { 
          coins: 30 + (i - 6) * 5, 
          experience: 40 + (i - 6) * 5,
          ...(i === 10 && { unlocks: ['speed_theme'] }),
          ...(i === 15 && { unlocks: ['nature_skin'] }),
          ...(i === 20 && { unlocks: ['intermediate_levels'] })
        },
        environment: {
          theme: i <= 12 ? 'basic' : 'forest',
          backgroundColor: i <= 12 ? '#0b0d10' : '#1a2f1a'
        }
      });
    }
  }
  
  private generateIntermediateLevels(): void {
    for (let i = 21; i <= 50; i++) {
      const difficulty = 4 + Math.floor((i - 21) / 6);
      const obstacleCount = 3 + Math.floor((i - 21) / 3);
      const hasMovingObstacles = i >= 30;
      const hasTimeLimit = i >= 35;
      
      const level: Level = {
        id: i,
        name: `${this.getThemeName(i)} ${((i - 21) % 10) + 1}`,
        difficulty: difficulty,
        targetScore: 500 + (i - 21) * 75,
        obstacles: this.generateRandomObstacles(
          obstacleCount, 
          hasMovingObstacles ? ['wall', 'moving_wall'] : ['wall']
        ),
        foodConfig: {
          spawnRate: 1.3 + (i - 21) * 0.05,
          typeWeights: this.getIntermediateFoodWeights(i)
        },
        rewards: { 
          coins: 50 + (i - 21) * 8, 
          experience: 60 + (i - 21) * 8,
          ...(i % 10 === 0 && { unlocks: [this.getUnlockForLevel(i)] })
        },
        environment: {
          theme: this.getThemeForLevel(i),
          backgroundColor: this.getBackgroundForLevel(i)
        }
      };
      
      if (hasTimeLimit && i >= 40) {
        level.timeLimit = 180 - (i - 40) * 5; // 3 minutes decreasing
      }
      
      // Add special rules for certain levels
      if (i === 25) level.specialRules = [LevelRule.NO_WALLS];
      if (i === 35) level.specialRules = [LevelRule.DOUBLE_SPEED];
      if (i === 45) level.specialRules = [LevelRule.REVERSE_CONTROLS];
      
      this.levels.push(level);
    }
  }
  
  private generateAdvancedLevels(): void {
    for (let i = 51; i <= 100; i++) {
      const difficulty = 6 + Math.floor((i - 51) / 8);
      const obstacleCount = 5 + Math.floor((i - 51) / 4);
      
      const level: Level = {
        id: i,
        name: `Advanced ${((i - 51) % 10) + 1}`,
        difficulty: difficulty,
        targetScore: 1000 + (i - 51) * 100,
        timeLimit: 150 - Math.floor((i - 51) / 10) * 10,
        obstacles: this.generateRandomObstacles(
          obstacleCount, 
          ['wall', 'moving_wall', 'teleporter', 'spike']
        ),
        specialRules: this.getSpecialRulesForLevel(i),
        foodConfig: {
          spawnRate: 1.8 + (i - 51) * 0.03,
          typeWeights: this.getAdvancedFoodWeights(i)
        },
        rewards: { 
          coins: 100 + (i - 51) * 12, 
          experience: 120 + (i - 51) * 12,
          ...(i % 5 === 0 && { unlocks: [this.getUnlockForLevel(i)] })
        },
        environment: {
          theme: this.getAdvancedTheme(i),
          backgroundColor: this.getAdvancedBackground(i)
        }
      };
      
      this.levels.push(level);
    }
  }
  
  private generateExpertLevels(): void {
    for (let i = 101; i <= 130; i++) {
      const difficulty = 8 + Math.floor((i - 101) / 10);
      const obstacleCount = 8 + Math.floor((i - 101) / 3);
      
      const level: Level = {
        id: i,
        name: `Expert Trial ${i - 100}`,
        difficulty: difficulty,
        targetScore: 2000 + (i - 101) * 150,
        timeLimit: 120 - Math.floor((i - 101) / 5) * 5,
        obstacles: this.generateRandomObstacles(
          obstacleCount, 
          ['wall', 'moving_wall', 'teleporter', 'spike', 'laser']
        ),
        specialRules: this.getExpertSpecialRules(i),
        foodConfig: {
          spawnRate: 2.2 + (i - 101) * 0.02,
          typeWeights: this.getExpertFoodWeights(i)
        },
        rewards: { 
          coins: 200 + (i - 101) * 20, 
          experience: 250 + (i - 101) * 20,
          ...(i % 3 === 0 && { unlocks: [this.getExpertUnlock(i)] })
        },
        environment: {
          theme: this.getExpertTheme(i),
          backgroundColor: this.getExpertBackground(i)
        }
      };
      
      this.levels.push(level);
    }
  }
  
  private generateMasterLevels(): void {
    for (let i = 131; i <= 147; i++) {
      const difficulty = 10;
      const obstacleCount = 12 + (i - 131);
      
      const level: Level = {
        id: i,
        name: `Master Level ${i - 130}`,
        difficulty: difficulty,
        targetScore: 5000 + (i - 131) * 500,
        timeLimit: 90 + (i - 131) * 2,
        obstacles: this.generateRandomObstacles(
          obstacleCount, 
          ['wall', 'moving_wall', 'teleporter', 'spike', 'laser'],
          true // Complex patterns
        ),
        specialRules: this.getMasterSpecialRules(i),
        foodConfig: {
          spawnRate: 3.0 + (i - 131) * 0.1,
          typeWeights: this.getMasterFoodWeights(i)
        },
        rewards: { 
          coins: 500 + (i - 131) * 50, 
          experience: 500 + (i - 131) * 50,
          unlocks: [this.getMasterUnlock(i)]
        },
        environment: {
          theme: 'master',
          backgroundColor: this.getMasterBackground(i),
          musicTrack: 'master_theme.mp3'
        }
      };
      
      this.levels.push(level);
    }
  }
  
  // Helper methods for generating content
  private generateRandomObstacles(count: number, types: string[], complex = false): any[] {
    const obstacles = [];
    const usedPositions = new Set<string>();
    
    for (let i = 0; i < count; i++) {
      let attempts = 0;
      let position;
      
      do {
        position = {
          x: Math.floor(Math.random() * 40) + 5,
          y: Math.floor(Math.random() * 20) + 5
        };
        attempts++;
      } while (usedPositions.has(`${position.x},${position.y}`) && attempts < 50);
      
      usedPositions.add(`${position.x},${position.y}`);
      
      const type = types[Math.floor(Math.random() * types.length)];
      const obstacle: any = {
        x: position.x,
        y: position.y,
        type,
        width: type === 'wall' ? Math.floor(Math.random() * 3) + 1 : 1,
        height: type === 'wall' ? Math.floor(Math.random() * 3) + 1 : 1
      };
      
      if (type === 'moving_wall' && complex) {
        obstacle.movePattern = this.generateMovePattern();
        obstacle.currentPatternIndex = 0;
      }
      
      obstacles.push(obstacle);
    }
    
    return obstacles;
  }
  
  private generateMovePattern(): any[] {
    const patterns = [
      [{x: 0, y: 1}, {x: 0, y: -1}], // Vertical
      [{x: 1, y: 0}, {x: -1, y: 0}], // Horizontal  
      [{x: 1, y: 1}, {x: -1, y: -1}], // Diagonal
      [{x: 1, y: 0}, {x: 0, y: 1}, {x: -1, y: 0}, {x: 0, y: -1}] // Square
    ];
    return patterns[Math.floor(Math.random() * patterns.length)];
  }
  
  private getBasicFoodWeights(): Record<FoodType, number> {
    return {
      [FoodType.APPLE]: 0.5,
      [FoodType.GOLDEN_APPLE]: 0.25,
      [FoodType.SPEED_BERRY]: 0.15,
      [FoodType.SHRINK_BERRY]: 0.05,
      [FoodType.MULTI_APPLE]: 0.05,
      [FoodType.POWER_PELLET]: 0,
      [FoodType.MYSTERY_FOOD]: 0,
      [FoodType.BOMB_FOOD]: 0,
      [FoodType.FREEZE_BERRY]: 0,
      [FoodType.COIN_FOOD]: 0
    };
  }
  
  private getIntermediateFoodWeights(level: number): Record<FoodType, number> {
    const bombChance = Math.max(0, (level - 30) * 0.01);
    return {
      [FoodType.APPLE]: 0.35,
      [FoodType.GOLDEN_APPLE]: 0.2,
      [FoodType.SPEED_BERRY]: 0.15,
      [FoodType.SHRINK_BERRY]: 0.1,
      [FoodType.MULTI_APPLE]: 0.1,
      [FoodType.POWER_PELLET]: 0.05,
      [FoodType.MYSTERY_FOOD]: 0.03,
      [FoodType.BOMB_FOOD]: bombChance,
      [FoodType.FREEZE_BERRY]: 0.02,
      [FoodType.COIN_FOOD]: level >= 40 ? 0.05 : 0
    };
  }
  
  private getAdvancedFoodWeights(level: number): Record<FoodType, number> {
    return {
      [FoodType.APPLE]: 0.25,
      [FoodType.GOLDEN_APPLE]: 0.2,
      [FoodType.SPEED_BERRY]: 0.15,
      [FoodType.SHRINK_BERRY]: 0.1,
      [FoodType.MULTI_APPLE]: 0.1,
      [FoodType.POWER_PELLET]: 0.08,
      [FoodType.MYSTERY_FOOD]: 0.05,
      [FoodType.BOMB_FOOD]: 0.03,
      [FoodType.FREEZE_BERRY]: 0.02,
      [FoodType.COIN_FOOD]: 0.02
    };
  }
  
  private getExpertFoodWeights(level: number): Record<FoodType, number> {
    return {
      [FoodType.APPLE]: 0.2,
      [FoodType.GOLDEN_APPLE]: 0.18,
      [FoodType.SPEED_BERRY]: 0.15,
      [FoodType.SHRINK_BERRY]: 0.12,
      [FoodType.MULTI_APPLE]: 0.12,
      [FoodType.POWER_PELLET]: 0.1,
      [FoodType.MYSTERY_FOOD]: 0.08,
      [FoodType.BOMB_FOOD]: 0.03,
      [FoodType.FREEZE_BERRY]: 0.01,
      [FoodType.COIN_FOOD]: 0.01
    };
  }
  
  private getMasterFoodWeights(level: number): Record<FoodType, number> {
    return {
      [FoodType.APPLE]: 0.15,
      [FoodType.GOLDEN_APPLE]: 0.15,
      [FoodType.SPEED_BERRY]: 0.15,
      [FoodType.SHRINK_BERRY]: 0.15,
      [FoodType.MULTI_APPLE]: 0.15,
      [FoodType.POWER_PELLET]: 0.1,
      [FoodType.MYSTERY_FOOD]: 0.1,
      [FoodType.BOMB_FOOD]: 0.03,
      [FoodType.FREEZE_BERRY]: 0.01,
      [FoodType.COIN_FOOD]: 0.01
    };
  }
  
  // Theme and visual helpers
  private getThemeName(level: number): string {
    if (level <= 30) return 'Forest';
    if (level <= 40) return 'Desert';
    return 'Mountain';
  }
  
  private getThemeForLevel(level: number): string {
    if (level <= 30) return 'forest';
    if (level <= 40) return 'desert';
    return 'mountain';
  }
  
  private getBackgroundForLevel(level: number): string {
    if (level <= 30) return '#1a2f1a';
    if (level <= 40) return '#2f2a1a';
    return '#1a1a2f';
  }
  
  private getAdvancedTheme(level: number): string {
    const themes = ['cyber', 'space', 'underwater', 'volcanic'];
    return themes[Math.floor((level - 51) / 12)];
  }
  
  private getAdvancedBackground(level: number): string {
    const backgrounds = ['#0a0a2a', '#2a0a2a', '#0a2a2a', '#2a2a0a'];
    return backgrounds[Math.floor((level - 51) / 12)];
  }
  
  private getExpertTheme(level: number): string {
    return 'expert_' + Math.floor((level - 101) / 10);
  }
  
  private getExpertBackground(level: number): string {
    const hue = (level - 101) * 12;
    return `hsl(${hue}, 80%, 10%)`;
  }
  
  private getMasterBackground(level: number): string {
    const colors = ['#000011', '#001100', '#110000', '#001111', '#110011', '#111100'];
    return colors[(level - 131) % colors.length];
  }
  
  // Special rules and unlocks
  private getSpecialRulesForLevel(level: number): LevelRule[] | undefined {
    if (level % 15 === 0) return [LevelRule.NO_WALLS];
    if (level % 17 === 0) return [LevelRule.DOUBLE_SPEED];
    if (level % 19 === 0) return [LevelRule.REVERSE_CONTROLS];
    return undefined;
  }
  
  private getExpertSpecialRules(level: number): LevelRule[] {
    const rules = [];
    if (level % 7 === 0) rules.push(LevelRule.INVISIBLE_TAIL);
    if (level % 11 === 0) rules.push(LevelRule.SHRINKING_ARENA);
    if (level % 13 === 0) rules.push(LevelRule.GROWING_TAIL);
    return rules;
  }
  
  private getMasterSpecialRules(level: number): LevelRule[] {
    const allRules = Object.values(LevelRule);
    const numRules = Math.min(3, Math.floor((level - 131) / 3) + 1);
    return allRules.slice(0, numRules);
  }
  
  private getUnlockForLevel(level: number): string {
    const unlocks = [
      'forest_theme', 'desert_theme', 'mountain_theme', 'cyber_theme',
      'rainbow_skin', 'metal_skin', 'glass_skin', 'fire_skin',
      'speed_boost', 'shield_power', 'multi_food', 'time_freeze'
    ];
    return unlocks[Math.floor(level / 10) % unlocks.length];
  }
  
  private getExpertUnlock(level: number): string {
    return `expert_unlock_${level - 100}`;
  }
  
  private getMasterUnlock(level: number): string {
    return `master_unlock_${level - 130}`;
  }
  
  // Public interface methods
  public getLevel(id: number): Level | undefined {
    return this.levels.find(level => level.id === id);
  }
  
  public getAllLevels(): Level[] {
    return [...this.levels];
  }
  
  public getLevelsByDifficulty(difficulty: number): Level[] {
    return this.levels.filter(level => level.difficulty === difficulty);
  }
  
  public getNextLevel(currentLevel: number): Level | undefined {
    return this.levels.find(level => level.id === currentLevel + 1);
  }
  
  public getLevelProgress(completedLevels: Set<number>): number {
    return completedLevels.size / this.levels.length;
  }
}