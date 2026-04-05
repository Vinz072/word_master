const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema({
  matchId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  roomId: {
    type: String,
    required: true
  },
  gameMode: {
    type: String,
    enum: ['casual', 'ranked'],
    required: true
  },
  players: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    username: String,
    rank: String,
    startingPoints: Number,
    endingPoints: Number,
    pointChange: Number,
    lives: Number,
    isEliminated: {
      type: Boolean,
      default: false
    },
    eliminatedAt: Date,
    eliminatedRound: Number,
    isWinner: {
      type: Boolean,
      default: false
    },
    isWordMaster: {
      type: Boolean,
      default: false
    }
  }],
  currentRound: {
    type: Number,
    default: 1
  },
  currentPlayerIndex: {
    type: Number,
    default: 0
  },
  currentWord: {
    type: String,
    default: null
  },
  startingLetter: {
    type: String,
    default: null
  },
  wordsUsed: [{
    word: String,
    playerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    username: String,
    round: Number,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  totalWordsAccepted: {
    type: Number,
    default: 0
  },
  roundWordCounts: {
    round1: { type: Number, default: 0 },
    round2: { type: Number, default: 0 },
    round3: { type: Number, default: 0 }
  },
  status: {
    type: String,
    enum: ['waiting', 'active', 'paused', 'finished', 'abandoned'],
    default: 'waiting'
  },
  winner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  winners: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  isWordMaster: {
    type: Boolean,
    default: false
  },
  settings: {
    lives: Number,
    timeout: Number,
    maxPlayers: Number
  },
  startedAt: {
    type: Date,
    default: null
  },
  endedAt: {
    type: Date,
    default: null
  },
  duration: {
    type: Number,
    default: 0 // in seconds
  },
  lastActivity: {
    type: Date,
    default: Date.now
  },
  afkWarnings: {
    type: Map,
    of: Number,
    default: () => new Map()
  }
}, {
  timestamps: true
});

// Get required letters based on round
matchSchema.methods.getRequiredLetters = function() {
  if (!this.currentWord) return this.startingLetter || '';
  
  const word = this.currentWord.toLowerCase();
  const round = this.currentRound;
  
  if (round === 1) {
    return word.slice(-1);
  } else if (round === 2) {
    return word.slice(-2);
  } else {
    return word.slice(-3);
  }
};

// Check if word starts with required letters
matchSchema.methods.validateWordStart = function(word) {
  const required = this.getRequiredLetters().toLowerCase();
  return word.toLowerCase().startsWith(required);
};

// Check if word was already used
matchSchema.methods.isWordUsed = function(word) {
  return this.wordsUsed.some(w => w.word.toLowerCase() === word.toLowerCase());
};

// Add used word
matchSchema.methods.addUsedWord = function(word, playerId, username) {
  this.wordsUsed.push({
    word: word.toLowerCase(),
    playerId,
    username,
    round: this.currentRound
  });
  
  this.totalWordsAccepted++;
  
  if (this.currentRound === 1) this.roundWordCounts.round1++;
  else if (this.currentRound === 2) this.roundWordCounts.round2++;
  else if (this.currentRound === 3) this.roundWordCounts.round3++;
};

// Check and update round
matchSchema.methods.checkRoundProgression = function() {
  const totalWords = this.totalWordsAccepted;
  
  if (totalWords >= 250) {
    this.isWordMaster = true;
    this.status = 'finished';
    return { isWordMaster: true, roundChanged: false };
  }
  
  let newRound = 1;
  if (totalWords >= 75) newRound = 3;
  else if (totalWords >= 25) newRound = 2;
  
  const roundChanged = newRound !== this.currentRound;
  this.currentRound = newRound;
  
  return { isWordMaster: false, roundChanged, newRound };
};

// Get current player
matchSchema.methods.getCurrentPlayer = function() {
  const activePlayers = this.players.filter(p => !p.isEliminated);
  if (activePlayers.length === 0) return null;
  
  const index = this.currentPlayerIndex % activePlayers.length;
  return activePlayers[index];
};

// Move to next player
matchSchema.methods.nextPlayer = function() {
  const activePlayers = this.players.filter(p => !p.isEliminated);
  if (activePlayers.length <= 1) return null;
  
  this.currentPlayerIndex = (this.currentPlayerIndex + 1) % activePlayers.length;
  return this.getCurrentPlayer();
};

// Eliminate player
matchSchema.methods.eliminatePlayer = function(userId, round) {
  const player = this.players.find(p => p.userId.toString() === userId.toString());
  if (player) {
    player.isEliminated = true;
    player.eliminatedAt = new Date();
    player.eliminatedRound = round;
    player.lives = 0;
  }
};

// Check if match should end
matchSchema.methods.checkEndCondition = function() {
  const activePlayers = this.players.filter(p => !p.isEliminated);
  
  if (activePlayers.length <= 1) {
    this.status = 'finished';
    if (activePlayers.length === 1) {
      this.winner = activePlayers[0].userId;
      activePlayers[0].isWinner = true;
    }
    return true;
  }
  
  if (this.isWordMaster) {
    this.status = 'finished';
    activePlayers.forEach(p => {
      p.isWinner = true;
      p.isWordMaster = true;
    });
    this.winners = activePlayers.map(p => p.userId);
    return true;
  }
  
  return false;
};

// Calculate final results
matchSchema.methods.calculateResults = function() {
  const results = [];
  
  this.players.forEach(player => {
    const isWin = player.isWinner;
    const round = player.eliminatedRound || this.currentRound;
    const isWordMaster = player.isWordMaster;
    
    results.push({
      userId: player.userId,
      username: player.username,
      rank: player.rank,
      startingPoints: player.startingPoints,
      isWinner: isWin,
      isWordMaster: isWordMaster,
      eliminatedRound: player.eliminatedRound,
      pointChange: player.pointChange || 0
    });
  });
  
  return results;
};

module.exports = mongoose.model('Match', matchSchema);
