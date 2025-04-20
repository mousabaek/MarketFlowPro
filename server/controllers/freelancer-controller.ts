import { Request, Response } from 'express';
import { FreelancerApiService, SearchParamsSchema, BidSubmissionSchema } from '../services/freelancer-api';
import { storage } from '../storage';

/**
 * Controller for Freelancer.com API endpoints
 */
export class FreelancerController {
  /**
   * Test the connection to Freelancer.com API
   */
  static async testConnection(req: Request, res: Response) {
    try {
      const { platformId } = req.params;
      
      if (!platformId) {
        return res.status(400).json({ error: 'Platform ID is required' });
      }
      
      const platform = await storage.getPlatform(parseInt(platformId));
      
      if (!platform) {
        return res.status(404).json({ error: 'Platform not found' });
      }
      
      if (platform.type !== 'freelance' || platform.name !== 'Freelancer') {
        return res.status(400).json({ error: 'Invalid platform type or name' });
      }
      
      if (!platform.apiKey) {
        return res.status(400).json({ error: 'API key is required' });
      }
      
      const freelancerApi = new FreelancerApiService(platform.apiKey, platform.apiSecret || null);
      const isConnected = await freelancerApi.testConnection();
      
      if (isConnected) {
        // Update platform status
        await storage.updatePlatform(platform.id, { 
          status: 'connected',
          healthStatus: 'healthy',
          lastSynced: new Date()
        });
        
        return res.json({ success: true, message: 'Connection successful' });
      } else {
        // Update platform status
        await storage.updatePlatform(platform.id, { 
          status: 'error',
          healthStatus: 'error'
        });
        
        return res.status(401).json({ 
          success: false, 
          message: 'Failed to connect to Freelancer.com API. Please check your credentials.' 
        });
      }
    } catch (error) {
      console.error('Error testing Freelancer.com connection:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
  
  /**
   * Get user profile from Freelancer.com
   */
  static async getUserProfile(req: Request, res: Response) {
    try {
      const { platformId } = req.params;
      
      if (!platformId) {
        return res.status(400).json({ error: 'Platform ID is required' });
      }
      
      const platform = await storage.getPlatform(parseInt(platformId));
      
      if (!platform) {
        return res.status(404).json({ error: 'Platform not found' });
      }
      
      if (!platform.apiKey) {
        return res.status(400).json({ error: 'API key is required' });
      }
      
      const freelancerApi = new FreelancerApiService(platform.apiKey, platform.apiSecret || null);
      const profileData = await freelancerApi.getUserProfile();
      
      // Update last synced timestamp
      await storage.updatePlatform(platform.id, { 
        lastSynced: new Date(),
        status: 'connected',
        healthStatus: 'healthy'
      });
      
      // Create activity record
      await storage.createActivity({
        type: 'profile_sync',
        platformId: platform.id,
        title: 'Profile Synchronized',
        description: 'Freelancer.com profile data synchronized successfully',
        data: { timestamp: new Date() }
      });
      
      return res.json(profileData);
    } catch (error: any) {
      console.error('Error fetching Freelancer.com profile:', error);
      
      // Create error activity
      if (req.params.platformId) {
        await storage.createActivity({
          type: 'error',
          platformId: parseInt(req.params.platformId),
          title: 'API Error',
          description: 'Failed to fetch Freelancer.com profile data',
          data: { error: error.message, timestamp: new Date() }
        });
        
        // Update platform status
        await storage.updatePlatform(parseInt(req.params.platformId), { 
          status: 'error',
          healthStatus: 'error'
        });
      }
      
      return res.status(500).json({ error: 'Failed to fetch profile data' });
    }
  }
  
  /**
   * Search for projects on Freelancer.com
   */
  static async searchProjects(req: Request, res: Response) {
    try {
      const { platformId } = req.params;
      
      if (!platformId) {
        return res.status(400).json({ error: 'Platform ID is required' });
      }
      
      const platform = await storage.getPlatform(parseInt(platformId));
      
      if (!platform) {
        return res.status(404).json({ error: 'Platform not found' });
      }
      
      if (!platform.apiKey) {
        return res.status(400).json({ error: 'API key is required' });
      }
      
      // Validate search parameters
      const searchParamsResult = SearchParamsSchema.safeParse(req.query);
      
      if (!searchParamsResult.success) {
        return res.status(400).json({ 
          error: 'Invalid search parameters',
          details: searchParamsResult.error.format()
        });
      }
      
      const freelancerApi = new FreelancerApiService(platform.apiKey, platform.apiSecret || null);
      const projectsData = await freelancerApi.searchProjects(searchParamsResult.data);
      
      // Update last synced timestamp
      await storage.updatePlatform(platform.id, { lastSynced: new Date() });
      
      // Create activity record
      await storage.createActivity({
        type: 'search',
        platformId: platform.id,
        title: 'Project Search',
        description: `Searched for projects with query: ${req.query.query || 'All projects'}`,
        data: { 
          query: req.query.query,
          resultCount: projectsData.result?.total || 0,
          timestamp: new Date()
        }
      });
      
      return res.json(projectsData);
    } catch (error: any) {
      console.error('Error searching Freelancer.com projects:', error);
      
      // Create error activity
      if (req.params.platformId) {
        await storage.createActivity({
          type: 'error',
          platformId: parseInt(req.params.platformId),
          title: 'Search Error',
          description: 'Failed to search Freelancer.com projects',
          data: { error: error.message, timestamp: new Date() }
        });
      }
      
      return res.status(500).json({ error: 'Failed to search projects' });
    }
  }
  
  /**
   * Get project details from Freelancer.com
   */
  static async getProjectDetails(req: Request, res: Response) {
    try {
      const { platformId, projectId } = req.params;
      
      if (!platformId || !projectId) {
        return res.status(400).json({ error: 'Platform ID and Project ID are required' });
      }
      
      const platform = await storage.getPlatform(parseInt(platformId));
      
      if (!platform) {
        return res.status(404).json({ error: 'Platform not found' });
      }
      
      if (!platform.apiKey) {
        return res.status(400).json({ error: 'API key is required' });
      }
      
      const freelancerApi = new FreelancerApiService(platform.apiKey, platform.apiSecret || null);
      const projectData = await freelancerApi.getProjectDetails(parseInt(projectId));
      
      // Create activity record
      await storage.createActivity({
        type: 'view_details',
        platformId: platform.id,
        title: 'Project Details Viewed',
        description: `Viewed details for project #${projectId}`,
        data: { 
          projectId: parseInt(projectId),
          timestamp: new Date()
        }
      });
      
      return res.json(projectData);
    } catch (error: any) {
      console.error(`Error fetching Freelancer.com project #${req.params.projectId}:`, error);
      
      // Create error activity
      if (req.params.platformId) {
        await storage.createActivity({
          type: 'error',
          platformId: parseInt(req.params.platformId),
          title: 'Project Details Error',
          description: `Failed to fetch details for project #${req.params.projectId}`,
          data: { error: error.message, timestamp: new Date() }
        });
      }
      
      return res.status(500).json({ error: 'Failed to fetch project details' });
    }
  }
  
  /**
   * Submit a bid on a Freelancer.com project
   */
  static async submitBid(req: Request, res: Response) {
    try {
      const { platformId } = req.params;
      
      if (!platformId) {
        return res.status(400).json({ error: 'Platform ID is required' });
      }
      
      const platform = await storage.getPlatform(parseInt(platformId));
      
      if (!platform) {
        return res.status(404).json({ error: 'Platform not found' });
      }
      
      if (!platform.apiKey) {
        return res.status(400).json({ error: 'API key is required' });
      }
      
      // Validate bid submission parameters
      const bidParamsResult = BidSubmissionSchema.safeParse(req.body);
      
      if (!bidParamsResult.success) {
        return res.status(400).json({ 
          error: 'Invalid bid parameters',
          details: bidParamsResult.error.format()
        });
      }
      
      const { projectId, amount, period, milestone_percentage, description } = bidParamsResult.data;
      
      const freelancerApi = new FreelancerApiService(platform.apiKey, platform.apiSecret || null);
      const bidData = await freelancerApi.submitBid(projectId, {
        amount,
        period,
        milestone_percentage,
        description
      });
      
      // Create activity record
      await storage.createActivity({
        type: 'bid_submitted',
        platformId: platform.id,
        title: 'Bid Submitted',
        description: `Submitted a bid of $${amount} on project #${projectId}`,
        data: { 
          projectId,
          amount,
          period,
          timestamp: new Date()
        }
      });
      
      return res.json(bidData);
    } catch (error: any) {
      console.error('Error submitting bid on Freelancer.com:', error);
      
      // Create error activity
      if (req.params.platformId) {
        await storage.createActivity({
          type: 'error',
          platformId: parseInt(req.params.platformId),
          title: 'Bid Submission Error',
          description: `Failed to submit bid on project #${req.body.projectId}`,
          data: { error: error.message, timestamp: new Date() }
        });
      }
      
      return res.status(500).json({ error: 'Failed to submit bid' });
    }
  }
  
  /**
   * Get available skills/jobs from Freelancer.com
   */
  static async getSkills(req: Request, res: Response) {
    try {
      const { platformId } = req.params;
      
      if (!platformId) {
        return res.status(400).json({ error: 'Platform ID is required' });
      }
      
      const platform = await storage.getPlatform(parseInt(platformId));
      
      if (!platform) {
        return res.status(404).json({ error: 'Platform not found' });
      }
      
      if (!platform.apiKey) {
        return res.status(400).json({ error: 'API key is required' });
      }
      
      const freelancerApi = new FreelancerApiService(platform.apiKey, platform.apiSecret || null);
      const skillsData = await freelancerApi.getSkills();
      
      return res.json(skillsData);
    } catch (error: any) {
      console.error('Error fetching Freelancer.com skills:', error);
      return res.status(500).json({ error: 'Failed to fetch skills' });
    }
  }
  
  /**
   * Get bidding stats from Freelancer.com
   */
  static async getBiddingStats(req: Request, res: Response) {
    try {
      const { platformId } = req.params;
      
      if (!platformId) {
        return res.status(400).json({ error: 'Platform ID is required' });
      }
      
      const platform = await storage.getPlatform(parseInt(platformId));
      
      if (!platform) {
        return res.status(404).json({ error: 'Platform not found' });
      }
      
      if (!platform.apiKey) {
        return res.status(400).json({ error: 'API key is required' });
      }
      
      const freelancerApi = new FreelancerApiService(platform.apiKey, platform.apiSecret || null);
      const statsData = await freelancerApi.getBiddingStats();
      
      return res.json(statsData);
    } catch (error: any) {
      console.error('Error fetching Freelancer.com bidding stats:', error);
      return res.status(500).json({ error: 'Failed to fetch bidding stats' });
    }
  }
  
  /**
   * Get current bids from Freelancer.com
   */
  static async getCurrentBids(req: Request, res: Response) {
    try {
      const { platformId } = req.params;
      
      if (!platformId) {
        return res.status(400).json({ error: 'Platform ID is required' });
      }
      
      const platform = await storage.getPlatform(parseInt(platformId));
      
      if (!platform) {
        return res.status(404).json({ error: 'Platform not found' });
      }
      
      if (!platform.apiKey) {
        return res.status(400).json({ error: 'API key is required' });
      }
      
      const freelancerApi = new FreelancerApiService(platform.apiKey, platform.apiSecret || null);
      const bidsData = await freelancerApi.getCurrentBids();
      
      return res.json(bidsData);
    } catch (error: any) {
      console.error('Error fetching Freelancer.com current bids:', error);
      return res.status(500).json({ error: 'Failed to fetch current bids' });
    }
  }
}