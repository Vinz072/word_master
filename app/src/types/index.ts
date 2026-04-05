export interface User {
  id: string;
  username: string;
  email: string;
  rank: string;
  rankPoints: number;
  rankProgress?: {
    currentRank: string;
    nextRank: string;
    currentPoints: number;
    pointsNeeded: number;
    nextRankMinPoints: number;
  };
  matchesPlayed: number;
  matchesWon: number;
  matchesLost: number;
  casualMatchesPlayed: number;
  rankedMatchesPlayed: number;
  wordMasterCount: number;
  rankedUnlocked: boolean;
  isOnline?: boolean;
  isInMatch?: boolean;
  currentMatchId?: string | null;
}

export interface Player {
  userId: string;
  username: string;
  socketId?: string;
  isReady: boolean;
  lives: number;
  isEliminated: boolean;
  joinedAt?: string;
  rank?: string;
}

export interface Room {
  roomId: string;
  name: string;
  hostId: string;
  players: Player[];
  maxPlayers: number;
  isPrivate: boolean;
  lives: number;
  timeout: number;
  gameMode: 'casual' | 'ranked';
  status: 'waiting' | 'playing' | 'finished';
  matchId?: string;
  createdAt?: string;
}

export interface Match {
  matchId: string;
  roomId: string;
  gameMode: string;
  players: MatchPlayer[];
  currentRound: number;
  currentPlayerIndex: number;
  currentWord?: string;
  startingLetter: string;
  wordsUsed: UsedWord[];
  totalWordsAccepted: number;
  status: string;
  settings: {
    lives: number;
    timeout: number;
    maxPlayers: number;
  };
}

export interface MatchPlayer {
  userId: string;
  username: string;
  rank: string;
  startingPoints: number;
  endingPoints: number;
  pointChange: number;
  lives: number;
  isEliminated: boolean;
  eliminatedAt?: string;
  eliminatedRound?: number;
  isWinner: boolean;
  isWordMaster: boolean;
}

export interface UsedWord {
  word: string;
  playerId: string;
  username: string;
  round: number;
  timestamp: string;
}

export interface GameState {
  matchId: string;
  players: GamePlayer[];
  currentRound: number;
  currentPlayer: GamePlayer;
  startingLetter: string;
  requiredPattern: string;
  settings: {
    lives: number;
    timeout: number;
    maxPlayers: number;
  };
  atmosphere: RoundAtmosphere;
}

export interface GamePlayer {
  userId: string;
  username: string;
  lives: number;
  isEliminated: boolean;
}

export interface RoundAtmosphere {
  name: string;
  theme: string;
  bgColor: string;
  textColor: string;
  accentColor: string;
  intensity: string;
}

export interface MatchResult {
  userId: string;
  username: string;
  rank: string;
  startingPoints: number;
  isWinner: boolean;
  isWordMaster: boolean;
  eliminatedRound?: number;
  pointChange: number;
}

export interface LeaderboardUser {
  id: string;
  username: string;
  rank: string;
  rankPoints: number;
  matchesPlayed: number;
  matchesWon: number;
  wordMasterCount: number;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data?: {
    token: string;
    user: User;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

export interface WordValidationResponse {
  success: boolean;
  valid: boolean;
  word?: string;
  message?: string;
}

export interface SocketEvents {
  // Client to Server
  authenticate: (data: { userId: string; username: string }) => void;
  join_room: (data: { roomId: string }) => void;
  leave_room: () => void;
  toggle_ready: (data: { isReady: boolean }) => void;
  start_game: () => void;
  submit_word: (data: { word: string; matchId: string }) => void;
  ping_activity: (data: { matchId: string }) => void;

  // Server to Client
  authenticated: (data: { success: boolean; user?: User }) => void;
  auth_error: (data: { message: string }) => void;
  room_joined: (data: { success: boolean; room: Room }) => void;
  room_left: (data: { success: boolean }) => void;
  player_joined: (data: { userId: string; username: string }) => void;
  player_left: (data: { userId: string; username: string }) => void;
  player_ready_changed: (data: { userId: string; username: string; isReady: boolean; allReady: boolean }) => void;
  game_started: (data: GameState) => void;
  word_accepted: (data: {
    word: string;
    playerId: string;
    username: string;
    totalWords: number;
    round: number;
    roundChanged: boolean;
    isWordMaster: boolean;
    atmosphere: RoundAtmosphere;
  }) => void;
  word_rejected: (data: {
    word: string;
    playerId: string;
    username: string;
    reason: string;
    livesRemaining: number;
    isEliminated: boolean;
  }) => void;
  instant_kill: (data: {
    word: string;
    playerId: string;
    username: string;
    message: string;
  }) => void;
  player_eliminated: (data: { playerId: string; username: string; reason: string }) => void;
  turn_changed: (data: { currentPlayer: GamePlayer; requiredPattern: string; round: number }) => void;
  timer_update: (data: { timeLeft: number }) => void;
  match_ended: (data: {
    reason: string;
    isWordMaster: boolean;
    results: MatchResult[];
    duration: number;
    totalWords: number;
    roundReached: number;
  }) => void;
  points_updated: (data: { pointChange: number; newTotal: number; rank: string; instantKill?: boolean }) => void;
  afk_warning: (data: { warningCount: number; message: string }) => void;
  error: (data: { message: string }) => void;
}

export const RANK_COLORS: Record<string, string> = {
  'Cupu': '#9CA3AF',
  'Pemula': '#10B981',
  'Ade Adean': '#3B82F6',
  'Abang Abangan': '#8B5CF6',
  'Jago': '#F59E0B',
  'Suhu': '#EF4444',
  'Sepuh': '#FCD34D'
};

export const RANK_ICONS: Record<string, string> = {
  'Cupu': '🥉',
  'Pemula': '🥈',
  'Ade Adean': '🥇',
  'Abang Abangan': '💎',
  'Jago': '🔥',
  'Suhu': '👑',
  'Sepuh': '⭐'
};
