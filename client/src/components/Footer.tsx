import { Link } from "wouter";

export function Footer() {
  return (
    <footer className="bg-muted/30 border-t mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <h3 className="font-display font-bold text-lg">CampusMarket</h3>
            <p className="text-sm text-muted-foreground">
              The safe, trusted marketplace for students to buy and sell on campus.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Shop</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/" className="hover:text-primary transition-colors">All Products</Link></li>
              <li><Link href="/" className="hover:text-primary transition-colors">Electronics</Link></li>
              <li><Link href="/" className="hover:text-primary transition-colors">Textbooks</Link></li>
              <li><Link href="/" className="hover:text-primary transition-colors">Furniture</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/about" className="hover:text-primary transition-colors">About Us</Link></li>
              <li><Link href="/contact" className="hover:text-primary transition-colors">Contact Us</Link></li>
              <li><Link href="/terms" className="hover:text-primary transition-colors">Terms & Conditions</Link></li>
              <li><a href="#" className="hover:text-primary transition-colors">Safety Tips</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Stay Updated</h4>
            <p className="text-sm text-muted-foreground mb-4">
              Get the latest deals and updates from campus.
            </p>
            <div className="flex gap-2">
              <input 
                type="email" 
                placeholder="Enter email" 
                className="bg-background border rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
              <button className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
                Join
              </button>
            </div>
          </div>
        </div>
        
        <div className="border-t mt-12 pt-8 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} Campus Marketplace. Built for students.
        </div>
      </div>
    </footer>
  );
}
