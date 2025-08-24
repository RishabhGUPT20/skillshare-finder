import { Link } from "react-router-dom";
import { Calendar, Users, User, Code, ArrowRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

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
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-2 mb-6">
            <Code className="w-12 h-12 text-primary" />
            <h1 className="text-4xl font-bold text-foreground">HackHub</h1>
          </div>
          <p className="text-xl text-muted-foreground mb-8">
            The ultimate platform for hackathon team building and collaboration
          </p>
          <Button asChild size="lg">
            <Link to="/events">
              Get Started
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-3 mb-16">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Icon className="w-5 h-5 text-primary" />
                    {feature.title}
                  </CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button asChild variant="outline" className="w-full">
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

        <div className="text-center">
          <h2 className="text-2xl font-semibold text-foreground mb-4">
            Ready to build something amazing?
          </h2>
          <p className="text-muted-foreground mb-6">
            Join a team, find the perfect teammates, and create innovative solutions together.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild>
              <Link to="/teams/create">Create a Team</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/profiles/create">Create Profile</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
