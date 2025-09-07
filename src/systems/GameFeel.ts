/**
 * Advanced Game Feel System for Snake Game
 * Implements cutting-edge juice techniques for maximum player satisfaction
 */
export class GameFeelManager {
  private scene: Phaser.Scene;
  private camera: Phaser.Cameras.Scene2D.Camera;
  private originalCameraZoom: number;
  
  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.camera = scene.cameras.main;
    this.originalCameraZoom = this.camera.zoom;
  }
  
  /**
   * Screen shake with customizable intensity and duration
   */
  screenShake(intensity: number = 8, duration: number = 150, frequency: number = 0.1): void {
    if ((this.camera as any).isShaking) return;
    
    this.camera.shake(duration, intensity * 0.01, false, (camera: any, progress: number) => {
      // Custom shake pattern for more organic feel
      const shake = Math.sin(progress * Math.PI * frequency) * intensity * (1 - progress);
      return shake;
    });
  }
  
  /**
   * Camera punch effect for food collection
   */
  cameraPunch(scale: number = 1.05, duration: number = 120): void {
    const originalZoom = this.camera.zoom;
    
    this.scene.tweens.add({
      targets: this.camera,
      zoom: originalZoom * scale,
      duration: duration * 0.3,
      yoyo: true,
      ease: 'Back.easeOut',
      onComplete: () => {
        this.camera.setZoom(originalZoom);
      }
    });
  }
  
  /**
   * Freeze frame effect for collision moments
   */
  freezeFrame(duration: number = 80): void {
    this.scene.physics.world.pause();
    this.scene.time.delayedCall(duration, () => {
      this.scene.physics.world.resume();
    });
  }
  
  /**
   * Flash effect for snake segments
   */
  flashEffect(target: Phaser.GameObjects.GameObject, 
             color: number = 0xFFFFFF, 
             intensity: number = 0.9, 
             duration: number = 100): void {
    if (!target) return;
    
    const originalTint = (target as any).tint || 0x66cc66;
    
    (target as any).setTint(color);
    (target as any).setAlpha(intensity);
    
    this.scene.tweens.add({
      targets: target,
      alpha: 1,
      duration: duration,
      ease: 'Power2',
      onComplete: () => {
        (target as any).setTint(originalTint);
      }
    });
  }
  
  /**
   * Squash and stretch for food collection
   */
  squashAndStretch(target: Phaser.GameObjects.GameObject, 
                  squashScale: number = 1.3, 
                  duration: number = 150): void {
    if (!target) return;
    
    const originalScale = (target as any).scale || 1;
    
    this.scene.tweens.add({
      targets: target,
      scale: originalScale * squashScale,
      duration: duration * 0.4,
      ease: 'Back.easeOut',
      yoyo: true,
      onComplete: () => {
        (target as any).setScale(originalScale);
      }
    });
  }
  
  /**
   * Ripple effect from food position
   */
  rippleEffect(x: number, y: number, maxRadius: number = 60, duration: number = 400): void {
    const circle = this.scene.add.circle(x, y, 3, 0x66cc66, 0.4);
    circle.setStrokeStyle(2, 0x66cc66, 0.8);
    
    this.scene.tweens.add({
      targets: circle,
      radius: maxRadius,
      alpha: 0,
      duration: duration,
      ease: 'Power2',
      onComplete: () => {
        circle.destroy();
      }
    });
  }
  
  /**
   * Particle burst for food collection
   */
  particleBurst(x: number, y: number, count: number = 8, colors: number[] = [0x66cc66, 0x88ee88, 0x44aa44]): void {
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const speed = Phaser.Math.Between(40, 100);
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed;
      
      const particle = this.scene.add.circle(x, y, Phaser.Math.Between(2, 4), 
        colors[Math.floor(Math.random() * colors.length)]);
      
      this.scene.tweens.add({
        targets: particle,
        x: x + vx * 0.5,
        y: y + vy * 0.5,
        alpha: 0,
        scale: 0,
        duration: Phaser.Math.Between(200, 500),
        ease: 'Power2',
        onComplete: () => {
          particle.destroy();
        }
      });
    }
  }
  
  /**
   * Snake movement anticipation
   */
  anticipation(target: Phaser.GameObjects.GameObject, 
              direction: { x: number, y: number }, 
              pullback: number = 2, 
              duration: number = 100): Promise<void> {
    return new Promise((resolve) => {
      const originalX = (target as any).x;
      const originalY = (target as any).y;
      
      this.scene.tweens.add({
        targets: target,
        x: originalX - direction.x * pullback,
        y: originalY - direction.y * pullback,
        duration: duration,
        ease: 'Power2',
        yoyo: true,
        onComplete: () => {
          resolve();
        }
      });
    });
  }
  
  /**
   * Trail effect for snake movement
   */
  createTrail(x: number, y: number, size: number = 8): void {
    const trail = this.scene.add.circle(x + size/2, y + size/2, size/2, 0x66cc66, 0.3);
    
    this.scene.tweens.add({
      targets: trail,
      alpha: 0,
      scale: 1.5,
      duration: 200,
      ease: 'Power2',
      onComplete: () => {
        trail.destroy();
      }
    });
  }
  
  /**
   * Score popup effect
   */
  scorePopup(x: number, y: number, score: number): void {
    const text = this.scene.add.text(x, y, `+${score}`, {
      fontSize: '16px',
      color: '#66cc66',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    
    this.scene.tweens.add({
      targets: text,
      y: y - 30,
      alpha: 0,
      scale: 1.2,
      duration: 800,
      ease: 'Power2',
      onComplete: () => {
        text.destroy();
      }
    });
  }
  
  /**
   * Game over dramatic effect
   */
  gameOverEffect(): void {
    // Screen flash
    const flash = this.scene.add.rectangle(0, 0, 800, 600, 0xff0000, 0.3);
    flash.setOrigin(0, 0);
    
    this.scene.tweens.add({
      targets: flash,
      alpha: 0,
      duration: 300,
      onComplete: () => {
        flash.destroy();
      }
    });
    
    // Slow motion effect
    this.scene.physics.world.timeScale = 0.5;
    this.scene.tweens.timeScale = 0.5;
    
    this.scene.time.delayedCall(500, () => {
      this.scene.physics.world.timeScale = 1;
      this.scene.tweens.timeScale = 1;
    });
  }
}