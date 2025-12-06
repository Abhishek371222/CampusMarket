import { useAuth } from "@/lib/auth";
import { useMarketStore } from "@/lib/mockData";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useLocation } from "wouter";
import { useState, useEffect, useRef } from "react";
import { Send, Mail } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function Messages() {
  const { user } = useAuth();
  const [location] = useLocation();
  const { chats, messages, users, products, sendMessage } = useMarketStore();
  
  // Get active chat from URL
  const searchParams = new URLSearchParams(window.location.search);
  const activeChatId = searchParams.get("chat");
  const [inputText, setInputText] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  if (!user) {
     // Basic redirect if not logged in
     return <div className="p-8 text-center">Please log in to view messages.</div>;
  }

  const myChats = chats.filter((c) => c.participants.includes(user.id));
  const activeChat = myChats.find((c) => c.id === activeChatId);
  
  const activeMessages = activeChat 
    ? messages.filter((m) => m.chatId === activeChat.id).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
    : [];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [activeMessages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputText.trim() && activeChatId) {
      sendMessage(activeChatId, inputText);
      setInputText("");
    }
  };

  const getOtherParticipant = (chatId: string) => {
    const chat = chats.find(c => c.id === chatId);
    if (!chat) return null;
    const otherId = chat.participants.find(id => id !== user.id);
    return users.find(u => u.id === otherId);
  };

  return (
    <div className="container h-[calc(100vh-4rem)] md:h-[calc(100vh-8rem)] py-6">
      <div className="grid md:grid-cols-[300px_1fr] h-full gap-6 bg-card rounded-xl border overflow-hidden shadow-sm">
        
        {/* Chat List */}
        <div className="border-r flex flex-col bg-muted/10">
          <div className="p-4 border-b font-heading font-semibold text-lg">
            Messages
          </div>
          <ScrollArea className="flex-1">
            {myChats.length > 0 ? (
              <div className="flex flex-col">
                {myChats.map((chat) => {
                  const otherUser = getOtherParticipant(chat.id);
                  const product = products.find(p => p.id === chat.productId);
                  const isActive = chat.id === activeChatId;

                  return (
                    <a 
                      key={chat.id} 
                      href={`/messages?chat=${chat.id}`}
                      className={`p-4 flex items-start gap-3 hover:bg-muted/50 transition-colors border-b ${isActive ? "bg-muted/50" : ""}`}
                    >
                      <Avatar>
                        <AvatarImage src={otherUser?.avatar} />
                        <AvatarFallback>{otherUser?.name[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-baseline mb-1">
                          <span className="font-semibold text-sm truncate">{otherUser?.name}</span>
                          <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                            {formatDistanceToNow(new Date(chat.lastMessageTime), { addSuffix: true })}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground truncate font-medium">
                           {product ? `RE: ${product.title}` : "Chat"}
                        </p>
                        <p className="text-xs text-muted-foreground truncate mt-1">
                          {chat.lastMessage}
                        </p>
                      </div>
                    </a>
                  );
                })}
              </div>
            ) : (
              <div className="p-8 text-center text-sm text-muted-foreground">
                No conversations yet.
              </div>
            )}
          </ScrollArea>
        </div>

        {/* Chat Area */}
        {activeChat ? (
          <div className="flex flex-col h-full">
             {/* Header */}
             <div className="p-4 border-b flex items-center justify-between bg-background">
                <div className="flex items-center gap-3">
                   <Avatar className="h-8 w-8">
                      <AvatarImage src={getOtherParticipant(activeChat.id)?.avatar} />
                      <AvatarFallback>?</AvatarFallback>
                   </Avatar>
                   <div>
                      <span className="font-semibold block leading-none">{getOtherParticipant(activeChat.id)?.name}</span>
                      {activeChat.productId && (
                         <span className="text-xs text-muted-foreground">
                            Regarding: {products.find(p => p.id === activeChat.productId)?.title || "Item"}
                         </span>
                      )}
                   </div>
                </div>
             </div>

             {/* Messages */}
             <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/5" ref={scrollRef}>
                {activeMessages.map((msg) => {
                   const isMe = msg.senderId === user.id;
                   return (
                      <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                         <div className={`max-w-[70%] rounded-2xl px-4 py-2 text-sm ${isMe ? "bg-primary text-primary-foreground rounded-tr-none" : "bg-muted text-foreground rounded-tl-none"}`}>
                            {msg.content}
                         </div>
                      </div>
                   );
                })}
             </div>

             {/* Input */}
             <div className="p-4 border-t bg-background">
                <form onSubmit={handleSend} className="flex gap-2">
                   <Input 
                      value={inputText} 
                      onChange={(e) => setInputText(e.target.value)}
                      placeholder="Type a message..." 
                      className="flex-1"
                   />
                   <Button type="submit" size="icon">
                      <Send className="h-4 w-4" />
                   </Button>
                </form>
             </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
             <Mail className="h-12 w-12 mb-4 opacity-20" />
             <p>Select a conversation to start chatting</p>
          </div>
        )}
      </div>
    </div>
  );
}
