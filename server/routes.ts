import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertPlatformSchema, insertWorkflowSchema, insertOpportunitySchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // User routes
  app.get('/api/user/:id', async (req, res) => {
    const id = parseInt(req.params.id);
    const user = await storage.getUser(id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Don't return password
    const { password, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  });

  // Platform routes
  app.get('/api/platforms', async (req, res) => {
    const userId = 1; // For demo purposes, hardcoded userId
    const platforms = await storage.getPlatformsWithStats(userId);
    res.json(platforms);
  });

  app.get('/api/platforms/:id', async (req, res) => {
    const id = parseInt(req.params.id);
    const platform = await storage.getPlatform(id);
    
    if (!platform) {
      return res.status(404).json({ message: 'Platform not found' });
    }
    
    res.json(platform);
  });

  app.post('/api/platforms', async (req, res) => {
    try {
      const parsedBody = insertPlatformSchema.parse(req.body);
      const platform = await storage.createPlatform(parsedBody);
      res.status(201).json(platform);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid platform data', errors: error.errors });
      }
      res.status(500).json({ message: 'Failed to create platform' });
    }
  });

  app.patch('/api/platforms/:id', async (req, res) => {
    const id = parseInt(req.params.id);
    const platform = await storage.getPlatform(id);
    
    if (!platform) {
      return res.status(404).json({ message: 'Platform not found' });
    }
    
    try {
      const updatedPlatform = await storage.updatePlatform(id, req.body);
      res.json(updatedPlatform);
    } catch (error) {
      res.status(500).json({ message: 'Failed to update platform' });
    }
  });

  app.delete('/api/platforms/:id', async (req, res) => {
    const id = parseInt(req.params.id);
    const success = await storage.deletePlatform(id);
    
    if (!success) {
      return res.status(404).json({ message: 'Platform not found' });
    }
    
    res.status(204).send();
  });

  // Workflow routes
  app.get('/api/workflows', async (req, res) => {
    const userId = 1; // For demo purposes, hardcoded userId
    const workflows = await storage.getWorkflowsWithStats(userId);
    res.json(workflows);
  });

  app.get('/api/workflows/:id', async (req, res) => {
    const id = parseInt(req.params.id);
    const workflow = await storage.getWorkflow(id);
    
    if (!workflow) {
      return res.status(404).json({ message: 'Workflow not found' });
    }
    
    res.json(workflow);
  });

  app.post('/api/workflows', async (req, res) => {
    try {
      const parsedBody = insertWorkflowSchema.parse(req.body);
      const workflow = await storage.createWorkflow(parsedBody);
      res.status(201).json(workflow);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid workflow data', errors: error.errors });
      }
      res.status(500).json({ message: 'Failed to create workflow' });
    }
  });

  app.patch('/api/workflows/:id', async (req, res) => {
    const id = parseInt(req.params.id);
    const workflow = await storage.getWorkflow(id);
    
    if (!workflow) {
      return res.status(404).json({ message: 'Workflow not found' });
    }
    
    try {
      const updatedWorkflow = await storage.updateWorkflow(id, req.body);
      res.json(updatedWorkflow);
    } catch (error) {
      res.status(500).json({ message: 'Failed to update workflow' });
    }
  });

  app.delete('/api/workflows/:id', async (req, res) => {
    const id = parseInt(req.params.id);
    const success = await storage.deleteWorkflow(id);
    
    if (!success) {
      return res.status(404).json({ message: 'Workflow not found' });
    }
    
    res.status(204).send();
  });

  // Opportunity routes
  app.get('/api/opportunities', async (req, res) => {
    const userId = 1; // For demo purposes, hardcoded userId
    const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
    const offset = req.query.offset ? parseInt(req.query.offset as string) : 0;
    
    const opportunities = await storage.getOpportunitiesWithPlatform(userId, limit, offset);
    const total = await storage.getOpportunitiesCount(userId);
    
    res.json({ 
      opportunities,
      pagination: {
        total,
        limit,
        offset
      }
    });
  });

  app.get('/api/opportunities/:id', async (req, res) => {
    const id = parseInt(req.params.id);
    const opportunity = await storage.getOpportunity(id);
    
    if (!opportunity) {
      return res.status(404).json({ message: 'Opportunity not found' });
    }
    
    res.json(opportunity);
  });

  app.post('/api/opportunities', async (req, res) => {
    try {
      const parsedBody = insertOpportunitySchema.parse(req.body);
      const opportunity = await storage.createOpportunity(parsedBody);
      res.status(201).json(opportunity);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid opportunity data', errors: error.errors });
      }
      res.status(500).json({ message: 'Failed to create opportunity' });
    }
  });

  app.patch('/api/opportunities/:id', async (req, res) => {
    const id = parseInt(req.params.id);
    const opportunity = await storage.getOpportunity(id);
    
    if (!opportunity) {
      return res.status(404).json({ message: 'Opportunity not found' });
    }
    
    try {
      const updatedOpportunity = await storage.updateOpportunity(id, req.body);
      res.json(updatedOpportunity);
    } catch (error) {
      res.status(500).json({ message: 'Failed to update opportunity' });
    }
  });

  app.delete('/api/opportunities/:id', async (req, res) => {
    const id = parseInt(req.params.id);
    const success = await storage.deleteOpportunity(id);
    
    if (!success) {
      return res.status(404).json({ message: 'Opportunity not found' });
    }
    
    res.status(204).send();
  });

  // Statistics routes
  app.get('/api/statistics', async (req, res) => {
    const userId = 1; // For demo purposes, hardcoded userId
    const statistics = await storage.getStatisticsWithChange(userId);
    
    if (!statistics) {
      return res.status(404).json({ message: 'Statistics not found' });
    }
    
    res.json(statistics);
  });

  app.get('/api/statistics/revenue', async (req, res) => {
    const userId = 1; // For demo purposes, hardcoded userId
    const period = (req.query.period as 'week' | 'month' | 'year') || 'month';
    
    const revenueData = await storage.getRevenueData(userId, period);
    res.json(revenueData);
  });

  return httpServer;
}
