import { Link, useLocation } from "wouter";
import { useCart, useAuth, useFavorites, useFollow } from "@/lib/store";
import { ShoppingCart, User, Menu, X, LogOut, Package, Heart, Users } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function Navbar() {
  const [location] = useLocation();
  const cartItems = useCart((state) => state.items);
  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const { favorites } = useFavorites();
  const favoritesCount = favorites.length;
  const { following } = useFollow();
  const followingCount = following.length;
  const { user, isAuthenticated, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isActive = (path: string) => location === path;

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold font-display text-xl shadow-lg shadow-primary/40 group-hover:shadow-primary/60 group-hover:scale-110 transition-all duration-300">
                CM
              </div>
              <span className="font-display font-bold text-lg tracking-tight hidden sm:block text-foreground">
                Campus<span className="text-primary">Market</span>
              </span>
            </Link>

            <div className="hidden md:flex items-center gap-6 text-sm font-medium">
              <Link href="/" className={isActive("/") ? "text-primary" : "text-muted-foreground hover:text-foreground transition-colors"}>
                Browse
              </Link>
              <Link href="/people" className={isActive("/people") ? "text-primary" : "text-muted-foreground hover:text-foreground transition-colors"}>
                People
              </Link>
              <Link href="/sell" className={isActive("/sell") ? "text-primary bg-accent/10 px-3 py-1 rounded-full" : "text-muted-foreground hover:text-foreground transition-colors"}>
                ✨ Sell Item
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* People/Follow Button */}
            <Link href="/people">
              <Button 
                variant="ghost" 
                size="icon" 
                className="relative button-3d hover:bg-primary/10 hover:text-primary transition-colors hidden sm:flex"
                data-testid="button-people"
              >
                <Users className={`h-5 w-5 ${followingCount > 0 ? 'text-primary' : ''}`} />
                {followingCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white shadow-md ring-2 ring-background animate-pulse">
                    {followingCount}
                  </span>
                )}
              </Button>
            </Link>

            {/* Wishlist Button with 3D Animation */}
            <Link href="/saved-items">
              <Button 
                variant="ghost" 
                size="icon" 
                className="relative button-3d hover:bg-accent/10 hover:text-accent transition-colors"
                data-testid="button-wishlist"
              >
                <Heart className={`h-5 w-5 ${favoritesCount > 0 ? 'fill-accent text-accent' : ''}`} />
                {favoritesCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-white shadow-md ring-2 ring-background animate-pulse">
                    {favoritesCount}
                  </span>
                )}
              </Button>
            </Link>

            {/* Cart Button */}
            <Link href="/cart">
              <Button 
                variant="ghost" 
                size="icon" 
                className="relative button-3d hover:bg-primary/10 hover:text-primary transition-colors"
                data-testid="button-cart"
              >
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-white shadow-sm ring-2 ring-background">
                    {cartCount}
                  </span>
                )}
              </Button>
            </Link>

            {isAuthenticated && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-9 w-9 rounded-full ring-2 ring-primary/10">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={user.avatar || undefined} alt={user.name} />
                      <AvatarFallback className="bg-primary/10 text-primary font-bold">
                        {user.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.name}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.campus}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/orders" className="cursor-pointer">
                      <Package className="mr-2 h-4 w-4" />
                      <span>My Orders</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-destructive focus:bg-destructive/10 cursor-pointer" onClick={logout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="hidden md:flex gap-2">
                <Link href="/login">
                  <Button variant="ghost" size="sm">Log in</Button>
                </Link>
                <Link href="/signup">
                  <Button size="sm" className="bg-gradient-to-r from-primary to-primary/90 shadow-md shadow-primary/20">Sign up</Button>
                </Link>
              </div>
            )}

            {/* Mobile Menu */}
            <div className="md:hidden">
              <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right">
                  <div className="flex flex-col gap-6 mt-6">
                    <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-medium">
                      Browse Products
                    </Link>
                    <Link href="/sell" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-medium flex items-center gap-2">
                      ✨ Sell Item
                    </Link>
                    <Link href="/search" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-medium">
                      Search
                    </Link>
                    {isAuthenticated && (
                      <>
                        <Link href="/profile" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-medium">
                          Profile
                        </Link>
                        <Link href="/orders" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-medium">
                          My Orders
                        </Link>
                      </>
                    )}
                    {!isAuthenticated && (
                      <>
                        <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                          <Button className="w-full" variant="outline">Log in</Button>
                        </Link>
                        <Link href="/signup" onClick={() => setIsMobileMenuOpen(false)}>
                          <Button className="w-full">Sign up</Button>
                        </Link>
                      </>
                    )}
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
