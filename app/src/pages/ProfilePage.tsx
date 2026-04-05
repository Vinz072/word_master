import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Trophy,
  Target,
  Zap,
  Crown,
  Gamepad2,
  TrendingUp,
  TrendingDown,
  Star,
  Loader2
} from 'lucide-react';
import { getRankColor, getRankIcon, getWinRate, getProgressPercentage } from '@/utils/helpers';

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      // Refresh user data
      window.location.reload();
    } finally {
      setRefreshing(false);
    }
  };

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await logout();
      toast.success('Logged out successfully');
    } catch (error) {
      toast.error('Failed to logout');
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  const rankProgress = user.rankProgress;
  const progressPercent = rankProgress 
    ? getProgressPercentage(
        rankProgress.currentPoints - (rankProgress.nextRankMinPoints - rankProgress.pointsNeeded),
        rankProgress.nextRankMinPoints - (rankProgress.nextRankMinPoints - rankProgress.pointsNeeded)
      )
    : 100;

  const stats = [
    { 
      label: 'Total Matches', 
      value: user.matchesPlayed, 
      icon: Target,
      color: 'text-blue-500'
    },
    { 
      label: 'Wins', 
      value: user.matchesWon, 
      icon: Trophy,
      color: 'text-green-500'
    },
    { 
      label: 'Losses', 
      value: user.matchesLost, 
      icon: TrendingDown,
      color: 'text-red-500'
    },
    { 
      label: 'Win Rate', 
      value: `${getWinRate(user.matchesWon, user.matchesPlayed)}%`, 
      icon: TrendingUp,
      color: 'text-purple-500'
    },
    { 
      label: 'Casual', 
      value: user.casualMatchesPlayed, 
      icon: Gamepad2,
      color: 'text-emerald-500'
    },
    { 
      label: 'Ranked', 
      value: user.rankedMatchesPlayed, 
      icon: Star,
      color: 'text-orange-500'
    },
    { 
      label: 'Word Master', 
      value: user.wordMasterCount, 
      icon: Crown,
      color: 'text-yellow-500'
    },
    { 
      label: 'Rank Points', 
      value: user.rankPoints, 
      icon: Zap,
      color: 'text-cyan-500'
    }
  ];

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b border-gray-200/50">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                className="rounded-xl"
                onClick={() => navigate('/')}
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <h1 className="font-bold text-lg text-gray-900">My Profile</h1>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-xl"
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <Loader2 className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        {/* Profile Card */}
        <Card className="ios-card border-0 overflow-hidden">
          <div 
            className="h-32"
            style={{
              background: `linear-gradient(135deg, ${getRankColor(user.rank)} 0%, ${getRankColor(user.rank)}dd 100%)`
            }}
          />
          <CardContent className="relative pt-0">
            <div className="flex flex-col sm:flex-row sm:items-end -mt-16 mb-6 gap-4">
              <div className="w-32 h-32 rounded-3xl bg-white shadow-xl flex items-center justify-center text-6xl">
                {getRankIcon(user.rank)}
              </div>
              <div className="flex-1 pb-2">
                <h2 className="text-2xl font-bold text-gray-900">{user.username}</h2>
                <p className="text-gray-500">{user.email}</p>
              </div>
            </div>

            {/* Rank Info */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span 
                  className="px-4 py-1.5 rounded-full text-sm font-bold text-white"
                  style={{ backgroundColor: getRankColor(user.rank) }}
                >
                  {user.rank}
                </span>
                <span className="text-lg font-bold text-gray-900">
                  {user.rankPoints} points
                </span>
              </div>
              
              {rankProgress && rankProgress.nextRank && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">{rankProgress.currentRank}</span>
                    <span className="text-gray-500">{rankProgress.nextRank}</span>
                  </div>
                  <Progress value={progressPercent} className="h-2" />
                  <p className="text-xs text-center text-gray-500">
                    {rankProgress.pointsNeeded} points to next rank
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-4">Statistics</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {stats.map((stat) => (
              <Card key={stat.label} className="ios-card border-0">
                <CardContent className="p-4 text-center">
                  <stat.icon className={`w-6 h-6 mx-auto mb-2 ${stat.color}`} />
                  <p className="text-xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-xs text-gray-500">{stat.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Rank Info */}
        <Card className="ios-card border-0">
          <CardContent className="p-5">
            <h3 className="text-lg font-bold text-gray-900 mb-4">About Ranks</h3>
            <div className="space-y-3">
              {[
                { rank: 'Cupu', range: '0-30', icon: '🥉' },
                { rank: 'Pemula', range: '31-70', icon: '🥈' },
                { rank: 'Ade Adean', range: '71-150', icon: '🥇' },
                { rank: 'Abang Abangan', range: '151-300', icon: '💎' },
                { rank: 'Jago', range: '301-600', icon: '🔥' },
                { rank: 'Suhu', range: '601-1000', icon: '👑' },
                { rank: 'Sepuh', range: '1000+', icon: '⭐' }
              ].map((r) => (
                <div 
                  key={r.rank}
                  className={`flex items-center gap-3 p-3 rounded-xl ${
                    r.rank === user.rank ? 'bg-blue-50 ring-1 ring-blue-200' : 'bg-gray-50'
                  }`}
                >
                  <span className="text-2xl">{r.icon}</span>
                  <div className="flex-1">
                    <p className={`font-semibold ${r.rank === user.rank ? 'text-blue-900' : 'text-gray-900'}`}>
                      {r.rank}
                    </p>
                    <p className="text-xs text-gray-500">{r.range} points</p>
                  </div>
                  {r.rank === user.rank && (
                    <span className="px-2 py-1 bg-blue-500 text-white text-xs rounded-full">
                      Current
                    </span>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="space-y-3">
          <Button
            className="w-full ios-button-danger"
            onClick={handleLogout}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
            ) : (
              <ArrowLeft className="w-5 h-5 mr-2" />
            )}
            Logout
          </Button>
        </div>
      </main>
    </div>
  );
};

export default ProfilePage;
