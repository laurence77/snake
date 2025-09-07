import Phaser from 'phaser';
import { LevelSystem } from '../systems/LevelSystem';
import { GameState } from '../types/GameTypes';

/**
 * Main Menu Scene with Level Selection and Store Access
 */
export class MenuScene extends Phaser.Scene {
  private levelSystem!: LevelSystem;
  private gameState!: GameState;
  private currentPage = 0;
  private levelsPerPage = 15;
  
  // UI Elements
  private background!: Phaser.GameObjects.Graphics;
  private titleText!: Phaser.GameObjects.Text;
  private levelContainer!: Phaser.GameObjects.Container;
  private storeButton!: Phaser.GameObjects.Container;
  private settingsButton!: Phaser.GameObjects.Container;
  private prevPageButton!: Phaser.GameObjects.Container;
  private nextPageButton!: Phaser.GameObjects.Container;
  private coinDisplay!: Phaser.GameObjects.Container;
  private progressBar!: Phaser.GameObjects.Graphics;
  
  constructor() {
    super({ key: 'MenuScene' });
  }
  
  init(data: { gameState: GameState }) {
    this.levelSystem = new LevelSystem();
    this.gameState = data.gameState || this.createInitialGameState();
  }
  
  create() {
    this.createBackground();
    this.createTitle();
    this.createCoinDisplay();
    this.createProgressBar();
    this.createLevelGrid();
    this.createNavigationButtons();
    this.createMenuButtons();
    this.updateDisplay();
  }
  
  private createBackground(): void {
    this.background = this.add.graphics();
    this.background.fillGradientStyle(0x0b0d10, 0x0b0d10, 0x1a2f1a, 0x1a2f1a, 1);
    this.background.fillRect(0, 0, this.scale.width, this.scale.height);
    
    // Add animated background elements
    this.createBackgroundParticles();
  }
  
  private createBackgroundParticles(): void {
    // Create subtle moving particles for visual interest
    for (let i = 0; i < 20; i++) {
      const particle = this.add.circle(
        Math.random() * this.scale.width,
        Math.random() * this.scale.height,
        Math.random() * 3 + 1,
        0x10b981,
        0.1
      );
      
      this.tweens.add({
        targets: particle,
        y: particle.y + Math.random() * 100 - 50,
        x: particle.x + Math.random() * 100 - 50,
        alpha: Math.random() * 0.3,
        duration: 3000 + Math.random() * 2000,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    }
  }
  
  private createTitle(): void {
    this.titleText = this.add.text(
      this.scale.width / 2,
      60,
      'Snake Classic',
      {
        fontSize: '48px',
        fontFamily: 'Arial, sans-serif',
        color: '#ffffff',
        stroke: '#10b981',
        strokeThickness: 3
      }
    ).setOrigin(0.5);
    
    // Add pulsing effect to title
    this.tweens.add({
      targets: this.titleText,
      scaleX: 1.05,
      scaleY: 1.05,
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }
  
  private createCoinDisplay(): void {
    this.coinDisplay = this.add.container(this.scale.width - 150, 30);
    
    // Coin background
    const coinBg = this.add.graphics();
    coinBg.fillStyle(0x047857, 0.8);
    coinBg.fillRoundedRect(-70, -15, 140, 30, 15);
    coinBg.lineStyle(2, 0x10b981);
    coinBg.strokeRoundedRect(-70, -15, 140, 30, 15);
    
    // Coin icon
    const coinIcon = this.add.circle(-50, 0, 12, 0xffd700);
    coinIcon.setStrokeStyle(2, 0xffa500);
    
    // Coin text
    const coinText = this.add.text(0, 0, this.gameState.coins.toString(), {
      fontSize: '20px',
      fontFamily: 'Arial, sans-serif',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    
    this.coinDisplay.add([coinBg, coinIcon, coinText]);
  }
  
  private createProgressBar(): void {
    const barWidth = 300;
    const barHeight = 10;
    const x = (this.scale.width - barWidth) / 2;
    const y = 120;
    
    this.progressBar = this.add.graphics();
    
    // Background
    this.progressBar.fillStyle(0x333333, 0.8);
    this.progressBar.fillRoundedRect(x, y, barWidth, barHeight, 5);
    
    // Progress fill
    const progress = this.levelSystem.getLevelProgress(this.gameState.completedLevels);
    this.progressBar.fillStyle(0x10b981, 1);
    this.progressBar.fillRoundedRect(x, y, barWidth * progress, barHeight, 5);
    
    // Progress text
    const progressText = `${this.gameState.completedLevels.size} / 147 Levels Complete`;
    this.add.text(
      this.scale.width / 2,
      y + barHeight + 20,
      progressText,
      {
        fontSize: '16px',
        fontFamily: 'Arial, sans-serif',
        color: '#cccccc'
      }
    ).setOrigin(0.5);
  }
  
  private createLevelGrid(): void {
    this.levelContainer = this.add.container(0, 180);
    
    const startX = 80;
    const startY = 20;
    const spacing = 60;
    const cols = 5;
    const rows = 3;
    
    const startLevel = this.currentPage * this.levelsPerPage + 1;
    const endLevel = Math.min(startLevel + this.levelsPerPage - 1, 147);
    
    let levelIndex = 0;
    
    for (let level = startLevel; level <= endLevel; level++) {
      const row = Math.floor(levelIndex / cols);
      const col = levelIndex % cols;
      const x = startX + col * spacing;
      const y = startY + row * spacing;
      
      this.createLevelButton(level, x, y);
      levelIndex++;
    }
  }
  
  private createLevelButton(levelNumber: number, x: number, y: number): void {
    const levelData = this.levelSystem.getLevel(levelNumber);
    if (!levelData) return;
    
    const isCompleted = this.gameState.completedLevels.has(levelNumber);
    const isUnlocked = levelNumber === 1 || this.gameState.completedLevels.has(levelNumber - 1);
    const canPlay = isUnlocked && !isCompleted;
    
    // Button container
    const buttonContainer = this.add.container(x, y);
    
    // Button background
    const buttonBg = this.add.graphics();
    let bgColor = 0x333333; // Locked
    let borderColor = 0x555555;
    
    if (isCompleted) {
      bgColor = 0x10b981; // Completed - green
      borderColor = 0x047857;
    } else if (isUnlocked) {
      bgColor = 0x047857; // Available - dark green
      borderColor = 0x10b981;
    }
    
    buttonBg.fillStyle(bgColor, 0.9);
    buttonBg.fillRoundedRect(-25, -25, 50, 50, 8);
    buttonBg.lineStyle(2, borderColor);
    buttonBg.strokeRoundedRect(-25, -25, 50, 50, 8);
    
    // Level number
    const levelText = this.add.text(0, -5, levelNumber.toString(), {
      fontSize: '18px',
      fontFamily: 'Arial, sans-serif',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    
    // Difficulty stars
    const starY = 12;
    const starSpacing = 6;
    const starCount = Math.min(levelData.difficulty, 5);
    const startX = -(starCount - 1) * starSpacing / 2;
    
    for (let i = 0; i < starCount; i++) {
      const star = this.add.text(
        startX + i * starSpacing,
        starY,
        '★',
        {
          fontSize: '8px',
          color: '#ffd700'
        }
      ).setOrigin(0.5);
      buttonContainer.add(star);
    }
    
    buttonContainer.add([buttonBg, levelText]);
    this.levelContainer.add(buttonContainer);
    
    // Add interactivity
    if (canPlay || isCompleted) {
      buttonContainer.setInteractive(
        new Phaser.Geom.Rectangle(-25, -25, 50, 50),
        Phaser.Geom.Rectangle.Contains
      );
      
      buttonContainer.on('pointerover', () => {
        buttonBg.clear();
        buttonBg.fillStyle(bgColor, 1);
        buttonBg.fillRoundedRect(-25, -25, 50, 50, 8);
        buttonBg.lineStyle(3, 0xffd700);
        buttonBg.strokeRoundedRect(-25, -25, 50, 50, 8);
        
        this.tweens.add({
          targets: buttonContainer,
          scaleX: 1.1,
          scaleY: 1.1,
          duration: 100
        });
      });
      
      buttonContainer.on('pointerout', () => {
        buttonBg.clear();
        buttonBg.fillStyle(bgColor, 0.9);
        buttonBg.fillRoundedRect(-25, -25, 50, 50, 8);
        buttonBg.lineStyle(2, borderColor);
        buttonBg.strokeRoundedRect(-25, -25, 50, 50, 8);
        
        this.tweens.add({
          targets: buttonContainer,
          scaleX: 1,
          scaleY: 1,
          duration: 100
        });
      });
      
      buttonContainer.on('pointerdown', () => {
        this.startLevel(levelNumber);
      });
    }
    
    // Add lock icon for locked levels
    if (!isUnlocked) {
      const lockIcon = this.add.text(0, 0, '🔒', {
        fontSize: '16px'
      }).setOrigin(0.5);
      buttonContainer.add(lockIcon);
    }
    
    // Add completion checkmark
    if (isCompleted) {
      const checkmark = this.add.text(18, -18, '✓', {
        fontSize: '14px',
        color: '#ffffff',
        fontStyle: 'bold'
      }).setOrigin(0.5);
      buttonContainer.add(checkmark);
    }
  }
  
  private createNavigationButtons(): void {
    const buttonY = this.scale.height - 80;
    const totalPages = Math.ceil(147 / this.levelsPerPage);
    
    // Previous page button
    if (this.currentPage > 0) {
      this.prevPageButton = this.createNavButton(100, buttonY, '◀ Previous', () => {
        this.currentPage--;
        this.refreshLevelGrid();
      });
    }
    
    // Next page button
    if (this.currentPage < totalPages - 1) {
      this.nextPageButton = this.createNavButton(
        this.scale.width - 100,
        buttonY,
        'Next ▶',
        () => {
          this.currentPage++;
          this.refreshLevelGrid();
        }
      );
    }
    
    // Page indicator
    this.add.text(
      this.scale.width / 2,
      buttonY,
      `Page ${this.currentPage + 1} of ${totalPages}`,
      {
        fontSize: '16px',
        fontFamily: 'Arial, sans-serif',
        color: '#cccccc'
      }
    ).setOrigin(0.5);
  }
  
  private createNavButton(
    x: number,
    y: number,
    text: string,
    callback: () => void
  ): Phaser.GameObjects.Container {
    const button = this.add.container(x, y);
    
    const bg = this.add.graphics();
    bg.fillStyle(0x047857, 0.8);
    bg.fillRoundedRect(-60, -20, 120, 40, 10);
    bg.lineStyle(2, 0x10b981);
    bg.strokeRoundedRect(-60, -20, 120, 40, 10);
    
    const buttonText = this.add.text(0, 0, text, {
      fontSize: '16px',
      fontFamily: 'Arial, sans-serif',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    
    button.add([bg, buttonText]);
    
    button.setInteractive(
      new Phaser.Geom.Rectangle(-60, -20, 120, 40),
      Phaser.Geom.Rectangle.Contains
    );
    
    button.on('pointerover', () => {
      bg.clear();
      bg.fillStyle(0x10b981, 1);
      bg.fillRoundedRect(-60, -20, 120, 40, 10);
      bg.lineStyle(2, 0xffd700);
      bg.strokeRoundedRect(-60, -20, 120, 40, 10);
    });
    
    button.on('pointerout', () => {
      bg.clear();
      bg.fillStyle(0x047857, 0.8);
      bg.fillRoundedRect(-60, -20, 120, 40, 10);
      bg.lineStyle(2, 0x10b981);
      bg.strokeRoundedRect(-60, -20, 120, 40, 10);
    });
    
    button.on('pointerdown', callback);
    
    return button;
  }
  
  private createMenuButtons(): void {
    const buttonY = 30;
    
    // Store button
    this.storeButton = this.createMenuButton(
      30,
      buttonY,
      '🏪 Store',
      () => this.openStore()
    );
    
    // Settings button
    this.settingsButton = this.createMenuButton(
      30,
      buttonY + 60,
      '⚙️ Settings',
      () => this.openSettings()
    );
  }
  
  private createMenuButton(
    x: number,
    y: number,
    text: string,
    callback: () => void
  ): Phaser.GameObjects.Container {
    const button = this.add.container(x, y);
    
    const bg = this.add.graphics();
    bg.fillStyle(0x2d3748, 0.9);
    bg.fillRoundedRect(-35, -15, 70, 30, 8);
    bg.lineStyle(1, 0x4a5568);
    bg.strokeRoundedRect(-35, -15, 70, 30, 8);
    
    const buttonText = this.add.text(0, 0, text, {
      fontSize: '12px',
      fontFamily: 'Arial, sans-serif',
      color: '#ffffff'
    }).setOrigin(0.5);
    
    button.add([bg, buttonText]);
    
    button.setInteractive(
      new Phaser.Geom.Rectangle(-35, -15, 70, 30),
      Phaser.Geom.Rectangle.Contains
    );
    
    button.on('pointerover', () => {
      this.tweens.add({
        targets: button,
        scaleX: 1.05,
        scaleY: 1.05,
        duration: 100
      });
    });
    
    button.on('pointerout', () => {
      this.tweens.add({
        targets: button,
        scaleX: 1,
        scaleY: 1,
        duration: 100
      });
    });
    
    button.on('pointerdown', callback);
    
    return button;
  }
  
  private refreshLevelGrid(): void {
    this.levelContainer.destroy();
    if (this.prevPageButton) this.prevPageButton.destroy();
    if (this.nextPageButton) this.nextPageButton.destroy();
    
    this.createLevelGrid();
    this.createNavigationButtons();
  }
  
  private updateDisplay(): void {
    // Update coin display
    const coinText = this.coinDisplay.getAt(2) as Phaser.GameObjects.Text;
    coinText.setText(this.gameState.coins.toString());
  }
  
  private startLevel(levelNumber: number): void {
    // Add sound effect
    // this.sound.play('button_click');
    
    // Transition to game scene
    this.scene.start('GameScene', {
      levelNumber,
      gameState: this.gameState
    });
  }
  
  private openStore(): void {
    this.scene.start('StoreScene', {
      gameState: this.gameState,
      returnScene: 'MenuScene'
    });
  }
  
  private openSettings(): void {
    this.scene.start('SettingsScene', {
      gameState: this.gameState,
      returnScene: 'MenuScene'
    });
  }
  
  private createInitialGameState(): GameState {
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
        difficulty: 'normal'
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
      }
    };
  }
}
