import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { appRouter } from "../routers";
import { createContext } from "./context";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  const app = express();
  const server = createServer(app);

  // Enable CORS for all routes - reflect the request origin to support credentials
  app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (origin) {
      res.header("Access-Control-Allow-Origin", origin);
    }
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept, Authorization",
    );
    res.header("Access-Control-Allow-Credentials", "true");

    // Handle preflight requests
    if (req.method === "OPTIONS") {
      res.sendStatus(200);
      return;
    }
    next();
  });

  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  registerOAuthRoutes(app);

  // Discourse OAuth routes
  app.get("/api/oauth/discourse/callback", async (req, res) => {
    const { code, state } = req.query;
    if (!code || !state) {
      return res.status(400).json({ error: "code and state are required" });
    }
    
    // In a real app, we would exchange the code for a token here
    // For now, we'll redirect back to the frontend with the code and state
    const frontendUrl = process.env.EXPO_WEB_PREVIEW_URL || "http://localhost:8081";
    res.redirect(`${frontendUrl}/oauth/discourse/callback?code=${code}&state=${state}`);
  });

  app.post("/api/oauth/discourse/exchange", async (req, res) => {
    const { code, state, redirectUri } = req.body;
    
    try {
      const forumUrl = process.env.EXPO_PUBLIC_DISCOURSE_URL || "https://horlogeforum.nl";
      const clientId = process.env.EXPO_PUBLIC_DISCOURSE_CLIENT_ID;
      const clientSecret = process.env.EXPO_PUBLIC_DISCOURSE_CLIENT_SECRET;

      if (!clientId || !clientSecret) {
        return res.status(500).json({ error: "Discourse OAuth not configured on server" });
      }

      const response = await fetch(`${forumUrl}/oauth/token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_id: clientId,
          client_secret: clientSecret,
          grant_type: "authorization_code",
          code,
          redirect_uri: redirectUri,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        return res.status(response.status).json({ error });
      }

      const data = await response.json();
      
      // Fetch user info
      const userResponse = await fetch(`${forumUrl}/api/users/me.json`, {
        headers: { Authorization: `Bearer ${data.access_token}` },
      });
      
      if (!userResponse.ok) {
        return res.status(userResponse.status).json({ error: "Failed to fetch user info" });
      }
      
      const userData = await userResponse.json();
      
      res.json({
        accessToken: data.access_token,
        user: {
          id: userData.user.id,
          username: userData.user.username,
          name: userData.user.name,
          avatar_url: userData.user.avatar_template 
            ? `${forumUrl}${userData.user.avatar_template.replace("{size}", "96")}`
            : null,
        }
      });
    } catch (error) {
      console.error("[Discourse OAuth] Exchange error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/health", (_req, res) => {
    res.json({ ok: true, timestamp: Date.now() });
  });

  // Proxy endpoint for fetching topic detail pages (avoids CORS on web)
  app.get("/api/discourse/topic/:topicId", async (req, res) => {
    try {
      const { topicId } = req.params;
      const page = req.query.page || 0;
      
      const response = await fetch(
        `https://www.horlogeforum.nl/t/${topicId}.json?page=${page}`
      );
      
      if (!response.ok) {
        return res.status(response.status).json({ error: "Failed to fetch from Discourse" });
      }
      
      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error("[Discourse Proxy] Error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    }),
  );

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, () => {
    console.log(`[api] server listening on port ${port}`);
  });
}

startServer().catch(console.error);
