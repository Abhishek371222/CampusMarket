import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, ShoppingBag, PlusCircle, MessageCircle, LogOut, Menu, User, Users, Shield, Bell, Settings } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { useState } from "react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { NotificationBell } from "@/components/ui/notification-bell";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export function Navbar() {
  const { user, logout } = useAuth();
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const NavLinks = () => (
    <>
      <Link href="/market">
        <Tooltip>
          <TooltipTrigger asChild>
            <span className={`text-sm font-medium transition-colors hover:text-primary cursor-pointer ${location.startsWith("/market") ? "text-primary" : "text-muted-foreground"}`}>
              Marketplace
            </span>
          </TooltipTrigger>
          <TooltipContent>Browse textbooks, electronics & more</TooltipContent>
        </Tooltip>
      </Link>
      <Link href="/community">
        <Tooltip>
          <TooltipTrigger asChild>
            <span className={`text-sm font-medium transition-colors hover:text-primary cursor-pointer ${location.startsWith("/community") ? "text-primary" : "text-muted-foreground"}`}>
              Community
            </span>
          </TooltipTrigger>
          <TooltipContent>Campus news, lost & found, requests</TooltipContent>
        </Tooltip>
      </Link>
      {user?.role === "admin" && (
        <Link href="/admin">
          <span className={`text-sm font-medium transition-colors hover:text-primary cursor-pointer ${location.startsWith("/admin") ? "text-primary" : "text-muted-foreground"}`}>
            Admin
          </span>
        </Link>
      )}
    </>
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-6">
          <Link href="/">
             <Tooltip>
               <TooltipTrigger asChild>
                <div className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                    <ShoppingBag className="h-5 w-5" />
                  </div>
                  <span className="hidden font-heading text-lg font-bold md:inline-block">
                    CampusMarket
                  </span>
                </div>
               </TooltipTrigger>
               <TooltipContent>Go to Homepage</TooltipContent>
             </Tooltip>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <NavLinks />
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/market">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden" aria-label="Search Marketplace">
                  <Search className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Search Marketplace</TooltipContent>
            </Tooltip>
          </Link>

          <div className="flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <div><ThemeToggle /></div>
              </TooltipTrigger>
              <TooltipContent>Toggle Dark/Light Mode</TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <div><NotificationBell /></div>
              </TooltipTrigger>
              <TooltipContent>View Notifications</TooltipContent>
            </Tooltip>
          </div>

          {user ? (
            <div className="flex items-center gap-2 ml-2">
              <Link href="/sell">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button size="sm" className="hidden md:flex gap-2 shadow-sm hover:shadow-md transition-all" aria-label="Sell an Item">
                      <PlusCircle className="h-4 w-4" />
                      Sell Item
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>List a new product for sale</TooltipContent>
                </Tooltip>
              </Link>
              
              <Link href="/messages">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="relative" aria-label="Messages">
                      <MessageCircle className="h-5 w-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>View Messages</TooltipContent>
                </Tooltip>
              </Link>

              <DropdownMenu>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="relative h-8 w-8 rounded-full ring-2 ring-transparent hover:ring-primary/20 transition-all" aria-label="User Menu">
                        <Avatar className="h-8 w-8 border">
                          <AvatarImage src={user.avatar || undefined} alt={user.name} />
                          <AvatarFallback>{user.name[0]}</AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                  </TooltipTrigger>
                  <TooltipContent>Account Settings</TooltipContent>
                </Tooltip>
                
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.name}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="cursor-pointer flex w-full items-center">
                      <User className="mr-2 h-4 w-4" />
                      Profile & Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/community" className="cursor-pointer flex w-full items-center">
                      <Users className="mr-2 h-4 w-4" />
                      Community Wall
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/sell" className="cursor-pointer md:hidden flex w-full items-center">
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Sell Item
                    </Link>
                  </DropdownMenuItem>
                  {user.role === "admin" && (
                    <DropdownMenuItem asChild>
                      <Link href="/admin" className="cursor-pointer flex w-full items-center">
                        <Shield className="mr-2 h-4 w-4" />
                        Admin Dashboard
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => logout()} className="cursor-pointer text-red-600 focus:text-red-600">
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <div className="flex items-center gap-2 ml-2">
              <Link href="/login">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="sm" aria-label="Log In">Log in</Button>
                  </TooltipTrigger>
                  <TooltipContent>Access your account</TooltipContent>
                </Tooltip>
              </Link>
              <Link href="/signup">
                 <Tooltip>
                  <TooltipTrigger asChild>
                    <Button size="sm" className="shadow-sm" aria-label="Sign Up">Sign up</Button>
                  </TooltipTrigger>
                  <TooltipContent>Create a new student account</TooltipContent>
                </Tooltip>
              </Link>
            </div>
          )}

          {/* Mobile Menu */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden" aria-label="Open Menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
              <SheetHeader>
                <SheetTitle>Menu</SheetTitle>
                <SheetDescription>Navigate through CampusMarket</SheetDescription>
              </SheetHeader>
              <div className="flex flex-col gap-4 py-4">
                <Link href="/" onClick={() => setIsOpen(false)}>
                  <span className="font-heading text-lg font-bold flex items-center gap-2">
                    <ShoppingBag className="h-5 w-5" /> CampusMarket
                  </span>
                </Link>
                <div className="flex flex-col gap-3 mt-4">
                  <NavLinks />
                </div>
                {!user && (
                  <div className="mt-4 flex flex-col gap-2">
                    <Link href="/login" onClick={() => setIsOpen(false)}>
                       <Button variant="outline" className="w-full">Log In</Button>
                    </Link>
                    <Link href="/signup" onClick={() => setIsOpen(false)}>
                       <Button className="w-full">Create Account</Button>
                    </Link>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
