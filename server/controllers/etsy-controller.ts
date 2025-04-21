import { Request, Response } from 'express';
import { EtsyApiService, EtsySearchParamsSchema, ListingLookupSchema } from '../services/etsy-api';
import { storage } from '../storage';

/**
 * Controller for Etsy API endpoints
 */
export class EtsyController {
  /**
   * Helper method to extract access token from platform settings
   */
  private static getAccessToken(platform: any): string | null {
    return platform.settings && typeof platform.settings === 'object' 
      ? (platform.settings as any).accessToken || null
      : null;
  }
  
  /**
   * Test the connection to Etsy API
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
      
      if (platform.type !== 'affiliate' || platform.name !== 'Etsy') {
        return res.status(400).json({ error: 'Invalid platform type or name' });
      }
      
      if (!platform.apiKey) {
        return res.status(400).json({ error: 'API key is required' });
      }
      
      const etsyApi = new EtsyApiService(
        platform.apiKey, 
        platform.apiSecret || null,
        EtsyController.getAccessToken(platform)
      );
      
      const isConnected = await etsyApi.testConnection();
      
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
        
        return res.status(400).json({ 
          error: 'Failed to connect to Etsy API. Please check your credentials.' 
        });
      }
    } catch (error) {
      console.error('Error testing Etsy connection:', error);
      return res.status(500).json({ 
        error: 'An error occurred while testing the connection' 
      });
    }
  }
  
  /**
   * Search for listings on Etsy
   */
  static async searchListings(req: Request, res: Response) {
    try {
      const { platformId } = req.params;
      
      // Validate platform
      const platform = await storage.getPlatform(parseInt(platformId));
      if (!platform) {
        return res.status(404).json({ error: 'Platform not found' });
      }
      
      if (platform.status !== 'connected') {
        return res.status(400).json({ error: 'Platform is not connected' });
      }
      
      // Validate search parameters
      const searchParams = EtsySearchParamsSchema.parse(req.query);
      
      // Initialize API client
      const etsyApi = new EtsyApiService(
        platform.apiKey, 
        platform.apiSecret || null,
        EtsyController.getAccessToken(platform)
      );
      
      // Execute search
      const results = await etsyApi.searchListings(searchParams);
      
      return res.json(results);
    } catch (error) {
      console.error('Error searching Etsy listings:', error);
      
      if (error.name === 'ZodError') {
        return res.status(400).json({ error: 'Invalid search parameters' });
      }
      
      return res.status(500).json({ 
        error: 'An error occurred while searching listings' 
      });
    }
  }
  
  /**
   * Get listing details from Etsy
   */
  static async getListingDetails(req: Request, res: Response) {
    try {
      const { platformId, listingId } = req.params;
      
      // Validate platform
      const platform = await storage.getPlatform(parseInt(platformId));
      if (!platform) {
        return res.status(404).json({ error: 'Platform not found' });
      }
      
      if (platform.status !== 'connected') {
        return res.status(400).json({ error: 'Platform is not connected' });
      }
      
      // Validate listing ID
      ListingLookupSchema.parse({ listingId: parseInt(listingId) });
      
      // Initialize API client
      const etsyApi = new EtsyApiService(
        platform.apiKey, 
        platform.apiSecret || null,
        EtsyController.getAccessToken(platform)
      );
      
      // Get listing details
      const listing = await etsyApi.getListingDetails(parseInt(listingId));
      
      return res.json(listing);
    } catch (error) {
      console.error('Error getting Etsy listing details:', error);
      
      if (error.name === 'ZodError') {
        return res.status(400).json({ error: 'Invalid listing ID' });
      }
      
      return res.status(500).json({ 
        error: 'An error occurred while getting listing details' 
      });
    }
  }
  
  /**
   * Get shop details from Etsy
   */
  static async getShopDetails(req: Request, res: Response) {
    try {
      const { platformId, shopId } = req.params;
      
      // Validate platform
      const platform = await storage.getPlatform(parseInt(platformId));
      if (!platform) {
        return res.status(404).json({ error: 'Platform not found' });
      }
      
      if (platform.status !== 'connected') {
        return res.status(400).json({ error: 'Platform is not connected' });
      }
      
      // Initialize API client
      const etsyApi = new EtsyApiService(
        platform.apiKey, 
        platform.apiSecret || null,
        EtsyController.getAccessToken(platform)
      );
      
      // Get shop details
      const shop = await etsyApi.getShopDetails(parseInt(shopId));
      
      return res.json(shop);
    } catch (error) {
      console.error('Error getting Etsy shop details:', error);
      return res.status(500).json({ 
        error: 'An error occurred while getting shop details' 
      });
    }
  }
  
  /**
   * Get trending listings from Etsy
   */
  static async getTrendingListings(req: Request, res: Response) {
    try {
      const { platformId } = req.params;
      const { limit } = req.query;
      
      // Validate platform
      const platform = await storage.getPlatform(parseInt(platformId));
      if (!platform) {
        return res.status(404).json({ error: 'Platform not found' });
      }
      
      if (platform.status !== 'connected') {
        return res.status(400).json({ error: 'Platform is not connected' });
      }
      
      // Initialize API client
      const etsyApi = new EtsyApiService(
        platform.apiKey, 
        platform.apiSecret || null,
        EtsyController.getAccessToken(platform)
      );
      
      // Get trending listings
      const listings = await etsyApi.getTrendingListings(parseInt(limit as string) || 10);
      
      return res.json(listings);
    } catch (error) {
      console.error('Error getting Etsy trending listings:', error);
      return res.status(500).json({ 
        error: 'An error occurred while getting trending listings' 
      });
    }
  }
  
  /**
   * Get categories from Etsy
   */
  static async getCategories(req: Request, res: Response) {
    try {
      const { platformId } = req.params;
      
      // Validate platform
      const platform = await storage.getPlatform(parseInt(platformId));
      if (!platform) {
        return res.status(404).json({ error: 'Platform not found' });
      }
      
      if (platform.status !== 'connected') {
        return res.status(400).json({ error: 'Platform is not connected' });
      }
      
      // Initialize API client
      const etsyApi = new EtsyApiService(
        platform.apiKey, 
        platform.apiSecret || null,
        EtsyController.getAccessToken(platform)
      );
      
      // Get categories
      const categories = await etsyApi.getCategories();
      
      return res.json(categories);
    } catch (error) {
      console.error('Error getting Etsy categories:', error);
      return res.status(500).json({ 
        error: 'An error occurred while getting categories' 
      });
    }
  }
  
  /**
   * Get affiliate stats
   */
  static async getAffiliateStats(req: Request, res: Response) {
    try {
      const { platformId } = req.params;
      const { period } = req.query;
      
      // Validate platform
      const platform = await storage.getPlatform(parseInt(platformId));
      if (!platform) {
        return res.status(404).json({ error: 'Platform not found' });
      }
      
      if (platform.status !== 'connected') {
        return res.status(400).json({ error: 'Platform is not connected' });
      }
      
      // Initialize API client
      const etsyApi = new EtsyApiService(
        platform.apiKey, 
        platform.apiSecret || null,
        EtsyController.getAccessToken(platform)
      );
      
      // Get affiliate stats
      const stats = await etsyApi.getAffiliateStats(period as string);
      
      return res.json(stats);
    } catch (error) {
      console.error('Error getting Etsy affiliate stats:', error);
      return res.status(500).json({ 
        error: 'An error occurred while getting affiliate stats' 
      });
    }
  }
}