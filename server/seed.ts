import { db } from "./db";
import { products, users, locations } from "@shared/schema";
import { eq } from "drizzle-orm";

const demoProducts = [
  {
    category: "Electronics",
    items: [
      { title: "MacBook Air M2 13-inch", description: "Barely used MacBook Air M2 with 8GB RAM and 256GB SSD. Perfect for coding and design work. Comes with original charger and box. Battery health at 98%.", price: "899.00", condition: "like-new", images: ["https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800"] },
      { title: "iPad Pro 11\" with Apple Pencil", description: "2022 iPad Pro with M1 chip. Includes Apple Pencil 2nd gen and Magic Keyboard. Great for note-taking in lectures.", price: "749.00", condition: "good", images: ["https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800"] },
      { title: "Sony WH-1000XM4 Headphones", description: "Noise-cancelling headphones perfect for studying in the library. Includes case and charging cable. Amazing sound quality.", price: "189.00", condition: "good", images: ["https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=800"] },
      { title: "Dell 27\" 4K Monitor", description: "Dell UltraSharp 27\" 4K USB-C monitor. Perfect for dual monitor setup. Adjustable stand included.", price: "299.00", condition: "good", images: ["https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800"] },
      { title: "Mechanical Keyboard - Cherry MX", description: "Ducky One 2 RGB keyboard with Cherry MX Brown switches. Perfect for programming. RGB lighting.", price: "85.00", condition: "good", images: ["https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800"] },
      { title: "Nintendo Switch OLED", description: "Nintendo Switch OLED model with 3 games included. Perfect for breaks between classes. Rarely used.", price: "275.00", condition: "like-new", images: ["https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?w=800"] },
      { title: "AirPods Pro 2nd Gen", description: "Apple AirPods Pro with MagSafe charging case. Active noise cancellation. Used for 3 months.", price: "175.00", condition: "like-new", images: ["https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=800"] },
    ],
  },
  {
    category: "Textbooks",
    items: [
      { title: "Calculus: Early Transcendentals 8th Ed", description: "Stewart's Calculus textbook. Some highlighting but in great condition. Required for MATH 151 & 152.", price: "45.00", condition: "good", images: ["https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800"] },
      { title: "Introduction to Algorithms (CLRS)", description: "The classic algorithms textbook by Cormen, Leiserson, Rivest, and Stein. 3rd edition. Essential for CS majors.", price: "65.00", condition: "like-new", images: ["https://images.unsplash.com/photo-1532012197267-da84d127e765?w=800"] },
      { title: "Organic Chemistry 4th Edition", description: "Klein's Organic Chemistry with study guide. Minor wear on cover but pages are clean. Great for CHEM 231.", price: "55.00", condition: "good", images: ["https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=800"] },
      { title: "Psychology: A Concise Introduction", description: "Griggs Psychology textbook. Perfect condition, never used. Bought wrong edition.", price: "35.00", condition: "like-new", images: ["https://images.unsplash.com/photo-1519682337058-a94d519337bc?w=800"] },
      { title: "Physics for Scientists and Engineers", description: "Serway & Jewett Physics textbook. Covers mechanics, thermodynamics, and waves. For PHYS 101/102.", price: "50.00", condition: "good", images: ["https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800"] },
      { title: "Macroeconomics Bundle - 3 Books", description: "Mankiw Macroeconomics, Microeconomics, and Principles of Economics. All in good condition.", price: "75.00", condition: "good", images: ["https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800"] },
      { title: "Data Structures in Java", description: "Complete guide to data structures using Java. Perfect for CS 201. Minimal highlighting.", price: "40.00", condition: "good", images: ["https://images.unsplash.com/photo-1589998059171-988d887df646?w=800"] },
    ],
  },
  {
    category: "Class Notes",
    items: [
      { title: "CHEM 101 Complete Notes Bundle", description: "Full semester of handwritten notes for General Chemistry. Includes diagrams, practice problems, and exam prep materials. Got an A in this class!", price: "25.00", condition: "like-new", images: ["https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800"] },
      { title: "ECON 200 Lecture Notes + Study Guides", description: "Typed notes from all lectures plus study guides for midterm and final. Professor Smith's section.", price: "20.00", condition: "like-new", images: ["https://images.unsplash.com/photo-1517842645767-c639042777db?w=800"] },
      { title: "Biology 110 Lab Reports Bundle", description: "Complete set of lab reports with high grades. Great reference for writing your own reports.", price: "15.00", condition: "good", images: ["https://images.unsplash.com/photo-1532619675605-1ede6c2ed2b0?w=800"] },
      { title: "CS 301 Algorithm Notes + Solutions", description: "Comprehensive notes covering all algorithm topics. Includes solved practice problems and Big O cheat sheet.", price: "30.00", condition: "like-new", images: ["https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?w=800"] },
      { title: "Calculus III Complete Study Package", description: "Notes, practice exams, and solutions for Multivariable Calculus. Very detailed with graphs and examples.", price: "35.00", condition: "like-new", images: ["https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800"] },
      { title: "History 201 Essay Examples + Notes", description: "A-grade essays and comprehensive lecture notes. American History survey course.", price: "18.00", condition: "good", images: ["https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800"] },
    ],
  },
  {
    category: "Clothing",
    items: [
      { title: "North Face Winter Jacket - M", description: "Men's medium ThermoBall jacket. Navy blue. Very warm, barely worn. Great for cold campus walks.", price: "89.00", condition: "like-new", images: ["https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800"] },
      { title: "University Hoodie Collection", description: "3 official university hoodies. Sizes M-L. Various colors. Selling together or separately.", price: "45.00", condition: "good", images: ["https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800"] },
      { title: "Nike Air Force 1 - Size 10", description: "White Nike Air Force 1 '07. Lightly worn, cleaned and ready. Classic style.", price: "55.00", condition: "good", images: ["https://images.unsplash.com/photo-1600269452121-4f2416e55c28?w=800"] },
      { title: "Business Casual Bundle - Women's", description: "5 professional tops and 2 dress pants. Sizes S-M. Perfect for internship interviews.", price: "75.00", condition: "good", images: ["https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=800"] },
      { title: "Lululemon Yoga Pants", description: "Women's Align leggings size 6. Black. Perfect for campus gym or yoga class.", price: "48.00", condition: "like-new", images: ["https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=800"] },
      { title: "Patagonia Fleece - Unisex L", description: "Better Sweater fleece jacket. Grey. Very warm and comfortable. Sustainable fashion.", price: "65.00", condition: "good", images: ["https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800"] },
    ],
  },
  {
    category: "Sports",
    items: [
      { title: "Road Bike - Trek FX 2", description: "2021 Trek FX 2 hybrid bike. Great for commuting to campus. Recently tuned up. Includes lock.", price: "350.00", condition: "good", images: ["https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=800"] },
      { title: "Wilson Tennis Racket + Bag", description: "Wilson Pro Staff racket with carrying bag and 3 new tennis balls. Perfect for intramurals.", price: "45.00", condition: "good", images: ["https://images.unsplash.com/photo-1617083934551-ac1f1c072c44?w=800"] },
      { title: "Yoga Mat & Accessories Kit", description: "Premium yoga mat with blocks, strap, and carrying bag. Great for home workouts or studio.", price: "35.00", condition: "like-new", images: ["https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=800"] },
      { title: "Basketball - Spalding Official", description: "Official size basketball. Indoor/outdoor use. Good grip, minimal wear.", price: "20.00", condition: "good", images: ["https://images.unsplash.com/photo-1494199505258-5f95387f933c?w=800"] },
      { title: "Adjustable Dumbbell Set", description: "Bowflex SelectTech 552 adjustable dumbbells. 5-52.5 lbs each. Perfect for dorm workouts.", price: "199.00", condition: "good", images: ["https://images.unsplash.com/photo-1638536532686-d610adfc8e5c?w=800"] },
      { title: "Skateboard - Complete Setup", description: "Element complete skateboard. 8\" deck. Perfect for cruising around campus.", price: "55.00", condition: "good", images: ["https://images.unsplash.com/photo-1547447134-cd3f5c716030?w=800"] },
    ],
  },
];

export async function seedDemoProducts() {
  try {
    const existingProducts = await db.select().from(products);
    if (existingProducts.length > 0) {
      console.log("Products already exist, skipping seed");
      return;
    }

    let [location] = await db.select().from(locations).limit(1);
    if (!location) {
      [location] = await db.insert(locations).values({
        country: "United States",
        state: "California",
        city: "Los Angeles",
        pincode: "90024",
      }).returning();
    }

    let [demoUser] = await db.select().from(users).where(eq(users.email, "demo@campus.edu"));
    if (!demoUser) {
      [demoUser] = await db.insert(users).values({
        name: "Campus Seller",
        email: "demo@campus.edu",
        password: null,
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=campus",
        bio: "Demo account for marketplace listings",
        role: "student",
        isVerified: true,
        verificationStatus: "verified",
        locationId: location.id,
      }).returning();
    }

    for (const category of demoProducts) {
      for (const item of category.items) {
        await db.insert(products).values({
          title: item.title,
          description: item.description,
          price: item.price,
          category: category.category,
          condition: item.condition,
          images: item.images,
          sellerId: demoUser.id,
          locationId: location.id,
          status: "available",
          isPromoted: Math.random() > 0.7,
        });
      }
    }

    console.log(`Seeded ${demoProducts.reduce((acc, cat) => acc + cat.items.length, 0)} demo products`);
  } catch (error) {
    console.error("Failed to seed demo products:", error);
  }
}
