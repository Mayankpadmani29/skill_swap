import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Header } from "@/components/Header";
import { AnimatedBackground } from "@/components/AnimatedBackground";
import { Plus, X, Image, Video, Link as LinkIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";
import { set } from "date-fns";

const baseURL = import.meta.env.VITE_BASE_URL;

const Post = () => {
  const [postType, setPostType] = useState<"skill-swap" | "achievement">(
    "skill-swap"
  );
  const [skillOffered, setSkillOffered] = useState("");
  const [loading, setLoading] = useState(false);
  const [skillWanted, setSkillWanted] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [achievements, setAchievements] = useState<string[]>([]);
  const [newAchievement, setNewAchievement] = useState("");
  const { toast } = useToast();

  // Utility to decode JWT token payload (simplified)
  const decodeJwt = (token: string): any | null => {
    try {
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map(
            (c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2)
          )
          .join("")
      );
      return JSON.parse(jsonPayload);
    } catch {
      return null;
    }
  };

  const handleAddAchievement = () => {
    if (newAchievement.trim() === "") {
      toast({
        title: "Empty Tag",
        description: "Please enter a tag before adding.",
        variant: "destructive",
      });
      return;
    }
    if (achievements.includes(newAchievement.trim())) {
      toast({
        title: "Duplicate Tag",
        description: "This tag is already added.",
        variant: "destructive",
      });
      return;
    }
    setAchievements([...achievements, newAchievement.trim()]);
    setNewAchievement("");
  };

  const handleRemoveAchievement = (index: number) => {
    setAchievements(achievements.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const token = localStorage.getItem("token");
    if (!token) {
      toast({
        title: "Unauthorized",
        description: "Please login to create a post.",
        variant: "destructive",
      });
      return;
    }
    const payload = decodeJwt(token);
    if (!payload || !payload.id) {
      toast({
        title: "Invalid Token",
        description: "Could not validate user token.",
        variant: "destructive",
      });
      return;
    }

    // Validation depending on post type
    if (postType === "skill-swap") {
      if (!skillOffered || !skillWanted || !description) {
        toast({
          title: "Missing Information",
          description: "Please fill in all required fields for skill swap.",
          variant: "destructive",
        });
        return;
      }
    } else if (postType === "achievement") {
      if (!title || !description) {
        toast({
          title: "Missing Information",
          description: "Please add a title and description for your achievement.",
          variant: "destructive",
        });
        return;
      }
    }

    try {
      if (postType === "skill-swap") {
        await axios.post(
          `${baseURL}/api/post/skillswap`,
          {
            userId: payload.id,
            OfferedSkill: skillOffered,
            WantedSkill: skillWanted,
            description,
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setSkillOffered("");
        setSkillWanted("");
        setDescription("");
      } else if (postType === "achievement") {
        await axios.post(
          `${baseURL}/api/post/achievement`,
          {
            userId: payload.id,
            title,
            description,
            tags: achievements,
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setTitle("");
        setDescription("");
        setAchievements([]);
        setNewAchievement("");
        
      }

      toast({
        title: "Post Created!",
        description: "Your post has been shared with the community.",
      });

      // Reset form
      setSkillOffered("");
      setSkillWanted("");
      setTitle("");
      setDescription("");
      setAchievements([]);
      setNewAchievement("");
    } catch (error) {
      toast({
        title: "Failed to Create Post",
        description: "An error occurred while sharing your post.",
        variant: "destructive",
      });
      console.error(error);
    }
    finally {
      setLoading(false);
    }
  };

  return (
    <AnimatedBackground>
      <Header />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Create a Post</h1>
            <p className="text-muted-foreground">
              Share your skills, achievements, or find learning opportunities
            </p>
          </div>

          {/* Post Type Selection */}
          <div className="flex gap-4 mb-6">
            <Button
              type="button"
              variant={postType === "skill-swap" ? "default" : "outline"}
              onClick={() => setPostType("skill-swap")}
              className="flex-1"
            >
              Skill Swap Request
            </Button>
            <Button
              type="button"
              variant={postType === "achievement" ? "default" : "outline"}
              onClick={() => setPostType("achievement")}
              className="flex-1"
            >
              Achievement / Update
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>
                {postType === "skill-swap"
                  ? "Skill Swap Request"
                  : "Share Achievement"}
              </CardTitle>
              <CardDescription>
                {postType === "skill-swap"
                  ? "Let others know what you can offer and what you want to learn"
                  : "Share your accomplishments and updates with the community"}
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {postType === "skill-swap" ? (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="skillOffered">Skill I Can Offer *</Label>
                        <Input
                          id="skillOffered"
                          placeholder="e.g., React Development"
                          value={skillOffered}
                          onChange={(e) => setSkillOffered(e.target.value)}
                          required={postType === "skill-swap"}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="skillWanted">Skill I Want to Learn *</Label>
                        <Input
                          id="skillWanted"
                          placeholder="e.g., UI/UX Design"
                          value={skillWanted}
                          onChange={(e) => setSkillWanted(e.target.value)}
                          required={postType === "skill-swap"}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Description *</Label>
                      <Textarea
                        id="description"
                        placeholder="Tell others about your experience level, what you can teach, and what you hope to learn..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="min-h-[120px] resize-none"
                        required={postType === "skill-swap"}
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="title">Title *</Label>
                      <Input
                        id="title"
                        placeholder="e.g., Completed React Certification!"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required={postType === "achievement"}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Description *</Label>
                      <Textarea
                        id="description"
                        placeholder="Share details about your achievement, what you learned, or any updates you'd like to share..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="min-h-[120px] resize-none"
                        required={postType === "achievement"}
                      />
                    </div>

                    <div className="space-y-2">
                      

                      {achievements.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {achievements.map((achievement, index) => (
                            <Badge
                              key={index}
                              variant="secondary"
                              className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground transition-colors"
                              onClick={() => handleRemoveAchievement(index)}
                            >
                              {achievement}
                              <X className="w-3 h-3 ml-1" />
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </>
                )}


                <div className="flex gap-4 pt-4">
                  <Button
                  disabled={loading}
                  type="submit"
                  className="flex-1">
                    Share Post
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </AnimatedBackground>
  );
};

export default Post;
