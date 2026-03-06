import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Search } from "lucide-react";

interface ChatListProps {
  conversations: any[];
  searchTerm: string;
  selectedChat: number | null;
  setSearchTerm: (term: string) => void;
  onSelectChat: (index: number) => void;
}

export function ChatList({
  conversations,
  searchTerm,
  selectedChat,
  setSearchTerm,
  onSelectChat,
}: ChatListProps) {
  const filtered = conversations.filter(
    (conv) =>
      conv.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conv.lastMessage.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Card className="h-full flex flex-col overflow-hidden">
      <div className="p-4 border-b">
        <h1 className="text-2xl font-bold mb-4">Messages</h1>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <Input
            placeholder="Search conversations..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {filtered.map((conv, index) => (
          <div
            key={conv.id}
            onClick={() => onSelectChat(index)}
            className={`p-4 cursor-pointer hover:bg-muted/50 transition-colors border-l-4 ${
              selectedChat === index ? "border-primary bg-primary/5" : "border-transparent"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="relative">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-primary-foreground">
                    {conv.initials}
                  </AvatarFallback>
                </Avatar>
                <div
                  className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-background ${
                    conv.status === "online"
                      ? "bg-success"
                      : conv.status === "away"
                      ? "bg-warning"
                      : "bg-muted-foreground"
                  }`}
                />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold truncate">{conv.name}</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">{conv.time}</span>
                    {conv.unread > 0 && (
                      <div className="bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {conv.unread}
                      </div>
                    )}
                  </div>
                </div>
                <p className="text-sm text-muted-foreground truncate">{conv.lastMessage}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
