const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  roomId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 30
  },
  hostId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  players: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    username: String,
    socketId: String,
    isReady: {
      type: Boolean,
      default: false
    },
    lives: {
      type: Number,
      default: 5
    },
    isEliminated: {
      type: Boolean,
      default: false
    },
    joinedAt: {
      type: Date,
      default: Date.now
    }
  }],
  maxPlayers: {
    type: Number,
    required: true,
    enum: [2, 3, 4],
    default: 2
  },
  password: {
    type: String,
    default: null
  },
  isPrivate: {
    type: Boolean,
    default: false
  },
  lives: {
    type: Number,
    default: 5,
    min: 1,
    max: 10
  },
  timeout: {
    type: Number,
    default: 15,
    min: 5,
    max: 60
  },
  status: {
    type: String,
    enum: ['waiting', 'playing', 'finished'],
    default: 'waiting'
  },
  gameMode: {
    type: String,
    enum: ['casual', 'ranked'],
    default: 'casual'
  },
  matchId: {
    type: String,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 86400 // Auto delete after 24 hours
  },
  lastActivity: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Update last activity on save
roomSchema.pre('save', function(next) {
  this.lastActivity = new Date();
  next();
});

// Check if room is full
roomSchema.methods.isFull = function() {
  return this.players.length >= this.maxPlayers;
};

// Check if all players are ready
roomSchema.methods.allReady = function() {
  return this.players.every(p => p.isReady);
};

// Get active players (not eliminated)
roomSchema.methods.getActivePlayers = function() {
  return this.players.filter(p => !p.isEliminated);
};

// Get player by userId
roomSchema.methods.getPlayer = function(userId) {
  return this.players.find(p => p.userId.toString() === userId.toString());
};

// Remove player
roomSchema.methods.removePlayer = function(userId) {
  this.players = this.players.filter(p => p.userId.toString() !== userId.toString());
};

module.exports = mongoose.model('Room', roomSchema);
