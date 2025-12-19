import { Mail, MapPin, Phone, Linkedin, Twitter, Github } from "lucide-react";
import { Link } from "wouter";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-b from-slate-900 to-black text-white mt-20">
      {/* Main Footer Content */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-12">
          {/* Brand Section */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center font-bold text-white">
                CM
              </div>
              <span className="font-bold text-lg">Campus Market</span>
            </div>
            <p className="text-sm text-slate-400 mb-6">
              The trusted marketplace for students. Buy and sell with confidence.
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-slate-400 hover:text-primary transition-colors hover:scale-110 duration-200">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-slate-400 hover:text-primary transition-colors hover:scale-110 duration-200">
                <Linkedin className="w-5 h-5" />
              </a>
              <a href="#" className="text-slate-400 hover:text-primary transition-colors hover:scale-110 duration-200">
                <Github className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h3 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">Product</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/products" className="text-slate-400 hover:text-primary transition-colors text-sm hover:translate-x-1 inline-block duration-200">
                  Browse Products
                </Link>
              </li>
              <li>
                <Link href="/sell" className="text-slate-400 hover:text-primary transition-colors text-sm hover:translate-x-1 inline-block duration-200">
                  Sell Item
                </Link>
              </li>
              <li>
                <Link href="/features" className="text-slate-400 hover:text-primary transition-colors text-sm hover:translate-x-1 inline-block duration-200">
                  Features
                </Link>
              </li>
              <li>
                <Link href="/getting-started" className="text-slate-400 hover:text-primary transition-colors text-sm hover:translate-x-1 inline-block duration-200">
                  Getting Started
                </Link>
              </li>
            </ul>
          </div>

          {/* Community Links */}
          <div>
            <h3 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">Community</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/people" className="text-slate-400 hover:text-primary transition-colors text-sm hover:translate-x-1 inline-block duration-200">
                  Find People
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="text-slate-400 hover:text-primary transition-colors text-sm hover:translate-x-1 inline-block duration-200">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link href="/orders" className="text-slate-400 hover:text-primary transition-colors text-sm hover:translate-x-1 inline-block duration-200">
                  My Orders
                </Link>
              </li>
              <li>
                <Link href="/my-listings" className="text-slate-400 hover:text-primary transition-colors text-sm hover:translate-x-1 inline-block duration-200">
                  My Listings
                </Link>
              </li>
            </ul>
          </div>

          {/* Information Links */}
          <div>
            <h3 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">Info</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/about" className="text-slate-400 hover:text-primary transition-colors text-sm hover:translate-x-1 inline-block duration-200">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-slate-400 hover:text-primary transition-colors text-sm hover:translate-x-1 inline-block duration-200">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-slate-400 hover:text-primary transition-colors text-sm hover:translate-x-1 inline-block duration-200">
                  Contact Us
                </Link>
              </li>
              <li>
                <a href="mailto:support@campusmarket.com" className="text-slate-400 hover:text-primary transition-colors text-sm hover:translate-x-1 inline-block duration-200">
                  Support
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">Contact</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <Mail className="w-4 h-4 mt-1 text-primary flex-shrink-0" />
                <a href="mailto:support@campusmarket.com" className="text-slate-400 hover:text-primary transition-colors text-sm break-all">
                  support@campusmarket.com
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Phone className="w-4 h-4 mt-1 text-primary flex-shrink-0" />
                <a href="tel:+1234567890" className="text-slate-400 hover:text-primary transition-colors text-sm">
                  +1 (234) 567-890
                </a>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 mt-1 text-primary flex-shrink-0" />
                <span className="text-slate-400 text-sm">
                  Campus HQ<br />
                  Student Center
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-slate-800" />

      {/* Bottom Footer */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-slate-400 text-sm">
            © {currentYear} Campus Market. All rights reserved. Built for students, by students.
          </p>
          <div className="flex gap-6 text-sm">
            <a href="#" className="text-slate-400 hover:text-primary transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="text-slate-400 hover:text-primary transition-colors">
              Cookie Policy
            </a>
            <a href="#" className="text-slate-400 hover:text-primary transition-colors">
              Accessibility
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
