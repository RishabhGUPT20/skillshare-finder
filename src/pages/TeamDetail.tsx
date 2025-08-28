import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Users, ArrowLeft, UserPlus, Crown, Calendar, X, Check, MessageSquare } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import TeamChat from "@/components/TeamChat";

interface TeamMember {
  id: string;
  role: string;
  joined_at: string;
  profiles: {
    id: string;
    name: string;
    skills: string[];
    college: string;
  };
}

interface Team {
  id: string;
  name: string;
  required_skills: string[];
  created_at: string;
  events: {
    id: string;
    name: string;
    date: string;
  };
  team_members: TeamMember[];
}

interface Profile {
  id: string;
  name: string;
  skills: string[];
  college: string;
}

interface JoinRequest {
  id: string;
  status: string;
  created_at: string;
  profiles: {
    id: string;
    name: string;
    skills: string[];
    college: string;
  };
}

const TeamDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [team, setTeam] = useState<Team | null>(null);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [joinRequests, setJoinRequests] = useState<JoinRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProfile, setSelectedProfile] = useState("");
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (id) {
      fetchTeamDetails();
      fetchProfiles();
      fetchJoinRequests();
    }
  }, [id]);

  const fetchTeamDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('teams')
        .select(`
          *,
          events(id, name, date),
          team_members(
            id,
            role,
            joined_at,
            profiles(id, name, skills, college)
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      setTeam(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch team details",
        variant: "destructive",
      });
      navigate('/teams');
    } finally {
      setLoading(false);
    }
  };

  const fetchProfiles = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('name');

      if (error) throw error;
      setProfiles(data || []);
    } catch (error) {
      console.error('Failed to fetch profiles:', error);
    }
  };

  const fetchJoinRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('join_requests')
        .select(`
          id,
          status,
          created_at,
          profiles(id, name, skills, college)
        `)
        .eq('team_id', id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setJoinRequests(data || []);
    } catch (error) {
      console.error('Failed to fetch join requests:', error);
    }
  };

  const handleInviteToTeam = async () => {
    if (!selectedProfile || !team) return;

    try {
      // Check if already a member
      const isAlreadyMember = team.team_members.some(
        member => member.profiles.id === selectedProfile
      );

      if (isAlreadyMember) {
        toast({
          title: "Error",
          description: "This person is already a team member",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from('team_members')
        .insert([{
          team_id: team.id,
          user_id: selectedProfile,
          role: 'member'
        }]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Member added to team successfully!",
      });

      setIsInviteOpen(false);
      setSelectedProfile("");
      fetchTeamDetails();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add member to team",
        variant: "destructive",
      });
    }
  };

  const handleJoinRequest = async (requestId: string, action: 'accept' | 'reject') => {
    try {
      if (action === 'accept') {
        const request = joinRequests.find(req => req.id === requestId);
        if (request) {
          // Add to team members
          await supabase
            .from('team_members')
            .insert([{
              team_id: id,
              user_id: request.profiles.id,
              role: 'member'
            }]);
        }
      }

      // Update request status
      const { error } = await supabase
        .from('join_requests')
        .update({ status: action === 'accept' ? 'accepted' : 'rejected' })
        .eq('id', requestId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Request ${action}ed successfully!`,
      });

      fetchJoinRequests();
      if (action === 'accept') {
        fetchTeamDetails();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${action} request`,
        variant: "destructive",
      });
    }
  };

  const removeMember = async (memberId: string) => {
    try {
      const { error } = await supabase
        .from('team_members')
        .delete()
        .eq('id', memberId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Member removed from team",
      });

      fetchTeamDetails();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove member",
        variant: "destructive",
      });
    }
  };

  const requestToJoin = async () => {
    try {
      // For demo purposes, using a random profile ID
      // In real app, this would be the current authenticated user
      const randomProfile = profiles[Math.floor(Math.random() * profiles.length)];
      
      const { error } = await supabase
        .from('join_requests')
        .insert([{
          team_id: id,
          user_id: randomProfile.id,
          status: 'pending'
        }]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Join request sent successfully!",
      });

      fetchJoinRequests();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send join request",
        variant: "destructive",
      });
    }
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

  if (!team) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-4xl mx-auto text-center py-12">
          <h1 className="text-2xl font-bold mb-4">Team not found</h1>
          <Button asChild>
            <Link to="/teams">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Teams
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  const owner = team.team_members.find(member => member.role === 'owner');
  const members = team.team_members.filter(member => member.role !== 'owner');
  const availableProfiles = profiles.filter(profile => 
    !team.team_members.some(member => member.profiles.id === profile.id)
  );

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/teams">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Teams
            </Link>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-6 h-6" />
              {team.name}
            </CardTitle>
            <CardDescription className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {team.events.name} - {new Date(team.events.date).toLocaleDateString()}
              </span>
              <span>{team.team_members.length} member(s)</span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Required Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {team.required_skills?.map((skill, index) => (
                    <Badge key={index} variant="secondary">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={requestToJoin}>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Request to Join
                </Button>
                
                <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline">
                      <UserPlus className="w-4 h-4 mr-2" />
                      Invite Member
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Invite Member to Team</DialogTitle>
                      <DialogDescription>
                        Select a developer to invite to your team.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <Select value={selectedProfile} onValueChange={setSelectedProfile}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a developer" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableProfiles.map((profile) => (
                            <SelectItem key={profile.id} value={profile.id}>
                              {profile.name} - {profile.college}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <div className="flex gap-2">
                        <Button onClick={handleInviteToTeam} disabled={!selectedProfile}>
                          Send Invite
                        </Button>
                        <Button variant="outline" onClick={() => setIsInviteOpen(false)}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </CardContent>
        </Card>


        {/* Team Tabs - Members, Chat, Requests */}
        <Tabs defaultValue="members" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="members" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Members
            </TabsTrigger>
            <TabsTrigger value="chat" className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Team Chat
            </TabsTrigger>
            <TabsTrigger value="requests" className="flex items-center gap-2">
              <UserPlus className="w-4 h-4" />
              Requests {joinRequests.length > 0 && `(${joinRequests.length})`}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="members">
            <Card>
              <CardHeader>
                <CardTitle>Team Members</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Owner */}
                  {owner && (
                    <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/30">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback>
                            {owner.profiles.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{owner.profiles.name}</span>
                            <Crown className="w-4 h-4 text-yellow-500" />
                            <Badge variant="outline">Owner</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{owner.profiles.college}</p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {owner.profiles.skills?.slice(0, 3).map((skill, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Members */}
                  {members.map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback>
                            {member.profiles.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{member.profiles.name}</span>
                            <Badge variant="outline">{member.role}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{member.profiles.college}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex flex-wrap gap-1">
                          {member.profiles.skills?.slice(0, 3).map((skill, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => removeMember(member.id)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}

                  {team.team_members.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">
                      No team members yet. Invite developers to join your team!
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="chat">
            <TeamChat teamId={team.id} teamName={team.name} />
          </TabsContent>

          <TabsContent value="requests">
            <Card>
              <CardHeader>
                <CardTitle>Join Requests</CardTitle>
                <CardDescription>
                  {joinRequests.length > 0 
                    ? `${joinRequests.length} pending request(s)`
                    : "No pending requests"
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                {joinRequests.length > 0 ? (
                  <div className="space-y-4">
                    {joinRequests.map((request) => (
                      <div key={request.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarFallback>
                              {request.profiles.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <span className="font-medium">{request.profiles.name}</span>
                            <p className="text-sm text-muted-foreground">{request.profiles.college}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex flex-wrap gap-1">
                            {request.profiles.skills?.slice(0, 3).map((skill, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                          <Button 
                            size="sm" 
                            onClick={() => handleJoinRequest(request.id, 'accept')}
                          >
                            <Check className="w-4 h-4 mr-1" />
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
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <UserPlus className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No pending join requests</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default TeamDetail;