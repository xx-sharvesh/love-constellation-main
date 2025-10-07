import React from 'react';
import { Heart, Calendar, BookOpen, CheckSquare, MessageCircle, User, Settings, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { logout, isAdmin } from '@/utils/auth';
import { useCurrentUser } from '@/App';

interface NavigationProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  onLogout: () => void;
}

const Navigation: React.FC<NavigationProps> = ({ activeSection, onSectionChange, onLogout }) => {
  const { toast } = useToast();
  const currentUser = useCurrentUser();
  const [isUserAdmin, setIsUserAdmin] = React.useState(false);

  React.useEffect(() => {
    const checkAdmin = async () => {
      if (currentUser) {
        const adminStatus = await isAdmin(currentUser.id);
        setIsUserAdmin(adminStatus);
      }
    };
    checkAdmin();
  }, [currentUser]);

  const handleLogout = async () => {
    await logout();
    toast({
      title: "Goodbye! 🌟",
      description: "See you soon in your memory galaxy...",
    });
    onLogout();
  };

  const navigationItems = [
    { id: 'dashboard', label: 'Timeline', icon: Heart, description: 'Your memory journey' },
    { id: 'memories', label: 'Memories', icon: BookOpen, description: 'Create & view memories' },
    { id: 'proposals', label: 'Proposals', icon: Calendar, description: 'Special moments' },
    { id: 'bucket-list', label: 'Dreams', icon: CheckSquare, description: 'Shared bucket list' },
    { id: 'chat-archive', label: 'Chat Archive', icon: MessageCircle, description: 'Message history' },
    { id: 'profile', label: 'Profile', icon: User, description: 'Your cosmic profile' },
  ];

  // Add admin section if user is admin
  if (isUserAdmin) {
    navigationItems.push({ 
      id: 'admin', 
      label: 'Admin', 
      icon: Settings, 
      description: 'Galaxy management' 
    });
  }

  return (
    <nav className="glass fixed left-4 top-1/2 transform -translate-y-1/2 z-40 p-4 rounded-2xl w-64">
      <div className="mb-6 text-center">
        <h2 className="text-lg font-primary text-text-primary">Memory Galaxy</h2>
        <p className="text-sm text-text-secondary">Welcome, {currentUser?.displayName}!</p>
      </div>
      
      <div className="space-y-2">
        {navigationItems.map((item) => (
          <Button
            key={item.id}
            variant={activeSection === item.id ? "default" : "ghost"}
            className={`w-full justify-start text-left p-3 h-auto ${
              activeSection === item.id 
                ? 'btn-romantic' 
                : 'hover:bg-card-bg-hover text-text-secondary hover:text-text-primary'
            }`}
            onClick={() => onSectionChange(item.id)}
          >
            <item.icon className="w-5 h-5 mr-3 flex-shrink-0" />
            <div>
              <div className="font-medium">{item.label}</div>
              <div className="text-xs opacity-75">{item.description}</div>
            </div>
          </Button>
        ))}
        
        <div className="pt-4 border-t border-accent-lavender/20">
          <Button
            variant="ghost"
            className="w-full justify-start text-left p-3 h-auto text-text-muted hover:text-accent-blush"
            onClick={handleLogout}
          >
            <LogOut className="w-5 h-5 mr-3" />
            <div>
              <div className="font-medium">Sign Out</div>
              <div className="text-xs opacity-75">Leave galaxy</div>
            </div>
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;