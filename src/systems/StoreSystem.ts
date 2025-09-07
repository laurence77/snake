import { StoreItem, StoreItemType, GameState } from '../types/GameTypes';

/**
 * Store System - Manages in-game purchases, currency, and unlockables
 */
export class StoreSystem {
  private storeItems: Map<string, StoreItem> = new Map();
  private dailyOffers: StoreItem[] = [];
  private lastDailyRefresh = 0;

  constructor() {
    this.initializeStoreItems();
    this.refreshDailyOffers();
  }

  private addStoreItem(item: StoreItem): void {
    this.storeItems.set(item.id, item);
  }

  private initializeStoreItems(): void {
    // Skins
    this.addStoreItem({ id: 'classic_skin', name: 'Classic Snake', description: 'The original green snake design', type: StoreItemType.SKIN, price: 0, currency: 'coins', rarity: 'common', isConsumable: false });
    this.addStoreItem({ id: 'rainbow_skin', name: 'Rainbow Snake', description: 'A colorful snake that shifts through rainbow colors', type: StoreItemType.SKIN, price: 500, currency: 'coins', rarity: 'rare', isConsumable: false, unlockCondition: { type: 'level', value: 15 } });
    this.addStoreItem({ id: 'metal_skin', name: 'Chrome Snake', description: 'A sleek metallic finish with reflective surfaces', type: StoreItemType.SKIN, price: 750, currency: 'coins', rarity: 'rare', isConsumable: false, unlockCondition: { type: 'level', value: 25 } });
    this.addStoreItem({ id: 'fire_skin', name: 'Flame Snake', description: 'Blazing snake with particle fire effects', type: StoreItemType.SKIN, price: 1000, currency: 'coins', rarity: 'epic', isConsumable: false, unlockCondition: { type: 'level', value: 40 } });
    this.addStoreItem({ id: 'galaxy_skin', name: 'Cosmic Snake', description: 'Star-filled body with nebula patterns', type: StoreItemType.SKIN, price: 2000, currency: 'coins', rarity: 'legendary', isConsumable: false, unlockCondition: { type: 'level', value: 75 } });
    this.addStoreItem({ id: 'shadow_skin', name: 'Shadow Snake', description: 'Dark, mysterious snake with shadow trail', type: StoreItemType.SKIN, price: 50, currency: 'gems', rarity: 'legendary', isConsumable: false, unlockCondition: { type: 'level', value: 100 } });

    // Themes
    this.addStoreItem({ id: 'neon_theme', name: 'Neon Nights', description: 'Cyberpunk-inspired neon visual theme', type: StoreItemType.THEME, price: 300, currency: 'coins', rarity: 'common', isConsumable: false });
    this.addStoreItem({ id: 'retro_theme', name: 'Retro Arcade', description: 'Classic 80s arcade machine aesthetic', type: StoreItemType.THEME, price: 400, currency: 'coins', rarity: 'rare', isConsumable: false, unlockCondition: { type: 'score', value: 5000 } });
    this.addStoreItem({ id: 'nature_theme', name: 'Nature Grove', description: 'Beautiful forest environment with animated background', type: StoreItemType.THEME, price: 600, currency: 'coins', rarity: 'rare', isConsumable: false, unlockCondition: { type: 'level', value: 30 } });
    this.addStoreItem({ id: 'space_theme', name: 'Deep Space', description: 'Cosmic environment with stars and planets', type: StoreItemType.THEME, price: 800, currency: 'coins', rarity: 'epic', isConsumable: false, unlockCondition: { type: 'level', value: 50 } });

    // Power-ups
    this.addStoreItem({ id: 'speed_boost', name: 'Speed Boost', description: 'Start the level with increased speed for 10 seconds', type: StoreItemType.POWERUP, price: 50, currency: 'coins', rarity: 'common', isConsumable: true });
    this.addStoreItem({ id: 'shield_power', name: 'Protective Shield', description: 'Start with temporary invincibility for 8 seconds', type: StoreItemType.POWERUP, price: 75, currency: 'coins', rarity: 'common', isConsumable: true });
    this.addStoreItem({ id: 'coin_magnet', name: 'Coin Magnet', description: 'Attract all coin foods within 3 tiles automatically', type: StoreItemType.POWERUP, price: 100, currency: 'coins', rarity: 'rare', isConsumable: true });
    this.addStoreItem({ id: 'double_points', name: 'Score Multiplier', description: 'Double all points earned for the entire level', type: StoreItemType.POWERUP, price: 150, currency: 'coins', rarity: 'rare', isConsumable: true });
    this.addStoreItem({ id: 'food_rain', name: 'Food Rain', description: 'Spawn 10 random foods at the start of the level', type: StoreItemType.POWERUP, price: 200, currency: 'coins', rarity: 'epic', isConsumable: true });
    this.addStoreItem({ id: 'time_freeze', name: 'Temporal Freeze', description: 'Freeze time for 5 seconds (once per level)', type: StoreItemType.POWERUP, price: 25, currency: 'gems', rarity: 'epic', isConsumable: true });

    // Boosters
    this.addStoreItem({ id: 'coin_boost_10', name: '+10% Coin Boost', description: 'Earn 10% more coins for 24 hours', type: StoreItemType.BOOSTER, price: 100, currency: 'coins', rarity: 'common', isConsumable: true });
    this.addStoreItem({ id: 'coin_boost_25', name: '+25% Coin Boost', description: 'Earn 25% more coins for 24 hours', type: StoreItemType.BOOSTER, price: 200, currency: 'coins', rarity: 'rare', isConsumable: true });
    this.addStoreItem({ id: 'xp_boost_15', name: '+15% XP Boost', description: 'Earn 15% more XP for 24 hours', type: StoreItemType.BOOSTER, price: 150, currency: 'coins', rarity: 'common', isConsumable: true });
    this.addStoreItem({ id: 'lucky_food', name: 'Lucky Food Spawn', description: 'Increase rare food spawn chance by 50% for 1 hour', type: StoreItemType.BOOSTER, price: 10, currency: 'gems', rarity: 'rare', isConsumable: true });

    // Lives and premium
    this.addStoreItem({ id: 'extra_life', name: 'Extra Life', description: 'Continue after game over without losing progress', type: StoreItemType.LIFE, price: 30, currency: 'coins', rarity: 'common', isConsumable: true });
    this.addStoreItem({ id: 'life_pack_5', name: '5 Life Pack', description: 'Bundle of 5 extra lives at a discount', type: StoreItemType.LIFE, price: 120, currency: 'coins', rarity: 'common', isConsumable: true });
    this.addStoreItem({ id: 'master_key', name: 'Master Key', description: 'Unlock any level regardless of requirements', type: StoreItemType.POWERUP, price: 100, currency: 'gems', rarity: 'legendary', isConsumable: true });
    this.addStoreItem({ id: 'gem_pack_small', name: 'Small Gem Pack', description: '10 premium gems for special purchases', type: StoreItemType.POWERUP, price: 500, currency: 'coins', rarity: 'rare', isConsumable: true });
    this.addStoreItem({ id: 'gem_pack_large', name: 'Large Gem Pack', description: '50 premium gems with 25% bonus value', type: StoreItemType.POWERUP, price: 2000, currency: 'coins', rarity: 'epic', isConsumable: true });
  }

  public getAllItems(): StoreItem[] { return Array.from(this.storeItems.values()); }
  public getItemsByType(type: StoreItemType): StoreItem[] { return this.getAllItems().filter(i => i.type === type); }
  public getItemsByRarity(rarity: string): StoreItem[] { return this.getAllItems().filter(i => i.rarity === rarity); }

  public getAvailableItems(gameState: GameState): StoreItem[] {
    return this.getAllItems().filter(item => {
      if (!this.isItemUnlocked(item, gameState)) return false;
      if (!item.isConsumable && this.isItemOwned(item, gameState)) return false;
      return true;
    });
  }

  public isItemUnlocked(item: StoreItem, gameState: GameState): boolean {
    if (!item.unlockCondition) return true;
    switch (item.unlockCondition.type) {
      case 'level': return gameState.currentLevel >= (item.unlockCondition.value as number);
      case 'score': return gameState.statistics.totalScore >= (item.unlockCondition.value as number);
      case 'achievement': return true; // Placeholder until achievements exist
      default: return true;
    }
  }

  public isItemOwned(item: StoreItem, gameState: GameState): boolean {
    switch (item.type) {
      case StoreItemType.SKIN: return gameState.inventory.skins.includes(item.id);
      case StoreItemType.THEME: return gameState.inventory.themes.includes(item.id);
      case StoreItemType.POWERUP:
      case StoreItemType.BOOSTER:
      case StoreItemType.LIFE:
        return (gameState.inventory.powerups[item.id] || 0) > 0;
      default: return false;
    }
  }

  public canAffordItem(item: StoreItem, gameState: GameState): boolean {
    if (item.currency === 'coins') return gameState.coins >= item.price;
    if (item.currency === 'gems') return true; // Placeholder
    return false;
  }

  public purchaseItem(itemId: string, gameState: GameState): { success: boolean; message: string; newGameState?: GameState } {
    const item = this.storeItems.get(itemId);
    if (!item) return { success: false, message: 'Item not found' };
    if (!this.isItemUnlocked(item, gameState)) return { success: false, message: 'Item not yet unlocked' };
    if (!item.isConsumable && this.isItemOwned(item, gameState)) return { success: false, message: 'Item already owned' };
    if (!this.canAffordItem(item, gameState)) return { success: false, message: `Not enough ${item.currency}` };

    const newGameState: GameState = {
      ...gameState,
      coins: gameState.coins - (item.currency === 'coins' ? item.price : 0),
      inventory: {
        ...gameState.inventory,
        skins: [...gameState.inventory.skins],
        themes: [...gameState.inventory.themes],
        powerups: { ...gameState.inventory.powerups },
      },
      completedLevels: new Set(Array.from(gameState.completedLevels)),
    };

    switch (item.type) {
      case StoreItemType.SKIN:
        if (!newGameState.inventory.skins.includes(item.id)) newGameState.inventory.skins.push(item.id);
        break;
      case StoreItemType.THEME:
        if (!newGameState.inventory.themes.includes(item.id)) newGameState.inventory.themes.push(item.id);
        break;
      case StoreItemType.POWERUP:
      case StoreItemType.BOOSTER:
      case StoreItemType.LIFE:
        newGameState.inventory.powerups[item.id] = (newGameState.inventory.powerups[item.id] || 0) + 1;
        break;
    }

    return { success: true, message: `Successfully purchased ${item.name}`, newGameState };
  }

  public useItem(itemId: string, gameState: GameState): { success: boolean; message: string; effect?: any; newGameState?: GameState } {
    const item = this.storeItems.get(itemId);
    if (!item) return { success: false, message: 'Item not found' };
    if (!item.isConsumable) return { success: false, message: 'Item is not consumable' };

    const currentAmount = gameState.inventory.powerups[item.id] || 0;
    if (currentAmount <= 0) return { success: false, message: 'No items to use' };

    const newGameState: GameState = { ...gameState, inventory: { ...gameState.inventory, powerups: { ...gameState.inventory.powerups, [item.id]: currentAmount - 1 } } };
    const effect = this.getItemEffect(item);
    return { success: true, message: `Used ${item.name}`, effect, newGameState };
  }

  private getItemEffect(item: StoreItem): any {
    const effects: Record<string, any> = {
      speed_boost: { type: 'speed', duration: 10000, magnitude: 1.5 },
      shield_power: { type: 'invincible', duration: 8000 },
      coin_magnet: { type: 'magnet', radius: 3 },
      double_points: { type: 'score_multiplier', multiplier: 2 },
      food_rain: { type: 'spawn_food', count: 10 },
      time_freeze: { type: 'freeze_time', duration: 5000 },
      coin_boost_10: { type: 'coin_boost', multiplier: 1.1, duration: 24 * 60 * 60 * 1000 },
      coin_boost_25: { type: 'coin_boost', multiplier: 1.25, duration: 24 * 60 * 60 * 1000 },
      xp_boost_15: { type: 'xp_boost', multiplier: 1.15, duration: 24 * 60 * 60 * 1000 },
      lucky_food: { type: 'rare_food_boost', multiplier: 1.5, duration: 60 * 60 * 1000 },
      extra_life: { type: 'extra_life', count: 1 },
      life_pack_5: { type: 'extra_life', count: 5 },
      gem_pack_small: { type: 'gems', amount: 10 },
      gem_pack_large: { type: 'gems', amount: 62 },
      master_key: { type: 'unlock_level' },
    };
    return effects[item.id] || { type: 'unknown' };
  }

  public getDailyOffers(): StoreItem[] {
    const now = Date.now();
    const day = 24 * 60 * 60 * 1000;
    if (now - this.lastDailyRefresh > day) this.refreshDailyOffers();
    return this.dailyOffers;
  }

  private refreshDailyOffers(): void {
    this.lastDailyRefresh = Date.now();
    const pool = this.getAllItems().filter(i => i.isConsumable || [StoreItemType.POWERUP, StoreItemType.BOOSTER].includes(i.type));
    const selected = this.shuffleArray(pool).slice(0, 3);
    this.dailyOffers = selected.map(item => ({ ...item, id: `daily_${item.id}`, name: `${item.name} (Daily Deal)`, price: Math.floor(item.price * 0.7), rarity: 'common' }));
  }

  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  public getItem(itemId: string): StoreItem | undefined { return this.storeItems.get(itemId); }

  public getFeaturedItems(gameState: GameState): StoreItem[] {
    return this.getAllItems().filter(i => (i.rarity === 'epic' || i.rarity === 'legendary') && this.isItemUnlocked(i, gameState)).slice(0, 6);
  }

  public getRecommendedItems(gameState: GameState): StoreItem[] {
    const rec: StoreItem[] = [];
    if (gameState.currentLevel < 10) {
      ['speed_boost', 'shield_power', 'extra_life'].forEach(id => { const item = this.storeItems.get(id); if (item && this.canAffordItem(item, gameState)) rec.push(item); });
    } else if (gameState.currentLevel < 50) {
      ['double_points', 'coin_magnet', 'coin_boost_10'].forEach(id => { const item = this.storeItems.get(id); if (item && this.canAffordItem(item, gameState)) rec.push(item); });
    } else {
      ['time_freeze', 'food_rain', 'master_key'].forEach(id => { const item = this.storeItems.get(id); if (item && this.canAffordItem(item, gameState)) rec.push(item); });
    }
    if (gameState.coins > 500) {
      const skins = this.getItemsByType(StoreItemType.SKIN).filter(item => this.isItemUnlocked(item, gameState) && !this.isItemOwned(item, gameState) && this.canAffordItem(item, gameState));
      if (skins.length > 0) rec.push(skins[0]);
    }
    return rec.slice(0, 4);
  }

  public calculateInventoryValue(gameState: GameState): { coins: number; gems: number } {
    let coins = 0; let gems = 0;
    gameState.inventory.skins.forEach(id => { const item = this.storeItems.get(id); if (item) { if (item.currency === 'coins') coins += item.price; if (item.currency === 'gems') gems += item.price; } });
    gameState.inventory.themes.forEach(id => { const item = this.storeItems.get(id); if (item) { if (item.currency === 'coins') coins += item.price; if (item.currency === 'gems') gems += item.price; } });
    Object.entries(gameState.inventory.powerups).forEach(([id, qty]) => { const item = this.storeItems.get(id); if (item && qty > 0) { const value = item.price * qty; if (item.currency === 'coins') coins += value; if (item.currency === 'gems') gems += value; } });
    return { coins, gems };
  }
}
