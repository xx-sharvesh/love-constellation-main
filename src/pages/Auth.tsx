import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { login } from '@/utils/auth';
import { Heart, Lock, User } from 'lucide-react';
import ConstellationBackground from '@/components/ConstellationBackground';

interface AuthProps {
  onLogin: (user: any) => void;
}

const Auth = ({ onLogin }: AuthProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [loginData, setLoginData] = useState({ username: '', password: '' });
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const result = await login(loginData.username, loginData.password);

    if (result.success && result.user) {
      toast({ title: '✨ Welcome back!', description: 'Login successful' });
      onLogin(result.user);
    } else {
      toast({
        title: 'Login failed',
        description: result.error || 'Invalid credentials',
        variant: 'destructive',
      });
    }

    setIsLoading(false);
  };


  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <ConstellationBackground />
      
      <Card className="w-full max-w-md memory-card z-10">
        <CardHeader className="text-center space-y-2">
          <div className="flex justify-center mb-4">
            <Heart className="w-16 h-16 text-accent-blush animate-pulse" />
          </div>
          <CardTitle className="text-3xl font-primary text-text-primary">Memory Galaxy</CardTitle>
          <CardDescription className="text-text-secondary">
            Your constellation of shared moments and dreams
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="login-username" className="text-text-secondary">
                <User className="w-4 h-4 inline mr-2" />
                Username
              </Label>
              <Input
                id="login-username"
                type="text"
                placeholder="sarru or hiba"
                value={loginData.username}
                onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
                required
                disabled={isLoading}
                className="text-center"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="login-password" className="text-text-secondary">
                <Lock className="w-4 h-4 inline mr-2" />
                Password
              </Label>
              <Input
                id="login-password"
                type="password"
                placeholder="••••••••"
                value={loginData.password}
                onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                required
                disabled={isLoading}
                className="text-center"
              />
            </div>

            <Button
              type="submit"
              className="w-full btn-romantic text-lg py-3"
              disabled={isLoading}
            >
              {isLoading ? 'Signing in...' : 'Enter Memory Galaxy'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
