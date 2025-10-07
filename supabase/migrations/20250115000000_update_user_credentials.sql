-- Update existing user credentials to match requirements
-- Update sharvesh to sarru with admin privileges
UPDATE public.profiles 
SET username = 'sarru', display_name = 'Sarru', is_admin = true 
WHERE username = 'sharvesh';

-- Update hiba user to ensure correct admin status
UPDATE public.profiles 
SET is_admin = false 
WHERE username = 'hiba';

-- Insert new user if sarru doesn't exist (fallback)
INSERT INTO public.profiles (user_id, username, display_name, is_admin) 
VALUES (gen_random_uuid(), 'sarru', 'Sarru', true)
ON CONFLICT (username) DO NOTHING;

-- Ensure hiba user exists with correct admin status
INSERT INTO public.profiles (user_id, username, display_name, is_admin) 
VALUES (gen_random_uuid(), 'hiba', 'Hiba', false)
ON CONFLICT (username) DO UPDATE SET is_admin = false;
