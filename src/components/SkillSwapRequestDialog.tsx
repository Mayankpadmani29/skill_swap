import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Users, ArrowRightLeft } from "lucide-react";
import axios from "axios";

interface SkillSwapRequestDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  targetUserName: string;
  toPost : string;
   targetUserId: string;
  targetUserSkills: string[];
  requestedSkill: string;
}

export const SkillSwapRequestDialog = ({ 
  isOpen, 
  onOpenChange, 
  toPost,
  targetUserName, 
  targetUserId,
  targetUserSkills,
  requestedSkill 
}: SkillSwapRequestDialogProps) => {
  const [mySkillOffered, setMySkillOffered] = useState("");
  const [skillWanted, setSkillWanted] = useState(requestedSkill);
  const [message, setMessage] = useState("");
  const { toast } = useToast();
  
  // Mock user skills - in real app would come from user context
  const mySkills = [
    "React Development",
    "JavaScript",
    "TypeScript",
    "Node.js",
    "Python",
    "UI/UX Design", 
    "Digital Marketing",
    "Photography"
  ];
  const token = localStorage.getItem("token");
  const baseURL = import.meta.env.VITE_BASE_URL;
  const handleSubmitRequest = async () => {
    try {
      const response = await axios.post(
        `${baseURL}/api/request/skilswap/${toPost}`,
        {
          toPost,
          toUser: targetUserId,      // ✅ sending ID, not name
          skillOffered: mySkillOffered,
          skillWanted: skillWanted,
          message: message,
          status: "pending",        // ✅ initial status
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
        },
      }
    );
    
    toast({
      title: "Skill Swap Request Sent!",
      description: `Your request to swap ${mySkillOffered} for ${skillWanted} has been sent to ${targetUserName}.`,
    });
    
    // Reset form
    setMySkillOffered("");
    setSkillWanted(requestedSkill);
    setMessage("");
    onOpenChange(false);
  } catch (error: any) {
    toast({
      title: "Error",
      description: error.response?.data?.message || "Failed to send request",
      variant: "destructive",
    });
  }
};
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users size={20} />
            Request Skill Swap with {targetUserName}
          </DialogTitle>
          <DialogDescription>
            Propose a skill exchange where you both benefit from learning something new.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Skill Exchange Visual */}
          <div className="bg-gradient-to-r from-primary/5 to-info/5 p-4 rounded-lg">
            <div className="flex items-center justify-center gap-4">
              <div className="text-center">
                <div className="text-sm text-muted-foreground mb-1">You offer</div>
                <div className="font-semibold text-primary">{mySkillOffered || "Select your skill"}</div>
              </div>
              <ArrowRightLeft size={20} className="text-muted-foreground" />
              <div className="text-center">
                <div className="text-sm text-muted-foreground mb-1">You want</div>
                <div className="font-semibold text-info">{skillWanted || "Select desired skill"}</div>
              </div>
            </div>
          </div>

          {/* My Skill Selection */}
          <div className="space-y-2">
            <input type="text" value={mySkillOffered} onChange={(e) => setMySkillOffered(e.target.value)} list="my-skills" placeholder="Select or type a skill you can offer" className="w-full px-3 py-2 border bg-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-primary" />
            
          </div>

          {/* Wanted Skill Selection */}
          <div className="space-y-2">
            <Label htmlFor="wanted-skill">What skill do you want to learn?</Label>
            <Select value={skillWanted} onValueChange={setSkillWanted}>
              <SelectTrigger>
                <SelectValue placeholder="Select a skill you want to learn" />
              </SelectTrigger>
              <SelectContent>
                {targetUserSkills.map((skill) => (
                  <SelectItem key={skill} value={skill}>
                    {skill}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmitRequest}>
            Send Request
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};