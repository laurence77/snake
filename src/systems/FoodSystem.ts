import { Food, FoodType, FoodEffect, Position } from '../types/GameTypes';

/**
 * Food System - Manages different types of food with special effects
 */
export class FoodSystem {
  private foods: Map<string, Food> = new Map();
  private foodEffects: Map<FoodType, FoodEffect> = new Map();
  private nextFoodId = 0;
  
  constructor() {
    this.initializeFoodEffects();
  }
  
  private initializeFoodEffects(): void {
    // Define effects for each food type
    this.foodEffects.set(FoodType.SPEED_BERRY, {
      type: 'speed',
      duration: 5000, // 5 seconds
      magnitude: 1.5   // 1.5x speed multiplier
    });
    
    this.foodEffects.set(FoodType.SHRINK_BERRY, {
      type: 'shrink',
      duration: 0, // Instant effect
      magnitude: 2  // Remove 2 segments
    });
    
    this.foodEffects.set(FoodType.POWER_PELLET, {
      type: 'invincible',
      duration: 8000, // 8 seconds
      magnitude: 1
    });
    
    this.foodEffects.set(FoodType.FREEZE_BERRY, {
      type: 'slow',
      duration: 3000, // 3 seconds
      magnitude: 0.3  // 30% of normal speed
    });
    
    this.foodEffects.set(FoodType.MULTI_APPLE, {
      type: 'multi',
      duration: 0, // Instant effect
      magnitude: 4  // Spawn 4 additional foods
    });
  }
  
  /**
   * Create a new food item at the specified position
   */
  public spawnFood(position: Position, type: FoodType = FoodType.APPLE): Food {
    const foodId = `food_${this.nextFoodId++}`;
    
    const food: Food = {
      x: position.x,
      y: position.y,
      type,
      value: this.getFoodValue(type),
      rarity: this.getFoodRarity(type),
      duration: this.getFoodDuration(type),
      effect: this.foodEffects.get(type)
    };
    
    this.foods.set(foodId, food);
    return food;
  }
  
  /**
   * Spawn multiple foods with weighted probability
   */
  public spawnFoodsWithWeights(
    position: Position, 
    typeWeights: Record<FoodType, number>
  ): Food[] {
    const selectedType = this.selectFoodTypeByWeight(typeWeights);
    const foods = [this.spawnFood(position, selectedType)];
    
    // Handle multi-apple spawning
    if (selectedType === FoodType.MULTI_APPLE) {
      const additionalCount = 3 + Math.floor(Math.random() * 3); // 3-5 additional
      for (let i = 0; i < additionalCount; i++) {
        const nearbyPosition = this.findNearbyPosition(position, 3);
        if (nearbyPosition) {
          foods.push(this.spawnFood(nearbyPosition, FoodType.APPLE));
        }
      }
    }
    
    return foods;
  }
  
  /**
   * Get food by ID
   */
  public getFood(foodId: string): Food | undefined {
    return this.foods.get(foodId);
  }
  
  /**
   * Remove food from the system
   */
  public removeFood(foodId: string): boolean {
    return this.foods.delete(foodId);
  }
  
  /**
   * Get all active foods
   */
  public getAllFoods(): Food[] {
    return Array.from(this.foods.values());
  }
  
  /**
   * Update food system (handle expiring foods, animations, etc.)
   */
  public update(deltaTime: number): void {
    const expiredFoods: string[] = [];
    
    for (const [foodId, food] of this.foods.entries()) {
      if (food.duration !== undefined && food.duration > 0) {
        food.duration -= deltaTime;
        if (food.duration <= 0) {
          expiredFoods.push(foodId);
        }
      }
    }
    
    // Remove expired foods
    expiredFoods.forEach(foodId => this.removeFood(foodId));
  }
  
  /**
   * Handle food consumption and return effects
   */
  public consumeFood(foodId: string): { points: number; effect?: FoodEffect; coins?: number } {
    const food = this.foods.get(foodId);
    if (!food) {
      return { points: 0 };
    }
    
    this.removeFood(foodId);
    
    const result: { points: number; effect?: FoodEffect; coins?: number } = {
      points: food.value
    };
    
    if (food.effect) {
      result.effect = { ...food.effect };
    }
    
    // Handle special food types
    switch (food.type) {
      case FoodType.COIN_FOOD:
        result.coins = 5 + Math.floor(Math.random() * 10); // 5-15 coins
        result.points = 0; // Coin food doesn't give points
        break;
        
      case FoodType.MYSTERY_FOOD:
        result.effect = this.getRandomMysteryEffect();
        break;
        
      case FoodType.BOMB_FOOD:
        // Bomb food is dangerous - should be handled by game logic
        result.points = -100;
        break;
    }
    
    return result;
  }
  
  /**
   * Clear all foods from the system
   */
  public clearAllFoods(): void {
    this.foods.clear();
  }
  
  /**
   * Get food count by type
   */
  public getFoodCountByType(type: FoodType): number {
    return Array.from(this.foods.values()).filter(food => food.type === type).length;
  }
  
  /**
   * Check if position is occupied by food
   */
  public isFoodAtPosition(position: Position): boolean {
    return Array.from(this.foods.values()).some(
      food => food.x === position.x && food.y === position.y
    );
  }
  
  /**
   * Get food at specific position
   */
  public getFoodAtPosition(position: Position): Food | undefined {
    return Array.from(this.foods.values()).find(
      food => food.x === position.x && food.y === position.y
    );
  }
  
  /**
   * Get the internal food ID at a specific position
   */
  public getFoodIdAtPosition(position: Position): string | undefined {
    for (const [id, food] of this.foods.entries()) {
      if (food.x === position.x && food.y === position.y) return id;
    }
    return undefined;
  }
  
  // Private helper methods
  
  private getFoodValue(type: FoodType): number {
    const values: Record<FoodType, number> = {
      [FoodType.APPLE]: 10,
      [FoodType.GOLDEN_APPLE]: 50,
      [FoodType.SPEED_BERRY]: 20,
      [FoodType.SHRINK_BERRY]: 30,
      [FoodType.MULTI_APPLE]: 25,
      [FoodType.POWER_PELLET]: 100,
      [FoodType.MYSTERY_FOOD]: 75,
      [FoodType.BOMB_FOOD]: -100,
      [FoodType.FREEZE_BERRY]: 40,
      [FoodType.COIN_FOOD]: 0
    };
    return values[type] || 10;
  }
  
  private getFoodRarity(type: FoodType): number {
    const rarities: Record<FoodType, number> = {
      [FoodType.APPLE]: 1.0,
      [FoodType.GOLDEN_APPLE]: 0.3,
      [FoodType.SPEED_BERRY]: 0.2,
      [FoodType.SHRINK_BERRY]: 0.15,
      [FoodType.MULTI_APPLE]: 0.1,
      [FoodType.POWER_PELLET]: 0.05,
      [FoodType.MYSTERY_FOOD]: 0.03,
      [FoodType.BOMB_FOOD]: 0.02,
      [FoodType.FREEZE_BERRY]: 0.08,
      [FoodType.COIN_FOOD]: 0.12
    };
    return rarities[type] || 1.0;
  }
  
  private getFoodDuration(type: FoodType): number | undefined {
    const durations: Record<FoodType, number | undefined> = {
      [FoodType.APPLE]: undefined, // Permanent
      [FoodType.GOLDEN_APPLE]: 15000, // 15 seconds
      [FoodType.SPEED_BERRY]: 12000,  // 12 seconds
      [FoodType.SHRINK_BERRY]: 10000, // 10 seconds
      [FoodType.MULTI_APPLE]: 8000,   // 8 seconds
      [FoodType.POWER_PELLET]: 20000, // 20 seconds
      [FoodType.MYSTERY_FOOD]: 6000,  // 6 seconds
      [FoodType.BOMB_FOOD]: 5000,     // 5 seconds (very dangerous!)
      [FoodType.FREEZE_BERRY]: 8000,  // 8 seconds
      [FoodType.COIN_FOOD]: undefined // Permanent
    };
    return durations[type];
  }
  
  private selectFoodTypeByWeight(typeWeights: Record<FoodType, number>): FoodType {
    const totalWeight = Object.values(typeWeights).reduce((sum, weight) => sum + weight, 0);
    let random = Math.random() * totalWeight;
    
    for (const [type, weight] of Object.entries(typeWeights)) {
      random -= weight;
      if (random <= 0) {
        return type as FoodType;
      }
    }
    
    return FoodType.APPLE; // Fallback
  }
  
  private findNearbyPosition(center: Position, maxDistance: number): Position | null {
    const attempts = 20;
    
    for (let i = 0; i < attempts; i++) {
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * maxDistance + 1;
      
      const position = {
        x: Math.round(center.x + Math.cos(angle) * distance),
        y: Math.round(center.y + Math.sin(angle) * distance)
      };
      
      // Basic bounds checking (would need to be adjusted based on game bounds)
      if (position.x >= 0 && position.x < 48 && position.y >= 0 && position.y < 27) {
        return position;
      }
    }
    
    return null;
  }
  
  private getRandomMysteryEffect(): FoodEffect {
    const effects: FoodEffect[] = [
      { type: 'speed', duration: 3000, magnitude: 2.0 },
      { type: 'slow', duration: 2000, magnitude: 0.5 },
      { type: 'invincible', duration: 4000, magnitude: 1 },
      { type: 'reverse', duration: 5000, magnitude: 1 },
      { type: 'shrink', duration: 0, magnitude: 1 },
      { type: 'multi', duration: 0, magnitude: 2 }
    ];
    
    return effects[Math.floor(Math.random() * effects.length)];
  }
  
  /**
   * Get visual properties for food rendering
   */
  public getFoodVisualProperties(type: FoodType): {
    color: number;
    size: number;
    glow?: boolean;
    animation?: string;
  } {
    const properties: Record<FoodType, any> = {
      [FoodType.APPLE]: { color: 0xff4444, size: 1.0 },
      [FoodType.GOLDEN_APPLE]: { color: 0xffd700, size: 1.2, glow: true },
      [FoodType.SPEED_BERRY]: { color: 0x00ffff, size: 0.9, animation: 'pulse' },
      [FoodType.SHRINK_BERRY]: { color: 0xff00ff, size: 0.8, animation: 'shrink' },
      [FoodType.MULTI_APPLE]: { color: 0x00ff00, size: 1.1, animation: 'split' },
      [FoodType.POWER_PELLET]: { color: 0xffff00, size: 1.3, glow: true, animation: 'power' },
      [FoodType.MYSTERY_FOOD]: { color: 0x8000ff, size: 1.0, animation: 'mystery' },
      [FoodType.BOMB_FOOD]: { color: 0x800000, size: 1.0, animation: 'danger' },
      [FoodType.FREEZE_BERRY]: { color: 0x87ceeb, size: 0.9, animation: 'freeze' },
      [FoodType.COIN_FOOD]: { color: 0xffa500, size: 0.8, glow: true, animation: 'coin' }
    };
    
    return properties[type] || properties[FoodType.APPLE];
  }
  
  /**
   * Get food type name for UI display
   */
  public getFoodTypeName(type: FoodType): string {
    const names: Record<FoodType, string> = {
      [FoodType.APPLE]: 'Apple',
      [FoodType.GOLDEN_APPLE]: 'Golden Apple',
      [FoodType.SPEED_BERRY]: 'Speed Berry',
      [FoodType.SHRINK_BERRY]: 'Shrink Berry',
      [FoodType.MULTI_APPLE]: 'Multi Apple',
      [FoodType.POWER_PELLET]: 'Power Pellet',
      [FoodType.MYSTERY_FOOD]: 'Mystery Food',
      [FoodType.BOMB_FOOD]: 'Bomb Food',
      [FoodType.FREEZE_BERRY]: 'Freeze Berry',
      [FoodType.COIN_FOOD]: 'Coin Food'
    };
    return names[type] || 'Unknown Food';
  }
  
  /**
   * Get food description for UI
   */
  public getFoodDescription(type: FoodType): string {
    const descriptions: Record<FoodType, string> = {
      [FoodType.APPLE]: 'Basic food that grows your snake by 1 segment',
      [FoodType.GOLDEN_APPLE]: 'Valuable food worth 5x points',
      [FoodType.SPEED_BERRY]: 'Temporarily increases snake speed',
      [FoodType.SHRINK_BERRY]: 'Reduces snake size by 1-2 segments',
      [FoodType.MULTI_APPLE]: 'Spawns multiple food items nearby',
      [FoodType.POWER_PELLET]: 'Grants temporary invincibility',
      [FoodType.MYSTERY_FOOD]: 'Has a random special effect',
      [FoodType.BOMB_FOOD]: 'Dangerous! Avoid at all costs',
      [FoodType.FREEZE_BERRY]: 'Slows down obstacle movement',
      [FoodType.COIN_FOOD]: 'Gives coins but no points or growth'
    };
    return descriptions[type] || 'Unknown food item';
  }
}
