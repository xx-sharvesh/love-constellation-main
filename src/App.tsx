import React, { useState, useEffect, createContext, useContext } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { supabase } from '@/integrations/supabase/client';

// Memory Galaxy Components
import ConstellationBackground from './components/ConstellationBackground';
import ThemeToggle from './components/ThemeToggle';
import Auth from './pages/Auth';
import Navigation from './components/Navigation';
import FloatingMail from './components/FloatingMail';
// Pages
import Timeline from './pages/Timeline';
import Memories from './pages/Memories';
import LoveLetters from './pages/LoveLetters';
import BucketList from './pages/BucketList';
import Profile from './pages/Profile';
import ChatArchive from './pages/ChatArchive';
import Admin from './pages/Admin';

// Auth utilities
import { type User } from './utils/auth';

const queryClient = new QueryClient();

// Create a context for the current user
export const UserContext = createContext<User | null>(null);

export const useCurrentUser = () => useContext(UserContext);

const App = () => {
  const [user, setUser] = useState<User | null>(null);
  const [activeSection, setActiveSection] = useState('timeline');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing Supabase session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('username, display_name')
          .eq('user_id', session.user.id)
          .single();

        setUser({
          id: session.user.id,
          email: session.user.email!,
          username: profile?.username,
          displayName: profile?.display_name || profile?.username,
        });
      }
      setIsLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('username, display_name')
          .eq('user_id', session.user.id)
          .single();

        setUser({
          id: session.user.id,
          email: session.user.email!,
          username: profile?.username,
          displayName: profile?.display_name || profile?.username,
        });
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogin = (userData: User) => {
    setUser(userData);
  };

  const handleLogout = () => {
    setUser(null);
    setActiveSection('timeline');
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'timeline':
        return <Timeline />;
      case 'memories':
        return <Memories />;
      case 'proposals':
        return <LoveLetters />;
      case 'bucket-list':
        return <BucketList />;
      case 'chat-archive':
        return <ChatArchive />;
      case 'profile':
        return <Profile />;
      case 'admin':
        return <Admin />;
      default:
        return <Timeline />;
    }
  };

  if (isLoading) {
    return (
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-accent-lavender border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="mt-4 text-text-secondary">Loading Memory Galaxy...</p>
            </div>
          </div>
          <ConstellationBackground />
          <Toaster />
          <Sonner />
        </TooltipProvider>
      </QueryClientProvider>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <UserContext.Provider value={user}>
          <div className="min-h-screen relative">
            <ConstellationBackground />
            
            {!user ? (
              <Auth onLogin={handleLogin} />
            ) : (
              <>
                <ThemeToggle />
                <Navigation 
                  activeSection={activeSection}
                  onSectionChange={setActiveSection}
                  onLogout={handleLogout}
                />
                <FloatingMail />
                
                <main className="ml-72 min-h-screen">
                  {renderContent()}
                </main>
              </>
            )}
          </div>
          
          <Toaster />
          <Sonner />
        </UserContext.Provider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
