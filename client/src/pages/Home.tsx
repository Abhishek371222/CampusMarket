import { ProductCard } from "@/components/ui/product-card";
import { Button } from "@/components/ui/button";
import { ArrowRight, BookOpen, Laptop, FileText, Shirt, Dumbbell } from "lucide-react";
import { Link } from "wouter";
import { SearchBar } from "@/components/ui/search-bar";
import { useProducts } from "@/lib/api-hooks";
import heroImage from "@assets/stock_images/university_campus_st_950cd798.jpg";

export default function Home() {
  const { data: products = [] } = useProducts();
  const featuredProducts = products.slice(0, 10);

  const categories = [
    { name: "Textbooks", icon: BookOpen, color: "bg-blue-100 text-blue-600" },
    { name: "Electronics", icon: Laptop, color: "bg-purple-100 text-purple-600" },
    { name: "Class Notes", icon: FileText, color: "bg-orange-100 text-orange-600" },
    { name: "Clothing", icon: Shirt, color: "bg-pink-100 text-pink-600" },
    { name: "Sports", icon: Dumbbell, color: "bg-green-100 text-green-600" },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section with 3D Animations */}
      <section className="relative h-[550px] flex items-center justify-center overflow-hidden bg-primary/5">
        <div className="absolute inset-0 z-0">
          <img 
            src={heroImage} 
            alt="Campus Life" 
            className="w-full h-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
        </div>
        
        {/* Floating Decorative Elements - lightweight */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-[10%] w-12 h-12 bg-primary/30 rounded-xl opacity-60 animate-float" style={{ animationDelay: '0s' }} />
          <div className="absolute top-32 right-[15%] w-10 h-10 bg-secondary/40 rounded-full opacity-50 animate-float-slow" style={{ animationDelay: '1s' }} />
          <div className="absolute bottom-40 right-[25%] w-8 h-8 bg-accent/30 rounded-lg opacity-45 animate-float" style={{ animationDelay: '1.5s' }} />
        </div>
        
        <div className="container relative z-10 px-4 md:px-6 text-center max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-heading font-extrabold tracking-tight mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            Buy & Sell on Campus <br/>
            <span className="text-primary bg-clip-text animate-pulse-subtle">Instantly.</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-5 duration-700 delay-100">
            The trusted marketplace for students. Find cheap textbooks, class notes, and electronics from people you go to class with.
          </p>
          
          <div className="w-full max-w-md mx-auto mb-8 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-200">
            <SearchBar className="w-full" />
          </div>

          <div className="flex flex-wrap justify-center gap-3 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-300">
            {categories.map((cat, index) => (
              <Link key={cat.name} href={`/market?category=${cat.name}`}>
                <div 
                  className="flex items-center gap-2 px-4 py-2 bg-background/80 backdrop-blur-sm border rounded-full hover:border-primary hover:shadow-lg hover:scale-105 transition-all duration-300 cursor-pointer group"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <cat.icon className={`h-4 w-4 ${cat.color} p-0.5 rounded-full box-content group-hover:rotate-12 transition-transform`} />
                  <span className="text-sm font-medium group-hover:text-primary">{cat.name}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Section */}
      <section className="py-16 bg-background">
        <div className="container px-4 md:px-6">
          <div className="flex items-center justify-between mb-8">
            <div className="space-y-1">
              <h2 className="text-3xl font-heading font-bold">Fresh Listings</h2>
              <p className="text-muted-foreground">The latest items added by students near you.</p>
            </div>
            <Link href="/market">
              <Button variant="ghost" className="gap-2 group">
                View All <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {featuredProducts.map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* Safety Banner */}
      <section className="py-16 bg-muted/30 border-y">
        <div className="container px-4 md:px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-4">
              <h2 className="text-3xl font-heading font-bold">Safe & Secure Trading</h2>
              <p className="text-lg text-muted-foreground">
                We verify all users with their .edu email addresses so you know you're dealing with real students.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="font-medium">Verified Student Profiles</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" style={{ animationDelay: '0.2s' }} />
                  <span className="font-medium">Secure Chat System</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" style={{ animationDelay: '0.4s' }} />
                  <span className="font-medium">On-Campus Meetups</span>
                </li>
              </ul>
              <div className="pt-4">
                 <Link href="/login">
                  <Button size="lg" className="hover:scale-105 transition-transform">Join Community</Button>
                </Link>
              </div>
            </div>
            <div className="relative aspect-video rounded-2xl overflow-hidden shadow-2xl bg-muted group">
               {/* Abstract decorative element */}
               <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 group-hover:opacity-80 transition-opacity" />
               <div className="absolute inset-0 flex items-center justify-center">
                 <div className="bg-background/80 backdrop-blur-md p-8 rounded-xl border shadow-lg max-w-xs text-center transform group-hover:scale-105 transition-transform duration-300">
                    <p className="font-heading font-bold text-xl mb-2">"Sold my old textbooks in 2 hours!"</p>
                    <p className="text-sm text-muted-foreground">- Alex, Computer Science '25</p>
                 </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Custom CSS for animations */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
        @keyframes float-slow {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(-5deg); }
        }
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-10px) scale(1.1); }
        }
        @keyframes pulse-subtle {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.8; }
        }
        .animate-float {
          animation: float 4s ease-in-out infinite;
        }
        .animate-float-slow {
          animation: float-slow 6s ease-in-out infinite;
        }
        .animate-bounce-slow {
          animation: bounce-slow 3s ease-in-out infinite;
        }
        .animate-pulse-subtle {
          animation: pulse-subtle 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
