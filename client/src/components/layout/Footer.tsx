import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Facebook, Twitter, Instagram, Linkedin, Mail, ExternalLink } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export function Footer() {
  return (
    <footer className="border-t bg-muted/40 pt-16 pb-8">
      <div className="container px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          
          {/* Brand Column */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold">
                CM
              </div>
              <h3 className="text-xl font-heading font-bold">CampusMarket</h3>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              The safest, student-verified marketplace for buying and selling textbooks, electronics, and dorm essentials right on campus.
            </p>
            <div className="flex gap-3 mt-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-primary/10 hover:text-primary" aria-label="Twitter">
                    <Twitter className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Follow us on Twitter</TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-primary/10 hover:text-primary" aria-label="Instagram">
                    <Instagram className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Follow us on Instagram</TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-primary/10 hover:text-primary" aria-label="Facebook">
                    <Facebook className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Like us on Facebook</TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-primary/10 hover:text-primary" aria-label="LinkedIn">
                    <Linkedin className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Connect on LinkedIn</TooltipContent>
              </Tooltip>
            </div>
          </div>

          {/* Links Column */}
          <div className="flex flex-col gap-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">Marketplace</h3>
            <div className="flex flex-col gap-2">
              <Link href="/market?category=Textbooks">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="text-sm text-muted-foreground hover:text-primary transition-colors cursor-pointer flex items-center gap-1">
                      Textbooks & Course Materials
                    </span>
                  </TooltipTrigger>
                  <TooltipContent side="right">Find cheap books</TooltipContent>
                </Tooltip>
              </Link>
              <Link href="/market?category=Electronics">
                 <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="text-sm text-muted-foreground hover:text-primary transition-colors cursor-pointer">
                      Electronics & Gadgets
                    </span>
                  </TooltipTrigger>
                  <TooltipContent side="right">Laptops, headphones, etc.</TooltipContent>
                </Tooltip>
              </Link>
              <Link href="/market?category=Furniture">
                 <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="text-sm text-muted-foreground hover:text-primary transition-colors cursor-pointer">
                      Dorm Furniture
                    </span>
                  </TooltipTrigger>
                  <TooltipContent side="right">Desks, chairs, decor</TooltipContent>
                </Tooltip>
              </Link>
              <Link href="/market?category=Clothing">
                <span className="text-sm text-muted-foreground hover:text-primary transition-colors cursor-pointer">
                  Clothing & Merch
                </span>
              </Link>
              <Link href="/market">
                <span className="text-sm text-muted-foreground hover:text-primary transition-colors cursor-pointer font-medium text-primary">
                  View All Categories →
                </span>
              </Link>
            </div>
          </div>

          {/* Support Column */}
          <div className="flex flex-col gap-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">Support & Safety</h3>
            <div className="flex flex-col gap-2">
              <span className="text-sm text-muted-foreground hover:text-primary transition-colors cursor-pointer flex items-center gap-1">
                Safety Guidelines <ExternalLink className="h-3 w-3 opacity-50" />
              </span>
              <span className="text-sm text-muted-foreground hover:text-primary transition-colors cursor-pointer">Verification Process</span>
              <span className="text-sm text-muted-foreground hover:text-primary transition-colors cursor-pointer">Report a Scam</span>
              <span className="text-sm text-muted-foreground hover:text-primary transition-colors cursor-pointer">Community Rules</span>
              <span className="text-sm text-muted-foreground hover:text-primary transition-colors cursor-pointer">Contact Support</span>
            </div>
          </div>

          {/* Newsletter */}
          <div className="flex flex-col gap-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">Stay Updated</h3>
            <p className="text-sm text-muted-foreground">
              Subscribe to get alerts for new listings in your major.
            </p>
            <div className="flex gap-2">
              <Input 
                placeholder="student@university.edu" 
                className="h-9 bg-background border-muted-foreground/20" 
                aria-label="Email Address"
              />
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button size="sm" className="h-9 px-4" aria-label="Subscribe">
                    <Mail className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Subscribe to newsletter</TooltipContent>
              </Tooltip>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              We only send relevant campus updates. No spam.
            </p>
          </div>
        </div>

        <div className="mt-12 border-t pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <p>© 2024 CampusMarket. Built for students, by students.</p>
          <div className="flex gap-6">
            <span className="hover:text-foreground cursor-pointer transition-colors">Privacy Policy</span>
            <span className="hover:text-foreground cursor-pointer transition-colors">Terms of Service</span>
            <span className="hover:text-foreground cursor-pointer transition-colors">Cookie Policy</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
