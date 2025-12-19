import type { Express, Request, Response, NextFunction } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me";
const JWT_EXPIRES_IN = "7d";
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "";

const googleClient = GOOGLE_CLIENT_ID
  ? new OAuth2Client(GOOGLE_CLIENT_ID)
  : null;

interface AuthPayload {
  userId: number;
  role: string;
}

declare module "express-serve-static-core" {
  interface Request {
    user?: {
      id: number;
      role: string;
    };
  }
}

function getTokenFromRequest(req: Request): string | null {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.slice("Bearer ".length);
  }
  const cookie = req.headers.cookie?.split(";").find((c) => c.trim().startsWith("auth_token="));
  if (cookie) {
    // Preserve any '=' characters in the JWT value (base64 padding)
    return cookie.split("=").slice(1).join("=");
  }
  return null;
}

function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = getTokenFromRequest(req);
  if (!token) {
    return res.status(401).json({ message: "Not authenticated" });
  }
  try {
    const payload = jwt.verify(token, JWT_SECRET) as AuthPayload;
    req.user = { id: payload.userId, role: payload.role };
    next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}

function requireRole(role: "admin" | "seller") {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    if (role === "admin" && req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }
    if (role === "seller" && !["seller", "admin"].includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied" });
    }
    next();
  };
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // --- Authentication ---

  app.post(api.auth.signup.path, async (req, res) => {
    try {
      const parsed = api.auth.signup.input.parse(req.body);

      const existingUser = await storage.getUserByEmail(parsed.email);
      if (existingUser) {
        return res.status(400).json({ message: "Email already in use" });
      }

      const hashedPassword = await bcrypt.hash(parsed.password, 10);
      const user = await storage.createUser({
        ...parsed,
        password: hashedPassword,
      });

      const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, {
        expiresIn: JWT_EXPIRES_IN,
      });

      res
        .cookie("auth_token", token, {
          httpOnly: true,
          sameSite: "lax",
          secure: false,
        })
        .status(201)
        .json(user);
    } catch (err: any) {
      if (err?.name === "ZodError") {
        return res.status(400).json({ message: "Invalid input" });
      }
      return res.status(500).json({ message: "Internal Server Error" });
    }
  });

  app.post(api.auth.login.path, async (req, res) => {
    try {
      const parsed = api.auth.login.input.parse(req.body);
      const user = await storage.getUserByEmail(parsed.email);

      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const isValid = await bcrypt.compare(parsed.password, user.password);
      if (!isValid) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, {
        expiresIn: JWT_EXPIRES_IN,
      });

      res
        .cookie("auth_token", token, {
          httpOnly: true,
          sameSite: "lax",
          secure: false,
        })
        .json({ user });
    } catch (err: any) {
      if (err?.name === "ZodError") {
        return res.status(400).json({ message: "Invalid input" });
      }
      return res.status(500).json({ message: "Internal Server Error" });
    }
  });

  app.get(api.auth.me.path, requireAuth, async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    const user = await storage.getUser(req.user.id);
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }
    res.json(user);
  });

  app.post(api.auth.logout.path, requireAuth, async (_req, res) => {
    res.clearCookie("auth_token").status(204).end();
  });

  app.post(api.auth.google.path, async (req, res) => {
    if (!googleClient || !GOOGLE_CLIENT_ID) {
      return res.status(500).json({ message: "Google auth not configured" });
    }
    try {
      const parsed = api.auth.google.input.parse(req.body);

      const ticket = await googleClient.verifyIdToken({
        idToken: parsed.idToken,
        audience: GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload();
      if (!payload || !payload.email) {
        return res.status(401).json({ message: "Invalid Google token" });
      }

      const email = payload.email;
      const name = payload.name || email.split("@")[0];
      const avatar = payload.picture;

      let user = await storage.getUserByEmail(email);
      if (!user) {
        // Create a user with a random password (never used directly)
        const randomPassword = await bcrypt.hash(
          `google-${payload.sub || Date.now()}`,
          10,
        );
        user = await storage.createUser({
          username: email.split("@")[0],
          email,
          password: randomPassword,
          name,
          avatar,
        });
      }

      const token = jwt.sign(
        { userId: user.id, role: user.role },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN },
      );

      res
        .cookie("auth_token", token, {
          httpOnly: true,
          sameSite: "lax",
          secure: false,
        })
        .json({ user });
    } catch (err: any) {
      if (err?.name === "ZodError") {
        return res.status(400).json({ message: "Invalid Google auth payload" });
      }
      return res.status(401).json({ message: "Google authentication failed" });
    }
  });

  // --- Products & Search ---

  app.get(api.products.list.path, async (req, res) => {
    const products = await storage.getProducts();
    res.json(products);
  });

  app.get(api.products.get.path, async (req, res) => {
    const product = await storage.getProduct(Number(req.params.id));
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  });

  app.get("/api/search", async (req, res) => {
    const { q, category, status } = req.query;
    const products = await storage.searchProducts({
      q: typeof q === "string" ? q : undefined,
      category: typeof category === "string" ? category : undefined,
      status: typeof status === "string" ? status : undefined,
    });
    res.json(products);
  });

  app.get(api.orders.list.path, requireAuth, async (req, res) => {
    const userId = req.user!.id;
    const orders = await storage.getOrders(userId);
    res.json(orders);
  });

  app.post(api.orders.create.path, requireAuth, async (req, res) => {
    try {
      const parsed = api.orders.create.input.parse(req.body);
      const order = await storage.createOrder({
        ...parsed,
        userId: req.user!.id,
      });
      res.status(201).json(order);
    } catch (err: any) {
      if (err?.name === "ZodError") {
        return res.status(400).json({ message: "Invalid order payload" });
      }
      return res.status(500).json({ message: "Internal Server Error" });
    }
  });

  // --- Favorites / Wishlist ---

  app.get(api.favorites.list.path, requireAuth, async (req, res) => {
    const favorites = await storage.getFavorites(req.user!.id);
    res.json(favorites);
  });

  app.post(api.favorites.toggle.path, requireAuth, async (req, res) => {
    try {
      const parsed = api.favorites.toggle.input.parse(req.body);
      const status = await storage.toggleFavorite(req.user!.id, parsed.productId);
      res.json({ status });
    } catch (err: any) {
      if (err?.name === "ZodError") {
        return res.status(400).json({ message: "Invalid favorite payload" });
      }
      return res.status(500).json({ message: "Internal Server Error" });
    }
  });

  // --- Reviews ---

  app.get(api.reviews.listForProduct.path, async (req, res) => {
    const productId = Number(req.params.id);
    const reviews = await storage.getReviewsForProduct(productId);
    res.json(reviews);
  });

  app.post(api.reviews.create.path, requireAuth, async (req, res) => {
    const productId = Number(req.params.id);
    try {
      const parsed = api.reviews.create.input.parse(req.body);
      const product = await storage.getProduct(productId);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      const review = await storage.createReview({
        productId,
        sellerId: product.sellerId,
        buyerId: req.user!.id,
        rating: parsed.rating,
        comment: parsed.comment,
      });
      res.status(201).json(review);
    } catch (err: any) {
      if (err?.name === "ZodError") {
        return res.status(400).json({ message: "Invalid review payload" });
      }
      return res.status(500).json({ message: "Internal Server Error" });
    }
  });

  return httpServer;
}
