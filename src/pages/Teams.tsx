import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Users, Plus, Search, Filter, X } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Team {
  id: string;
  name: string;
  required_skills: string[];
  event_id: string;
  events: {
    name: string;
  };
  team_members: {
    role: string;
    profiles: {
      name: string;
      college: string;
    };
  }[];
}

interface Event {
  id: string;
  name: string;
}

const Teams = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [eventFilter, setEventFilter] = useState("");
  const [collegeFilter, setCollegeFilter] = useState("");
  const [skillFilter, setSkillFilter] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [searchParams] = useSearchParams();
  const eventId = searchParams.get('event');
  const { toast } = useToast();

  useEffect(() => {
    fetchTeams();
    fetchEvents();
  }, [eventId]);

  const fetchTeams = async () => {
    try {
      let query = supabase
        .from('teams')
        .select(`
          *,
          events(name),
          team_members(
            role,
            profiles(name, college)
          )
        `)
        .order('created_at', { ascending: false });

      if (eventId) {
        query = query.eq('event_id', eventId);
      }

      const { data, error } = await query;

      if (error) throw error;
      setTeams(data || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch teams",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('id, name')
        .order('name');

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error('Failed to fetch events:', error);
    }
  };

  const filteredTeams = teams.filter(team => {
    const matchesSearch = team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      team.required_skills.some(skill => 
        skill.toLowerCase().includes(searchTerm.toLowerCase())
      );
    
    const matchesEvent = !eventFilter || team.event_id === eventFilter;
    const matchesSkill = !skillFilter || team.required_skills.some(skill => 
      skill.toLowerCase().includes(skillFilter.toLowerCase())
    );
    const matchesCollege = !collegeFilter || team.team_members.some(member => 
      member.profiles?.college?.toLowerCase().includes(collegeFilter.toLowerCase())
    );
    
    return matchesSearch && matchesEvent && matchesSkill && matchesCollege;
  });

  const clearFilters = () => {
    setEventFilter("");
    setCollegeFilter("");
    setSkillFilter("");
    setSearchTerm("");
  };

  const hasActiveFilters = eventFilter || collegeFilter || skillFilter;

  const getOwner = (team: Team) => {
    const owner = team.team_members?.find(member => member.role === 'owner');
    return owner?.profiles?.name || 'Unknown';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-48 mb-6"></div>
            <div className="grid gap-4 md:grid-cols-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-48 bg-muted rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col gap-4 mb-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-foreground">Teams</h1>
            <Button asChild>
              <Link to="/teams/create">
                <Plus className="w-4 h-4 mr-2" />
                Create Team
              </Link>
            </Button>
          </div>
          
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search teams by name or skills..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button 
              variant="outline" 
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <Filter className="w-4 h-4" />
              Filters
              {hasActiveFilters && <Badge variant="secondary" className="ml-2">Active</Badge>}
            </Button>
          </div>

          {showFilters && (
            <Card className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label className="text-sm font-medium">Event</Label>
                  <Select value={eventFilter} onValueChange={setEventFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All events" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All events</SelectItem>
                      {events.map((event) => (
                        <SelectItem key={event.id} value={event.id}>
                          {event.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label className="text-sm font-medium">Required Skills</Label>
                  <Input
                    placeholder="Filter by skills..."
                    value={skillFilter}
                    onChange={(e) => setSkillFilter(e.target.value)}
                  />
                </div>
                
                <div>
                  <Label className="text-sm font-medium">College</Label>
                  <Input
                    placeholder="Filter by team member college..."
                    value={collegeFilter}
                    onChange={(e) => setCollegeFilter(e.target.value)}
                  />
                </div>
              </div>
              
              {hasActiveFilters && (
                <div className="flex justify-end mt-4">
                  <Button variant="outline" size="sm" onClick={clearFilters}>
                    <X className="w-4 h-4 mr-2" />
                    Clear Filters
                  </Button>
                </div>
              )}
            </Card>
          )}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {filteredTeams.map((team) => (
            <Card key={team.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  {team.name}
                </CardTitle>
                <CardDescription>
                  Event: {team.events?.name} • Owner: {getOwner(team)}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Required Skills:</p>
                    <div className="flex flex-wrap gap-1">
                      {team.required_skills?.map((skill, index) => (
                        <Badge key={index} variant="secondary">
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
                        View Details
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredTeams.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">
              {searchTerm ? "No teams found" : "No teams yet"}
            </h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm 
                ? "Try adjusting your search terms" 
                : "Get started by creating your first team."}
            </p>
            {!searchTerm && (
              <Button asChild>
                <Link to="/teams/create">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Team
                </Link>
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Teams;