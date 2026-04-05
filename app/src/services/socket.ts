import { io, type Socket } from 'socket.io-client';
import type { User, Room, GameState, MatchResult, RoundAtmosphere, GamePlayer } from '@/types';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001';

class SocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  connect(): Socket {
    if (!this.socket) {
      this.socket = io(SOCKET_URL, {
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: this.maxReconnectAttempts,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        timeout: 20000
      });

      this.setupEventHandlers();
    }

    return this.socket;
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.reconnectAttempts = 0;
    }
  }

  getSocket(): Socket | null {
    return this.socket;
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  // Authentication
  authenticate(userId: string, username: string): void {
    this.socket?.emit('authenticate', { userId, username });
  }

  // Room management
  joinRoom(roomId: string): void {
    this.socket?.emit('join_room', { roomId });
  }

  leaveRoom(): void {
    this.socket?.emit('leave_room');
  }

  toggleReady(isReady: boolean): void {
    this.socket?.emit('toggle_ready', { isReady });
  }

  startGame(): void {
    this.socket?.emit('start_game');
  }

  // Game actions
  submitWord(word: string, matchId: string): void {
    this.socket?.emit('submit_word', { word, matchId });
  }

  pingActivity(matchId: string): void {
    this.socket?.emit('ping_activity', { matchId });
  }

  // Event listeners
  onAuthenticated(callback: (data: { success: boolean; user?: User }) => void): void {
    this.socket?.on('authenticated', callback);
  }

  onAuthError(callback: (data: { message: string }) => void): void {
    this.socket?.on('auth_error', callback);
  }

  onRoomJoined(callback: (data: { success: boolean; room: Room }) => void): void {
    this.socket?.on('room_joined', callback);
  }

  onRoomLeft(callback: (data: { success: boolean }) => void): void {
    this.socket?.on('room_left', callback);
  }

  onPlayerJoined(callback: (data: { userId: string; username: string }) => void): void {
    this.socket?.on('player_joined', callback);
  }

  onPlayerLeft(callback: (data: { userId: string; username: string }) => void): void {
    this.socket?.on('player_left', callback);
  }

  onPlayerReadyChanged(callback: (data: { userId: string; username: string; isReady: boolean; allReady: boolean }) => void): void {
    this.socket?.on('player_ready_changed', callback);
  }

  onGameStarted(callback: (data: GameState) => void): void {
    this.socket?.on('game_started', callback);
  }

  onWordAccepted(callback: (data: {
    word: string;
    playerId: string;
    username: string;
    totalWords: number;
    round: number;
    roundChanged: boolean;
    isWordMaster: boolean;
    atmosphere: RoundAtmosphere;
  }) => void): void {
    this.socket?.on('word_accepted', callback);
  }

  onWordRejected(callback: (data: {
    word: string;
    playerId: string;
    username: string;
    reason: string;
    livesRemaining: number;
    isEliminated: boolean;
  }) => void): void {
    this.socket?.on('word_rejected', callback);
  }

  onInstantKill(callback: (data: {
    word: string;
    playerId: string;
    username: string;
    message: string;
  }) => void): void {
    this.socket?.on('instant_kill', callback);
  }

  onPlayerEliminated(callback: (data: { playerId: string; username: string; reason: string }) => void): void {
    this.socket?.on('player_eliminated', callback);
  }

  onTurnChanged(callback: (data: { currentPlayer: GamePlayer; requiredPattern: string; round: number }) => void): void {
    this.socket?.on('turn_changed', callback);
  }

  onTimerUpdate(callback: (data: { timeLeft: number }) => void): void {
    this.socket?.on('timer_update', callback);
  }

  onMatchEnded(callback: (data: {
    reason: string;
    isWordMaster: boolean;
    results: MatchResult[];
    duration: number;
    totalWords: number;
    roundReached: number;
  }) => void): void {
    this.socket?.on('match_ended', callback);
  }

  onPointsUpdated(callback: (data: { pointChange: number; newTotal: number; rank: string; instantKill?: boolean }) => void): void {
    this.socket?.on('points_updated', callback);
  }

  onAFKWarning(callback: (data: { warningCount: number; message: string }) => void): void {
    this.socket?.on('afk_warning', callback);
  }

  onError(callback: (data: { message: string }) => void): void {
    this.socket?.on('error', callback);
  }

  onConnect(callback: () => void): void {
    this.socket?.on('connect', callback);
  }

  onDisconnect(callback: (reason: string) => void): void {
    this.socket?.on('disconnect', callback);
  }

  onReconnect(callback: (attemptNumber: number) => void): void {
    this.socket?.on('reconnect', callback);
  }

  onReconnectError(callback: (error: Error) => void): void {
    this.socket?.on('reconnect_error', callback);
  }

  // Remove listeners
  removeAllListeners(): void {
    this.socket?.removeAllListeners();
  }

  removeListener(event: string): void {
    this.socket?.off(event);
  }

  private setupEventHandlers(): void {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('Socket connected:', this.socket?.id);
      this.reconnectAttempts = 0;
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
    });

    this.socket.on('reconnect', (attemptNumber) => {
      console.log('Socket reconnected after', attemptNumber, 'attempts');
    });

    this.socket.on('reconnect_error', (error) => {
      console.error('Socket reconnection error:', error);
      this.reconnectAttempts++;
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });
  }
}

export const socketService = new SocketService();
export default socketService;
