import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AnimatedBackground } from "@/components/AnimatedBackground";
import { Header } from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  MapPin,
  Mail,
  Calendar,
  MessageCircle,
  UserPlus,
  ArrowLeft,
  Star,
  Trophy,
  Users
} from "lucide-react";
import axios from "axios";

// Import mock data from SearchPeople component
const baseUrl = import.meta.env.VITE_BASE_URL;
const mockUsers = [
  {
    id: "1",
    username: "alicejohnson",
    name: "Alice Johnson",
    email: "alice@example.com",
    avatar: "/avatars/alice.png",
    skills: ["React", "Node.js", "UI Design"],
    level: 5,
    location: "New York, USA",
    bio: "Passionate frontend developer with 5 years of experience. Love creating beautiful and functional user interfaces.",
    joinedDate: "2020-03-15",
    projects: 12,
    followers: 245,
    following: 89,
    badges: ["Pro Member", "Top Rated", "Verified"]
  },
  {
    id: "2",
    username: "bobsmith",
    name: "Bob Smith",
    email: "bob@example.com",
    avatar: "/avatars/bob.png",
    skills: ["Python", "Django", "Machine Learning"],
    level: 8,
    location: "London, UK",
    bio: "Full-stack developer and ML enthusiast. Building intelligent applications that solve real-world problems.",
    joinedDate: "2019-07-22",
    projects: 28,
    followers: 567,
    following: 123,
    badges: ["Machine Learning Expert", "Community Helper"]
  },
  {
    id: "3",
    username: "charlielee",
    name: "Charlie Lee",
    email: "charlie@example.com",
    avatar: "/avatars/charlie.png",
    skills: ["Unity", "C#", "3D Animation"],
    level: 10,
    location: "Tokyo, Japan",
    bio: "Game developer and 3D artist. Creating immersive gaming experiences and interactive media.",
    joinedDate: "2018-11-08",
    projects: 35,
    followers: 892,
    following: 156,
    badges: ["Game Dev Champion", "3D Artist", "Verified"]
  },
];



interface User {
  id: string;
  username: string;
  name: string;
  email: string;
  avatar?: string;
  skills?: string[];
  lvl?: number;
  location?: string;
  discription?: string;
  createdAt?: string;
  projects?: number;
  followers?: number;
  following?: number;
  badges?: string[];
}

const UserPage = () => {
  const [swapsPage, setSwapsPage] = useState(4);
  const [visibleSwaps, setVisibleSwaps] = useState(4);
  const [swapsLoading, setSwapsLoading] = useState(false);
  const [swapsHasMore, setSwapsHasMore] = useState(true);
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [swaps, setSwaps] = useState<any[]>([]);
  const [connections, setConnections] = useState([]);


  const normalizeLink = (link: string) => {
    if (!/^https?:\/\//i.test(link)) {
      return "https://" + link; // force absolute link
    }
    return link;
  };

  useEffect(() => {


    const fetchOtherUserData = async (userId: string) => {
      try {
        const res = await axios.get(`${baseUrl}/api/skillswaps/history/${userId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setSwaps(res.data.swaps || res.data || []);
      } catch (error) {
        console.error("❌ Error fetching user swaps:", error);
        setSwaps([]);
      }
    };
    fetchOtherUserData(userId);
    fetchUserData(userId);
    // <-- now matches mockUsers.id and backend userId
  }, [userId]);
  const fetchConnections = async () => {
    try {
      const res = await axios.get(`${baseUrl}/api/my-connection`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      const connections = res.data.data || []; // safely extract array
      setConnections(connections);

      // check if current user is in connections
      const isFollowing = connections.some((conn: any) => conn._id === userId);
      setIsFollowing(isFollowing);

    } catch (err) {
      console.error("Error fetching connections:", err);
    }
  };

  fetchConnections();
  const fetchUserData = async (userId: string) => {
    setLoading(true);
    try {
      const res = await axios.get(`${baseUrl}/api/user/${userId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      // Backend probably sends the user object directly
      const u = res.data.user || res.data;

      // Map MongoDB `_id` to `id` so frontend doesn’t break
      setUser({
        ...u,
        id: u.id || u._id,
      });

      setLoading(false);
    } catch (error) {
      console.error("❌ Error fetching user:", error);
      toast({
        title: "Error",
        description: "Failed to load user profile.",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  const fetchCurrentUserData = async () => {
    // This would typically fetch the current logged-in user's data
    // For now, we'll use the first mock user as the current user
    setLoading(true);
    setTimeout(() => {
      setUser(mockUsers[0]);
      setLoading(false);
    }, 500);
  };

  const handleFollow = async () => {
    try {
      await axios.post(`${baseUrl}/api/connections/request/${userId}`, {
        toUserId: userId,
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      setIsFollowing(true);
      toast({
        title: "Success",
        description: `You are now following ${user?.name}`
      });
    } catch (error) {
      console.error("❌ Error following user:", error);
      toast({
        title: "Error",
        description: "Failed to follow user.",
        variant: "destructive",
      });
    }

  };

  const handleMessage = () => {
    if (!user) return;
    navigate(`/messages?user=${user.username}`);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long'
    });
  };

  if (loading) {
    return (
      <AnimatedBackground>
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading profile...</p>
            </div>
          </div>
        </main>
      </AnimatedBackground>
    );
  }

  if (!user) {
    return (
      <AnimatedBackground>
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">User Not Found</h1>
            <p className="text-xl text-muted-foreground mb-8">
              The user you're looking for doesn't exist or has been removed.
            </p>
            <Button onClick={() => navigate("/search")} className="mr-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Search
            </Button>
            <Button variant="outline" onClick={() => navigate("/")}>
              Go Home
            </Button>
          </div>
        </main>
      </AnimatedBackground>
    );
  }

  return (
    <AnimatedBackground>
      <Header />
      <main className="container mx-auto px-4 py-8">
        {/* Back Button */}
        {userId && (
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-6"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        )}

        {/* Profile Header */}
        <Card className="shadow-card mb-8">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <Avatar className="h-32 w-32">
                <AvatarImage src={user.avatar || "/logo.png"} alt={user.name} />
                <AvatarFallback className="text-4xl">{user.name.charAt(0)}</AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
                  <div>
                    <h1 className="text-3xl font-bold mb-2">{user.name}</h1>
                    {/* <p className="text-lg text-muted-foreground">@{user.username}</p> */}

                    {/* ✅ Read-Only Badges Section */}
                    <div className="flex flex-wrap gap-2 mt-3">
                      {user.badges && user.badges.length > 0 ? (
                        user.badges.map((b, i) => (
                          <Badge key={i} className="uppercase text-xs">
                            {b}
                          </Badge>
                        ))
                      ) : (
                        <div className="text-xs text-muted-foreground">No badges yet</div>
                      )}
                    </div>
                  </div>

                  {userId && (
                    <div className="flex gap-3 mt-4 sm:mt-0">
                      <Button onClick={handleMessage} variant="outline">
                        <MessageCircle className="mr-2 h-4 w-4" />
                        Message
                      </Button>
                      <Button onClick={handleFollow} variant={isFollowing ? "outline" : "default"}>
                        <UserPlus className="mr-2 h-4 w-4" />
                        {isFollowing ? "Following" : "Follow"}
                      </Button>
                    </div>
                  )}
                </div>

                {user.discription && (
                  <p className="text-muted-foreground mb-4">{user.discription}</p>
                )}

                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  {user.location && (
                    <div className="flex items-center">
                      <MapPin className="mr-1 h-4 w-4" />
                      {user.location}
                    </div>
                  )}
                  <div className="flex items-center">
                    <Mail className="mr-1 h-4 w-4" />
                    {user.email}
                  </div>
                  {user.createdAt && (
                    <div className="flex items-center">
                      <Calendar className="mr-1 h-4 w-4" />
                      Joined {formatDate(user.createdAt
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>


        <div className="grid gap-8 md:grid-cols-3">
          {/* Stats */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Trophy className="mr-2 h-5 w-5" />
                Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {user.lvl && (
                <div className="flex justify-between items-center">
                  <span className="flex items-center">
                    <Star className="mr-2 h-4 w-4 text-yellow-500" />
                    Level
                  </span>
                  <Badge variant="secondary">{user.lvl}</Badge>
                </div>
              )}
              {user.projects && (
                <div className="flex justify-between items-center">
                  <span>Projects</span>
                  <span className="font-semibold">{user.projects}</span>
                </div>
              )}
              {user.followers !== undefined && (
                <div className="flex justify-between items-center">
                  <span className="flex items-center">
                    <Users className="mr-2 h-4 w-4" />
                    Followers
                  </span>
                  <span className="font-semibold">{user.followers}</span>
                </div>
              )}
              {user.following !== undefined && (
                <div className="flex justify-between items-center">
                  <span>Following</span>
                  <span className="font-semibold">{user.following}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Skills */}
          <Card className="shadow-card md:col-span-2">
            <CardHeader>
              <CardTitle>Skills & Expertise</CardTitle>
            </CardHeader>
            <CardContent>
              {user.skills && user.skills.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {user.skills.map((skill, index) => (
                    <Badge key={index} variant="secondary" className="px-3 py-1">
                      {skill}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No skills listed yet.</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity / Projects Section */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users size={20} />
              My Skill Swaps
            </CardTitle>
            <CardDescription>
              All your skill swap sessions and exchanges.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {swaps.length === 0 && !swapsLoading && (
              <div className="text-muted-foreground text-center py-6">
                No skill swaps yet.
              </div>
            )}
            <div className="space-y-4">
              {swaps.slice(0, visibleSwaps).map((swap, idx) => {
                let otherUser = "Unknown User";
                const myId = localStorage.getItem("userId");
                let myLink = "";
                let theirLink = "";
                // Detect which link belongs to which user
                if (swap.userA && swap.userB) {
                  if (String(swap.userA._id || swap.userA) === String(myId)) {
                    otherUser = swap.userB.name || swap.userB.email || swap.userB._id || "Unknown User";
                    myLink = "princemerja.me";
                    theirLink = swap.userBLink || swap.linkB || swap.completedWorkLinkB || "";
                  } else {
                    otherUser = swap.userA.name || swap.userA.email || swap.userA._id || "Unknown User";
                    myLink = "princemerja.me  ";
                    theirLink = swap.userALink || swap.linkA || swap.completedWorkLinkA || "";
                  }
                } else if (swap.withUser) {
                  otherUser = swap.withUser;
                }
                const date = swap.startedAt || swap.completedAt || swap.date;
                return (
                  <div key={swap.id || swap._id || idx} className="p-3 rounded-lg bg-muted/30 flex flex-col gap-2">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                      <div>
                        <div className="font-medium">{swap.title || swap.skillOffered || swap.skill || "Skill Swap"}</div>
                        <div className="text-xs text-muted-foreground">
                          With: {otherUser}
                          {date && <> • {new Date(date).toLocaleDateString()}</>}
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {swap.status ? <Badge>{swap.status}</Badge> : null}
                      </div>
                    </div>
                    {/* Show links if present */}
                    {(myLink || theirLink) && (
                      <div className="mt-2 flex flex-col gap-1 text-xs">
                        {myLink && (
                          <div>
                            <span className="font-semibold text-primary">{user.name}'s Link: </span>
                            <a
                              href={normalizeLink(myLink)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="underline break-all"
                            >
                              {myLink}
                            </a>
                          </div>
                        )}
                        {theirLink && (
                          <div>
                            <span className="font-semibold text-secondary">{otherUser}'s Link: </span>
                            <a
                              href={normalizeLink(theirLink)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="underline break-all"
                            >
                              {theirLink}
                            </a>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            {swaps.length > visibleSwaps && (
              <div className="flex justify-center mt-4">
                <Button
                  variant="outline"
                  onClick={() => setVisibleSwaps((v) => v + 4)}
                  disabled={swapsLoading}
                >
                  {swapsLoading ? "Loading..." : "Show More"}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </AnimatedBackground>
  );
};

export default UserPage;