import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '@/services/api';
import type { LeaderboardUser } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Trophy,
  Medal,
  Award,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Crown
} from 'lucide-react';
import { getRankColor, getInitials, generateAvatarColor } from '@/utils/helpers';

const LeaderboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchLeaderboard = useCallback(async (pageNum: number) => {
    try {
      setIsLoading(true);
      const response = await authAPI.getLeaderboard(pageNum, 10);
      
      if (response.success && response.data) {
        setUsers(response.data.users);
        setTotalPages(response.data.pagination.pages);
      }
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
      toast.error('Failed to load leaderboard');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLeaderboard(page);
  }, [fetchLeaderboard, page]);

  const getPositionIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Crown className="w-6 h-6 text-yellow-500" />;
      case 1:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 2:
        return <Award className="w-6 h-6 text-amber-600" />;
      default:
        return <span className="w-6 h-6 flex items-center justify-center font-bold text-gray-400">{index + 1}</span>;
    }
  };

  const getRankBgColor = (index: number) => {
    switch (index) {
      case 0:
        return 'bg-gradient-to-r from-yellow-50 to-amber-50 ring-1 ring-yellow-200';
      case 1:
        return 'bg-gradient-to-r from-gray-50 to-slate-50 ring-1 ring-gray-200';
      case 2:
        return 'bg-gradient-to-r from-amber-50 to-orange-50 ring-1 ring-amber-200';
      default:
        return 'bg-white';
    }
  };

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b border-gray-200/50">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-xl"
              onClick={() => navigate('/')}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex-1">
              <h1 className="font-bold text-lg text-gray-900">Leaderboard</h1>
              <p className="text-xs text-gray-500">Top players ranked by points</p>
            </div>
            <Trophy className="w-6 h-6 text-yellow-500" />
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500 mb-4" />
            <p className="text-gray-500">Loading leaderboard...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-12">
            <Trophy className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No players yet</h3>
            <p className="text-gray-500">Be the first to play and rank up!</p>
          </div>
        ) : (
          <>
            {/* Top 3 Podium */}
            {page === 1 && users.length >= 3 && (
              <div className="mb-8">
                <div className="flex justify-center items-end gap-4 mb-6">
                  {/* 2nd Place */}
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center text-2xl mb-2 shadow-lg">
                      🥈
                    </div>
                    <div className="w-20 h-24 bg-gray-200 rounded-t-lg flex items-end justify-center pb-2">
                      <span className="text-2xl font-bold text-gray-600">2</span>
                    </div>
                    <p className="text-sm font-semibold text-gray-900 mt-2 truncate max-w-[80px]">
                      {users[1].username}
                    </p>
                    <p className="text-xs text-gray-500">{users[1].rankPoints} pts</p>
                  </div>

                  {/* 1st Place */}
                  <div className="flex flex-col items-center">
                    <Crown className="w-8 h-8 text-yellow-500 mb-1" />
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center text-3xl mb-2 shadow-xl">
                      🥇
                    </div>
                    <div className="w-24 h-32 bg-gradient-to-b from-yellow-300 to-yellow-400 rounded-t-lg flex items-end justify-center pb-2">
                      <span className="text-3xl font-bold text-yellow-800">1</span>
                    </div>
                    <p className="text-lg font-bold text-gray-900 mt-2 truncate max-w-[100px]">
                      {users[0].username}
                    </p>
                    <p className="text-sm text-yellow-600 font-semibold">{users[0].rankPoints} pts</p>
                  </div>

                  {/* 3rd Place */}
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-600 to-orange-600 flex items-center justify-center text-2xl mb-2 shadow-lg">
                      🥉
                    </div>
                    <div className="w-20 h-16 bg-amber-200 rounded-t-lg flex items-end justify-center pb-2">
                      <span className="text-2xl font-bold text-amber-800">3</span>
                    </div>
                    <p className="text-sm font-semibold text-gray-900 mt-2 truncate max-w-[80px]">
                      {users[2].username}
                    </p>
                    <p className="text-xs text-gray-500">{users[2].rankPoints} pts</p>
                  </div>
                </div>
              </div>
            )}

            {/* Full List */}
            <div className="space-y-3">
              {users.map((user, index) => {
                const actualRank = (page - 1) * 10 + index + 1;
                const avatarColor = generateAvatarColor(user.username);
                
                return (
                  <Card 
                    key={user.id} 
                    className={`ios-card border-0 ${getRankBgColor(actualRank - 1)}`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        {/* Rank */}
                        <div className="w-10 flex justify-center">
                          {getPositionIcon(actualRank - 1)}
                        </div>

                        {/* Avatar */}
                        <div 
                          className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold"
                          style={{ backgroundColor: avatarColor }}
                        >
                          {getInitials(user.username)}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-gray-900 truncate">{user.username}</p>
                            <span 
                              className="px-2 py-0.5 rounded-full text-xs font-medium text-white"
                              style={{ backgroundColor: getRankColor(user.rank) }}
                            >
                              {user.rank}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-sm text-gray-500">
                            <span>{user.matchesPlayed} matches</span>
                            <span>•</span>
                            <span>{user.matchesWon} wins</span>
                            {user.wordMasterCount > 0 && (
                              <>
                                <span>•</span>
                                <span className="flex items-center gap-1 text-yellow-600">
                                  <Crown className="w-3 h-3" />
                                  {user.wordMasterCount}
                                </span>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Points */}
                        <div className="text-right">
                          <p className="text-xl font-bold text-gray-900">{user.rankPoints}</p>
                          <p className="text-xs text-gray-500">points</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-4 mt-8">
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-xl"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  <ChevronLeft className="w-5 h-5" />
                </Button>
                
                <span className="text-sm text-gray-600">
                  Page {page} of {totalPages}
                </span>
                
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-xl"
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  <ChevronRight className="w-5 h-5" />
                </Button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default LeaderboardPage;
