import { useEffect, useState, useRef, useCallback } from "react";
import { Header } from "@/components/Header";
import { AnimatedBackground } from "@/components/AnimatedBackground";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, Send, ArrowLeft, MessageSquare, Info, Circle } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import axios from "axios";
import { io, Socket } from "socket.io-client";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/use-toast";

const baseURL = import.meta.env.VITE_BASE_URL;

interface Friend {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
}

interface Message {
  _id: string;
  from: string;
  to: string;
  content: string;
  createdAt: string;
  deliveredAt?: string;
  readAt?: string;
  isMe?: boolean;
}

interface Conversation {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  initials?: string;
  lastMessage: string;
  unreadCount: number;
  status?: string;
  isOnline?: boolean;
}

interface TypingUser {
  userId: string;
  isTyping: boolean;
}

let socket: Socket | null = null;

export default function Messages() {
  const navigate = useNavigate();
  const [currentUserId, setCurrentUserId] = useState("");
  const [friends, setFriends] = useState<Friend[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Record<string, Message[]>>({});
  const [newMessage, setNewMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedChat, setSelectedChat] = useState<number | null>(null);
  const [showChat, setShowChat] = useState(false);
  const [loadingConversations, setLoadingConversations] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [typingUsers, setTypingUsers] = useState<Record<string, boolean>>({});
  const [isTyping, setIsTyping] = useState(false);

  const token = localStorage.getItem("token");
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (currentConversationId) scrollToBottom();
  }, [messages, currentConversationId]);

  // Initialize socket connection
  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const dToken: any = jwtDecode(token);
      setCurrentUserId(dToken.id);

      if (!socket) {
        socket = io(baseURL.replace("/api", ""), {
          transports: ["websocket", "polling"],
          auth: { token },
          reconnection: true,
          reconnectionDelay: 1000,
          reconnectionAttempts: 5,
          timeout: 20000,
        });

        socket.on("connect", () => {
          console.log("✅ Socket connected:", socket?.id);
        });

        socket.on("disconnect", (reason) => {
          console.log("❌ Socket disconnected:", reason);
        });

        socket.on("connect_error", (error) => {
          console.error("❌ Socket connection error:", error);
          toast({
            title: "Connection Error",
            description: "Failed to connect to chat server",
            variant: "destructive",
          });
        });

        // Handle incoming messages
        socket.on("chat:receive", (msg: any) => {
          console.log("📨 Received message:", msg);
          const peerId = msg.from === dToken.id ? msg.to : msg.from;

          const newMsg: Message = {
            _id: msg._id || Date.now().toString(),
            from: msg.from,
            to: msg.to,
            content: msg.content,
            createdAt: msg.createdAt || new Date().toISOString(),
            deliveredAt: msg.deliveredAt,
            readAt: msg.readAt,
            isMe: msg.from === dToken.id,
          };

          setMessages((prev) => {
            const existing = prev[peerId] || [];
            // Prevent duplicates
            if (existing.some((m) => m._id === newMsg._id)) return prev;
            const updated = [...existing, newMsg].sort(sortByTime);
            return { ...prev, [peerId]: updated };
          });

          // Update conversation with last message
          setConversations((prev) =>
            prev.map((conv) =>
              conv.id === peerId
                ? {
                    ...conv,
                    lastMessage: newMsg.content.slice(0, 50) + (newMsg.content.length > 50 ? "..." : ""),
                    unreadCount: newMsg.from !== dToken.id ? conv.unreadCount + 1 : conv.unreadCount,
                  }
                : conv
            )
          );
        });

        // Handle typing indicators
        socket.on("chat:typing", ({ from, typing }: { from: string; typing: boolean }) => {
          setTypingUsers((prev) => ({
            ...prev,
            [from]: typing,
          }));

          if (typing) {
            setTimeout(() => {
              setTypingUsers((prev) => ({
                ...prev,
                [from]: false,
              }));
            }, 3000);
          }
        });

        // Handle presence updates
        socket.on("presence:self", ({ userId, online }: { userId: string; online: boolean }) => {
          setConversations((prev) =>
            prev.map((conv) =>
              conv.id === userId ? { ...conv, isOnline: online } : conv
            )
          );
        });
      }
    } catch (error) {
      console.error("Token decode error:", error);
      localStorage.removeItem("token");
      navigate("/login");
    }

    return () => {
      if (socket) {
        socket.off("connect");
        socket.off("disconnect");
        socket.off("connect_error");
        socket.off("chat:receive");
        socket.off("chat:typing");
        socket.off("presence:self");
        socket.disconnect();
        socket = null;
      }
    };
  }, [token, navigate]);

  // Fetch friends and create conversations
  useEffect(() => {
    if (!token || !currentUserId) return;

    const fetchFriends = async () => {
      try {
        setLoadingConversations(true);
        const res = await axios.get(`${baseURL}/api/friends`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const friendsList: Friend[] = Array.isArray(res.data.data) ? res.data.data : [];
        setFriends(friendsList);

        const conversationsData = friendsList.map((friend) => ({
          id: friend._id,
          name: friend.name,
          email: friend.email,
          avatar: friend.avatar,
          initials: friend.name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2),
          lastMessage: "Start a conversation",
          unreadCount: 0,
          status: "",
          isOnline: false,
        }));

        setConversations(conversationsData);
      } catch (err) {
        console.error("Error fetching friends:", err);
        toast({
          title: "Error",
          description: "Failed to load conversations",
          variant: "destructive",
        });
      } finally {
        setLoadingConversations(false);
      }
    };

    fetchFriends();
  }, [token, currentUserId]);

  // Helper functions
  const sortByTime = (a: Message, b: Message) =>
    new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } else {
      return date.toLocaleDateString();
    }
  };

  // Handle typing indicator
  const handleTyping = useCallback(() => {
    if (!socket || !currentConversationId) return;

    if (!isTyping) {
      setIsTyping(true);
      socket.emit("chat:typing", { to: currentConversationId, typing: true });
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      socket?.emit("chat:typing", { to: currentConversationId, typing: false });
    }, 1000);
  }, [currentConversationId, isTyping]);

  // Send message
  const handleSendMessage = useCallback(() => {
    if (!newMessage.trim() || selectedChat === null || !socket || !currentUserId) return;

    const peerId = conversations[selectedChat].id;
    const tempId = "temp-" + Date.now();

    const optimisticMsg: Message = {
      _id: tempId,
      from: currentUserId,
      to: peerId,
      content: newMessage.trim(),
      createdAt: new Date().toISOString(),
      isMe: true,
    };

    // Add optimistic message
    setMessages((prev) => {
      const updated = [...(prev[peerId] || []), optimisticMsg].sort(sortByTime);
      return { ...prev, [peerId]: updated };
    });

    // Emit to server
    socket.emit(
      "chat:send",
      { to: peerId, content: newMessage.trim() },
      (response: any) => {
        if (response.ok) {
          // Replace temporary message with server response
          setMessages((prev) => {
            const peerMsgs = prev[peerId] || [];
            const updated = peerMsgs.map((m) =>
              m._id === tempId ? { ...response.message, isMe: true } : m
            );
            return { ...prev, [peerId]: updated.sort(sortByTime) };
          });
        } else {
          // Remove failed message
          setMessages((prev) => {
            const peerMsgs = prev[peerId] || [];
            const updated = peerMsgs.filter((m) => m._id !== tempId);
            return { ...prev, [peerId]: updated };
          });
          toast({
            title: "Message Failed",
            description: "Failed to send message. Please try again.",
            variant: "destructive",
          });
        }
      }
    );

    // Stop typing and clear input
    setIsTyping(false);
    socket.emit("chat:typing", { to: peerId, typing: false });
    setNewMessage("");
  }, [newMessage, selectedChat, conversations, currentUserId]);

  // Select chat and load message history
  const handleChatSelect = async (index: number) => {
    setSelectedChat(index);
    const peerId = conversations[index].id;
    setCurrentConversationId(peerId);
    setShowChat(true);

    // Mark messages as read
    try {
      await axios.post(`${baseURL}/api/messages/${peerId}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      // Reset unread count
      setConversations((prev) =>
        prev.map((conv, i) =>
          i === index ? { ...conv, unreadCount: 0 } : conv
        )
      );
    } catch (err) {
      console.error("Failed to mark messages as read:", err);
    }

    // Load message history
    try {
      setLoadingMessages(true);
      const res = await axios.get(`${baseURL}/api/messages/${peerId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      const formattedMessages = res.data.map((msg: any) => ({
        ...msg,
        isMe: msg.from === currentUserId,
      }));
      
      setMessages((prev) => ({ ...prev, [peerId]: formattedMessages }));
    } catch (err) {
      console.error("Failed to load messages:", err);
      toast({
        title: "Error",
        description: "Failed to load message history",
        variant: "destructive",
      });
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleClearChat = async () => {
    if (!currentConversationId) return;
    
    try {
      // You might want to add a backend endpoint for this
      setMessages((prev) => ({ ...prev, [currentConversationId]: [] }));
      toast({
        title: "Chat Cleared",
        description: "Chat history has been cleared locally",
      });
    } catch (err) {
      console.error("Failed to clear chat:", err);
    }
  };

  const handleUserClick = (userId: string) => {
    navigate(`/user/${userId}`);
  };

  const filteredConversations = conversations.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-background to-muted">
      <AnimatedBackground>
        <Header />
        <main className="container mx-auto px-0 py-0 max-w-full">
          <div className="flex h-[calc(100vh-4rem)] bg-background border rounded-lg shadow overflow-hidden">
            {/* Sidebar */}
            <aside
              className={`w-full max-w-xs border-r bg-background flex flex-col ${
                showChat ? "hidden" : "flex"
              } lg:flex`}
            >
              <div className="p-4 border-b flex items-center justify-between">
                <h1 className="text-xl font-bold">Messages</h1>
                <div className="flex items-center gap-2">
                  <Circle
                    className={`w-2 h-2 fill-current ${
                      socket?.connected ? "text-green-500" : "text-red-500"
                    }`}
                  />
                  <span className="text-xs text-muted-foreground">
                    {socket?.connected ? "Online" : "Offline"}
                  </span>
                </div>
              </div>
              
              <div className="p-2">
                <div className="relative">
                  <Search
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                    size={18}
                  />
                  <Input
                    placeholder="Search conversations..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto">
                {loadingConversations ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : filteredConversations.length > 0 ? (
                  filteredConversations.map((conv, index) => (
                    <div
                      key={conv.id}
                      onClick={() => handleChatSelect(index)}
                      className={`flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-muted/50 transition-colors relative ${
                        selectedChat !== null &&
                        conversations[selectedChat]?.id === conv.id
                          ? "bg-muted"
                          : ""
                      }`}
                    >
                      <div className="relative">
                        <Avatar className="h-12 w-12">
                          {conv.avatar ? (
                            <AvatarImage src={conv.avatar} alt={conv.name} />
                          ) : (
                            <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-primary-foreground">
                              {conv.initials || conv.name?.[0]}
                            </AvatarFallback>
                          )}
                        </Avatar>
                        {conv.isOnline && (
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-background rounded-full"></div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold truncate">{conv.name}</h3>
                          {conv.unreadCount > 0 && (
                            <span className="bg-primary text-primary-foreground text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                              {conv.unreadCount > 99 ? "99+" : conv.unreadCount}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground truncate">
                          {typingUsers[conv.id] ? "Typing..." : conv.lastMessage}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                    <MessageSquare className="w-12 h-12 mb-2" />
                    <p>No conversations found</p>
                    <p className="text-sm">Connect with people to start chatting</p>
                  </div>
                )}
              </div>
            </aside>

            {/* Chat Window */}
            <div
              className={`flex-1 flex flex-col ${
                !showChat ? "hidden" : "flex"
              } lg:flex`}
            >
              {!selectedChat && selectedChat !== 0 ? (
                <div className="flex flex-1 items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-medium mb-2">Select a conversation</h3>
                    <p>Choose a conversation from the sidebar to start messaging</p>
                  </div>
                </div>
              ) : (
                <>
                  {/* Chat Header */}
                  <div className="flex items-center justify-between p-4 border-b bg-background sticky top-0 z-10">
                    <div className="flex items-center gap-3">
                      <button
                        className="lg:hidden p-2 -ml-2 hover:bg-muted rounded-full transition-colors"
                        onClick={() => setShowChat(false)}
                      >
                        <ArrowLeft size={20} />
                      </button>
                      <div className="relative">
                        <Avatar className="h-10 w-10">
                          {conversations[selectedChat!]?.avatar ? (
                            <AvatarImage 
                              src={conversations[selectedChat!].avatar} 
                              alt={conversations[selectedChat!].name} 
                            />
                          ) : (
                            <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-primary-foreground">
                              {conversations[selectedChat!]?.initials ||
                                conversations[selectedChat!]?.name?.[0]}
                            </AvatarFallback>
                          )}
                        </Avatar>
                        {conversations[selectedChat!]?.isOnline && (
                          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-background rounded-full"></div>
                        )}
                      </div>
                      <div 
                        onClick={() => handleUserClick(conversations[selectedChat!]?.id)} 
                        className="cursor-pointer hover:opacity-80 transition-opacity"
                      >
                        <h2 className="font-semibold">
                          {conversations[selectedChat!]?.name}
                        </h2>
                        <p className="text-xs text-muted-foreground">
                          {typingUsers[conversations[selectedChat!]?.id] 
                            ? "Typing..." 
                            : conversations[selectedChat!]?.isOnline 
                            ? "Online" 
                            : "Last seen recently"
                          }
                        </p>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <Info size={18} />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem 
                          onClick={() => handleUserClick(conversations[selectedChat!]?.id)}
                        >
                          View Profile
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={handleClearChat}>
                          Clear Chat
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          Block User
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* Messages Area */}
                  <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
                    {loadingMessages ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                      </div>
                    ) : (
                      <>
                        {(messages[currentConversationId!] || []).map((message) => (
                          <div
                            key={`${message._id}-${message.createdAt}`}
                            className={`flex ${
                              message.isMe ? "justify-end" : "justify-start"
                            }`}
                          >
                            <div className="max-w-xs lg:max-w-md xl:max-w-lg">
                              <div
                                className={`px-4 py-2 text-sm shadow break-words ${
                                  message.isMe
                                    ? "bg-primary text-primary-foreground rounded-2xl rounded-br-sm"
                                    : "bg-muted text-foreground rounded-2xl rounded-bl-sm"
                                }`}
                              >
                                <p className="whitespace-pre-wrap">{message.content}</p>
                              </div>
                              <p className={`text-xs text-muted-foreground mt-1 ${
                                message.isMe ? "text-right" : "text-left"
                              }`}>
                                {formatTime(message.createdAt)}
                                {message.isMe && (
                                  <span className="ml-1">
                                    {message.readAt ? "✓✓" : message.deliveredAt ? "✓" : "○"}
                                  </span>
                                )}
                              </p>
                            </div>
                          </div>
                        ))}
                        
                        {/* Typing indicator */}
                        {typingUsers[currentConversationId!] && (
                          <div className="flex justify-start">
                            <div className="bg-muted text-foreground rounded-2xl rounded-bl-sm px-4 py-2 max-w-xs">
                              <div className="flex space-x-1">
                                <div className="w-2 h-2 bg-current rounded-full animate-bounce"></div>
                                <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                              </div>
                            </div>
                          </div>
                        )}
                        
                        <div ref={messagesEndRef} />
                      </>
                    )}
                  </div>

                  {/* Message Input */}
                  <div className="flex items-end space-x-2 border-t p-4 bg-background">
                    <Input
                      placeholder="Type a message..."
                      value={newMessage}
                      onChange={(e) => {
                        setNewMessage(e.target.value);
                        handleTyping();
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                      className="flex-1 max-h-32 resize-none"
                      disabled={loadingMessages}
                    />
                    <Button 
                      onClick={handleSendMessage} 
                      disabled={!newMessage.trim() || loadingMessages}
                      size="icon"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        </main>
      </AnimatedBackground>
    </div>
  );
}