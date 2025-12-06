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
import { Search, ShoppingBag, PlusCircle, MessageCircle, LogOut, Menu, User, Users, Shield, Bell } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
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
        <span className={`text-sm font-medium transition-colors hover:text-primary cursor-pointer ${location.startsWith("/market") ? "text-primary" : "text-muted-foreground"}`}>
          Marketplace
        </span>
      </Link>
      <Link href="/community">
        <span className={`text-sm font-medium transition-colors hover:text-primary cursor-pointer ${location.startsWith("/community") ? "text-primary" : "text-muted-foreground"}`}>
          Community
        </span>
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
            <div className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <ShoppingBag className="h-5 w-5" />
              </div>
              <span className="hidden font-heading text-lg font-bold md:inline-block">
                CampusMarket
              </span>
            </div>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <NavLinks />
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/market">
            <Button variant="ghost" size="icon" className="md:hidden" aria-label="Search">
              <Search className="h-5 w-5" />
            </Button>
          </Link>

          <div className="flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <div><ThemeToggle /></div>
              </TooltipTrigger>
              <TooltipContent>Toggle Theme</TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <div><NotificationBell /></div>
              </TooltipTrigger>
              <TooltipContent>Notifications</TooltipContent>
            </Tooltip>
          </div>

          {user ? (
            <div className="flex items-center gap-2 ml-2">
              <Link href="/sell">
                <Button size="sm" className="hidden md:flex gap-2 shadow-sm hover:shadow-md transition-all">
                  <PlusCircle className="h-4 w-4" />
                  Sell Item
                </Button>
              </Link>
              
              <Link href="/messages">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="relative">
                      <MessageCircle className="h-5 w-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Messages</TooltipContent>
                </Tooltip>
              </Link>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full ring-2 ring-transparent hover:ring-primary/20 transition-all">
                    <Avatar className="h-8 w-8 border">
                      <AvatarImage src={user.avatar} alt={user.name} />
                      <AvatarFallback>{user.name[0]}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
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
                <Button variant="ghost" size="sm">Log in</Button>
              </Link>
              <Link href="/signup">
                <Button size="sm" className="shadow-sm">Sign up</Button>
              </Link>
            </div>
          )}

          {/* Mobile Menu */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
              <div className="flex flex-col gap-4 py-4">
                <Link href="/" onClick={() => setIsOpen(false)}>
                  <span className="font-heading text-lg font-bold">CampusMarket</span>
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
