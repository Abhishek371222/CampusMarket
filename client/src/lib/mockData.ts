import { Product, User, Order } from "@shared/schema";

// Helper to simulate network delay
export const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const CATEGORIES = [
  { id: 'all', name: 'All Items', icon: 'LayoutGrid' },
  { id: 'electronics', name: 'Electronics', icon: 'Smartphone' },
  { id: 'books', name: 'Textbooks', icon: 'BookOpen' },
  { id: 'hostel', name: 'Hostel Needs', icon: 'Home' },
  { id: 'fashion', name: 'Fashion', icon: 'Shirt' },
  { id: 'cycles', name: 'Cycles', icon: 'Bike' },
];

export const CURRENT_USER: User = {
  id: 1,
  username: "alex_student",
  password: "hashed_password",
  name: "Alex Johnson",
  campus: "North Campus",
  avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop",
};

export const MOCK_PRODUCTS: Product[] = [
  {
    id: 1,
    title: "Sony WH-1000XM4 Noise Canceling Headphones",
    description: "Barely used, excellent condition. Comes with original case and cables. Perfect for studying in noisy dorms.",
    price: "180.00",
    condition: "Used - Like New",
    category: "electronics",
    // headphones on desk
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&h=600&fit=crop",
    sellerId: 2,
    sellerName: "Sarah Chen",
    sellerRating: "4.8",
  },
  {
    id: 2,
    title: "Calculus: Early Transcendentals (8th Ed)",
    description: "Standard calculus textbook required for MAT101. No highlighting inside.",
    price: "45.00",
    condition: "Used - Good",
    category: "books",
    // stack of books
    image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&h=600&fit=crop",
    sellerId: 3,
    sellerName: "Mike Ross",
    sellerRating: "4.5",
  },
  {
    id: 3,
    title: "Mini Fridge - 3.2 Cu Ft",
    description: "Moving out sale! Keeps drinks super cold. Must pick up from Dorm A.",
    price: "60.00",
    condition: "Used - Fair",
    category: "hostel",
    // silver fridge
    image: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800&h=600&fit=crop",
    sellerId: 4,
    sellerName: "Jessica Pearson",
    sellerRating: "5.0",
  },
  {
    id: 4,
    title: "Vintage Denim Jacket (Size M)",
    description: "Classic oversized look. great condition.",
    price: "35.00",
    condition: "Used - Good",
    category: "fashion",
    // denim jacket
    image: "https://images.unsplash.com/photo-1576871337622-98d48d1cf531?w=800&h=600&fit=crop",
    sellerId: 1,
    sellerName: "Alex Johnson",
    sellerRating: "4.9",
  },
  {
    id: 5,
    title: "Mountain Bike - Trek Marlin 5",
    description: "Great for getting around campus. Recently tuned up. Lock included.",
    price: "250.00",
    condition: "Used - Good",
    category: "cycles",
    // mountain bike leaning against wall
    image: "https://images.unsplash.com/photo-1576435728678-be95f39e8ab1?w=800&h=600&fit=crop",
    sellerId: 5,
    sellerName: "Harvey Specter",
    sellerRating: "4.7",
  },
  {
    id: 6,
    title: "Apple iPad Air 4th Gen (64GB)",
    description: "Sky Blue. Screen protector installed since day 1. Includes Apple Pencil 2.",
    price: "400.00",
    condition: "Used - Like New",
    category: "electronics",
    // ipad on table
    image: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&h=600&fit=crop",
    sellerId: 2,
    sellerName: "Sarah Chen",
    sellerRating: "4.8",
  },
  {
    id: 7,
    title: "Introduction to Algorithms (CLRS)",
    description: "The bible of CS. Hardcover. Heavy but worth it.",
    price: "55.00",
    condition: "Used - Like New",
    category: "books",
    // textbooks
    image: "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=800&h=600&fit=crop",
    sellerId: 6,
    sellerName: "Louis Litt",
    sellerRating: "4.2",
  },
  {
    id: 8,
    title: "Desk Lamp with USB Charging",
    description: "LED lamp with adjustable brightness and color temp.",
    price: "15.00",
    condition: "Used - Good",
    category: "hostel",
    // desk lamp
    image: "https://images.unsplash.com/photo-1534234828563-02531735946d?w=800&h=600&fit=crop",
    sellerId: 3,
    sellerName: "Mike Ross",
    sellerRating: "4.5",
  },
  {
    id: 9,
    title: "Mechanical Keyboard (Blue Switches)",
    description: "Clicky switches. RGB backlight. Cleaned and sanitized.",
    price: "40.00",
    condition: "Used - Good",
    category: "electronics",
    // keyboard
    image: "https://images.unsplash.com/photo-1587829741301-dc798b91add1?w=800&h=600&fit=crop",
    sellerId: 4,
    sellerName: "Jessica Pearson",
    sellerRating: "5.0",
  },
  {
    id: 10,
    title: "Graphic Tee Collection (Size L)",
    description: "Bundle of 3 graphic tees. Brand new, never worn.",
    price: "25.00",
    condition: "New",
    category: "fashion",
    // folded t-shirts
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&h=600&fit=crop",
    sellerId: 5,
    sellerName: "Harvey Specter",
    sellerRating: "4.7",
  },
  {
    id: 11,
    title: "Electric Kettle - 1.5L",
    description: "Boils water fast for ramen or coffee. Auto shut-off.",
    price: "12.00",
    condition: "Used - Fair",
    category: "hostel",
    // kettle
    image: "https://images.unsplash.com/photo-1556654848-154df6746819?w=800&h=600&fit=crop",
    sellerId: 6,
    sellerName: "Louis Litt",
    sellerRating: "4.2",
  },
  {
    id: 12,
    title: "Road Bike Helmet",
    description: "Safety first! Never crashed. Size M/L adjustable.",
    price: "20.00",
    condition: "Used - Good",
    category: "cycles",
    // bicycle helmet
    image: "https://images.unsplash.com/photo-1555666723-5e933d1c1694?w=800&h=600&fit=crop",
    sellerId: 1,
    sellerName: "Alex Johnson",
    sellerRating: "4.9",
  },
];

export const MOCK_ORDERS: Order[] = [
  {
    id: 101,
    userId: 1,
    total: "45.00",
    status: "Delivered",
    createdAt: new Date("2023-10-15T10:00:00Z"),
    items: [
      { productId: 2, title: "Calculus: Early Transcendentals", price: "45.00", quantity: 1 }
    ]
  },
  {
    id: 102,
    userId: 1,
    total: "20.00",
    status: "Processing",
    createdAt: new Date(),
    items: [
      { productId: 12, title: "Road Bike Helmet", price: "20.00", quantity: 1 }
    ]
  }
];
