import { useAuth } from "@/lib/auth";
import { useChats, useMessages, useSendMessage } from "@/lib/api-hooks";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState, useEffect, useRef } from "react";
import { Send, Mail, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useToast } from "@/hooks/use-toast";

export default function Messages() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Get active chat from URL
  const searchParams = new URLSearchParams(window.location.search);
  const activeChatId = searchParams.get("chat") || undefined;
  
  const [inputText, setInputText] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  // Fetch chats and messages
  const { data: chats, isLoading: chatsLoading } = useChats();
  const { data: messages, isLoading: messagesLoading } = useMessages(activeChatId);
  const sendMessageMutation = useSendMessage(activeChatId || "");

  if (!user) {
    return <div className="p-8 text-center">Please log in to view messages.</div>;
  }

  const activeChat = chats?.find((c) => c.id === activeChatId);
  
  const activeMessages = messages || [];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [activeMessages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activeChatId) return;

    try {
      await sendMessageMutation.mutateAsync({ content: inputText });
      setInputText("");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getOtherParticipantId = (chatId: string) => {
    const chat = chats?.find(c => c.id === chatId);
    if (!chat) return null;
    return chat.participants.find(id => id !== user.id);
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
            {chatsLoading ? (
              <div className="p-8 text-center" data-testid="loader-chats">
                <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
              </div>
            ) : chats && chats.length > 0 ? (
              <div className="flex flex-col">
                {chats.map((chat) => {
                  const otherParticipantId = getOtherParticipantId(chat.id);
                  const isActive = chat.id === activeChatId;

                  return (
                    <a 
                      key={chat.id} 
                      href={`/messages?chat=${chat.id}`}
                      className={`p-4 flex items-start gap-3 hover-elevate transition-colors border-b ${isActive ? "bg-muted/50" : ""}`}
                      data-testid={`chat-item-${chat.id}`}
                    >
                      <Avatar>
                        <AvatarImage src="" />
                        <AvatarFallback>?</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-baseline mb-1">
                          <span className="font-semibold text-sm truncate" data-testid={`text-chat-participant-${chat.id}`}>
                            User {otherParticipantId?.substring(0, 8)}
                          </span>
                          <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                            {formatDistanceToNow(new Date(chat.lastMessageTime), { addSuffix: true })}
                          </span>
                        </div>
                        {chat.productId && (
                          <p className="text-xs text-muted-foreground truncate font-medium">
                            RE: Product {chat.productId.substring(0, 8)}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground truncate mt-1" data-testid={`text-last-message-${chat.id}`}>
                          {chat.lastMessage}
                        </p>
                      </div>
                    </a>
                  );
                })}
              </div>
            ) : (
              <div className="p-8 text-center text-sm text-muted-foreground" data-testid="text-no-chats">
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
                  <AvatarImage src="" />
                  <AvatarFallback>?</AvatarFallback>
                </Avatar>
                <div>
                  <span className="font-semibold block leading-none" data-testid="text-chat-participant">
                    User {getOtherParticipantId(activeChat.id)?.substring(0, 8)}
                  </span>
                  {activeChat.productId && (
                    <span className="text-xs text-muted-foreground">
                      Regarding: Product {activeChat.productId.substring(0, 8)}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/5" ref={scrollRef}>
              {messagesLoading ? (
                <div className="flex justify-center items-center h-full" data-testid="loader-messages">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : activeMessages.length > 0 ? (
                activeMessages.map((msg) => {
                  const isMe = msg.senderId === user.id;
                  return (
                    <div 
                      key={msg.id} 
                      className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                      data-testid={`message-${msg.id}`}
                    >
                      <div className={`max-w-[70%] rounded-2xl px-4 py-2 text-sm ${isMe ? "bg-primary text-primary-foreground rounded-tr-none" : "bg-muted text-foreground rounded-tl-none"}`}>
                        {msg.content}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="flex justify-center items-center h-full text-sm text-muted-foreground" data-testid="text-no-messages">
                  No messages yet. Start the conversation!
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-4 border-t bg-background">
              <form onSubmit={handleSend} className="flex gap-2">
                <Input 
                  value={inputText} 
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Type a message..." 
                  className="flex-1"
                  disabled={sendMessageMutation.isPending}
                  data-testid="input-message"
                />
                <Button 
                  type="submit" 
                  size="icon"
                  disabled={sendMessageMutation.isPending || !inputText.trim()}
                  data-testid="button-send-message"
                >
                  {sendMessageMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </form>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <Mail className="h-12 w-12 mb-4 opacity-20" />
            <p data-testid="text-select-chat">Select a conversation to start chatting</p>
          </div>
        )}
      </div>
    </div>
  );
}
