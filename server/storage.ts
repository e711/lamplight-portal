import { 
  companies, 
  platforms, 
  users, 
  type Company, 
  type Platform, 
  type User, 
  type InsertCompany, 
  type InsertPlatform, 
  type InsertUser 
} from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Company methods
  getCompany(): Promise<Company | undefined>;
  createCompany(company: InsertCompany): Promise<Company>;
  updateCompany(id: number, company: Partial<InsertCompany>): Promise<Company | undefined>;
  
  // Platform methods
  getAllPlatforms(): Promise<Platform[]>;
  getPlatform(id: number): Promise<Platform | undefined>;
  createPlatform(platform: InsertPlatform): Promise<Platform>;
  updatePlatform(id: number, platform: Partial<InsertPlatform>): Promise<Platform | undefined>;
  deletePlatform(id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private companies: Map<number, Company>;
  private platforms: Map<number, Platform>;
  private currentUserId: number;
  private currentCompanyId: number;
  private currentPlatformId: number;

  constructor() {
    this.users = new Map();
    this.companies = new Map();
    this.platforms = new Map();
    this.currentUserId = 1;
    this.currentCompanyId = 1;
    this.currentPlatformId = 1;
    
    // Initialize with default company data
    this.initializeDefaultData();
  }

  private initializeDefaultData() {
    // Create default company
    const defaultCompany: Company = {
      id: 1,
      name: "Dawn Software Group",
      heroTitle: "Empowering Business Through Software Innovation",
      heroDescription: "Dawn Software Group is a leading holding company specializing in cutting-edge SaaS platforms that transform how businesses operate, scale, and succeed in the digital economy.",
      aboutTitle: "Building the Future of Software",
      aboutDescription: "With a portfolio of innovative SaaS platforms, Dawn Software Group drives digital transformation across industries. Our mission is to create powerful, scalable solutions that enable businesses to thrive in an increasingly connected world.",
      contactEmail: "contact@dawnsoftware.com",
      siteTitle: "Dawn Software Group",
      maintenanceMode: false,
    };
    this.companies.set(1, defaultCompany);
    this.currentCompanyId = 2;

    // Create default platforms
    const defaultPlatforms: Platform[] = [
      {
        id: 1,
        name: "CollabFlow",
        description: "Advanced project management and team collaboration platform designed for modern enterprises.",
        category: "Project Management",
        link: "https://collabflow.dawnsoftware.com",
        logo: "https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=200",
        isActive: true,
        sortOrder: 1,
      },
      {
        id: 2,
        name: "FinanceIQ",
        description: "Intelligent financial analytics and reporting platform for data-driven business decisions.",
        category: "Financial Analytics",
        link: "https://financeiq.dawnsoftware.com",
        logo: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=200",
        isActive: true,
        sortOrder: 2,
      },
      {
        id: 3,
        name: "ServiceDesk Pro",
        description: "Comprehensive customer service and support management platform with AI-powered insights.",
        category: "Customer Service",
        link: "https://servicedeskpro.dawnsoftware.com",
        logo: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=200",
        isActive: true,
        sortOrder: 3,
      },
      {
        id: 4,
        name: "MarketFlow",
        description: "All-in-one marketing automation platform with advanced campaign management and analytics.",
        category: "Marketing Automation",
        link: "https://marketflow.dawnsoftware.com",
        logo: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=200",
        isActive: true,
        sortOrder: 4,
      },
      {
        id: 5,
        name: "TalentHub",
        description: "Modern HR management platform with employee engagement and performance tracking tools.",
        category: "Human Resources",
        link: "https://talenthub.dawnsoftware.com",
        logo: "https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=200",
        isActive: true,
        sortOrder: 5,
      },
      {
        id: 6,
        name: "RetailEngine",
        description: "Complete e-commerce and retail management solution with inventory and sales optimization.",
        category: "E-Commerce",
        link: "https://retailengine.dawnsoftware.com",
        logo: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=200",
        isActive: true,
        sortOrder: 6,
      },
    ];

    defaultPlatforms.forEach(platform => {
      this.platforms.set(platform.id, platform);
    });
    this.currentPlatformId = 7;
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Company methods
  async getCompany(): Promise<Company | undefined> {
    return this.companies.get(1); // Single company setup
  }

  async createCompany(insertCompany: InsertCompany): Promise<Company> {
    const id = this.currentCompanyId++;
    const company: Company = { ...insertCompany, id };
    this.companies.set(id, company);
    return company;
  }

  async updateCompany(id: number, updateData: Partial<InsertCompany>): Promise<Company | undefined> {
    const company = this.companies.get(id);
    if (!company) return undefined;
    
    const updatedCompany: Company = { ...company, ...updateData };
    this.companies.set(id, updatedCompany);
    return updatedCompany;
  }

  // Platform methods
  async getAllPlatforms(): Promise<Platform[]> {
    return Array.from(this.platforms.values())
      .filter(platform => platform.isActive)
      .sort((a, b) => a.sortOrder - b.sortOrder);
  }

  async getPlatform(id: number): Promise<Platform | undefined> {
    return this.platforms.get(id);
  }

  async createPlatform(insertPlatform: InsertPlatform): Promise<Platform> {
    const id = this.currentPlatformId++;
    const platform: Platform = { 
      ...insertPlatform, 
      id,
      sortOrder: insertPlatform.sortOrder || id
    };
    this.platforms.set(id, platform);
    return platform;
  }

  async updatePlatform(id: number, updateData: Partial<InsertPlatform>): Promise<Platform | undefined> {
    const platform = this.platforms.get(id);
    if (!platform) return undefined;
    
    const updatedPlatform: Platform = { ...platform, ...updateData };
    this.platforms.set(id, updatedPlatform);
    return updatedPlatform;
  }

  async deletePlatform(id: number): Promise<boolean> {
    return this.platforms.delete(id);
  }
}

export const storage = new MemStorage();
