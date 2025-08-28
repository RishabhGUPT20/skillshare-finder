import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Bell, Users, Calendar, MessageSquare, Trophy, CheckCircle, Clock, X, UserPlus } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface DashboardData {
  userTeams: any[];
  joinRequests: any[];
  notifications: any[];
  upcomingEvents: any[];
}

const Dashboard = () => {
  const [data, setData] = useState<DashboardData>({
    userTeams: [],
    joinRequests: [],
    notifications: [],
    upcomingEvents: []
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // In a real app, this would be based on authenticated user
      // For demo, we'll show some sample data
      
      // Fetch user's teams
      const { data: teams, error: teamsError } = await supabase
        .from('teams')
        .select(`
          *,
          events(name, date),
          team_members(id, role, profiles(name))
        `)
        .limit(5);

      // Fetch pending join requests
      const { data: requests, error: requestsError } = await supabase
        .from('join_requests')
        .select(`
          *,
          teams(name),
          profiles(name)
        `)
        .eq('status', 'pending')
        .limit(10);

      // Fetch upcoming events
      const { data: events, error: eventsError } = await supabase
        .from('events')
        .select('*')
        .gte('date', new Date().toISOString().split('T')[0])
        .order('date', { ascending: true })
        .limit(5);

      if (teamsError || requestsError || eventsError) {
        throw new Error('Failed to fetch dashboard data');
      }

      setData({
        userTeams: teams || [],
        joinRequests: requests || [],
        notifications: [
          {
            id: 1,
            type: 'team_invite',
            message: 'You have been invited to join "AI Innovators"',
            time: '2 hours ago',
            unread: true
          },
          {
            id: 2,
            type: 'event_reminder',
            message: 'SIH 2025 registration ends in 5 days',
            time: '1 day ago',
            unread: true
          },
          {
            id: 3,
            type: 'skill_match',
            message: 'New teams looking for your React skills',
            time: '2 days ago',
            unread: false
          }
        ],
        upcomingEvents: events || []
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleJoinRequest = async (requestId: string, action: 'accept' | 'reject') => {
    try {
      const { error } = await supabase
        .from('join_requests')
        .update({ status: action === 'accept' ? 'accepted' : 'rejected' })
        .eq('id', requestId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Request ${action}ed successfully!`,
      });

      fetchDashboardData();
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${action} request`,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-64"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <div className="h-48 bg-muted rounded-lg"></div>
                <div className="h-32 bg-muted rounded-lg"></div>
              </div>
              <div className="space-y-6">
                <div className="h-32 bg-muted rounded-lg"></div>
                <div className="h-32 bg-muted rounded-lg"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">Welcome back! Here's your hackathon activity.</p>
          </div>
          <Button asChild>
            <Link to="/teams/create">
              <UserPlus className="w-4 h-4 mr-2" />
              Create Team
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-primary" />
                    <div>
                      <div className="text-2xl font-bold">{data.userTeams.length}</div>
                      <div className="text-sm text-muted-foreground">My Teams</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-accent" />
                    <div>
                      <div className="text-2xl font-bold">{data.upcomingEvents.length}</div>
                      <div className="text-sm text-muted-foreground">Upcoming Events</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-2">
                    <Bell className="w-5 h-5 text-destructive" />
                    <div>
                      <div className="text-2xl font-bold">{data.joinRequests.length}</div>
                      <div className="text-sm text-muted-foreground">Pending Requests</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* My Teams */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  My Teams
                </CardTitle>
              </CardHeader>
              <CardContent>
                {data.userTeams.length > 0 ? (
                  <div className="space-y-4">
                    {data.userTeams.slice(0, 3).map((team) => (
                      <div key={team.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h3 className="font-medium">{team.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {team.events?.name} • {team.team_members?.length || 0} members
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" asChild>
                            <Link to={`/teams/${team.id}`}>View</Link>
                          </Button>
                          <Button variant="ghost" size="sm">
                            <MessageSquare className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground mb-4">You haven't joined any teams yet</p>
                    <Button asChild>
                      <Link to="/teams">Explore Teams</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Pending Join Requests */}
            {data.joinRequests.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    Pending Join Requests
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {data.joinRequests.map((request) => (
                      <div key={request.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarFallback>
                              {request.profiles?.name?.split(' ').map((n: string) => n[0]).join('') || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{request.profiles?.name || 'Unknown User'}</div>
                            <div className="text-sm text-muted-foreground">
                              wants to join "{request.teams?.name}"
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            onClick={() => handleJoinRequest(request.id, 'accept')}
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Accept
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleJoinRequest(request.id, 'reject')}
                          >
                            <X className="w-4 h-4 mr-1" />
                            Reject
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Notifications */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  Notifications
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {data.notifications.map((notification) => (
                    <div 
                      key={notification.id} 
                      className={`p-3 rounded-lg text-sm ${
                        notification.unread ? 'bg-primary/5 border border-primary/20' : 'bg-muted/50'
                      }`}
                    >
                      <p className="font-medium">{notification.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">{notification.time}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Upcoming Events */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Upcoming Events
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {data.upcomingEvents.slice(0, 3).map((event) => (
                    <div key={event.id} className="p-3 border rounded-lg">
                      <h4 className="font-medium">{event.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {new Date(event.date).toLocaleDateString()}
                      </p>
                      <Button variant="ghost" size="sm" className="mt-2 p-0 h-auto" asChild>
                        <Link to={`/events`}>View Details</Link>
                      </Button>
                    </div>
                  ))}
                </div>
                <Button variant="outline" className="w-full mt-4" asChild>
                  <Link to="/events">View All Events</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button className="w-full" asChild>
                  <Link to="/teams/create">Create New Team</Link>
                </Button>
                <Button variant="outline" className="w-full" asChild>
                  <Link to="/profiles/create">Update Profile</Link>
                </Button>
                <Button variant="outline" className="w-full" asChild>
                  <Link to="/teams">Find Teams</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;