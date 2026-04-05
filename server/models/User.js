const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters'],
    maxlength: [20, 'Username cannot exceed 20 characters'],
    match: [/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters']
  },
  rankPoints: {
    type: Number,
    default: 0,
    min: 0
  },
  rank: {
    type: String,
    enum: ['Cupu', 'Pemula', 'Ade Adean', 'Abang Abangan', 'Jago', 'Suhu', 'Sepuh'],
    default: 'Cupu'
  },
  matchesPlayed: {
    type: Number,
    default: 0
  },
  matchesWon: {
    type: Number,
    default: 0
  },
  matchesLost: {
    type: Number,
    default: 0
  },
  casualMatchesPlayed: {
    type: Number,
    default: 0
  },
  rankedMatchesPlayed: {
    type: Number,
    default: 0
  },
  wordMasterCount: {
    type: Number,
    default: 0
  },
  isOnline: {
    type: Boolean,
    default: false
  },
  lastActive: {
    type: Date,
    default: Date.now
  },
  socketId: {
    type: String,
    default: null
  },
  isInMatch: {
    type: Boolean,
    default: false
  },
  currentMatchId: {
    type: String,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Update rank based on points
userSchema.methods.updateRank = function() {
  const points = this.rankPoints;
  
  if (points >= 1001) this.rank = 'Sepuh';
  else if (points >= 601) this.rank = 'Suhu';
  else if (points >= 301) this.rank = 'Jago';
  else if (points >= 151) this.rank = 'Abang Abangan';
  else if (points >= 71) this.rank = 'Ade Adean';
  else if (points >= 31) this.rank = 'Pemula';
  else this.rank = 'Cupu';
};

// Get rank tier number (for point calculation)
userSchema.methods.getRankTier = function() {
  const rankTiers = {
    'Cupu': 1,
    'Pemula': 2,
    'Ade Adean': 3,
    'Abang Abangan': 4,
    'Jago': 5,
    'Suhu': 6,
    'Sepuh': 7
  };
  return rankTiers[this.rank] || 1;
};

// Static method to calculate points for win/loss
userSchema.statics.calculatePoints = function(rank, round, isWin, isWordMaster = false) {
  const rankTiers = {
    'Cupu': { win: [5, 10, 15], loss: [-10, -5, -3], bonus: 10 },
    'Pemula': { win: [10, 15, 20], loss: [-20, -10, -5], bonus: 15 },
    'Ade Adean': { win: [15, 20, 30], loss: [-30, -20, -10], bonus: 20 },
    'Abang Abangan': { win: [25, 30, 40], loss: [-50, -30, -15], bonus: 30 },
    'Jago': { win: [35, 50, 80], loss: [-75, -50, -30], bonus: 50 },
    'Suhu': { win: [75, 90, 120], loss: [-100, -75, -50], bonus: 90 },
    'Sepuh': { win: [100, 120, 150], loss: [-150, -100, -75], bonus: 120 }
  };

  const tier = rankTiers[rank] || rankTiers['Cupu'];
  
  if (isWordMaster) {
    return tier.bonus;
  }
  
  const roundIndex = Math.min(round - 1, 2);
  return isWin ? tier.win[roundIndex] : tier.loss[roundIndex];
};

module.exports = mongoose.model('User', userSchema);
