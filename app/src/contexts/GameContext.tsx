import React, { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { Room, GameState, MatchResult, RoundAtmosphere, GamePlayer } from '@/types';

interface GameContextType {
  currentRoom: Room | null;
  currentMatchId: string | null;
  gameState: GameState | null;
  currentRound: number;
  timeLeft: number;
  usedWords: string[];
  totalWords: number;
  currentPlayer: GamePlayer | null;
  requiredPattern: string;
  atmosphere: RoundAtmosphere | null;
  matchResults: MatchResult[] | null;
  isMatchEnded: boolean;
  matchEndReason: string | null;
  setCurrentRoom: (room: Room | null) => void;
  setCurrentMatchId: (matchId: string | null) => void;
  setGameState: (state: GameState | null) => void;
  updateGameState: (updates: Partial<GameState>) => void;
  setTimeLeft: (time: number) => void;
  addUsedWord: (word: string) => void;
  setCurrentPlayer: (player: GamePlayer | null) => void;
  setRequiredPattern: (pattern: string) => void;
  setAtmosphere: (atmosphere: RoundAtmosphere) => void;
  setMatchResults: (results: MatchResult[] | null) => void;
  setIsMatchEnded: (ended: boolean) => void;
  setMatchEndReason: (reason: string | null) => void;
  resetGame: () => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const useGame = (): GameContextType => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};

interface GameProviderProps {
  children: ReactNode;
}

export const GameProvider: React.FC<GameProviderProps> = ({ children }) => {
  const [currentRoom, setCurrentRoom] = useState<Room | null>(null);
  const [currentMatchId, setCurrentMatchId] = useState<string | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [currentRound, setCurrentRound] = useState(1);
  const [timeLeft, setTimeLeft] = useState(15);
  const [usedWords, setUsedWords] = useState<string[]>([]);
  const [totalWords, setTotalWords] = useState(0);
  const [currentPlayer, setCurrentPlayer] = useState<GamePlayer | null>(null);
  const [requiredPattern, setRequiredPattern] = useState('');
  const [atmosphere, setAtmosphere] = useState<RoundAtmosphere | null>(null);
  const [matchResults, setMatchResults] = useState<MatchResult[] | null>(null);
  const [isMatchEnded, setIsMatchEnded] = useState(false);
  const [matchEndReason, setMatchEndReason] = useState<string | null>(null);

  const updateGameState = useCallback((updates: Partial<GameState>) => {
    setGameState((prev) => {
      if (!prev) return null;
      return { ...prev, ...updates };
    });
  }, []);

  const addUsedWord = useCallback((word: string) => {
    setUsedWords((prev) => [...prev, word]);
    setTotalWords((prev) => prev + 1);
  }, []);

  const resetGame = useCallback(() => {
    setCurrentRoom(null);
    setCurrentMatchId(null);
    setGameState(null);
    setCurrentRound(1);
    setTimeLeft(15);
    setUsedWords([]);
    setTotalWords(0);
    setCurrentPlayer(null);
    setRequiredPattern('');
    setAtmosphere(null);
    setMatchResults(null);
    setIsMatchEnded(false);
    setMatchEndReason(null);
  }, []);

  const value: GameContextType = {
    currentRoom,
    currentMatchId,
    gameState,
    currentRound,
    timeLeft,
    usedWords,
    totalWords,
    currentPlayer,
    requiredPattern,
    atmosphere,
    matchResults,
    isMatchEnded,
    matchEndReason,
    setCurrentRoom,
    setCurrentMatchId,
    setGameState,
    updateGameState,
    setTimeLeft,
    addUsedWord,
    setCurrentPlayer,
    setRequiredPattern,
    setAtmosphere,
    setMatchResults,
    setIsMatchEnded,
    setMatchEndReason,
    resetGame
  };

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
};

export default GameContext;
