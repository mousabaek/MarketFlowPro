import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
// We need to use the standard Node.js WebSocket types
import WebSocket, { WebSocketServer } from 'ws';
import { storage } from "./storage";
import { platformConnectionSchema, workflowCreationSchema } from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import { FreelancerController } from "./controllers/freelancer-controller";
import { AmazonAssociatesController } from "./controllers/amazon-associates-controller";
import { EtsyController } from "./controllers/etsy-controller";
import { ClickBankController } from "./controllers/clickbank-controller";
import { AIController } from "./controllers/ai-controller";
import { OpportunityMatcherController } from "./controllers/opportunity-matcher-controller";
import { PaymentController } from "./controllers/payment-controller";
import { setupAuth } from "./auth";
import { seed } from "./seed";

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication
  setupAuth(app);
  // Error handling middleware
  app.use((err: any, req: Request, res: Response, next: Function) => {
    if (err instanceof ZodError) {
      const validationError = fromZodError(err);
      return res.status(400).json({
        error: validationError.message
      });
    }
    next(err);
  });

  // Platform Routes
  app.get("/api/platforms", async (req, res) => {
    const platforms = await storage.getPlatforms();
    res.json(platforms);
  });

  app.get("/api/platforms/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const platform = await storage.getPlatform(id);
    
    if (!platform) {
      return res.status(404).json({ error: "Platform not found" });
    }
    
    res.json(platform);
  });

  app.post("/api/platforms", async (req, res) => {
    try {
      const validatedData = platformConnectionSchema.parse(req.body);
      const platform = await storage.createPlatform(validatedData);
      
      // Create an activity for the new platform
      await storage.createActivity({
        type: "system",
        title: `Connected to ${platform.name}`,
        description: `Successfully connected to ${platform.name} platform.`
      });
      
      res.status(201).json(platform);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ error: validationError.message });
      }
      throw error;
    }
  });

  app.patch("/api/platforms/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const platform = await storage.updatePlatform(id, req.body);
    
    if (!platform) {
      return res.status(404).json({ error: "Platform not found" });
    }
    
    res.json(platform);
  });

  app.delete("/api/platforms/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const deleted = await storage.deletePlatform(id);
    
    if (!deleted) {
      return res.status(404).json({ error: "Platform not found" });
    }
    
    res.status(204).send();
  });

  // Workflow Routes
  app.get("/api/workflows", async (req, res) => {
    const platformId = req.query.platformId ? parseInt(req.query.platformId as string) : undefined;
    
    let workflows;
    if (platformId) {
      workflows = await storage.getWorkflowsByPlatform(platformId);
    } else {
      workflows = await storage.getWorkflows();
    }
    
    res.json(workflows);
  });

  app.get("/api/workflows/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const workflow = await storage.getWorkflow(id);
    
    if (!workflow) {
      return res.status(404).json({ error: "Workflow not found" });
    }
    
    res.json(workflow);
  });

  app.post("/api/workflows", async (req, res) => {
    try {
      const validatedData = workflowCreationSchema.parse(req.body);
      
      // Verify that the platform exists
      const platform = await storage.getPlatform(validatedData.platformId);
      if (!platform) {
        return res.status(400).json({ error: "Platform not found" });
      }
      
      const workflow = await storage.createWorkflow({
        ...validatedData,
        status: "active",
        lastRun: null,
        nextRun: new Date(Date.now() + 15 * 60000), // Schedule to run in 15 minutes
        successRate: 0,
        revenue: 0,
        stats: { runs: 0, successes: 0, failures: 0 }
      });
      
      // Create an activity for the new workflow
      await storage.createActivity({
        type: "system",
        title: `Workflow created`,
        description: `Created new workflow "${workflow.name}"`,
        platformId: workflow.platformId,
        workflowId: workflow.id
      });
      
      res.status(201).json(workflow);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ error: validationError.message });
      }
      throw error;
    }
  });

  app.patch("/api/workflows/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const workflow = await storage.updateWorkflow(id, req.body);
    
    if (!workflow) {
      return res.status(404).json({ error: "Workflow not found" });
    }
    
    res.json(workflow);
  });

  app.delete("/api/workflows/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const deleted = await storage.deleteWorkflow(id);
    
    if (!deleted) {
      return res.status(404).json({ error: "Workflow not found" });
    }
    
    res.status(204).send();
  });

  // Task Routes
  app.get("/api/tasks", async (req, res) => {
    const filters = {
      workflowId: req.query.workflowId ? parseInt(req.query.workflowId as string) : undefined,
      platformId: req.query.platformId ? parseInt(req.query.platformId as string) : undefined,
      status: req.query.status as string | undefined
    };
    
    const tasks = await storage.getTasks(filters);
    res.json(tasks);
  });

  // Activity Routes
  app.get("/api/activities", async (req, res) => {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
    const activities = await storage.getActivities(limit);
    res.json(activities);
  });

  // Freelancer.com API Routes
  app.post("/api/platforms/:platformId/freelancer/test-connection", FreelancerController.testConnection);
  app.get("/api/platforms/:platformId/freelancer/profile", FreelancerController.getUserProfile);
  app.get("/api/platforms/:platformId/freelancer/projects", FreelancerController.searchProjects);
  app.get("/api/platforms/:platformId/freelancer/projects/:projectId", FreelancerController.getProjectDetails);
  app.post("/api/platforms/:platformId/freelancer/bid", FreelancerController.submitBid);
  app.get("/api/platforms/:platformId/freelancer/skills", FreelancerController.getSkills);
  app.get("/api/platforms/:platformId/freelancer/bidding-stats", FreelancerController.getBiddingStats);
  app.get("/api/platforms/:platformId/freelancer/current-bids", FreelancerController.getCurrentBids);
  
  // Amazon Associates API Routes
  app.post("/api/platforms/:platformId/amazon/test-connection", AmazonAssociatesController.testConnection);
  app.get("/api/platforms/:platformId/amazon/products", AmazonAssociatesController.searchProducts);
  app.get("/api/platforms/:platformId/amazon/products/:asin", AmazonAssociatesController.getProductDetails);
  app.get("/api/platforms/:platformId/amazon/commission-rates", AmazonAssociatesController.getCommissionRates);
  app.get("/api/platforms/:platformId/amazon/earnings", AmazonAssociatesController.getEarningsReport);
  
  // Etsy API Routes
  app.post("/api/platforms/:platformId/etsy/test-connection", EtsyController.testConnection);
  app.get("/api/platforms/:platformId/etsy/listings", EtsyController.searchListings);
  app.get("/api/platforms/:platformId/etsy/listings/:listingId", EtsyController.getListingDetails);
  app.get("/api/platforms/:platformId/etsy/shops/:shopId", EtsyController.getShopDetails);
  app.get("/api/platforms/:platformId/etsy/trending", EtsyController.getTrendingListings);
  app.get("/api/platforms/:platformId/etsy/categories", EtsyController.getCategories);
  app.get("/api/platforms/:platformId/etsy/affiliate-stats", EtsyController.getAffiliateStats);
  
  // ClickBank API Routes
  app.post("/api/platforms/:platformId/clickbank/test-connection", ClickBankController.testConnection);
  app.get("/api/platforms/:platformId/clickbank/products", ClickBankController.searchProducts);
  app.get("/api/platforms/:platformId/clickbank/products/:productId", ClickBankController.getProductDetails);
  app.get("/api/platforms/:platformId/clickbank/commission-rates", ClickBankController.getCommissionRates);
  app.get("/api/platforms/:platformId/clickbank/earnings", ClickBankController.getEarningsReport);
  app.get("/api/platforms/:platformId/clickbank/top-products", ClickBankController.getTopProducts);

  // AI-powered Automation Routes
  app.post("/api/ai/generate-story", AIController.generateStory);
  app.post("/api/ai/generate-proposal", AIController.generateProposal);
  app.post("/api/ai/analyze-project", AIController.analyzeProject);
  app.post("/api/ai/generate-response", AIController.generateClientResponse);
  
  // Opportunity Matching Routes
  app.post("/api/opportunities/match", OpportunityMatcherController.findMatches);
  app.get("/api/opportunities/:opportunityId/:platformName/optimize", OpportunityMatcherController.getOptimizationSuggestions);
  app.post("/api/opportunities/:opportunityId/strategy", OpportunityMatcherController.generateStrategy);
  
  // Payment and Withdrawal Routes
  app.post("/api/payments/withdrawal", PaymentController.requestWithdrawal);
  app.get("/api/payments/withdrawal-history", PaymentController.getWithdrawalHistory);
  app.post("/api/payments/withdrawal/:id/cancel", PaymentController.cancelWithdrawal);
  
  // Bank Transfer Routes
  app.post("/api/payments/bank-transfer", PaymentController.processBankTransfer);
  app.post("/api/payments/verify-transfer", PaymentController.verifyBankTransfer);
  app.get("/api/payments/bank-accounts", PaymentController.getBankAccounts);
  
  // Financial Information Routes
  app.get("/api/payments/financials", PaymentController.getUserFinancials);
  
  // Payment Methods Routes
  app.get("/api/payments/methods", PaymentController.getPaymentMethods);
  app.post("/api/payments/methods", PaymentController.addPaymentMethod);
  app.patch("/api/payments/methods/:id", PaymentController.updatePaymentMethod);
  app.delete("/api/payments/methods/:id", PaymentController.deletePaymentMethod);
  
  // WebSocket test endpoint
  app.get("/api/websocket-test", (req, res) => {
    res.json({
      status: "active",
      message: "WebSocket server is running",
      info: "Use the WebSocket status component in the Analytics tab to test live connections"
    });
  });
  
  // WebSocket broadcast endpoint
  app.post("/api/websocket-broadcast", (req, res) => {
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }
    
    let count = 0;
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({
          type: 'broadcast',
          message: message,
          timestamp: new Date().toISOString()
        }));
        count++;
      }
    });
    
    res.json({
      success: true,
      clientCount: count,
      message: `Broadcast sent to ${count} connected clients`
    });
  });
  
  // Theme configuration routes
  app.get("/api/theme", async (req, res) => {
    try {
      const fs = await import('fs/promises');
      const path = await import('path');
      
      const themePath = path.resolve('./theme.json');
      const themeData = await fs.readFile(themePath, 'utf8');
      const theme = JSON.parse(themeData);
      
      res.json(theme);
    } catch (error) {
      console.error('Error reading theme configuration:', error);
      res.status(500).json({ error: 'Failed to read theme configuration' });
    }
  });
  
  app.post("/api/theme", async (req, res) => {
    try {
      const fs = await import('fs/promises');
      const path = await import('path');
      
      const { primary, variant, appearance, radius } = req.body;
      
      if (!primary || !variant || !appearance) {
        return res.status(400).json({ error: 'Missing required theme properties' });
      }
      
      const themeConfig = {
        primary,
        variant,
        appearance,
        radius: radius || 0.5
      };
      
      const themePath = path.resolve('./theme.json');
      await fs.writeFile(themePath, JSON.stringify(themeConfig, null, 2));
      
      res.json(themeConfig);
    } catch (error) {
      console.error('Error updating theme configuration:', error);
      res.status(500).json({ error: 'Failed to update theme configuration' });
    }
  });

  // Create HTTP server
  const httpServer = createServer(app);
  
  // Seed the database with initial data
  try {
    await seed();
    console.log('Database seeded successfully.');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
  
  // Setup WebSocket server on a path different from Vite's HMR
  const wss = new WebSocketServer({ 
    server: httpServer, 
    path: '/ws',
    clientTracking: true,
    // Allow connections from any origin for testing purposes
    verifyClient: ({ origin, req, secure }: { 
      origin: string | undefined; 
      req: any; 
      secure: boolean;
    }) => {
      // In production, you may want to restrict origins
      // For now, accept all connections for development
      console.log(`WebSocket connection attempt from origin: ${origin || 'unknown'}`);
      return true;
    }
  });
  
  // Extend WebSocket type to include client-specific properties
  interface ExtendedWebSocket extends WebSocket {
    clientId: string;
  }
  
  // Define collaboration event types
  interface CollaborationEvent {
    id: string;
    type: string;
    user: {
      id: string;
      name: string;
      avatar?: string;
    };
    timestamp: string;
    action?: string;
    target?: string;
    details?: string;
  }
  
  // Define client information type
  interface ClientInfo {
    ws: ExtendedWebSocket;
    joinedAt: string;
    userName: string;
    avatar?: string;
  }
  
  // Track connected clients and their information
  const connectedClients = new Map<string, ClientInfo>();
  
  // Generate a unique ID for messages
  function generateId(): string {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  }
  
  // Broadcast collaboration event to all clients
  function broadcastCollaborationEvent(event: CollaborationEvent): void {
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({
          type: 'collaboration_event',
          event
        }));
      }
    });
  }
  
  // WebSocket connection handler
  wss.on('connection', (ws: WebSocket, req) => {
    console.log('WebSocket connection established from', req.socket.remoteAddress);
    
    // Cast WebSocket to extended type
    const extendedWs = ws as ExtendedWebSocket;
    
    // Parse URL query parameters using URLSearchParams
    const url = req.url || '';
    const queryString = url.includes('?') ? url.split('?')[1] : '';
    const queryParams = new URLSearchParams(queryString);
    
    // Extract user information from query parameters
    const clientId = queryParams.get('userId') || `user-${generateId()}`;
    const userName = queryParams.get('userName') 
      ? decodeURIComponent(queryParams.get('userName')!) 
      : `User ${clientId.substring(0, 6)}`;
    const avatar = queryParams.get('avatar') 
      ? decodeURIComponent(queryParams.get('avatar')!) 
      : undefined;
    
    // Store client info
    extendedWs.clientId = clientId;
    
    connectedClients.set(clientId, {
      ws: extendedWs,
      joinedAt: new Date().toISOString(),
      userName,
      avatar
    });
    
    // Create and broadcast join event
    const joinEvent: CollaborationEvent = {
      id: generateId(),
      type: 'join',
      user: {
        id: clientId,
        name: userName,
        avatar: avatar
      },
      timestamp: new Date().toISOString(),
      action: 'joined the collaboration'
    };
    
    broadcastCollaborationEvent(joinEvent);
    
    // Handle incoming messages
    extendedWs.on('message', (message) => {
      console.log('Received WebSocket message:', message.toString());
      
      try {
        const data = JSON.parse(message.toString());
        
        // Handle different message types
        if (data.type === 'cursor_update' || data.type === 'cursor_position') {
          // Forward cursor updates to all clients
          const clientInfo = connectedClients.get(extendedWs.clientId);
          if (clientInfo) {
            wss.clients.forEach((client) => {
              if (client !== extendedWs && client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({
                  type: 'cursor_position_broadcast',
                  userId: extendedWs.clientId,
                  userName: clientInfo.userName,
                  position: data.position
                }));
              }
            });
          }
        } else if (data.type === 'user_action') {
          // Create and broadcast action event
          const clientInfo = connectedClients.get(extendedWs.clientId);
          
          if (clientInfo) {
            const actionEvent: CollaborationEvent = {
              id: generateId(),
              type: 'action',
              user: {
                id: extendedWs.clientId,
                name: clientInfo.userName,
                avatar: clientInfo.avatar
              },
              timestamp: new Date().toISOString(),
              action: data.action,
              target: data.target,
              details: data.details
            };
            
            broadcastCollaborationEvent(actionEvent);
          }
        } 
        // Handle presence messages (for Collaboration Visualization)
        else if (data.type === 'presence') {
          const clientInfo = connectedClients.get(extendedWs.clientId);
          if (clientInfo) {
            // Update user information if needed
            if (data.user && data.user.name) {
              clientInfo.userName = data.user.name;
            }
            if (data.user && data.user.avatar) {
              clientInfo.avatar = data.user.avatar;
            }
            
            // Create and broadcast presence event
            const presenceEvent: CollaborationEvent = {
              id: generateId(),
              type: 'presence',
              user: {
                id: extendedWs.clientId,
                name: clientInfo.userName,
                avatar: clientInfo.avatar
              },
              timestamp: new Date().toISOString(),
              action: data.action,
              target: data.target,
              details: JSON.stringify(data.user)
            };
            
            broadcastCollaborationEvent(presenceEvent);
          }
        }
        // Handle activity messages (for Collaboration Visualization)
        else if (data.type === 'activity') {
          const clientInfo = connectedClients.get(extendedWs.clientId);
          if (clientInfo) {
            // Create and broadcast activity event
            const activityEvent: CollaborationEvent = {
              id: data.id || generateId(),
              type: 'activity',
              user: {
                id: extendedWs.clientId,
                name: clientInfo.userName,
                avatar: clientInfo.avatar
              },
              timestamp: data.timestamp || new Date().toISOString(),
              action: data.activityType,
              target: data.target,
              details: data.message
            };
            
            broadcastCollaborationEvent(activityEvent);
          }
        }
        // Handle chat messages (for Collaboration Visualization)
        else if (data.type === 'message') {
          const clientInfo = connectedClients.get(extendedWs.clientId);
          if (clientInfo) {
            // Create and broadcast message event
            const messageEvent: CollaborationEvent = {
              id: generateId(),
              type: 'message',
              user: {
                id: extendedWs.clientId,
                name: clientInfo.userName,
                avatar: clientInfo.avatar
              },
              timestamp: data.timestamp || new Date().toISOString(),
              action: 'message',
              details: data.message
            };
            
            broadcastCollaborationEvent(messageEvent);
          }
        }
        else {
          // Echo other message types back to the client
          if (extendedWs.readyState === WebSocket.OPEN) {
            extendedWs.send(JSON.stringify({ 
              type: 'response',
              message: 'Message received',
              data: data
            }));
          }
        }
      } catch (error: unknown) {
        console.error('Error processing WebSocket message:', error);
        // Send error response
        if (extendedWs.readyState === WebSocket.OPEN) {
          extendedWs.send(JSON.stringify({ 
            type: 'error',
            message: 'Failed to process message',
            error: error instanceof Error ? error.message : 'Unknown error'
          }));
        }
      }
    });
    
    // Handle connection closing
    extendedWs.on('close', () => {
      console.log('WebSocket connection closed for client:', extendedWs.clientId);
      
      // Create and broadcast leave event
      if (connectedClients.has(extendedWs.clientId)) {
        const clientInfo = connectedClients.get(extendedWs.clientId);
        
        if (clientInfo) {
          const leaveEvent: CollaborationEvent = {
            id: generateId(),
            type: 'leave',
            user: {
              id: extendedWs.clientId,
              name: clientInfo.userName,
              avatar: clientInfo.avatar
            },
            timestamp: new Date().toISOString(),
            action: 'left the collaboration'
          };
          
          broadcastCollaborationEvent(leaveEvent);
        }
        
        // Remove client from tracking
        connectedClients.delete(extendedWs.clientId);
      }
    });
    
    // Handle errors
    extendedWs.on('error', (error) => {
      console.error('WebSocket error for client:', extendedWs.clientId, error);
    });
    
    // Send welcome message with list of active collaborators
    const activeCollaborators = Array.from(connectedClients.entries())
      .filter(([id, _]) => id !== clientId) // Exclude current client
      .map(([id, client]) => ({
        userId: id,
        userName: client.userName,
        avatar: client.avatar,
        joinedAt: client.joinedAt
      }));
    
    extendedWs.send(JSON.stringify({ 
      type: 'welcome',
      message: 'Connected to Wolf Auto Marketer WebSocket server',
      clientId: clientId,
      activeCollaborators
    }));
  });

  return httpServer;
}
