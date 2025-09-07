import { StoreItem, StoreItemType, PlayerInventory, GameState } from '../types/GameTypes';

/**
 * Store System - Manages in-game purchases, currency, and unlockables
 */
export class StoreSystem {
  private storeItems: Map<string, StoreItem> = new Map();
  private dailyOffers: StoreItem[] = [];
  private lastDailyRefresh: number = 0;
  
  constructor() {
    this.initializeStoreItems();
    this.refreshDailyOffers();
  }
  
  private initializeStoreItems(): void {
    // Snake Skins
    this.addStoreItem({
      id: 'classic_skin',
      name: 'Classic Snake',
      description: 'The original green snake design',
      type: StoreItemType.SKIN,
      price: 0,
      currency: 'coins',
      rarity: 'common',
      isConsumable: false
    });
    
    this.addStoreItem({
      id: 'rainbow_skin',
      name: 'Rainbow Snake',
      description: 'A colorful snake that shifts through rainbow colors',
      type: StoreItemType.SKIN,
      price: 500,
      currency: 'coins',
      rarity: 'rare',
      isConsumable: false,
      unlockCondition: { type: 'level', value: 15 }
    });
    
    this.addStoreItem({
      id: 'metal_skin',
      name: 'Chrome Snake',
      description: 'A sleek metallic finish with reflective surfaces',
      type: StoreItemType.SKIN,
      price: 750,
      currency: 'coins',
      rarity: 'rare',
      isConsumable: false,
      unlockCondition: { type: 'level', value: 25 }
    });
    
    this.addStoreItem({
      id: 'fire_skin',
      name: 'Flame Snake',
      description: 'Blazing snake with particle fire effects',
      type: StoreItemType.SKIN,
      price: 1000,
      currency: 'coins',
      rarity: 'epic',
      isConsumable: false,
      unlockCondition: { type: 'level', value: 40 }
    });
    
    this.addStoreItem({
      id: 'galaxy_skin',
      name: 'Cosmic Snake',
      description: 'Star-filled body with nebula patterns',
      type: StoreItemType.SKIN,
      price: 2000,
      currency: 'coins',
      rarity: 'legendary',
      isConsumable: false,
      unlockCondition: { type: 'level', value: 75 }
    });
    
    this.addStoreItem({
      id: 'shadow_skin',
      name: 'Shadow Snake',
      description: 'Dark, mysterious snake with shadow trail',
      type: StoreItemType.SKIN,
      price: 50,
      currency: 'gems',
      rarity: 'legendary',
      isConsumable: false,
      unlockCondition: { type: 'level', value: 100 }
    });
    
    // Visual Themes
    this.addStoreItem({
      id: 'neon_theme',
      name: 'Neon Nights',
      description: 'Cyberpunk-inspired neon visual theme',
      type: StoreItemType.THEME,
      price: 300,
      currency: 'coins',
      rarity: 'common',
      isConsumable: false
    });
    
    this.addStoreItem({
      id: 'retro_theme',
      name: 'Retro Arcade',
      description: 'Classic 80s arcade machine aesthetic',
      type: StoreItemType.THEME,
      price: 400,
      currency: 'coins',
      rarity: 'rare',
      isConsumable: false,
      unlockCondition: { type: 'score', value: 5000 }
    });
    
    this.addStoreItem({
      id: 'nature_theme',
      name: 'Nature Grove',
      description: 'Beautiful forest environment with animated background',
      type: StoreItemType.THEME,
      price: 600,
      currency: 'coins',
      rarity: 'rare',
      isConsumable: false,
      unlockCondition: { type: 'level', value: 30 }
    });
    
    this.addStoreItem({
      id: 'space_theme',
      name: 'Deep Space',
      description: 'Cosmic environment with stars and planets',
      type: StoreItemType.THEME,
      price: 800,
      currency: 'coins',
      rarity: 'epic',
      isConsumable: false,
      unlockCondition: { type: 'level', value: 50 }
    });
    
    // Power-ups and Boosters
    this.addStoreItem({
      id: 'speed_boost',
      name: 'Speed Boost',
      description: 'Start the level with increased speed for 10 seconds',
      type: StoreItemType.POWERUP,
      price: 50,
      currency: 'coins',
      rarity: 'common',
      isConsumable: true
    });
    
    this.addStoreItem({
      id: 'shield_power',
      name: 'Protective Shield',
      description: 'Start with temporary invincibility for 8 seconds',
      type: StoreItemType.POWERUP,
      price: 75,
      currency: 'coins',
      rarity: 'common',
      isConsumable: true
    });
    
    this.addStoreItem({
      id: 'coin_magnet',
      name: 'Coin Magnet',
      description: 'Attract all coin foods within 3 tiles automatically',
      type: StoreItemType.POWERUP,
      price: 100,
      currency: 'coins',
      rarity: 'rare',
      isConsumable: true
    });
    
    this.addStoreItem({
      id: 'double_points',
      name: 'Score Multiplier',
      description: 'Double all points earned for the entire level',
      type: StoreItemType.POWERUP,
      price: 150,
      currency: 'coins',
      rarity: 'rare',
      isConsumable: true
    });
    
    this.addStoreItem({
      id: 'food_rain',
      name: 'Food Rain',
      description: 'Spawn 10 random foods at the start of the level',
      type: StoreItemType.POWERUP,
      price: 200,
      currency: 'coins',
      rarity: 'epic',
      isConsumable: true
    });
    
    this.addStoreItem({
      id: 'time_freeze',
      name: 'Temporal Freeze',
      description: 'Freeze time for 5 seconds (can be activated once per level)',
      type: StoreItemType.POWERUP,
      price: 25,
      currency: 'gems',
      rarity: 'epic',
      isConsumable: true
    });
    
    // Boosters
    this.addStoreItem({
      id: 'coin_boost_10',
      name: '+10% Coin Boost',
      description: 'Earn 10% more coins from all sources for 24 hours',
      type: StoreItemType.BOOSTER,
      price: 100,
      currency: 'coins',
      rarity: 'common',
      isConsumable: true
    });
    
    this.addStoreItem({
      id: 'coin_boost_25',
      name: '+25% Coin Boost',
      description: 'Earn 25% more coins from all sources for 24 hours',
      type: StoreItemType.BOOSTER,
      price: 200,
      currency: 'coins',
      rarity: 'rare',
      isConsumable: true
    });
    
    this.addStoreItem({
      id: 'xp_boost_15',
      name: '+15% XP Boost',
      description: 'Earn 15% more experience points for 24 hours',
      type: StoreItemType.BOOSTER,
      price: 150,
      currency: 'coins',
      rarity: 'common',
      isConsumable: true
    });
    
    this.addStoreItem({
      id: 'lucky_food',
      name: 'Lucky Food Spawn',
      description: 'Increase rare food spawn chance by 50% for 1 hour',
      type: StoreItemType.BOOSTER,
      price: 10,
      currency: 'gems',
      rarity: 'rare',
      isConsumable: true
    });
    
    // Extra Lives
    this.addStoreItem({
      id: 'extra_life',
      name: 'Extra Life',
      description: 'Continue playing after game over without losing progress',
      type: StoreItemType.LIFE,
      price: 30,
      currency: 'coins',
      rarity: 'common',
      isConsumable: true
    });
    
    this.addStoreItem({
      id: 'life_pack_5',
      name: '5 Life Pack',
      description: 'Bundle of 5 extra lives at a discounted price',
      type: StoreItemType.LIFE,
      price: 120,
      currency: 'coins',
      rarity: 'common',
      isConsumable: true
    });
    
    // Premium Items
    this.addStoreItem({
      id: 'master_key',
      name: 'Master Key',
      description: 'Unlock any level regardless of completion requirements',
      type: StoreItemType.POWERUP,
      price: 100,
      currency: 'gems',
      rarity: 'legendary',
      isConsumable: true
    });
    
    this.addStoreItem({
      id: 'gem_pack_small',
      name: 'Small Gem Pack',
      description: '10 premium gems for special purchases',
      type: StoreItemType.POWERUP,
      price: 500,
      currency: 'coins',
      rarity: 'rare',
      isConsumable: true
    });
    
    this.addStoreItem({
      id: 'gem_pack_large',
      name: 'Large Gem Pack',
      description: '50 premium gems with 25% bonus value',
      type: StoreItemType.POWERUP,
      price: 2000,
      currency: 'coins',
      rarity: 'epic',
      isConsumable: true
    });
  }
  
  private addStoreItem(item: StoreItem): void {
    this.storeItems.set(item.id, item);
  }
  
  /**
   * Get all available store items
   */
  public getAllItems(): StoreItem[] {
    return Array.from(this.storeItems.values());
  }
  
  /**
   * Get items by category/type
   */
  public getItemsByType(type: StoreItemType): StoreItem[] {
    return this.getAllItems().filter(item => item.type === type);
  }
  
  /**
   * Get items by rarity
   */
  public getItemsByRarity(rarity: string): StoreItem[] {
    return this.getAllItems().filter(item => item.rarity === rarity);
  }
  
  /**
   * Get items available for purchase (unlocked and affordable)
   */
  public getAvailableItems(gameState: GameState): StoreItem[] {
    return this.getAllItems().filter(item => {
      // Check if unlocked
      if (!this.isItemUnlocked(item, gameState)) {
        return false;
      }
      
      // Check if already owned (for non-consumables)
      if (!item.isConsumable && this.isItemOwned(item, gameState)) {
        return false;
      }
      
      // Check if affordable
      return this.canAffordItem(item, gameState);
    });
  }
  
  /**
   * Check if item is unlocked based on conditions
   */
  public isItemUnlocked(item: StoreItem, gameState: GameState): boolean {
    if (!item.unlockCondition) {
      return true; // No unlock condition means always available
    }
    
    const condition = item.unlockCondition;
    
    switch (condition.type) {
      case 'level':
        return gameState.currentLevel >= (condition.value as number);
        
      case 'score':
        return gameState.statistics.totalScore >= (condition.value as number);
        
      case 'achievement':
        // Would need achievement system to check this
        return true; // Placeholder
        
      default:
        return false;
    }
  }
  
  /**
   * Check if player owns the item
   */
  public isItemOwned(item: StoreItem, gameState: GameState): boolean {
    switch (item.type) {
      case StoreItemType.SKIN:
        return gameState.inventory.skins.includes(item.id);
        
      case StoreItemType.THEME:
        return gameState.inventory.themes.includes(item.id);
        
      case StoreItemType.POWERUP:
      case StoreItemType.BOOSTER:
      case StoreItemType.LIFE:
        return (gameState.inventory.powerups[item.id] || 0) > 0;
        
      default:
        return false;
    }
  }
  
  /**
   * Check if player can afford the item\n   */\n  public canAffordItem(item: StoreItem, gameState: GameState): boolean {\n    if (item.currency === 'coins') {\n      return gameState.coins >= item.price;\n    } else if (item.currency === 'gems') {\n      // Would need gems currency in GameState\n      return true; // Placeholder\n    }\n    return false;\n  }\n  \n  /**\n   * Purchase an item\n   */\n  public purchaseItem(itemId: string, gameState: GameState): {\n    success: boolean;\n    message: string;\n    newGameState?: GameState;\n  } {\n    const item = this.storeItems.get(itemId);\n    if (!item) {\n      return { success: false, message: 'Item not found' };\n    }\n    \n    // Check if item is available for purchase\n    if (!this.isItemUnlocked(item, gameState)) {\n      return { success: false, message: 'Item not yet unlocked' };\n    }\n    \n    if (!item.isConsumable && this.isItemOwned(item, gameState)) {\n      return { success: false, message: 'Item already owned' };\n    }\n    \n    if (!this.canAffordItem(item, gameState)) {\n      return { success: false, message: `Not enough ${item.currency}` };\n    }\n    \n    // Create new game state with purchase applied\n    const newGameState = { ...gameState };\n    \n    // Deduct currency\n    if (item.currency === 'coins') {\n      newGameState.coins -= item.price;\n    }\n    \n    // Add item to inventory\n    switch (item.type) {\n      case StoreItemType.SKIN:\n        if (!newGameState.inventory.skins.includes(item.id)) {\n          newGameState.inventory.skins.push(item.id);\n        }\n        break;\n        \n      case StoreItemType.THEME:\n        if (!newGameState.inventory.themes.includes(item.id)) {\n          newGameState.inventory.themes.push(item.id);\n        }\n        break;\n        \n      case StoreItemType.POWERUP:\n      case StoreItemType.BOOSTER:\n      case StoreItemType.LIFE:\n        const currentAmount = newGameState.inventory.powerups[item.id] || 0;\n        newGameState.inventory.powerups[item.id] = currentAmount + 1;\n        break;\n    }\n    \n    return {\n      success: true,\n      message: `Successfully purchased ${item.name}`,\n      newGameState\n    };\n  }\n  \n  /**\n   * Use a consumable item\n   */\n  public useItem(itemId: string, gameState: GameState): {\n    success: boolean;\n    message: string;\n    effect?: any;\n    newGameState?: GameState;\n  } {\n    const item = this.storeItems.get(itemId);\n    if (!item) {\n      return { success: false, message: 'Item not found' };\n    }\n    \n    if (!item.isConsumable) {\n      return { success: false, message: 'Item is not consumable' };\n    }\n    \n    const currentAmount = gameState.inventory.powerups[item.id] || 0;\n    if (currentAmount <= 0) {\n      return { success: false, message: 'No items to use' };\n    }\n    \n    // Create new game state with item used\n    const newGameState = { ...gameState };\n    newGameState.inventory.powerups[item.id] = currentAmount - 1;\n    \n    // Get item effect\n    const effect = this.getItemEffect(item);\n    \n    return {\n      success: true,\n      message: `Used ${item.name}`,\n      effect,\n      newGameState\n    };\n  }\n  \n  /**\n   * Get the effect of using an item\n   */\n  private getItemEffect(item: StoreItem): any {\n    const effects: Record<string, any> = {\n      'speed_boost': { type: 'speed', duration: 10000, magnitude: 1.5 },\n      'shield_power': { type: 'invincible', duration: 8000 },\n      'coin_magnet': { type: 'magnet', radius: 3 },\n      'double_points': { type: 'score_multiplier', multiplier: 2 },\n      'food_rain': { type: 'spawn_food', count: 10 },\n      'time_freeze': { type: 'freeze_time', duration: 5000 },\n      'coin_boost_10': { type: 'coin_boost', multiplier: 1.1, duration: 86400000 },\n      'coin_boost_25': { type: 'coin_boost', multiplier: 1.25, duration: 86400000 },\n      'xp_boost_15': { type: 'xp_boost', multiplier: 1.15, duration: 86400000 },\n      'lucky_food': { type: 'rare_food_boost', multiplier: 1.5, duration: 3600000 },\n      'extra_life': { type: 'extra_life', count: 1 },\n      'life_pack_5': { type: 'extra_life', count: 5 },\n      'gem_pack_small': { type: 'gems', amount: 10 },\n      'gem_pack_large': { type: 'gems', amount: 62 }, // 50 + 25% bonus\n      'master_key': { type: 'unlock_level' }\n    };\n    \n    return effects[item.id] || { type: 'unknown' };\n  }\n  \n  /**\n   * Get daily offers (refreshed every 24 hours)\n   */\n  public getDailyOffers(): StoreItem[] {\n    const now = Date.now();\n    const dayInMs = 24 * 60 * 60 * 1000;\n    \n    if (now - this.lastDailyRefresh > dayInMs) {\n      this.refreshDailyOffers();\n    }\n    \n    return this.dailyOffers;\n  }\n  \n  private refreshDailyOffers(): void {\n    this.lastDailyRefresh = Date.now();\n    \n    // Select 3 random items with discounted prices\n    const allItems = this.getAllItems().filter(item => \n      item.isConsumable || ['powerup', 'booster'].includes(item.type)\n    );\n    \n    this.dailyOffers = [];\n    const selectedItems = this.shuffleArray(allItems).slice(0, 3);\n    \n    selectedItems.forEach(item => {\n      const discountedItem = {\n        ...item,\n        id: `daily_${item.id}`,\n        name: `${item.name} (Daily Deal)`,\n        price: Math.floor(item.price * 0.7), // 30% discount\n        rarity: 'common' as const // Daily deals are always common rarity\n      };\n      this.dailyOffers.push(discountedItem);\n    });\n  }\n  \n  private shuffleArray<T>(array: T[]): T[] {\n    const shuffled = [...array];\n    for (let i = shuffled.length - 1; i > 0; i--) {\n      const j = Math.floor(Math.random() * (i + 1));\n      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];\n    }\n    return shuffled;\n  }\n  \n  /**\n   * Get item by ID\n   */\n  public getItem(itemId: string): StoreItem | undefined {\n    return this.storeItems.get(itemId);\n  }\n  \n  /**\n   * Get featured items (high rarity or newly unlocked)\n   */\n  public getFeaturedItems(gameState: GameState): StoreItem[] {\n    return this.getAllItems()\n      .filter(item => \n        (item.rarity === 'epic' || item.rarity === 'legendary') &&\n        this.isItemUnlocked(item, gameState)\n      )\n      .slice(0, 6); // Show top 6 featured items\n  }\n  \n  /**\n   * Get recommended items based on player progress\n   */\n  public getRecommendedItems(gameState: GameState): StoreItem[] {\n    const recommendations: StoreItem[] = [];\n    \n    // Recommend based on current level\n    if (gameState.currentLevel < 10) {\n      // Early game recommendations\n      const earlyItems = ['speed_boost', 'shield_power', 'extra_life'];\n      earlyItems.forEach(itemId => {\n        const item = this.storeItems.get(itemId);\n        if (item && this.canAffordItem(item, gameState)) {\n          recommendations.push(item);\n        }\n      });\n    } else if (gameState.currentLevel < 50) {\n      // Mid game recommendations\n      const midItems = ['double_points', 'coin_magnet', 'coin_boost_10'];\n      midItems.forEach(itemId => {\n        const item = this.storeItems.get(itemId);\n        if (item && this.canAffordItem(item, gameState)) {\n          recommendations.push(item);\n        }\n      });\n    } else {\n      // Late game recommendations\n      const lateItems = ['time_freeze', 'food_rain', 'master_key'];\n      lateItems.forEach(itemId => {\n        const item = this.storeItems.get(itemId);\n        if (item && this.canAffordItem(item, gameState)) {\n          recommendations.push(item);\n        }\n      });\n    }\n    \n    // Add skin recommendations if player has enough coins\n    if (gameState.coins > 500) {\n      const availableSkins = this.getItemsByType(StoreItemType.SKIN)\n        .filter(item => \n          this.isItemUnlocked(item, gameState) && \n          !this.isItemOwned(item, gameState) &&\n          this.canAffordItem(item, gameState)\n        );\n      \n      if (availableSkins.length > 0) {\n        recommendations.push(availableSkins[0]);\n      }\n    }\n    \n    return recommendations.slice(0, 4); // Limit to 4 recommendations\n  }\n  \n  /**\n   * Calculate total value of player's inventory\n   */\n  public calculateInventoryValue(gameState: GameState): { coins: number; gems: number } {\n    let totalCoins = 0;\n    let totalGems = 0;\n    \n    // Count skins and themes\n    gameState.inventory.skins.forEach(skinId => {\n      const item = this.storeItems.get(skinId);\n      if (item) {\n        if (item.currency === 'coins') totalCoins += item.price;\n        if (item.currency === 'gems') totalGems += item.price;\n      }\n    });\n    \n    gameState.inventory.themes.forEach(themeId => {\n      const item = this.storeItems.get(themeId);\n      if (item) {\n        if (item.currency === 'coins') totalCoins += item.price;\n        if (item.currency === 'gems') totalGems += item.price;\n      }\n    });\n    \n    // Count consumable items\n    Object.entries(gameState.inventory.powerups).forEach(([itemId, quantity]) => {\n      const item = this.storeItems.get(itemId);\n      if (item && quantity > 0) {\n        const value = item.price * quantity;\n        if (item.currency === 'coins') totalCoins += value;\n        if (item.currency === 'gems') totalGems += value;\n      }\n    });\n    \n    return { coins: totalCoins, gems: totalGems };\n  }\n}