import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useGame } from '@/contexts/GameContext';
import { roomAPI } from '@/services/api';
import { socketService } from '@/services/socket';
import type { Room, Player } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Users,
  Clock,
  Heart,
  Crown,
  Check,
  X,
  Loader2,
  Gamepad2,
  Trophy,
  Copy,
  LogOut,
  AlertCircle
} from 'lucide-react';
import { getInitials, generateAvatarColor } from '@/utils/helpers';

const RoomPage: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { setCurrentRoom, setCurrentMatchId, setGameState } = useGame();
  
  const [room, setRoom] = useState<Room | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isReady, setIsReady] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const [isStarting, setIsStarting] = useState(false);

  const isHost = room?.hostId === user?.id;
  const allPlayersReady = room?.players.every(p => p.isReady) ?? false;
  const canStart = isHost && room?.players.length === room?.maxPlayers && allPlayersReady;

  const fetchRoom = useCallback(async () => {
    try {
      const response = await roomAPI.getRoom(roomId!);
      if (response.success && response.data) {
        setRoom(response.data.room);
        setCurrentRoom(response.data.room);
        
        // Update ready status
        const currentPlayer = response.data.room.players.find(
          p => p.userId === user?.id
        );
        if (currentPlayer) {
          setIsReady(currentPlayer.isReady);
        }
      }
    } catch (error) {
      console.error('Failed to fetch room:', error);
      toast.error('Room not found');
      navigate('/lobby');
    } finally {
      setIsLoading(false);
    }
  }, [roomId, user?.id, setCurrentRoom, navigate]);

  useEffect(() => {
    fetchRoom();
  }, [fetchRoom]);

  useEffect(() => {
    if (!roomId || !user) return;

    // Connect socket and join room
    socketService.connect();
    socketService.authenticate(user.id, user.username);
    
    socketService.onAuthenticated(() => {
      socketService.joinRoom(roomId);
    });

    // Socket event listeners
    socketService.onRoomJoined((data) => {
      if (data.success) {
        setRoom(data.room);
        setCurrentRoom(data.room);
      }
    });

    socketService.onPlayerJoined((data) => {
      toast.info(`${data.username} joined the room`);
      fetchRoom();
    });

    socketService.onPlayerLeft((data) => {
      toast.info(`${data.username} left the room`);
      fetchRoom();
    });

    socketService.onPlayerReadyChanged(() => {
      fetchRoom();
    });

    socketService.onGameStarted((gameState) => {
      setGameState(gameState);
      setCurrentMatchId(gameState.matchId);
      navigate(`/game/${gameState.matchId}`);
    });

    socketService.onError((data) => {
      toast.error(data.message);
      setIsStarting(false);
    });

    return () => {
      socketService.leaveRoom();
      socketService.removeAllListeners();
    };
  }, [roomId, user, fetchRoom, setCurrentRoom, setGameState, setCurrentMatchId, navigate]);

  const handleToggleReady = async () => {
    try {
      const response = await roomAPI.toggleReady(roomId!, !isReady);
      if (response.success) {
        setIsReady(!isReady);
        socketService.toggleReady(!isReady);
      }
    } catch (error) {
      toast.error('Failed to update ready status');
    }
  };

  const handleLeaveRoom = async () => {
    setIsLeaving(true);
    try {
      await roomAPI.leaveRoom(roomId!);
      socketService.leaveRoom();
      toast.success('Left room');
      navigate('/lobby');
    } catch (error) {
      toast.error('Failed to leave room');
      setIsLeaving(false);
    }
  };

  const handleStartGame = () => {
    if (!canStart) {
      toast.error('Cannot start game yet');
      return;
    }
    
    setIsStarting(true);
    socketService.startGame();
  };

  const copyRoomId = () => {
    navigator.clipboard.writeText(roomId!);
    toast.success('Room ID copied!');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          <p className="text-gray-500">Loading room...</p>
        </div>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 mx-auto text-red-500 mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Room Not Found</h2>
          <Button className="ios-button-primary" onClick={() => navigate('/lobby')}>
            Back to Lobby
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b border-gray-200/50">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-xl"
              onClick={handleLeaveRoom}
              disabled={isLeaving}
            >
              {isLeaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowLeft className="w-5 h-5" />}
            </Button>
            <div className="flex-1">
              <h1 className="font-bold text-lg text-gray-900 truncate">{room.name}</h1>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <button 
                  onClick={copyRoomId}
                  className="flex items-center gap-1 hover:text-blue-600 transition-colors"
                >
                  ID: {room.roomId}
                  <Copy className="w-3 h-3" />
                </button>
              </div>
            </div>
            {room.gameMode === 'ranked' ? (
              <Trophy className="w-6 h-6 text-orange-500" />
            ) : (
              <Gamepad2 className="w-6 h-6 text-green-500" />
            )}
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        {/* Room Settings */}
        <Card className="ios-card border-0">
          <CardContent className="p-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <Users className="w-5 h-5 mx-auto mb-1 text-gray-400" />
                <p className="text-lg font-bold text-gray-900">{room.maxPlayers}</p>
                <p className="text-xs text-gray-500">Players</p>
              </div>
              <div className="text-center">
                <Heart className="w-5 h-5 mx-auto mb-1 text-gray-400" />
                <p className="text-lg font-bold text-gray-900">{room.lives}</p>
                <p className="text-xs text-gray-500">Lives</p>
              </div>
              <div className="text-center">
                <Clock className="w-5 h-5 mx-auto mb-1 text-gray-400" />
                <p className="text-lg font-bold text-gray-900">{room.timeout}s</p>
                <p className="text-xs text-gray-500">Timeout</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Players List */}
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            Players ({room.players.length}/{room.maxPlayers})
          </h3>
          <div className="space-y-3">
            {room.players.map((player) => (
              <PlayerCard 
                key={player.userId} 
                player={player} 
                isHost={player.userId === room.hostId}
                isCurrentUser={player.userId === user?.id}
              />
            ))}
            
            {/* Empty Slots */}
            {Array.from({ length: room.maxPlayers - room.players.length }).map((_, index) => (
              <Card key={`empty-${index}`} className="ios-card border-0 bg-gray-50 border-dashed border-2 border-gray-200">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-400 text-lg">?</span>
                    </div>
                    <div>
                      <p className="text-gray-400 font-medium">Waiting for player...</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 safe-area-bottom">
          <div className="max-w-5xl mx-auto flex gap-3">
            <Button
              variant="outline"
              className="flex-1 h-14 rounded-xl"
              onClick={handleLeaveRoom}
              disabled={isLeaving}
            >
              <LogOut className="w-5 h-5 mr-2" />
              Leave
            </Button>
            
            {isHost ? (
              <Button
                className={`flex-1 h-14 rounded-xl ${
                  canStart 
                    ? 'ios-button-primary' 
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
                onClick={handleStartGame}
                disabled={!canStart || isStarting}
              >
                {isStarting ? (
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                ) : (
                  <Gamepad2 className="w-5 h-5 mr-2" />
                )}
                Start Game
              </Button>
            ) : (
              <Button
                className={`flex-1 h-14 rounded-xl ${
                  isReady 
                    ? 'ios-button-success' 
                    : 'ios-button-primary'
                }`}
                onClick={handleToggleReady}
              >
                {isReady ? (
                  <>
                    <Check className="w-5 h-5 mr-2" />
                    Ready
                  </>
                ) : (
                  <>
                    <X className="w-5 h-5 mr-2" />
                    Not Ready
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

// Player Card Component
const PlayerCard: React.FC<{ 
  player: Player; 
  isHost: boolean;
  isCurrentUser: boolean;
}> = ({ player, isHost, isCurrentUser }) => {
  const avatarColor = generateAvatarColor(player.username);
  
  return (
    <Card className={`ios-card border-0 ${isCurrentUser ? 'ring-2 ring-blue-400' : ''}`}>
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          <div 
            className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold"
            style={{ backgroundColor: avatarColor }}
          >
            {getInitials(player.username)}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <p className="font-semibold text-gray-900">{player.username}</p>
              {isHost && (
                <Crown className="w-4 h-4 text-yellow-500" />
              )}
              {isCurrentUser && (
                <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">
                  You
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 mt-1">
              {player.isReady ? (
                <span className="flex items-center gap-1 text-xs text-green-600">
                  <Check className="w-3 h-3" />
                  Ready
                </span>
              ) : (
                <span className="flex items-center gap-1 text-xs text-gray-400">
                  <X className="w-3 h-3" />
                  Not Ready
                </span>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RoomPage;
