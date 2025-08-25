import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Calendar, ArrowLeft, Users, Plus, MapPin, Clock } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Team {
  id: string;
  name: string;
  required_skills: string[];
  team_members: {
    role: string;
    profiles: {
      name: string;
    };
  }[];
}

interface Event {
  id: string;
  name: string;
  description: string;
  date: string;
  created_at: string;
}

const EventDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState<Event | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (id) {
      fetchEventDetails();
      fetchEventTeams();
    }
  }, [id]);

  const fetchEventDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setEvent(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch event details",
        variant: "destructive",
      });
      navigate('/events');
    } finally {
      setLoading(false);
    }
  };

  const fetchEventTeams = async () => {
    try {
      const { data, error } = await supabase
        .from('teams')
        .select(`
          *,
          team_members(
            role,
            profiles(name)
          )
        `)
        .eq('event_id', id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTeams(data || []);
    } catch (error) {
      console.error('Failed to fetch teams:', error);
    }
  };

  const getOwner = (team: Team) => {
    const owner = team.team_members?.find(member => member.role === 'owner');
    return owner?.profiles?.name || 'Unknown';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    });
  };

  const isEventPast = (dateString: string) => {
    return new Date(dateString) < new Date();
  };

  const getDaysUntilEvent = (dateString: string) => {
    const eventDate = new Date(dateString);
    const today = new Date();
    const diffTime = eventDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
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

  if (!event) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-4xl mx-auto text-center py-12">
          <h1 className="text-2xl font-bold mb-4">Event not found</h1>
          <Button asChild>
            <Link to="/events">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Events
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  const daysUntil = getDaysUntilEvent(event.date);
  const isPast = isEventPast(event.date);

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/events">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Events
            </Link>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-6 h-6" />
              {event.name}
            </CardTitle>
            <CardDescription className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {formatDate(event.date)}
              </span>
              {!isPast && (
                <Badge variant={daysUntil <= 7 ? "destructive" : "secondary"}>
                  {daysUntil > 0 ? `${daysUntil} days to go` : 'Today!'}
                </Badge>
              )}
              {isPast && (
                <Badge variant="outline">Event Completed</Badge>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Description</h3>
                <p className="text-muted-foreground">
                  {event.description || "No description available for this event."}
                </p>
              </div>

              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  {teams.length} team(s) registered
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  Created {new Date(event.created_at).toLocaleDateString()}
                </span>
              </div>

              {!isPast && (
                <div className="flex gap-2">
                  <Button asChild>
                    <Link to={`/teams/create?event=${event.id}`}>
                      <Plus className="w-4 h-4 mr-2" />
                      Create Team for this Event
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Participating Teams</span>
              <Badge variant="secondary">{teams.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {teams.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2">
                {teams.map((team) => (
                  <Card key={team.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Users className="w-5 h-5" />
                        {team.name}
                      </CardTitle>
                      <CardDescription>
                        Owner: {getOwner(team)}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm text-muted-foreground mb-2">Required Skills:</p>
                          <div className="flex flex-wrap gap-1">
                            {team.required_skills?.map((skill, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">
                            {team.team_members?.length || 0} member(s)
                          </span>
                          <Button asChild size="sm">
                            <Link to={`/teams/${team.id}`}>
                              View Team
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Users className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-2">No teams yet</h3>
                <p className="text-muted-foreground mb-4">
                  Be the first to create a team for this event!
                </p>
                {!isPast && (
                  <Button asChild>
                    <Link to={`/teams/create?event=${event.id}`}>
                      <Plus className="w-4 h-4 mr-2" />
                      Create Team
                    </Link>
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EventDetail;