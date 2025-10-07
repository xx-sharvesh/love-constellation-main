import { useState } from 'react';
import { Users, Heart, Book, List, TrendingUp, Settings, Shield, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';

const Admin = () => {
  const [activeTab, setActiveTab] = useState('overview');

  // Mock statistics - replace with real data from Supabase
  const stats = {
    totalUsers: 2,
    totalMemories: 12,
    totalLoveLetters: 8,
    bucketListItems: 5,
    completedItems: 2,
    recentActivity: 24
  };

  // Mock recent activity
  const recentActivity = [
    { id: '1', user: 'Alex', action: 'Created a new memory', timestamp: '2 hours ago', type: 'memory' },
    { id: '2', user: 'Jordan', action: 'Sent a love letter', timestamp: '5 hours ago', type: 'letter' },
    { id: '3', user: 'Alex', action: 'Completed bucket list item', timestamp: '1 day ago', type: 'bucket' },
    { id: '4', user: 'Jordan', action: 'Updated profile', timestamp: '2 days ago', type: 'profile' },
    { id: '5', user: 'Alex', action: 'Added bucket list item', timestamp: '3 days ago', type: 'bucket' }
  ];

  // Mock user management data
  const users = [
    { id: '1', username: 'alex_cosmic', displayName: 'Alex', isAdmin: true, lastActive: '2024-01-15', memoriesCount: 7 },
    { id: '2', username: 'jordan_stars', displayName: 'Jordan', isAdmin: false, lastActive: '2024-01-15', memoriesCount: 5 }
  ];

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="w-8 h-8 text-accent-gold" />
            <h1 className="text-4xl font-primary font-bold text-text-primary">
              Admin Dashboard
            </h1>
          </div>
          <p className="text-text-secondary">
            Manage your Memory Galaxy application
          </p>
        </div>

        {/* Security Warning */}
        <Alert className="mb-6 border-destructive/50 bg-destructive/10">
          <AlertTriangle className="h-4 w-4 text-destructive" />
          <AlertDescription className="text-text-primary">
            <strong>Security Notice:</strong> This admin system uses client-side authentication. For production use, 
            implement proper server-side role validation using Supabase RLS policies and a user_roles table.
          </AlertDescription>
        </Alert>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-grid">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="content">Content</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Card className="memory-card">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-lg bg-accent-lavender/20">
                      <Users className="w-6 h-6 text-accent-lavender" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-text-primary">{stats.totalUsers}</p>
                      <p className="text-sm text-text-secondary">Total Users</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="memory-card">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-lg bg-accent-blush/20">
                      <Book className="w-6 h-6 text-accent-blush" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-text-primary">{stats.totalMemories}</p>
                      <p className="text-sm text-text-secondary">Memories Created</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="memory-card">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-lg bg-accent-gold/20">
                      <Heart className="w-6 h-6 text-accent-gold" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-text-primary">{stats.totalLoveLetters}</p>
                      <p className="text-sm text-text-secondary">Love Letters</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="memory-card">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-lg bg-accent-cosmic/20">
                      <List className="w-6 h-6 text-accent-cosmic" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-text-primary">{stats.bucketListItems}</p>
                      <p className="text-sm text-text-secondary">Bucket List Items</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="memory-card">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-lg bg-accent-lavender/20">
                      <TrendingUp className="w-6 h-6 text-accent-lavender" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-text-primary">{stats.recentActivity}</p>
                      <p className="text-sm text-text-secondary">Activities (7 days)</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="memory-card">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-lg bg-accent-blush/20">
                      <Settings className="w-6 h-6 text-accent-blush" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-text-primary">{stats.completedItems}</p>
                      <p className="text-sm text-text-secondary">Completed Dreams</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card className="memory-card">
              <CardHeader>
                <CardTitle className="text-text-primary">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-surface-glass border border-border hover:border-accent-lavender/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${
                          activity.type === 'memory' ? 'bg-accent-blush' :
                          activity.type === 'letter' ? 'bg-accent-gold' :
                          activity.type === 'bucket' ? 'bg-accent-cosmic' :
                          'bg-accent-lavender'
                        }`} />
                        <div>
                          <p className="text-text-primary font-medium">{activity.user}</p>
                          <p className="text-sm text-text-secondary">{activity.action}</p>
                        </div>
                      </div>
                      <Badge variant="secondary" className="bg-surface-glass text-text-muted">
                        {activity.timestamp}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            <Card className="memory-card">
              <CardHeader>
                <CardTitle className="text-text-primary">User Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {users.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between p-4 rounded-lg bg-surface-glass border border-border"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-accent-lavender/20 flex items-center justify-center">
                          <span className="text-xl font-bold text-accent-lavender">
                            {user.displayName.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-text-primary font-semibold">{user.displayName}</p>
                            {user.isAdmin && (
                              <Badge className="bg-accent-gold/20 text-accent-gold border-accent-gold/30">
                                Admin
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-text-muted">@{user.username}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-text-primary font-medium">{user.memoriesCount} memories</p>
                        <p className="text-xs text-text-muted">Last active: {user.lastActive}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Content Tab */}
          <TabsContent value="content" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="memory-card">
                <CardHeader>
                  <CardTitle className="text-text-primary flex items-center gap-2">
                    <Book className="w-5 h-5 text-accent-blush" />
                    Memories
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-text-primary mb-2">{stats.totalMemories}</p>
                  <p className="text-sm text-text-secondary mb-4">Total memories created</p>
                  <Button variant="outline" className="w-full">View All Memories</Button>
                </CardContent>
              </Card>

              <Card className="memory-card">
                <CardHeader>
                  <CardTitle className="text-text-primary flex items-center gap-2">
                    <Heart className="w-5 h-5 text-accent-gold" />
                    Love Letters
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-text-primary mb-2">{stats.totalLoveLetters}</p>
                  <p className="text-sm text-text-secondary mb-4">Love letters sent</p>
                  <Button variant="outline" className="w-full">View All Letters</Button>
                </CardContent>
              </Card>

              <Card className="memory-card">
                <CardHeader>
                  <CardTitle className="text-text-primary flex items-center gap-2">
                    <List className="w-5 h-5 text-accent-cosmic" />
                    Bucket List
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-text-primary mb-2">{stats.bucketListItems}</p>
                  <p className="text-sm text-text-secondary mb-4">Dreams to accomplish</p>
                  <Button variant="outline" className="w-full">View Bucket List</Button>
                </CardContent>
              </Card>

              <Card className="memory-card">
                <CardHeader>
                  <CardTitle className="text-text-primary flex items-center gap-2">
                    <Settings className="w-5 h-5 text-accent-lavender" />
                    System Settings
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-text-secondary mb-4">Configure application settings</p>
                  <Button className="btn-cosmic w-full">Open Settings</Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
