import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/lib/authContext";
import { format } from "date-fns";
import { ArrowLeft, Send, Image, Share, ChevronLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { fadeInUp } from "@/lib/animations";
import { Link, useLocation } from "wouter";

interface ChatWindowProps {
  userId: number;
  listingId: number;
}

const ChatWindow = ({ userId, listingId }: ChatWindowProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [location, navigate] = useLocation();
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  
  // Get conversation messages
  const { data: messages, isLoading: messagesLoading } = useQuery({
    queryKey: [`/api/messages/${userId}/${listingId}`],
    enabled: !!user && !!userId && !!listingId,
    refetchInterval: 5000, // Poll for new messages every 5 seconds
  });
  
  // Get listing details for context
  const { data: listing, isLoading: listingLoading } = useQuery({
    queryKey: [`/api/listings/${listingId}`],
    enabled: !!listingId,
  });

  // Scroll to bottom when messages update
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async () => {
      if (!message.trim()) return;
      
      await apiRequest("POST", "/api/messages", {
        receiverId: userId,
        listingId: listingId,
        content: message.trim(),
      });
    },
    onSuccess: () => {
      setMessage("");
      queryClient.invalidateQueries({ queryKey: [`/api/messages/${userId}/${listingId}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/messages"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to send message",
        variant: "destructive",
      });
    },
  });

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      sendMessageMutation.mutate();
    }
  };

  // Format message timestamp
  const formatMessageTime = (timestamp) => {
    const date = new Date(timestamp);
    return format(date, 'h:mm a'); // e.g. 2:30 PM
  };

  // Group messages by date
  const groupMessagesByDate = (messages) => {
    if (!messages || messages.length === 0) return [];
    
    const groups = [];
    let currentDate = '';
    let currentGroup = null;
    
    messages.forEach(message => {
      const messageDate = format(new Date(message.createdAt), 'MMMM d, yyyy');
      
      if (messageDate !== currentDate) {
        currentDate = messageDate;
        currentGroup = { date: messageDate, messages: [] };
        groups.push(currentGroup);
      }
      
      currentGroup.messages.push(message);
    });
    
    return groups;
  };

  const messageGroups = groupMessagesByDate(messages);

  if (messagesLoading || listingLoading) {
    return (
      <div className="h-full flex flex-col p-4">
        <div className="animate-pulse">
          <div className="h-10 bg-gray-200 rounded-lg w-3/4 mb-4"></div>
          <div className="flex mb-8">
            <div className="w-10 h-10 bg-gray-200 rounded-full mr-3"></div>
            <div className="flex-1">
              <div className="h-5 bg-gray-200 rounded w-1/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
          <div className="space-y-3 mb-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex justify-end">
                <div className="bg-gray-200 rounded-lg p-3 max-w-[80%] w-1/2 h-16"></div>
              </div>
            ))}
            {[1, 2].map(i => (
              <div key={i} className="flex">
                <div className="w-8 h-8 bg-gray-200 rounded-full mr-2"></div>
                <div className="bg-gray-200 rounded-lg p-3 max-w-[80%] w-2/3 h-12"></div>
              </div>
            ))}
          </div>
          <div className="h-12 bg-gray-200 rounded-lg w-full"></div>
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6">
        <div className="text-center">
          <h3 className="font-medium text-gray-700 mb-2">Conversation not found</h3>
          <p className="text-sm text-gray-500 mb-4">
            This conversation may have been deleted or is no longer available.
          </p>
          <Button asChild>
            <Link href="/messages">Back to Messages</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b flex items-center">
        <Link href="/messages" className="md:hidden mr-2">
          <Button variant="ghost" size="icon">
            <ChevronLeft className="h-5 w-5" />
          </Button>
        </Link>
        
        <div className="flex items-center flex-1">
          <Avatar className="h-10 w-10 mr-3">
            <AvatarImage 
              src={listing.seller?.avatar} 
              alt={listing.seller?.displayName} 
            />
            <AvatarFallback className="bg-[#6B46C1] text-white">
              {listing.seller?.displayName?.charAt(0).toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-medium">{listing.seller?.displayName}</h3>
            <p className="text-xs text-gray-500">About: {listing.title}</p>
          </div>
        </div>
        
        <div className="flex space-x-1">
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/listing/${listingId}`}>
              <Share className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
      
      {/* Listing Info */}
      <div className="px-4 py-3 bg-gray-50 border-b">
        <div className="flex items-center">
          <div className="h-14 w-14 rounded overflow-hidden bg-gray-200 mr-3">
            {listing.images && listing.images.length > 0 ? (
              <img 
                src={listing.images[0]} 
                alt={listing.title} 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-300 text-gray-500 text-xs">
                No image
              </div>
            )}
          </div>
          <div className="flex-1">
            <h4 className="font-medium line-clamp-1">{listing.title}</h4>
            <p className="text-[#6B46C1] font-bold">${listing.price.toFixed(2)}</p>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href={`/listing/${listingId}`}>View</Link>
          </Button>
        </div>
      </div>
      
      {/* Messages */}
      <div 
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-6"
      >
        {messageGroups.length > 0 ? (
          messageGroups.map((group, groupIndex) => (
            <div key={groupIndex} className="space-y-4">
              <div className="text-center">
                <span className="text-xs font-medium text-gray-500 px-2 py-1 bg-gray-100 rounded-full">
                  {group.date}
                </span>
              </div>
              
              <AnimatePresence>
                {group.messages.map((msg, index) => {
                  const isSentByMe = msg.senderId === user?.id;
                  
                  return (
                    <motion.div
                      key={msg.id}
                      variants={fadeInUp}
                      initial="initial"
                      animate="animate"
                      className={`flex ${isSentByMe ? 'justify-end' : 'items-start'}`}
                    >
                      {!isSentByMe && (
                        <Avatar className="h-8 w-8 mr-2 mt-1">
                          <AvatarImage 
                            src={listing.seller?.avatar} 
                            alt={listing.seller?.displayName} 
                          />
                          <AvatarFallback className="bg-[#6B46C1] text-white text-xs">
                            {listing.seller?.displayName?.charAt(0).toUpperCase() || "U"}
                          </AvatarFallback>
                        </Avatar>
                      )}
                      <div className={`
                        max-w-[75%] rounded-lg px-4 py-2 mb-1
                        ${isSentByMe 
                          ? 'bg-[#6B46C1] text-white rounded-br-none' 
                          : 'bg-gray-100 text-gray-800 rounded-bl-none'
                        }
                      `}>
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                        <div className={`text-xs mt-1 ${isSentByMe ? 'text-purple-200' : 'text-gray-500'}`}>
                          {formatMessageTime(msg.createdAt)}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          ))
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center p-6">
            <div className="w-16 h-16 rounded-full bg-[#6B46C1]/10 flex items-center justify-center mb-4">
              <MessageSquare className="h-8 w-8 text-[#6B46C1]" />
            </div>
            <h3 className="font-medium text-gray-800 mb-2">Start a conversation</h3>
            <p className="text-sm text-gray-500 max-w-md">
              This is the beginning of your conversation about "{listing.title}". 
              Send a message to get started.
            </p>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      {/* Message Input */}
      <div className="p-4 border-t">
        <form onSubmit={handleSendMessage} className="flex items-end gap-2">
          <div className="flex-1 relative">
            <Textarea
              placeholder="Type a message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="min-h-[60px] resize-none pr-12 py-3"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage(e);
                }
              }}
            />
          </div>
          <Button 
            type="submit" 
            size="icon"
            className="h-10 w-10 rounded-full bg-[#6B46C1] hover:bg-[#6B46C1]/90"
            disabled={!message.trim() || sendMessageMutation.isPending}
          >
            {sendMessageMutation.isPending ? (
              <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </form>
      </div>
    </div>
  );
};

// MessageSquare icon for empty state
const MessageSquare = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

export default ChatWindow;
