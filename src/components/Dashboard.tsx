import React, { useState, useEffect } from 'react';
import { Plus, Heart, Calendar, Star, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useCurrentUser } from '@/App';

interface DashboardStats {
  totalMemories: number;
  favoriteMemories: number;
  bucketListItems: number;
  completedBucketItems: number;
}

interface RecentMemory {
  id: string;
  title: string;
  memory_type: string;
  mood_rating: number;
  created_at: string;
  is_favorite: boolean;
}

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalMemories: 0,
    favoriteMemories: 0,
    bucketListItems: 0,
    completedBucketItems: 0
  });
  const [recentMemories, setRecentMemories] = useState<RecentMemory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const currentUser = useCurrentUser();

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!currentUser) return;

      try {
        // Fetch memory stats
        const { data: memories, error: memoriesError } = await supabase
          .from('memories')
          .select('id, is_favorite');

        if (memoriesError) throw memoriesError;

        // Fetch bucket list stats
        const { data: bucketList, error: bucketError } = await supabase
          .from('bucket_list')
          .select('id, is_completed');

        if (bucketError) throw bucketError;

        // Fetch recent memories
        const { data: recent, error: recentError } = await supabase
          .from('memories')
          .select('id, title, memory_type, mood_rating, created_at, is_favorite')
          .order('created_at', { ascending: false })
          .limit(6);

        if (recentError) throw recentError;

        setStats({
          totalMemories: memories?.length || 0,
          favoriteMemories: memories?.filter(m => m.is_favorite).length || 0,
          bucketListItems: bucketList?.length || 0,
          completedBucketItems: bucketList?.filter(item => item.is_completed).length || 0
        });

        setRecentMemories(recent || []);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        toast({
          title: "Error loading dashboard",
          description: "Unable to load your memory statistics",
          variant: "destructive"
        });
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [currentUser, toast]);

  const getMoodEmoji = (rating: number) => {
    if (rating >= 9) return '🥰';
    if (rating >= 7) return '😊';
    if (rating >= 5) return '😌';
    if (rating >= 3) return '😔';
    return '😢';
  };

  const getMemoryTypeIcon = (type: string) => {
    switch (type) {
      case 'image': return '📷';
      case 'video': return '🎬';
      case 'audio': return '🎵';
      case 'file': return '📄';
      default: return '✍️';
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 space-y-6">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-accent-lavender border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="mt-2 text-text-secondary">Loading your memory galaxy...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 max-w-6xl mx-auto">
      {/* Welcome Header */}
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-primary text-text-primary">
          Welcome to Your Memory Galaxy, {currentUser?.displayName}! ✨
        </h1>
        <p className="text-text-secondary text-lg">
          Your constellation of shared moments and dreams
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="memory-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-text-secondary">Total Memories</CardTitle>
            <Heart className="h-4 w-4 text-accent-blush" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-text-primary">{stats.totalMemories}</div>
            <p className="text-xs text-text-muted">Precious moments captured</p>
          </CardContent>
        </Card>

        <Card className="memory-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-text-secondary">Favorites</CardTitle>
            <Star className="h-4 w-4 text-accent-gold" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-text-primary">{stats.favoriteMemories}</div>
            <p className="text-xs text-text-muted">Starred memories</p>
          </CardContent>
        </Card>

        <Card className="memory-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-text-secondary">Dream List</CardTitle>
            <Calendar className="h-4 w-4 text-accent-cosmic" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-text-primary">{stats.bucketListItems}</div>
            <p className="text-xs text-text-muted">Dreams to fulfill</p>
          </CardContent>
        </Card>

        <Card className="memory-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-text-secondary">Completed</CardTitle>
            <TrendingUp className="h-4 w-4 text-accent-lavender" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-text-primary">{stats.completedBucketItems}</div>
            <p className="text-xs text-text-muted">Dreams fulfilled</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Memories */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-primary text-text-primary">Recent Memories</h2>
          <Button className="btn-romantic">
            <Plus className="w-4 h-4 mr-2" />
            Create Memory
          </Button>
        </div>

        {recentMemories.length === 0 ? (
          <Card className="memory-card text-center py-12">
            <CardContent>
              <Heart className="w-16 h-16 text-accent-blush mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium text-text-primary mb-2">No memories yet</h3>
              <p className="text-text-muted mb-4">Start capturing your beautiful moments together</p>
              <Button className="btn-romantic">
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Memory
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentMemories.map((memory) => (
              <Card key={memory.id} className="memory-card cursor-pointer">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-medium text-text-primary truncate">
                      {memory.title}
                    </CardTitle>
                    {memory.is_favorite && (
                      <Star className="w-5 h-5 text-accent-gold fill-current" />
                    )}
                  </div>
                  <CardDescription className="text-text-secondary">
                    {new Date(memory.created_at).toLocaleDateString()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{getMemoryTypeIcon(memory.memory_type)}</span>
                      <Badge variant="secondary" className="text-xs">
                        {memory.memory_type}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-1">
                      <span className="text-lg">{getMoodEmoji(memory.mood_rating)}</span>
                      <span className="text-sm text-text-muted">{memory.mood_rating}/10</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="memory-card cursor-pointer hover:scale-105 transition-transform">
          <CardHeader>
            <CardTitle className="text-text-primary">💌 Send Love Letter</CardTitle>
            <CardDescription className="text-text-secondary">
              Share your feelings in a romantic message
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="memory-card cursor-pointer hover:scale-105 transition-transform">
          <CardHeader>
            <CardTitle className="text-text-primary">🎯 Add Dream</CardTitle>
            <CardDescription className="text-text-secondary">
              Add a new item to your bucket list
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="memory-card cursor-pointer hover:scale-105 transition-transform">
          <CardHeader>
            <CardTitle className="text-text-primary">⏰ Set Countdown</CardTitle>
            <CardDescription className="text-text-secondary">
              Count down to your next special moment
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;