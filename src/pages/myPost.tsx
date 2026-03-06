"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import { Header } from "@/components/Header";
import { AnimatedBackground } from "@/components/AnimatedBackground";
import { Button } from "@/components/ui/button";
import { SkillCard } from "@/components/SkillCard"; // reuse same card for consistency
import { useNavigate } from "react-router-dom";

const baseURL = import.meta.env.VITE_BASE_URL;

export default function MyPostPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMyPosts = async () => {
      try {
        const res = await axios.get(`${baseURL}/api/post/my-posts`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        // ✅ Map skillPosts
        const mappedPosts = res.data.skillPosts.map((item: any) => ({
          id: item._id,
          title: `${item.OfferedSkill} for ${item.WantedSkill}`,
          description: item.description,
          skillsGiven: [item.OfferedSkill],
          skillsWanted: [item.WantedSkill],
          user: {
            id: item.userId?._id || "",
            name: item.userId?.name || "You",
            avatar: item.userId?.avatar || "",
            description: item.userId?.description || "",
            level: 1,
            rating: 4.5,
            location: "Remote",
          },
          tags: item.userId?.skills || [],
          postedAt: new Date(item.createdAt).toLocaleDateString(),
        }));

        // ✅ Map achievements
        const mappedAchievements = res.data.achievements.map((ach: any) => ({
          id: ach._id,
          title: ach.title || "Achievement",
          description: ach.description || "",
          skillsGiven: [],
          skillsWanted: [],
          user: {
            id: ach.userId?._id || "",
            name: ach.userId?.name || "You",
            avatar: ach.userId?.avatar || "",
            description: ach.userId?.description || "",
            level: 1,
            rating: 5,
            location: "Remote",
          },
          tags: ach.tags || [],
          postedAt: new Date(ach.createdAt).toLocaleDateString(),
        }));

        setPosts(mappedPosts);
        setAchievements(mappedAchievements);
      } catch (err) {
        console.error("Failed to fetch my posts:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMyPosts();
  }, []);

  const handleDelete = async (postId: string) => {
    try {
      await axios.delete(`${baseURL}/api/post/${postId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPosts((prev) => prev.filter((p) => p.id !== postId));
      window.location.reload();
    } catch (error) {
      console.error("Error deleting post:", error);
    }
  };

  return (
    <AnimatedBackground>
      <Header />

      <main className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">
            My <span className="gradient-text">Posts</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Manage your skill swap posts & achievements. Edit, delete, or check responses.
          </p>
        </div>

        {/* Skill Posts Section */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">
              {loading ? "Loading..." : `${posts.length} Skill Posts`}
            </h3>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {posts.map((post) => (
              <div key={post.id} className="relative">
                <SkillCard
                  skill={post}
                  showMatch={false}
                  onConnect={undefined}
                  buttonshow={false} // not needed in My Posts
                />
                <div className="mt-4 flex justify-end">
                  <Button
                    variant="destructive"
                    onClick={() => handleDelete(post.id)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {!loading && posts.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg mb-4">
                You haven’t posted any skill swap yet.
              </p>
              <Button variant="outline" onClick={() => { navigate("/post") }}>Create a Post</Button>
            </div>
          )}
        </section>

        {/* Achievements Section */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">
              {loading ? "Loading..." : `${achievements.length} Achievements`}
            </h3>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {achievements.map((ach) => (
              <div key={ach.id} className="relative">
                <SkillCard
                  skill={ach}
                  showMatch={false}
                  onConnect={undefined}
                  buttonshow={false}
                />
                <div className="mt-4 flex justify-end">
                <Button
                  variant="destructive"
                  onClick={() => handleDelete(ach.id)}
                >
                  Delete
                </Button>
                </div>

              </div>

            ))}
          </div>

          {!loading && achievements.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg mb-4">
                No achievements shared yet.
              </p>
              <Button onClick={() => { navigate("/post");
                
               }} variant="outline">Add an Achievement</Button>
            </div>
          )}
        </section>
      </main>
    </AnimatedBackground>
  );
}
