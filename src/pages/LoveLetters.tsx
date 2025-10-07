import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Mail, Send, Heart, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getCurrentUser } from '@/utils/auth';

interface LoveLetter {
  id: string;
  sender_id: string;
  recipient_id: string;
  title: string | null;
  content: string;
  is_read: boolean;
  created_at: string;
}

const LoveLetters = () => {
  const [letters, setLetters] = useState<LoveLetter[]>([]);
  const [isWriting, setIsWriting] = useState(false);
  const [selectedLetter, setSelectedLetter] = useState<LoveLetter | null>(null);
  const [newLetter, setNewLetter] = useState({
    title: '',
    content: '',
    recipient: 'sharvesh' // Default recipient
  });
  const { toast } = useToast();
  const user = getCurrentUser();

  useEffect(() => {
    loadLetters();
  }, []);

  const loadLetters = async () => {
    const { data, error } = await supabase
      .from('love_letters')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast({ title: 'Error loading letters', variant: 'destructive' });
    } else {
      setLetters(data || []);
    }
  };

  const sendLetter = async () => {
    if (!user) return;

    // For now, using hardcoded user IDs from profiles
    const recipientId = newLetter.recipient === 'sharvesh' 
      ? '11111111-1111-1111-1111-111111111111' 
      : '22222222-2222-2222-2222-222222222222';

    const { error } = await supabase.from('love_letters').insert({
      sender_id: user.id,
      recipient_id: recipientId,
      title: newLetter.title,
      content: newLetter.content
    });

    if (error) {
      toast({ title: 'Error sending letter', variant: 'destructive' });
    } else {
      toast({ title: '💌 Letter sent!' });
      setIsWriting(false);
      setNewLetter({ title: '', content: '', recipient: 'sharvesh' });
      loadLetters();
    }
  };

  const markAsRead = async (id: string) => {
    await supabase
      .from('love_letters')
      .update({ is_read: true })
      .eq('id', id);
    loadLetters();
  };

  const openLetter = (letter: LoveLetter) => {
    setSelectedLetter(letter);
    if (!letter.is_read && letter.recipient_id === user?.id) {
      markAsRead(letter.id);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-primary text-text-primary mb-2">Love Letters</h1>
          <p className="text-text-secondary">Messages written in the stars</p>
        </div>
        <Button onClick={() => setIsWriting(!isWriting)} className="gap-2">
          <Mail className="w-4 h-4" />
          Write Letter
        </Button>
      </div>

      {isWriting && (
        <Card className="mb-8 border-accent-rose/30 bg-card-glass backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-accent-rose" />
              Compose Love Letter
            </CardTitle>
            <CardDescription>Pour your heart out across the cosmos</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm text-text-secondary mb-2 block">To</label>
              <select
                className="w-full px-3 py-2 rounded-md bg-background border border-input"
                value={newLetter.recipient}
                onChange={(e) => setNewLetter({ ...newLetter, recipient: e.target.value })}
              >
                <option value="sharvesh">Sharvesh</option>
                <option value="hiba">Hiba</option>
              </select>
            </div>
            <Input
              placeholder="Letter title..."
              value={newLetter.title}
              onChange={(e) => setNewLetter({ ...newLetter, title: e.target.value })}
            />
            <Textarea
              placeholder="Write your message..."
              value={newLetter.content}
              onChange={(e) => setNewLetter({ ...newLetter, content: e.target.value })}
              rows={8}
            />
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setIsWriting(false)}>Cancel</Button>
              <Button onClick={sendLetter} className="gap-2">
                <Send className="w-4 h-4" />
                Send Letter
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {selectedLetter ? (
        <Card className="border-accent-rose/30 bg-card-glass backdrop-blur-sm">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-2xl mb-2">{selectedLetter.title || 'Untitled Letter'}</CardTitle>
                <CardDescription className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {new Date(selectedLetter.created_at).toLocaleDateString()}
                </CardDescription>
              </div>
              <Button variant="outline" onClick={() => setSelectedLetter(null)}>
                Back to all letters
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="prose prose-invert max-w-none">
              <p className="whitespace-pre-wrap text-text-primary">{selectedLetter.content}</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {letters.map((letter) => (
            <Card
              key={letter.id}
              className="border-accent-rose/20 bg-card-glass backdrop-blur-sm hover:border-accent-rose/40 transition-all cursor-pointer"
              onClick={() => openLetter(letter)}
            >
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{letter.title || 'Untitled Letter'}</CardTitle>
                  {!letter.is_read && letter.recipient_id === user?.id && (
                    <Badge variant="secondary" className="bg-accent-rose/20 text-accent-rose">
                      New
                    </Badge>
                  )}
                </div>
                <CardDescription className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {new Date(letter.created_at).toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-text-secondary line-clamp-3">{letter.content}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {letters.length === 0 && !isWriting && (
        <div className="text-center py-16">
          <div className="w-24 h-24 rounded-full bg-accent-rose/10 flex items-center justify-center mx-auto mb-4">
            <Mail className="w-12 h-12 text-accent-rose" />
          </div>
          <h3 className="text-xl font-primary text-text-primary mb-2">No letters yet</h3>
          <p className="text-text-secondary">Start writing messages to your loved one</p>
        </div>
      )}
    </div>
  );
};

export default LoveLetters;
