import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { TeamSection } from "@/components/TeamSection";
import { SkillCard } from "@/components/SkillCard";
import { AnimatedBackground } from "@/components/AnimatedBackground";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, TrendingUp, Users, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  // Mock featured skills data
  const featuredSkills = [
    {
      id: "1",
      title: "Learn Web Development & Teach Guitar",
      description: "Professional guitarist looking to transition into web development. I can teach guitar (acoustic/electric) in exchange for React/JavaScript mentoring.",
      skillsGiven: ["Guitar", "Music Theory", "Recording"],
      skillsWanted: ["React", "JavaScript", "Node.js"],
      user: {
        name: "Sarah Williams",
        level: 4,
        rating: 4.8,
        location: "San Francisco, CA"
      },
      tags: ["Music", "Programming", "Creative"],
      postedAt: "2 days ago"
    },
    {
      id: "2",
      title: "Photography Skills for Cooking Lessons",
      description: "Professional photographer offering photo editing, composition, and lighting workshops. Looking to learn authentic Italian cooking.",
      skillsGiven: ["Photography", "Photo Editing", "Lightroom"],
      skillsWanted: ["Cooking", "Baking", "Italian Cuisine"],
      user: {
        name: "Marcus Chen",
        level: 6,
        rating: 4.9,
        location: "New York, NY"
      },
      tags: ["Photography", "Food", "Art"],
      postedAt: "1 week ago"
    }
  ];

  const features = [
    {
      icon: Users,
      title: "Connect & Learn",
      description: "Find passionate teachers and eager learners in your area or online"
    },
    {
      icon: Star,
      title: "Skill Exchange",
      description: "Trade your expertise for knowledge you want to gain"
    },
    {
      icon: TrendingUp,
      title: "Level Up",
      description: "Earn XP, unlock badges, and track your learning journey"
    }
  ];
  const navigate = useNavigate();
  return (
    <AnimatedBackground variant="hero">
      <Header />

      <main>
        {/* Hero Section */}
        <Hero />

        {/* Team Section */}
        <TeamSection />

        {/* Features Section */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                How <span className="gradient-text">SkillSwap</span> Works
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Our platform makes it easy to connect, learn, and grow together
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <Card key={index} className="p-8 text-center hover:shadow-elegant transition-all duration-300 hover:-translate-y-1">
                    <div className="w-16 h-16 bg-gradient-to-br from-primary/10 to-info/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                      <Icon size={32} className="text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold mb-4">{feature.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* Featured Skills Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-12">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  Featured <span className="gradient-text">Skills</span>
                </h2>
                <p className="text-xl text-muted-foreground">
                  Discover amazing learning opportunities from our community
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {featuredSkills.map(skill => (
                <SkillCard key={skill.id} skill={skill} />
              ))}
            </div>

            <div className="text-center">
              <Button
                size="lg"
                className="btn-hero"
                onClick={() => window.location.href = "/discover"}
              >
                Explore All Skills
                <ArrowRight size={20} className="ml-2" />
              </Button>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-br from-primary/5 via-info/5 to-warning/5">
          <div className="container mx-auto px-4 text-center">
            <div className="max-w-3xl mx-auto space-y-8">
              <Badge className="bg-gradient-to-r from-primary/10 to-info/10 text-gray-50 border-primary/20 px-4 py-2">
                🌟 Ready to Start Learning?
              </Badge>

              <h2 className="text-3xl md:text-5xl font-bold leading-tight">
                Your Journey of <span className="gradient-warm-text">Growth</span> <br />
                Starts Here
              </h2>

              <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Join thousands of learners and teachers who are already sharing knowledge
                and building connections through SkillSwap.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  className="btn-hero"
                  onClick={() => navigate("/home")}
                >
                  Start Learning Today
                </Button>

                <Button
                  size="lg"
                  variant="outline"
                  className="border-primary/20 text-primary hover:bg-primary hover:text-primary-foreground"
                  onClick={() => navigate("/discover")}
                >
                  Share Your Skills
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
    </AnimatedBackground>
  );
};

export default Index;
