import React, { useState, useEffect } from 'react';
import { Mail, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useCurrentUser } from '@/App';

const FloatingMail: React.FC = () => {
  const [unreadCount, setUnreadCount] = useState(0);
  const { toast } = useToast();
  const currentUser = useCurrentUser();

  useEffect(() => {
    if (!currentUser) return;

    const fetchUnreadCount = async () => {
      const { data, error } = await supabase
        .from('love_letters')
        .select('id')
        .eq('recipient_id', currentUser.id)
        .eq('is_read', false);

      if (error) {
        console.error('Error fetching unread letters:', error);
        return;
      }

      setUnreadCount(data?.length || 0);
    };

    fetchUnreadCount();

    // Set up real-time subscription for new letters
    const channel = supabase
      .channel('love_letters_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'love_letters',
          filter: `recipient_id=eq.${currentUser.id}`
        },
        () => {
          fetchUnreadCount();
          toast({
            title: "💌 New Love Letter!",
            description: "You have a new message waiting for you...",
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUser, toast]);

  const handleMailClick = () => {
    toast({
      title: "Love Letters",
      description: "Opening your romantic mailbox...",
    });
    // TODO: Navigate to love letters page
  };

  return (
    <div className="floating-mail">
      <Button
        size="icon"
        className="relative w-14 h-14 rounded-full btn-romantic shadow-lg"
        onClick={handleMailClick}
        aria-label={`Love letters ${unreadCount > 0 ? `(${unreadCount} unread)` : ''}`}
      >
        <Mail className="w-6 h-6" />
        {unreadCount > 0 && (
          <Badge 
            variant="destructive" 
            className="absolute -top-2 -right-2 w-6 h-6 rounded-full p-0 flex items-center justify-center text-xs bg-accent-blush border-0"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </Badge>
        )}
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-accent-blush/20 to-accent-lavender/20 animate-pulse" />
      </Button>
    </div>
  );
};

export default FloatingMail;