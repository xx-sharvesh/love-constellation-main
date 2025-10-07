import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Mail, Calendar, Edit, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useCurrentUser } from '@/App';

interface Profile {
  id: string;
  user_id: string;
  username: string;
  display_name: string | null;
  nickname: string | null;
  description: string | null;
  profile_photo_url: string | null;
  is_admin: boolean;
  created_at: string;
}

const Profile = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState({
    display_name: '',
    nickname: '',
    description: ''
  });
  const [stats, setStats] = useState({
    memories: 0,
    loveLetters: 0,
    completedDreams: 0
  });
  const { toast } = useToast();
  const user = useCurrentUser();

  useEffect(() => {
    loadProfile();
    loadStats();
  }, []);

  const loadProfile = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error) {
      toast({ title: 'Error loading profile', variant: 'destructive' });
    } else if (data) {
      setProfile(data);
      setEditedProfile({
        display_name: data.display_name || '',
        nickname: data.nickname || '',
        description: data.description || ''
      });
    }
  };

  const loadStats = async () => {
    if (!user) return;

    try {
      // Fetch memories count
      const { data: memories, error: memoriesError } = await supabase
        .from('memories')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id);

      // Fetch love letters count (sent + received)
      const { data: letters, error: lettersError } = await supabase
        .from('love_letters')
        .select('id', { count: 'exact', head: true });

      // Fetch completed bucket list items
      const { data: completed, error: completedError } = await supabase
        .from('bucket_list')
        .select('id')
        .eq('is_completed', true);

      if (!memoriesError && !lettersError && !completedError) {
        setStats({
          memories: memories?.length || 0,
          loveLetters: letters?.length || 0,
          completedDreams: completed?.length || 0
        });
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const saveProfile = async () => {
    if (!user || !profile) return;

    const { error } = await supabase
      .from('profiles')
      .update({
        display_name: editedProfile.display_name,
        nickname: editedProfile.nickname,
        description: editedProfile.description,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id);

    if (error) {
      toast({ title: 'Error updating profile', variant: 'destructive' });
    } else {
      toast({ title: 'Profile updated!' });
      setIsEditing(false);
      loadProfile();
    }
  };

  if (!profile) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-accent-lavender border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-text-secondary">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-4xl font-primary text-text-primary mb-8">Cosmic Profile</h1>

      <Card className="border-accent-lavender/30 bg-card-glass backdrop-blur-sm mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="w-20 h-20 border-2 border-accent-lavender">
                <AvatarImage src={profile.profile_photo_url || ''} />
                <AvatarFallback className="bg-accent-lavender/20 text-accent-lavender text-2xl">
                  {profile.username[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-2xl mb-1">
                  {profile.display_name || profile.username}
                </CardTitle>
                <CardDescription>@{profile.username}</CardDescription>
                {profile.nickname && (
                  <p className="text-sm text-accent-lavender mt-1">"{profile.nickname}"</p>
                )}
              </div>
            </div>
            <Button
              onClick={() => isEditing ? saveProfile() : setIsEditing(true)}
              variant={isEditing ? 'default' : 'outline'}
              className="gap-2"
            >
              {isEditing ? (
                <>
                  <Save className="w-4 h-4" />
                  Save
                </>
              ) : (
                <>
                  <Edit className="w-4 h-4" />
                  Edit
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {isEditing ? (
            <>
              <div>
                <label className="text-sm text-text-secondary mb-2 block">Display Name</label>
                <Input
                  placeholder="Your display name"
                  value={editedProfile.display_name}
                  onChange={(e) => setEditedProfile({ ...editedProfile, display_name: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm text-text-secondary mb-2 block">Nickname</label>
                <Input
                  placeholder="Your cosmic nickname"
                  value={editedProfile.nickname}
                  onChange={(e) => setEditedProfile({ ...editedProfile, nickname: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm text-text-secondary mb-2 block">Bio</label>
                <Textarea
                  placeholder="Tell us about yourself..."
                  value={editedProfile.description}
                  onChange={(e) => setEditedProfile({ ...editedProfile, description: e.target.value })}
                  rows={4}
                />
              </div>
            </>
          ) : (
            <>
              {profile.description && (
                <div>
                  <p className="text-sm text-text-secondary mb-2">Bio</p>
                  <p className="text-text-primary">{profile.description}</p>
                </div>
              )}
            </>
          )}

          <div className="pt-4 border-t border-border">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2 text-sm">
                <User className="w-4 h-4 text-accent-lavender" />
                <span className="text-text-secondary">Username:</span>
                <span className="text-text-primary">{profile.username}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-accent-lavender" />
                <span className="text-text-secondary">Joined:</span>
                <span className="text-text-primary">
                  {new Date(profile.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="border-accent-lavender/20 bg-card-glass backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg">Memories</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-accent-lavender">{stats.memories}</p>
            <p className="text-sm text-text-secondary">Created</p>
          </CardContent>
        </Card>

        <Card className="border-accent-rose/20 bg-card-glass backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg">Love Letters</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-accent-rose">{stats.loveLetters}</p>
            <p className="text-sm text-text-secondary">Exchanged</p>
          </CardContent>
        </Card>

        <Card className="border-accent-purple/20 bg-card-glass backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg">Dreams</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-accent-purple">{stats.completedDreams}</p>
            <p className="text-sm text-text-secondary">Achieved</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
