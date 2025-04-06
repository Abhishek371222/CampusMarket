import { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/lib/authContext';
import { Home, Tag, Heart, MessageSquare, Bell, Plus, X, Wallet, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';

const MobileMenu = () => {
  const [location] = useLocation();
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  // Get unread message count
  const { data: conversations } = useQuery({
    queryKey: ["/api/messages"],
    enabled: !!user,
  });

  const unreadMessageCount = conversations?.reduce(
    (count, conversation) => count + conversation.unreadCount,
    0
  ) || 0;

  const closeMenu = () => {
    setIsOpen(false);
  };

  // Listen for clicks on the mobile menu toggle button in the navbar
  useEffect(() => {
    const mobileNavOverlay = document.getElementById('mobileNavOverlay');
    const openMenuHandler = () => setIsOpen(true);
    
    // Create a MutationObserver to watch for class changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
          if (!mobileNavOverlay?.classList.contains('hidden')) {
            setIsOpen(true);
          }
        }
      });
    });
    
    if (mobileNavOverlay) {
      observer.observe(mobileNavOverlay, { attributes: true });
    }
    
    return () => {
      observer.disconnect();
    };
  }, []);

  // Fixed mobile sell button
  return (
    <>
      {/* Mobile menu overlay */}
      <div 
        id="mobileNavOverlay" 
        className={`fixed inset-0 bg-black bg-opacity-50 z-50 ${isOpen ? '' : 'hidden'}`}
        onClick={() => closeMenu()}
      >
        <AnimatePresence>
          {isOpen && (
            <motion.div 
              className="bg-white h-full w-64 shadow-xl" 
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="text-[#6B46C1] font-bold text-xl">
                    Campus<span className="text-[#ED8936]">Market</span>
                  </span>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-[#2D3748]"
                    onClick={() => closeMenu()}
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
              </div>
              <nav className="py-4">
                <Link href="/" onClick={closeMenu}>
                  <div className={`flex items-center px-4 py-3 text-[#2D3748] ${location === '/' ? 'bg-gray-100 text-[#6B46C1]' : 'hover:bg-gray-100'}`}>
                    <Home className="w-5 h-5 mr-3" />
                    <span>Home</span>
                  </div>
                </Link>
                {user && (
                  <>
                    <Link href="/my-listings" onClick={closeMenu}>
                      <div className={`flex items-center px-4 py-3 text-[#2D3748] ${location === '/my-listings' ? 'bg-gray-100 text-[#6B46C1]' : 'hover:bg-gray-100'}`}>
                        <Tag className="w-5 h-5 mr-3" />
                        <span>My Listings</span>
                      </div>
                    </Link>
                    <Link href="#" onClick={closeMenu}>
                      <div className={`flex items-center px-4 py-3 text-[#2D3748] hover:bg-gray-100`}>
                        <Heart className="w-5 h-5 mr-3" />
                        <span>Favorites</span>
                      </div>
                    </Link>
                    <Link href="/messages" onClick={closeMenu}>
                      <div className={`flex items-center px-4 py-3 text-[#2D3748] ${location === '/messages' ? 'bg-gray-100 text-[#6B46C1]' : 'hover:bg-gray-100'}`}>
                        <MessageSquare className="w-5 h-5 mr-3" />
                        <span>Messages</span>
                        {unreadMessageCount > 0 && (
                          <Badge variant="destructive" className="ml-auto bg-[#ED8936]">
                            {unreadMessageCount}
                          </Badge>
                        )}
                      </div>
                    </Link>
                    <Link href="#" onClick={closeMenu}>
                      <div className={`flex items-center px-4 py-3 text-[#2D3748] hover:bg-gray-100`}>
                        <Bell className="w-5 h-5 mr-3" />
                        <span>Notifications</span>
                        <Badge variant="destructive" className="ml-auto bg-[#ED8936]">
                          3
                        </Badge>
                      </div>
                    </Link>
                    <Link href="/wallet" onClick={closeMenu}>
                      <div className={`flex items-center px-4 py-3 text-[#2D3748] ${location === '/wallet' ? 'bg-gray-100 text-[#6B46C1]' : 'hover:bg-gray-100'}`}>
                        <Wallet className="w-5 h-5 mr-3" />
                        <span>Wallet</span>
                      </div>
                    </Link>
                    <Link href="/support" onClick={closeMenu}>
                      <div className={`flex items-center px-4 py-3 text-[#2D3748] ${location === '/support' ? 'bg-gray-100 text-[#6B46C1]' : 'hover:bg-gray-100'}`}>
                        <HelpCircle className="w-5 h-5 mr-3" />
                        <span>Support Chat</span>
                      </div>
                    </Link>
                    <div className="border-t border-gray-200 my-2"></div>
                    <Link href="/create-listing" onClick={closeMenu}>
                      <div className={`flex items-center px-4 py-3 text-[#6B46C1] font-medium ${location === '/create-listing' ? 'bg-gray-100' : 'hover:bg-gray-100'}`}>
                        <Plus className="w-5 h-5 mr-3" />
                        <span>Sell an Item</span>
                      </div>
                    </Link>
                  </>
                )}
                {!user && (
                  <div className="px-4 py-3">
                    <Link href="/" onClick={closeMenu}>
                      <Button className="w-full bg-[#6B46C1] hover:bg-[#6B46C1]/90 text-white">
                        Login
                      </Button>
                    </Link>
                  </div>
                )}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* Mobile Sell Button (Fixed) */}
      {user && (
        <div className="md:hidden fixed bottom-4 right-4 z-40">
          <Link href="/create-listing">
            <Button 
              className="bg-[#ED8936] hover:bg-[#ED8936]/90 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg p-0"
            >
              <Plus className="h-6 w-6" />
            </Button>
          </Link>
        </div>
      )}
    </>
  );
};

export default MobileMenu;
