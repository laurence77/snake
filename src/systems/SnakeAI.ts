/**
 * Advanced AI System for Snake Game
 * Implements multiple AI strategies: A*, Pathfinding, Hamiltonian Cycle, and Survival
 */

export interface Position {
  x: number;
  y: number;
}

export interface SnakeState {
  head: Position;
  body: Position[];
  direction: Position;
  length: number;
}

export interface GameState {
  food: Position;
  gridWidth: number;
  gridHeight: number;
  obstacles: Position[];
  snakes: SnakeState[];
}

export class SnakeAI {
  private difficulty: 'Easy' | 'Medium' | 'Hard' | 'Expert' | 'Impossible' = 'Medium';
  private strategy: 'simple' | 'astar' | 'hamiltonian' | 'survival' = 'astar';
  private playerId: number;
  private gridWidth: number;
  private gridHeight: number;
  
  // A* pathfinding cache
  private pathCache: Map<string, Position[]> = new Map();
  private cacheValidTime = 500; // ms
  private lastCacheTime = 0;
  
  // Hamiltonian cycle for perfect play
  private hamiltonianCycle: Position[] = [];
  private cycleIndex = 0;
  private useHamiltonian = false;
  
  // Survival mode parameters
  private survivalMode = false;
  private escapeRoutes: Position[] = [];
  
  // Performance tracking
  private decisionTime = 0;
  private pathLength = 0;

  constructor(playerId: number, gridWidth: number, gridHeight: number) {
    this.playerId = playerId;
    this.gridWidth = gridWidth;
    this.gridHeight = gridHeight;
    this.generateHamiltonianCycle();
  }

  setDifficulty(difficulty: typeof this.difficulty): void {
    this.difficulty = difficulty;
    
    // Adjust strategy based on difficulty
    switch (difficulty) {
      case 'Easy':
        this.strategy = 'simple';
        break;
      case 'Medium':
        this.strategy = 'astar';
        break;
      case 'Hard':
        this.strategy = 'astar';
        this.useHamiltonian = Math.random() < 0.3; // 30% chance
        break;
      case 'Expert':
        this.strategy = 'survival';
        this.useHamiltonian = Math.random() < 0.7; // 70% chance
        break;
      case 'Impossible':
        this.strategy = 'hamiltonian';
        this.useHamiltonian = true;
        break;
    }
  }

  /**
   * Get next move direction for the AI snake
   */
  getNextMove(gameState: GameState): Position {
    const startTime = performance.now();
    const snake = gameState.snakes[this.playerId];
    
    if (!snake) {
      return { x: 0, y: 1 }; // Default down
    }

    let direction: Position;

    // Check if we should enter survival mode
    this.survivalMode = this.shouldEnterSurvivalMode(snake, gameState);

    if (this.useHamiltonian && !this.survivalMode) {
      direction = this.getHamiltonianMove(snake, gameState);
    } else {
      switch (this.strategy) {
        case 'simple':
          direction = this.getSimpleMove(snake, gameState);
          break;
        case 'astar':
          direction = this.getAStarMove(snake, gameState);
          break;
        case 'survival':
          direction = this.getSurvivalMove(snake, gameState);
          break;
        case 'hamiltonian':
          direction = this.getHamiltonianMove(snake, gameState);
          break;
        default:
          direction = this.getSimpleMove(snake, gameState);
      }
    }

    this.decisionTime = performance.now() - startTime;
    return direction;
  }

  /**
   * Simple greedy algorithm - move toward food
   */
  private getSimpleMove(snake: SnakeState, gameState: GameState): Position {
    const head = snake.head;
    const food = gameState.food;
    
    const dx = food.x - head.x;
    const dy = food.y - head.y;
    
    // Prioritize the longer distance
    if (Math.abs(dx) > Math.abs(dy)) {
      const direction = { x: Math.sign(dx), y: 0 };
      if (this.isSafeMove(snake, direction, gameState)) {
        return direction;
      }
    } else {
      const direction = { x: 0, y: Math.sign(dy) };
      if (this.isSafeMove(snake, direction, gameState)) {
        return direction;
      }
    }
    
    // If direct path is blocked, try alternatives
    const alternatives = [
      { x: 1, y: 0 },   // Right
      { x: -1, y: 0 },  // Left  
      { x: 0, y: 1 },   // Down
      { x: 0, y: -1 }   // Up
    ].filter(dir => this.isSafeMove(snake, dir, gameState));
    
    return alternatives.length > 0 ? alternatives[0] : { x: 1, y: 0 };
  }

  /**
   * A* pathfinding algorithm
   */
  private getAStarMove(snake: SnakeState, gameState: GameState): Position {
    const cacheKey = `${snake.head.x},${snake.head.y}-${gameState.food.x},${gameState.food.y}`;
    const now = Date.now();
    
    // Check cache
    if (this.pathCache.has(cacheKey) && (now - this.lastCacheTime) < this.cacheValidTime) {
      const cachedPath = this.pathCache.get(cacheKey)!;
      if (cachedPath.length > 1) {
        const nextPos = cachedPath[1];
        return {
          x: nextPos.x - snake.head.x,
          y: nextPos.y - snake.head.y
        };
      }
    }

    const path = this.findPathAStar(snake.head, gameState.food, snake, gameState);
    
    if (path.length > 1) {
      this.pathCache.set(cacheKey, path);
      this.lastCacheTime = now;
      this.pathLength = path.length;
      
      const nextPos = path[1];
      return {
        x: nextPos.x - snake.head.x,
        y: nextPos.y - snake.head.y
      };
    }
    
    // Fallback to safe move
    return this.getSafeMove(snake, gameState);
  }

  /**
   * A* pathfinding implementation
   */
  private findPathAStar(start: Position, goal: Position, snake: SnakeState, gameState: GameState): Position[] {
    const openSet: Position[] = [start];
    const cameFrom = new Map<string, Position>();
    const gScore = new Map<string, number>();
    const fScore = new Map<string, number>();
    
    const key = (pos: Position) => `${pos.x},${pos.y}`;
    const heuristic = (a: Position, b: Position) => Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
    
    gScore.set(key(start), 0);
    fScore.set(key(start), heuristic(start, goal));
    
    while (openSet.length > 0) {
      // Find node with lowest fScore
      let current = openSet.reduce((min, pos) => 
        (fScore.get(key(pos)) || Infinity) < (fScore.get(key(min)) || Infinity) ? pos : min
      );
      
      if (current.x === goal.x && current.y === goal.y) {
        // Reconstruct path
        const path = [current];
        while (cameFrom.has(key(current))) {
          current = cameFrom.get(key(current))!;
          path.unshift(current);
        }
        return path;
      }
      
      openSet.splice(openSet.indexOf(current), 1);
      
      // Check neighbors
      const neighbors = [
        { x: current.x + 1, y: current.y },
        { x: current.x - 1, y: current.y },
        { x: current.x, y: current.y + 1 },
        { x: current.x, y: current.y - 1 }
      ].filter(pos => 
        pos.x >= 0 && pos.x < gameState.gridWidth &&
        pos.y >= 0 && pos.y < gameState.gridHeight &&
        !this.isPositionOccupied(pos, snake, gameState)
      );
      
      for (const neighbor of neighbors) {
        const tentativeGScore = (gScore.get(key(current)) || 0) + 1;
        const neighborKey = key(neighbor);
        
        if (tentativeGScore < (gScore.get(neighborKey) || Infinity)) {
          cameFrom.set(neighborKey, current);
          gScore.set(neighborKey, tentativeGScore);
          fScore.set(neighborKey, tentativeGScore + heuristic(neighbor, goal));
          
          if (!openSet.find(pos => pos.x === neighbor.x && pos.y === neighbor.y)) {
            openSet.push(neighbor);
          }
        }
      }
    }
    
    return []; // No path found
  }

  /**
   * Survival mode - prioritize staying alive
   */
  private getSurvivalMove(snake: SnakeState, gameState: GameState): Position {
    // Look for the move that gives us the most open space
    const directions = [
      { x: 1, y: 0 },   // Right
      { x: -1, y: 0 },  // Left  
      { x: 0, y: 1 },   // Down
      { x: 0, y: -1 }   // Up
    ];
    
    let bestMove = directions[0];
    let maxSpace = -1;
    
    for (const direction of directions) {
      if (this.isSafeMove(snake, direction, gameState)) {
        const newHead = {
          x: snake.head.x + direction.x,
          y: snake.head.y + direction.y
        };
        
        const spaceCount = this.countAvailableSpace(newHead, snake, gameState);
        if (spaceCount > maxSpace) {
          maxSpace = spaceCount;
          bestMove = direction;
        }
      }
    }
    
    return bestMove;
  }

  /**
   * Hamiltonian cycle - perfect play for small grids
   */
  private getHamiltonianMove(snake: SnakeState, gameState: GameState): Position {
    if (this.hamiltonianCycle.length === 0) {
      return this.getSurvivalMove(snake, gameState);
    }
    
    // Find current position in cycle
    const currentIndex = this.hamiltonianCycle.findIndex(pos => 
      pos.x === snake.head.x && pos.y === snake.head.y
    );
    
    if (currentIndex === -1) {
      // Not in cycle, move toward cycle
      return this.getAStarMove(snake, gameState);
    }
    
    // Get next position in cycle
    const nextIndex = (currentIndex + 1) % this.hamiltonianCycle.length;
    const nextPos = this.hamiltonianCycle[nextIndex];
    
    return {
      x: nextPos.x - snake.head.x,
      y: nextPos.y - snake.head.y
    };
  }

  /**
   * Check if entering survival mode is necessary
   */
  private shouldEnterSurvivalMode(snake: SnakeState, gameState: GameState): boolean {
    const spaceRatio = this.countAvailableSpace(snake.head, snake, gameState) / 
                      (gameState.gridWidth * gameState.gridHeight);
    
    // Enter survival mode if less than 30% of grid is available
    return spaceRatio < 0.3 || snake.length > (gameState.gridWidth * gameState.gridHeight) * 0.5;
  }

  /**
   * Count available space using flood fill
   */
  private countAvailableSpace(start: Position, snake: SnakeState, gameState: GameState): number {
    const visited = new Set<string>();
    const queue = [start];
    let count = 0;
    
    while (queue.length > 0 && count < 100) { // Limit search for performance
      const pos = queue.shift()!;
      const key = `${pos.x},${pos.y}`;
      
      if (visited.has(key)) continue;
      visited.add(key);
      count++;
      
      // Add valid neighbors
      const neighbors = [
        { x: pos.x + 1, y: pos.y },
        { x: pos.x - 1, y: pos.y },
        { x: pos.x, y: pos.y + 1 },
        { x: pos.x, y: pos.y - 1 }
      ].filter(neighbor => 
        neighbor.x >= 0 && neighbor.x < gameState.gridWidth &&
        neighbor.y >= 0 && neighbor.y < gameState.gridHeight &&
        !this.isPositionOccupied(neighbor, snake, gameState) &&
        !visited.has(`${neighbor.x},${neighbor.y}`)
      );
      
      queue.push(...neighbors);
    }
    
    return count;
  }

  /**
   * Generate a simple Hamiltonian cycle
   */
  private generateHamiltonianCycle(): void {
    // Only for small grids (performance reasons)
    if (this.gridWidth > 20 || this.gridHeight > 20) {
      return;
    }
    
    // Simple zigzag pattern
    this.hamiltonianCycle = [];
    
    for (let y = 0; y < this.gridHeight; y++) {
      if (y % 2 === 0) {
        // Left to right
        for (let x = 0; x < this.gridWidth; x++) {
          this.hamiltonianCycle.push({ x, y });
        }
      } else {
        // Right to left
        for (let x = this.gridWidth - 1; x >= 0; x--) {
          this.hamiltonianCycle.push({ x, y });
        }
      }
    }
  }

  /**
   * Check if a move is safe (won't cause collision)
   */
  private isSafeMove(snake: SnakeState, direction: Position, gameState: GameState): boolean {
    const newHead = {
      x: snake.head.x + direction.x,
      y: snake.head.y + direction.y
    };
    
    // Check bounds
    if (newHead.x < 0 || newHead.x >= gameState.gridWidth ||
        newHead.y < 0 || newHead.y >= gameState.gridHeight) {
      return false;
    }
    
    // Check if position is occupied
    return !this.isPositionOccupied(newHead, snake, gameState);
  }

  /**
   * Get a safe move when primary strategy fails
   */
  private getSafeMove(snake: SnakeState, gameState: GameState): Position {
    const directions = [
      { x: 1, y: 0 },   // Right
      { x: -1, y: 0 },  // Left  
      { x: 0, y: 1 },   // Down
      { x: 0, y: -1 }   // Up
    ].filter(dir => this.isSafeMove(snake, dir, gameState));
    
    return directions.length > 0 ? directions[0] : { x: 1, y: 0 };
  }

  /**
   * Check if a position is occupied by snake body or obstacles
   */
  private isPositionOccupied(pos: Position, currentSnake: SnakeState, gameState: GameState): boolean {
    // Check current snake body (excluding tail that will move)
    for (let i = 0; i < currentSnake.body.length - 1; i++) {
      const segment = currentSnake.body[i];
      if (segment.x === pos.x && segment.y === pos.y) {
        return true;
      }
    }
    
    // Check other snakes
    for (const snake of gameState.snakes) {
      if (snake === currentSnake) continue;
      
      for (const segment of snake.body) {
        if (segment.x === pos.x && segment.y === pos.y) {
          return true;
        }
      }
    }
    
    // Check obstacles
    for (const obstacle of gameState.obstacles) {
      if (obstacle.x === pos.x && obstacle.y === pos.y) {
        return true;
      }
    }
    
    return false;
  }

  /**
   * Get AI performance metrics
   */
  getMetrics() {
    return {
      difficulty: this.difficulty,
      strategy: this.strategy,
      decisionTime: this.decisionTime,
      pathLength: this.pathLength,
      useHamiltonian: this.useHamiltonian,
      survivalMode: this.survivalMode
    };
  }

  /**
   * Reset AI state
   */
  reset(): void {
    this.pathCache.clear();
    this.cycleIndex = 0;
    this.survivalMode = false;
    this.escapeRoutes = [];
  }
}