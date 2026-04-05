const rateLimit = require('express-rate-limit');

// General API rate limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Stricter limiter for authentication endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 login/register attempts per windowMs
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Word validation limiter
const wordValidationLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // Limit each IP to 30 word validations per minute
  message: {
    success: false,
    message: 'Too many word validation requests, please slow down'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Room creation limiter
const roomCreationLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // Limit each IP to 5 room creations per minute
  message: {
    success: false,
    message: 'Too many room creations, please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Socket connection limiter (for Express middleware before Socket.IO)
const socketConnectionLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20, // Limit each IP to 20 socket connections per minute
  message: {
    success: false,
    message: 'Too many connection attempts, please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  apiLimiter,
  authLimiter,
  wordValidationLimiter,
  roomCreationLimiter,
  socketConnectionLimiter
};
