# Word Master - Multiplayer Online Word Game

A modern, real-time multiplayer word game built with React, Node.js, Express, Socket.IO, and MongoDB.

## Features

### Game Modes
- **Have Fun Mode**: Create custom rooms, invite friends, play casually
- **Ranked Mode**: Compete for rank points (unlock after 3 casual matches)

### Core Gameplay
- Real-time word submission with live validation
- Round-based progression (Round 1: last 1 letter, Round 2: last 2 letters, Round 3: last 3 letters)
- Word Master condition: Reach 250 words for bonus points
- Lives system: Wrong words cost lives, 0 lives = elimination
- Instant Kill: Using an already-used word = immediate elimination with 1.5x penalty
- AFK system: Auto-kick after 30 seconds of inactivity

### Rank System
| Rank | Points Range |
|------|-------------|
| Cupu | 0-30 |
| Pemula | 31-70 |
| Ade Adean | 71-150 |
| Abang Abangan | 151-300 |
| Jago | 301-600 |
| Suhu | 601-1000 |
| Sepuh | 1000+ |

### Security Features
- JWT authentication
- Rate limiting on all endpoints
- Input sanitization
- Server-side word validation
- Anti-spam protection

## Tech Stack

### Frontend
- React 18 + TypeScript
- Vite (build tool)
- Tailwind CSS
- Socket.IO Client
- React Router DOM
- shadcn/ui components

### Backend
- Node.js + Express
- Socket.IO (WebSocket)
- MongoDB + Mongoose
- JWT for authentication
- Helmet for security headers
- Express Rate Limit

## Project Structure

```
/mnt/okcomputer/output/
├── app/                    # Frontend (React + Vite)
│   ├── src/
│   │   ├── components/     # UI components
│   │   ├── contexts/       # React contexts (Auth, Game)
│   │   ├── pages/          # Page components
│   │   ├── services/       # API & Socket services
│   │   ├── types/          # TypeScript types
│   │   └── utils/          # Helper functions
│   └── dist/               # Build output
│
└── server/                 # Backend (Node.js + Express)
    ├── config/             # Database config
    ├── middleware/         # Auth & rate limiting
    ├── models/             # Mongoose models
    ├── routes/             # API routes
    ├── socket/             # Socket.IO handlers
    └── utils/              # Game logic & rank system
```

## Environment Variables

### Frontend (.env)
```
VITE_API_URL=http://localhost:3001/api
VITE_SOCKET_URL=http://localhost:3001
```

### Backend (.env)
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/wordmaster
JWT_SECRET=your-super-secret-jwt-key
API_BASE_URL=http://localhost:3001
SOCKET_PORT=3001
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (or local MongoDB)

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd word-master
```

2. **Install Backend Dependencies**
```bash
cd server
npm install
```

3. **Install Frontend Dependencies**
```bash
cd ../app
npm install
```

4. **Set up Environment Variables**
- Copy `.env.example` to `.env` in both `/server` and `/app` directories
- Update the values with your own configuration

5. **Start the Backend**
```bash
cd server
npm start
# or for development with auto-reload:
npm run dev
```

6. **Start the Frontend**
```bash
cd app
npm run dev
```

7. **Open in Browser**
Navigate to `http://localhost:5173`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/leaderboard` - Get leaderboard

### Rooms
- `GET /api/rooms` - List public rooms
- `POST /api/rooms` - Create new room
- `GET /api/rooms/:roomId` - Get room details
- `POST /api/rooms/:roomId/join` - Join room
- `POST /api/rooms/:roomId/leave` - Leave room
- `POST /api/rooms/:roomId/ready` - Toggle ready status

### Words
- `GET /api/validate?text=word` - Validate a word
- `GET /api/used?match=matchId&word=word` - Check if word was used

## Socket.IO Events

### Client → Server
- `authenticate` - Authenticate socket connection
- `join_room` - Join a game room
- `leave_room` - Leave current room
- `toggle_ready` - Toggle ready status
- `start_game` - Start game (host only)
- `submit_word` - Submit a word
- `ping_activity` - Ping activity (anti-AFK)

### Server → Client
- `game_started` - Game has started
- `word_accepted` - Word was accepted
- `word_rejected` - Word was rejected
- `instant_kill` - Player used duplicate word
- `player_eliminated` - Player eliminated
- `turn_changed` - Turn changed to next player
- `timer_update` - Timer update
- `match_ended` - Match ended with results
- `points_updated` - Player points updated

## Deployment

### Frontend (Vercel)
1. Push code to GitHub
2. Connect repository to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy

### Backend (Vercel/Railway/Render)
1. Push code to GitHub
2. Connect repository to your preferred platform
3. Set environment variables
4. Deploy

### MongoDB
- Use MongoDB Atlas for production
- Set up IP whitelist
- Create database user

## Game Rules

1. **Starting**: Host starts when all players are ready
2. **First Word**: Must start with the randomly generated letter
3. **Subsequent Words**: Must start with the last N letters of the previous word
   - Round 1: Last 1 letter (up to 25 words)
   - Round 2: Last 2 letters (up to 50 words)
   - Round 3: Last 3 letters (up to 100 words)
4. **Word Master**: At 250 total words, all remaining players win with bonus points
5. **Elimination**: 
   - Wrong word: Lose 1 life
   - 0 lives: Eliminated
   - Duplicate word: Instant elimination with 1.5x point penalty
6. **AFK**: Kicked after 30 seconds of inactivity

## Point System

Points are awarded based on rank and round:

### Win Points
| Rank | R1 | R2 | R3 |
|------|----|----|-----|
| Cupu | +5 | +10 | +15 |
| Pemula | +10 | +15 | +20 |
| Ade Adean | +15 | +20 | +30 |
| Abang Abangan | +25 | +30 | +40 |
| Jago | +35 | +50 | +80 |
| Suhu | +75 | +90 | +120 |
| Sepuh | +100 | +120 | +150 |

### Loss Points (negative)
| Rank | R1 | R2 | R3 |
|------|----|----|-----|
| Cupu | -10 | -5 | -3 |
| Pemula | -20 | -10 | -5 |
| Ade Adean | -30 | -20 | -10 |
| Abang Abangan | -50 | -30 | -15 |
| Jago | -75 | -50 | -30 |
| Suhu | -100 | -75 | -50 |
| Sepuh | -150 | -100 | -75 |

### Word Master Bonus
| Rank | Bonus |
|------|-------|
| Cupu | +10 |
| Pemula | +15 |
| Ade Adean | +20 |
| Abang Abangan | +30 |
| Jago | +50 |
| Suhu | +90 |
| Sepuh | +120 |

## License

MIT License

## Contributors

- Your Name (@yourusername)

## Support

For support, email support@wordmaster.com or join our Discord server.
