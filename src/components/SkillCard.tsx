import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { MapPin, Star, MessageSquare } from "lucide-react";
import { useNavigate } from "react-router-dom";


interface SkillCardProps {
  skill: {
    id: string;
    title: string;
    description: string;
    skillsGiven: string[];
    skillsWanted: string[];
    user: {
      id: string;
      name: string;
      level: number;
      rating: number;
      location: string;
      avatar?: string; // optional avatar
    };
    tags: string[];
    postedAt: string;
    matchScore?: number;
  };
  showMatch?: boolean;
  onConnect?: (skill: SkillCardProps['skill']) => void;
  buttonLabel?: string; // New prop for custom button text
  buttonshow?: boolean; // Add this line
}

export const SkillCard = ({
  skill,
  showMatch = false,
  onConnect,
  buttonLabel = "Connect",
  buttonshow = true, // default value
}: SkillCardProps) => {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };
  const navigate = useNavigate();
  const handleclickdiv = (url: string) => {
    navigate(`/user/${url}`);
  }
  return (
    <Card className="skill-card group cursor-pointer">
      <div  className="space-y-4">
        {/* Header with user info */}
        <div onClick={() => handleclickdiv(skill.user.id)} className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="w-10 h-10">
              {skill.user.avatar && <AvatarImage src={skill.user.avatar} alt={skill.user.name} />}
              <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-primary-foreground text-sm font-medium">
                {getInitials(skill.user.name)}
              </AvatarFallback>
            </Avatar>

            <div>
              <h4 className="font-medium text-sm">{skill.user.name}</h4>
              <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                <Badge variant="outline" className="text-xs px-2 py-0">
                  Level {skill.user.level}
                </Badge>
                <div className="flex items-center space-x-1">
                  <Star size={12} className="fill-warning text-warning" />
                  <span>{skill.user.rating}</span>
                </div>
              </div>
            </div>
          </div>

          {showMatch && skill.matchScore && (
            <Badge className="bg-gradient-to-r from-success to-info text-success-foreground">
              {skill.matchScore}% Match
            </Badge>
          )}
        </div>

        {/* Skill content */}
        <div className="space-y-3">
          <h3 className="font-semibold text-lg leading-tight group-hover:text-primary transition-colors">
            {skill.title}
          </h3>
          <p className="text-muted-foreground text-sm line-clamp-2">{skill.description}</p>
        </div>

        {/* Skills */}
        {/* Skills */}
        <div className="space-y-3">
          {/* Can Teach */}
          {skill.skillsGiven.length > 0 && (
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                Can Teach
              </p>
              <div className="flex flex-wrap gap-1">
                {skill.skillsGiven.map((skillName, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="text-xs bg-gradient-to-r from-success/10 to-success/5 text-success border-success/20"
                  >
                    {skillName}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Wants to Learn */}
          {skill.skillsWanted.length > 0 && (
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                Wants to Learn
              </p>
              <div className="flex flex-wrap gap-1">
                {skill.skillsWanted.map((skillName, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="text-xs bg-gradient-to-r from-warning/10 to-warning/5 text-warning border-warning/20"
                  >
                    {skillName}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex items-center space-x-4 text-xs text-muted-foreground">
            <div className="flex items-center space-x-1">
              <MapPin size={12} />
              <span>{skill.user.location}</span>
            </div>
            <span>{skill.postedAt}</span>
          </div>
          {buttonshow && (
            <Button
              size="sm"
              className="bg-gradient-to-r from-primary to-info hover:from-primary/90 hover:to-info/90 transition-all duration-300"
              onClick={() => onConnect?.(skill)}
            >
              <MessageSquare size={14} className="mr-1" />
              {buttonLabel} {/* use custom label */}
            </Button>)}
        </div>
      </div>
    </Card>
  );
};
