import Phaser from 'phaser';
import { GameState } from '../types/GameTypes';

export class SettingsScene extends Phaser.Scene {
  private gameState!: GameState;
  private returnScene!: string;

  constructor() {
    super({ key: 'SettingsScene' });
  }

  init(data: { gameState: GameState; returnScene: string }) {
    this.gameState = data.gameState;
    this.returnScene = data.returnScene || 'MenuScene';
  }

  create(): void {
    const { width, height } = this.scale;

    // Title
    this.add.text(width / 2, 40, 'Settings', {
      fontSize: '32px',
      fontFamily: 'Arial, sans-serif',
      color: '#ffffff',
      stroke: '#10b981',
      strokeThickness: 2
    }).setOrigin(0.5);

    const items: Array<{ label: () => string; onClick: () => void }> = [
      {
        label: () => `Music: ${this.gameState.settings.musicEnabled ? 'On' : 'Off'}`,
        onClick: () => {
          this.gameState.settings.musicEnabled = !this.gameState.settings.musicEnabled;
        }
      },
      {
        label: () => `SFX: ${this.gameState.settings.soundEnabled ? 'On' : 'Off'}`,
        onClick: () => {
          this.gameState.settings.soundEnabled = !this.gameState.settings.soundEnabled;
        }
      },
      {
        label: () => `Vibration: ${this.gameState.settings.vibrationEnabled ? 'On' : 'Off'}`,
        onClick: () => {
          this.gameState.settings.vibrationEnabled = !this.gameState.settings.vibrationEnabled;
        }
      },
      {
        label: () => `Controls: ${this.gameState.settings.controlScheme}`,
        onClick: () => {
          const order: Array<'swipe' | 'buttons' | 'keyboard'> = ['swipe', 'buttons', 'keyboard'];
          const idx = order.indexOf(this.gameState.settings.controlScheme);
          this.gameState.settings.controlScheme = order[(idx + 1) % order.length];
        }
      },
      {
        label: () => `Difficulty: ${this.gameState.settings.difficulty}`,
        onClick: () => {
          const order: Array<'easy' | 'normal' | 'hard'> = ['easy', 'normal', 'hard'];
          const idx = order.indexOf(this.gameState.settings.difficulty);
          this.gameState.settings.difficulty = order[(idx + 1) % order.length];
        }
      },
      {
        label: () => `Lives: ${this.gameState.settings.persistLives ? 'Persist Across Levels' : 'Reset Each Level'}`,
        onClick: () => {
          this.gameState.settings.persistLives = !this.gameState.settings.persistLives;
        }
      }
    ];

    const btns: Phaser.GameObjects.Text[] = [];
    items.forEach((item, i) => {
      const t = this.add.text(width / 2, 120 + i * 50, item.label(), {
        fontSize: '20px',
        fontFamily: 'Arial, sans-serif',
        color: '#ffffff',
        backgroundColor: '#1f2937',
        padding: { x: 10, y: 6 }
      }).setOrigin(0.5);
      t.setInteractive({ useHandCursor: true }).on('pointerdown', () => {
        item.onClick();
        // Refresh labels
        btns.forEach((b, bi) => b.setText(items[bi].label()));
      });
      btns.push(t);
    });

    // Back button
    const back = this.add.text(width / 2, height - 60, '← Back', {
      fontSize: '22px',
      fontFamily: 'Arial, sans-serif',
      color: '#ffffff',
      backgroundColor: '#dc2626',
      padding: { x: 12, y: 8 }
    }).setOrigin(0.5);
    back.setInteractive({ useHandCursor: true }).on('pointerdown', () => {
      this.scene.start(this.returnScene, { gameState: this.gameState });
    });
  }
}
