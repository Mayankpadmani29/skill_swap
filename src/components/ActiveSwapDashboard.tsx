"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Calendar,
  Star,
  MessageSquare,
  Edit,
  CheckCircle,
  Target,
} from "lucide-react";
import axios from "axios";
import { toast } from "@/hooks/use-toast";

const API_BASE = `${import.meta.env.VITE_BASE_URL}/api`;
const token =
  typeof window !== "undefined" ? localStorage.getItem("token") : null;
const currentUserId =
  typeof window !== "undefined" ? localStorage.getItem("userId") : null;

interface ActiveSwap {
  id: string;
  name: string;
  initials: string;
  skill: string;
  learning: string;
  startDate: string;
  nextSession: string;
  progress: number;
  rating: number;
  notes?: string;
  userA: string;
  userB: string;
  userBName: string;
  userAName: string;
  userACompleted: boolean;
  userBCompleted: boolean;
}
interface completedSwap {
  _id: string;
  name: string;
  initials: string;
  skill: string;
  learning: string;
  startDate: string;
  nextSession: string;
  progress: number;
  rating: number;
  notes?: string;
  userA: string;
  userB: string;
  userBName: string;
  userAName: string;
  userACompleted: boolean;
  userBCompleted: boolean;
}

export const ActiveSwapDashboard = () => {

  // Add at the top of your component
  const [completeDialogOpen, setCompleteDialogOpen] = useState(false);
  const [completingSwapId, setCompletingSwapId] = useState<string | null>(null);
  const [completedWorkLink, setCompletedWorkLink] = useState("");

  const [activeSwaps, setActiveSwaps] = useState<ActiveSwap[]>([]);
  const [completedSwap, setCompletedSwap] = useState<completedSwap[]>([]);
  const [editingSwap, setEditingSwap] = useState<ActiveSwap | null>(null);
  const [progressValue, setProgressValue] = useState(0);
  const [nextSession, setNextSession] = useState("");
  const [newToken, setNewToken] = useState("");
  const [notes, setNotes] = useState("");

  const handleEditSwap = (swap: ActiveSwap) => {
    setEditingSwap(swap);
    setProgressValue(swap.progress);
    setNextSession(swap.nextSession);
    setNotes(swap.notes || "");
  };

  const userId = localStorage.getItem("userId");
  useEffect(() => {
    const fetchActiveSwaps = async () => {
      try {
        const response = await axios.get(`${API_BASE}/skillswaps/active`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log(response.data);


        setActiveSwaps(
          (response.data || []).map((swap: any) => {
            const partner =
              swap.userA._id === userId ? swap.userB : swap.userA;

            return {
              id: swap._id,
              name: partner.name,
              initials: partner.name.charAt(0).toUpperCase(),
              skill: swap.skillWanted,
              learning: swap.skillOffered,
              startDate: new Date(swap.createdAt).toLocaleDateString(),
              nextSession: swap.nextSession || "Not scheduled",
              progress: swap.progress || 0,
              rating: swap.rating || 0,
              userA: swap.userA._id,
              userAName: swap.userA.name,
              userB: swap.userB._id,
              userBName: swap.userB.name,
              userACompleted: swap.userACompleted || false,
              userBCompleted: swap.userBCompleted || false,
              notes: swap.notes || "",
            };
          })
        );
      } catch (err) {
        console.error("Error fetching active swaps:", err);
        toast({
          title: "Error",
          description: "Failed to load active swaps",
          variant: "destructive",
        });
      }
    };
    fetchActiveSwaps();
  }, []);
  useEffect(() => {
    const fetchcompletedswap = async () => {
      const res = await axios.get(`${API_BASE}/skillswaps/history`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Map completed swaps to include 'id' property for compatibility
      setCompletedSwap(
        (res.data || []).map((swap: any) => {
          const partner =
            swap.userA._id === userId ? swap.userB : swap.userA;

          return {
            id: swap._id,
            name: partner.name,
            initials: partner.name.charAt(0).toUpperCase(),
            skill: swap.skillWanted,
            learning: swap.skillOffered,
            startDate: new Date(swap.createdAt).toLocaleDateString(),
            nextSession: swap.nextSession || "Not scheduled",
            progress: swap.progress || 0,
            rating: swap.rating || 0,
            userA: swap.userA._id,
            userAName: swap.userA.name,
            userB: swap.userB._id,
            userBName: swap.userB.name,
            userACompleted: swap.userACompleted || false,
            userBCompleted: swap.userBCompleted || false,
            notes: swap.notes || "",
          };

        })
      );
    }
    fetchcompletedswap();
  }, []);

  const handleclickToConnect = async (requestId) => {
    console.log(requestId);
    try {
      await axios.post(
        `${API_BASE}/connections/request/${requestId}`,
        { action: "accept" },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast({ title: "Friend Request Accepted", description: "Now you're connected." });
    } catch {
      toast({ title: "Error", description: "Failed to send friend request", variant: "destructive" });
    }
  };
  const handleCompleteSwap = async (swapId: string) => {
    try {
      const res = await axios.post(
        `${API_BASE}/skillswap/complete/${swapId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setActiveSwaps((prev) =>
        prev.map((swap) =>
          swap.id === swapId
            ? {
              ...swap,
              userACompleted:
                String(swap.userA) === String(currentUserId)
                  ? true
                  : swap.userACompleted,
              userBCompleted:
                String(swap.userB) === String(currentUserId)
                  ? true
                  : swap.userBCompleted,
            }
            : swap
        )
      );

      toast({
        title: "Swap Updated",
        description: "Completion recorded.",
      });
      if (res.data.token) {
        localStorage.setItem("token", res.data.token);
        setNewToken(res.data.token);
      }
    } catch (err) {
      console.error("Error completing swap:", err);
      toast({
        title: "Error",
        description: "Failed to complete swap",
        variant: "destructive",
      });
    }
  };

  const activeSwapsList = activeSwaps.filter(
    (swap) => !(swap.userACompleted && swap.userBCompleted)
  );
  const completedSwapsList = completedSwap.filter(
    (swap) => swap.userACompleted && swap.userBCompleted
  );

  const renderCompletionStatus = (swap: ActiveSwap) => {
    if (swap.userACompleted && swap.userBCompleted)
      return `Completed by ${swap.name} & ${swap.name}`;
    if (swap.userACompleted) return `Complete`;
    if (swap.userBCompleted) return `Complete`;
    return "Not completed yet";
  };
  const renderCompletedStatus = (swap: completedSwap) => {
    if (swap.userACompleted && swap.userBCompleted)
      return `Completed by ${swap.userAName} & ${swap.userBName}`;
    if (swap.userACompleted) return `Complete`;
    if (swap.userBCompleted) return `Complete`;
    return "Not completed yet";
  };

  return (
    <div className="space-y-6">
      {/* Active Swaps */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Target className="w-5 h-5 text-primary" />
          Active Swaps ({activeSwapsList.length})
        </h3>
        <div className="space-y-4">
          {activeSwapsList.map((swap) => (
            <Card key={swap.id} className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                {/* Left */}
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-primary-foreground text-lg font-bold">
                      {swap.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-lg font-semibold">{swap.name}</h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                      <Star size={14} className="text-warning fill-warning" />
                      <span>•</span>
                      <span>Started {swap.startDate}</span>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant="outline" className="border-success text-success">
                        Providing: {swap.learning}
                      </Badge>
                      <Badge variant="outline" className="border-info text-info">
                        Getting: {swap.skill}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Right */}
                <div className="space-y-4 min-w-[300px]">
                  <div className="flex items-center justify-between">
                    {swap.userAName} : {swap.userACompleted ? ("✅") : ("❌")} - {swap.userBName} : {swap.userBCompleted ? ("✅") : ("❌")}
                  </div>

                  <div className="flex gap-2">

                    <Button
                      onClick={() => handleclickToConnect(swap.userA)}
                      size="sm">
                      <MessageSquare size={16} className="mr-1" />
                      Connect
                    </Button>

                    <Button
                      size="sm"
                      variant="outline"
                      className="border-success text-success hover:bg-success hover:text-success-foreground"
                      onClick={() => {
                        setCompletingSwapId(String(swap.id));
                        setCompleteDialogOpen(true);
                        setCompletedWorkLink("");
                      }}
                      disabled={
                        (swap.userA === currentUserId && swap.userACompleted) ||
                        (swap.userB === currentUserId && swap.userBCompleted)
                      }
                    >
                      <CheckCircle size={16} className="mr-1" />
                      {renderCompletionStatus(swap)}
                    </Button>
                  </div>
                </div>
              </div>

              {swap.notes && (
                <div className="mt-4 pt-4 border-t">
                  <p className="text-sm text-muted-foreground">
                    <strong>Notes:</strong> {swap.notes}
                  </p>
                </div>
              )}
            </Card>
          ))}
        </div>
      </div>

      {/* Completed Swaps */}
      {completedSwapsList.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-success" />
            Recently Completed Swaps ({completedSwapsList.length})
          </h3>
          <div className="space-y-4">
            {completedSwapsList.map((swap) => (
              <Card key={swap._id} className="p-6 bg-muted/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-primary-foreground font-bold">
                        {swap.initials}
                      </AvatarFallback>
                    </Avatar>

                    <div>
                      <h3 className="font-semibold">{swap.name}</h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Star size={14} className="text-warning fill-warning" />
                        <span>•</span>
                        <span>{renderCompletedStatus(swap)}</span>
                      </div>
                      <div className="flex gap-2 mt-1">
                        <Badge variant="outline" className="border-success text-success">
                          {swap.learning}
                        </Badge>
                        <Badge variant="outline" className="border-info text-info">
                          {swap.skill}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-success">
                    <CheckCircle size={16} />
                    <span>Swap Completed</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
      <Dialog open={completeDialogOpen} onOpenChange={setCompleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Complete Swap</DialogTitle>
            <div className="mt-2 text-muted-foreground text-sm">
              Please provide a link to your completed work (e.g., Google Drive, GitHub, YouTube, etc.).
            </div>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="completed-link">Completed Work Link</Label>
              <Input
                id="completed-link"
                placeholder="https://..."
                value={completedWorkLink}
                onChange={e => setCompletedWorkLink(e.target.value)}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setCompleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                // Call your completion handler with the link
                if (completingSwapId) {
                  handleCompleteSwap(completingSwapId /*, completedWorkLink */);
                }
                setCompleteDialogOpen(false);
              }}
              disabled={!completedWorkLink.trim()}
            >
              Complete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
