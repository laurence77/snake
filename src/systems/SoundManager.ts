import Phaser from 'phaser';

/**
 * Sound Manager - Handles all audio effects and music
 */
export class SoundManager {
  private scene: Phaser.Scene;
  private sounds: Map<string, Phaser.Sound.BaseSound> = new Map();
  private musicVolume: number = 0.7;
  private sfxVolume: number = 0.8;
  private musicEnabled: boolean = true;
  private sfxEnabled: boolean = true;
  
  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.preloadSounds();
  }
  
  private preloadSounds(): void {
    // Note: In a real implementation, you would load actual audio files
    // For now, we'll create placeholder sounds using Web Audio API
    
    this.createSynthSounds();
  }
  
  private createSynthSounds(): void {
    // Create synthetic sounds using Web Audio API for immediate functionality
    // These would be replaced with actual audio files in production
    
    const audioContext = (this.scene.sound as any).context;
    if (!audioContext) return;
    
    // Food eaten sound (short beep)
    this.createBeepSound('food_eaten', 440, 0.1, 'triangle');
    
    // Golden apple sound (higher pitched beep)
    this.createBeepSound('golden_apple', 660, 0.15, 'sine');
    
    // Power-up activation (ascending notes)
    this.createPowerUpSound('power_up', [330, 440, 550], 0.3);
    
    // Game over sound (descending notes)
    this.createGameOverSound('game_over');
    
    // Level complete (victory fanfare)
    this.createVictorySound('level_complete');
    
    // Button click
    this.createBeepSound('button_click', 220, 0.05, 'square');
    
    // Purchase success
    this.createChimeSound('purchase_success');
    
    // Snake movement (subtle tick)
    this.createTickSound('snake_move');
    
    // Bomb food warning
    this.createWarningSound('bomb_warning');
    
    // Speed boost effect
    this.createWhooshSound('speed_boost');
  }
  
  private createBeepSound(
    name: string, 
    frequency: number, 
    duration: number, 
    waveType: OscillatorType = 'sine'
  ): void {
    // Create a simple beep sound
    const sound = {
      play: () => {
        if (!this.sfxEnabled) return;
        
        const audioContext = new AudioContext();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = frequency;
        oscillator.type = waveType;
        
        gainNode.gain.setValueAtTime(this.sfxVolume * 0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
        
        oscillator.start();
        oscillator.stop(audioContext.currentTime + duration);
      },
      setVolume: (volume: number) => {}, // Placeholder
      stop: () => {} // Placeholder
    };
    
    this.sounds.set(name, sound as any);
  }
  
  private createPowerUpSound(name: string, frequencies: number[], duration: number): void {
    const sound = {
      play: () => {
        if (!this.sfxEnabled) return;
        
        frequencies.forEach((freq, index) => {
          setTimeout(() => {
            const audioContext = new AudioContext();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.value = freq;
            oscillator.type = 'sine';
            
            gainNode.gain.setValueAtTime(this.sfxVolume * 0.2, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
            
            oscillator.start();
            oscillator.stop(audioContext.currentTime + 0.2);
          }, index * 100);
        });
      },
      setVolume: (volume: number) => {},
      stop: () => {}
    };
    
    this.sounds.set(name, sound as any);
  }
  
  private createGameOverSound(name: string): void {
    const sound = {
      play: () => {
        if (!this.sfxEnabled) return;
        
        const frequencies = [440, 369, 329, 293]; // A4, F#4, E4, D4
        frequencies.forEach((freq, index) => {
          setTimeout(() => {
            const audioContext = new AudioContext();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.value = freq;
            oscillator.type = 'sine';
            
            gainNode.gain.setValueAtTime(this.sfxVolume * 0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
            
            oscillator.start();
            oscillator.stop(audioContext.currentTime + 0.5);
          }, index * 200);
        });
      },
      setVolume: (volume: number) => {},
      stop: () => {}
    };
    
    this.sounds.set(name, sound as any);
  }
  
  private createVictorySound(name: string): void {
    const sound = {
      play: () => {
        if (!this.sfxEnabled) return;
        
        const melody = [261, 329, 392, 523]; // C4, E4, G4, C5
        melody.forEach((freq, index) => {
          setTimeout(() => {
            const audioContext = new AudioContext();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.value = freq;
            oscillator.type = 'triangle';
            
            gainNode.gain.setValueAtTime(this.sfxVolume * 0.4, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
            
            oscillator.start();
            oscillator.stop(audioContext.currentTime + 0.3);
          }, index * 150);
        });
      },
      setVolume: (volume: number) => {},
      stop: () => {}
    };
    
    this.sounds.set(name, sound as any);
  }
  
  private createChimeSound(name: string): void {
    const sound = {
      play: () => {
        if (!this.sfxEnabled) return;
        
        [523, 659, 784].forEach((freq, index) => {
          setTimeout(() => {
            const audioContext = new AudioContext();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.value = freq;
            oscillator.type = 'sine';
            
            gainNode.gain.setValueAtTime(this.sfxVolume * 0.2, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4);
            
            oscillator.start();
            oscillator.stop(audioContext.currentTime + 0.4);
          }, index * 100);
        });
      },
      setVolume: (volume: number) => {},
      stop: () => {}
    };
    
    this.sounds.set(name, sound as any);
  }
  
  private createTickSound(name: string): void {
    const sound = {
      play: () => {
        if (!this.sfxEnabled) return;
        
        const audioContext = new AudioContext();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = 800;
        oscillator.type = 'square';
        
        gainNode.gain.setValueAtTime(this.sfxVolume * 0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.02);
        
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.02);
      },
      setVolume: (volume: number) => {},
      stop: () => {}
    };
    
    this.sounds.set(name, sound as any);
  }
  
  private createWarningSound(name: string): void {
    const sound = {
      play: () => {
        if (!this.sfxEnabled) return;
        
        for (let i = 0; i < 3; i++) {
          setTimeout(() => {
            const audioContext = new AudioContext();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.value = 200;
            oscillator.type = 'sawtooth';
            
            gainNode.gain.setValueAtTime(this.sfxVolume * 0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
            
            oscillator.start();
            oscillator.stop(audioContext.currentTime + 0.1);
          }, i * 150);
        }
      },
      setVolume: (volume: number) => {},
      stop: () => {}
    };
    
    this.sounds.set(name, sound as any);
  }
  
  private createWhooshSound(name: string): void {
    const sound = {
      play: () => {
        if (!this.sfxEnabled) return;
        
        const audioContext = new AudioContext();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(1000, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(2000, audioContext.currentTime + 0.3);
        oscillator.type = 'sawtooth';
        
        gainNode.gain.setValueAtTime(this.sfxVolume * 0.2, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
        
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.3);
      },
      setVolume: (volume: number) => {},
      stop: () => {}
    };
    
    this.sounds.set(name, sound as any);
  }
  
  // Public methods
  
  /**
   * Play a sound effect
   */
  public playSound(soundName: string, volume?: number): void {
    const sound = this.sounds.get(soundName);
    if (!sound || !this.sfxEnabled) return;
    
    if (volume !== undefined) {
      (sound as any).setVolume(volume * this.sfxVolume);
    }
    
    sound.play();
  }
  
  /**
   * Play food eaten sound based on food type
   */
  public playFoodSound(foodType: string): void {
    switch (foodType) {
      case 'golden':
        this.playSound('golden_apple');
        break;
      case 'speed':
      case 'power':
      case 'multi':
        this.playSound('power_up');
        break;
      case 'bomb':
        this.playSound('bomb_warning');
        break;
      default:
        this.playSound('food_eaten');
    }
  }
  
  /**
   * Play background music (looped)
   */
  public playMusic(musicName: string, loop: boolean = true): void {
    if (!this.musicEnabled) return;
    
    // Stop current music
    this.stopMusic();
    
    // In a real implementation, you would load and play actual music files
    // For now, we'll create a simple ambient background tone
    this.createBackgroundMusic(musicName);
  }
  
  private createBackgroundMusic(name: string): void {
    if (!this.musicEnabled) return;
    
    // Create a subtle ambient background tone
    const audioContext = new AudioContext();
    const oscillator1 = audioContext.createOscillator();
    const oscillator2 = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator1.connect(gainNode);
    oscillator2.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // Create a subtle pad sound
    oscillator1.frequency.value = 110; // Low A
    oscillator2.frequency.value = 165; // E above A
    oscillator1.type = 'sine';
    oscillator2.type = 'sine';
    
    gainNode.gain.setValueAtTime(this.musicVolume * 0.1, audioContext.currentTime);
    
    oscillator1.start();
    oscillator2.start();
    
    // Store reference for stopping later
    this.sounds.set('background_music', {
      play: () => {},
      setVolume: (volume: number) => {
        gainNode.gain.setValueAtTime(volume * this.musicVolume * 0.1, audioContext.currentTime);
      },
      stop: () => {
        oscillator1.stop();
        oscillator2.stop();
      }
    } as any);
  }
  
  /**
   * Stop background music
   */
  public stopMusic(): void {
    const music = this.sounds.get('background_music');
    if (music) {
      music.stop();
      this.sounds.delete('background_music');
    }
  }
  
  /**
   * Set music volume (0-1)
   */
  public setMusicVolume(volume: number): void {
    this.musicVolume = Math.max(0, Math.min(1, volume));
    
    const music = this.sounds.get('background_music');
    if (music) {
      (music as any).setVolume(this.musicVolume);
    }
  }
  
  /**
   * Set sound effects volume (0-1)
   */
  public setSFXVolume(volume: number): void {
    this.sfxVolume = Math.max(0, Math.min(1, volume));
  }
  
  /**
   * Enable/disable music
   */
  public setMusicEnabled(enabled: boolean): void {
    this.musicEnabled = enabled;
    
    if (!enabled) {
      this.stopMusic();
    }
  }
  
  /**
   * Enable/disable sound effects
   */
  public setSFXEnabled(enabled: boolean): void {
    this.sfxEnabled = enabled;
  }
  
  /**
   * Get current music volume
   */
  public getMusicVolume(): number {
    return this.musicVolume;
  }
  
  /**
   * Get current SFX volume
   */
  public getSFXVolume(): number {
    return this.sfxVolume;
  }
  
  /**
   * Check if music is enabled
   */
  public isMusicEnabled(): boolean {
    return this.musicEnabled;
  }
  
  /**
   * Check if SFX is enabled
   */
  public isSFXEnabled(): boolean {
    return this.sfxEnabled;
  }
  
  /**
   * Stop all sounds
   */
  public stopAllSounds(): void {
    this.sounds.forEach(sound => {
      sound.stop();
    });
    this.sounds.clear();
  }
  
  /**
   * Cleanup resources
   */
  public destroy(): void {
    this.stopAllSounds();
  }
}