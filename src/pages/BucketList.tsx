import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, CheckCircle2, Circle, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getCurrentUser } from '@/utils/auth';

interface BucketListItem {
  id: string;
  title: string;
  description: string | null;
  is_completed: boolean;
  completed_by: string | null;
  completed_date: string | null;
  completion_story: string | null;
  created_at: string;
}

const BucketList = () => {
  const [items, setItems] = useState<BucketListItem[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [selectedItem, setSelectedItem] = useState<BucketListItem | null>(null);
  const [completionStory, setCompletionStory] = useState('');
  const [newItem, setNewItem] = useState({
    title: '',
    description: ''
  });
  const { toast } = useToast();
  const user = getCurrentUser();

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    const { data, error } = await supabase
      .from('bucket_list')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast({ title: 'Error loading bucket list', variant: 'destructive' });
    } else {
      setItems(data || []);
    }
  };

  const addItem = async () => {
    const { error } = await supabase.from('bucket_list').insert({
      title: newItem.title,
      description: newItem.description
    });

    if (error) {
      toast({ title: 'Error adding item', variant: 'destructive' });
    } else {
      toast({ title: 'Dream added to your galaxy!' });
      setIsAdding(false);
      setNewItem({ title: '', description: '' });
      loadItems();
    }
  };

  const toggleComplete = async (item: BucketListItem) => {
    if (!item.is_completed) {
      setSelectedItem(item);
    } else {
      const { error } = await supabase
        .from('bucket_list')
        .update({
          is_completed: false,
          completed_by: null,
          completed_date: null,
          completion_story: null
        })
        .eq('id', item.id);

      if (!error) {
        loadItems();
      }
    }
  };

  const markComplete = async () => {
    if (!selectedItem || !user) return;

    const { error } = await supabase
      .from('bucket_list')
      .update({
        is_completed: true,
        completed_by: user.id,
        completed_date: new Date().toISOString(),
        completion_story: completionStory
      })
      .eq('id', selectedItem.id);

    if (error) {
      toast({ title: 'Error marking complete', variant: 'destructive' });
    } else {
      toast({ title: '✨ Dream achieved!' });
      setSelectedItem(null);
      setCompletionStory('');
      loadItems();
    }
  };

  const completedCount = items.filter(i => i.is_completed).length;
  const totalCount = items.length;

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-primary text-text-primary mb-2">Dreams & Bucket List</h1>
          <p className="text-text-secondary">
            Adventures across the cosmos • {completedCount} of {totalCount} completed
          </p>
        </div>
        <Button onClick={() => setIsAdding(!isAdding)} className="gap-2">
          <Plus className="w-4 h-4" />
          Add Dream
        </Button>
      </div>

      {isAdding && (
        <Card className="mb-8 border-accent-purple/30 bg-card-glass backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-accent-purple" />
              Add New Dream
            </CardTitle>
            <CardDescription>What adventure do you want to embark on?</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="Dream title..."
              value={newItem.title}
              onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
            />
            <Textarea
              placeholder="Describe this dream..."
              value={newItem.description}
              onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
              rows={4}
            />
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setIsAdding(false)}>Cancel</Button>
              <Button onClick={addItem}>Add to List</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {selectedItem && (
        <Card className="mb-8 border-accent-purple/30 bg-card-glass backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Mark as Complete</CardTitle>
            <CardDescription>Share the story of achieving this dream</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="Tell the story of how you achieved this dream..."
              value={completionStory}
              onChange={(e) => setCompletionStory(e.target.value)}
              rows={4}
            />
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setSelectedItem(null)}>Cancel</Button>
              <Button onClick={markComplete}>Complete</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {items.map((item) => (
          <Card
            key={item.id}
            className={`border-accent-purple/20 bg-card-glass backdrop-blur-sm hover:border-accent-purple/40 transition-all ${
              item.is_completed ? 'opacity-75' : ''
            }`}
          >
            <CardHeader>
              <div className="flex items-start gap-4">
                <button
                  onClick={() => toggleComplete(item)}
                  className="mt-1 transition-transform hover:scale-110"
                >
                  {item.is_completed ? (
                    <CheckCircle2 className="w-6 h-6 text-accent-purple" />
                  ) : (
                    <Circle className="w-6 h-6 text-text-secondary" />
                  )}
                </button>
                <div className="flex-1">
                  <CardTitle className={item.is_completed ? 'line-through' : ''}>
                    {item.title}
                  </CardTitle>
                  {item.description && (
                    <CardDescription className="mt-2">{item.description}</CardDescription>
                  )}
                  {item.is_completed && item.completion_story && (
                    <div className="mt-4 p-4 rounded-md bg-accent-purple/10 border border-accent-purple/20">
                      <p className="text-sm font-semibold text-accent-purple mb-2">Achievement Story:</p>
                      <p className="text-sm text-text-secondary">{item.completion_story}</p>
                      {item.completed_date && (
                        <p className="text-xs text-text-tertiary mt-2">
                          Completed on {new Date(item.completed_date).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  )}
                </div>
                {item.is_completed && (
                  <Badge variant="secondary" className="bg-accent-purple/20 text-accent-purple">
                    Achieved
                  </Badge>
                )}
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>

      {items.length === 0 && !isAdding && (
        <div className="text-center py-16">
          <div className="w-24 h-24 rounded-full bg-accent-purple/10 flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-12 h-12 text-accent-purple" />
          </div>
          <h3 className="text-xl font-primary text-text-primary mb-2">No dreams yet</h3>
          <p className="text-text-secondary">Start building your cosmic bucket list</p>
        </div>
      )}
    </div>
  );
};

export default BucketList;
