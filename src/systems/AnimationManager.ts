import Phaser from 'phaser';

/**
 * Animation Manager - Handles visual effects and animations
 */
export class AnimationManager {
  private scene: Phaser.Scene;
  private particles: Phaser.GameObjects.Particles.ParticleEmitter[] = [];
  private tweens: Phaser.Tweens.Tween[] = [];
  
  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }
  
  /**
   * Create food consumption animation
   */
  public animateFoodConsumption(x: number, y: number, foodType: string): void {
    const tileSize = 20;
    const worldX = x * tileSize + tileSize / 2;
    const worldY = y * tileSize + tileSize / 2;
    
    // Create particle burst
    this.createFoodParticles(worldX, worldY, foodType);
    
    // Create score popup
    this.createScorePopup(worldX, worldY, this.getFoodScore(foodType));
    
    // Create ripple effect
    this.createRippleEffect(worldX, worldY, this.getFoodColor(foodType));
  }
  
  private createFoodParticles(x: number, y: number, foodType: string): void {
    const config = this.getFoodParticleConfig(foodType);
    
    // Create temporary graphics for particle texture
    const graphics = this.scene.add.graphics();
    graphics.fillStyle(config.color);
    graphics.fillRect(0, 0, 4, 4);
    graphics.generateTexture('particle_' + foodType, 4, 4);
    graphics.destroy();
    
    // Create particle emitter
    const emitter = this.scene.add.particles(x, y, 'particle_' + foodType, {
      speed: { min: 50, max: 150 },
      scale: { start: 0.8, end: 0 },
      lifespan: config.lifespan,
      quantity: config.quantity,
      frequency: -1, // Explode once
      blendMode: config.blendMode || 'NORMAL'
    });
    
    // Auto-destroy after animation
    this.scene.time.delayedCall(config.lifespan + 100, () => {
      emitter.destroy();
      this.scene.textures.remove('particle_' + foodType);
    });
  }
  
  private getFoodParticleConfig(foodType: string): any {
    const configs: Record<string, any> = {
      apple: {
        color: 0xff4444,
        quantity: 8,
        lifespan: 600,
        blendMode: 'NORMAL'
      },
      golden: {
        color: 0xffd700,
        quantity: 12,
        lifespan: 800,
        blendMode: 'ADD'
      },
      speed: {
        color: 0x00ffff,
        quantity: 10,
        lifespan: 700,
        blendMode: 'ADD'
      },
      power: {
        color: 0xffff00,
        quantity: 15,
        lifespan: 1000,
        blendMode: 'ADD'
      },
      multi: {
        color: 0x00ff00,
        quantity: 20,
        lifespan: 900,
        blendMode: 'NORMAL'
      },
      bomb: {
        color: 0xff0000,
        quantity: 25,
        lifespan: 1200,
        blendMode: 'ADD'
      }
    };
    
    return configs[foodType] || configs.apple;
  }
  
  private createScorePopup(x: number, y: number, score: number): void {
    const text = this.scene.add.text(x, y, `+${score}`, {
      fontSize: '16px',
      fontFamily: 'Arial, sans-serif',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 2,
      fontStyle: 'bold'
    }).setOrigin(0.5);
    
    // Animate popup
    const tween = this.scene.tweens.add({
      targets: text,
      y: y - 50,
      alpha: 0,
      scale: 1.5,
      duration: 1000,
      ease: 'Quad.easeOut',
      onComplete: () => {
        text.destroy();
        const index = this.tweens.indexOf(tween);
        if (index > -1) this.tweens.splice(index, 1);
      }
    });
    
    this.tweens.push(tween);
  }
  
  private createRippleEffect(x: number, y: number, color: number): void {
    const graphics = this.scene.add.graphics();
    graphics.lineStyle(3, color, 0.8);
    graphics.strokeCircle(x, y, 5);
    
    const tween = this.scene.tweens.add({
      targets: graphics,
      scaleX: 4,
      scaleY: 4,
      alpha: 0,
      duration: 400,
      ease: 'Quad.easeOut',
      onComplete: () => {
        graphics.destroy();
        const index = this.tweens.indexOf(tween);
        if (index > -1) this.tweens.splice(index, 1);
      }
    });
    
    this.tweens.push(tween);
  }
  
  /**
   * Animate snake growth
   */
  public animateSnakeGrowth(segments: { x: number, y: number }[]): void {
    if (segments.length === 0) return;
    
    const lastSegment = segments[segments.length - 1];
    const tileSize = 20;
    const worldX = lastSegment.x * tileSize;
    const worldY = lastSegment.y * tileSize;
    
    // Create temporary segment that scales in
    const tempSegment = this.scene.add.rectangle(
      worldX + tileSize / 2,
      worldY + tileSize / 2,
      tileSize,
      tileSize,
      0x66cc66
    );
    
    tempSegment.setScale(0);
    
    const tween = this.scene.tweens.add({
      targets: tempSegment,
      scaleX: 1,
      scaleY: 1,
      duration: 200,
      ease: 'Back.easeOut',
      onComplete: () => {
        tempSegment.destroy();
        const index = this.tweens.indexOf(tween);
        if (index > -1) this.tweens.splice(index, 1);
      }
    });
    
    this.tweens.push(tween);
  }
  
  /**
   * Create death animation
   */
  public animateGameOver(snakeSegments: { x: number, y: number }[]): void {
    const tileSize = 20;
    
    // Create explosion at head
    if (snakeSegments.length > 0) {
      const head = snakeSegments[0];
      const headX = head.x * tileSize + tileSize / 2;
      const headY = head.y * tileSize + tileSize / 2;
      
      this.createExplosion(headX, headY);
    }
    
    // Animate segments disappearing
    snakeSegments.forEach((segment, index) => {
      const segmentX = segment.x * tileSize + tileSize / 2;
      const segmentY = segment.y * tileSize + tileSize / 2;
      
      this.scene.time.delayedCall(index * 50, () => {
        this.createSegmentDisappear(segmentX, segmentY);
      });
    });
  }
  
  private createExplosion(x: number, y: number): void {
    // Create explosion texture
    const graphics = this.scene.add.graphics();
    graphics.fillStyle(0xff4444);
    graphics.fillRect(0, 0, 6, 6);
    graphics.generateTexture('explosion_particle', 6, 6);
    graphics.destroy();
    
    const emitter = this.scene.add.particles(x, y, 'explosion_particle', {
      speed: { min: 100, max: 300 },
      scale: { start: 1, end: 0 },
      lifespan: 800,
      quantity: 30,
      frequency: -1,
      blendMode: 'ADD'
    });
    
    this.scene.time.delayedCall(1000, () => {
      emitter.destroy();
      this.scene.textures.remove('explosion_particle');
    });
  }
  
  private createSegmentDisappear(x: number, y: number): void {
    const segment = this.scene.add.rectangle(x, y, 20, 20, 0x66cc66);
    
    const tween = this.scene.tweens.add({
      targets: segment,
      scaleX: 0,
      scaleY: 0,
      alpha: 0,
      rotation: Math.PI,
      duration: 300,
      ease: 'Back.easeIn',
      onComplete: () => {
        segment.destroy();
        const index = this.tweens.indexOf(tween);
        if (index > -1) this.tweens.splice(index, 1);
      }
    });
    
    this.tweens.push(tween);
  }
  
  /**
   * Create level complete celebration
   */
  public animateLevelComplete(): void {
    this.createConfettiExplosion();
    this.createVictoryText();
    this.createFireworks();
  }
  
  private createConfettiExplosion(): void {
    const colors = [0xff4444, 0x44ff44, 0x4444ff, 0xffff44, 0xff44ff, 0x44ffff];
    
    colors.forEach((color, index) => {
      // Create confetti texture
      const graphics = this.scene.add.graphics();
      graphics.fillStyle(color);
      graphics.fillRect(0, 0, 8, 8);
      graphics.generateTexture(`confetti_${index}`, 8, 8);
      graphics.destroy();
      
      // Create confetti emitter
      const emitter = this.scene.add.particles(
        this.scene.scale.width / 2,
        -50,
        `confetti_${index}`,
        {
          x: { min: 0, max: this.scene.scale.width },
          y: -50,
          speedY: { min: 100, max: 300 },
          speedX: { min: -100, max: 100 },
          scale: { start: 0.8, end: 0.2 },
          rotation: { start: 0, end: 360 },
          lifespan: 3000,
          frequency: 50
        }
      );
      
      this.particles.push(emitter);
      
      // Stop and clean up after 2 seconds
      this.scene.time.delayedCall(2000, () => {
        emitter.stop();
        this.scene.time.delayedCall(3000, () => {
          emitter.destroy();
          this.scene.textures.remove(`confetti_${index}`);
          const particleIndex = this.particles.indexOf(emitter);
          if (particleIndex > -1) this.particles.splice(particleIndex, 1);
        });
      });
    });
  }
  
  private createVictoryText(): void {
    const text = this.scene.add.text(
      this.scene.scale.width / 2,
      this.scene.scale.height / 2,
      'LEVEL COMPLETE!',
      {
        fontSize: '48px',
        fontFamily: 'Arial, sans-serif',
        color: '#ffd700',
        stroke: '#000000',
        strokeThickness: 4,
        fontStyle: 'bold'
      }
    ).setOrigin(0.5);
    
    text.setScale(0);
    
    const tween = this.scene.tweens.add({
      targets: text,
      scaleX: 1,
      scaleY: 1,
      duration: 500,
      ease: 'Back.easeOut',
      onComplete: () => {
        // Keep text visible, will be cleaned up when scene changes
        const index = this.tweens.indexOf(tween);
        if (index > -1) this.tweens.splice(index, 1);
      }
    });
    
    this.tweens.push(tween);
    
    // Add pulsing effect
    const pulseTween = this.scene.tweens.add({
      targets: text,
      scaleX: 1.1,
      scaleY: 1.1,
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
    
    this.tweens.push(pulseTween);
  }
  
  private createFireworks(): void {
    const fireworkCount = 5;
    
    for (let i = 0; i < fireworkCount; i++) {
      this.scene.time.delayedCall(i * 400, () => {
        const x = Math.random() * this.scene.scale.width;
        const y = Math.random() * this.scene.scale.height * 0.6;
        
        this.createSingleFirework(x, y);
      });
    }
  }
  
  private createSingleFirework(x: number, y: number): void {
    const colors = [0xff4444, 0x44ff44, 0x4444ff, 0xffff44, 0xff44ff];
    const color = colors[Math.floor(Math.random() * colors.length)];
    
    // Create firework texture
    const graphics = this.scene.add.graphics();
    graphics.fillStyle(color);
    graphics.fillCircle(2, 2, 2);
    graphics.generateTexture('firework_' + Date.now(), 4, 4);
    const textureKey = 'firework_' + Date.now();
    graphics.destroy();
    
    const emitter = this.scene.add.particles(x, y, textureKey, {
      speed: { min: 150, max: 300 },
      scale: { start: 1, end: 0 },
      lifespan: 1000,
      quantity: 20,
      frequency: -1,
      blendMode: 'ADD'
    });
    
    this.scene.time.delayedCall(1200, () => {
      emitter.destroy();
      this.scene.textures.remove(textureKey);
    });
  }
  
  /**
   * Create power-up activation effect
   */
  public animatePowerUpActivation(type: string): void {
    switch (type) {
      case 'speed':
        this.createSpeedBoostEffect();
        break;
      case 'invincible':
        this.createInvincibilityEffect();
        break;
      case 'shrink':
        this.createShrinkEffect();
        break;
      case 'multi':
        this.createMultiFoodEffect();
        break;
      default:
        this.createGenericPowerUpEffect();
    }
  }
  
  private createSpeedBoostEffect(): void {
    const lines = [];
    
    for (let i = 0; i < 10; i++) {
      const line = this.scene.add.graphics();
      line.lineStyle(3, 0x00ffff, 0.8);
      line.lineBetween(0, 0, 50, 0);
      
      const x = Math.random() * this.scene.scale.width;
      const y = Math.random() * this.scene.scale.height;
      const angle = Math.random() * Math.PI * 2;
      
      line.setPosition(x, y);
      line.setRotation(angle);
      
      lines.push(line);
      
      const tween = this.scene.tweens.add({
        targets: line,
        x: x + Math.cos(angle) * 200,
        y: y + Math.sin(angle) * 200,
        alpha: 0,
        duration: 800,
        ease: 'Quad.easeOut',
        onComplete: () => {
          line.destroy();
          const index = this.tweens.indexOf(tween);
          if (index > -1) this.tweens.splice(index, 1);
        }
      });
      
      this.tweens.push(tween);
    }
  }
  
  private createInvincibilityEffect(): void {
    const shield = this.scene.add.graphics();
    shield.lineStyle(4, 0xffff00, 0.7);
    shield.strokeCircle(this.scene.scale.width / 2, this.scene.scale.height / 2, 100);
    
    const tween = this.scene.tweens.add({
      targets: shield,
      scaleX: 3,
      scaleY: 3,
      alpha: 0,
      duration: 1000,
      ease: 'Quad.easeOut',
      onComplete: () => {
        shield.destroy();
        const index = this.tweens.indexOf(tween);
        if (index > -1) this.tweens.splice(index, 1);
      }
    });
    
    this.tweens.push(tween);
  }
  
  private createShrinkEffect(): void {
    const circles = [];
    
    for (let i = 0; i < 5; i++) {
      const circle = this.scene.add.circle(
        this.scene.scale.width / 2,
        this.scene.scale.height / 2,
        50 + i * 20,
        0xff00ff,
        0.3 - i * 0.05
      );
      
      circles.push(circle);
      
      const tween = this.scene.tweens.add({
        targets: circle,
        scaleX: 0,
        scaleY: 0,
        duration: 600 + i * 100,
        ease: 'Back.easeIn',
        onComplete: () => {
          circle.destroy();
          const index = this.tweens.indexOf(tween);
          if (index > -1) this.tweens.splice(index, 1);
        }
      });
      
      this.tweens.push(tween);
    }
  }
  
  private createMultiFoodEffect(): void {
    const centerX = this.scene.scale.width / 2;
    const centerY = this.scene.scale.height / 2;
    
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const startX = centerX;
      const startY = centerY;
      const endX = centerX + Math.cos(angle) * 150;
      const endY = centerY + Math.sin(angle) * 150;
      
      const orb = this.scene.add.circle(startX, startY, 8, 0x00ff00, 0.8);
      
      const tween = this.scene.tweens.add({
        targets: orb,
        x: endX,
        y: endY,
        alpha: 0,
        duration: 800,
        ease: 'Quad.easeOut',
        onComplete: () => {
          orb.destroy();
          const index = this.tweens.indexOf(tween);
          if (index > -1) this.tweens.splice(index, 1);
        }
      });
      
      this.tweens.push(tween);
    }
  }
  
  private createGenericPowerUpEffect(): void {
    const star = this.scene.add.star(
      this.scene.scale.width / 2,
      this.scene.scale.height / 2,
      5, 20, 40,
      0xffd700
    );
    
    star.setScale(0);
    
    const tween = this.scene.tweens.add({
      targets: star,
      scaleX: 2,
      scaleY: 2,
      alpha: 0,
      rotation: Math.PI * 2,
      duration: 1000,
      ease: 'Quad.easeOut',
      onComplete: () => {
        star.destroy();
        const index = this.tweens.indexOf(tween);
        if (index > -1) this.tweens.splice(index, 1);
      }
    });
    
    this.tweens.push(tween);
  }
  
  /**
   * Screen shake effect
   */
  public shakeScreen(intensity: number = 10, duration: number = 300): void {
    const camera = this.scene.cameras.main;
    camera.shake(duration, intensity);
  }
  
  /**
   * Flash screen effect
   */
  public flashScreen(color: number = 0xffffff, alpha: number = 0.5, duration: number = 200): void {
    const flash = this.scene.add.rectangle(
      this.scene.scale.width / 2,
      this.scene.scale.height / 2,
      this.scene.scale.width,
      this.scene.scale.height,
      color,
      alpha
    );
    
    flash.setDepth(1000); // Ensure it's on top
    
    const tween = this.scene.tweens.add({
      targets: flash,
      alpha: 0,
      duration: duration,
      ease: 'Quad.easeOut',
      onComplete: () => {
        flash.destroy();
        const index = this.tweens.indexOf(tween);
        if (index > -1) this.tweens.splice(index, 1);
      }
    });
    
    this.tweens.push(tween);
  }
  
  /**
   * Cleanup all animations and particles
   */
  public cleanup(): void {
    // Stop all tweens
    this.tweens.forEach(tween => {
      if (tween && tween.isActive()) {
        tween.stop();
      }
    });
    this.tweens = [];
    
    // Destroy all particle emitters
    this.particles.forEach(emitter => {
      if (emitter && emitter.active) {
        emitter.destroy();
      }
    });
    this.particles = [];
  }
  
  // Helper methods
  private getFoodScore(foodType: string): number {
    const scores: Record<string, number> = {
      apple: 10,
      golden: 50,
      speed: 20,
      shrink: 30,
      multi: 25,
      power: 100,
      mystery: 75,
      coin: 0
    };
    return scores[foodType] || 10;
  }
  
  private getFoodColor(foodType: string): number {
    const colors: Record<string, number> = {
      apple: 0xff4444,
      golden: 0xffd700,
      speed: 0x00ffff,
      shrink: 0xff00ff,
      multi: 0x00ff00,
      power: 0xffff00,
      mystery: 0x8000ff,
      coin: 0xffa500
    };
    return colors[foodType] || 0xff4444;
  }
}