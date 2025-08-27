import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, X } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const CreateProfileForm = () => {
  const [name, setName] = useState("");
  const [college, setCollege] = useState("");
  const [gender, setGender] = useState("");
  const [yearOfStudy, setYearOfStudy] = useState("");
  const [branch, setBranch] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const addSkill = () => {
    if (skillInput.trim() && !skills.includes(skillInput.trim())) {
      setSkills([...skills, skillInput.trim()]);
      setSkillInput("");
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setSkills(skills.filter(skill => skill !== skillToRemove));
  };

  const handleWhatsappChange = (value: string) => {
    const numbersOnly = value.replace(/[^0-9]/g, '');
    if (numbersOnly.length <= 10) {
      setWhatsappNumber(numbersOnly);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    // Validate WhatsApp number if provided
    if (whatsappNumber && whatsappNumber.length !== 10) {
      toast({
        title: "Error",
        description: "WhatsApp number must be exactly 10 digits",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const profileData = {
        name,
        college,
        gender: gender || null,
        year_of_study: yearOfStudy ? parseInt(yearOfStudy) : null,
        branch: branch || null,
        whatsapp_number: whatsappNumber || null,
        linkedin_url: linkedinUrl || null,
        github_url: githubUrl || null,
        skills
      };

      const { error } = await supabase
        .from('profiles')
        .insert([profileData]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Profile created successfully!",
      });
      navigate('/profiles');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create profile",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Create Developer Profile
            </CardTitle>
            <CardDescription>
              Showcase your skills and find team opportunities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="college">College/University</Label>
                <Input
                  id="college"
                  value={college}
                  onChange={(e) => setCollege(e.target.value)}
                  placeholder="Enter your college or university"
                />
              </div>

              <div>
                <Label htmlFor="gender">Gender</Label>
                <Select value={gender} onValueChange={setGender}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                    <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="year">Year of Study</Label>
                <Select value={yearOfStudy} onValueChange={setYearOfStudy}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select year" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1st Year</SelectItem>
                    <SelectItem value="2">2nd Year</SelectItem>
                    <SelectItem value="3">3rd Year</SelectItem>
                    <SelectItem value="4">4th Year</SelectItem>
                    <SelectItem value="5">5th Year</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="branch">Branch/Department</Label>
                <Input
                  id="branch"
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  placeholder="e.g., Computer Science Engineering"
                />
              </div>

              <div>
                <Label htmlFor="whatsapp">WhatsApp Number</Label>
                <div className="flex">
                  <div className="flex items-center bg-muted px-3 rounded-l-md border border-r-0">
                    <span className="text-sm text-muted-foreground">+91</span>
                  </div>
                  <Input
                    id="whatsapp"
                    value={whatsappNumber}
                    onChange={(e) => handleWhatsappChange(e.target.value)}
                    placeholder="1234567890"
                    className="rounded-l-none"
                    maxLength={10}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  10 digits only, no special characters
                </p>
              </div>

              <div>
                <Label htmlFor="linkedin">LinkedIn Profile URL</Label>
                <Input
                  id="linkedin"
                  value={linkedinUrl}
                  onChange={(e) => setLinkedinUrl(e.target.value)}
                  placeholder="https://linkedin.com/in/username"
                />
              </div>

              <div>
                <Label htmlFor="github">GitHub Profile URL</Label>
                <Input
                  id="github"
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                  placeholder="https://github.com/username"
                />
              </div>
              
              <div>
                <Label htmlFor="skills">Skills</Label>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Input
                      id="skills"
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      placeholder="Add a skill (e.g., React, Python, UI/UX)"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                    />
                    <Button type="button" onClick={addSkill} size="sm">
                      Add
                    </Button>
                  </div>
                  
                  {skills.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {skills.map((skill, index) => (
                        <Badge key={index} variant="outline" className="flex items-center gap-1">
                          {skill}
                          <X 
                            className="w-3 h-3 cursor-pointer" 
                            onClick={() => removeSkill(skill)}
                          />
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button 
                  type="submit" 
                  disabled={loading || !name}
                  className="flex-1"
                >
                  {loading ? "Creating..." : "Create Profile"}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => navigate('/profiles')}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CreateProfileForm;