import { db } from "./db";
import { 
  listings, 
  users, 
  categories
} from "@shared/schema";
import { eq, sql } from "drizzle-orm";

interface SeedUser {
  username: string;
  email: string;
  displayName: string;
  password: string;
  avatar?: string;
}

interface SeedListing {
  title: string;
  description: string;
  price: number;
  sellerEmail: string;
  condition: string;
  location: string;
  categoryId: number;
  imageUrls: string[];
  isUrgent: boolean;
}

async function seedDatabase() {
  console.log("🌱 Seeding database with demo data...");
  
  try {
    // Get or create test users
    const testUsers: SeedUser[] = [
      {
        username: "janesmith",
        email: "jane@campus.edu",
        displayName: "Jane Smith",
        password: "password123",
        avatar: "https://randomuser.me/api/portraits/women/44.jpg"
      },
      {
        username: "mikebrown",
        email: "mike@campus.edu",
        displayName: "Mike Brown",
        password: "password123",
        avatar: "https://randomuser.me/api/portraits/men/32.jpg"
      },
      {
        username: "sarahlee",
        email: "sarah@campus.edu",
        displayName: "Sarah Lee",
        password: "password123",
        avatar: "https://randomuser.me/api/portraits/women/67.jpg"
      },
      {
        username: "alexjohnson",
        email: "alex@campus.edu",
        displayName: "Alex Johnson",
        password: "password123",
        avatar: "https://randomuser.me/api/portraits/men/91.jpg"
      }
    ];

    for (const userData of testUsers) {
      const existingUser = await db.select().from(users).where(eq(users.email, userData.email)).limit(1);
      if (existingUser.length === 0) {
        await db.insert(users).values({
          username: userData.username,
          password: userData.password,
          email: userData.email,
          displayName: userData.displayName,
          avatar: userData.avatar,
          isAdmin: false
        });
      }
    }

    // Get all category IDs
    const allCategories = await db.select().from(categories);
    const categoryMap = new Map(allCategories.map(c => [c.slug, c.id]));

    // Get all user IDs
    const allUsers = await db.select().from(users);
    const userMap = new Map(allUsers.map(u => [u.email, u.id]));

    // Sample listings data
    const demoListings: SeedListing[] = [
      // Lecture Notes
      {
        title: "Organic Chemistry Complete Notes",
        description: "Comprehensive notes for Organic Chemistry 101 covering all semester topics including reactions, mechanisms, and nomenclature. Color-coded and organized by chapter with practice problem solutions included.",
        price: 35,
        sellerEmail: "jane@campus.edu",
        condition: "Like New",
        location: "Science Building",
        categoryId: categoryMap.get("lecture-notes") || 10,
        imageUrls: ["https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&q=80&w=1422&ixlib=rb-4.0.3"],
        isUrgent: false
      },
      {
        title: "Calculus II Study Guide with Examples",
        description: "Detailed study guide for Calculus II with step-by-step examples, all theorems, and practice problems. Perfect for final exam preparation.",
        price: 25,
        sellerEmail: "mike@campus.edu",
        condition: "Good",
        location: "Math Department",
        categoryId: categoryMap.get("lecture-notes") || 10,
        imageUrls: ["https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&q=80&w=1470&ixlib=rb-4.0.3"],
        isUrgent: true
      },
      {
        title: "Psychology 101 Complete Lecture Notes",
        description: "Comprehensive notes covering developmental psychology, cognitive psychology, behavioral theory, and more. Includes diagrams and study questions.",
        price: 30,
        sellerEmail: "sarah@campus.edu",
        condition: "Like New",
        location: "Psychology Building",
        categoryId: categoryMap.get("lecture-notes") || 10,
        imageUrls: ["https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&q=80&w=1470&ixlib=rb-4.0.3"],
        isUrgent: false
      },
      {
        title: "Computer Science Data Structures Notes",
        description: "Detailed notes on arrays, linked lists, trees, graphs, and algorithm complexity. Includes pseudocode examples and complexity analysis.",
        price: 40,
        sellerEmail: "alex@campus.edu",
        condition: "Excellent",
        location: "Computer Science Building",
        categoryId: categoryMap.get("lecture-notes") || 10,
        imageUrls: ["https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&q=80&w=1469&ixlib=rb-4.0.3"],
        isUrgent: true
      },
      {
        title: "Introduction to Economics Notes",
        description: "Complete semester notes for Intro to Economics covering micro and macro concepts. Charts, graphs, and practice problems included.",
        price: 28,
        sellerEmail: "jane@campus.edu",
        condition: "Good",
        location: "Business School",
        categoryId: categoryMap.get("lecture-notes") || 10,
        imageUrls: ["https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&q=80&w=1526&ixlib=rb-4.0.3"],
        isUrgent: false
      },
      {
        title: "Physics Mechanics Study Guide",
        description: "Comprehensive study guide for Physics I (Mechanics). Includes formulas, diagrams, example problems, and exam prep questions.",
        price: 32,
        sellerEmail: "mike@campus.edu",
        condition: "Like New",
        location: "Physics Department",
        categoryId: categoryMap.get("lecture-notes") || 10,
        imageUrls: ["https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&q=80&w=1470&ixlib=rb-4.0.3"],
        isUrgent: false
      },
      // Textbooks
      {
        title: "Campbell Biology 12th Edition",
        description: "Campbell Biology 12th edition in excellent condition. Minimal highlighting, no damaged pages. Includes access code for online resources.",
        price: 75,
        sellerEmail: "sarah@campus.edu",
        condition: "Like New",
        location: "Science Library",
        categoryId: categoryMap.get("textbooks") || 11,
        imageUrls: ["https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&q=80&w=1473&ixlib=rb-4.0.3"],
        isUrgent: true
      },
      {
        title: "Principles of Microeconomics - Mankiw",
        description: "8th edition of Principles of Microeconomics by Gregory Mankiw. Great condition with minimal wear.",
        price: 55,
        sellerEmail: "alex@campus.edu",
        condition: "Good",
        location: "Economics Department",
        categoryId: categoryMap.get("textbooks") || 11,
        imageUrls: ["https://images.unsplash.com/photo-1589998059171-988d887df646?auto=format&fit=crop&q=80&w=1476&ixlib=rb-4.0.3"],
        isUrgent: false
      },
      {
        title: "Introduction to Algorithms - Cormen",
        description: "Classic computer science textbook on algorithms. Third edition in good condition with some highlighting in important sections.",
        price: 60,
        sellerEmail: "jane@campus.edu",
        condition: "Good",
        location: "Computer Science Building",
        categoryId: categoryMap.get("textbooks") || 11,
        imageUrls: ["https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&q=80&w=1374&ixlib=rb-4.0.3"],
        isUrgent: false
      },
      {
        title: "Organic Chemistry - Bruice",
        description: "Organic Chemistry 8th edition by Paula Bruice. Complete with study guide and solution manual. Minor wear on cover.",
        price: 65,
        sellerEmail: "mike@campus.edu",
        condition: "Good",
        location: "Chemistry Building",
        categoryId: categoryMap.get("textbooks") || 11,
        imageUrls: ["https://images.unsplash.com/photo-1544383835-bda2bc66a55d?auto=format&fit=crop&q=80&w=1361&ixlib=rb-4.0.3"],
        isUrgent: true
      },
      {
        title: "Psychology: The Science of Mind and Behavior",
        description: "Latest edition of this comprehensive psychology textbook. Clean pages with minimal highlighting.",
        price: 50,
        sellerEmail: "sarah@campus.edu",
        condition: "Excellent",
        location: "Psychology Building",
        categoryId: categoryMap.get("textbooks") || 11,
        imageUrls: ["https://images.unsplash.com/photo-1576872381149-7847515ce5d8?auto=format&fit=crop&q=80&w=1472&ixlib=rb-4.0.3"],
        isUrgent: false
      },
      {
        title: "Calculus: Early Transcendentals",
        description: "James Stewart's Calculus textbook. No writing or highlighting inside. Perfect for Calculus I, II, and III courses.",
        price: 70,
        sellerEmail: "alex@campus.edu",
        condition: "Like New",
        location: "Mathematics Department",
        categoryId: categoryMap.get("textbooks") || 11,
        imageUrls: ["https://images.unsplash.com/photo-1621944190310-e3cca1564bd7?auto=format&fit=crop&q=80&w=1470&ixlib=rb-4.0.3"],
        isUrgent: true
      },
      // Furniture
      {
        title: "Queen Size Mattress - 1 Year Old",
        description: "Sealy Posturepedic queen mattress, very comfortable and in excellent condition. Only 1 year old. Mattress protector always used. Selling because I'm moving out of state.",
        price: 250,
        sellerEmail: "jane@campus.edu",
        condition: "Like New",
        location: "University Apartments",
        categoryId: categoryMap.get("furniture") || 12,
        imageUrls: ["https://images.unsplash.com/photo-1631052066179-9487293567c7?auto=format&fit=crop&q=80&w=1470&ixlib=rb-4.0.3"],
        isUrgent: true
      },
      {
        title: "Study Desk with Chair",
        description: "IKEA desk and chair set in good condition. Desk has two drawers and plenty of workspace. Chair is adjustable height. Perfect for dorm or apartment.",
        price: 85,
        sellerEmail: "mike@campus.edu",
        condition: "Good",
        location: "Off-campus Housing",
        categoryId: categoryMap.get("furniture") || 12,
        imageUrls: ["https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&q=80&w=1536&ixlib=rb-4.0.3"],
        isUrgent: false
      },
      {
        title: "Twin XL Mattress - Perfect for Dorms",
        description: "Memory foam twin XL mattress, perfect for dorm beds. Used for one year only, in excellent condition. Includes mattress protector.",
        price: 120,
        sellerEmail: "sarah@campus.edu",
        condition: "Excellent",
        location: "Campus Dorms",
        categoryId: categoryMap.get("furniture") || 12,
        imageUrls: ["https://images.unsplash.com/photo-1592789705501-eaad6c950fc9?auto=format&fit=crop&q=80&w=1374&ixlib=rb-4.0.3"],
        isUrgent: true
      },
      {
        title: "Small Bookshelf - 3 Shelves",
        description: "Compact bookshelf with 3 shelves, perfect for textbooks and supplies. Easily fits in dorm room or apartment.",
        price: 40,
        sellerEmail: "alex@campus.edu",
        condition: "Good",
        location: "Near Student Center",
        categoryId: categoryMap.get("furniture") || 12,
        imageUrls: ["https://images.unsplash.com/photo-1594620302200-9a762244a156?auto=format&fit=crop&q=80&w=1399&ixlib=rb-4.0.3"],
        isUrgent: false
      },
      {
        title: "Futon - Converts to Bed",
        description: "Black futon that easily converts from sofa to bed. Great for dorm rooms or small apartments when you have guests. Minor wear but very comfortable.",
        price: 95,
        sellerEmail: "jane@campus.edu",
        condition: "Good",
        location: "Off-campus Housing",
        categoryId: categoryMap.get("furniture") || 12,
        imageUrls: ["https://images.unsplash.com/photo-1540574163026-643ea20ade25?auto=format&fit=crop&q=80&w=1470&ixlib=rb-4.0.3"],
        isUrgent: true
      },
      {
        title: "Comfortable Dorm Chair",
        description: "Padded desk chair with adjustable height. Much more comfortable than standard dorm chairs. Easy to transport.",
        price: 45,
        sellerEmail: "mike@campus.edu",
        condition: "Like New",
        location: "Campus Dorms",
        categoryId: categoryMap.get("furniture") || 12,
        imageUrls: ["https://images.unsplash.com/photo-1580480055273-228ff5388ef8?auto=format&fit=crop&q=80&w=1374&ixlib=rb-4.0.3"],
        isUrgent: false
      },
      // Electronics
      {
        title: "TI-84 Plus CE Graphing Calculator",
        description: "TI-84 Plus CE graphing calculator in perfect working condition. Used for one semester of calculus. Comes with charging cable and case.",
        price: 80,
        sellerEmail: "sarah@campus.edu",
        condition: "Excellent",
        location: "Math Building",
        categoryId: categoryMap.get("electronics") || 13,
        imageUrls: ["https://images.unsplash.com/photo-1564466809058-bf4114d55352?auto=format&fit=crop&q=80&w=1386&ixlib=rb-4.0.3"],
        isUrgent: true
      },
      {
        title: "Apple iPad Air (2020) - 64GB",
        description: "iPad Air 2020 model in excellent condition. 64GB storage, space gray color. Perfect for note-taking and textbooks. Includes charger and case.",
        price: 350,
        sellerEmail: "alex@campus.edu",
        condition: "Like New",
        location: "Library",
        categoryId: categoryMap.get("electronics") || 13,
        imageUrls: ["https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&q=80&w=1557&ixlib=rb-4.0.3"],
        isUrgent: false
      },
      // Dorm Essentials
      {
        title: "Mini Refrigerator",
        description: "Compact dorm refrigerator (3.2 cubic feet) with small freezer section. Works perfectly. Great for keeping snacks and drinks cold.",
        price: 75,
        sellerEmail: "jane@campus.edu",
        condition: "Good",
        location: "South Campus Dorms",
        categoryId: categoryMap.get("dorm-essentials") || 14,
        imageUrls: ["https://images.unsplash.com/photo-1588854337221-4cf9fa96059c?auto=format&fit=crop&q=80&w=1470&ixlib=rb-4.0.3"],
        isUrgent: true
      },
      {
        title: "Microwave - Perfect for Dorms",
        description: "Compact 700W microwave, perfect for dorm use. Clean and works perfectly. Easy to transport.",
        price: 40,
        sellerEmail: "mike@campus.edu",
        condition: "Good",
        location: "North Campus Dorms",
        categoryId: categoryMap.get("dorm-essentials") || 14,
        imageUrls: ["https://images.unsplash.com/photo-1574179629957-c89281248196?auto=format&fit=crop&q=80&w=1374&ixlib=rb-4.0.3"],
        isUrgent: false
      }
    ];

    // Add listings one by one
    let addedCount = 0;
    for (const listingData of demoListings) {
      const sellerId = userMap.get(listingData.sellerEmail);
      if (!sellerId) continue;

      // Check if listing already exists (by title and seller)
      const existingListing = await db.select()
        .from(listings)
        .where(
          eq(listings.title, listingData.title)
        )
        .limit(1);
      
      if (existingListing.length === 0) {
        // Omit the sellerEmail as it's not part of the listing schema
        const { sellerEmail, imageUrls, ...insertData } = listingData;
        
        await db.insert(listings).values({
          ...insertData,
          sellerId,
          images: imageUrls
        });
        
        // Update category item count
        await db.update(categories)
          .set({ itemCount: sql`${categories.itemCount} + 1` })
          .where(eq(categories.id, insertData.categoryId));
        
        addedCount++;
      }
    }
    
    console.log(`Added ${addedCount} new listings`);
    console.log("✅ Database seeded successfully!");
    
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}

export { seedDatabase };