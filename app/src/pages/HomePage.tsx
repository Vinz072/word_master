import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Gamepad2, 
  Trophy, 
  Users, 
  Zap, 
  Target, 
  Crown,
  ChevronRight,
  LogOut,
  User,
  BarChart3
} from 'lucide-react';
import { getRankColor, getRankIcon, getWinRate } from '@/utils/helpers';
import { toast } from 'sonner';

const HomePage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
    } catch (error) {
      toast.error('Failed to logout');
    }
  };

  const gameModes = [
    {
      id: 'casual',
      title: 'Have Fun',
      description: 'Play with friends in custom rooms',
      icon: Users,
      color: 'from-green-500 to-emerald-600',
      shadowColor: 'shadow-green-500/30',
      path: '/lobby?mode=casual'
    },
    {
      id: 'ranked',
      title: 'Ranked Match',
      description: user?.rankedUnlocked 
        ? 'Compete for rank points' 
        : 'Play 3 casual matches to unlock',
      icon: Trophy,
      color: user?.rankedUnlocked ? 'from-orange-500 to-red-600' : 'from-gray-400 to-gray-500',
      shadowColor: user?.rankedUnlocked ? 'shadow-orange-500/30' : 'shadow-gray-400/30',
      path: '/lobby?mode=ranked',
      disabled: !user?.rankedUnlocked
    }
  ];

  const stats = [
    { label: 'Matches', value: user?.matchesPlayed || 0, icon: Target },
    { label: 'Wins', value: user?.matchesWon || 0, icon: Trophy },
    { label: 'Win Rate', value: `${getWinRate(user?.matchesWon || 0, user?.matchesPlayed || 0)}%`, icon: Zap },
    { label: 'Word Master', value: user?.wordMasterCount || 0, icon: Crown }
  ];

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b border-gray-200/50">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
              <Gamepad2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-lg text-gray-900">Word Master</h1>
              <p className="text-xs text-gray-500">Multiplayer Word Game</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-xl"
              onClick={() => navigate('/profile')}
            >
              <User className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-xl text-red-500 hover:text-red-600 hover:bg-red-50"
              onClick={handleLogout}
            >
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        {/* User Profile Card */}
        <Card className="ios-card overflow-hidden border-0">
          <div 
            className="h-24 bg-gradient-to-r from-blue-500 to-indigo-600"
            style={{
              background: `linear-gradient(135deg, ${getRankColor(user?.rank || 'Cupu')} 0%, ${getRankColor(user?.rank || 'Cupu')}dd 100%)`
            }}
          />
          <CardContent className="relative pt-0">
            <div className="flex flex-col sm:flex-row sm:items-end -mt-10 mb-4 gap-4">
              <div className="w-20 h-20 rounded-2xl bg-white shadow-lg flex items-center justify-center text-4xl">
                {getRankIcon(user?.rank || 'Cupu')}
              </div>
              <div className="flex-1 pb-2">
                <h2 className="text-xl font-bold text-gray-900">{user?.username}</h2>
                <div className="flex items-center gap-2">
                  <span 
                    className="px-3 py-0.5 rounded-full text-sm font-semibold text-white"
                    style={{ backgroundColor: getRankColor(user?.rank || 'Cupu') }}
                  >
                    {user?.rank}
                  </span>
                  <span className="text-sm text-gray-500">
                    {user?.rankPoints} points
                  </span>
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {stats.map((stat) => (
                <div 
                  key={stat.label}
                  className="bg-gray-50 rounded-xl p-3 text-center"
                >
                  <stat.icon className="w-5 h-5 mx-auto mb-1 text-gray-400" />
                  <p className="text-lg font-bold text-gray-900">{stat.value}</p>
                  <p className="text-xs text-gray-500">{stat.label}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Game Modes */}
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-4">Choose Game Mode</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            {gameModes.map((mode) => (
              <button
                key={mode.id}
                onClick={() => !mode.disabled && navigate(mode.path)}
                disabled={mode.disabled}
                className={`relative group text-left p-6 rounded-2xl transition-all duration-300 ${
                  mode.disabled 
                    ? 'bg-gray-100 cursor-not-allowed opacity-70' 
                    : 'bg-white hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl'
                }`}
              >
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${mode.color} flex items-center justify-center mb-4 ${mode.shadowColor} shadow-lg`}>
                  <mode.icon className="w-7 h-7 text-white" />
                </div>
                <h4 className="text-lg font-bold text-gray-900 mb-1">{mode.title}</h4>
                <p className="text-sm text-gray-500">{mode.description}</p>
                
                {!mode.disabled && (
                  <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                )}

                {mode.disabled && (
                  <div className="absolute top-4 right-4 px-2 py-1 bg-gray-200 rounded-full text-xs font-medium text-gray-600">
                    Locked
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <Button
              variant="outline"
              className="h-auto py-4 rounded-xl flex flex-col items-center gap-2"
              onClick={() => navigate('/leaderboard')}
            >
              <BarChart3 className="w-6 h-6 text-blue-500" />
              <span className="text-sm font-medium">Leaderboard</span>
            </Button>
            <Button
              variant="outline"
              className="h-auto py-4 rounded-xl flex flex-col items-center gap-2"
              onClick={() => navigate('/profile')}
            >
              <User className="w-6 h-6 text-green-500" />
              <span className="text-sm font-medium">My Profile</span>
            </Button>
            <Button
              variant="outline"
              className="h-auto py-4 rounded-xl flex flex-col items-center gap-2"
              onClick={() => navigate('/lobby')}
            >
              <Gamepad2 className="w-6 h-6 text-purple-500" />
              <span className="text-sm font-medium">Join Room</span>
            </Button>
          </div>
        </div>

        {/* How to Play */}
        <Card className="ios-card border-0 bg-gradient-to-br from-indigo-50 to-purple-50">
          <CardContent className="p-5">
            <h4 className="font-bold text-gray-900 mb-3">How to Play</h4>
            <ol className="space-y-2 text-sm text-gray-600">
              <li className="flex gap-2">
                <span className="w-5 h-5 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center flex-shrink-0">1</span>
                <span>Create or join a room</span>
              </li>
              <li className="flex gap-2">
                <span className="w-5 h-5 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center flex-shrink-0">2</span>
                <span>Wait for all players to be ready</span>
              </li>
              <li className="flex gap-2">
                <span className="w-5 h-5 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center flex-shrink-0">3</span>
                <span>Type words starting with the required letters</span>
              </li>
              <li className="flex gap-2">
                <span className="w-5 h-5 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center flex-shrink-0">4</span>
                <span>Survive and become the Word Master!</span>
              </li>
            </ol>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default HomePage;
