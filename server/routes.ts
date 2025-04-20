import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { platformConnectionSchema, workflowCreationSchema } from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

export async function registerRoutes(app: Express): Promise<Server> {
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
        description: `Created new workflow "${workflow.name}" with ${workflow.steps.length} steps.`,
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

  // Create HTTP server
  const httpServer = createServer(app);

  return httpServer;
}
