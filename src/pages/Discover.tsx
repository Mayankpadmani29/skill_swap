import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { SkillCard } from "@/components/SkillCard";
import { SkillSwapRequestDialog } from "@/components/SkillSwapRequestDialog";
import { AnimatedBackground } from "@/components/AnimatedBackground";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Filter } from "lucide-react";
import axios from "axios";

const baseURL = import.meta.env.VITE_BASE_URL;

const Discover = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedLocation, setSelectedLocation] = useState("all");
  const [sortBy, setSortBy] = useState("recent");
  const [showMoreFilters, setShowMoreFilters] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [skills, setSkills] = useState<any[]>([]);

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`${baseURL}/api/post/skillswap`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const mappedData = res.data.map((item: any) => ({
          id: item._id,
          title: `${item.OfferedSkill} for ${item.WantedSkill}`,
          description: item.description,
          skillsGiven: [item.OfferedSkill],
          skillsWanted: [item.WantedSkill],
          status: item.status,
          user: {
            id: item.userId?._id || "",
            name: item.userId?.name || "Unknown",
            avatar: item.userId?.avatar || "",
            description: item.userId?.description || "",
            level: 1,
            rating: 4.5,
            location: "Remote",
          },
          tags: item.userId?.skills || [],
          postedAt: new Date(item.createdAt).toLocaleDateString(),
        }));

        setSkills(mappedData);
      } catch (err) {
        console.error("Failed to fetch skills:", err);
      }
    };

    fetchData();
  }, []);

  const categories = [
    "Programming",
    "Design",
    "Music",
    "Photography",
    "Cooking",
    "Languages",
    "Business",
    "Fitness",
    "Art",
    "Writing",
  ];

  const filteredAndSortedSkills = skills
    .filter((skill) => {
      // ✅ only include open skills
      if (skill.status !== "open") return false;

      const matchesSearch =
        searchTerm === "" ||
        skill.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        skill.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        skill.skillsGiven.some((s) =>
          s.toLowerCase().includes(searchTerm.toLowerCase())
        ) ||
        skill.skillsWanted.some((s) =>
          s.toLowerCase().includes(searchTerm.toLowerCase())
        );

      const matchesCategory =
        selectedCategory === "all" ||
        skill.tags.some(
          (tag) => tag.toLowerCase() === selectedCategory.toLowerCase()
        ) ||
        skill.skillsGiven.some((s) =>
          s.toLowerCase().includes(selectedCategory.toLowerCase())
        ) ||
        skill.skillsWanted.some((s) =>
          s.toLowerCase().includes(selectedCategory.toLowerCase())
        );

      const matchesLocation =
        selectedLocation === "all" ||
        (selectedLocation === "local" && skill.user.location.includes("CA")) || // ⚠️ placeholder
        selectedLocation === "remote";

      return matchesSearch && matchesCategory && matchesLocation;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "rating":
          return b.user.rating - a.user.rating;
        case "level":
          return b.user.level - a.user.level;
        case "location":
          return a.user.location.localeCompare(b.user.location);
        case "recent":
        default:
          return (
            new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime()
          );
      }
    });

  return (
    <AnimatedBackground>
      <Header />

      <main className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">
            Discover <span className="gradient-text">Skills</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Find amazing people to learn from and share your knowledge with
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-card rounded-xl p-6 shadow-card mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
                size={20}
              />
              <Input
                placeholder="Search skills, users, or keywords..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select
              value={selectedCategory}
              onValueChange={setSelectedCategory}
            >
              <SelectTrigger className="w-full lg:w-48">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category.toLowerCase()}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={selectedLocation}
              onValueChange={setSelectedLocation}
            >
              <SelectTrigger className="w-full lg:w-48">
                <SelectValue placeholder="Location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                <SelectItem value="local">Nearby</SelectItem>
                <SelectItem value="remote">Remote Only</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              className="w-full lg:w-auto"
              onClick={() => setShowMoreFilters(!showMoreFilters)}
            >
              <Filter size={20} className="mr-2" />
              More Filters
            </Button>
          </div>
        </div>

        {/* Popular Categories */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4">Popular Categories</h3>
          <div className="flex flex-wrap gap-2">
            {categories.slice(0, 6).map((category) => (
              <Badge
                key={category}
                variant={
                  selectedCategory === category.toLowerCase()
                    ? "default"
                    : "secondary"
                }
                className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                onClick={() => setSelectedCategory(category.toLowerCase())}
              >
                {category}
              </Badge>
            ))}
          </div>
        </div>

        {/* Results */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">
              {filteredAndSortedSkills.length} Skills Found
            </h3>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Most Recent</SelectItem>
                <SelectItem value="rating">Highest Rated</SelectItem>
                <SelectItem value="level">Highest Level</SelectItem>
                <SelectItem value="location">Nearest</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredAndSortedSkills.map((skill) => (
              <div
                key={skill.id}
                onClick={() => {
                  setSelectedSkill(skill);
                  setIsDialogOpen(true);
                }}
              >
                <SkillCard skill={skill} buttonshow={true} showMatch buttonLabel="Request Swap" />
              </div>
            ))}
          </div>

          {filteredAndSortedSkills.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg mb-4">
                No skills found matching your search
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCategory("all");
                  setSelectedLocation("all");
                }}
              >
                Clear All Filters
              </Button>
            </div>
          )}
        </div>
      </main>

      {/* Skill Swap Request Dialog */}
      {selectedSkill && (
        <SkillSwapRequestDialog
          toPost={selectedSkill.id}
          isOpen={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          targetUserId={selectedSkill.user.id}
          targetUserName={selectedSkill.user.name}
          targetUserSkills={selectedSkill.skillsGiven}
          requestedSkill={selectedSkill.skillsWanted[0]}
        />
      )}
    </AnimatedBackground>
  );
};

export default Discover;
