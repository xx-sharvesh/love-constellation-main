import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Plus, Heart, Calendar, Tag, Image as ImageIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useCurrentUser } from '@/App';

interface Memory {
  id: string;
  title: string;
  content: string | null;
  memory_date: string | null;
  mood_rating: number | null;
  is_favorite: boolean;
  tags: string[] | null;
  media_urls: string[] | null;
  created_at: string;
}

const Memories = () => {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [newMemory, setNewMemory] = useState({
    title: '',
    content: '',
    memory_date: new Date().toISOString().split('T')[0],
    mood_rating: 5,
    tags: ''
  });
  const { toast } = useToast();
  const user = useCurrentUser();

  useEffect(() => {
    loadMemories();
  }, []);

  const loadMemories = async () => {
    const { data, error } = await supabase
      .from('memories')
      .select('*')
      .order('memory_date', { ascending: false });

    if (error) {
      toast({ title: 'Error loading memories', variant: 'destructive' });
    } else {
      setMemories(data || []);
    }
  };

  const createMemory = async () => {
    if (!user) return;

    const tags = newMemory.tags.split(',').map(t => t.trim()).filter(t => t);

    const { error } = await supabase.from('memories').insert({
      title: newMemory.title,
      content: newMemory.content,
      memory_date: newMemory.memory_date,
      mood_rating: newMemory.mood_rating,
      tags,
      user_id: user.id
    });

    if (error) {
      toast({ title: 'Error creating memory', variant: 'destructive' });
    } else {
      toast({ title: 'Memory created!' });
      setIsCreating(false);
      setNewMemory({ title: '', content: '', memory_date: new Date().toISOString().split('T')[0], mood_rating: 5, tags: '' });
      loadMemories();
    }
  };

  const toggleFavorite = async (id: string, currentFavorite: boolean) => {
    const { error } = await supabase
      .from('memories')
      .update({ is_favorite: !currentFavorite })
      .eq('id', id);

    if (!error) {
      loadMemories();
    }
  };

  const getMoodEmoji = (rating: number | null) => {
    if (!rating) return '😐';
    if (rating >= 8) return '🌟';
    if (rating >= 6) return '😊';
    if (rating >= 4) return '😐';
    return '😔';
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-primary text-text-primary mb-2">Memory Constellation</h1>
          <p className="text-text-secondary">Your shared moments across time and space</p>
        </div>
        <Button onClick={() => setIsCreating(!isCreating)} className="gap-2">
          <Plus className="w-4 h-4" />
          New Memory
        </Button>
      </div>

      {isCreating && (
        <Card className="mb-8 border-accent-lavender/30 bg-card-glass backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Create New Memory</CardTitle>
            <CardDescription>Capture a moment in your galaxy</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="Memory title..."
              value={newMemory.title}
              onChange={(e) => setNewMemory({ ...newMemory, title: e.target.value })}
            />
            <Textarea
              placeholder="Describe this moment..."
              value={newMemory.content}
              onChange={(e) => setNewMemory({ ...newMemory, content: e.target.value })}
              rows={4}
            />
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-text-secondary mb-2 block">Date</label>
                <Input
                  type="date"
                  value={newMemory.memory_date}
                  onChange={(e) => setNewMemory({ ...newMemory, memory_date: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm text-text-secondary mb-2 block">Mood (1-10)</label>
                <Input
                  type="number"
                  min="1"
                  max="10"
                  value={newMemory.mood_rating}
                  onChange={(e) => setNewMemory({ ...newMemory, mood_rating: parseInt(e.target.value) })}
                />
              </div>
            </div>
            <Input
              placeholder="Tags (comma separated)"
              value={newMemory.tags}
              onChange={(e) => setNewMemory({ ...newMemory, tags: e.target.value })}
            />
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setIsCreating(false)}>Cancel</Button>
              <Button onClick={createMemory}>Create Memory</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {memories.map((memory) => (
          <Card key={memory.id} className="border-accent-lavender/20 bg-card-glass backdrop-blur-sm hover:border-accent-lavender/40 transition-all">
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="text-xl">{memory.title}</CardTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => toggleFavorite(memory.id, memory.is_favorite)}
                >
                  <Heart className={`w-5 h-5 ${memory.is_favorite ? 'fill-accent-rose text-accent-rose' : ''}`} />
                </Button>
              </div>
              <CardDescription className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {memory.memory_date && new Date(memory.memory_date).toLocaleDateString()}
                {memory.mood_rating && (
                  <span className="ml-2">{getMoodEmoji(memory.mood_rating)}</span>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-text-secondary mb-4">{memory.content}</p>
              {memory.tags && memory.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {memory.tags.map((tag, idx) => (
                    <Badge key={idx} variant="secondary" className="gap-1">
                      <Tag className="w-3 h-3" />
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {memories.length === 0 && !isCreating && (
        <div className="text-center py-16">
          <div className="w-24 h-24 rounded-full bg-accent-lavender/10 flex items-center justify-center mx-auto mb-4">
            <ImageIcon className="w-12 h-12 text-accent-lavender" />
          </div>
          <h3 className="text-xl font-primary text-text-primary mb-2">No memories yet</h3>
          <p className="text-text-secondary">Start creating your memory constellation</p>
        </div>
      )}
    </div>
  );
};

export default Memories;
