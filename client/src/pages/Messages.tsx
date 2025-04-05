import { useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/authContext";
import { pageTransition } from "@/lib/animations";
import ChatList from "@/components/messages/ChatList";
import ChatWindow from "@/components/messages/ChatWindow";

const Messages = () => {
  const { userId, listingId } = useParams();
  const [location, navigate] = useLocation();
  const { user } = useAuth();

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      navigate("/");
    }
  }, [user, navigate]);

  if (!user) return null;

  // If user is on the main messages page without a specific conversation
  if (!userId || !listingId) {
    return (
      <motion.div
        initial="initial"
        animate="animate"
        exit="exit"
        variants={pageTransition}
        className="h-[calc(100vh-250px)] min-h-[500px] flex flex-col md:flex-row"
      >
        <div className="w-full md:w-1/3 border-r border-gray-200">
          <ChatList />
        </div>
        <div className="hidden md:flex w-2/3 items-center justify-center bg-gray-50 p-6 text-center text-gray-500">
          <div>
            <h3 className="text-lg font-medium text-gray-800 mb-2">Select a conversation</h3>
            <p>Choose a conversation from the list to start messaging</p>
          </div>
        </div>
      </motion.div>
    );
  }

  // If user is viewing a specific conversation
  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageTransition}
      className="h-[calc(100vh-250px)] min-h-[500px] flex flex-col md:flex-row"
    >
      <div className="hidden md:block w-1/3 border-r border-gray-200">
        <ChatList activeUserId={parseInt(userId)} activeListingId={parseInt(listingId)} />
      </div>
      <div className="w-full md:w-2/3">
        <ChatWindow userId={parseInt(userId)} listingId={parseInt(listingId)} />
      </div>
    </motion.div>
  );
};

export default Messages;
