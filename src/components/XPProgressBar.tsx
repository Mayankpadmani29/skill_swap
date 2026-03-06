import { Badge } from "./ui/badge";

interface XPProgressBarProps {
  currentXP: number;
  level: number;
  className?: string;
}

export const XPProgressBar = ({ currentXP, level, className = "" }: XPProgressBarProps) => {
  const xpForCurrentLevel = (level - 1) * 100;
  const xpForNextLevel = level * 100;
  const progressInCurrentLevel = currentXP - xpForCurrentLevel;
  const xpNeededForCurrentLevel = xpForNextLevel - xpForCurrentLevel;
  const progressPercentage = (progressInCurrentLevel / xpNeededForCurrentLevel) * 100;

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center justify-between">
        <Badge className="bg-gradient-to-r from-xp-primary to-xp-secondary text-white">
          Level {level}
        </Badge>
        <span className="text-xs text-muted-foreground">
          {progressInCurrentLevel}/{xpNeededForCurrentLevel} XP
        </span>
      </div>
      
      <div className="xp-bar">
        <div 
          className="xp-fill" 
          style={{ width: `${Math.min(progressPercentage, 100)}%` }}
        />
      </div>
      
      <div className="text-xs text-muted-foreground text-center">
        {xpForNextLevel - currentXP} XP until Level {level + 1}
      </div>
    </div>
  );
};