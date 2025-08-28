import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Target, Plus, X } from "lucide-react";
import SkillMatcher from "@/components/SkillMatcher";

const Recommendations = () => {
  const [userSkills, setUserSkills] = useState<string[]>(['React', 'Node.js', 'Python']);
  const [newSkill, setNewSkill] = useState('');

  const addSkill = () => {
    if (newSkill.trim() && !userSkills.includes(newSkill.trim())) {
      setUserSkills([...userSkills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setUserSkills(userSkills.filter(skill => skill !== skillToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      addSkill();
    }
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
            <Target className="w-8 h-8" />
            Smart Recommendations
          </h1>
          <p className="text-muted-foreground">
            Find teams and developers that match your skills and interests
          </p>
        </div>

        {/* Skills Configuration */}
        <Card>
          <CardHeader>
            <CardTitle>Your Skills</CardTitle>
            <CardDescription>
              Add your skills to get personalized team and developer recommendations
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <div className="flex-1">
                <Label htmlFor="skill">Add a skill</Label>
                <Input
                  id="skill"
                  placeholder="e.g., React, Python, UI/UX Design"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyPress={handleKeyPress}
                />
              </div>
              <Button onClick={addSkill} disabled={!newSkill.trim()} className="mt-6">
                <Plus className="w-4 h-4 mr-2" />
                Add
              </Button>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {userSkills.map((skill, index) => (
                <Badge key={index} variant="secondary" className="pr-1">
                  {skill}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-1 ml-2 hover:bg-destructive hover:text-destructive-foreground"
                    onClick={() => removeSkill(skill)}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recommendations */}
        <SkillMatcher 
          userSkills={userSkills}
          showTeamRecommendations={true}
          showDeveloperRecommendations={true}
        />
      </div>
    </div>
  );
};

export default Recommendations;