import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useGame } from '@/contexts/GameContext';
import { socketService } from '@/services/socket';
import { wordAPI } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Clock,
  Heart,
  Trophy,
  Crown,
  Check,
  X,
  Skull
} from 'lucide-react';
import { getInitials, generateAvatarColor, validateWordInput, checkWordStartsWith } from '@/utils/helpers';
import type { GamePlayer } from '@/types';

const GamePage: React.FC = () => {
  const { matchId } = useParams<{ matchId: string }>();
  const navigate = useNavigate();
  const { user, updateUserPoints } = useAuth();
  const { 
    gameState, 
    setGameState,
    timeLeft, 
    setTimeLeft,
    usedWords,
    addUsedWord,
    currentPlayer,
    setCurrentPlayer,
    requiredPattern,
    setRequiredPattern,
    atmosphere,
    setAtmosphere,
    matchResults,
    setMatchResults,
    setIsMatchEnded,
    matchEndReason,
    setMatchEndReason,
    resetGame
  } = useGame();
  
  const [wordInput, setWordInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [resultType, setResultType] = useState<'success' | 'error' | 'kill' | null>(null);
  const [eliminatedPlayers, setEliminatedPlayers] = useState<string[]>([]);
  const [currentRound, setCurrentRound] = useState(1);
  const [totalWordsCount, setTotalWordsCount] = useState(0);
  const [showMatchEnd, setShowMatchEnd] = useState(false);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const activityInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  const isMyTurn = currentPlayer?.userId === user?.id;
  const isEliminated = eliminatedPlayers.includes(user?.id || '');
  
  // Use totalWordsCount to avoid unused variable warning
  void totalWordsCount;

  useEffect(() => {
    if (!matchId || !user) return;

    // Connect socket
    socketService.connect();
    socketService.authenticate(user.id, user.username);

    // Setup event listeners
    socketService.onGameStarted((state) => {
      setGameState(state);
      setCurrentPlayer(state.currentPlayer);
      setRequiredPattern(state.requiredPattern);
      setAtmosphere(state.atmosphere);
      setTimeLeft(state.settings.timeout);
    });

    socketService.onWordAccepted((data) => {
      addUsedWord(data.word);
      setTotalWordsCount(data.totalWords);
      setCurrentRound(data.round);
      
      if (data.roundChanged) {
        toast.info(`Round ${data.round} started!`);
        setAtmosphere(data.atmosphere);
      }
      
      if (data.isWordMaster) {
        toast.success('WORD MASTER! 250 words reached!', { duration: 5000 });
      }
      
      // Show success animation
      setResultType('success');
      setShowResult(true);
      setTimeout(() => setShowResult(false), 1000);
    });

    socketService.onWordRejected((data) => {
      if (data.playerId === user.id) {
        setResultType('error');
        setShowResult(true);
        setTimeout(() => setShowResult(false), 1000);
        toast.error(`Wrong word! ${data.livesRemaining} lives remaining`);
      }
      
      if (data.isEliminated) {
        setEliminatedPlayers(prev => [...prev, data.playerId]);
        toast.error(`${data.username} eliminated!`);
      }
    });

    socketService.onInstantKill((data) => {
      if (data.playerId === user.id) {
        setResultType('kill');
        setShowResult(true);
        toast.error('INSTANT KILL! Word already used!', { duration: 5000 });
      }
      setEliminatedPlayers(prev => [...prev, data.playerId]);
      toast.error(`${data.username} was instantly eliminated!`, { duration: 3000 });
    });

    socketService.onPlayerEliminated((data) => {
      setEliminatedPlayers(prev => [...prev, data.playerId]);
      toast.error(`${data.username} eliminated!`);
    });

    socketService.onTurnChanged((data) => {
      setCurrentPlayer(data.currentPlayer);
      setRequiredPattern(data.requiredPattern);
      setCurrentRound(data.round);
      
      // Reset timer
      if (gameState) {
        const timerDuration = Math.floor(gameState.settings.timeout * (data.round === 1 ? 1 : data.round === 2 ? 0.85 : 0.7));
        setTimeLeft(timerDuration);
      }
      
      // Focus input if it's my turn
      if (data.currentPlayer.userId === user.id) {
        setTimeout(() => inputRef.current?.focus(), 100);
      }
    });

    socketService.onTimerUpdate((data) => {
      setTimeLeft(data.timeLeft);
    });

    socketService.onMatchEnded((data) => {
      setMatchResults(data.results);
      setIsMatchEnded(true);
      setMatchEndReason(data.reason);
      setShowMatchEnd(true);
      
      // Update user points
      const myResult = data.results.find(r => r.userId === user.id);
      if (myResult) {
        updateUserPoints(myResult.pointChange, myResult.startingPoints + myResult.pointChange, myResult.rank);
      }
    });

    socketService.onPointsUpdated((data) => {
      toast.info(
        data.instantKill 
          ? `Instant Kill! ${data.pointChange} points` 
          : `${data.pointChange > 0 ? '+' : ''}${data.pointChange} points`,
        { duration: 3000 }
      );
    });

    socketService.onAFKWarning((data) => {
      toast.warning(data.message);
    });

    socketService.onError((data) => {
      toast.error(data.message);
    });

    // Activity ping interval
    activityInterval.current = setInterval(() => {
      socketService.pingActivity(matchId);
    }, 5000);

    return () => {
      if (activityInterval.current) {
        clearInterval(activityInterval.current);
      }
      socketService.removeAllListeners();
    };
  }, [matchId, user, setGameState, setCurrentPlayer, setRequiredPattern, setAtmosphere, setTimeLeft, addUsedWord, setMatchResults, setIsMatchEnded, setMatchEndReason, updateUserPoints, gameState]);

  const handleSubmitWord = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isMyTurn || isEliminated || isSubmitting) return;
    
    const validation = validateWordInput(wordInput);
    if (!validation.valid) {
      toast.error(validation.error);
      return;
    }
    
    if (!checkWordStartsWith(wordInput, requiredPattern)) {
      toast.error(`Word must start with "${requiredPattern.toUpperCase()}"`);
      return;
    }
    
    // Check if word was already used
    const usedCheck = await wordAPI.checkWordUsed(matchId!, wordInput);
    if (usedCheck.used) {
      toast.error('This word was already used! INSTANT KILL warning!');
    }
    
    setIsSubmitting(true);
    socketService.submitWord(wordInput, matchId!);
    setWordInput('');
    setIsSubmitting(false);
  };

  const handleLeaveGame = () => {
    resetGame();
    navigate('/');
  };

  // Get atmosphere colors
  const getAtmosphereColors = () => {
    switch (atmosphere?.theme) {
      case 'dark':
        return 'from-gray-900 via-gray-800 to-gray-900';
      case 'horror':
        return 'from-red-950 via-gray-900 to-red-950';
      default:
        return 'from-blue-50 via-white to-indigo-50';
    }
  };

  const getTimerColor = () => {
    if (timeLeft <= 5) return 'text-red-500';
    if (timeLeft <= 10) return 'text-orange-500';
    return 'text-blue-500';
  };

  if (!gameState) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500">Loading game...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br ${getAtmosphereColors()} transition-colors duration-1000`}>
      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b border-gray-200/50">
        <div className="max-w-5xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                className="rounded-xl"
                onClick={handleLeaveGame}
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="font-bold text-gray-900">Word Master</h1>
                <p className="text-xs text-gray-500">Round {currentRound}/3</p>
              </div>
            </div>
            
            {/* Timer */}
            <div className={`flex items-center gap-2 px-4 py-2 rounded-xl bg-white/80 ${getTimerColor()}`}>
              <Clock className="w-5 h-5" />
              <span className="text-xl font-bold tabular-nums">{timeLeft}s</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        {/* Current Word Display */}
        {usedWords.length > 0 && (
          <Card className="ios-card border-0 animate-fade-in">
            <CardContent className="p-6">
              <p className="text-sm text-gray-500 mb-2">Last Word</p>
              <div className="flex justify-center">
                <div className="flex gap-2">
                  {usedWords[usedWords.length - 1].split('').map((letter, index) => (
                    <div 
                      key={index}
                      className="word-letter correct"
                    >
                      {letter.toUpperCase()}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Required Pattern */}
        <Card className={`ios-card border-0 ${isMyTurn && !isEliminated ? 'ring-2 ring-blue-400' : ''}`}>
          <CardContent className="p-6 text-center">
            <p className="text-sm text-gray-500 mb-3">
              {usedWords.length === 0 ? 'Start with letter' : 'Continue with'}
            </p>
            <div className="flex justify-center gap-2">
              {requiredPattern.split('').map((letter, index) => (
                <div 
                  key={index}
                  className="w-16 h-20 sm:w-20 sm:h-24 rounded-xl bg-gradient-to-b from-blue-500 to-blue-600 flex items-center justify-center text-3xl sm:text-4xl font-bold text-white shadow-lg shadow-blue-500/30"
                >
                  {letter.toUpperCase()}
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-3">
              {currentRound === 1 && 'Round 1: Last 1 letter'}
              {currentRound === 2 && 'Round 2: Last 2 letters'}
              {currentRound === 3 && 'Round 3: Last 3 letters'}
            </p>
          </CardContent>
        </Card>

        {/* Players */}
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-4">Players</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {gameState.players.map((player) => (
              <PlayerStatusCard
                key={player.userId}
                player={player}
                isCurrentPlayer={player.userId === currentPlayer?.userId}
                isEliminated={eliminatedPlayers.includes(player.userId)}
                isMe={player.userId === user?.id}
              />
            ))}
          </div>
        </div>

        {/* Word Input */}
        {!isEliminated && (
          <form onSubmit={handleSubmitWord} className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 safe-area-bottom">
            <div className="max-w-5xl mx-auto">
              {isMyTurn ? (
                <div className="flex gap-3">
                  <Input
                    ref={inputRef}
                    type="text"
                    placeholder={`Type word starting with "${requiredPattern.toUpperCase()}"...`}
                    value={wordInput}
                    onChange={(e) => setWordInput(e.target.value)}
                    className="flex-1 ios-input text-lg"
                    disabled={isSubmitting}
                    autoFocus
                  />
                  <Button
                    type="submit"
                    className="ios-button-primary px-6"
                    disabled={isSubmitting || !wordInput.trim()}
                  >
                    <Check className="w-5 h-5" />
                  </Button>
                </div>
              ) : (
                <div className="text-center py-3">
                  <p className="text-gray-500">
                    Waiting for <span className="font-semibold text-gray-900">{currentPlayer?.username}</span>...
                  </p>
                </div>
              )}
            </div>
          </form>
        )}

        {/* Eliminated Message */}
        {isEliminated && (
          <div className="fixed bottom-0 left-0 right-0 p-4 bg-red-50 border-t border-red-200 safe-area-bottom">
            <div className="max-w-5xl mx-auto text-center">
              <div className="flex items-center justify-center gap-2 text-red-600">
                <Skull className="w-5 h-5" />
                <span className="font-semibold">You have been eliminated!</span>
              </div>
              <Button
                variant="outline"
                className="mt-3"
                onClick={handleLeaveGame}
              >
                Leave Game
              </Button>
            </div>
          </div>
        )}
      </main>

      {/* Result Overlay */}
      {showResult && (
        <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
          <div className={`text-6xl animate-bounce-in ${
            resultType === 'success' ? 'text-green-500' : 
            resultType === 'kill' ? 'text-red-600' : 'text-red-500'
          }`}>
            {resultType === 'success' && <Check className="w-24 h-24" />}
            {resultType === 'error' && <X className="w-24 h-24" />}
            {resultType === 'kill' && <Skull className="w-24 h-24" />}
          </div>
        </div>
      )}

      {/* Match End Modal */}
      {showMatchEnd && matchResults && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md ios-card border-0 animate-scale-in">
            <CardContent className="p-6 text-center">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
                <Trophy className="w-10 h-10 text-white" />
              </div>
              
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {matchEndReason === 'word_master' ? 'WORD MASTER!' : 'Match Ended'}
              </h2>
              
              <p className="text-gray-500 mb-6">
                {matchEndReason === 'word_master' 
                  ? 'Incredible! 250 words reached!' 
                  : 'The match has concluded'}
              </p>

              {/* Results List */}
              <div className="space-y-2 mb-6">
                {matchResults
                  .sort((a, b) => (b.isWinner ? 1 : 0) - (a.isWinner ? 1 : 0))
                  .map((result, index) => (
                    <div 
                      key={result.userId}
                      className={`flex items-center gap-3 p-3 rounded-xl ${
                        result.userId === user?.id ? 'bg-blue-50 ring-1 ring-blue-200' : 'bg-gray-50'
                      }`}
                    >
                      <span className="text-lg font-bold text-gray-400">#{index + 1}</span>
                      <div className="flex-1 text-left">
                        <p className="font-semibold text-gray-900">{result.username}</p>
                        <p className="text-xs text-gray-500">{result.rank}</p>
                      </div>
                      <div className="text-right">
                        <p className={`font-bold ${result.pointChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {result.pointChange >= 0 ? '+' : ''}{result.pointChange}
                        </p>
                        {result.isWinner && <Crown className="w-4 h-4 text-yellow-500 inline ml-1" />}
                      </div>
                    </div>
                  ))}
              </div>

              <Button
                className="w-full ios-button-primary"
                onClick={handleLeaveGame}
              >
                Continue
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

// Player Status Card Component
const PlayerStatusCard: React.FC<{
  player: GamePlayer;
  isCurrentPlayer: boolean;
  isEliminated: boolean;
  isMe: boolean;
}> = ({ player, isCurrentPlayer, isEliminated, isMe }) => {
  const avatarColor = generateAvatarColor(player.username);
  
  return (
    <Card className={`ios-card border-0 ${
      isCurrentPlayer ? 'ring-2 ring-blue-400' : ''
    } ${isEliminated ? 'opacity-50 grayscale' : ''}`}>
      <CardContent className="p-3">
        <div className="flex items-center gap-2">
          <div 
            className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold"
            style={{ backgroundColor: avatarColor }}
          >
            {getInitials(player.username)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm text-gray-900 truncate">
              {player.username} {isMe && '(You)'}
            </p>
            <div className="flex items-center gap-1">
              {isEliminated ? (
                <Skull className="w-3 h-3 text-red-500" />
              ) : (
                <>
                  <Heart className="w-3 h-3 text-red-400" />
                  <span className="text-xs text-gray-500">{player.lives}</span>
                </>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default GamePage;
