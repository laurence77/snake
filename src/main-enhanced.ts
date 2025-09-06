import Phaser from "phaser";
import { WIDTH, HEIGHT } from "./helpers";
import { SnakeParticlePool } from "./systems/ObjectPool";
import { PerformanceMonitor } from "./systems/PerformanceMonitor";
import { GameFeelManager } from "./systems/GameFeel";
import { DynamicDifficultyAdjuster } from "./systems/DynamicDifficulty";

const TILE = 20;
const COLS = Math.floor(WIDTH / TILE);
const ROWS = Math.floor(HEIGHT / TILE);

/**
 * Enhanced Snake Game with Cutting-Edge Performance and Game Feel
 */
class EnhancedSnakeScene extends Phaser.Scene {
  // Core game state
  dir = { x: 1, y: 0 };
  snake: { x: number, y: number }[] = [{ x: 5, y: 5 }, { x: 4, y: 5 }, { x: 3, y: 5 }];
  food = { x: 10, y: 8 };
  powerUps: { x: number, y: number, type: string, duration: number }[] = [];
  
  // Timing and movement
  acc = 0;
  step = 0.12;
  gameTime = 0;
  lastInputTime = 0;
  
  // Game state
  score = 0;
  gameOver = false;
  isPaused = false;
  
  // Advanced systems
  private particlePool!: SnakeParticlePool;
  private performanceMonitor!: PerformanceMonitor;
  private gameFeelManager!: GameFeelManager;
  private difficultyAdjuster!: DynamicDifficultyAdjuster;
  
  // Visual elements
  private snakeGraphics!: Phaser.GameObjects.Graphics;
  private foodGraphics!: Phaser.GameObjects.Graphics;
  private uiGraphics!: Phaser.GameObjects.Graphics;
  private scoreText!: Phaser.GameObjects.Text;
  private difficultyText!: Phaser.GameObjects.Text;
  private performanceText!: Phaser.GameObjects.Text;
  
  // Audio (placeholder for future enhancement)
  private sounds: { [key: string]: Phaser.Sound.BaseSound } = {};
  
  create() {
    this.initializeSystems();
    this.setupVisuals();
    this.setupInput();
    this.setupUI();
    this.resetGame();
  }
  
  private initializeSystems(): void {
    // Initialize advanced systems
    this.particlePool = new SnakeParticlePool(this, 30);
    this.performanceMonitor = new PerformanceMonitor();
    this.gameFeelManager = new GameFeelManager(this);
    this.difficultyAdjuster = new DynamicDifficultyAdjuster();
    
    // Setup performance monitoring
    this.performanceMonitor.addListener((metrics) => {
      this.updatePerformanceDisplay(metrics);
      this.adaptToPerformance(metrics);
    });
  }
  
  private setupVisuals(): void {
    this.cameras.main.setBackgroundColor("#0b0d10");
    
    // Create graphics objects for optimized rendering
    this.snakeGraphics = this.add.graphics();
    this.foodGraphics = this.add.graphics();
    this.uiGraphics = this.add.graphics();
  }
  
  private setupInput(): void {
    // Enhanced input handling with reaction time tracking
    this.input.keyboard.on("keydown", (e: KeyboardEvent) => {
      if (this.gameOver || this.isPaused) return;
      
      const now = performance.now();
      const reactionTime = now - this.lastInputTime;
      this.lastInputTime = now;
      
      let newDir = null;
      
      // Direction changes with anticipation effects
      if (e.key === "ArrowUp" && this.dir.y === 0) {
        newDir = { x: 0, y: -1 };
      } else if (e.key === "ArrowDown" && this.dir.y === 0) {
        newDir = { x: 0, y: 1 };
      } else if (e.key === "ArrowLeft" && this.dir.x === 0) {
        newDir = { x: -1, y: 0 };
      } else if (e.key === "ArrowRight" && this.dir.x === 0) {
        newDir = { x: 1, y: 0 };
      }
      
      if (newDir) {
        this.dir = newDir;
        // Add subtle anticipation effect
        if (this.snake.length > 0) {
          const head = this.snake[0];
          this.gameFeelManager.createTrail(head.x * TILE, head.y * TILE);
        }
      }
      
      // Pause functionality
      if (e.key === " " || e.key === "Escape") {
        this.togglePause();
      }
    });
  }
  
  private setupUI(): void {
    // Score display
    this.scoreText = this.add.text(16, 16, "Score: 0", {
      fontSize: "24px",
      color: "#66cc66",
      fontStyle: "bold"
    });
    
    // Difficulty display
    this.difficultyText = this.add.text(16, 48, "Difficulty: Medium", {
      fontSize: "16px",
      color: "#88ee88"
    });
    
    // Performance display (toggle with P key)
    this.performanceText = this.add.text(WIDTH - 200, 16, "", {
      fontSize: "12px",
      color: "#888888"
    });
    
    // Instructions
    this.add.text(WIDTH / 2, HEIGHT - 30, "Arrow Keys: Move | Space: Pause | R: Restart", {
      fontSize: "12px",
      color: "#666666"
    }).setOrigin(0.5);
    
    // Debug key for performance display
    this.input.keyboard.on("keydown-P", () => {
      this.performanceText.visible = !this.performanceText.visible;
    });
    
    // Restart key
    this.input.keyboard.on("keydown-R", () => {
      if (this.gameOver) {
        this.restartGame();
      }
    });
  }
  
  update(_t: number, dtMs: number): void {
    const dt = dtMs / 1000;
    
    // Update all systems
    this.performanceMonitor.update();
    this.particlePool.update(dt);
    this.gameTime += dtMs;
    this.difficultyAdjuster.update(this.gameTime);
    
    // Update difficulty settings
    const difficulty = this.difficultyAdjuster.getDifficultySettings();
    this.step = difficulty.speed;
    
    if (this.gameOver || this.isPaused) return;
    
    this.acc += dt;
    if (this.acc < this.step) return;
    this.acc = 0;
    
    this.moveSnake();
    this.checkCollisions();
    this.updatePowerUps(dt);
    this.spawnPowerUps();
    this.renderGame();
    
    // Track render calls for performance monitoring
    this.performanceMonitor.trackRenderCall();
    this.performanceMonitor.resetFrame();
  }
  
  private moveSnake(): void {
    const head = { 
      x: this.snake[0].x + this.dir.x, 
      y: this.snake[0].y + this.dir.y 
    };
    
    // Check wall collisions with enhanced feedback
    if (head.x < 0 || head.x >= COLS || head.y < 0 || head.y >= ROWS) {
      this.handleGameOver();
      return;
    }
    
    // Check self collision with enhanced feedback
    for (const segment of this.snake) {
      if (head.x === segment.x && head.y === segment.y) {
        this.handleGameOver();
        return;
      }
    }
    
    // Check near misses for difficulty adjustment
    this.checkNearMisses(head);
    
    this.snake.unshift(head);
    
    // Food collection with enhanced effects
    if (head.x === this.food.x && head.y === this.food.y) {
      this.collectFood(head);
    } else {
      this.snake.pop();
    }
    
    // Power-up collection
    this.checkPowerUpCollection(head);
  }
  
  private checkNearMisses(head: { x: number, y: number }): void {
    const margin = 1;
    
    // Near wall
    if (head.x <= margin || head.x >= COLS - margin - 1 ||
        head.y <= margin || head.y >= ROWS - margin - 1) {
      this.difficultyAdjuster.recordNearMiss();
    }
    
    // Near self
    for (const segment of this.snake) {
      const distance = Math.abs(head.x - segment.x) + Math.abs(head.y - segment.y);
      if (distance === 1) {
        this.difficultyAdjuster.recordNearMiss();
        break;
      }
    }
  }
  
  private collectFood(head: { x: number, y: number }): void {
    const reactionTime = performance.now() - this.lastInputTime;
    
    // Record metrics
    this.difficultyAdjuster.recordFoodCollection(reactionTime);
    
    // Update score with difficulty multiplier
    const difficulty = this.difficultyAdjuster.getDifficultySettings();
    const points = Math.floor(100 * difficulty.bonusMultiplier);
    this.score += points;
    
    // Enhanced visual feedback
    const foodX = this.food.x * TILE + TILE / 2;
    const foodY = this.food.y * TILE + TILE / 2;
    
    this.gameFeelManager.screenShake(6, 120);
    this.gameFeelManager.cameraPunch(1.03, 150);
    this.gameFeelManager.particleBurst(foodX, foodY, 6);
    this.gameFeelManager.rippleEffect(foodX, foodY, 50, 350);
    this.gameFeelManager.scorePopup(foodX, foodY, points);
    
    // Particle effects
    for (let i = 0; i < 5; i++) {
      const vx = (Math.random() - 0.5) * 100;
      const vy = (Math.random() - 0.5) * 100;
      this.particlePool.emit(foodX, foodY, vx, vy, 0x66cc66, 400);
    }
    
    // Spawn new food
    this.spawnFood();
    
    // Update UI
    this.updateUI();
  }
  
  private spawnFood(): void {
    let validPosition = false;
    let attempts = 0;
    
    while (!validPosition && attempts < 100) {
      this.food = {
        x: Math.floor(Math.random() * COLS),
        y: Math.floor(Math.random() * ROWS)
      };
      
      validPosition = true;
      
      // Check if food spawns on snake
      for (const segment of this.snake) {
        if (segment.x === this.food.x && segment.y === this.food.y) {
          validPosition = false;
          break;
        }
      }
      
      // Check if food spawns on power-up
      for (const powerUp of this.powerUps) {
        if (powerUp.x === this.food.x && powerUp.y === this.food.y) {
          validPosition = false;
          break;
        }
      }
      
      attempts++;
    }
    
    // Add subtle spawn effect
    const foodX = this.food.x * TILE + TILE / 2;
    const foodY = this.food.y * TILE + TILE / 2;
    this.gameFeelManager.rippleEffect(foodX, foodY, 30, 200);
  }
  
  private updatePowerUps(dt: number): void {
    for (let i = this.powerUps.length - 1; i >= 0; i--) {
      const powerUp = this.powerUps[i];
      powerUp.duration -= dt * 1000;
      
      if (powerUp.duration <= 0) {
        this.powerUps.splice(i, 1);
      }
    }
  }
  
  private spawnPowerUps(): void {
    const difficulty = this.difficultyAdjuster.getDifficultySettings();
    
    if (Math.random() < difficulty.powerUpChance / 100 && this.powerUps.length < 2) {
      let validPosition = false;
      let attempts = 0;
      
      while (!validPosition && attempts < 50) {
        const x = Math.floor(Math.random() * COLS);
        const y = Math.floor(Math.random() * ROWS);
        
        validPosition = true;
        
        // Check collision with snake, food, and other power-ups
        for (const segment of this.snake) {
          if (segment.x === x && segment.y === y) {
            validPosition = false;
            break;
          }
        }
        
        if (this.food.x === x && this.food.y === y) validPosition = false;
        
        for (const existing of this.powerUps) {
          if (existing.x === x && existing.y === y) {
            validPosition = false;
            break;
          }
        }
        
        if (validPosition) {
          const powerUpTypes = ["slowTime", "doublePoints", "shield"];
          const type = powerUpTypes[Math.floor(Math.random() * powerUpTypes.length)];
          
          this.powerUps.push({
            x, y, type,
            duration: 8000 // 8 seconds
          });
          
          // Spawn effect
          const px = x * TILE + TILE / 2;
          const py = y * TILE + TILE / 2;
          this.gameFeelManager.rippleEffect(px, py, 35, 300);
        }
        
        attempts++;
      }
    }
  }
  
  private checkPowerUpCollection(head: { x: number, y: number }): void {
    for (let i = this.powerUps.length - 1; i >= 0; i--) {
      const powerUp = this.powerUps[i];
      
      if (head.x === powerUp.x && head.y === powerUp.y) {
        this.collectPowerUp(powerUp, i);
      }
    }
  }
  
  private collectPowerUp(powerUp: any, index: number): void {
    // Remove power-up
    this.powerUps.splice(index, 1);
    
    // Apply effect
    const px = powerUp.x * TILE + TILE / 2;
    const py = powerUp.y * TILE + TILE / 2;
    
    this.gameFeelManager.screenShake(8, 150);
    this.gameFeelManager.particleBurst(px, py, 8, [0xFFD700, 0xFFA500, 0xFF6B6B]);
    this.gameFeelManager.scorePopup(px, py, 50);
    
    switch (powerUp.type) {
      case "slowTime":
        this.step = Math.min(0.2, this.step * 1.5);
        this.time.delayedCall(3000, () => {
          const difficulty = this.difficultyAdjuster.getDifficultySettings();
          this.step = difficulty.speed;
        });
        break;
        
      case "doublePoints":
        // This would be handled in the difficulty system
        break;
        
      case "shield":
        // Temporary invincibility (simplified implementation)
        break;
    }
    
    this.score += 50;
    this.updateUI();
  }
  
  private handleGameOver(): void {
    this.gameOver = true;
    this.difficultyAdjuster.recordGameOver();
    
    // Enhanced game over effects
    this.gameFeelManager.gameOverEffect();
    this.gameFeelManager.freezeFrame(200);
    
    // Display game over screen
    const centerX = WIDTH / 2;
    const centerY = HEIGHT / 2;
    
    const gameOverBg = this.add.rectangle(centerX, centerY, 400, 300, 0x000000, 0.8);
    const gameOverText = this.add.text(centerX, centerY - 60, "GAME OVER", {
      fontSize: "48px",
      color: "#ff4444",
      fontStyle: "bold"
    }).setOrigin(0.5);
    
    const finalScore = this.add.text(centerX, centerY - 10, `Final Score: ${this.score}`, {
      fontSize: "24px",
      color: "#ffffff"
    }).setOrigin(0.5);
    
    const difficultyLevel = this.difficultyAdjuster.getDifficultyLevel();
    const difficultyReached = this.add.text(centerX, centerY + 20, `Difficulty: ${difficultyLevel}`, {
      fontSize: "18px",
      color: "#88ee88"
    }).setOrigin(0.5);
    
    const restartText = this.add.text(centerX, centerY + 60, "Press R to Restart", {
      fontSize: "16px",
      color: "#cccccc"
    }).setOrigin(0.5);
    
    // Show adaptive feedback
    const feedback = this.difficultyAdjuster.getAdaptiveFeedback();
    if (feedback.length > 0) {
      this.add.text(centerX, centerY + 90, feedback[0], {
        fontSize: "14px",
        color: "#66cc66"
      }).setOrigin(0.5);
    }
  }
  
  private renderGame(): void {
    // Clear previous frame
    this.snakeGraphics.clear();
    this.foodGraphics.clear();
    this.uiGraphics.clear();
    
    // Render background
    this.snakeGraphics.fillStyle(0x0b0d10);
    this.snakeGraphics.fillRect(0, 0, WIDTH, HEIGHT);
    
    // Render food with enhanced visuals
    const pulseScale = 1 + Math.sin(this.gameTime * 0.01) * 0.1;
    this.foodGraphics.fillStyle(0xff4444);
    this.foodGraphics.fillRect(
      this.food.x * TILE + TILE * (1 - pulseScale) / 2,
      this.food.y * TILE + TILE * (1 - pulseScale) / 2,
      TILE * pulseScale,
      TILE * pulseScale
    );
    
    // Render snake with gradient effect
    for (let i = 0; i < this.snake.length; i++) {
      const segment = this.snake[i];
      const alpha = 1 - (i / this.snake.length) * 0.3;
      const color = i === 0 ? 0x88ee88 : 0x66cc66; // Head is brighter
      
      this.snakeGraphics.fillStyle(color, alpha);
      this.snakeGraphics.fillRect(segment.x * TILE, segment.y * TILE, TILE, TILE);
      
      // Add subtle border for head
      if (i === 0) {
        this.snakeGraphics.lineStyle(1, 0xaaffaa, 0.5);
        this.snakeGraphics.strokeRect(segment.x * TILE, segment.y * TILE, TILE, TILE);
      }
    }
    
    // Render power-ups with animation
    for (const powerUp of this.powerUps) {
      const color = this.getPowerUpColor(powerUp.type);
      const pulseScale = 1 + Math.sin(this.gameTime * 0.015) * 0.2;
      
      this.uiGraphics.fillStyle(color);
      this.uiGraphics.fillRect(
        powerUp.x * TILE + TILE * (1 - pulseScale) / 2,
        powerUp.y * TILE + TILE * (1 - pulseScale) / 2,
        TILE * pulseScale,
        TILE * pulseScale
      );
    }
    
    // Performance tracking
    this.performanceMonitor.setCustomMetric('snakeLength', this.snake.length);
    this.performanceMonitor.setCustomMetric('score', this.score);
  }
  
  private getPowerUpColor(type: string): number {
    switch (type) {
      case "slowTime": return 0x4169E1;
      case "doublePoints": return 0xFFD700;
      case "shield": return 0x32CD32;
      default: return 0xFFFFFF;
    }
  }
  
  private updateUI(): void {
    this.scoreText.setText(`Score: ${this.score}`);
    this.difficultyText.setText(`Difficulty: ${this.difficultyAdjuster.getDifficultyLevel()}`);
  }
  
  private updatePerformanceDisplay(metrics: any): void {
    if (this.performanceText.visible) {
      this.performanceText.setText([
        `FPS: ${metrics.fps}`,
        `Frame: ${metrics.frameTime}ms`,
        `Memory: ${metrics.memoryUsage}MB`,
        `Quality: ${metrics.qualityLevel}`
      ].join('\n'));
    }
  }
  
  private adaptToPerformance(metrics: any): void {
    // Adaptive quality based on performance
    if (metrics.qualityLevel === 'low') {
      // Reduce particle effects and visual enhancements
      this.particlePool.releaseAll();
    }
  }
  
  private togglePause(): void {
    this.isPaused = !this.isPaused;
    
    if (this.isPaused) {
      const pauseText = this.add.text(WIDTH / 2, HEIGHT / 2, "PAUSED", {
        fontSize: "48px",
        color: "#ffffff",
        fontStyle: "bold"
      }).setOrigin(0.5);
      
      pauseText.setName('pauseText');
    } else {
      const pauseText = this.children.getByName('pauseText');
      if (pauseText) {
        pauseText.destroy();
      }
    }
  }
  
  private restartGame(): void {
    // Reset game state
    this.scene.restart();
  }
  
  private resetGame(): void {
    // Reset all game state
    this.snake = [{ x: 5, y: 5 }, { x: 4, y: 5 }, { x: 3, y: 5 }];
    this.dir = { x: 1, y: 0 };
    this.score = 0;
    this.gameTime = 0;
    this.gameOver = false;
    this.isPaused = false;
    this.powerUps = [];
    this.acc = 0;
    
    // Reset systems
    this.difficultyAdjuster.reset();
    this.particlePool.releaseAll();
    
    // Spawn initial food
    this.spawnFood();
    
    // Update UI
    this.updateUI();
    
    // Set initial input tracking
    this.lastInputTime = performance.now();
  }
}

// Game configuration with enhanced settings
new Phaser.Game({
  type: Phaser.AUTO,
  width: WIDTH,
  height: HEIGHT,
  parent: "game",
  backgroundColor: "#0b0d10",
  scene: [EnhancedSnakeScene],
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 0 },
      debug: false
    }
  },
  render: {
    antialias: true,
    pixelArt: false,
    roundPixels: true,
    transparent: false,
    clearBeforeRender: true,
    premultipliedAlpha: true,
    preserveDrawingBuffer: false,
    desynchronized: true,
    failIfMajorPerformanceCaveat: false,
    powerPreference: "high-performance"
  }
});