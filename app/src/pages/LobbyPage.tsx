import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { roomAPI } from '@/services/api';
import type { Room } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Plus,
  Search,
  Users,
  Lock,
  Gamepad2,
  Trophy,
  RefreshCw,
  ChevronRight,
  Loader2
} from 'lucide-react';

const LobbyPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const mode = searchParams.get('mode') || 'casual';
  const isRanked = mode === 'ranked';
  
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isJoining, setIsJoining] = useState<string | null>(null);
  
  // Create room form state
  const [createForm, setCreateForm] = useState({
    name: '',
    maxPlayers: 2,
    password: '',
    lives: 5,
    timeout: 15
  });

  const fetchRooms = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await roomAPI.getRooms(1, 20, mode as 'casual' | 'ranked');
      if (response.success && response.data) {
        setRooms(response.data.rooms);
      }
    } catch (error) {
      console.error('Failed to fetch rooms:', error);
      toast.error('Failed to load rooms');
    } finally {
      setIsLoading(false);
    }
  }, [mode]);

  useEffect(() => {
    fetchRooms();
    
    // Auto refresh every 10 seconds
    const interval = setInterval(fetchRooms, 10000);
    return () => clearInterval(interval);
  }, [fetchRooms]);

  const handleCreateRoom = async () => {
    if (!createForm.name.trim()) {
      toast.error('Please enter a room name');
      return;
    }

    try {
      const response = await roomAPI.createRoom({
        name: createForm.name,
        maxPlayers: createForm.maxPlayers,
        password: createForm.password || undefined,
        lives: createForm.lives,
        timeout: createForm.timeout,
        gameMode: isRanked ? 'ranked' : 'casual'
      });

      if (response.success && response.data) {
        toast.success('Room created successfully!');
        navigate(`/room/${response.data.room.roomId}`);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create room');
    }
  };

  const handleJoinRoom = async (room: Room) => {
    if (isJoining) return;
    
    setIsJoining(room.roomId);
    
    try {
      const response = await roomAPI.joinRoom(room.roomId);
      
      if (response.success) {
        toast.success('Joined room!');
        navigate(`/room/${room.roomId}`);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to join room');
    } finally {
      setIsJoining(null);
    }
  };

  const filteredRooms = rooms.filter(room => 
    room.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    room.roomId.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
              <h1 className="font-bold text-lg text-gray-900">
                {isRanked ? 'Ranked Matches' : 'Have Fun Rooms'}
              </h1>
              <p className="text-xs text-gray-500">
                {isRanked ? 'Compete for rank points' : 'Play casually with friends'}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-xl"
              onClick={fetchRooms}
              disabled={isLoading}
            >
              <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        {/* Search and Create */}
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              placeholder="Search rooms..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="ios-input pl-10"
            />
          </div>
          <Button
            className="ios-button-primary px-4"
            onClick={() => setIsCreateDialogOpen(true)}
          >
            <Plus className="w-5 h-5" />
            <span className="hidden sm:inline ml-2">Create</span>
          </Button>
        </div>

        {/* Rooms List */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500 mb-4" />
            <p className="text-gray-500">Loading rooms...</p>
          </div>
        ) : filteredRooms.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
              <Gamepad2 className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No rooms found</h3>
            <p className="text-gray-500 mb-4">
              {searchQuery ? 'Try a different search term' : 'Be the first to create a room!'}
            </p>
            {!searchQuery && (
              <Button
                className="ios-button-primary"
                onClick={() => setIsCreateDialogOpen(true)}
              >
                <Plus className="w-5 h-5 mr-2" />
                Create Room
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredRooms.map((room) => (
              <Card 
                key={room.roomId} 
                className="ios-card border-0 hover:shadow-lg transition-shadow"
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    {/* Room Icon */}
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      room.gameMode === 'ranked' 
                        ? 'bg-gradient-to-br from-orange-500 to-red-600' 
                        : 'bg-gradient-to-br from-green-500 to-emerald-600'
                    }`}>
                      {room.gameMode === 'ranked' ? (
                        <Trophy className="w-6 h-6 text-white" />
                      ) : (
                        <Gamepad2 className="w-6 h-6 text-white" />
                      )}
                    </div>

                    {/* Room Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900 truncate">{room.name}</h3>
                        {room.isPrivate && <Lock className="w-4 h-4 text-gray-400" />}
                      </div>
                      <div className="flex items-center gap-3 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {room.players.length}/{room.maxPlayers}
                        </span>
                        <span>•</span>
                        <span>ID: {room.roomId}</span>
                      </div>
                    </div>

                    {/* Join Button */}
                    <Button
                      className="ios-button-primary px-4"
                      onClick={() => handleJoinRoom(room)}
                      disabled={isJoining === room.roomId || room.players.length >= room.maxPlayers}
                    >
                      {isJoining === room.roomId ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : room.players.length >= room.maxPlayers ? (
                        'Full'
                      ) : (
                        <>
                          <span className="hidden sm:inline">Join</span>
                          <ChevronRight className="w-5 h-5 sm:ml-1" />
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* Create Room Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Room</DialogTitle>
            <DialogDescription>
              Set up your room and invite friends to play!
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-4">
            {/* Room Name */}
            <div className="space-y-2">
              <Label>Room Name</Label>
              <Input
                placeholder="Enter room name"
                value={createForm.name}
                onChange={(e) => setCreateForm(prev => ({ ...prev, name: e.target.value }))}
                className="ios-input"
                maxLength={30}
              />
            </div>

            {/* Max Players */}
            <div className="space-y-2">
              <Label>Max Players: {createForm.maxPlayers}</Label>
              <Slider
                value={[createForm.maxPlayers]}
                onValueChange={([value]) => setCreateForm(prev => ({ ...prev, maxPlayers: value }))}
                min={2}
                max={4}
                step={1}
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>2</span>
                <span>3</span>
                <span>4</span>
              </div>
            </div>

            {/* Lives */}
            <div className="space-y-2">
              <Label>Lives: {createForm.lives}</Label>
              <Slider
                value={[createForm.lives]}
                onValueChange={([value]) => setCreateForm(prev => ({ ...prev, lives: value }))}
                min={1}
                max={10}
                step={1}
              />
            </div>

            {/* Timeout */}
            <div className="space-y-2">
              <Label>Timeout: {createForm.timeout} seconds</Label>
              <Slider
                value={[createForm.timeout]}
                onValueChange={([value]) => setCreateForm(prev => ({ ...prev, timeout: value }))}
                min={5}
                max={60}
                step={5}
              />
            </div>

            {/* Password (Optional) */}
            <div className="space-y-2">
              <Label>Password (Optional)</Label>
              <Input
                type="password"
                placeholder="Leave empty for public room"
                value={createForm.password}
                onChange={(e) => setCreateForm(prev => ({ ...prev, password: e.target.value }))}
                className="ios-input"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setIsCreateDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 ios-button-primary"
                onClick={handleCreateRoom}
                disabled={!createForm.name.trim()}
              >
                Create Room
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LobbyPage;
