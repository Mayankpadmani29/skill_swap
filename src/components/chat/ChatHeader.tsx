import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ArrowLeft, MoreVertical } from "lucide-react";

interface ChatHeaderProps {
  conversation: any;
  onBack: () => void;
  onClearChat: () => void;
}

export function ChatHeader({ conversation, onBack, onClearChat }: ChatHeaderProps) {
  return (
    <div className="p-4 border-b flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button className="lg:hidden p-2 -ml-2" onClick={onBack}>
          <ArrowLeft size={20} />
        </button>
        <Avatar className="h-10 w-10">
          <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-primary-foreground">
            {conversation.initials}
          </AvatarFallback>
        </Avatar>
        <div>
          <h2 className="font-semibold">{conversation.name}</h2>
          <p className="text-sm text-muted-foreground capitalize">{conversation.status}</p>
        </div>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm">
            <MoreVertical size={18} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => alert("View Profile clicked")}>
            View Profile
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onClearChat}>
            Clear Chat
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => alert("Delete Conversation clicked")}>
            Delete Conversation
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
