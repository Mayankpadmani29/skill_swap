"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Header } from "@/components/Header";
import { AnimatedBackground } from "@/components/AnimatedBackground";
import { Settings, MapPin, Calendar, Star, Award, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";


// ✅ Hook to check login status via JWT in localStorage
const baseURL = import.meta.env.VITE_BASE_URL;
const useAuthStatus = () => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  useEffect(() => {

    const token = localStorage.getItem("token");
    if (!token) {
      setIsLoggedIn(false);
      return;
    }
    try {
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );
      const payload = JSON.parse(jsonPayload);
      const nowSec = Math.floor(Date.now() / 1000);
      setIsLoggedIn(!payload.exp || payload.exp > nowSec);
    } catch {
      setIsLoggedIn(false);
    }
  }, []);

  return isLoggedIn;
};

const Profile = () => {
  // Add at the top of your Profile component
  const [swaps, setSwaps] = useState<any[]>([]);
  const [swapsPage, setSwapsPage] = useState(4);
  const [visibleSwaps, setVisibleSwaps] = useState(4);
  const [swapsLoading, setSwapsLoading] = useState(false);
  const [swapsHasMore, setSwapsHasMore] = useState(true);
  const isLoggedIn = useAuthStatus();
  const { toast } = useToast();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [xp, setXp] = useState(0);
  const [lvl, setLvl] = useState(0);
  const [badges, setBadges] = useState([]);
  // Main user state
  const [user, setUser] = useState({
    id: "",
    name: "User",
    email: "",
    avatar: "/logo.png",
    bio: "",
    location: "",
    joinedDate: "",
    level: 0,
    xp: 0,
    nextLevelXP: 500,
    badges: [],
    skills: [],
    stats: {
      skillsShared: 0,
      skillsLearned: 0,
      connections: 0,
      totalSwaps: 0
    }
  });
  useEffect(() => {
    const userId = localStorage.getItem("userId");
    const fetOtherUserData = async (userId: string) => {
      const res = await axios.get(`${baseURL}/api/skillswaps/history/${userId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setSwaps(res.data);

    }
    console.log(swaps);
    fetOtherUserData(userId);
    const fetchdetails = async () => {
      const id = localStorage.getItem("userId");
      const token = localStorage.getItem("token");
      if (!token) return;
      const res = await axios.get(`${baseURL}/api/user/lvl/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const { lvl, xp } = res.data;
      setXp(xp);
      setLvl(lvl);

    }
    fetchdetails();
  }, [swaps]);
  // Decode JWT helper (client-side)
  const decodeJwt = (token: string): any | null => {
    try {
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );
      return JSON.parse(jsonPayload);
    } catch {
      return null;
    }
  };

  const formatJoinedDate = (iso?: string | null) => {
    if (!iso) return user.joinedDate;
    try {
      const d = new Date(iso);
      return d.toLocaleString("en-US", { month: "long", year: "numeric" });
    } catch {
      return user.joinedDate;
    }
  };

  // Load user info from JWT token if present
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    const payload = decodeJwt(token);
    if (!payload) return;
    const fetchbadges = async () => {
      const res = await axios.get(`${baseURL}/api/badges`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setBadges(res.data);

    }
    setUser((prev) => ({
      ...prev,
      id: payload.id || prev.id,
      name: payload.name || prev.name,
      location: payload.location || "",
      avatar: payload.avatar,
      email: payload.email || prev.email,
      bio: payload.discription || prev.bio,
      joinedDate: formatJoinedDate(payload.createdAt),
      // Map string skills from token to UI skill objects if provided
      skills: Array.isArray(payload.skills) && payload.skills.length
        ? payload.skills.map((s: string) => ({ name: s, level: "Intermediate", experience: "1 year" }))
        : prev.skills,
      // Stats from token arrays/counts
      stats: {
        skillsShared: Array.isArray(payload.skillsShared) ? payload.skillsShared.length : (payload.skillsShared ?? prev.stats.skillsShared),
        skillsLearned: Array.isArray(payload.skillsLearned) ? payload.skillsLearned.length : (payload.skillsLearned ?? prev.stats.skillsLearned),
        connections: Array.isArray(payload.connections) ? payload.connections.length : prev.stats.connections,
        totalSwaps: typeof payload.totalSwaps === "number" ? payload.totalSwaps : prev.stats.totalSwaps,
      }
    }));
    fetchbadges();
  }, []);

  // Editable profile state (badges intentionally excluded from editable inputs)
  const [profile, setProfile] = useState({
    name: user.name,
    email: user.email,
    avatar: user.avatar,
    bio: user.bio,
    location: user.location,
    skills: user.skills.map((s) => s.name).join("\n")
  });

  // Sync form with user whenever dialog opens
  useEffect(() => {
    if (isEditOpen) {
      setProfile({
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        bio: user.bio,
        location: user.location,
        skills: user.skills.map((s) => s.name).join("\n")
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditOpen]);

  if (isLoggedIn === null) {
    return <div className="p-8 text-center">Checking login status...</div>;
  }

  if (!isLoggedIn) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold mb-4">
          You must be logged in to view your profile.
        </h1>
        <Button asChild>
          <a href="/signin">Go to Login</a>
        </Button>
      </div>
    );
  }
  // Save changes to backend and refresh token-driven state
  const handleSaveProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast({ title: "Not signed in", description: "Please sign in again.", variant: "destructive" });
        return;
      }

      const skillsArray = profile.skills
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean);

      const res = await axios.put(
        `${baseURL}/api/user/profile`,
        { name: profile.name, avatar: profile.avatar, location: profile.location, bio: profile.bio, skills: skillsArray },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const newToken = res?.data?.token;
      if (newToken) {
        localStorage.setItem("token", newToken);
        const payload = decodeJwt(newToken);
        if (payload) {
          setUser((prev) => ({
            ...prev,
            id: payload.id || prev.id,
            name: payload.name || prev.name,
            email: payload.email || prev.email,
            bio: payload.discription || prev.bio,
            level: payload.lvl ?? prev.level,
            xp: payload.xp ?? prev.xp,
            joinedDate: payload.createdAt ? new Date(payload.createdAt).toLocaleString("en-US", { month: "long", year: "numeric" }) : prev.joinedDate,
            skills: Array.isArray(payload.skills)
              ? payload.skills.map((s: string) => ({ name: s, level: "Intermediate", experience: "1 year" }))
              : prev.skills,
            stats: {
              skillsShared: Array.isArray(payload.skillsShared) ? payload.skillsShared.length : prev.stats.skillsShared,
              skillsLearned: Array.isArray(payload.skillsLearned) ? payload.skillsLearned.length : prev.stats.skillsLearned,
              connections: Array.isArray(payload.connections) ? payload.connections.length : prev.stats.connections,
              totalSwaps: typeof payload.totalSwaps === "number" ? payload.totalSwaps : prev.stats.totalSwaps,
            },
          }));
        }
      } else {
        // Fallback: update local state if server didn't return token
        setUser((prev) => ({
          ...prev,
          name: profile.name,
          bio: profile.bio,
          skills: skillsArray.map((s) => ({ name: s, level: "Intermediate", experience: "1 year" })),
        }));
      }

      toast({ title: "Profile Updated", description: "Your profile has been saved." });
      setIsEditOpen(false);
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Failed to update profile";
      toast({ title: "Update failed", description: msg, variant: "destructive" });
    }
  };

  // handler: file -> dataURL
  const handleAvatarFile = (file?: File | null) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setProfile((p) => ({ ...p, avatar: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };
  function getXpForLevel(level) {
    if (level < 1) return 0;

    return 500 + (level - 1) * 100;
  }

  const percentage = xp / getXpForLevel(lvl) * 100;

  return (
    <AnimatedBackground>
      <Header />
      <main className="container mx-auto px-4 py-8">
        {/* Profile Header */}
        <Card className="p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex flex-col items-center md:items-start space-y-4">
              <Avatar className="w-24 h-24 md:w-32 md:h-32">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="bg-gradient-to-br from-primary to-info text-primary-foreground text-2xl font-bold">
                  {user.name.charAt(0)}
                </AvatarFallback>
              </Avatar>

              <div className="flex flex-col sm:flex-row gap-2 w-full">
                <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="flex-1">
                      <Settings size={18} className="mr-2" />
                      Edit Profile
                    </Button>
                  </DialogTrigger>

                  <DialogContent className="sm:max-w-[625px]">
                    <DialogHeader>
                      <DialogTitle>Edit Profile</DialogTitle>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                      {/* Basic fields */}
                      {[
                        { id: "name", label: "Name", type: "text", readOnly: false },
                        {
                          id: "email",
                          label: "Email",
                          type: "email",
                          readOnly: true
                        },
                        { id: "location", label: "Location", type: "text", readOnly: false }
                      ].map((field) => (
                        <div
                          key={field.id}
                          className="grid grid-cols-4 items-center gap-4"
                        >
                          <Label
                            htmlFor={field.id}
                            className="text-right capitalize"
                          >
                            {field.label}
                          </Label>
                          <Input
                            id={field.id}
                            type={field.type}
                            value={(profile as any)[field.id]}
                            readOnly={field.readOnly}
                            onChange={(e) =>
                              setProfile({
                                ...profile,
                                [field.id]: e.target.value
                              })
                            }
                            className={`col-span-3 ${field.readOnly ? "cursor-not-allowed bg-muted/20" : ""
                              }`}
                          />
                        </div>
                      ))}

                      {/* Avatar (URL or upload) */}
                      <div className="grid grid-cols-4 items-start gap-4">
                        <Label htmlFor="avatar" className="text-right">
                          Avatar
                        </Label>
                        <div className="col-span-3 space-y-2">
                          <Input
                            id="avatarUrl"
                            type="text"
                            placeholder="Paste image URL or upload file below"
                            value={profile.avatar}
                            onChange={(e) =>
                              setProfile({ ...profile, avatar: e.target.value })
                            }
                          />
                          <input
                            id="avatarFile"
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0] ?? null;
                              if (file) {
                                handleAvatarFile(file);
                              }
                            }}
                            className="hidden"
                          />

                          <span className="text-xs text-muted-foreground block mt-1">
                            Upload overrides URL preview
                          </span>

                          {/* Preview */}
                          {profile.avatar ? (
                            <div className="mt-2 flex items-center gap-3">
                              <img
                                src={profile.avatar}
                                alt="Avatar Preview"
                                className="w-16 h-16 rounded-full object-cover border"
                              />
                              <div className="text-sm">
                                <div className="font-medium">{profile.name}</div>
                                <div className="text-muted-foreground text-xs">
                                  Preview
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="mt-2 text-sm text-muted-foreground">
                              No avatar selected
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Bio */}
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="bio" className="text-right">
                          Bio
                        </Label>
                        <Textarea
                          id="bio"
                          value={profile.bio}
                          onChange={(e) =>
                            setProfile({ ...profile, bio: e.target.value })
                          }
                          className="col-span-3"
                        />
                      </div>

                      {/* Skills */}
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="skills" className="text-right">
                          Skills
                        </Label>
                        <Textarea
                          id="skills"
                          placeholder="One skill per line"
                          value={profile.skills}
                          onChange={(e) =>
                            setProfile({ ...profile, skills: e.target.value })
                          }
                          className="col-span-3 min-h-[100px]"
                        />
                      </div>

                      {/* Badges (READ-ONLY) */}
                      <div className="grid grid-cols-4 items-start gap-4">
                        <Label className="text-right">Badges</Label>
                        <div className="col-span-3 space-y-2">
                          <div className="flex flex-wrap gap-2">
                            {user.badges.length ? (
                              user.badges.map((b, i) => (
                                <Badge key={i} className="uppercase text-xs">
                                  {b}
                                </Badge>
                              ))
                            ) : (
                              <div className="text-xs text-muted-foreground">
                                No badges yet
                              </div>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Badges are awarded by the system and cannot be edited.
                          </p>
                        </div>
                      </div>
                    </div>

                    <DialogFooter>
                      <Button onClick={handleSaveProfile}>Save changes</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            {/* Profile Info */}
            <div className="flex-1 space-y-6">
              <div>
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4">
                  <div>
                    <h1 className="text-3xl font-bold mb-2">{user.name}</h1>
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <MapPin size={16} />
                        {user.location}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar size={16} />
                        Joined {user.joinedDate}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-4 lg:mt-0">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">
                        Level {lvl}
                      </div>
                      <div className="text-gray-400 text-sm">
                        Xp : {xp}
                      </div>
                    </div>
                  </div>
                </div>

                <p className="text-muted-foreground leading-relaxed mb-4">{user.bio}</p>
              </div>
              <div className=" h-2 bg-[#1E1E1E] rounded-full mt-2 overflow-hidden relative" role="progressbar" aria-valuenow={xp} aria-valuemin={0} aria-valuemax={getXpForLevel(lvl)} aria-label="Experience progress">
                <div
                  className="h-full bg-[#00BFFF] rounded-full transition-all duration-300"
                  style={{ width: `${percentage}%` }}
                />
                <span className="absolute right-0 bg-gradient-to-r from-cyan-400 to-blue-500 -top-6 text-xs text-gray-400">
                  {xp}/{getXpForLevel(lvl)} XP
                </span>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
                <div className="text-center p-4 bg-success/5 rounded-lg">
                  <div className="text-2xl font-bold text-success">
                    {user.stats.connections}
                  </div>
                  <div className="text-sm text-muted-foreground">Connections</div>
                </div>
                <div className="text-center p-4 bg-warning/5 rounded-lg">
                  <div className="text-2xl font-bold text-warning">
                    {user.stats.totalSwaps}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Swaps</div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Skills & Badges */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star size={20} />
                My Skills
              </CardTitle>
              <CardDescription>Technologies and skills I can teach</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {user.skills.map((skill, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                >
                  <div>
                    <p className="font-medium">{skill.name}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award size={20} />
                Achievement Badges
              </CardTitle>
              <CardDescription>Badges earned through skill sharing</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {badges.map((badge, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 bg-gradient-to-r from-primary/10 to-info/10 rounded-lg border border-primary/20"
                  >
                    <div className="w-10 h-10 bg-gradient-to-br from-primary to-info rounded-full flex items-center justify-center">
                      <Award size={20} className="text-primary-foreground" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{badge}</p>
                      <p className="text-xs text-muted-foreground">
                        Skill sharing achievement
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

        </div>
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
                    myLink = swap.userALink || swap.linkA || swap.completedWorkLinkA || "";
                    theirLink = swap.userBLink || swap.linkB || swap.completedWorkLinkB || "";
                  } else {
                    otherUser = swap.userA.name || swap.userA.email || swap.userA._id || "Unknown User";
                    myLink = swap.userBLink || swap.linkB || swap.completedWorkLinkB || "";
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
                            <span className="font-semibold text-primary">Your Link: </span>
                            <a
                              href={myLink}
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
                            <span className="font-semibold text-secondary">Their Link: </span>
                            <a
                              href={theirLink}
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

export default Profile;
