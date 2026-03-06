import { useState, useEffect } from "react";
import { AnimatedBackground } from "@/components/AnimatedBackground";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { Search } from "lucide-react";
import { Header } from "@/components/Header";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import axios from "axios";

// Toggle between mock & backend
const USE_MOCK_DATA = false;
const baseURL = import.meta.env.VITE_BASE_URL;
// Mock data
export const mockUsers = [
  {
    id: "1",
    username: "alicejohnson",
    name: "Alice Johnson",
    email: "alice@example.com",
    avatar: "/avatars/alice.png",
    skills: ["React", "Node.js", "UI Design"],
    level: 5,
    location: "New York, USA",
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
  },
];

interface User {
  id: string;
  username: string;
  name: string;
  email: string;
  avatar?: string;
  skills?: string[];
  level?: number;
  location?: string;
}

const SearchPeople = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<User[]>([]);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (!query.trim()) {
      fetchUsers();
    }
  }, [query]);

  useEffect(() => {
    if (!query.trim()) return;
    const timeout = setTimeout(() => {
      handleSearch(query);
    }, 400);
    return () => clearTimeout(timeout);
  }, [query]);
  const token = localStorage.getItem('token');
 const fetchUsers = async () => {
  try {
    const res = await axios.get(`${baseURL}/api/get/users`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });

    // Map _id → id for frontend consistency
    const users = (res.data || []).map((u: any) => ({
      ...u,
      id: u.id || u._id,
    }));

    setResults(users);
  } catch (err) {
    console.error("❌ Error fetching users:", err);
  }
};


  const handleSearch = async (searchQuery: string) => {
    if (USE_MOCK_DATA) {
      const filtered = mockUsers.filter(
        (user) =>
          user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.skills?.some((skill) =>
            skill.toLowerCase().includes(searchQuery.toLowerCase())
          )
      );
      setResults(filtered);
    } else {
      try {
        const res = await axios.get(
          `http://localhost:3000/api/search?query=${encodeURIComponent(searchQuery)}`
        );
        setResults(res.data.users || []);
      } catch {
        toast({
          title: "Error",
          description: "Failed to fetch search results.",
          variant: "destructive",
        });
      }
    }
  };

const handleUserClick = (userId: string) => {
  setTimeout(() => {
    console.log("Navigating to user:", userId);
  }, 2000); // wait 2s before logging
  navigate(`/user/${userId}`);
};



  return (
    <AnimatedBackground>
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">
            Search <span className="gradient-text">People</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Find amazing people by their name, skills, or location
          </p>
        </div>

        <Card className="shadow-card mb-8">
          <CardContent className="p-6 flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
              <Input
                placeholder="Search by name or skill..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {results.length === 0 && (
          <p className="text-muted-foreground text-center">No profiles found.</p>
        )}

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {results.map((user) => (
            <Card
              key={user.id || user.email} 
              className="hover:shadow-lg transition cursor-pointer"
              onClick={() => handleUserClick(user.id)}
            >
              <CardHeader className="flex flex-row items-center gap-4">
                <Avatar className="h-14 w-14">
                  <AvatarImage src={user.avatar || "/logo.png"} alt={user.name} />
                  <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-lg">{user.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
              </CardHeader>
              <CardContent>
                {user.skills && user.skills.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-2">
                    {user.skills.slice(0, 5).map((skill, i) => (
                      <Badge key={i} variant="secondary">{skill}</Badge>
                    ))}
                  </div>
                )}
                {user.level !== undefined && (
                  <p className="text-xs text-muted-foreground">Level {user.level}</p>
                )}
                {user.location && (
                  <p className="text-xs text-muted-foreground mt-1">📍 {user.location}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </AnimatedBackground>
  );
};

export default SearchPeople;