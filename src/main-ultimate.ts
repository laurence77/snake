import Phaser from "phaser";
import { WIDTH, HEIGHT } from "./helpers";
import { MenuScene } from "./scenes/MenuScene";
import { StoreScene } from "./scenes/StoreScene";
import { SettingsScene } from "./scenes/SettingsScene";
import { LevelSystem } from "./systems/LevelSystem";
import { FoodSystem } from "./systems/FoodSystem";
import { SoundManager } from "./systems/SoundManager";
import { AnimationManager } from "./systems/AnimationManager";
import { GameState, Level, FoodType, Position, SnakeSegment, Obstacle, FoodEffect } from "./types/GameTypes";

const TILE = 20;
const COLS = Math.floor(WIDTH / TILE);
const ROWS = Math.floor(HEIGHT / TILE);

/**
 * Ultimate Snake Game Scene with all enhancements
 */
class UltimateSnakeScene extends Phaser.Scene {
  // Core game systems
  private levelSystem!: LevelSystem;
  private foodSystem!: FoodSystem;
  private soundManager!: SoundManager;
  private animationManager!: AnimationManager;
  
  // Game state
  private gameState!: GameState;
  private currentLevel!: Level;
  private levelNumber: number = 1;
  
  // Snake and movement
  private dir = { x: 1, y: 0 };
  private nextDir = { x: 1, y: 0 };
  private snake: SnakeSegment[] = [{ x: 5, y: 5 }, { x: 4, y: 5 }, { x: 3, y: 5 }];
  private acc = 0;
  private baseStep = 0.12;
  private step = 0.12;
  
  // Game mechanics
  private score = 0;
  private lives = 3;
  private gameOver = false;
  private levelCompleted = false;
  private paused = false;
  private coins = 0;
  
  // Active effects
  private activeEffects: Map<string, { effect: FoodEffect; timeLeft: number }> = new Map();
  private invincible = false;
  private speedMultiplier = 1;
  
  // Level obstacles
  private obstacles: Obstacle[] = [];
  
  // UI Elements
  private scoreText!: Phaser.GameObjects.Text;
  private livesText!: Phaser.GameObjects.Text;
  private levelText!: Phaser.GameObjects.Text;
  private coinsText!: Phaser.GameObjects.Text;
  private effectsContainer!: Phaser.GameObjects.Container;
  private comboText!: Phaser.GameObjects.Text;
  private livesBadge!: Phaser.GameObjects.Text;
  
  // Combo/bonus system
  private comboCount: number = 0;
  private comboTimeLeft: number = 0; // ms remaining to continue combo
  private readonly comboWindow: number = 2200; // ms window between foods (tweakable)
  private maxCombo: number = 1;
  private readonly comboMilestones: number[] = [5, 10];
  
  // Visual elements
  private graphics!: Phaser.GameObjects.Graphics;
  private backgroundGraphics!: Phaser.GameObjects.Graphics;
  
  constructor() {
    super({ key: 'UltimateSnakeScene' });
  }
  
  init(data: { levelNumber?: number; gameState?: GameState }) {
    this.levelNumber = data.levelNumber || 1;
    this.gameState = data.gameState || this.createDefaultGameState();
    this.initializeSystems();
    this.loadLevel();
  }
  
  private initializeSystems(): void {
    this.levelSystem = new LevelSystem();
    this.foodSystem = new FoodSystem();
    this.soundManager = new SoundManager(this);
    this.animationManager = new AnimationManager(this);
  }
  
  private loadLevel(): void {
    const level = this.levelSystem.getLevel(this.levelNumber);
    if (!level) {
      console.error(`Level ${this.levelNumber} not found!`);
      return;
    }
    
    this.currentLevel = level;
    this.obstacles = [...level.obstacles];
    this.step = this.baseStep;
    this.score = 0;
    // Lives behavior: reset or persist across levels based on settings
    const persistLives = this.gameState?.settings?.persistLives === true;
    if (!persistLives) {
      this.lives = 3;
      if (this.gameState) this.gameState.lives = 3;
    } else {
      // Keep current lives; ensure valid fallback
      if (this.lives <= 0) this.lives = 3;
      if (this.gameState && this.gameState.lives <= 0) this.gameState.lives = this.lives;
    }
    this.gameOver = false;
    this.levelCompleted = false;
    this.paused = false;
    this.activeEffects.clear();
    this.invincible = false;
    this.speedMultiplier = 1;
    
    // Reset snake position
    this.snake = [{ x: 5, y: 5 }, { x: 4, y: 5 }, { x: 3, y: 5 }];
    this.dir = { x: 1, y: 0 };
    this.nextDir = { x: 1, y: 0 };
    
    // Clear existing foods
    this.foodSystem.clearAllFoods();
    
    // Spawn initial food
    this.spawnFood();
  }
  
  create() {
    this.createBackground();
    this.createUI();
    this.setupInput();
    this.createVisualElements();
    
    // Show a small prompt to enable audio to comply with autoplay policy
    const audioOverlay = this.add.container(0, 0);
    const g = this.add.graphics();
    g.fillStyle(0x000000, 0.5);
    g.fillRect(0, 0, WIDTH, HEIGHT);
    const prompt = this.add.text(WIDTH / 2, HEIGHT - 60, 'Tap to enable audio', {
      fontSize: '16px',
      fontFamily: 'Arial, sans-serif',
      color: '#ffff00',
      backgroundColor: '#000000',
      padding: { x: 8, y: 4 }
    }).setOrigin(0.5);
    audioOverlay.add([g, prompt]);
    
    const enableAudio = () => {
      audioOverlay.destroy();
      // Unlock Phaser sound manager if locked (Chrome autoplay policy)
      if ((this.sound as any).locked) {
        (this.sound as any).unlock();
      }
      this.soundManager.playMusic('game_theme');
    };
    this.input.once('pointerdown', enableAudio);
    this.input.keyboard?.once('keydown', enableAudio);
    
    // Show level intro
    this.showLevelIntro();
  }
  
  private createBackground(): void {
    this.backgroundGraphics = this.add.graphics();
    this.updateBackground();
  }
  
  private updateBackground(): void {
    this.backgroundGraphics.clear();
    
    // Theme-based background
    const theme = this.currentLevel.environment.theme;
    const bgColor = this.currentLevel.environment.backgroundColor;
    
    this.backgroundGraphics.fillStyle(parseInt(bgColor.replace('#', '0x')));
    this.backgroundGraphics.fillRect(0, 0, WIDTH, HEIGHT);
    
    // Add theme-specific decorations
    this.addThemeDecorations(theme);
  }
  
  private addThemeDecorations(theme: string): void {
    switch (theme) {
      case 'forest':
        // Add tree sprites or patterns
        this.createForestDecorations();
        break;
      case 'desert':
        this.createDesertDecorations();
        break;
      case 'space':
        this.createSpaceDecorations();
        break;
      case 'cyber':
        this.createCyberDecorations();
        break;
    }
  }
  
  private createForestDecorations(): void {
    // Add subtle forest elements
    for (let i = 0; i < 10; i++) {
      const x = Math.random() * WIDTH;
      const y = Math.random() * HEIGHT;
      this.backgroundGraphics.fillStyle(0x0d4f1c, 0.3);
      this.backgroundGraphics.fillCircle(x, y, Math.random() * 15 + 5);
    }
  }
  
  private createDesertDecorations(): void {
    // Add sand dune patterns
    for (let i = 0; i < 5; i++) {
      const x = Math.random() * WIDTH;
      const y = HEIGHT - Math.random() * 100;
      this.backgroundGraphics.fillStyle(0x8b4513, 0.2);
      this.backgroundGraphics.fillEllipse(x, y, 100, 30);
    }
  }
  
  private createSpaceDecorations(): void {
    // Add stars
    for (let i = 0; i < 50; i++) {
      const x = Math.random() * WIDTH;
      const y = Math.random() * HEIGHT;
      this.backgroundGraphics.fillStyle(0xffffff, Math.random() * 0.8 + 0.2);
      this.backgroundGraphics.fillCircle(x, y, 1);
    }
  }
  
  private createCyberDecorations(): void {
    // Add grid lines
    this.backgroundGraphics.lineStyle(1, 0x00ff00, 0.3);
    for (let x = 0; x < WIDTH; x += 40) {
      this.backgroundGraphics.lineBetween(x, 0, x, HEIGHT);
    }
    for (let y = 0; y < HEIGHT; y += 40) {
      this.backgroundGraphics.lineBetween(0, y, WIDTH, y);
    }
  }

  private createUI(): void {
    // Score display
    this.scoreText = this.add.text(10, 10, `Score: ${this.score}`, {
      fontSize: '18px',
      fontFamily: 'Arial, sans-serif',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 8, y: 4 }
    });
    
    // Lives display
    this.livesText = this.add.text(10, 40, `Lives: ${this.lives}`, {
      fontSize: '16px',
      fontFamily: 'Arial, sans-serif',
      color: '#ff4444',
      backgroundColor: '#000000',
      padding: { x: 8, y: 4 }
    });
    // Lives behavior badge beneath lives
    const persistLivesHUD = this.gameState?.settings?.persistLives === true;
    this.livesBadge = this.add.text(10, 62, `(${persistLivesHUD ? 'Persist' : 'Reset'})`, {
      fontSize: '12px',
      fontFamily: 'Arial, sans-serif',
      color: '#fbbf24',
      backgroundColor: '#000000',
      padding: { x: 6, y: 2 }
    });
    
    // Level display
    this.levelText = this.add.text(WIDTH - 10, 10, `Level: ${this.levelNumber}`, {
      fontSize: '16px',
      fontFamily: 'Arial, sans-serif',
      color: '#00ff00',
      backgroundColor: '#000000',
      padding: { x: 8, y: 4 }
    }).setOrigin(1, 0);
    
    // Coins display
    this.coinsText = this.add.text(WIDTH - 10, 40, `Coins: ${this.coins}`, {
      fontSize: '16px',
      fontFamily: 'Arial, sans-serif',
      color: '#ffd700',
      backgroundColor: '#000000',
      padding: { x: 8, y: 4 }
    }).setOrigin(1, 0);
    
    // Active effects container
    this.effectsContainer = this.add.container(10, 70);
    
    // Combo indicator (hidden until active)
    this.comboText = this.add.text(WIDTH / 2, 40, '', {
      fontSize: '20px',
      fontFamily: 'Arial, sans-serif',
      color: '#fbbf24',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5, 0);
    this.comboText.setVisible(false);
    
    // Add target score if level has one
    if (this.currentLevel.targetScore) {
      this.add.text(WIDTH / 2, 10, `Target: ${this.currentLevel.targetScore}`, {
        fontSize: '16px',
        fontFamily: 'Arial, sans-serif',
        color: '#ffff00',
        backgroundColor: '#000000',
        padding: { x: 8, y: 4 }
      }).setOrigin(0.5, 0);
    }
  }
  
  private setupInput(): void {
    // Keyboard input
    this.input.keyboard.on('keydown', (event: KeyboardEvent) => {
      this.handleKeyInput(event.key);
    });
    
    // Touch/swipe input for mobile
    this.input.on('pointerdown', this.handleTouchStart, this);
    this.input.on('pointerup', this.handleTouchEnd, this);
    
    // Pause functionality
    this.input.keyboard.on('keydown-ESC', () => {
      this.togglePause();
    });
  }
  
  private handleKeyInput(key: string): void {
    if (this.gameOver || this.paused) return;
    
    switch (key) {
      case 'ArrowUp':
      case 'w':
      case 'W':
        if (this.dir.y === 0) this.nextDir = { x: 0, y: -1 };
        break;
      case 'ArrowDown':
      case 's':
      case 'S':
        if (this.dir.y === 0) this.nextDir = { x: 0, y: 1 };
        break;
      case 'ArrowLeft':
      case 'a':
      case 'A':
        if (this.dir.x === 0) this.nextDir = { x: -1, y: 0 };
        break;
      case 'ArrowRight':
      case 'd':
      case 'D':
        if (this.dir.x === 0) this.nextDir = { x: 1, y: 0 };
        break;
    }
  }
  
  private handleTouchStart(pointer: Phaser.Input.Pointer): void {
    if (this.gameOver || this.paused) return;
    this.touchStartPos = { x: pointer.x, y: pointer.y };
  }
  
  private touchStartPos?: Position;
  
  private handleTouchEnd(pointer: Phaser.Input.Pointer): void {
    if (!this.touchStartPos || this.gameOver || this.paused) return;
    
    const deltaX = pointer.x - this.touchStartPos.x;
    const deltaY = pointer.y - this.touchStartPos.y;
    const minSwipeDistance = 30;
    
    if (Math.abs(deltaX) > minSwipeDistance || Math.abs(deltaY) > minSwipeDistance) {
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        // Horizontal swipe
        if (deltaX > 0 && this.dir.x === 0) {
          this.nextDir = { x: 1, y: 0 }; // Right
        } else if (deltaX < 0 && this.dir.x === 0) {
          this.nextDir = { x: -1, y: 0 }; // Left
        }
      } else {
        // Vertical swipe
        if (deltaY > 0 && this.dir.y === 0) {
          this.nextDir = { x: 0, y: 1 }; // Down
        } else if (deltaY < 0 && this.dir.y === 0) {
          this.nextDir = { x: 0, y: -1 }; // Up
        }
      }
    }
    
    this.touchStartPos = undefined;
  }
  
  private createVisualElements(): void {
    this.graphics = this.add.graphics();
  }
  
  private showLevelIntro(): void {
    const introText = this.add.text(
      WIDTH / 2,
      HEIGHT / 2,
      `${this.currentLevel.name}\nDifficulty: ${'★'.repeat(this.currentLevel.difficulty)}`,
      {
        fontSize: '32px',
        fontFamily: 'Arial, sans-serif',
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 3,
        align: 'center',
        fontStyle: 'bold'
      }
    ).setOrigin(0.5);
    
    // Lives behavior indicator
    const persistLives = this.gameState?.settings?.persistLives === true;
    const livesBehavior = persistLives ? 'Persisting Across Levels' : 'Reset Each Level';
    const livesText = this.add.text(
      WIDTH / 2,
      HEIGHT / 2 + 40,
      `Lives: ${livesBehavior}`,
      {
        fontSize: '18px',
        fontFamily: 'Arial, sans-serif',
        color: '#fbbf24',
        stroke: '#000000',
        strokeThickness: 2,
        align: 'center'
      }
    ).setOrigin(0.5);
    
    this.tweens.add({
      targets: introText,
      alpha: 0,
      duration: 3000,
      ease: 'Quad.easeOut',
      onComplete: () => introText.destroy()
    });
    this.tweens.add({
      targets: livesText,
      alpha: 0,
      duration: 3000,
      ease: 'Quad.easeOut',
      onComplete: () => livesText.destroy()
    });
    
    // Show special rules if any
    if (this.currentLevel.specialRules && this.currentLevel.specialRules.length > 0) {
      const rulesText = this.add.text(
        WIDTH / 2,
        HEIGHT / 2 + 80,
        `Special Rule: ${this.formatSpecialRule(this.currentLevel.specialRules[0])}`,
        {
          fontSize: '18px',
          fontFamily: 'Arial, sans-serif',
          color: '#ffff00',
          stroke: '#000000',
          strokeThickness: 2,
          align: 'center'
        }
      ).setOrigin(0.5);
      
      this.tweens.add({
        targets: rulesText,
        alpha: 0,
        duration: 3000,
        delay: 1000,
        ease: 'Quad.easeOut',
        onComplete: () => rulesText.destroy()
      });
    }
  }
  
  private formatSpecialRule(rule: string): string {
    const ruleNames: Record<string, string> = {
      no_walls: 'Snake wraps around edges',
      double_speed: 'Double speed mode',
      invisible_tail: 'Invisible tail',
      reverse_controls: 'Reversed controls',
      shrinking_arena: 'Shrinking play area',
      growing_tail: 'Continuous growth',
      mirrored: 'Mirrored movement'
    };
    return ruleNames[rule] || rule;
  }
  
  update(time: number, deltaTime: number): void {
    if (this.gameOver || this.paused || this.levelCompleted) return;
    
    // Update active effects
    this.updateActiveEffects(deltaTime);
    
    // Update food system
    this.foodSystem.update(deltaTime);
    
    // Update movement
    this.updateMovement(deltaTime);
    
    // Update obstacles
    this.updateObstacles(deltaTime);
    
    // Check for food spawning
    this.checkFoodSpawning();
    
    // Update UI
    this.updateUI();
    
    // Draw everything
    this.draw();
  }
  
  private updateActiveEffects(deltaTime: number): void {
    const effectsToRemove: string[] = [];
    
    this.activeEffects.forEach((effectData, effectId) => {
      effectData.timeLeft -= deltaTime;
      
      if (effectData.timeLeft <= 0) {
        this.removeEffect(effectId, effectData.effect);
        effectsToRemove.push(effectId);
      }
    });
    
    effectsToRemove.forEach(id => this.activeEffects.delete(id));
    
    this.updateEffectsDisplay();

    // Combo timer
    if (this.comboCount > 0) {
      this.comboTimeLeft -= deltaTime;
      if (this.comboTimeLeft <= 0) {
        this.comboCount = 0;
        this.comboTimeLeft = 0;
      }
    }
  }
  
  private removeEffect(effectId: string, effect: FoodEffect): void {
    switch (effect.type) {
      case 'speed':
        this.speedMultiplier = 1;
        this.step = this.baseStep;
        break;
      case 'slow':
        this.speedMultiplier = 1;
        this.step = this.baseStep;
        break;
      case 'invincible':
        this.invincible = false;
        break;
    }
  }
  
  private updateEffectsDisplay(): void {
    this.effectsContainer.removeAll(true);
    
    let yOffset = 0;
    this.activeEffects.forEach((effectData, effectId) => {
      const effectText = this.add.text(
        0, yOffset,
        `${this.getEffectName(effectData.effect.type)}: ${Math.ceil(effectData.timeLeft / 1000)}s`,
        {
          fontSize: '14px',
          fontFamily: 'Arial, sans-serif',
          color: this.getEffectColor(effectData.effect.type),
          backgroundColor: '#000000',
          padding: { x: 6, y: 2 }
        }
      );
      
      this.effectsContainer.add(effectText);
      yOffset += 20;
    });
  }
  
  private getEffectName(type: string): string {
    const names: Record<string, string> = {
      speed: 'Speed Boost',
      slow: 'Slowdown',
      invincible: 'Invincible',
      reverse: 'Reversed',
      shrink: 'Shrinking',
      multi: 'Multi Food'
    };
    return names[type] || type;
  }
  
  private getEffectColor(type: string): string {
    const colors: Record<string, string> = {
      speed: '#00ffff',
      slow: '#ff6600',
      invincible: '#ffff00',
      reverse: '#ff00ff',
      shrink: '#ff0000',
      multi: '#00ff00'
    };
    return colors[type] || '#ffffff';
  }
  
  private updateMovement(deltaTime: number): void {
    this.acc += deltaTime / 1000;
    
    const currentStep = this.step / this.speedMultiplier;
    
    if (this.acc < currentStep) return;
    this.acc = 0;
    
    // Apply direction change
    this.dir = { ...this.nextDir };
    
    // Move snake
    const head = this.snake[0];
    let newHead = {
      x: head.x + this.dir.x,
      y: head.y + this.dir.y
    };
    
    // Handle special rules
    if (this.currentLevel.specialRules?.includes('no_walls')) {
      // Wrap around edges
      if (newHead.x < 0) newHead.x = COLS - 1;
      if (newHead.x >= COLS) newHead.x = 0;
      if (newHead.y < 0) newHead.y = ROWS - 1;
      if (newHead.y >= ROWS) newHead.y = 0;
    } else {
      // Normal wall collision
      if (newHead.x < 0 || newHead.x >= COLS || newHead.y < 0 || newHead.y >= ROWS) {
        this.handleCollision('wall');
        return;
      }
    }
    
    // Check obstacle collision
    if (this.checkObstacleCollision(newHead) && !this.invincible) {
      this.handleCollision('obstacle');
      return;
    }
    
    // Check self collision
    if (this.checkSelfCollision(newHead) && !this.invincible) {
      this.handleCollision('self');
      return;
    }
    
    // Move snake
    this.snake.unshift(newHead);
    
    // Check food collision
    const foodAtPosition = this.foodSystem.getFoodAtPosition(newHead);
    if (foodAtPosition) {
      this.handleFoodCollision(foodAtPosition);
    } else if (!this.shouldGrow()) {
      this.snake.pop();
    }
    
    // Play movement sound (very quiet)
    if (Math.random() < 0.1) {
      this.soundManager.playSound('snake_move', 0.1);
    }
  }
  
  private shouldGrow(): boolean {
    // Check if snake should grow due to special rules
    return this.currentLevel.specialRules?.includes('growing_tail') || false;
  }
  
  private checkObstacleCollision(position: Position): boolean {
    return this.obstacles.some(obstacle => {
      return position.x >= obstacle.x &&
             position.x < obstacle.x + obstacle.width &&
             position.y >= obstacle.y &&
             position.y < obstacle.y + obstacle.height &&
             obstacle.active !== false;
    });
  }
  
  private checkSelfCollision(position: Position): boolean {
    return this.snake.slice(1).some(segment => 
      segment.x === position.x && segment.y === position.y
    );
  }
  
  private updateObstacles(deltaTime: number): void {
    this.obstacles.forEach(obstacle => {
      if (obstacle.type === 'moving_wall' && obstacle.movePattern && obstacle.currentPatternIndex !== undefined) {
        // Update moving obstacles
        // This would need more sophisticated timing logic
        // For now, we'll keep obstacles static
      }
    });
  }
  
  private checkFoodSpawning(): void {
    const currentFoodCount = this.foodSystem.getAllFoods().length;
    const maxFoods = Math.min(5, Math.floor(this.currentLevel.foodConfig.spawnRate * 2));
    
    if (currentFoodCount < maxFoods && Math.random() < this.currentLevel.foodConfig.spawnRate * 0.01) {
      this.spawnFood();
    }
  }
  
  private spawnFood(): void {
    let attempts = 0;
    const maxAttempts = 100;
    
    while (attempts < maxAttempts) {
      const position = {
        x: Math.floor(Math.random() * COLS),
        y: Math.floor(Math.random() * ROWS)
      };
      
      // Check if position is free
      if (!this.isPositionOccupied(position)) {
        const foods = this.foodSystem.spawnFoodsWithWeights(
          position,
          this.currentLevel.foodConfig.typeWeights
        );
        
        foods.forEach(food => {
          // Add visual effects for special foods
          if (food.type !== FoodType.APPLE) {
            this.addFoodSpawnEffect(food.x, food.y, food.type);
          }
        });
        
        break;
      }
      
      attempts++;
    }
  }
  
  private isPositionOccupied(position: Position): boolean {
    // Check snake
    if (this.snake.some(segment => segment.x === position.x && segment.y === position.y)) {
      return true;
    }
    
    // Check obstacles
    if (this.checkObstacleCollision(position)) {
      return true;
    }
    
    // Check existing food
    if (this.foodSystem.isFoodAtPosition(position)) {
      return true;
    }
    
    return false;
  }
  
  private addFoodSpawnEffect(x: number, y: number, foodType: FoodType): void {
    const worldX = x * TILE + TILE / 2;
    const worldY = y * TILE + TILE / 2;
    
    const sparkle = this.add.circle(worldX, worldY, 15, 0xffffff, 0.8);
    
    this.tweens.add({
      targets: sparkle,
      scaleX: 0,
      scaleY: 0,
      alpha: 0,
      duration: 300,
      ease: 'Quad.easeOut',
      onComplete: () => sparkle.destroy()
    });
  }
  
  private handleFoodCollision(food: any): void {
    // Resolve the actual internal food ID by position to ensure consumption works
    const foodId = this.foodSystem.getFoodIdAtPosition({ x: food.x, y: food.y });
    const consumeResult = foodId ? this.foodSystem.consumeFood(foodId) : { points: 0 } as any;
    
    // Update combo and apply multiplier to points
    this.comboCount += 1;
    this.maxCombo = Math.max(this.maxCombo, this.comboCount);
    this.comboTimeLeft = this.comboWindow;
    // Persist best combo in stats
    if (this.gameState.statistics.bestCombo === undefined || this.comboCount > this.gameState.statistics.bestCombo) {
      this.gameState.statistics.bestCombo = this.comboCount;
    }
    // Milestone flair
    if (this.comboMilestones.includes(this.comboCount)) {
      this.onComboMilestone(this.comboCount);
    }
    const multiplier = this.getComboMultiplier(this.comboCount);
    const awardedPoints = Math.max(0, Math.floor(consumeResult.points * multiplier));
    // Add score
    this.score += awardedPoints;
    
    // Add coins if applicable
    if (consumeResult.coins) {
      this.coins += consumeResult.coins;
      this.gameState.coins += consumeResult.coins;
    }
    
    // Apply effect if any
    if (consumeResult.effect) {
      this.applyFoodEffect(consumeResult.effect);
    }
    
    // Play sound
    this.soundManager.playFoodSound(food.type);
    
    // Create visual effect
    this.animationManager.animateFoodConsumption(food.x, food.y, food.type);
    if (awardedPoints > 0) {
      const worldX = food.x * TILE + TILE / 2;
      const worldY = food.y * TILE + TILE / 2;
      const t = this.add.text(worldX, worldY, `+${awardedPoints}${multiplier > 1 ? ` x${this.comboCount}` : ''}`, {
        fontSize: '16px',
        fontFamily: 'Arial, sans-serif',
        color: '#fbbf24',
        stroke: '#000000',
        strokeThickness: 2
      }).setOrigin(0.5);
      this.tweens.add({
        targets: t,
        y: worldY - 30,
        alpha: 0,
        duration: 800,
        ease: 'Quad.easeOut',
        onComplete: () => t.destroy()
      });
    }
    
    // Handle special food types
    this.handleSpecialFoodEffects(food.type);
    
    // Check level completion
    this.checkLevelCompletion();
    
    // Update statistics
    this.updateFoodStatistics(food.type);
  }

  private getComboMultiplier(count: number): number {
    // Non-linear curve; tweak values to taste
    const curve = [1.0, 1.15, 1.3, 1.5, 1.75, 2.0, 2.2, 2.35, 2.45, 2.5];
    const idx = Math.max(1, count) - 1;
    return curve[Math.min(idx, curve.length - 1)];
  }

  private onComboMilestone(count: number): void {
    // Flash + chime + banner text
    this.animationManager.flashScreen(0xfbbf24, 0.6, 180);
    this.soundManager.playSound('power_up');
    const t = this.add.text(WIDTH / 2, HEIGHT / 2 - 100, `Combo x${count}!`, {
      fontSize: '28px',
      fontFamily: 'Arial, sans-serif',
      color: '#fbbf24',
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5);
    this.tweens.add({ targets: t, y: t.y - 30, alpha: 0, duration: 1000, ease: 'Back.easeOut', onComplete: () => t.destroy() });
  }
  
  private applyFoodEffect(effect: FoodEffect): void {
    const effectId = Date.now().toString() + Math.random().toString();
    
    switch (effect.type) {
      case 'speed':
        this.speedMultiplier = effect.magnitude || 1.5;
        this.step = this.baseStep;
        this.animationManager.animatePowerUpActivation('speed');
        break;
        
      case 'slow':
        this.speedMultiplier = effect.magnitude || 0.5;
        this.step = this.baseStep;
        break;
        
      case 'invincible':
        this.invincible = true;
        this.animationManager.animatePowerUpActivation('invincible');
        break;
        
      case 'shrink':
        const shrinkAmount = effect.magnitude || 2;
        for (let i = 0; i < shrinkAmount && this.snake.length > 1; i++) {
          this.snake.pop();
        }
        this.animationManager.animatePowerUpActivation('shrink');
        return; // Don't add to active effects as it's instant
        
      case 'multi':
        const multiAmount = effect.magnitude || 4;
        for (let i = 0; i < multiAmount; i++) {
          this.spawnFood();
        }
        this.animationManager.animatePowerUpActivation('multi');
        return; // Don't add to active effects as it's instant
    }
    
    // Add to active effects if it has duration
    if (effect.duration > 0) {
      this.activeEffects.set(effectId, {
        effect,
        timeLeft: effect.duration
      });
    }
  }
  
  private handleSpecialFoodEffects(foodType: FoodType): void {
    switch (foodType) {
      case FoodType.BOMB_FOOD:
        // Bomb food is dangerous!
        this.handleCollision('bomb');
        break;
        
      case FoodType.MYSTERY_FOOD:
        // Mystery food has random effects (handled by FoodSystem)
        break;
        
      case FoodType.MULTI_APPLE:
        // Multi apple spawns additional foods (handled in applyFoodEffect)
        break;
    }
  }
  
  private handleCollision(type: string): void {
    if (this.invincible) return;
    
    this.lives--;
    this.soundManager.playSound('game_over');
    this.animationManager.shakeScreen(15, 500);
    this.animationManager.flashScreen(0xff0000, 0.7, 300);
    
    if (this.lives <= 0) {
      this.gameOver = true;
      this.handleGameOver();
    } else {
      // Reset snake position but keep progress
      this.snake = [{ x: 5, y: 5 }, { x: 4, y: 5 }, { x: 3, y: 5 }];
      this.dir = { x: 1, y: 0 };
      this.nextDir = { x: 1, y: 0 };
      this.activeEffects.clear();
      this.invincible = false;
      this.speedMultiplier = 1;
      this.step = this.baseStep;
      
      // Brief invincibility after respawn
      this.invincible = true;
      this.time.delayedCall(2000, () => {
        this.invincible = false;
      });
    }
    // Reset combo on collision
    this.comboCount = 0;
    this.comboTimeLeft = 0;
  }
  
  private checkLevelCompletion(): void {
    if (this.score >= this.currentLevel.targetScore) {
      this.levelCompleted = true;
      this.handleLevelComplete();
    }
  }
  
  private handleLevelComplete(): void {
    this.soundManager.playSound('level_complete');
    this.animationManager.animateLevelComplete();
    
    // Update game state
    this.gameState.completedLevels.add(this.levelNumber);
    this.gameState.coins += this.currentLevel.rewards.coins;
    this.gameState.experience += this.currentLevel.rewards.experience;
    this.gameState.statistics.levelsCompleted++;
    this.gameState.statistics.totalScore += this.score;
    
    // Bonuses at completion
    const livesBonus = this.lives * 50; // points
    if (livesBonus > 0) {
      this.score += livesBonus;
      const t1 = this.add.text(WIDTH / 2, HEIGHT / 2 + 120, `Lives Bonus +${livesBonus}` , {
        fontSize: '18px', color: '#fbbf24', fontFamily: 'Arial, sans-serif', stroke: '#000', strokeThickness: 3
      }).setOrigin(0.5);
      this.tweens.add({ targets: t1, y: t1.y - 30, alpha: 0, duration: 1200, ease: 'Quad.easeOut', onComplete: () => t1.destroy() });
    }
    if (this.maxCombo >= 5) {
      const comboBonus = this.maxCombo * 10;
      this.score += comboBonus;
      const t2 = this.add.text(WIDTH / 2, HEIGHT / 2 + 150, `Combo Bonus x${this.maxCombo} +${comboBonus}` , {
        fontSize: '18px', color: '#fbbf24', fontFamily: 'Arial, sans-serif', stroke: '#000', strokeThickness: 3
      }).setOrigin(0.5);
      this.tweens.add({ targets: t2, y: t2.y - 30, alpha: 0, duration: 1200, ease: 'Quad.easeOut', onComplete: () => t2.destroy() });
    }
    if (this.lives === 3) {
      this.coins += 20;
      this.gameState.coins += 20;
      const t3 = this.add.text(WIDTH / 2, HEIGHT / 2 + 180, `Perfect Run +20 Coins` , {
        fontSize: '18px', color: '#fbbf24', fontFamily: 'Arial, sans-serif', stroke: '#000', strokeThickness: 3
      }).setOrigin(0.5);
      this.tweens.add({ targets: t3, y: t3.y - 30, alpha: 0, duration: 1200, ease: 'Quad.easeOut', onComplete: () => t3.destroy() });
    }
    
    // Show completion screen after a delay
    this.time.delayedCall(3000, () => {
      this.showLevelCompleteScreen();
    });
  }
  
  private handleGameOver(): void {
    this.animationManager.animateGameOver(this.snake);
    
    // Update statistics
    this.gameState.statistics.gamesPlayed++;
    this.gameState.statistics.totalScore += this.score;
    this.gameState.statistics.longestSnake = Math.max(
      this.gameState.statistics.longestSnake,
      this.snake.length
    );
    
    // Show game over screen
    this.time.delayedCall(2000, () => {
      this.showGameOverScreen();
    });
  }
  
  private showLevelCompleteScreen(): void {
    // Create completion overlay
    const overlay = this.add.graphics();
    overlay.fillStyle(0x000000, 0.8);
    overlay.fillRect(0, 0, WIDTH, HEIGHT);
    
    const completeText = this.add.text(
      WIDTH / 2,
      HEIGHT / 2 - 80,
      'LEVEL COMPLETE!',
      {
        fontSize: '36px',
        fontFamily: 'Arial, sans-serif',
        color: '#00ff00',
        stroke: '#000000',
        strokeThickness: 3,
        fontStyle: 'bold'
      }
    ).setOrigin(0.5);
    
    const statsText = this.add.text(
      WIDTH / 2,
      HEIGHT / 2 - 20,
      `Score: ${this.score}\nCoins Earned: ${this.currentLevel.rewards.coins}\nXP Gained: ${this.currentLevel.rewards.experience}\nBest Combo (this level): x${this.maxCombo}\nAll-time Best Combo: x${this.gameState.statistics.bestCombo || 0}`,
      {
        fontSize: '18px',
        fontFamily: 'Arial, sans-serif',
        color: '#ffffff',
        align: 'center',
        lineSpacing: 10
      }
    ).setOrigin(0.5);
    
    const continueText = this.add.text(
      WIDTH / 2,
      HEIGHT / 2 + 60,
      'Press SPACE to continue',
      {
        fontSize: '16px',
        fontFamily: 'Arial, sans-serif',
        color: '#ffff00'
      }
    ).setOrigin(0.5);
    
    // Handle continue input
    const continueKey = this.input.keyboard.addKey('SPACE');
    continueKey.on('down', () => {
      this.proceedToNextLevel();
    });
  }
  
  private showGameOverScreen(): void {
    const overlay = this.add.graphics();
    overlay.fillStyle(0x000000, 0.9);
    overlay.fillRect(0, 0, WIDTH, HEIGHT);
    
    const gameOverText = this.add.text(
      WIDTH / 2,
      HEIGHT / 2 - 60,
      'GAME OVER',
      {
        fontSize: '42px',
        fontFamily: 'Arial, sans-serif',
        color: '#ff0000',
        stroke: '#000000',
        strokeThickness: 4,
        fontStyle: 'bold'
      }
    ).setOrigin(0.5);
    
    const finalScoreText = this.add.text(
      WIDTH / 2,
      HEIGHT / 2,
      `Final Score: ${this.score}`,
      {
        fontSize: '24px',
        fontFamily: 'Arial, sans-serif',
        color: '#ffffff'
      }
    ).setOrigin(0.5);
    
    const retryText = this.add.text(
      WIDTH / 2,
      HEIGHT / 2 + 60,
      'Press R to retry or ESC for menu',
      {
        fontSize: '16px',
        fontFamily: 'Arial, sans-serif',
        color: '#ffff00'
      }
    ).setOrigin(0.5);
    
    // Handle retry/menu input
    const retryKey = this.input.keyboard.addKey('R');
    const escKey = this.input.keyboard.addKey('ESC');
    
    retryKey.on('down', () => {
      this.scene.restart({ levelNumber: this.levelNumber, gameState: this.gameState });
    });
    
    escKey.on('down', () => {
      this.scene.start('MenuScene', { gameState: this.gameState });
    });
  }
  
  private proceedToNextLevel(): void {
    const nextLevel = this.levelSystem.getNextLevel(this.levelNumber);
    if (nextLevel) {
      this.scene.restart({ levelNumber: nextLevel.id, gameState: this.gameState });
    } else {
      // All levels completed!
      this.showGameCompleteScreen();
    }
  }
  
  private showGameCompleteScreen(): void {
    const overlay = this.add.graphics();
    overlay.fillStyle(0x000000, 0.95);
    overlay.fillRect(0, 0, WIDTH, HEIGHT);
    
    const completeText = this.add.text(
      WIDTH / 2,
      HEIGHT / 2,
      'CONGRATULATIONS!\nYou completed all 147 levels!',
      {
        fontSize: '36px',
        fontFamily: 'Arial, sans-serif',
        color: '#ffd700',
        stroke: '#000000',
        strokeThickness: 3,
        fontStyle: 'bold',
        align: 'center',
        lineSpacing: 20
      }
    ).setOrigin(0.5);
    
    // Epic celebration
    this.animationManager.animateLevelComplete();
    
    this.time.delayedCall(5000, () => {
      this.scene.start('MenuScene', { gameState: this.gameState });
    });
  }
  
  private updateFoodStatistics(foodType: FoodType): void {
    if (!this.gameState.statistics.foodEaten[foodType]) {
      this.gameState.statistics.foodEaten[foodType] = 0;
    }
    this.gameState.statistics.foodEaten[foodType]++;
  }
  
  private togglePause(): void {
    this.paused = !this.paused;
    
    if (this.paused) {
      this.showPauseScreen();
    } else {
      this.hidePauseScreen();
    }
  }
  
  private pauseOverlay?: Phaser.GameObjects.Graphics;
  private pauseText?: Phaser.GameObjects.Text;
  private pauseLivesText?: Phaser.GameObjects.Text;
  
  private showPauseScreen(): void {
    this.pauseOverlay = this.add.graphics();
    this.pauseOverlay.fillStyle(0x000000, 0.7);
    this.pauseOverlay.fillRect(0, 0, WIDTH, HEIGHT);
    
    this.pauseText = this.add.text(
      WIDTH / 2,
      HEIGHT / 2,
      'PAUSED\nPress ESC to resume',
      {
        fontSize: '32px',
        fontFamily: 'Arial, sans-serif',
        color: '#ffffff',
        align: 'center',
        fontStyle: 'bold'
      }
    ).setOrigin(0.5);
    // Lives behavior in pause overlay
    const persistLivesPause = this.gameState?.settings?.persistLives === true;
    this.pauseLivesText = this.add.text(
      WIDTH / 2,
      HEIGHT / 2 + 70,
      `Lives: ${persistLivesPause ? 'Persisting Across Levels' : 'Reset Each Level'}`,
      {
        fontSize: '16px',
        fontFamily: 'Arial, sans-serif',
        color: '#fbbf24',
        stroke: '#000000',
        strokeThickness: 2,
        align: 'center'
      }
    ).setOrigin(0.5);
  }
  
  private hidePauseScreen(): void {
    this.pauseOverlay?.destroy();
    this.pauseText?.destroy();
    this.pauseLivesText?.destroy();
  }
  
  private updateUI(): void {
    this.scoreText.setText(`Score: ${this.score}`);
    this.livesText.setText(`Lives: ${this.lives}`);
    this.coinsText.setText(`Coins: ${this.coins}`);
    // Update lives badge text in HUD
    const persistLivesHUD = this.gameState?.settings?.persistLives === true;
    this.livesBadge.setText(`(${persistLivesHUD ? 'Persist' : 'Reset'})`);
    // Combo display
    if (this.comboCount > 1) {
      this.comboText.setText(`Combo x${this.comboCount}`);
      this.comboText.setVisible(true);
    } else {
      this.comboText.setVisible(false);
    }
    
    // Update lives text color based on remaining lives
    if (this.lives <= 1) {
      this.livesText.setColor('#ff0000');
    } else if (this.lives <= 2) {
      this.livesText.setColor('#ffaa00');
    } else {
      this.livesText.setColor('#00ff00');
    }
  }
  
  private draw(): void {
    this.graphics.clear();
    
    // Draw obstacles
    this.drawObstacles();
    
    // Draw food
    this.drawFood();
    
    // Draw snake
    this.drawSnake();
    
    // Draw effects
    this.drawActiveEffects();
  }
  
  private drawObstacles(): void {
    this.obstacles.forEach(obstacle => {
      const color = this.getObstacleColor(obstacle.type);
      this.graphics.fillStyle(color);
      
      this.graphics.fillRect(
        obstacle.x * TILE,
        obstacle.y * TILE,
        obstacle.width * TILE,
        obstacle.height * TILE
      );
      
      // Add border for better visibility
      this.graphics.lineStyle(2, 0xffffff, 0.3);
      this.graphics.strokeRect(
        obstacle.x * TILE,
        obstacle.y * TILE,
        obstacle.width * TILE,
        obstacle.height * TILE
      );
    });
  }
  
  private getObstacleColor(type: string): number {
    const colors: Record<string, number> = {
      wall: 0x8b4513,
      moving_wall: 0xa0522d,
      teleporter: 0x9932cc,
      spike: 0xff4500,
      laser: 0xff0000
    };
    return colors[type] || colors.wall;
  }
  
  private drawFood(): void {
    this.foodSystem.getAllFoods().forEach(food => {
      const visual = this.foodSystem.getFoodVisualProperties(food.type);
      
      this.graphics.fillStyle(visual.color);
      
      if (visual.glow) {
        // Add glow effect for special foods
        this.graphics.fillCircle(
          food.x * TILE + TILE / 2,
          food.y * TILE + TILE / 2,
          TILE * visual.size * 0.8
        );
      }
      
      this.graphics.fillRect(
        food.x * TILE + (TILE * (1 - visual.size)) / 2,
        food.y * TILE + (TILE * (1 - visual.size)) / 2,
        TILE * visual.size,
        TILE * visual.size
      );
    });
  }
  
  private drawSnake(): void {
    this.snake.forEach((segment, index) => {
      if (index === 0) {
        // Draw head
        this.graphics.fillStyle(this.invincible ? 0xffff00 : 0x88ee88);
      } else {
        // Draw body
        this.graphics.fillStyle(this.invincible ? 0xdddd00 : 0x66cc66);
      }
      
      this.graphics.fillRect(
        segment.x * TILE,
        segment.y * TILE,
        TILE,
        TILE
      );
      
      // Add border
      this.graphics.lineStyle(1, 0x000000, 0.5);
      this.graphics.strokeRect(
        segment.x * TILE,
        segment.y * TILE,
        TILE,
        TILE
      );
    });
  }
  
  private drawActiveEffects(): void {
    if (this.invincible) {
      // Draw invincibility shield
      this.graphics.lineStyle(3, 0xffff00, 0.6 + 0.4 * Math.sin(this.time.now / 200));
      
      this.snake.forEach(segment => {
        this.graphics.strokeCircle(
          segment.x * TILE + TILE / 2,
          segment.y * TILE + TILE / 2,
          TILE * 0.8
        );
      });
    }
    
    if (this.speedMultiplier > 1) {
      // Draw speed lines
      this.graphics.lineStyle(2, 0x00ffff, 0.4);
      const head = this.snake[0];
      const headX = head.x * TILE + TILE / 2;
      const headY = head.y * TILE + TILE / 2;
      
      for (let i = 0; i < 3; i++) {
        const offset = (i + 1) * 15;
        this.graphics.lineBetween(
          headX - this.dir.x * offset,
          headY - this.dir.y * offset,
          headX - this.dir.x * (offset + 10),
          headY - this.dir.y * (offset + 10)
        );
      }
    }
  }
  
  private createDefaultGameState(): GameState {
    return {
      currentLevel: 1,
      score: 0,
      lives: 3,
      coins: 100,
      experience: 0,
      completedLevels: new Set(),
      inventory: {
        skins: ['classic_skin'],
        powerups: {},
        themes: [],
        currentSkin: 'classic_skin',
        currentTheme: 'default'
      },
      settings: {
        soundEnabled: true,
        musicEnabled: true,
        vibrationEnabled: true,
        controlScheme: 'swipe',
        difficulty: 'normal',
        persistLives: false
      },
      statistics: {
        totalScore: 0,
        gamesPlayed: 0,
        totalPlayTime: 0,
        foodEaten: {
          apple: 0,
          golden: 0,
          speed: 0,
          shrink: 0,
          multi: 0,
          power: 0,
          mystery: 0,
          bomb: 0,
          freeze: 0,
          coin: 0
        },
        levelsCompleted: 0,
        longestSnake: 3,
        perfectRuns: 0
        ,
        bestCombo: 0
      }
    };
  }
}

// Create the game with all scenes
const gameConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: WIDTH,
  height: HEIGHT,
  parent: "game",
  backgroundColor: "#0b0d10",
  scene: [MenuScene, UltimateSnakeScene, StoreScene, SettingsScene],
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  }
};

new Phaser.Game(gameConfig);
