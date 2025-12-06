import { ProductCard } from "@/components/ui/product-card";
import { Button } from "@/components/ui/button";
import { ArrowRight, BookOpen, Laptop, Sofa, Shirt } from "lucide-react";
import { Link } from "wouter";
import { SearchBar } from "@/components/ui/search-bar";
import { useProducts } from "@/lib/api-hooks";
import heroImage from "@assets/stock_images/university_campus_st_950cd798.jpg";

export default function Home() {
  const { data: products = [] } = useProducts();
  const featuredProducts = products.slice(0, 4);

  const categories = [
    { name: "Textbooks", icon: BookOpen, color: "bg-blue-100 text-blue-600" },
    { name: "Electronics", icon: Laptop, color: "bg-purple-100 text-purple-600" },
    { name: "Furniture", icon: Sofa, color: "bg-orange-100 text-orange-600" },
    { name: "Clothing", icon: Shirt, color: "bg-pink-100 text-pink-600" },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[500px] flex items-center justify-center overflow-hidden bg-primary/5">
        <div className="absolute inset-0 z-0">
          <img 
            src={heroImage} 
            alt="Campus Life" 
            className="w-full h-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
        </div>
        
        <div className="container relative z-10 px-4 md:px-6 text-center max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-heading font-extrabold tracking-tight mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            Buy & Sell on Campus <br/>
            <span className="text-primary">Instantly.</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-5 duration-700 delay-100">
            The trusted marketplace for students. Find cheap textbooks, dorm furniture, and electronics from people you go to class with.
          </p>
          
          <div className="w-full max-w-md mx-auto mb-8 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-200">
            <SearchBar className="w-full" />
          </div>

          <div className="flex flex-wrap justify-center gap-4 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-300">
            {categories.map((cat) => (
              <Link key={cat.name} href={`/market?category=${cat.name}`}>
                <div className="flex items-center gap-2 px-4 py-2 bg-background/80 backdrop-blur-sm border rounded-full hover:border-primary hover:shadow-md transition-all cursor-pointer group">
                  <cat.icon className={`h-4 w-4 ${cat.color} p-0.5 rounded-full box-content`} />
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
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
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
                  <div className="h-2 w-2 rounded-full bg-green-500" />
                  <span className="font-medium">Verified Student Profiles</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500" />
                  <span className="font-medium">Secure Chat System</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500" />
                  <span className="font-medium">On-Campus Meetups</span>
                </li>
              </ul>
              <div className="pt-4">
                 <Link href="/login">
                  <Button size="lg">Join Community</Button>
                </Link>
              </div>
            </div>
            <div className="relative aspect-video rounded-2xl overflow-hidden shadow-2xl bg-muted">
               {/* Abstract decorative element */}
               <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20" />
               <div className="absolute inset-0 flex items-center justify-center">
                 <div className="bg-background/80 backdrop-blur-md p-8 rounded-xl border shadow-lg max-w-xs text-center">
                    <p className="font-heading font-bold text-xl mb-2">"Sold my old textbooks in 2 hours!"</p>
                    <p className="text-sm text-muted-foreground">- Alex, Computer Science '25</p>
                 </div>
               </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
