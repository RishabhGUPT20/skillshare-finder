import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { User, ArrowLeft, GraduationCap, Users, Calendar, MessageCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface TeamMembership {
  id: string;
  role: string;
  joined_at: string;
  teams: {
    id: string;
    name: string;
    events: {
      name: string;
      date: string;
    };
  };
}

interface Profile {
  id: string;
  name: string;
  college: string;
  skills: string[];
  created_at: string;
  team_members: TeamMembership[];
}

const ProfileDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (id) {
      fetchProfileDetails();
    }
  }, [id]);

  const fetchProfileDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          team_members(
            id,
            role,
            joined_at,
            teams(
              id,
              name,
              events(name, date)
            )
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch profile details",
        variant: "destructive",
      });
      navigate('/profiles');
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = () => {
    // In a real app, this would open a messaging interface
    toast({
      title: "Feature Coming Soon",
      description: "Direct messaging will be available in a future update!",
    });
  };

  const inviteToTeam = () => {
    // In a real app, this would show team selection for invitation
    toast({
      title: "Feature Coming Soon",
      description: "Team invitations will be available in a future update!",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-64"></div>
            <div className="h-48 bg-muted rounded-lg"></div>
            <div className="h-32 bg-muted rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-4xl mx-auto text-center py-12">
          <h1 className="text-2xl font-bold mb-4">Profile not found</h1>
          <Button asChild>
            <Link to="/profiles">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Profiles
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/profiles">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Profiles
            </Link>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-start gap-6">
              <Avatar className="w-24 h-24">
                <AvatarFallback className="text-2xl">
                  {getInitials(profile.name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-2">
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <User className="w-6 h-6" />
                  {profile.name}
                </CardTitle>
                {profile.college && (
                  <CardDescription className="flex items-center gap-2 text-lg">
                    <GraduationCap className="w-5 h-5" />
                    {profile.college}
                  </CardDescription>
                )}
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  Member since {new Date(profile.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long'
                  })}
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={sendMessage}>
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Message
                </Button>
                <Button variant="outline" onClick={inviteToTeam}>
                  <Users className="w-4 h-4 mr-2" />
                  Invite to Team
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold mb-3">Skills & Expertise</h3>
                <div className="flex flex-wrap gap-2">
                  {profile.skills && profile.skills.length > 0 ? (
                    profile.skills.map((skill, index) => (
                      <Badge key={index} variant="secondary" className="text-sm px-3 py-1">
                        {skill}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-muted-foreground">No skills listed</span>
                  )}
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4 text-center">
                <div className="p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-primary">
                    {profile.team_members?.length || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">Teams Joined</div>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-primary">
                    {profile.skills?.length || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">Skills</div>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-primary">
                    {profile.team_members?.filter(tm => tm.role === 'owner').length || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">Teams Created</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Team History</CardTitle>
          </CardHeader>
          <CardContent>
            {profile.team_members && profile.team_members.length > 0 ? (
              <div className="space-y-4">
                {profile.team_members.map((membership) => (
                  <div key={membership.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{membership.teams.name}</h4>
                          <Badge variant={membership.role === 'owner' ? 'default' : 'secondary'}>
                            {membership.role}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {membership.teams.events.name} • {new Date(membership.teams.events.date).toLocaleDateString()}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Joined {new Date(membership.joined_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <Button asChild size="sm" variant="outline">
                      <Link to={`/teams/${membership.teams.id}`}>
                        View Team
                      </Link>
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Users className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-2">No team history</h3>
                <p className="text-muted-foreground mb-4">
                  This developer hasn't joined any teams yet.
                </p>
                <Button asChild>
                  <Link to="/teams">
                    <Users className="w-4 h-4 mr-2" />
                    Browse Teams
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProfileDetail;