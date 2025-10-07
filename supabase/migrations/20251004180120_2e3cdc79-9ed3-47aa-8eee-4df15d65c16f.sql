-- Create chat_messages table
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  datetime TIMESTAMP WITH TIME ZONE NOT NULL,
  sender TEXT NOT NULL,
  content TEXT NOT NULL,
  is_system BOOLEAN DEFAULT false,
  raw_line TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Create policies for chat messages (readable by all authenticated users)
CREATE POLICY "Enable read access for all users"
ON public.chat_messages
FOR SELECT
USING (true);

CREATE POLICY "Enable insert access for all users"
ON public.chat_messages
FOR INSERT
WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX idx_chat_messages_datetime ON public.chat_messages(datetime DESC);
CREATE INDEX idx_chat_messages_sender ON public.chat_messages(sender);
CREATE INDEX idx_chat_messages_content ON public.chat_messages USING gin(to_tsvector('english', content));