import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/authContext";
import { motion } from "framer-motion";
import { fadeInUp, pageTransition } from "@/lib/animations";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, Send, HelpCircle } from "lucide-react";

type ChatMessage = {
  id: number;
  userId: number;
  content: string;
  isFromUser: boolean;
  createdAt: string;
  isRead: boolean;
};

export default function ChatSupportPage() {
  const { user } = useAuth();
  const [message, setMessage] = useState("");
  const messageContainerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Query for chat messages
  const chatQuery = useQuery({
    queryKey: ['/api/chat-support'],
    queryFn: () => apiRequest('GET', '/api/chat-support').then(res => res.json()),
    enabled: !!user,
    refetchInterval: 10000, // Refetch every 10 seconds
  });

  // Mutation for sending messages
  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      return apiRequest('POST', '/api/chat-support', { content })
        .then(res => res.json());
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/chat-support'] });
      setMessage("");
    },
    onError: () => {
      toast({
        title: "Failed to Send",
        description: "Your message couldn't be sent. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      sendMessageMutation.mutate(message);
    }
  };

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (messageContainerRef.current) {
      messageContainerRef.current.scrollTop = messageContainerRef.current.scrollHeight;
    }
  }, [chatQuery.data]);

  if (!user) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>
              Please log in to access chat support.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" onClick={() => window.location.href = "/login"}>
              Log In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <motion.div
      className="container max-w-3xl py-12"
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageTransition}
    >
      <div className="mb-8">
        <motion.h1 
          className="text-3xl font-bold" 
          variants={fadeInUp}
        >
          <HelpCircle className="inline-block mr-2 h-8 w-8" /> Chat Support
        </motion.h1>
        <motion.p 
          className="text-muted-foreground mt-2"
          variants={fadeInUp}
        >
          Get help from our support team
        </motion.p>
      </div>

      <motion.div 
        className="grid gap-6"
        variants={fadeInUp}
      >
        <Card className="overflow-hidden">
          <CardHeader className="bg-primary/5 border-b">
            <div className="flex items-center">
              <Avatar className="h-10 w-10 mr-3">
                <AvatarImage src="/assets/support-avatar.png" alt="Support" />
                <AvatarFallback>CS</AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-lg">Campus Support</CardTitle>
                <CardDescription>
                  {chatQuery.isSuccess && chatQuery.data.length > 0 ? 'Online' : 'Typically replies within an hour'}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0 flex flex-col h-[60vh]">
            <div 
              ref={messageContainerRef}
              className="flex-1 overflow-y-auto p-4 space-y-4"
            >
              {chatQuery.isLoading ? (
                <div className="flex justify-center items-center h-full">
                  <Loader2 className="h-8 w-8 animate-spin text-primary/70" />
                </div>
              ) : chatQuery.isError ? (
                <div className="flex justify-center items-center h-full text-red-500">
                  Failed to load messages. Please try refreshing.
                </div>
              ) : chatQuery.data.length === 0 ? (
                <div className="flex flex-col justify-center items-center h-full text-center text-muted-foreground">
                  <HelpCircle className="h-12 w-12 mb-4 text-primary/50" />
                  <p>Start a conversation with our support team.</p>
                  <p className="text-sm mt-2">We're here to help with any questions about the marketplace!</p>
                </div>
              ) : (
                chatQuery.data.map((msg: ChatMessage) => (
                  <div 
                    key={msg.id} 
                    className={`flex ${msg.isFromUser ? 'justify-end' : 'justify-start'}`}
                  >
                    {!msg.isFromUser && (
                      <Avatar className="h-8 w-8 mr-2 mt-1 flex-shrink-0">
                        <AvatarImage src="/assets/support-avatar.png" alt="Support" />
                        <AvatarFallback>CS</AvatarFallback>
                      </Avatar>
                    )}
                    <div 
                      className={`max-w-[75%] rounded-lg p-3 ${
                        msg.isFromUser 
                          ? 'bg-primary text-primary-foreground' 
                          : 'bg-muted'
                      }`}
                    >
                      <p>{msg.content}</p>
                      <p className={`text-xs mt-1 ${
                        msg.isFromUser 
                          ? 'text-primary-foreground/70' 
                          : 'text-muted-foreground'
                      }`}>
                        {new Date(msg.createdAt).toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    {msg.isFromUser && (
                      <Avatar className="h-8 w-8 ml-2 mt-1 flex-shrink-0">
                        <AvatarImage src={user.avatar} alt={user.displayName} />
                        <AvatarFallback>{user.displayName?.substring(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                ))
              )}
            </div>
            
            <form 
              onSubmit={handleSendMessage}
              className="p-4 border-t bg-card flex items-center gap-2"
            >
              <Input
                placeholder="Type your message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                disabled={sendMessageMutation.isPending}
                className="flex-1"
              />
              <Button 
                type="submit" 
                size="icon" 
                disabled={!message.trim() || sendMessageMutation.isPending}
              >
                {sendMessageMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Additional information card */}
        <Card>
          <CardHeader>
            <CardTitle>Need More Help?</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              For urgent matters, you can also reach us at support@campus-marketplace.com or call our 
              helpline at +91 1234567890 during business hours (9 AM - 6 PM IST).
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}