import express, { type Request, Response, NextFunction } from "express";
import { auth } from "express-openid-connect";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

const app = express();
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false, limit: '10mb' }));

const getBaseURL = (): string => {
  // 1. Check for custom domain first (production with custom domain)
  if (process.env.CUSTOM_DOMAIN) {
    return `https://${process.env.CUSTOM_DOMAIN}`;
  }
  
  // 2. Check for REPLIT_DOMAINS (published Replit apps)
  if (process.env.REPLIT_DOMAINS) {
    const domains = process.env.REPLIT_DOMAINS.split(',').map(d => d.trim()).filter(Boolean);
    
    // Prefer .replit.app domains (official published app domain)
    const replitAppDomain = domains.find(d => d.endsWith('.replit.app'));
    if (replitAppDomain) {
      return `https://${replitAppDomain}`;
    }
    
    // Fall back to first HTTPS-compatible domain
    const firstDomain = domains[0];
    if (firstDomain && firstDomain.includes('.')) {
      return `https://${firstDomain}`;
    }
  }
  
  // 3. Check for Replit dev domain (Replit development/workspace)
  if (process.env.REPLIT_DEV_DOMAIN) {
    return `https://${process.env.REPLIT_DEV_DOMAIN}`;
  }
  
  // 4. Legacy: Check if we're in production mode on Replit (older deployments)
  if (process.env.REPL_SLUG && process.env.REPL_OWNER) {
    return `https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co`;
  }
  
  // 5. Fallback for local development
  return 'http://localhost:5000';
};

// Only use auth if all required environment variables are present
if (process.env.AUTH0_SECRET && process.env.AUTH0_CLIENT_ID && process.env.AUTH0_DOMAIN) {
  const baseURL = getBaseURL();
  console.log(`Auth0 configured with baseURL: ${baseURL}`);
  const config = {
    authRequired: false,
    auth0Logout: true,
    idpLogout: true,
    secret: process.env.AUTH0_SECRET,
    baseURL,
    clientID: process.env.AUTH0_CLIENT_ID,
    issuerBaseURL: `https://${process.env.AUTH0_DOMAIN}`,
    routes: {
      callback: '/callback',
      login: '/api/login',
      logout: '/api/logout',
      postLogoutRedirect: '/'
    },
    session: {
      name: 'lamplight_session',
      rolling: true,
      rollingDuration: 86400
    }
  };

  app.use(auth(config));
} else {
  console.log('Auth0 configuration not found, running without authentication');
  // Add a simple middleware to simulate no user logged in
  app.use((req: any, res, next) => {
    req.oidc = { user: null, isAuthenticated: () => false };
    next();
  });
}

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client.
  // Bind to 0.0.0.0 to work in all environments (Replit, Docker, cloud hosting, local)
  const port = 5000;
  server.listen(port, "0.0.0.0", () => {
    log(`serving on port ${port}`);
  });
})();
