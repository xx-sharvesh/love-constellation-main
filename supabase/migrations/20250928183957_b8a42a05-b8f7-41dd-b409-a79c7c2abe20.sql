-- Create user profiles table first
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT,
  nickname TEXT,
  description TEXT,
  profile_photo_url TEXT,
  is_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create memories table
CREATE TABLE public.memories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  content TEXT,
  memory_type TEXT DEFAULT 'text' CHECK (memory_type IN ('text', 'audio', 'video', 'image', 'file')),
  media_urls TEXT[],
  tags TEXT[],
  mood_rating INTEGER CHECK (mood_rating >= 1 AND mood_rating <= 10),
  is_favorite BOOLEAN DEFAULT false,
  memory_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create love letters table
CREATE TABLE public.love_letters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL,
  recipient_id UUID NOT NULL,
  title TEXT,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create bucket list table
CREATE TABLE public.bucket_list (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  is_completed BOOLEAN DEFAULT false,
  completed_by UUID,
  completed_date TIMESTAMP WITH TIME ZONE,
  completion_story TEXT,
  completion_media_urls TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.love_letters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bucket_list ENABLE ROW LEVEL SECURITY;

-- Simple RLS policies - allow all authenticated users for now
CREATE POLICY "Enable read access for all users" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON public.profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON public.profiles FOR UPDATE USING (true);

CREATE POLICY "Enable read access for all users" ON public.memories FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON public.memories FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON public.memories FOR UPDATE USING (true);

CREATE POLICY "Enable read access for all users" ON public.love_letters FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON public.love_letters FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON public.love_letters FOR UPDATE USING (true);

CREATE POLICY "Enable read access for all users" ON public.bucket_list FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON public.bucket_list FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON public.bucket_list FOR UPDATE USING (true);

-- Insert initial user profiles with proper UUIDs
INSERT INTO public.profiles (user_id, username, display_name, is_admin) VALUES
(gen_random_uuid(), 'sharvesh', 'Sharvesh', true),
(gen_random_uuid(), 'hiba', 'Hiba 🖤🤍', false);