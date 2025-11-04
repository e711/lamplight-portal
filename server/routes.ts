import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertCompanySchema, insertPlatformSchema } from "@shared/schema";
import { z } from "zod";
import OpenAI from "openai";
import * as cheerio from "cheerio";
import { promises as dns } from "dns";

const requiresAuth = () => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.oidc?.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }
    next();
  };
};

const isPrivateOrLocalIP = (ip: string): boolean => {
  if (ip === 'localhost') return true;
  
  const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
  if (ipv4Regex.test(ip)) {
    const parts = ip.split('.').map(Number);
    if (parts.some(p => p > 255)) return false;
    
    if (
      parts[0] === 10 ||
      (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) ||
      (parts[0] === 192 && parts[1] === 168) ||
      parts[0] === 127 ||
      parts[0] === 0 ||
      (parts[0] === 169 && parts[1] === 254)
    ) {
      return true;
    }
  }
  
  const ipv6Patterns = [
    /^::1$/,
    /^fe80:/i,
    /^fc00:/i,
    /^fd[0-9a-f]{2}:/i,
    /^::ffff:(?:10\.|172\.(?:1[6-9]|2\d|3[01])\.|192\.168\.|127\.)/i
  ];
  
  if (ipv6Patterns.some(pattern => pattern.test(ip))) {
    return true;
  }
  
  return false;
};

const fetchUnsplashImage = async (query: string): Promise<string> => {
  try {
    const unsplashResponse = await fetch(
      `https://api.unsplash.com/photos/random?query=${encodeURIComponent(query)}&orientation=landscape`,
      {
        headers: {
          'Authorization': 'Client-ID hOJ9DYC6h7wNKUZQYR8wOkmEPd93SypZzdCTGPbRN_k'
        }
      }
    );
    
    if (unsplashResponse.ok) {
      const unsplashData = await unsplashResponse.json();
      return unsplashData.urls?.regular || unsplashData.urls?.small || '';
    }
  } catch (error) {
    console.error("Unsplash fetch failed:", error);
  }
  return '';
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth routes
  app.get("/api/user", (req: Request, res: Response) => {
    if (req.oidc?.isAuthenticated()) {
      res.json({ user: req.oidc.user });
    } else {
      res.json({ user: null });
    }
  });

  // Company routes (protected)
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

  app.put("/api/company/:id", requiresAuth(), async (req, res) => {
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

  app.post("/api/platforms", requiresAuth(), async (req, res) => {
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

  app.put("/api/platforms/:id", requiresAuth(), async (req, res) => {
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

  app.delete("/api/platforms/:id", requiresAuth(), async (req, res) => {
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

  app.post("/api/platforms/generate-logo", requiresAuth(), async (req, res) => {
    try {
      const { category, name } = req.body;
      
      if (!category || typeof category !== 'string') {
        return res.status(400).json({ message: "Category is required" });
      }

      const logoUrl = await fetchUnsplashImage(category);
      
      if (!logoUrl) {
        return res.status(500).json({ message: "Failed to fetch image from Unsplash" });
      }

      res.json({ logo: logoUrl });
    } catch (error) {
      console.error("Generate logo error:", error);
      res.status(500).json({ message: "Failed to generate logo" });
    }
  });

  app.post("/api/platforms/extract-from-url", requiresAuth(), async (req, res) => {
    try {
      const { url } = req.body;
      
      if (!url || typeof url !== 'string') {
        return res.status(400).json({ message: "URL is required" });
      }

      let parsedUrl;
      try {
        parsedUrl = new URL(url);
      } catch {
        return res.status(400).json({ message: "Invalid URL format" });
      }

      if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
        return res.status(400).json({ message: "Only HTTP and HTTPS URLs are allowed" });
      }

      const hostname = parsedUrl.hostname;

      if (hostname === 'localhost' || hostname.endsWith('.local') || isPrivateOrLocalIP(hostname)) {
        return res.status(400).json({ message: "Private or local addresses are not allowed" });
      }

      let resolvedAddresses: string[] = [];
      try {
        const result = await dns.resolve(hostname);
        resolvedAddresses = result;
      } catch (dnsError) {
        try {
          const result = await dns.resolve4(hostname);
          resolvedAddresses = result;
        } catch {
          return res.status(400).json({ message: "Unable to resolve hostname" });
        }
      }

      for (const addr of resolvedAddresses) {
        if (isPrivateOrLocalIP(addr)) {
          return res.status(400).json({ message: "URL resolves to a private or local IP address" });
        }
      }

      const openai = new OpenAI({
        apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
        baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
      });

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);

      let response;
      try {
        response = await fetch(url, {
          signal: controller.signal,
          headers: {
            'User-Agent': 'LamplightTechnology-Bot/1.0'
          },
          redirect: 'manual'
        });
      } catch (fetchError: any) {
        clearTimeout(timeout);
        if (fetchError.name === 'AbortError') {
          return res.status(408).json({ message: "Request timeout - URL took too long to respond" });
        }
        return res.status(400).json({ message: "Failed to fetch URL" });
      } finally {
        clearTimeout(timeout);
      }

      if (response.status >= 300 && response.status < 400) {
        return res.status(400).json({ message: "Redirects are not allowed for security reasons" });
      }

      if (!response.ok) {
        return res.status(400).json({ message: `Failed to fetch URL (HTTP ${response.status})` });
      }

      const contentType = response.headers.get('content-type') || '';
      if (!contentType.includes('text/html')) {
        return res.status(400).json({ message: "URL must point to an HTML page" });
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

      if (!completion.choices || completion.choices.length === 0 || !completion.choices[0].message.content) {
        return res.status(500).json({ message: "AI service returned unexpected response" });
      }

      const extractedData = JSON.parse(completion.choices[0].message.content || "{}");
      
      let logoUrl = ogImage || '';
      
      if (!logoUrl) {
        const unsplashQuery = extractedData.category || 'technology business';
        logoUrl = await fetchUnsplashImage(unsplashQuery);
        
        if (!logoUrl) {
          // Fallback to OpenAI image generation if Unsplash fails
          try {
            const imageCompletion = await openai.images.generate({
              model: "gpt-image-1",
              prompt: `Professional business logo or hero image for "${extractedData.name}", a ${extractedData.category} platform. Modern, clean, tech-focused design.`,
              n: 1,
              size: "1024x1024",
            });
            
            if (imageCompletion.data && imageCompletion.data[0]?.url) {
              logoUrl = imageCompletion.data[0].url;
            }
          } catch (imageError) {
            console.error("Image generation failed:", imageError);
          }
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
