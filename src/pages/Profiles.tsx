import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { User, Search, Plus, GraduationCap, Filter, X } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Profile {
  id: string;
  name: string;
  college: string;
  gender: string;
  year_of_study: number;
  branch: string;
  whatsapp_number: string;
  linkedin_url: string;
  github_url: string;
  skills: string[];
}

const Profiles = () => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [genderFilter, setGenderFilter] = useState("");
  const [yearFilter, setYearFilter] = useState("");
  const [branchFilter, setBranchFilter] = useState("");
  const [collegeFilter, setCollegeFilter] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchProfiles();
  }, []);

  const fetchProfiles = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProfiles(data || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch profiles",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredProfiles = profiles.filter(profile => {
    const matchesSearch = profile.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      profile.college?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      profile.branch?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      profile.skills?.some(skill => 
        skill.toLowerCase().includes(searchTerm.toLowerCase())
      );
    
    const matchesGender = !genderFilter || profile.gender === genderFilter;
    const matchesYear = !yearFilter || profile.year_of_study?.toString() === yearFilter;
    const matchesBranch = !branchFilter || profile.branch?.toLowerCase().includes(branchFilter.toLowerCase());
    const matchesCollege = !collegeFilter || profile.college?.toLowerCase().includes(collegeFilter.toLowerCase());
    
    return matchesSearch && matchesGender && matchesYear && matchesBranch && matchesCollege;
  });

  const clearFilters = () => {
    setGenderFilter("");
    setYearFilter("");
    setBranchFilter("");
    setCollegeFilter("");
    setSearchTerm("");
  };

  const hasActiveFilters = genderFilter || yearFilter || branchFilter || collegeFilter;

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-48 mb-6"></div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
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
            <h1 className="text-3xl font-bold text-foreground">Developers</h1>
            <Button asChild>
              <Link to="/profiles/create">
                <Plus className="w-4 h-4 mr-2" />
                Create Profile
              </Link>
            </Button>
          </div>
          
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search by name, college, branch, or skills..."
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
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label className="text-sm font-medium">Gender</Label>
                  <Select value={genderFilter} onValueChange={setGenderFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All genders" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All genders</SelectItem>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                      <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label className="text-sm font-medium">Year of Study</Label>
                  <Select value={yearFilter} onValueChange={setYearFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All years" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All years</SelectItem>
                      <SelectItem value="1">1st Year</SelectItem>
                      <SelectItem value="2">2nd Year</SelectItem>
                      <SelectItem value="3">3rd Year</SelectItem>
                      <SelectItem value="4">4th Year</SelectItem>
                      <SelectItem value="5">5th Year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label className="text-sm font-medium">Branch</Label>
                  <Input
                    placeholder="Filter by branch..."
                    value={branchFilter}
                    onChange={(e) => setBranchFilter(e.target.value)}
                  />
                </div>
                
                <div>
                  <Label className="text-sm font-medium">College</Label>
                  <Input
                    placeholder="Filter by college..."
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

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredProfiles.map((profile) => (
            <Card key={profile.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  {profile.name}
                </CardTitle>
                <CardDescription className="space-y-1">
                  {profile.college && (
                    <div className="flex items-center gap-1">
                      <GraduationCap className="w-4 h-4" />
                      {profile.college}
                    </div>
                  )}
                  <div className="flex gap-2 text-xs">
                    {profile.gender && <Badge variant="outline">{profile.gender}</Badge>}
                    {profile.year_of_study && <Badge variant="outline">Year {profile.year_of_study}</Badge>}
                  </div>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {profile.branch && (
                    <div>
                      <p className="text-sm text-muted-foreground">Branch:</p>
                      <p className="text-sm font-medium">{profile.branch}</p>
                    </div>
                  )}
                  
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Skills:</p>
                    <div className="flex flex-wrap gap-1">
                      {profile.skills?.map((skill, index) => (
                        <Badge key={index} variant="outline">
                          {skill}
                        </Badge>
                      )) || <span className="text-muted-foreground text-sm">No skills listed</span>}
                    </div>
                  </div>
                  
                  <Button asChild size="sm" className="w-full">
                    <Link to={`/profiles/${profile.id}`}>
                      View Profile
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredProfiles.length === 0 && (
          <div className="text-center py-12">
            <User className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">
              {searchTerm ? "No developers found" : "No developers yet"}
            </h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm 
                ? "Try adjusting your search terms" 
                : "Get started by creating your first profile."}
            </p>
            {!searchTerm && (
              <Button asChild>
                <Link to="/profiles/create">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Profile
                </Link>
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profiles;