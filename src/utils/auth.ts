// Memory Galaxy Authentication System with Supabase
import { supabase } from '@/integrations/supabase/client';

export interface User {
  id: string;
  username: string;
  displayName?: string;
  isAdmin?: boolean;
}

export interface LoginResponse {
  success: boolean;
  user?: User;
  error?: string;
}

// Simple username/password authentication for demo purposes
const DEMO_USERS = {
  'sarru': { password: 'sarru', isAdmin: true, displayName: 'Sarru' },
  'hiba': { password: 'hiba', isAdmin: false, displayName: 'Hiba' }
};

export async function login(username: string, password: string): Promise<LoginResponse> {
  try {
    // Check demo users first
    const demoUser = DEMO_USERS[username as keyof typeof DEMO_USERS];
    if (demoUser && demoUser.password === password) {
      // Get or create profile for demo user
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', username)
        .single();

      const userData: User = {
        id: profile?.id || `demo-${username}`,
        username,
        displayName: demoUser.displayName,
        isAdmin: demoUser.isAdmin,
      };

      return { success: true, user: userData };
    }

    return { success: false, error: 'Invalid username or password' };
  } catch (error) {
    return { success: false, error: 'An error occurred during login' };
  }
}


export async function logout(): Promise<void> {
  // Simple logout - just clear any stored user data
  localStorage.removeItem('user');
}

export function getCurrentUser(): User | null {
  // This will be managed by the App component using auth state
  return null;
}

export async function isAdmin(userId: string): Promise<boolean> {
  try {
    const { data } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('user_id', userId)
      .single();
    
    return data?.is_admin || false;
  } catch {
    return false;
  }
}