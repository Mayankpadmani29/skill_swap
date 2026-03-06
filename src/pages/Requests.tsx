import { useEffect, useState } from "react";
import axios from "axios";
import { Header } from "@/components/Header";
import { AnimatedBackground } from "@/components/AnimatedBackground";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ActiveSwapDashboard } from "@/components/ActiveSwapDashboard";
import { toast } from "@/hooks/use-toast";
import { Check, X, MessageSquare, Link } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AvatarImage } from "@radix-ui/react-avatar";

const API_BASE = `${import.meta.env.VITE_BASE_URL}/api`;
const Requests = () => {
  const [friendRequests, setFriendRequests] = useState<any[]>([]);
  const [skillSwapRequests, setSkillSwapRequests] = useState<any[]>([]);
  const [sentRequests, setSentRequests] = useState<any[]>([]);
  const [activeSwaps, setActiveSwaps] = useState<any[]>([]);
  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  // Fetch both friend + skill swap requests
  const userId = localStorage.getItem("userId");
  // Fetch both friend + skill swap requests
  useEffect(() => {
    document.title = "Requests | SkillSwap";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", "Manage your requests and connections on SkillSwap.");

    const fetchData = async () => {
      try {
        const [friendReqRes, skillSwapRes, connectionsRes] = await Promise.all([
          axios.get(`${API_BASE}/connections/requests`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${API_BASE}/request/skilswap`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          // axios.get(`${API_BASE}/connections`, {
          //   headers: { Authorization: `Bearer ${token}` },
          // }),
          axios.get(`${API_BASE}/skillswaps/active`, {   // 👈 this one
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        setFriendRequests(friendReqRes.data || []);
        setSkillSwapRequests(skillSwapRes.data || []);
        // Get current user ID from localStorage or another source
        const userId = localStorage.getItem("userId");
        // console.log(userId);
        console.log(connectionsRes.data);

        setActiveSwaps(
          (connectionsRes.data || []).map((swap: any) => {
            const partner = swap.userA._id === userId ? swap.userB : swap.userA;

            return {
              id: swap._id, // ✅ FIXED
              name: partner.name,
              initials: partner.name.charAt(0).toUpperCase(),
              skill: swap.skillWanted,
              learning: swap.skillOffered,
              startDate: new Date(swap.createdAt).toLocaleDateString(),
              nextSession: swap.nextSession || "Not scheduled",
              progress: swap.progress || 0,
              rating: swap.rating || 0,
              status: swap.status === "active" ? "active" : "completed",
              notes: swap.notes || "",
              level: partner.lvl || 1,
              totalSwaps: partner.totalSwaps || 0,
            };
          })
        );

        console.log("Active Swaps:", connectionsRes.data);

      } catch (err) {
        console.error("Error loading requests:", err);
        toast({
          title: "Error",
          description: "Failed to load requests",
          variant: "destructive",
        });
      }
    };

    fetchData();
  }, [token]);


  // Friend request handlers
  const handleAcceptFriend = async (requestId: string) => {
    try {
      await axios.post(
        `${API_BASE}/connections/respond/${requestId}`,
        { action: "accept" },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setFriendRequests((prev) => prev.filter((r) => r._id !== requestId));
      toast({ title: "Friend Request Accepted", description: "Now you're connected." });
    } catch {
      toast({ title: "Error", description: "Failed to accept friend request", variant: "destructive" });
    }
  };

  const handleDeclineFriend = async (requestId: string) => {
    try {
      await axios.post(
        `${API_BASE}/connections/respond/${requestId}`,
        { action: "reject" },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setFriendRequests((prev) => prev.filter((r) => r._id !== requestId));
      toast({ title: "Friend Request Declined", variant: "destructive" });
    } catch {
      toast({ title: "Error", description: "Failed to decline request", variant: "destructive" });
    }
  };

  // SkillSwap request handlers
  const handleAcceptSkillSwap = async (requestId: string) => {
    try {
      await axios.post(
        `${API_BASE}/request/skilswap/respond/${requestId}`,
        { action: "accept" },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSkillSwapRequests((prev) => prev.filter((r) => r._id !== requestId));
      toast({ title: "SkillSwap Accepted", description: "Skill swap started!" });
    } catch {
      toast({ title: "Error", description: "Failed to accept skill swap", variant: "destructive" });
    }
  };

  const handleDeclineSkillSwap = async (requestId: string) => {
    try {
      await axios.post(
        `${API_BASE}/request/skilswap/respond/${requestId}`,
        { action: "reject" },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSkillSwapRequests((prev) => prev.filter((r) => r._id !== requestId));
      toast({ title: "SkillSwap Declined", variant: "destructive" });
    } catch {
      toast({ title: "Error", description: "Failed to decline skill swap", variant: "destructive" });
    }
  };

  // --- Add this handler in Requests.tsx ---
  const handleclickdiv = (url: string) => {
    navigate(`/user/${url}`);
  }
  console.log(skillSwapRequests.filter((req) => String(userId) !== String(req.fromUser._id)));
  console.log(userId);


  console.log("Friend Requests:", skillSwapRequests);
  return (
    <AnimatedBackground>
      <Header />

      <main className="container mx-auto px-4 py-6">
        <div className="max-w-6xl mx-auto">
          <header className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Requests</h1>
            <p className="text-muted-foreground">
              Manage your friend requests and skill swap requests
            </p>
          </header>

          <Tabs defaultValue="friend" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="friend">Friends ({friendRequests.length})</TabsTrigger>
              <TabsTrigger value="skillswap">SkillSwaps ({skillSwapRequests.length})</TabsTrigger>
              <TabsTrigger value="active">Active Swaps ({activeSwaps.length})</TabsTrigger>
            </TabsList>

            {/* Friend Requests */}
            <TabsContent value="friend" className="space-y-4">
              {friendRequests
                .filter((req) => userId !== req.fromUser._id)
                .map((req) => (
                  <Card key={req._id} className="p-6 flex justify-between items-center">
                    <div onClick={() => handleclickdiv(req.fromUser._id)} className="flex gap-4 items-center">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={req.fromUser.avatar || "/default-avatar.png"} alt={req.fromUser.name} />

                        <AvatarFallback>{req.fromUser.name[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold">{req.fromUser.name}</h3>
                        <p className="text-sm text-muted-foreground">{req.fromUser.email}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => handleAcceptFriend(req._id)}>
                        <Check size={16} className="mr-2" /> Accept
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-destructive border-destructive"
                        onClick={() => handleDeclineFriend(req._id)}
                      >
                        <X size={16} className="mr-2" /> Decline
                      </Button>
                    </div>
                  </Card>
                ))}
            </TabsContent>

            {/* Skill Swap Requests */}
            <TabsContent value="skillswap" className="space-y-4">
              {skillSwapRequests
                .filter((req) => userId !== req.fromUser._id)
                .map((req) => (
                  <Card key={req._id} className="p-6 flex flex-col gap-4">
                    <div onClick={() => handleclickdiv(req.fromUser._id)} className="flex gap-4 items-center">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={req.fromUser.avatar || "/default-avatar.png"} alt={req.fromUser.name} />
                        <AvatarFallback>{req.fromUser.name[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold">{req.fromUser.name}</h3>
                        <p className="text-sm text-muted-foreground">{req.fromUser.email}</p>
                        <p className="mt-2 text-sm">
                          Wants: <b>{req.skillWanted}</b> | Offers: <b>{req.skillOffered}</b>
                        </p>
                        <p className="text-sm mt-1">
                          Level: <b>{req.fromUser.lvl || "N/A"}</b>
                        </p>
                        <div className="text-sm mt-1">
                          SkillSwaps:&nbsp;
                          {req.fromUser.totalSwaps ? (
                            <span>{req.fromUser.totalSwaps}</span>
                          ) : (
                            <span>N/A</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => handleAcceptSkillSwap(req._id)}>
                        <Check size={16} className="mr-2" /> Accept
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-destructive border-destructive"
                        onClick={() => handleDeclineSkillSwap(req._id)}
                      >
                        <X size={16} className="mr-2" /> Decline
                      </Button>
                    </div>
                  </Card>
                ))}
            </TabsContent>

            {/* Active Swaps */}
            <TabsContent value="active">
              <ActiveSwapDashboard />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </AnimatedBackground>
  );
};

export default Requests;
