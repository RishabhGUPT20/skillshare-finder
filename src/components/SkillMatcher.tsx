import { useState, useEffect } from "react";
import { Target, Users, Star, TrendingUp } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";

interface SkillMatch {
  team: {
    id: string;
    name: string;
    required_skills: string[];
    events: {
      name: string;
      date: string;
    };
    team_members: Array<{
      profiles: {
        name: string;
      };
    }>;
  };
  matchPercentage: number;
  matchingSkills: string[];
  missingSkills: string[];
}

interface RecommendedProfile {
  id: string;
  name: string;
  skills: string[];
  college: string;
  matchPercentage: number;
  commonSkills: string[];
}

interface SkillMatcherProps {
  userSkills?: string[];
  showTeamRecommendations?: boolean;
  showDeveloperRecommendations?: boolean;
}

const SkillMatcher = ({ 
  userSkills = ['React', 'Node.js', 'Python'], 
  showTeamRecommendations = true,
  showDeveloperRecommendations = true 
}: SkillMatcherProps) => {
  const [teamMatches, setTeamMatches] = useState<SkillMatch[]>([]);
  const [developerMatches, setDeveloperMatches] = useState<RecommendedProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecommendations();
  }, [userSkills]);

  const fetchRecommendations = async () => {
    try {
      if (showTeamRecommendations) {
        const { data: teams, error: teamsError } = await supabase
          .from('teams')
          .select(`
            id,
            name,
            required_skills,
            events(name, date),
            team_members(profiles(name))
          `)
          .limit(10);

        if (teamsError) throw teamsError;

        // Calculate skill matches for teams
        const matches: SkillMatch[] = (teams || [])
          .map(team => {
            const requiredSkills = team.required_skills || [];
            const matchingSkills = requiredSkills.filter(skill => 
              userSkills.some(userSkill => 
                userSkill.toLowerCase() === skill.toLowerCase()
              )
            );
            const missingSkills = requiredSkills.filter(skill => 
              !userSkills.some(userSkill => 
                userSkill.toLowerCase() === skill.toLowerCase()
              )
            );
            const matchPercentage = requiredSkills.length > 0 
              ? Math.round((matchingSkills.length / requiredSkills.length) * 100)
              : 0;

            return {
              team,
              matchPercentage,
              matchingSkills,
              missingSkills
            };
          })
          .filter(match => match.matchPercentage > 30)
          .sort((a, b) => b.matchPercentage - a.matchPercentage)
          .slice(0, 5);

        setTeamMatches(matches);
      }

      if (showDeveloperRecommendations) {
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('id, name, skills, college')
          .limit(20);

        if (profilesError) throw profilesError;

        // Calculate skill matches for developers
        const devMatches: RecommendedProfile[] = (profiles || [])
          .map(profile => {
            const profileSkills = profile.skills || [];
            const commonSkills = profileSkills.filter(skill => 
              userSkills.some(userSkill => 
                userSkill.toLowerCase() === skill.toLowerCase()
              )
            );
            const totalUniqueSkills = new Set([...userSkills, ...profileSkills]).size;
            const matchPercentage = totalUniqueSkills > 0 
              ? Math.round((commonSkills.length / Math.min(userSkills.length, profileSkills.length)) * 100)
              : 0;

            return {
              ...profile,
              matchPercentage,
              commonSkills
            };
          })
          .filter(match => match.matchPercentage > 40 && match.commonSkills.length > 0)
          .sort((a, b) => b.matchPercentage - a.matchPercentage)
          .slice(0, 5);

        setDeveloperMatches(devMatches);
      }
    } catch (error) {
      console.error('Failed to fetch recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-muted rounded w-48"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 bg-muted rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Your Skills Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="w-5 h-5" />
            Your Skills
          </CardTitle>
          <CardDescription>Skills used for recommendations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {userSkills.map((skill, index) => (
              <Badge key={index} variant="default">
                {skill}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Team Recommendations */}
      {showTeamRecommendations && teamMatches.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Recommended Teams
            </CardTitle>
            <CardDescription>Teams looking for your skills</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {teamMatches.map((match) => (
                <div key={match.team.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-medium">{match.team.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {match.team.events?.name} • {match.team.team_members?.length || 0} members
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-2 mb-1">
                        <TrendingUp className="w-4 h-4 text-primary" />
                        <span className="text-sm font-medium">{match.matchPercentage}% match</span>
                      </div>
                      <Progress value={match.matchPercentage} className="w-24 h-2" />
                    </div>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    {match.matchingSkills.length > 0 && (
                      <div>
                        <span className="text-sm font-medium text-green-600">Matching skills: </span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {match.matchingSkills.map((skill, index) => (
                            <Badge key={index} variant="secondary" className="text-xs bg-green-100 text-green-800">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {match.missingSkills.length > 0 && (
                      <div>
                        <span className="text-sm font-medium text-amber-600">Still needed: </span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {match.missingSkills.map((skill, index) => (
                            <Badge key={index} variant="outline" className="text-xs border-amber-200 text-amber-700">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <Button size="sm" asChild>
                    <Link to={`/teams/${match.team.id}`}>View Team</Link>
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Developer Recommendations */}
      {showDeveloperRecommendations && developerMatches.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Recommended Developers
            </CardTitle>
            <CardDescription>Developers with similar skills</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {developerMatches.map((developer) => (
                <div key={developer.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback>
                        {developer.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{developer.name}</div>
                      <div className="text-sm text-muted-foreground">{developer.college}</div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {developer.commonSkills.slice(0, 3).map((skill, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                        {developer.commonSkills.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{developer.commonSkills.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-2 mb-1">
                      <TrendingUp className="w-4 h-4 text-primary" />
                      <span className="text-sm font-medium">{developer.matchPercentage}% match</span>
                    </div>
                    <Button size="sm" variant="outline" asChild>
                      <Link to={`/profiles/${developer.id}`}>View Profile</Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {teamMatches.length === 0 && developerMatches.length === 0 && !loading && (
        <Card>
          <CardContent className="text-center py-8">
            <Target className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-medium mb-2">No matches found</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Try updating your skills or explore more teams and developers
            </p>
            <div className="flex gap-2 justify-center">
              <Button variant="outline" asChild>
                <Link to="/teams">Browse Teams</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/profiles">Browse Developers</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SkillMatcher;