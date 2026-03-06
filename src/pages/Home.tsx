import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Header } from "@/components/Header";
import { AnimatedBackground } from "@/components/AnimatedBackground";
import { SkillSwapRequestDialog } from "@/components/SkillSwapRequestDialog";
import {
  Plus,
  BookOpen,
} from "lucide-react";
import { type SkillPost } from "@/data/mockData";
import { Link } from "react-router-dom";
import axios from "axios";
import { SkillCard } from "@/components/SkillCard";
import { toast } from "sonner";

const baseURL = import.meta.env.VITE_BASE_URL;
interface post {
  _id: string;
  skillOffered: string;
  skillWanted: string;
  userA: {
    _id: string;
    name: string;
  };
  userB: {
    _id: string;
    name: string;
  };
  status: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
  completedAt: string;
}
interface Achivement {
  _id: string;
  title: string;
  description: string;
  skillOffered: string;
  skillWanted: string;
  user: {
    id: string;
    name: string;
    avatar?: string;
    level: number;
    rating: number;
    location: string;
  };
  createdAt: string;
  updatedAt: string;
}
const Home = () => {
  const [skillPosts, setSkillPosts] = useState<post[]>([]);
  const [newNote, setNewNote] = useState("");
  const [notes, setNotes] = useState<{ _id: string; title: string }[]>([]);
  const [selectedPost, setSelectedPost] = useState<SkillPost | null>(null);
  const [isRequestDialogOpen, setIsRequestDialogOpen] = useState(false);
  const [achivements, setAchievements] = useState<Achivement[]>([]);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchdata = async () => {
      try {
        const res = await axios.get(`${baseURL}/api/notes`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        // keep full objects (_id, title)
        setNotes(res.data);
      } catch (error) {
        console.error("Error fetching notes:", error);
      }
    };
    fetchdata();
  }, [token]);

  useEffect(() => {
    const FetchSwap = async () =>{
      const res = await axios.get(`${baseURL}/api/skillswaps/history`,{
        headers : { Authorization: `Bearer ${token}` }
      });
      setSkillPosts(res.data);
     
    }
    const FetchAchievements = async () => {
      try {
        const response = await axios.get(`${baseURL}/api/post/achievement`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        // Ensure response.data is an array of SkillPost objects
        setAchievements(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        console.error("Error fetching achievements:", error);
      }
    };
    FetchAchievements();
    FetchSwap();
  }, []);
  const handleAddNote = async () => {
    if (!newNote.trim()) return;
    try {
      const response = await axios.post(
        `${baseURL}/api/notes`,
        { title: newNote },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // append returned note object
      setNotes([...notes, response.data]);
      setNewNote("");
    } catch (error) {
      console.error("Error adding note:", error);
    }
  };

  const handleRemoveNote = async (id: string) => {
    try {
      await axios.delete(`${baseURL}/api/notes/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotes(notes.filter((note) => note._id !== id));
    } catch (error) {
      console.error("Error removing note:", error);
    }
  };

  const handleConnectClick = async (toUserId) => {
   try {
      await axios.post(
        `${baseURL}/api/connections/request/${toUserId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast("Friend Request Sent.");
    } catch {
      toast("Failed to send friend request");
    }
  };

  return (
    <AnimatedBackground>
      <Header />

      <main className="container mx-auto px-4 py-8 flex justify-center">
        <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Notes */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen size={20} />
                  My Notes
                </CardTitle>
                <CardDescription>
                  Keep track of your learning goals and reminders
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Add Note */}
                <div className="flex gap-2">
                  <Textarea
                    placeholder="Add a note..."
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleAddNote();
                      }
                    }}
                    className="flex-1 min-h-[80px] resize-none"
                  />
                  <Button
                    type="button"
                    onClick={handleAddNote}
                    className="self-end shrink-0"
                  >
                    <Plus size={16} />
                  </Button>
                </div>

                {/* Show Notes */}
                <div className="space-y-2">
                  {notes.map((note) => (
                    <div
                      key={note._id}
                      className="flex items-start justify-between bg-muted/50 p-3 rounded-lg"
                    >
                      <p className="text-sm flex-1">{note.title}</p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveNote(note._id)}
                        className="text-muted-foreground hover:text-destructive ml-2 p-1 h-auto"
                      >
                        ×
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Skill Swap Feed */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Skill Swaps</CardTitle>
                <CardDescription>
                  Last completed Swaps
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {skillPosts.length === 0 ? (
                  <p className="text-sm text-muted-foreground"> No recent skill swaps available.</p>
                ) : (
                  <div className="space-y-6">
                    {skillPosts.map((post)=>(
                      <div key={post._id} className="p-4 border rounded-lg">
                        <div className="font-bold">{post.skillOffered} for {post.skillWanted}</div>
                        <div>With {post.userA._id === localStorage.getItem('userId') ? post.userB.name : post.userA.name} </div>
                      </div>
                    ))}
                    </div>
                )}

                <div className="text-center pt-4">
                  <Button asChild variant="outline">
                    <Link to="/discover">View More Posts</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        <div className="space-y-6 col-span-1">
                <div className="font-bold text-xl">Recent Postes</div>
        {
          achivements.map((achivement) =>(
            <div key={achivement._id} className="p-4 rounded-lg m-4">
              <SkillCard 
                skill={{
                  id: achivement._id,
                  title: achivement.title,
                  description: achivement.description,
                  skillsGiven: [],
                  skillsWanted: [],
                  user: achivement.user,
                  tags: [], // Add an empty array or populate as needed
                  postedAt: new Date(achivement.createdAt).toLocaleDateString(),
                }}
                buttonLabel="connect"
                showMatch={false}
                onConnect={() => handleConnectClick(achivement.user.id)}
                buttonshow={false}
              />
            </div>
          ))
        }
        </div>
        </div>
      </main>
            
      {/* Skill Swap Request Dialog */}
      {selectedPost && (
        <SkillSwapRequestDialog
          isOpen={isRequestDialogOpen}
          onOpenChange={setIsRequestDialogOpen}
          targetUserName={selectedPost.user.name}
          targetUserSkills={[selectedPost.skillOffered]}
          requestedSkill={selectedPost.skillWanted}
          targetUserId={""}
        />
      )}
    </AnimatedBackground>
  );
};

export default Home;
