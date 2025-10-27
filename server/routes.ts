import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertCompanySchema, insertPlatformSchema } from "@shared/schema";
import { z } from "zod";
import OpenAI from "openai";
import * as cheerio from "cheerio";

export async function registerRoutes(app: Express): Promise<Server> {
  // Company routes
  app.get("/api/company", async (req, res) => {
    try {
      const company = await storage.getCompany();
      if (!company) {
        return res.status(404).json({ message: "Company not found" });
      }
      res.json(company);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch company data" });
    }
  });

  app.put("/api/company/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updateData = insertCompanySchema.partial().parse(req.body);
      
      const updatedCompany = await storage.updateCompany(id, updateData);
      if (!updatedCompany) {
        return res.status(404).json({ message: "Company not found" });
      }
      
      res.json(updatedCompany);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update company" });
    }
  });

  // Platform routes
  app.get("/api/platforms", async (req, res) => {
    try {
      const platforms = await storage.getAllPlatforms();
      res.json(platforms);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch platforms" });
    }
  });

  app.get("/api/platforms/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const platform = await storage.getPlatform(id);
      
      if (!platform) {
        return res.status(404).json({ message: "Platform not found" });
      }
      
      res.json(platform);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch platform" });
    }
  });

  app.post("/api/platforms", async (req, res) => {
    try {
      const platformData = insertPlatformSchema.parse(req.body);
      const newPlatform = await storage.createPlatform(platformData);
      res.status(201).json(newPlatform);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create platform" });
    }
  });

  app.put("/api/platforms/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updateData = insertPlatformSchema.partial().parse(req.body);
      
      const updatedPlatform = await storage.updatePlatform(id, updateData);
      if (!updatedPlatform) {
        return res.status(404).json({ message: "Platform not found" });
      }
      
      res.json(updatedPlatform);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update platform" });
    }
  });

  app.delete("/api/platforms/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deletePlatform(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Platform not found" });
      }
      
      res.json({ message: "Platform deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete platform" });
    }
  });

  app.post("/api/platforms/extract-from-url", async (req, res) => {
    try {
      const { url } = req.body;
      
      if (!url || typeof url !== 'string') {
        return res.status(400).json({ message: "URL is required" });
      }

      const openai = new OpenAI({
        apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
        baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
      });

      const response = await fetch(url);
      if (!response.ok) {
        return res.status(400).json({ message: "Failed to fetch URL" });
      }

      const html = await response.text();
      const $ = cheerio.load(html);
      
      $('script').remove();
      $('style').remove();
      $('noscript').remove();
      
      const title = $('title').text() || $('h1').first().text();
      const metaDescription = $('meta[name="description"]').attr('content') || 
                             $('meta[property="og:description"]').attr('content') || '';
      const ogImage = $('meta[property="og:image"]').attr('content') || 
                     $('meta[name="twitter:image"]').attr('content') || '';
      
      const bodyText = $('body').text().replace(/\s+/g, ' ').trim().substring(0, 3000);

      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are a helpful assistant that extracts business information from website content. Extract the business name, a brief description (1-2 sentences), and categorize the business. Return the response as JSON."
          },
          {
            role: "user",
            content: `Analyze this website and extract business information:
            
URL: ${url}
Title: ${title}
Meta Description: ${metaDescription}
Content: ${bodyText}

Return a JSON object with:
- name: The business/platform name (concise)
- description: A brief 1-2 sentence description of what the business does
- category: A category label (e.g., "Project Management", "E-Commerce", "Marketing", "Analytics", etc.)

Be concise and professional.`
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.7,
      });

      const extractedData = JSON.parse(completion.choices[0].message.content || "{}");
      
      let logoUrl = ogImage || '';
      
      if (!logoUrl) {
        try {
          const imageCompletion = await openai.images.generate({
            model: "gpt-image-1",
            prompt: `Professional business logo or hero image for "${extractedData.name}", a ${extractedData.category} platform. Modern, clean, tech-focused design.`,
            n: 1,
            size: "1024x1024",
          });
          
          logoUrl = imageCompletion.data[0].url || '';
        } catch (imageError) {
          console.error("Image generation failed:", imageError);
        }
      }

      const platformData = {
        name: extractedData.name || title,
        description: extractedData.description || metaDescription || "A business platform",
        category: extractedData.category || "Business Software",
        link: url,
        logo: logoUrl,
        isActive: true,
        sortOrder: 0,
      };

      res.json(platformData);
    } catch (error) {
      console.error("Extract from URL error:", error);
      res.status(500).json({ message: "Failed to extract data from URL" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
