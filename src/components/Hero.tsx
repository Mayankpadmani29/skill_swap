import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Search, Plus, Users, Zap, Star, Award, TrendingUp, ArrowRight, RotateCcw } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { toast } from "@/hooks/use-toast";

export const Hero = () => {
  const navigate = useNavigate();
  const [currentSwaps, setCurrentSwaps] = useState(3);
  const [hoveredSkill, setHoveredSkill] = useState<string | null>(null);

  // Simulate live counter updates
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSwaps(prev => Math.max(1, Math.min(8, prev + (Math.random() > 0.6 ? 1 : -1))));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const skillExchanges = [
    { 
      id: 1, 
      from: "React", 
      to: "Guitar", 
      icon: "⚛️", 
      swapIcon: "🎸",
      color: "from-blue-500/20 to-purple-500/20",
      position: { x: "20%", y: "30%" }
    },
    { 
      id: 2, 
      from: "Design", 
      to: "French", 
      icon: "🎨", 
      swapIcon: "🇫🇷",
      color: "from-pink-500/20 to-orange-500/20",
      position: { x: "75%", y: "25%" }
    },
    { 
      id: 3, 
      from: "Python", 
      to: "Cooking", 
      icon: "🐍", 
      swapIcon: "👨‍🍳",
      color: "from-green-500/20 to-yellow-500/20",
      position: { x: "15%", y: "65%" }
    },
    { 
      id: 4, 
      from: "Photography", 
      to: "Piano", 
      icon: "📸", 
      swapIcon: "🎹",
      color: "from-purple-500/20 to-blue-500/20",
      position: { x: "80%", y: "70%" }
    },
  ];

  const communityAvatars = [
    { name: "Sarah", avatar: "/Sarah.jpg", initials: "SW" },
    { name: "Marcus", avatar: "/Marcus.jpg", initials: "MC" },
    { name: "Emma", avatar: "/Emma.jpg", initials: "ER" },
    { name: "Alex", avatar: "/Alex.jpg", initials: "AJ" },
    { name: "Priya", avatar: "/Priya.jpg", initials: "PP" },
  ];

  const gamificationElements = [
    { type: "XP", value: 1250, max: 1500, color: "text-primary" },
    { type: "Level", value: 4, color: "text-info" },
    { type: "Badges", value: 12, color: "text-warning" },
  ];

  // Handler functions for interactive elements
  const handleSkillExchangeClick = (exchange: any) => {
    toast({
      title: "Skill Exchange",
      description: `Learn more about ${exchange.from} ↔ ${exchange.to} swap!`,
    });
    navigate("/discover");
  };

  const handleCommunityClick = () => {
    toast({
      title: "Active Community",
      description: "Join our vibrant community of learners!",
    });
    navigate("/discover");
  };

  const handleLiveSwapClick = () => {
    toast({
      title: "Live Activity",
      description: "See what skills are being swapped right now!",
    });
    navigate("/discover");
  };

  const handleGamificationClick = (element: any) => {
    if (element.type === "XP") {
      toast({
        title: "Experience Points",
        description: `You have ${element.value}/${element.max} XP. Keep learning to level up!`,
      });
    } else if (element.type === "Level") {
      toast({
        title: "Current Level",
        description: `You're at Level ${element.value}. Complete more swaps to advance!`,
      });
    } else if (element.type === "Badges") {
      toast({
        title: "Achievement Badges",
        description: `You've earned ${element.value} badges. View your collection!`,
      });
      navigate("/profile");
    }
  };

  const handleBadgeClick = (badgeName: string) => {
    toast({
      title: "Achievement Badge",
      description: `Learn how to unlock the "${badgeName}" badge!`,
    });
    navigate("/profile");
  };

  const handleStatClick = (stat: any) => {
    toast({
      title: stat.label,
      description: `Current: ${stat.value} (${stat.trend} this month)`,
    });
    navigate("/discover");
  };

  return (
    <section className="relative overflow-hidden py-24 md:py-32 lg:py-40 min-h-screen flex items-center">
      {/* 3D Visual Background with Skill Exchange Animation */}
      <div className="absolute inset-0 pointer-events-none">
        {skillExchanges.map((exchange, index) => (
          <motion.div
            key={exchange.id}
            className="absolute pointer-events-auto"
            style={{ 
              left: exchange.position.x, 
              top: exchange.position.y,
              zIndex: 1
            }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ 
              duration: 0.8, 
              delay: index * 0.2,
              repeat: Infinity,
              repeatType: "reverse",
              repeatDelay: 3
            }}
          >
            <div 
              className={`relative w-24 h-24 rounded-full bg-gradient-to-br ${exchange.color} backdrop-blur-sm border border-white/20 flex items-center justify-center cursor-pointer group`}
              onMouseEnter={() => setHoveredSkill(exchange.id.toString())}
              onMouseLeave={() => setHoveredSkill(null)}
              onClick={() => handleSkillExchangeClick(exchange)}
            >
              <motion.div
                className="text-2xl"
                animate={{ 
                  rotateY: hoveredSkill === exchange.id.toString() ? 180 : 0 
                }}
                transition={{ duration: 0.6 }}
              >
                {hoveredSkill === exchange.id.toString() ? exchange.swapIcon : exchange.icon}
              </motion.div>
              
              {/* Floating exchange indicator */}
              <motion.div
                className="absolute -top-2 -right-2 w-6 h-6 bg-primary/90 text-white rounded-full flex items-center justify-center text-xs"
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                <RotateCcw size={12} />
              </motion.div>

              {/* Connection lines */}
              <motion.div
                className="absolute inset-0 rounded-full border-2 border-primary/30"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </div>
          </motion.div>
        ))}
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-6xl mx-auto">
          {/* Social Proof & Live Activity */}
          <motion.div
            className="flex flex-col sm:flex-row items-center justify-between mb-8 text-sm text-muted-foreground"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-2 mb-4 sm:mb-0">
              <div 
                className="flex -space-x-2 cursor-pointer hover:scale-105 transition-transform"
                onClick={handleCommunityClick}
              >
                {communityAvatars.map((user, index) => (
                  <Avatar key={index} className="w-8 h-8 border-2 border-background hover:scale-110 transition-transform">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback className="bg-gradient-to-br from-primary to-info text-primary-foreground text-xs">
                      {user.initials}
                    </AvatarFallback>
                  </Avatar>
                ))}
              </div>
              <span className="text-xs cursor-pointer hover:text-primary transition-colors" onClick={handleCommunityClick}>+1,234 active learners</span>
            </div>
            
            <motion.div 
              className="flex items-center gap-2 bg-green-500/10 text-green-600 px-3 py-1 rounded-full cursor-pointer hover:bg-green-500/20 transition-colors"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              onClick={handleLiveSwapClick}
            >
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-xs font-medium">{currentSwaps} swaps happening now</span>
            </motion.div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Column - Content */}
            <div className="space-y-8">
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <Badge className="bg-gradient-to-r from-primary/10 to-info/10 text-gray-50 border-primary/20 px-6 py-3">
                  🚀 Join 2,847+ Skill Swappers
                </Badge>
              </motion.div>

              {/* Main heading */}
              <motion.div 
                className="space-y-6"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight">
                  Swap <span className="gradient-text">Skills</span>,<br />
                  Level <span className="gradient-warm-text">Up</span>
                </h1>
                <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed">
                  Trade your expertise, earn XP, unlock badges, and grow together with a community of passionate learners.
                </p>
              </motion.div>

              {/* Gamification Teaser */}
              

              {/* Split CTAs */}
              <motion.div 
                className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
              >
                <Button 
                  asChild
                  size="lg" 
                  className="btn-hero group px-6 py-4 text-lg h-auto"
                >
                  <Link to="/post" className="flex flex-col items-center gap-2">
                    <div className="flex items-center gap-2">
                      <Plus size={20} className="group-hover:scale-110 transition-transform" />
                      <span>Post My Skill</span>
                    </div>
                    <span className="text-xs opacity-80">Share & Teach Others</span>
                  </Link>
                </Button>
                <Button 
                  asChild
                  size="lg" 
                  variant="outline" 
                  className="border-primary/20 text-primary hover:bg-primary hover:text-primary-foreground px-6 py-4 text-lg h-auto group"
                >
                  <Link to="/discover" className="flex flex-col items-center gap-2">
                    <div className="flex items-center gap-2">
                      <Search size={20} className="group-hover:scale-110 transition-transform" />
                      <span>Find a Skill</span>
                    </div>
                    <span className="text-xs opacity-80">Learn & Grow</span>
                  </Link>
                </Button>
              </motion.div>
            </div>

            {/* Right Column - Micro Onboarding */}
            <motion.div 
              className="space-y-8"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
            >
              {/* Micro Onboarding Steps */}
              <div className="bg-card/30 backdrop-blur border border-border/50 rounded-3xl p-8">
                <h3 className="text-2xl font-bold mb-8 text-center">How It Works</h3>
                <div className="space-y-6">
                  {[
                    { 
                      step: 1, 
                      title: "Share Your Skills", 
                      desc: "Post what you can teach",
                      icon: "📚",
                      color: "from-primary/20 to-blue-500/20"
                    },
                    { 
                      step: 2, 
                      title: "Find Your Match", 
                      desc: "Connect with complementary skills",
                      icon: "🤝",
                      color: "from-info/20 to-purple-500/20"
                    },
                    { 
                      step: 3, 
                      title: "Level Up Together", 
                      desc: "Exchange knowledge & earn rewards",
                      icon: "🚀",
                      color: "from-success/20 to-green-500/20"
                    }
                  ].map((step, index) => (
                    <motion.div 
                      key={step.step}
                      className="flex items-center gap-4 p-4 rounded-2xl hover:bg-white/5 transition-colors"
                      initial={{ opacity: 0, x: 30 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.6}}
                      whileHover={{ scale: 1.02 }}
                    >
                      <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center text-2xl`}>
                        {step.icon}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-lg">{step.title}</h4>
                        <p className="text-muted-foreground text-sm">{step.desc}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Achievement Preview */}
              <motion.div
                className="bg-gradient-to-br from-warning/10 to-orange-500/10 border border-warning/20 rounded-2xl p-6"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1.2 }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <Star className="text-warning" size={24} />
                  <span className="font-semibold">Unlock Achievements</span>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {["First Swap", "Quick Learner", "Skill Master"].map((badge, index) => (
                    <div 
                      key={index} 
                      className="text-center cursor-pointer hover:scale-105 transition-transform"
                      onClick={() => handleBadgeClick(badge)}
                    >
                      <div className="w-12 h-12 bg-gradient-to-br from-warning/20 to-orange-500/20 rounded-xl flex items-center justify-center mx-auto mb-2 hover:from-warning/30 hover:to-orange-500/30 transition-colors">
                        <Award size={20} className="text-warning" />
                      </div>
                      <div className="text-xs font-medium">{badge}</div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          </div>

          {/* Stats Section */}
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-20"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.4 }}
          >
            {[
              { label: "Skills Exchanged", value: "2,847", icon: Zap, trend: "+23%" },
              { label: "Active Community", value: "1,234", icon: Users, trend: "+15%" },
              { label: "Success Rate", value: "94%", icon: TrendingUp, trend: "+5%" },
            ].map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div 
                  key={index} 
                  className="text-center space-y-3 group cursor-pointer"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 1.4 + (index * 0.1) }}
                  whileHover={{ scale: 1.05 }}
                  onClick={() => handleStatClick(stat)}
                >
                  <div className="mx-auto w-16 h-16 bg-gradient-to-br from-primary/10 to-info/10 rounded-2xl flex items-center justify-center mb-4 group-hover:shadow-lg transition-all duration-300 group-hover:from-primary/20 group-hover:to-info/20">
                    <Icon size={28} className="text-primary" />
                  </div>
                  <div className="text-4xl md:text-5xl font-bold text-foreground">
                    {stat.value}
                  </div>
                  <div className="text-lg text-muted-foreground">
                    {stat.label}
                  </div>
                  <div className="text-sm text-success font-medium">
                    {stat.trend} this month
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </div>
    </section>
  );
};