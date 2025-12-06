import type { Express } from "express";
import { createServer, type Server } from "http";
import session from "express-session";
import MemoryStore from "memorystore";
import bcrypt from "bcryptjs";
import { storage } from "./storage";
import { insertUserSchema, type User } from "@shared/schema";
import { fromZodError } from "zod-validation-error";

declare module "express-session" {
  interface SessionData {
    userId: string;
  }
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  const SessionStore = MemoryStore(session);

  app.use(
    session({
      secret: process.env.SESSION_SECRET || "campus-marketplace-secret-key-change-in-production",
      resave: false,
      saveUninitialized: false,
      store: new SessionStore({
        checkPeriod: 86400000,
      }),
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 7,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
      },
    })
  );

  app.post("/api/signup", async (req, res) => {
    try {
      const validationResult = insertUserSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: fromZodError(validationResult.error).message 
        });
      }

      const { name, email, password, avatar } = validationResult.data;

      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "Email already in use" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await storage.createUser({
        name,
        email,
        password: hashedPassword,
        avatar,
      });

      req.session.userId = user.id;

      const { password: _, ...userWithoutPassword } = user;
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      console.error("Signup error:", error);
      res.status(500).json({ message: "Failed to create user" });
    }
  });

  app.post("/api/login", async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }

      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      req.session.userId = user.id;

      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Failed to login" });
    }
  });

  app.post("/api/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Failed to logout" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });

  app.get("/api/user", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const user = await storage.getUser(req.session.userId);
      if (!user) {
        req.session.destroy(() => {});
        return res.status(401).json({ message: "User not found" });
      }

      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Get user error:", error);
      res.status(500).json({ message: "Failed to get user" });
    }
  });

  return httpServer;
}
