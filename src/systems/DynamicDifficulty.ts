/**
 * Advanced Dynamic Difficulty Adjustment for Snake Game
 * Based on Flow Theory and 2024 research in adaptive game mechanics
 */
export class DynamicDifficultyAdjuster {
  private playerMetrics: {
    score: number;
    gameTime: number;
    foodCollected: number;
    nearMissCount: number;
    averageReactionTime: number;
    consecutiveSuccesses: number;
    consecutiveFailures: number;
    skillLevel: number;
  } = {
    score: 0,
    gameTime: 0,
    foodCollected: 0,
    nearMissCount: 0,
    averageReactionTime: 200,
    consecutiveSuccesses: 0,
    consecutiveFailures: 0,
    skillLevel: 1
  };
  
  private difficultySettings = {
    speed: 0.12, // seconds per move
    foodSpawnRate: 1.0,
    obstacleCount: 0,
    powerUpChance: 0.1,
    bonusMultiplier: 1.0
  };
  
  // Flow theory constants
  private readonly OPTIMAL_SUCCESS_RATE = 0.75;
  private readonly CHALLENGE_ADJUSTMENT_RATE = 0.1;
  private readonly MIN_SPEED = 0.20;
  private readonly MAX_SPEED = 0.05;
  
  private reactionTimes: number[] = [];
  private lastInputTime = 0;
  
  /**
   * Update player metrics and adjust difficulty
   */
  update(gameTime: number): void {
    this.playerMetrics.gameTime = gameTime;
    
    // Calculate skill level based on multiple factors
    this.calculateSkillLevel();
    
    // Adjust difficulty to maintain flow state
    this.adjustDifficulty();
  }
  
  /**
   * Record food collection event
   */
  recordFoodCollection(reactionTime: number): void {
    this.playerMetrics.foodCollected++;
    this.playerMetrics.score += Math.floor(100 * this.difficultySettings.bonusMultiplier);
    this.playerMetrics.consecutiveSuccesses++;
    this.playerMetrics.consecutiveFailures = 0;
    
    // Track reaction time
    this.reactionTimes.push(reactionTime);
    if (this.reactionTimes.length > 10) {
      this.reactionTimes.shift();
    }
    
    this.playerMetrics.averageReactionTime = 
      this.reactionTimes.reduce((a, b) => a + b, 0) / this.reactionTimes.length;
  }
  
  /**
   * Record near-miss event (close call with walls/self)
   */
  recordNearMiss(): void {
    this.playerMetrics.nearMissCount++;
  }
  
  /**
   * Record game over event
   */
  recordGameOver(): void {
    this.playerMetrics.consecutiveFailures++;
    this.playerMetrics.consecutiveSuccesses = 0;
  }
  
  /**
   * Calculate current skill level
   */
  private calculateSkillLevel(): void {
    const baseSkill = Math.max(1, this.playerMetrics.foodCollected / 5);
    const reactionBonus = Math.max(0, (300 - this.playerMetrics.averageReactionTime) / 100);
    const consistencyBonus = this.playerMetrics.consecutiveSuccesses * 0.1;
    const timeBonus = Math.min(2, this.playerMetrics.gameTime / 30000); // Max 2 bonus for 30+ seconds
    
    this.playerMetrics.skillLevel = baseSkill + reactionBonus + consistencyBonus + timeBonus;
  }
  
  /**
   * Adjust difficulty based on current flow state
   */
  private adjustDifficulty(): void {
    const currentSuccessRate = this.calculateSuccessRate();
    const skillFactor = Math.max(0.5, Math.min(2, this.playerMetrics.skillLevel / 3));
    
    // Adjust speed based on skill and success rate
    if (currentSuccessRate > this.OPTIMAL_SUCCESS_RATE + 0.1) {
      // Player is doing too well, increase challenge
      this.difficultySettings.speed = Math.max(
        this.MAX_SPEED,
        this.difficultySettings.speed - (this.CHALLENGE_ADJUSTMENT_RATE * skillFactor)
      );
      this.difficultySettings.bonusMultiplier = Math.min(2, this.difficultySettings.bonusMultiplier + 0.1);
    } else if (currentSuccessRate < this.OPTIMAL_SUCCESS_RATE - 0.15) {
      // Player is struggling, reduce challenge
      this.difficultySettings.speed = Math.min(
        this.MIN_SPEED,
        this.difficultySettings.speed + (this.CHALLENGE_ADJUSTMENT_RATE * 0.5)
      );
      this.difficultySettings.bonusMultiplier = Math.max(0.5, this.difficultySettings.bonusMultiplier - 0.05);
    }
    
    // Adjust other difficulty parameters
    this.adjustSecondaryParameters();
  }
  
  /**
   * Calculate current success rate
   */
  private calculateSuccessRate(): number {
    const totalAttempts = this.playerMetrics.consecutiveSuccesses + this.playerMetrics.consecutiveFailures;
    if (totalAttempts === 0) return 0.5;
    
    return this.playerMetrics.consecutiveSuccesses / totalAttempts;
  }
  
  /**
   * Adjust secondary difficulty parameters
   */
  private adjustSecondaryParameters(): void {
    const skillLevel = this.playerMetrics.skillLevel;
    
    // Adjust power-up spawn chance based on performance
    if (this.playerMetrics.consecutiveFailures > 2) {
      this.difficultySettings.powerUpChance = Math.min(0.3, this.difficultySettings.powerUpChance + 0.05);
    } else if (this.playerMetrics.consecutiveSuccesses > 5) {
      this.difficultySettings.powerUpChance = Math.max(0.05, this.difficultySettings.powerUpChance - 0.02);
    }
    
    // Dynamic food spawn rate
    this.difficultySettings.foodSpawnRate = Math.max(0.5, Math.min(1.5, 
      1 + (skillLevel - 3) * 0.1
    ));
  }
  
  /**
   * Get current difficulty settings
   */
  getDifficultySettings() {
    return { ...this.difficultySettings };
  }
  
  /**
   * Get player performance metrics
   */
  getPlayerMetrics() {
    return { ...this.playerMetrics };
  }
  
  /**
   * Get current difficulty level description
   */
  getDifficultyLevel(): 'Beginner' | 'Easy' | 'Medium' | 'Hard' | 'Expert' | 'Master' {
    const speed = this.difficultySettings.speed;
    
    if (speed >= 0.18) return 'Beginner';
    if (speed >= 0.15) return 'Easy';
    if (speed >= 0.12) return 'Medium';
    if (speed >= 0.09) return 'Hard';
    if (speed >= 0.07) return 'Expert';
    return 'Master';
  }
  
  /**
   * Reset metrics for new game
   */
  reset(): void {
    this.playerMetrics = {
      score: 0,
      gameTime: 0,
      foodCollected: 0,
      nearMissCount: 0,
      averageReactionTime: 200,
      consecutiveSuccesses: 0,
      consecutiveFailures: 0,
      skillLevel: 1
    };
    
    // Maintain some difficulty progression between games
    this.difficultySettings.speed = Math.min(0.12, this.difficultySettings.speed + 0.01);
    this.difficultySettings.powerUpChance = 0.1;
    this.difficultySettings.bonusMultiplier = 1.0;
    
    this.reactionTimes = [];
  }
  
  /**
   * Get adaptive suggestions for the player
   */
  getAdaptiveFeedback(): string[] {
    const feedback: string[] = [];
    const metrics = this.playerMetrics;
    
    if (metrics.averageReactionTime > 300) {
      feedback.push("Try to react faster to direction changes");
    }
    
    if (metrics.nearMissCount > 3) {
      feedback.push("Great reflexes! You're getting better at close calls");
    }
    
    if (metrics.consecutiveSuccesses > 10) {
      feedback.push("Excellent streak! Challenge level increased");
    }
    
    if (metrics.skillLevel > 5) {
      feedback.push("You're becoming a Snake master!");
    }
    
    return feedback;
  }
}