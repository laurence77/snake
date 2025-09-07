import Phaser from 'phaser';
import { StoreSystem } from '../systems/StoreSystem';
import { StoreItem, StoreItemType, GameState } from '../types/GameTypes';

/**
 * Store Scene - Browse and purchase items
 */
export class StoreScene extends Phaser.Scene {
  private storeSystem!: StoreSystem;
  private gameState!: GameState;
  private returnScene!: string;
  private currentCategory: StoreItemType | 'all' | 'daily' | 'featured' = 'all';
  
  // UI Elements
  private background!: Phaser.GameObjects.Graphics;
  private headerContainer!: Phaser.GameObjects.Container;
  private categoryContainer!: Phaser.GameObjects.Container;
  private itemsContainer!: Phaser.GameObjects.Container;
  private coinDisplay!: Phaser.GameObjects.Container;
  private backButton!: Phaser.GameObjects.Container;
  
  // Item display
  private itemsPerRow = 3;
  private itemsPerPage = 9;
  private currentPage = 0;
  private currentItems: StoreItem[] = [];
  
  constructor() {
    super({ key: 'StoreScene' });
  }
  
  init(data: { gameState: GameState; returnScene: string }) {
    this.storeSystem = new StoreSystem();
    this.gameState = data.gameState;
    this.returnScene = data.returnScene || 'MenuScene';
  }
  
  create() {
    this.createBackground();
    this.createHeader();
    this.createCategoryTabs();
    this.createItemsGrid();
    this.createBackButton();
    this.updateItemsDisplay();
  }
  
  private createBackground(): void {
    this.background = this.add.graphics();
    
    // Store-themed gradient background
    this.background.fillGradientStyle(0x1a202c, 0x2d3748, 0x2d3748, 0x4a5568, 1);
    this.background.fillRect(0, 0, this.scale.width, this.scale.height);
    
    // Add decorative elements
    this.createStoreDecorations();
  }
  
  private createStoreDecorations(): void {
    // Add some coin particles floating in background
    for (let i = 0; i < 15; i++) {
      const coin = this.add.circle(
        Math.random() * this.scale.width,
        Math.random() * this.scale.height,
        Math.random() * 8 + 3,
        0xffd700,
        0.1
      );
      
      this.tweens.add({
        targets: coin,
        y: coin.y - 50,
        rotation: Math.PI * 2,
        alpha: 0.05 + Math.random() * 0.1,
        duration: 4000 + Math.random() * 2000,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    }
  }
  
  private createHeader(): void {
    this.headerContainer = this.add.container(0, 0);
    
    // Title
    const title = this.add.text(
      this.scale.width / 2,
      40,
      '🏪 Snake Store',
      {
        fontSize: '36px',
        fontFamily: 'Arial, sans-serif',
        color: '#ffffff',
        stroke: '#ffd700',
        strokeThickness: 2
      }
    ).setOrigin(0.5);
    
    // Coin display
    this.coinDisplay = this.add.container(this.scale.width - 120, 30);
    
    const coinBg = this.add.graphics();
    coinBg.fillStyle(0x047857, 0.9);
    coinBg.fillRoundedRect(-60, -15, 120, 30, 15);
    coinBg.lineStyle(2, 0xffd700);
    coinBg.strokeRoundedRect(-60, -15, 120, 30, 15);
    
    const coinIcon = this.add.circle(-35, 0, 10, 0xffd700);
    coinIcon.setStrokeStyle(2, 0xffa500);
    
    const coinText = this.add.text(10, 0, this.gameState.coins.toString(), {
      fontSize: '18px',
      fontFamily: 'Arial, sans-serif',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    
    this.coinDisplay.add([coinBg, coinIcon, coinText]);
    this.headerContainer.add([title, this.coinDisplay]);
  }
  
  private createCategoryTabs(): void {
    this.categoryContainer = this.add.container(0, 80);
    
    const categories = [
      { key: 'all', name: 'All Items', icon: '📦' },
      { key: 'daily', name: 'Daily Deals', icon: '⏰' },
      { key: 'featured', name: 'Featured', icon: '⭐' },
      { key: StoreItemType.SKIN, name: 'Skins', icon: '🐍' },
      { key: StoreItemType.THEME, name: 'Themes', icon: '🎨' },
      { key: StoreItemType.POWERUP, name: 'Power-ups', icon: '⚡' },
      { key: StoreItemType.BOOSTER, name: 'Boosters', icon: '🚀' }
    ];
    
    const tabWidth = 100;
    const startX = (this.scale.width - (categories.length * tabWidth)) / 2;
    
    categories.forEach((category, index) => {
      const x = startX + index * tabWidth;
      const y = 0;
      
      this.createCategoryTab(x, y, category.key as any, category.name, category.icon);
    });
  }
  
  private createCategoryTab(
    x: number,
    y: number,
    categoryKey: StoreItemType | 'all' | 'daily' | 'featured',
    name: string,
    icon: string
  ): void {
    const tab = this.add.container(x, y);
    
    const isActive = this.currentCategory === categoryKey;
    
    // Tab background
    const bg = this.add.graphics();
    const bgColor = isActive ? 0x10b981 : 0x4a5568;
    const borderColor = isActive ? 0xffd700 : 0x718096;
    
    bg.fillStyle(bgColor, 0.9);
    bg.fillRoundedRect(-40, -20, 80, 40, 8);
    bg.lineStyle(2, borderColor);
    bg.strokeRoundedRect(-40, -20, 80, 40, 8);
    
    // Tab icon
    const tabIcon = this.add.text(0, -8, icon, {
      fontSize: '16px'
    }).setOrigin(0.5);
    
    // Tab text
    const tabText = this.add.text(0, 8, name, {
      fontSize: '10px',
      fontFamily: 'Arial, sans-serif',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    
    tab.add([bg, tabIcon, tabText]);
    this.categoryContainer.add(tab);
    
    // Add interactivity
    tab.setInteractive(
      new Phaser.Geom.Rectangle(-40, -20, 80, 40),
      Phaser.Geom.Rectangle.Contains
    );
    
    tab.on('pointerover', () => {
      if (this.currentCategory !== categoryKey) {
        bg.clear();
        bg.fillStyle(0x68d391, 0.9);
        bg.fillRoundedRect(-40, -20, 80, 40, 8);
        bg.lineStyle(2, 0xffd700);
        bg.strokeRoundedRect(-40, -20, 80, 40, 8);
      }
    });
    
    tab.on('pointerout', () => {
      if (this.currentCategory !== categoryKey) {
        bg.clear();
        bg.fillStyle(0x4a5568, 0.9);
        bg.fillRoundedRect(-40, -20, 80, 40, 8);
        bg.lineStyle(2, 0x718096);
        bg.strokeRoundedRect(-40, -20, 80, 40, 8);
      }
    });
    
    tab.on('pointerdown', () => {
      this.switchCategory(categoryKey);
    });
  }
  
  private createItemsGrid(): void {
    this.itemsContainer = this.add.container(0, 150);
  }
  
  private createBackButton(): void {
    this.backButton = this.add.container(60, this.scale.height - 40);
    
    const bg = this.add.graphics();
    bg.fillStyle(0xdc2626, 0.8);
    bg.fillRoundedRect(-40, -20, 80, 40, 10);
    bg.lineStyle(2, 0xf87171);
    bg.strokeRoundedRect(-40, -20, 80, 40, 10);
    
    const backText = this.add.text(0, 0, '← Back', {
      fontSize: '16px',
      fontFamily: 'Arial, sans-serif',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    
    this.backButton.add([bg, backText]);
    
    this.backButton.setInteractive(
      new Phaser.Geom.Rectangle(-40, -20, 80, 40),
      Phaser.Geom.Rectangle.Contains
    );
    
    this.backButton.on('pointerover', () => {
      this.tweens.add({
        targets: this.backButton,
        scaleX: 1.05,
        scaleY: 1.05,
        duration: 100
      });
    });
    
    this.backButton.on('pointerout', () => {
      this.tweens.add({
        targets: this.backButton,
        scaleX: 1,
        scaleY: 1,
        duration: 100
      });
    });
    
    this.backButton.on('pointerdown', () => {
      this.scene.start(this.returnScene, { gameState: this.gameState });
    });
  }
  
  private switchCategory(category: StoreItemType | 'all' | 'daily' | 'featured'): void {
    this.currentCategory = category;
    this.currentPage = 0;
    
    // Recreate category tabs with new active state
    this.categoryContainer.destroy();
    this.createCategoryTabs();
    
    // Update items display
    this.updateItemsDisplay();
  }
  
  private updateItemsDisplay(): void {
    // Get items for current category
    this.currentItems = this.getItemsForCategory();
    
    // Clear existing items
    this.itemsContainer.removeAll(true);
    
    // Create item cards
    const startIndex = this.currentPage * this.itemsPerPage;
    const endIndex = Math.min(startIndex + this.itemsPerPage, this.currentItems.length);
    const itemsToShow = this.currentItems.slice(startIndex, endIndex);
    
    const cardWidth = 140;
    const cardHeight = 180;
    const padding = 20;
    const startX = (this.scale.width - (this.itemsPerRow * (cardWidth + padding))) / 2 + cardWidth / 2;
    const startY = 40;
    
    itemsToShow.forEach((item, index) => {
      const row = Math.floor(index / this.itemsPerRow);
      const col = index % this.itemsPerRow;
      const x = startX + col * (cardWidth + padding);
      const y = startY + row * (cardHeight + padding);
      
      this.createItemCard(item, x, y, cardWidth, cardHeight);
    });
    
    // Create pagination if needed
    this.createPagination();
  }
  
  private getItemsForCategory(): StoreItem[] {
    switch (this.currentCategory) {
      case 'all':
        return this.storeSystem.getAvailableItems(this.gameState);
        
      case 'daily':
        return this.storeSystem.getDailyOffers();
        
      case 'featured':
        return this.storeSystem.getFeaturedItems(this.gameState);
        
      default:
        return this.storeSystem.getItemsByType(this.currentCategory as StoreItemType)
          .filter(item => this.storeSystem.isItemUnlocked(item, this.gameState));
    }
  }
  
  private createItemCard(
    item: StoreItem,
    x: number,
    y: number,
    width: number,
    height: number
  ): void {
    const card = this.add.container(x, y);
    
    const isOwned = this.storeSystem.isItemOwned(item, this.gameState);
    const canAfford = this.storeSystem.canAffordItem(item, this.gameState);
    
    // Card background
    const bg = this.add.graphics();
    const bgColor = isOwned ? 0x065f46 : (canAfford ? 0x1f2937 : 0x374151);
    const borderColor = this.getRarityColor(item.rarity);
    
    bg.fillStyle(bgColor, 0.9);
    bg.fillRoundedRect(-width/2, -height/2, width, height, 12);
    bg.lineStyle(3, borderColor);
    bg.strokeRoundedRect(-width/2, -height/2, width, height, 12);
    
    // Item icon/preview
    const itemIcon = this.getItemIcon(item);
    const icon = this.add.text(0, -50, itemIcon, {
      fontSize: '32px'
    }).setOrigin(0.5);
    
    // Item name
    const name = this.add.text(0, -10, item.name, {
      fontSize: '12px',
      fontFamily: 'Arial, sans-serif',
      color: '#ffffff',
      fontStyle: 'bold',
      wordWrap: { width: width - 20 }
    }).setOrigin(0.5);
    
    // Item description
    const description = this.add.text(0, 15, item.description, {
      fontSize: '9px',
      fontFamily: 'Arial, sans-serif',
      color: '#cccccc',
      wordWrap: { width: width - 20 },
      align: 'center'
    }).setOrigin(0.5);
    
    // Price and purchase button
    let purchaseButton;
    
    if (isOwned && !item.isConsumable) {
      // Owned indicator
      purchaseButton = this.add.text(0, 65, 'OWNED', {
        fontSize: '12px',
        fontFamily: 'Arial, sans-serif',
        color: '#10b981',
        fontStyle: 'bold'
      }).setOrigin(0.5);
    } else {
      // Purchase button
      const buttonBg = this.add.graphics();
      const buttonColor = canAfford ? 0x10b981 : 0x6b7280;
      
      buttonBg.fillStyle(buttonColor, 0.9);
      buttonBg.fillRoundedRect(-50, 50, 100, 25, 8);
      
      const currencyIcon = item.currency === 'coins' ? '🪙' : '💎';
      const buttonText = this.add.text(
        0,
        62,
        `${currencyIcon} ${item.price}`,
        {
          fontSize: '11px',
          fontFamily: 'Arial, sans-serif',
          color: '#ffffff',
          fontStyle: 'bold'
        }
      ).setOrigin(0.5);
      
      purchaseButton = this.add.container(0, 0, [buttonBg, buttonText]);
      
      if (canAfford) {
        purchaseButton.setInteractive(
          new Phaser.Geom.Rectangle(-50, 50, 100, 25),
          Phaser.Geom.Rectangle.Contains
        );
        
        purchaseButton.on('pointerover', () => {
          buttonBg.clear();
          buttonBg.fillStyle(0x059669, 1);
          buttonBg.fillRoundedRect(-50, 50, 100, 25, 8);
        });
        
        purchaseButton.on('pointerout', () => {
          buttonBg.clear();
          buttonBg.fillStyle(0x10b981, 0.9);
          buttonBg.fillRoundedRect(-50, 50, 100, 25, 8);
        });
        
        purchaseButton.on('pointerdown', () => {
          this.purchaseItem(item);
        });
      }
    }
    
    // Rarity indicator
    const rarityBadge = this.add.text(-width/2 + 8, -height/2 + 8, this.getRarityLabel(item.rarity), {
      fontSize: '8px',
      fontFamily: 'Arial, sans-serif',
      color: '#ffffff',
      backgroundColor: this.getRarityColorHex(item.rarity),
      padding: { x: 4, y: 2 }
    });
    
    card.add([bg, icon, name, description, purchaseButton, rarityBadge]);
    this.itemsContainer.add(card);
    
    // Add hover effect for the entire card
    card.setInteractive(
      new Phaser.Geom.Rectangle(-width/2, -height/2, width, height),
      Phaser.Geom.Rectangle.Contains
    );
    
    card.on('pointerover', () => {
      this.tweens.add({
        targets: card,
        scaleX: 1.05,
        scaleY: 1.05,
        duration: 200,
        ease: 'Back.easeOut'
      });
    });
    
    card.on('pointerout', () => {
      this.tweens.add({
        targets: card,
        scaleX: 1,
        scaleY: 1,
        duration: 200,
        ease: 'Back.easeOut'
      });
    });
  }
  
  private createPagination(): void {
    const totalPages = Math.ceil(this.currentItems.length / this.itemsPerPage);
    if (totalPages <= 1) return;
    
    const paginationY = this.scale.height - 80;
    
    // Previous button
    if (this.currentPage > 0) {
      const prevButton = this.createPaginationButton(
        this.scale.width / 2 - 60,
        paginationY,
        '◀',
        () => {
          this.currentPage--;
          this.updateItemsDisplay();
        }
      );
    }
    
    // Page indicator
    this.add.text(
      this.scale.width / 2,
      paginationY,
      `${this.currentPage + 1} / ${totalPages}`,
      {
        fontSize: '14px',
        fontFamily: 'Arial, sans-serif',
        color: '#ffffff'
      }
    ).setOrigin(0.5);
    
    // Next button
    if (this.currentPage < totalPages - 1) {
      const nextButton = this.createPaginationButton(
        this.scale.width / 2 + 60,
        paginationY,
        '▶',
        () => {
          this.currentPage++;
          this.updateItemsDisplay();
        }
      );
    }
  }
  
  private createPaginationButton(
    x: number,
    y: number,
    text: string,
    callback: () => void
  ): Phaser.GameObjects.Container {
    const button = this.add.container(x, y);
    
    const bg = this.add.graphics();
    bg.fillStyle(0x4a5568, 0.8);
    bg.fillCircle(0, 0, 20);
    bg.lineStyle(2, 0x718096);
    bg.strokeCircle(0, 0, 20);
    
    const buttonText = this.add.text(0, 0, text, {
      fontSize: '16px',
      fontFamily: 'Arial, sans-serif',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    
    button.add([bg, buttonText]);
    this.itemsContainer.add(button);
    
    button.setInteractive(
      new Phaser.Geom.Circle(0, 0, 20),
      Phaser.Geom.Circle.Contains
    );
    
    button.on('pointerover', () => {
      bg.clear();
      bg.fillStyle(0x10b981, 1);
      bg.fillCircle(0, 0, 20);
      bg.lineStyle(2, 0xffd700);
      bg.strokeCircle(0, 0, 20);
    });
    
    button.on('pointerout', () => {
      bg.clear();
      bg.fillStyle(0x4a5568, 0.8);
      bg.fillCircle(0, 0, 20);
      bg.lineStyle(2, 0x718096);
      bg.strokeCircle(0, 0, 20);
    });
    
    button.on('pointerdown', callback);
    
    return button;
  }
  
  private purchaseItem(item: StoreItem): void {
    const result = this.storeSystem.purchaseItem(item.id, this.gameState);
    
    if (result.success && result.newGameState) {
      this.gameState = result.newGameState;
      
      // Update coin display
      const coinText = this.coinDisplay.getAt(2) as Phaser.GameObjects.Text;
      coinText.setText(this.gameState.coins.toString());
      
      // Show purchase success effect
      this.showPurchaseSuccess(item);
      
      // Refresh the display
      this.updateItemsDisplay();
    } else {
      // Show error message
      this.showPurchaseError(result.message);
    }
  }
  
  private showPurchaseSuccess(item: StoreItem): void {
    const successText = this.add.text(
      this.scale.width / 2,
      this.scale.height / 2,
      `${item.name} purchased!`,
      {
        fontSize: '24px',
        fontFamily: 'Arial, sans-serif',
        color: '#10b981',
        fontStyle: 'bold',
        stroke: '#000000',
        strokeThickness: 2
      }
    ).setOrigin(0.5);
    
    this.tweens.add({
      targets: successText,
      y: successText.y - 50,
      alpha: 0,
      duration: 2000,
      ease: 'Quad.easeOut',
      onComplete: () => successText.destroy()
    });
  }
  
  private showPurchaseError(message: string): void {
    const errorText = this.add.text(
      this.scale.width / 2,
      this.scale.height / 2,
      message,
      {
        fontSize: '18px',
        fontFamily: 'Arial, sans-serif',
        color: '#ef4444',
        fontStyle: 'bold',
        stroke: '#000000',
        strokeThickness: 2
      }
    ).setOrigin(0.5);
    
    this.tweens.add({
      targets: errorText,
      alpha: 0,
      duration: 3000,
      ease: 'Quad.easeOut',
      onComplete: () => errorText.destroy()
    });
  }
  
  // Helper methods
  private getItemIcon(item: StoreItem): string {
    const icons: Record<string, string> = {
      // Skins
      classic_skin: '🐍',
      rainbow_skin: '🌈',
      metal_skin: '🤖',
      fire_skin: '🔥',
      galaxy_skin: '🌌',
      shadow_skin: '👤',
      
      // Themes
      neon_theme: '🌃',
      retro_theme: '👾',
      nature_theme: '🌲',
      space_theme: '🚀',
      
      // Power-ups
      speed_boost: '⚡',
      shield_power: '🛡️',
      coin_magnet: '🧲',
      double_points: '✖️',
      food_rain: '🌧️',
      time_freeze: '❄️',
      
      // Boosters
      coin_boost_10: '💰',
      coin_boost_25: '💸',
      xp_boost_15: '📈',
      lucky_food: '🍀',
      
      // Lives
      extra_life: '❤️',
      life_pack_5: '💕'
    };
    
    return icons[item.id] || '📦';
  }
  
  private getRarityColor(rarity: string): number {
    const colors: Record<string, number> = {
      common: 0x6b7280,
      rare: 0x3b82f6,
      epic: 0x8b5cf6,
      legendary: 0xf59e0b
    };
    return colors[rarity] || colors.common;
  }
  
  private getRarityColorHex(rarity: string): string {
    const colors: Record<string, string> = {
      common: '#6b7280',
      rare: '#3b82f6',
      epic: '#8b5cf6',
      legendary: '#f59e0b'
    };
    return colors[rarity] || colors.common;
  }
  
  private getRarityLabel(rarity: string): string {
    return rarity.toUpperCase();
  }
}