import { useState, useEffect } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/authContext";
import { format } from "date-fns";
import { MessageSquare, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { listItemVariants, staggerContainer } from "@/lib/animations";

interface ChatListProps {
  activeUserId?: number;
  activeListingId?: number;
}

const ChatList = ({ activeUserId, activeListingId }: ChatListProps) => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  
  const { data: conversations, isLoading } = useQuery({
    queryKey: ["/api/messages"],
    enabled: !!user,
    refetchInterval: 10000, // Refetch every 10 seconds to check for new messages
  });
  
  // Filter conversations based on search term
  const filteredConversations = conversations?.filter(conversation => {
    const otherUserName = conversation.otherUser.displayName.toLowerCase();
    const listingTitle = conversation.listing.title.toLowerCase();
    const search = searchTerm.toLowerCase();
    
    return otherUserName.includes(search) || listingTitle.includes(search);
  });

  // Format the timestamp to relative time
  const formatMessageTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) {
      return format(date, 'h:mm a'); // Today: 2:30 PM
    } else if (diffInDays === 1) {
      return 'Yesterday';
    } else if (diffInDays < 7) {
      return format(date, 'EEEE'); // Day of week: Monday
    } else {
      return format(date, 'MMM d'); // Jan 5
    }
  };

  // Get the last message for preview
  const getLastMessagePreview = (messages) => {
    if (!messages || messages.length === 0) return "No messages yet";
    const lastMessage = messages[messages.length - 1];
    const maxLength = 30;
    
    let preview = lastMessage.content;
    if (preview.length > maxLength) {
      preview = preview.substring(0, maxLength) + "...";
    }
    
    return preview;
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold mb-4">Messages</h2>
        <div className="relative">
          <Input
            type="text"
            placeholder="Search messages..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        </div>
      </div>
      
      <div className="flex-grow overflow-auto">
        {isLoading ? (
          <div className="p-4 space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center p-3 rounded-lg animate-pulse">
                <div className="w-10 h-10 bg-gray-200 rounded-full mr-3"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredConversations?.length ? (
          <motion.div 
            className="p-1"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            {filteredConversations.map((conversation) => (
              <motion.div
                key={`${conversation.otherUser.id}-${conversation.listing.id}`}
                variants={listItemVariants}
              >
                <Link href={`/messages/${conversation.otherUser.id}/${conversation.listing.id}`}>
                  <a className={`flex items-start p-3 rounded-lg hover:bg-gray-100 transition-colors ${
                    activeUserId === conversation.otherUser.id && 
                    activeListingId === conversation.listing.id ? 
                    'bg-[#6B46C1]/10' : ''
                  }`}>
                    <Avatar className="h-10 w-10 mr-3">
                      <AvatarImage src={conversation.otherUser.avatar} alt={conversation.otherUser.displayName} />
                      <AvatarFallback className="bg-[#6B46C1] text-white">
                        {conversation.otherUser.displayName.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between">
                        <span className="font-medium truncate">
                          {conversation.otherUser.displayName}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatMessageTime(conversation.lastMessageAt)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 truncate">
                        {getLastMessagePreview(conversation.messages)}
                      </p>
                      <div className="flex items-center mt-1">
                        <span className="text-xs text-gray-500 truncate">
                          {conversation.listing.title}
                        </span>
                        {conversation.unreadCount > 0 && (
                          <Badge 
                            variant="destructive" 
                            className="ml-auto py-0 h-5 min-w-5 bg-[#ED8936]"
                          >
                            {conversation.unreadCount}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </a>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full p-4 text-center">
            <MessageSquare className="h-12 w-12 text-gray-300 mb-3" />
            {searchTerm ? (
              <>
                <h3 className="font-medium text-gray-700 mb-1">No matching conversations</h3>
                <p className="text-sm text-gray-500">
                  Try a different search term
                </p>
              </>
            ) : (
              <>
                <h3 className="font-medium text-gray-700 mb-1">No conversations yet</h3>
                <p className="text-sm text-gray-500">
                  Messages from sellers and buyers will appear here
                </p>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatList;
