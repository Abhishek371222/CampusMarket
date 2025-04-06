import { Link } from "wouter";
import { motion } from "framer-motion";
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin, Heart } from "lucide-react";
import { fadeInUp, staggerContainer } from "@/lib/animations";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { title: "About Us", href: "/about" },
    { title: "Privacy Policy", href: "/privacy" },
    { title: "Terms & Conditions", href: "/terms" },
    { title: "Contact Us", href: "/contact" },
    { title: "FAQs", href: "/faqs" },
  ];

  const categories = [
    { title: "Lecture Notes", href: "/category/lecture-notes" },
    { title: "Textbooks", href: "/category/textbooks" },
    { title: "Furniture", href: "/category/furniture" },
    { title: "Electronics", href: "/category/electronics" },
    { title: "Dorm Essentials", href: "/category/dorm-essentials" },
  ];

  const userLinks = [
    { title: "My Account", href: "/profile" },
    { title: "My Listings", href: "/my-listings" },
    { title: "My Wallet", href: "/wallet" },
    { title: "Messages", href: "/messages" },
    { title: "Favorites", href: "/favorites" },
  ];

  return (
    <motion.footer 
      className="bg-slate-900 text-white pt-12 pb-6"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.1 }}
      variants={staggerContainer}
    >
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Column 1: About */}
          <motion.div variants={fadeInUp} className="space-y-4">
            <h3 className="text-xl font-bold mb-4 pb-2 border-b border-purple-500 inline-block">About Campus Market</h3>
            <p className="text-gray-300">
              The ultimate marketplace for college students to buy and sell textbooks, notes, furniture and more. Simplifying campus commerce since 2023.
            </p>
            <div className="flex space-x-4 mt-4">
              <motion.a 
                href="https://facebook.com" 
                target="_blank" 
                rel="noopener noreferrer"
                whileHover={{ y: -3, color: "#4267B2" }}
                className="text-gray-300 hover:text-white"
              >
                <Facebook size={20} />
              </motion.a>
              <motion.a 
                href="https://instagram.com" 
                target="_blank" 
                rel="noopener noreferrer"
                whileHover={{ y: -3, color: "#E1306C" }}
                className="text-gray-300 hover:text-white"
              >
                <Instagram size={20} />
              </motion.a>
              <motion.a 
                href="https://twitter.com" 
                target="_blank" 
                rel="noopener noreferrer"
                whileHover={{ y: -3, color: "#1DA1F2" }}
                className="text-gray-300 hover:text-white"
              >
                <Twitter size={20} />
              </motion.a>
            </div>
          </motion.div>

          {/* Column 2: Quick Links */}
          <motion.div variants={fadeInUp} className="space-y-4">
            <h3 className="text-xl font-bold mb-4 pb-2 border-b border-purple-500 inline-block">Quick Links</h3>
            <ul className="space-y-2">
              {quickLinks.map((link, index) => (
                <motion.li 
                  key={index}
                  whileHover={{ x: 5 }}
                  className="transition-all duration-200"
                >
                  <Link href={link.href} className="text-gray-300 hover:text-purple-400">
                    {link.title}
                  </Link>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Column 3: Categories */}
          <motion.div variants={fadeInUp} className="space-y-4">
            <h3 className="text-xl font-bold mb-4 pb-2 border-b border-purple-500 inline-block">Categories</h3>
            <ul className="space-y-2">
              {categories.map((link, index) => (
                <motion.li 
                  key={index}
                  whileHover={{ x: 5 }}
                  className="transition-all duration-200"
                >
                  <Link href={link.href} className="text-gray-300 hover:text-purple-400">
                    {link.title}
                  </Link>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Column 4: Account & Contact */}
          <motion.div variants={fadeInUp} className="space-y-4">
            <h3 className="text-xl font-bold mb-4 pb-2 border-b border-purple-500 inline-block">My Account</h3>
            <ul className="space-y-2">
              {userLinks.map((link, index) => (
                <motion.li 
                  key={index}
                  whileHover={{ x: 5 }}
                  className="transition-all duration-200"
                >
                  <Link href={link.href} className="text-gray-300 hover:text-purple-400">
                    {link.title}
                  </Link>
                </motion.li>
              ))}
            </ul>
            <div className="mt-6">
              <h3 className="text-xl font-bold mb-4 pb-2 border-b border-purple-500 inline-block">Contact Us</h3>
              <ul className="space-y-2">
                <li className="flex items-center space-x-3 text-gray-300">
                  <Mail size={16} /> 
                  <span>support@campusmarket.com</span>
                </li>
                <li className="flex items-center space-x-3 text-gray-300">
                  <Phone size={16} /> 
                  <span>+91 1234567890</span>
                </li>
                <li className="flex items-center space-x-3 text-gray-300">
                  <MapPin size={16} /> 
                  <span>University Campus, India</span>
                </li>
              </ul>
            </div>
          </motion.div>
        </div>

        {/* Copyright */}
        <motion.div 
          variants={fadeInUp}
          className="mt-10 pt-6 border-t border-gray-700 text-center text-gray-400"
        >
          <p className="text-sm">
            © {currentYear} Campus Market. All rights reserved. Made with <Heart size={12} className="inline text-red-500" /> for college students.
          </p>
        </motion.div>
      </div>
    </motion.footer>
  );
};

export default Footer;