import { useState, useEffect, useRef } from 'react';
import { Search, Upload, Download, Calendar, ArrowLeftRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCurrentUser } from '@/App';

interface ChatMessage {
  id: string;
  datetime: string;
  sender: string;
  content: string;
  is_system: boolean;
}

const MESSAGES_PER_PAGE = 100;

const ChatArchive = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [displayedMessages, setDisplayedMessages] = useState<ChatMessage[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');
  const [page, setPage] = useState(1);
  const [isSwapped, setIsSwapped] = useState(() => {
    return localStorage.getItem('chat-swap') === 'true';
  });
  const [isLoading, setIsLoading] = useState(true);
  const [cacheLoaded, setCacheLoaded] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const currentUser = useCurrentUser();

  useEffect(() => {
    loadMessages();
  }, []);

  // Removed pagination logic - now loading all messages at once

  // Removed infinite scroll logic - now loading all messages at once

  useEffect(() => {
    // Scroll to bottom when first loaded (like WhatsApp - newest at bottom)
    if (chatContainerRef.current && displayedMessages.length > 0) {
      setTimeout(() => {
        if (chatContainerRef.current) {
          chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
      }, 100);
    }
  }, [displayedMessages.length]);

  const loadMessages = async () => {
    try {
      setIsLoading(true);
      
      // Check cache first
      const cacheKey = 'chat_messages_cache';
      const cacheTimestamp = 'chat_messages_timestamp';
      const cacheExpiry = 5 * 60 * 1000; // 5 minutes
      
      const cachedData = localStorage.getItem(cacheKey);
      const cachedTime = localStorage.getItem(cacheTimestamp);
      
      // Use cache if it exists and is not expired
      if (cachedData && cachedTime) {
        const timeDiff = Date.now() - parseInt(cachedTime);
        if (timeDiff < cacheExpiry) {
          console.log('Loading messages from cache');
          const data = JSON.parse(cachedData);
          setMessages(data);
          setDisplayedMessages(data.reverse()); // Show all messages, newest at bottom
          setCacheLoaded(true);
          setIsLoading(false);
          return;
        }
      }
      
      console.log('Loading messages from database');
      const { supabase } = await import('@/integrations/supabase/client');
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .order('datetime', { ascending: false }); // Sort by datetime descending (newest first)

      if (error) {
        console.error('Error loading messages:', error);
        setIsLoading(false);
        return;
      }

      if (data) {
        // Cache the data
        localStorage.setItem(cacheKey, JSON.stringify(data));
        localStorage.setItem(cacheTimestamp, Date.now().toString());
        
        setMessages(data as ChatMessage[]);
        setDisplayedMessages(data.reverse()); // Show all messages, newest at bottom
        setCacheLoaded(true);
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Failed to load messages:', error);
      setIsLoading(false);
    }
  };

  const toggleSwap = () => {
    const newSwapState = !isSwapped;
    setIsSwapped(newSwapState);
    localStorage.setItem('chat-swap', String(newSwapState));
  };

  const parseWhatsAppChat = (text: string) => {
    const lines = text.split('\n');
    const messages: any[] = [];
    
    // Regex to match WhatsApp message format: DD/MM/YY, H:MM am/pm - Sender: Message
    const messageRegex = /^(\d{1,2}\/\d{1,2}\/\d{2,4}),\s*(\d{1,2}:\d{2})(?:\s*(am|pm|AM|PM))?\s*-\s*(.*)$/;
    
    let currentMessage: any = null;
    
    for (const line of lines) {
      const match = line.match(messageRegex);
      
      if (match) {
        // Save previous message if exists
        if (currentMessage) {
          messages.push(currentMessage);
        }
        
        const [, date, time, meridian, remainder] = match;
        
        // Parse datetime
        const [day, month, year] = date.split('/').map(Number);
        const fullYear = year < 100 ? 2000 + year : year;
        const [hour, minute] = time.split(':').map(Number);
        
        // Adjust for AM/PM
        let adjustedHour = hour;
        if (meridian) {
          const isPM = meridian.toLowerCase() === 'pm';
          if (isPM && hour !== 12) adjustedHour += 12;
          if (!isPM && hour === 12) adjustedHour = 0;
        }
        
        const datetime = new Date(fullYear, month - 1, day, adjustedHour, minute);
        
        // Extract sender and content
        const colonIndex = remainder.indexOf(':');
        let sender = 'System';
        let content = remainder;
        let isSystem = true;
        
        if (colonIndex > 0 && colonIndex < 100) {
          const potentialSender = remainder.substring(0, colonIndex).trim();
          if (potentialSender && !potentialSender.match(/^[\s\p{P}]+$/u)) {
            sender = potentialSender;
            content = remainder.substring(colonIndex + 1).trim();
            isSystem = false;
          }
        }
        
        currentMessage = {
          datetime: datetime.toISOString(),
          sender,
          content,
          is_system: isSystem,
          raw_line: line,
        };
      } else if (currentMessage && line.trim()) {
        // Multi-line continuation
        currentMessage.content += '\n' + line;
        currentMessage.raw_line += '\n' + line;
      } else if (!currentMessage && line.trim()) {
        // First line without proper format
        messages.push({
          datetime: new Date().toISOString(),
          sender: 'System',
          content: line,
          is_system: true,
          raw_line: line,
        });
      }
    }
    
    // Push last message
    if (currentMessage) {
      messages.push(currentMessage);
    }
    
    return messages;
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadStatus('Uploading and parsing...');

    try {
      const text = await file.text();
      const messages = parseWhatsAppChat(text);
      
      if (messages.length === 0) {
        throw new Error('No valid messages found in the file. Please check the format.');
      }

      const { supabase } = await import('@/integrations/supabase/client');
      
      // Batch insert messages to avoid timeout (1000 at a time)
      const BATCH_SIZE = 1000;
      let totalInserted = 0;

      for (let i = 0; i < messages.length; i += BATCH_SIZE) {
        const batch = messages.slice(i, i + BATCH_SIZE);
        
        const { error } = await supabase
          .from('chat_messages')
          .insert(batch);

        if (error) {
          console.error('Database error on batch:', error);
          throw new Error(`Failed to save messages: ${error.message}`);
        }

        totalInserted += batch.length;
      }

      setUploadStatus(`Successfully imported ${totalInserted} messages!`);
      
      // Clear cache when new messages are added
      localStorage.removeItem('chat_messages_cache');
      localStorage.removeItem('chat_messages_timestamp');
      
      await loadMessages();
      
      setTimeout(() => setUploadStatus(''), 3000);
    } catch (error) {
      console.error('Upload error:', error);
      setUploadStatus(`Error uploading file: ${error instanceof Error ? error.message : 'Please try again.'}`);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const filteredMessages = searchQuery 
    ? messages.filter(msg =>
        msg.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        msg.sender.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : displayedMessages;

  const isMyMessage = (sender: string) => {
    if (!currentUser) {
      console.log('No current user found');
      return false;
    }
    
    console.log('Checking message from:', sender, 'for user:', currentUser.username);
    
    // User-specific logic:
    if (currentUser.username === 'sarru') {
      // For Sarru: "Sharvesh S" messages on the right
      const isSharvesh = sender.includes('Sharvesh S');
      console.log('Sarru user - isSharvesh:', isSharvesh);
      return isSharvesh;
    } else if (currentUser.username === 'hiba') {
      // For Hiba: "Hiba 🖤🤍" messages on the right
      const isHiba = sender.includes('Hiba 🖤🤍');
      console.log('Hiba user - isHiba:', isHiba);
      return isHiba;
    }
    
    // Fallback: check if sender matches current user
    const isMe = sender.toLowerCase().includes(currentUser.username.toLowerCase()) ||
                 sender.toLowerCase().includes(currentUser.displayName?.toLowerCase() || '');
    
    console.log('Fallback - isMe result:', isMe);
    return isMe;
  };

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-4xl font-primary font-bold text-text-primary mb-2">
            Chat Archive
          </h1>
          <p className="text-text-secondary">
            Import and browse WhatsApp chat history
          </p>
        </div>

        {/* Upload Section */}
        <Card className="memory-card mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-text-primary mb-1">
                    Import WhatsApp Chat
                  </h3>
                  <p className="text-sm text-text-secondary">
                    Upload a WhatsApp chat export (.txt file)
                  </p>
                </div>
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="btn-cosmic"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {isUploading ? 'Uploading...' : 'Upload Chat'}
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".txt"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>
              {uploadStatus && (
                <p className={`text-sm ${uploadStatus.includes('Error') ? 'text-red-400' : 'text-green-400'}`}>
                  {uploadStatus}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Search and Controls */}
        <Card className="memory-card mb-6">
          <CardContent className="pt-6">
            <div className="flex gap-3 items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted w-5 h-5" />
                <Input
                  type="text"
                  placeholder="Search messages by text or date..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-surface-glass border-border text-text-primary"
                />
              </div>
              <Button
                onClick={toggleSwap}
                variant="outline"
                size="icon"
                className="shrink-0"
                title="Swap sent/received sides"
              >
                <ArrowLeftRight className="w-5 h-5" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Chat Display */}
        <Card className="memory-card">
          <CardContent className="p-0">
            <div
              ref={chatContainerRef}
              className="h-[600px] overflow-y-auto p-4 space-y-2"
            >
              {isLoading && (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-accent-lavender"></div>
                  <p className="text-text-muted text-sm mt-2">
                    {cacheLoaded ? 'Loading from cache...' : 'Loading messages...'}
                  </p>
                </div>
              )}
              {filteredMessages.length === 0 ? (
                <div className="text-center py-12">
                  <Calendar className="w-16 h-16 text-text-muted mx-auto mb-4 opacity-50" />
                  <p className="text-text-muted">
                    {messages.length === 0 
                      ? "No messages yet. Upload a WhatsApp chat export to get started."
                      : "No messages match your search."}
                  </p>
                </div>
              ) : (
                filteredMessages.map((message) => {
                  const isMyMsg = isMyMessage(message.sender);
                  
                  return (
                    <div
                      key={message.id}
                      className={`flex mb-3 ${
                        message.is_system
                          ? 'justify-center'
                          : isMyMsg
                          ? 'justify-end'
                          : 'justify-start'
                      }`}
                    >
                      {message.is_system ? (
                        <div className="bg-gray-100 px-4 py-2 rounded-full max-w-md">
                          <p className="text-xs text-gray-600 text-center">
                            {message.content}
                          </p>
                        </div>
                      ) : (
                        <div
                          className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl shadow-sm ${
                            isMyMsg
                              ? 'bg-blue-500 text-white rounded-br-sm'
                              : 'bg-white text-gray-800 rounded-bl-sm border border-gray-200'
                          }`}
                        >
                          <p className="text-xs font-semibold mb-1 opacity-70">
                            {message.sender}
                          </p>
                          <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                          <p className={`text-xs mt-1 ${
                            isMyMsg ? 'text-blue-100' : 'text-gray-500'
                          }`}>
                            {new Date(message.datetime).toLocaleString([], { 
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>

        {/* Export */}
        {messages.length > 0 && (
          <Card className="memory-card mt-6">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-text-primary mb-1">
                    Export Chat History
                  </h3>
                  <p className="text-sm text-text-secondary">
                    Download your chat archive ({messages.length} messages)
                  </p>
                </div>
                <Button className="btn-cosmic">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ChatArchive;
