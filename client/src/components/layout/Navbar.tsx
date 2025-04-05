import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/authContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Bell,
  MessageSquare,
  Plus,
  Menu,
  X,
  User,
  LogOut,
  Settings
} from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";

const Navbar = () => {
  const [location, navigate] = useLocation();
  const { user, logout, login } = useAuth();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileSearchVisible, setMobileSearchVisible] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [loginData, setLoginData] = useState({ username: "", password: "" });

  // Get unread message count
  const { data: conversations } = useQuery({
    queryKey: ["/api/messages"],
    enabled: !!user,
  });

  const unreadMessageCount = conversations?.reduce(
    (count, conversation) => count + conversation.unreadCount,
    0
  ) || 0;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(loginData.username, loginData.password);
      setLoginOpen(false);
      toast({
        title: "Logged in successfully",
        description: `Welcome back, ${loginData.username}!`,
      });
    } catch (error) {
      toast({
        title: "Login failed",
        description: "Invalid username or password",
        variant: "destructive",
      });
    }
  };

  const handleLogout = async () => {
    await logout();
    toast({
      title: "Logged out successfully",
      description: "Come back soon!",
    });
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden text-[#2D3748]"
            onClick={() => document.getElementById("mobileNavOverlay")?.classList.remove("hidden")}
          >
            <Menu />
          </Button>
          <Link href="/" className="flex items-center">
            <span className="text-[#6B46C1] font-bold text-2xl">
              Campus<span className="text-[#ED8936]">Market</span>
            </span>
          </Link>
        </div>

        <div className="hidden md:flex flex-grow max-w-md mx-4">
          <form onSubmit={handleSearch} className="w-full">
            <div className="relative w-full">
              <Input
                type="text"
                placeholder="Search for items..."
                className="w-full py-2 px-4 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6B46C1] focus:border-transparent"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Button
                type="submit"
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-[#6B46C1]"
              >
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </form>
        </div>

        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden text-[#2D3748]"
            onClick={() => setMobileSearchVisible(!mobileSearchVisible)}
          >
            <Search className="h-5 w-5" />
          </Button>
          
          {user ? (
            <>
              <Link href="/messages" className="relative p-2 text-[#2D3748] hover:text-[#6B46C1] transition-colors">
                <MessageSquare className="h-5 w-5" />
                {unreadMessageCount > 0 && (
                  <Badge variant="destructive" className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center p-0 text-xs bg-[#ED8936]">
                    {unreadMessageCount > 9 ? '9+' : unreadMessageCount}
                  </Badge>
                )}
              </Link>
              
              <Link href="#" className="relative p-2 text-[#2D3748] hover:text-[#6B46C1] transition-colors">
                <Bell className="h-5 w-5" />
                <Badge variant="destructive" className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center p-0 text-xs bg-[#ED8936]">
                  3
                </Badge>
              </Link>
              
              <Link href="/create-listing" className="hidden md:flex">
                <Button className="bg-[#6B46C1] hover:bg-[#6B46C1]/90 text-white">
                  <Plus className="mr-1 h-4 w-4" /> Sell
                </Button>
              </Link>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="p-0 rounded-full overflow-hidden h-8 w-8">
                    <Avatar>
                      <AvatarImage src={user.avatar || undefined} alt={user.displayName} />
                      <AvatarFallback className="bg-[#6B46C1] text-white">
                        {user.displayName.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="cursor-pointer flex items-center">
                      <User className="mr-2 h-4 w-4" /> Your Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/my-listings" className="cursor-pointer flex items-center">
                      <Menu className="mr-2 h-4 w-4" /> Your Listings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="#" className="cursor-pointer flex items-center">
                      <Settings className="mr-2 h-4 w-4" /> Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600 cursor-pointer flex items-center">
                    <LogOut className="mr-2 h-4 w-4" /> Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <Dialog open={loginOpen} onOpenChange={setLoginOpen}>
              <DialogTrigger asChild>
                <Button className="bg-[#6B46C1] hover:bg-[#6B46C1]/90 text-white">
                  Login
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Login to CampusMarket</DialogTitle>
                  <DialogDescription>
                    Enter your credentials to access your account.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleLogin} className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <label htmlFor="username" className="text-sm font-medium">
                      Username
                    </label>
                    <Input
                      id="username"
                      type="text"
                      value={loginData.username}
                      onChange={(e) => setLoginData({...loginData, username: e.target.value})}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="password" className="text-sm font-medium">
                      Password
                    </label>
                    <Input
                      id="password"
                      type="password"
                      value={loginData.password}
                      onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full bg-[#6B46C1] hover:bg-[#6B46C1]/90">
                    Login
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {/* Mobile Search */}
      <AnimatePresence>
        {mobileSearchVisible && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden px-4 pb-3 overflow-hidden"
          >
            <form onSubmit={handleSearch} className="w-full">
              <div className="relative w-full">
                <Input
                  type="text"
                  placeholder="Search for items..."
                  className="w-full py-2 px-4 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6B46C1] focus:border-transparent"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Button
                  type="submit"
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-[#6B46C1]"
                >
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Category Navigation */}
      <CategoryNav />
    </header>
  );
};

const CategoryNav = () => {
  const [location] = useLocation();
  const [categories, setCategories] = useState([
    { name: "All Categories", slug: "" },
    { name: "Furniture", slug: "furniture" },
    { name: "Books & Notes", slug: "books-and-notes" },
    { name: "Electronics", slug: "electronics" },
    { name: "Clothing", slug: "clothing" },
    { name: "Vehicles", slug: "vehicles" },
    { name: "Services", slug: "services" }
  ]);

  // Fetch categories from API
  const { data } = useQuery({
    queryKey: ["/api/categories"],
  });

  useEffect(() => {
    if (data) {
      setCategories([
        { name: "All Categories", slug: "" },
        ...data
      ]);
    }
  }, [data]);

  return (
    <nav className="overflow-x-auto whitespace-nowrap py-2 px-4 border-t border-gray-200 bg-white">
      <div className="inline-flex space-x-4">
        {categories.map((category) => (
          <Link 
            key={category.slug} 
            href={category.slug ? `/category/${category.slug}` : "/"}
            className={`px-3 py-1 rounded-full ${
              (category.slug === "" && location === "/") || 
              (category.slug && location.startsWith(`/category/${category.slug}`))
                ? "bg-[#6B46C1] text-white"
                : "hover:bg-gray-100 text-[#2D3748]"
            } font-medium text-sm transition-colors`}
          >
            {category.name}
          </Link>
        ))}
      </div>
    </nav>
  );
};

export default Navbar;
