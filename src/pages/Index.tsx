import { Link } from "react-router-dom";
import { Calendar, Users, User, Code, ArrowRight, Zap, Trophy, Target } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const Index = () => {
  const features = [
    {
      icon: Calendar,
      title: "Hackathon Events",
      description: "Discover and create hackathon events",
      link: "/events"
    },
    {
      icon: Users,
      title: "Team Formation",
      description: "Find teammates or create your own team",
      link: "/teams"
    },
    {
      icon: User,
      title: "Developer Profiles",
      description: "Browse skilled developers and showcase your skills",
      link: "/profiles"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-accent/20"></div>
        <div className="relative max-w-6xl mx-auto px-4 py-24">
          <div className="text-center">
            <Badge variant="outline" className="mb-4 px-4 py-2 text-sm font-medium border-primary/20 bg-primary/5">
              🚀 SIH 2025 is Live!
            </Badge>
            <div className="flex items-center justify-center gap-3 mb-8">
              <div className="relative">
                <Code className="w-16 h-16 text-primary drop-shadow-lg" />
                <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full"></div>
              </div>
              <h1 className="text-6xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                HackHub
              </h1>
            </div>
            <p className="text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed">
              Join India's largest hackathon platform. Connect with brilliant minds, form winning teams, and build solutions that matter.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Button asChild size="lg" className="text-lg px-8 py-6 shadow-lg hover:shadow-xl transition-all">
                <Link to="/events">
                  Explore SIH 2025
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-lg px-8 py-6">
                <Link to="/teams/create">Form Your Team</Link>
              </Button>
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">1000+</div>
                <div className="text-muted-foreground">Active Developers</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-accent mb-2">150+</div>
                <div className="text-muted-foreground">Problem Statements</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">₹1Cr+</div>
                <div className="text-muted-foreground">Prize Money</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-16">{/* Features */}

        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-4">Why Choose HackHub?</h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            Everything you need to succeed in hackathons, all in one platform
          </p>
          <div className="grid gap-8 md:grid-cols-3">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="relative overflow-hidden border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-xl group">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <CardHeader className="relative">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                    <CardDescription className="text-base">{feature.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="relative">
                    <Button asChild variant="outline" className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      <Link to={feature.link}>
                        Explore
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* SIH 2025 Highlight */}
        <div className="mb-16">
          <Card className="relative overflow-hidden border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-accent/5">
            <CardHeader>
              <div className="flex items-center gap-3 mb-4">
                <Trophy className="w-8 h-8 text-primary" />
                <div>
                  <CardTitle className="text-2xl">Smart India Hackathon 2025</CardTitle>
                  <CardDescription className="text-base">The nation's biggest innovation challenge</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Target className="w-5 h-5 text-accent" />
                      <span>1000+ problem statements across 40+ ministries</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-5 h-5 text-accent" />
                      <span>Team size: 6 members (including 1 mentor)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Zap className="w-5 h-5 text-accent" />
                      <span>₹1,00,000 prize for each winning team</span>
                    </div>
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-primary mb-2">March 2025</div>
                  <div className="text-muted-foreground mb-6">Registration Open</div>
                  <Button asChild size="lg" className="shadow-lg">
                    <Link to="/events">
                      Join SIH 2025
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-gradient-to-r from-primary/10 to-accent/10 rounded-2xl p-12">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Ready to build something amazing?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of developers, find the perfect teammates, and create innovative solutions that can change the world.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="text-lg px-8 py-6">
              <Link to="/teams/create">Create a Team</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-lg px-8 py-6">
              <Link to="/profiles/create">Create Profile</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
