/**
 * Tournament System for Snake Game
 * Supports multiple game modes and AI vs AI competitions
 */

import { SnakeAI, Position, GameState } from './SnakeAI';

export interface Player {
  id: number;
  name: string;
  isAI: boolean;
  ai?: SnakeAI;
  color: string;
  score: number;
  wins: number;
  losses: number;
  draws: number;
}

export interface Match {
  id: string;
  players: Player[];
  winner?: Player;
  duration: number;
  finalScores: number[];
  completed: boolean;
}

export interface TournamentStats {
  totalMatches: number;
  completedMatches: number;
  avgMatchDuration: number;
  leaderboard: Player[];
}

export type GameMode = 'classic' | 'battle' | 'survival' | 'tournament' | 'training';

export class TournamentManager {
  private players: Map<number, Player> = new Map();
  private matches: Match[] = [];
  private currentMatch: Match | null = null;
  private gameMode: GameMode = 'classic';
  private roundRobin = false;
  private maxPlayers = 4;
  private gridWidth: number;
  private gridHeight: number;
  
  // Tournament progression
  private currentRound = 1;
  private maxRounds = 1;
  private eliminated: Set<number> = new Set();
  
  // Statistics
  private stats: TournamentStats = {
    totalMatches: 0,
    completedMatches: 0,
    avgMatchDuration: 0,
    leaderboard: []
  };

  constructor(gridWidth: number, gridHeight: number) {
    this.gridWidth = gridWidth;
    this.gridHeight = gridHeight;
  }

  /**
   * Set the game mode
   */
  setGameMode(mode: GameMode): void {
    this.gameMode = mode;
    
    switch (mode) {
      case 'battle':
        this.maxPlayers = 4;
        this.roundRobin = false;
        break;
      case 'tournament':
        this.maxPlayers = 8;
        this.roundRobin = true;
        this.maxRounds = 3; // Elimination rounds
        break;
      case 'survival':
        this.maxPlayers = 2;
        this.roundRobin = false;
        break;
      case 'training':
        this.maxPlayers = 2;
        this.roundRobin = false;
        break;
      default:
        this.maxPlayers = 1;
        this.roundRobin = false;
    }
  }

  /**
   * Add a player to the tournament
   */
  addPlayer(name: string, isAI = false, difficulty: 'Easy' | 'Medium' | 'Hard' | 'Expert' | 'Impossible' = 'Medium'): Player {
    const id = this.players.size;
    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#f0932b', '#eb4d4b', '#6c5ce7', '#a29bfe'];
    
    const player: Player = {
      id,
      name,
      isAI,
      color: colors[id % colors.length],
      score: 0,
      wins: 0,
      losses: 0,
      draws: 0
    };
    
    if (isAI) {
      player.ai = new SnakeAI(id, this.gridWidth, this.gridHeight);
      player.ai.setDifficulty(difficulty);
    }
    
    this.players.set(id, player);
    return player;
  }

  /**
   * Remove a player from the tournament
   */
  removePlayer(playerId: number): boolean {
    return this.players.delete(playerId);
  }

  /**
   * Start a new match
   */
  startMatch(playerIds: number[]): Match | null {
    if (playerIds.length < 1 || playerIds.length > this.maxPlayers) {
      return null;
    }
    
    const matchPlayers = playerIds
      .map(id => this.players.get(id))
      .filter(p => p !== undefined) as Player[];
    
    if (matchPlayers.length !== playerIds.length) {
      return null; // Some players not found
    }
    
    const match: Match = {
      id: `match_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      players: matchPlayers,
      duration: 0,
      finalScores: matchPlayers.map(() => 0),
      completed: false
    };
    
    this.matches.push(match);
    this.currentMatch = match;
    this.stats.totalMatches++;
    
    return match;
  }

  /**
   * Complete the current match
   */
  completeMatch(finalScores: number[], winner?: Player): void {
    if (!this.currentMatch) return;
    
    this.currentMatch.finalScores = finalScores;
    this.currentMatch.winner = winner;
    this.currentMatch.completed = true;
    this.currentMatch.duration = Date.now() - parseInt(this.currentMatch.id.split('_')[1]);
    
    // Update player statistics
    this.currentMatch.players.forEach((player, index) => {
      player.score += finalScores[index];
      
      if (player === winner) {
        player.wins++;
      } else if (winner) {
        player.losses++;
      } else {
        player.draws++;
      }
    });
    
    this.stats.completedMatches++;
    this.updateLeaderboard();
    
    // Check if tournament round is complete
    if (this.gameMode === 'tournament') {
      this.checkTournamentProgression();
    }
    
    this.currentMatch = null;
  }

  /**
   * Generate tournament brackets
   */
  generateTournamentBrackets(): Match[] {
    if (this.gameMode !== 'tournament') {
      return [];
    }
    
    const activePlayers = Array.from(this.players.values())
      .filter(p => !this.eliminated.has(p.id));
    
    const brackets: Match[] = [];
    
    if (this.roundRobin) {
      // Round-robin format
      for (let i = 0; i < activePlayers.length; i++) {
        for (let j = i + 1; j < activePlayers.length; j++) {
          const match = this.createMatch([activePlayers[i].id, activePlayers[j].id]);
          if (match) {
            brackets.push(match);
          }
        }
      }
    } else {
      // Elimination format
      for (let i = 0; i < activePlayers.length; i += 2) {
        if (i + 1 < activePlayers.length) {
          const match = this.createMatch([activePlayers[i].id, activePlayers[i + 1].id]);
          if (match) {
            brackets.push(match);
          }
        }
      }
    }
    
    return brackets;
  }

  /**
   * Create a match without starting it
   */
  private createMatch(playerIds: number[]): Match | null {
    const matchPlayers = playerIds
      .map(id => this.players.get(id))
      .filter(p => p !== undefined) as Player[];
    
    if (matchPlayers.length !== playerIds.length) {
      return null;
    }
    
    return {
      id: `match_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      players: matchPlayers,
      duration: 0,
      finalScores: matchPlayers.map(() => 0),
      completed: false
    };
  }

  /**
   * Check tournament progression and eliminate players
   */
  private checkTournamentProgression(): void {
    const roundMatches = this.matches.filter(m => 
      m.id.includes(`round_${this.currentRound}`) && m.completed
    );
    
    // Check if all matches in current round are complete
    const expectedMatches = Math.ceil(this.players.size / Math.pow(2, this.currentRound - 1)) / 2;
    
    if (roundMatches.length >= expectedMatches) {
      // Eliminate lowest performing players
      const sortedPlayers = Array.from(this.players.values())
        .filter(p => !this.eliminated.has(p.id))
        .sort((a, b) => b.score - a.score);
      
      const toEliminate = Math.floor(sortedPlayers.length / 2);
      
      for (let i = sortedPlayers.length - toEliminate; i < sortedPlayers.length; i++) {
        this.eliminated.add(sortedPlayers[i].id);
      }
      
      this.currentRound++;
      
      // Check if tournament is over
      const remaining = sortedPlayers.length - toEliminate;
      if (remaining <= 1 || this.currentRound > this.maxRounds) {
        this.completeTournament();
      }
    }
  }

  /**
   * Complete the entire tournament
   */
  private completeTournament(): void {
    const winner = Array.from(this.players.values())
      .filter(p => !this.eliminated.has(p.id))
      .sort((a, b) => b.score - a.score)[0];
    
    console.log(`Tournament winner: ${winner?.name}`);
  }

  /**
   * Update the leaderboard
   */
  private updateLeaderboard(): void {
    this.stats.leaderboard = Array.from(this.players.values())
      .sort((a, b) => {
        // Sort by wins first, then by score
        if (b.wins !== a.wins) return b.wins - a.wins;
        return b.score - a.score;
      });
    
    // Update average match duration
    if (this.stats.completedMatches > 0) {
      const totalDuration = this.matches
        .filter(m => m.completed)
        .reduce((sum, m) => sum + m.duration, 0);
      
      this.stats.avgMatchDuration = totalDuration / this.stats.completedMatches;
    }
  }

  /**
   * Get AI move for a specific player
   */
  getAIMove(playerId: number, gameState: GameState): Position | null {
    const player = this.players.get(playerId);
    
    if (!player || !player.isAI || !player.ai) {
      return null;
    }
    
    return player.ai.getNextMove(gameState);
  }

  /**
   * Create a practice match against AI
   */
  createPracticeMatch(humanPlayerId: number, aiDifficulty: 'Easy' | 'Medium' | 'Hard' | 'Expert' | 'Impossible'): Match | null {
    // Create AI opponent
    const aiPlayer = this.addPlayer(`AI (${aiDifficulty})`, true, aiDifficulty);
    
    return this.startMatch([humanPlayerId, aiPlayer.id]);
  }

  /**
   * Create AI vs AI exhibition match
   */
  createAIExhibition(difficulties: ('Easy' | 'Medium' | 'Hard' | 'Expert' | 'Impossible')[]): Match | null {
    const aiPlayers = difficulties.map((difficulty, index) => 
      this.addPlayer(`AI${index + 1} (${difficulty})`, true, difficulty)
    );
    
    return this.startMatch(aiPlayers.map(p => p.id));
  }

  /**
   * Get current tournament status
   */
  getTournamentStatus() {
    return {
      mode: this.gameMode,
      currentRound: this.currentRound,
      maxRounds: this.maxRounds,
      activePlayers: Array.from(this.players.values()).filter(p => !this.eliminated.has(p.id)).length,
      eliminatedPlayers: this.eliminated.size,
      currentMatch: this.currentMatch,
      stats: this.stats
    };
  }

  /**
   * Get match history
   */
  getMatchHistory(): Match[] {
    return this.matches.filter(m => m.completed);
  }

  /**
   * Reset tournament
   */
  reset(): void {
    this.players.clear();
    this.matches = [];
    this.currentMatch = null;
    this.currentRound = 1;
    this.eliminated.clear();
    this.stats = {
      totalMatches: 0,
      completedMatches: 0,
      avgMatchDuration: 0,
      leaderboard: []
    };
  }

  /**
   * Get player statistics
   */
  getPlayerStats(playerId: number) {
    const player = this.players.get(playerId);
    if (!player) return null;
    
    const playerMatches = this.matches.filter(m => 
      m.players.some(p => p.id === playerId) && m.completed
    );
    
    const totalGames = playerMatches.length;
    const winRate = totalGames > 0 ? player.wins / totalGames : 0;
    const avgScore = totalGames > 0 ? player.score / totalGames : 0;
    
    return {
      ...player,
      totalGames,
      winRate,
      avgScore,
      recentMatches: playerMatches.slice(-5)
    };
  }

  /**
   * Export tournament data
   */
  exportTournamentData() {
    return {
      mode: this.gameMode,
      players: Array.from(this.players.values()),
      matches: this.matches,
      stats: this.stats,
      leaderboard: this.stats.leaderboard
    };
  }
}