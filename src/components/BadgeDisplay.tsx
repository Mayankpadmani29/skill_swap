import { Badge } from "./ui/badge";
import { Award, Users, BookOpen, Zap, Star } from "lucide-react";

interface BadgeDisplayProps {
  badges: string[];
  className?: string;
  showIcons?: boolean;
}

const badgeConfig = {
  "First Swap": {
    icon: Award,
    color: "badge-bronze",
    description: "Completed your first skill trade"
  },
  "Helper": {
    icon: Users,
    color: "badge-silver", 
    description: "Helped 5 different people"
  },
  "Master Mentor": {
    icon: BookOpen,
    color: "badge-gold",
    description: "Taught 10 skills to others"
  },
  "Fast Learner": {
    icon: Zap,
    color: "badge-bronze",
    description: "Learned 5 skills in under a month"
  },
  "Popular": {
    icon: Star,
    color: "badge-gold",
    description: "Had 10+ people message about your skills"
  }
};

export const BadgeDisplay = ({ badges, className = "", showIcons = true }: BadgeDisplayProps) => {
  if (badges.length === 0) {
    return (
      <div className={`text-center py-4 ${className}`}>
        <p className="text-muted-foreground text-sm">No badges earned yet</p>
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex flex-wrap gap-2">
        {badges.map((badgeName, index) => {
          const config = badgeConfig[badgeName as keyof typeof badgeConfig];
          if (!config) return null;
          
          const Icon = config.icon;
          
          return (
            <div 
              key={index} 
              className="group relative"
              title={config.description}
            >
              <Badge className={`${config.color} flex items-center space-x-1 cursor-help transition-transform hover:scale-105`}>
                {showIcons && <Icon size={14} />}
                <span>{badgeName}</span>
              </Badge>
              
              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-popover text-popover-foreground text-xs rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
                {config.description}
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-popover"></div>
              </div>
            </div>
          );
        })}
      </div>
      
      <p className="text-xs text-muted-foreground">
        {badges.length} badge{badges.length !== 1 ? 's' : ''} earned
      </p>
    </div>
  );
};