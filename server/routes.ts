import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Although we have backend routes, the frontend will use client-side mock data as per requirements.
  // We keep these here for completeness of the fullstack structure.

  app.get(api.products.list.path, async (req, res) => {
    const products = await storage.getProducts();
    res.json(products);
  });

  app.get(api.products.get.path, async (req, res) => {
    const product = await storage.getProduct(Number(req.params.id));
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  });

  app.get(api.orders.list.path, async (req, res) => {
    // Mock user ID 1 for demo
    const orders = await storage.getOrders(1);
    res.json(orders);
  });

  return httpServer;
}
