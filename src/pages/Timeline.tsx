import { useState, useEffect, useRef } from 'react';
import { Calendar, Heart, CheckCircle, Mail, Sparkles, Infinity } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { ScrollArea } from '@/components/ui/scroll-area';

interface TimelineEvent {
  id: string;
  type: 'memory' | 'letter' | 'bucket';
  title: string;
  content?: string;
  date: string;
  isFavorite?: boolean;
  tags?: string[];
  mood?: number;
  isCompleted?: boolean;
}

const Timeline = () => {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(20);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadTimelineEvents();
  }, []);

  useEffect(() => {
    // Setup intersection observer for infinite scroll
    if (observerRef.current) observerRef.current.disconnect();

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleCount(prev => prev + 20);
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }

    return () => {
      if (observerRef.current) observerRef.current.disconnect();
    };
  }, []);

  const loadTimelineEvents = async () => {
    try {
      setIsLoading(true);

      // Fetch memories
      const { data: memories } = await supabase
        .from('memories')
        .select('*')
        .order('memory_date', { ascending: false });

      // Fetch love letters
      const { data: letters } = await supabase
        .from('love_letters')
        .select('*')
        .order('created_at', { ascending: false });

      // Fetch bucket list items
      const { data: bucketItems } = await supabase
        .from('bucket_list')
        .select('*')
        .order('created_at', { ascending: false });

      // Combine and sort all events
      const allEvents: TimelineEvent[] = [
        ...(memories || []).map(m => ({
          id: m.id,
          type: 'memory' as const,
          title: m.title,
          content: m.content,
          date: m.memory_date || m.created_at,
          isFavorite: m.is_favorite,
          tags: m.tags,
          mood: m.mood_rating,
        })),
        ...(letters || []).map(l => ({
          id: l.id,
          type: 'letter' as const,
          title: l.title || 'Love Letter',
          content: l.content,
          date: l.created_at,
        })),
        ...(bucketItems || []).map(b => ({
          id: b.id,
          type: 'bucket' as const,
          title: b.title,
          content: b.description,
          date: b.completed_date || b.created_at,
          isCompleted: b.is_completed,
        })),
      ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      setEvents(allEvents);
    } catch (error) {
      console.error('Error loading timeline:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const visibleEvents = events.slice(0, visibleCount);

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'memory':
        return <Sparkles className="w-5 h-5" />;
      case 'letter':
        return <Mail className="w-5 h-5" />;
      case 'bucket':
        return <CheckCircle className="w-5 h-5" />;
      default:
        return <Calendar className="w-5 h-5" />;
    }
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case 'memory':
        return 'text-accent-lavender';
      case 'letter':
        return 'text-accent-blush';
      case 'bucket':
        return 'text-accent-gold';
      default:
        return 'text-text-muted';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen p-4 sm:p-6 lg:p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-accent-lavender border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-text-secondary">Loading timeline...</p>
        </div>
      </div>
    );
  }

  const showBirthMessages = visibleCount > events.length + 10;
  const showEndingMessage = visibleCount > events.length + 30;

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-primary font-bold text-text-primary mb-2">
            Our Journey Through Time
          </h1>
          <p className="text-text-secondary">
            Every moment we've shared, every memory we've made, echoing through eternity
          </p>
        </div>

        {/* Timeline */}
        <ScrollArea className="h-[calc(100vh-200px)]">
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-accent-lavender via-accent-blush to-accent-gold opacity-50" />

            {/* Events */}
            <div className="space-y-6 pb-8">
              {visibleEvents.map((event) => (
                <div key={event.id} className="relative pl-20">
                  {/* Timeline dot */}
                  <div
                    className={`absolute left-6 w-4 h-4 rounded-full border-3 border-surface-card ${
                      event.type === 'memory'
                        ? 'bg-accent-lavender'
                        : event.type === 'letter'
                        ? 'bg-accent-blush'
                        : 'bg-accent-gold'
                    } shadow-md`}
                  />

                  {/* Event card */}
                  <Card className="memory-card hover:shadow-xl transition-all">
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-lg ${getEventColor(event.type)}`}>
                          {getEventIcon(event.type)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-lg font-semibold text-text-primary">
                              {event.title}
                            </h3>
                            {event.isFavorite && (
                              <Heart className="w-4 h-4 fill-accent-blush text-accent-blush" />
                            )}
                            {event.isCompleted && (
                              <Badge className="bg-accent-gold/20 text-accent-gold border-accent-gold/30">
                                Completed
                              </Badge>
                            )}
                          </div>
                          
                          <p className="text-sm text-text-muted flex items-center gap-2 mb-3">
                            <Calendar className="w-3 h-3" />
                            {format(new Date(event.date), 'MMMM d, yyyy')}
                          </p>

                          {event.content && (
                            <p className="text-text-secondary mb-3 line-clamp-3">
                              {event.content}
                            </p>
                          )}

                          {event.tags && event.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-2">
                              {event.tags.map((tag, i) => (
                                <Badge
                                  key={i}
                                  variant="secondary"
                                  className="bg-accent-lavender/20 text-accent-lavender border-accent-lavender/30"
                                >
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          )}

                          {event.mood && (
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-text-muted">Mood:</span>
                              <div className="flex gap-1">
                                {Array.from({ length: event.mood }).map((_, i) => (
                                  <Heart
                                    key={i}
                                    className="w-3 h-3 fill-accent-blush text-accent-blush"
                                  />
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}

              {/* Spacer before birth messages */}
              {visibleCount > events.length && (
                <div className="h-40" />
              )}

              {/* Birth messages */}
              {showBirthMessages && (
                <>
                  <div className="relative pl-20 py-8">
                    <div className="absolute left-4 w-9 h-9 rounded-full bg-gradient-to-br from-accent-lavender to-accent-blush flex items-center justify-center shadow-lg">
                      <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <Card className="memory-card bg-gradient-to-br from-surface-glass to-transparent border-accent-lavender/30">
                      <CardContent className="pt-6">
                        <p className="text-lg text-text-primary italic leading-relaxed mb-2">
                          <span className="text-accent-lavender font-semibold">August 3, 2005</span>
                        </p>
                        <p className="text-text-secondary">
                          When the universe conspired to make a miracle made up of stardust
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="relative pl-20 py-8">
                    <div className="absolute left-4 w-9 h-9 rounded-full bg-gradient-to-br from-accent-blush to-accent-lavender flex items-center justify-center shadow-lg">
                      <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <Card className="memory-card bg-gradient-to-br from-surface-glass to-transparent border-accent-blush/30">
                      <CardContent className="pt-6">
                        <p className="text-lg text-text-primary italic leading-relaxed mb-2">
                          <span className="text-accent-blush font-semibold">May 29, 2004</span>
                        </p>
                        <p className="text-text-secondary">
                          The universe made a soul that waited for something miraculous to happen
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </>
              )}

              {/* Load more trigger */}
              <div ref={loadMoreRef} className="relative pl-20 py-8">
                <div className="absolute left-6 w-4 h-4 rounded-full bg-gradient-to-br from-accent-gold to-accent-blush animate-pulse" />
                <p className="text-sm text-text-muted italic">Scrolling through time...</p>
              </div>

              {/* Poetic ending */}
              {showEndingMessage && (
                <div className="relative pl-20 py-12">
                  <div className="absolute left-4 w-9 h-9 rounded-full bg-gradient-to-br from-accent-lavender via-accent-blush to-accent-gold flex items-center justify-center shadow-lg animate-pulse">
                    <Infinity className="w-5 h-5 text-white" />
                  </div>
                  <Card className="memory-card bg-gradient-to-br from-surface-glass to-transparent border-accent-lavender/30">
                    <CardContent className="pt-6">
                      <p className="text-text-primary italic leading-relaxed">
                        You could scroll down endlessly to find your other stories in previous generations and parallel timelines...
                      </p>
                      <p className="text-accent-lavender mt-4 font-semibold">
                        But alas, this love is too pure to be written in the stars alone.
                      </p>
                      <p className="text-text-muted text-sm mt-4">
                        Some stories transcend time, existing in every moment, past and future, woven into the very fabric of the universe.
                      </p>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};

export default Timeline;
