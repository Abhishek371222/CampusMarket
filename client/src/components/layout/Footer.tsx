import { Link } from "wouter";

export function Footer() {
  return (
    <footer className="border-t bg-muted/40 py-12">
      <div className="container px-4 md:px-6">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div className="flex flex-col gap-2">
            <h3 className="text-lg font-heading font-semibold">CampusMarket</h3>
            <p className="text-sm text-muted-foreground">
              The safest way for students to buy and sell on campus.
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <h3 className="text-sm font-semibold">Marketplace</h3>
            <Link href="/market?category=Textbooks">
              <span className="text-sm text-muted-foreground hover:underline cursor-pointer">Textbooks</span>
            </Link>
            <Link href="/market?category=Electronics">
              <span className="text-sm text-muted-foreground hover:underline cursor-pointer">Electronics</span>
            </Link>
            <Link href="/market?category=Furniture">
              <span className="text-sm text-muted-foreground hover:underline cursor-pointer">Furniture</span>
            </Link>
          </div>
          <div className="flex flex-col gap-2">
            <h3 className="text-sm font-semibold">Support</h3>
            <span className="text-sm text-muted-foreground hover:underline cursor-pointer">Safety Tips</span>
            <span className="text-sm text-muted-foreground hover:underline cursor-pointer">Community Guidelines</span>
            <span className="text-sm text-muted-foreground hover:underline cursor-pointer">Contact Us</span>
          </div>
          <div className="flex flex-col gap-2">
            <h3 className="text-sm font-semibold">Legal</h3>
            <span className="text-sm text-muted-foreground hover:underline cursor-pointer">Privacy Policy</span>
            <span className="text-sm text-muted-foreground hover:underline cursor-pointer">Terms of Service</span>
          </div>
        </div>
        <div className="mt-12 border-t pt-8 text-center text-sm text-muted-foreground">
          © 2024 CampusMarket. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
