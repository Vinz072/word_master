# Word Master - Setup Guide

## Quick Start

### Option 1: Using npm scripts (Recommended)

```bash
# Install all dependencies
npm run install:all

# Start both frontend and backend in development mode
npm run dev
```

### Option 2: Manual Setup

#### Step 1: Install Backend Dependencies
```bash
cd server
npm install
```

#### Step 2: Install Frontend Dependencies
```bash
cd ../app
npm install
```

#### Step 3: Configure Environment Variables

**Backend (`server/.env`):**
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/wordmaster?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
API_BASE_URL=http://localhost:3001
SOCKET_PORT=3001
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

**Frontend (`app/.env`):**
```env
VITE_API_URL=http://localhost:3001/api
VITE_SOCKET_URL=http://localhost:3001
```

#### Step 4: Start the Servers

**Terminal 1 - Backend:**
```bash
cd server
npm start
```

**Terminal 2 - Frontend:**
```bash
cd app
npm run dev
```

#### Step 5: Open in Browser
Navigate to `http://localhost:5173`

---

## MongoDB Setup

### Using MongoDB Atlas (Recommended for Production)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account
3. Create a new cluster (M0 Sandbox - Free Tier)
4. Click "Connect" and choose "Drivers"
5. Select "Node.js" and copy the connection string
6. Replace `username`, `password`, and `cluster` in the connection string
7. Add your IP to the Network Access whitelist

### Using Local MongoDB

1. Install MongoDB Community Edition
2. Start MongoDB service
3. Use connection string: `mongodb://localhost:27017/wordmaster`

---

## Deployment

### Frontend (Vercel)

1. Push your code to GitHub
2. Go to [Vercel](https://vercel.com)
3. Import your repository
4. Configure:
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
5. Add Environment Variables:
   - `VITE_API_URL`: Your backend URL
   - `VITE_SOCKET_URL`: Your backend URL
6. Deploy

### Backend (Railway/Render/Heroku)

1. Push your code to GitHub
2. Connect your repository to your preferred platform
3. Add Environment Variables:
   - `MONGODB_URI`
   - `JWT_SECRET`
   - `CLIENT_URL` (your frontend URL)
   - `NODE_ENV=production`
4. Deploy

### Environment Variables for Production

**Backend:**
```env
MONGODB_URI=your-production-mongodb-uri
JWT_SECRET=your-production-jwt-secret-min-32-characters
API_BASE_URL=https://your-backend-url.com
SOCKET_PORT=3001
CLIENT_URL=https://your-frontend-url.com
NODE_ENV=production
```

**Frontend:**
```env
VITE_API_URL=https://your-backend-url.com/api
VITE_SOCKET_URL=https://your-backend-url.com
```

---

## Troubleshooting

### Common Issues

#### 1. MongoDB Connection Error
```
Error: connect ECONNREFUSED
```
**Solution:**
- Check your MongoDB URI
- Ensure your IP is whitelisted in MongoDB Atlas
- Verify MongoDB service is running (local)

#### 2. CORS Error
```
Access to fetch at '...' from origin '...' has been blocked by CORS policy
```
**Solution:**
- Update `CLIENT_URL` in backend `.env` to match your frontend URL
- Ensure `cors` middleware is properly configured

#### 3. Socket.IO Connection Error
```
Error: xhr poll error
```
**Solution:**
- Check `VITE_SOCKET_URL` matches your backend URL
- Ensure Socket.IO CORS is configured correctly

#### 4. JWT Token Error
```
Error: invalid token
```
**Solution:**
- Clear browser localStorage
- Re-login
- Check `JWT_SECRET` is set correctly

---

## Development Tips

### Hot Reload
Both frontend and backend support hot reload in development mode.

### Debugging
- Frontend: Use browser DevTools (F12)
- Backend: Use `console.log()` or Node.js debugger

### Testing API
Use tools like Postman or Insomnia to test API endpoints.

### Database Management
Use MongoDB Compass for GUI database management.

---

## File Structure

```
word-master/
├── app/                    # Frontend
│   ├── src/
│   │   ├── components/     # UI components
│   │   ├── contexts/       # React contexts
│   │   ├── pages/          # Page components
│   │   ├── services/       # API & Socket services
│   │   ├── types/          # TypeScript types
│   │   └── utils/          # Helper functions
│   ├── public/             # Static assets
│   └── dist/               # Build output
│
├── server/                 # Backend
│   ├── config/             # Database config
│   ├── middleware/         # Auth & rate limiting
│   ├── models/             # Mongoose models
│   ├── routes/             # API routes
│   ├── socket/             # Socket.IO handlers
│   └── utils/              # Game logic
│
├── .gitignore
├── package.json
├── README.md
└── SETUP.md
```

---

## Support

For issues and feature requests, please create an issue on GitHub.

Happy Gaming! 🎮
