import { Request, Response } from 'express';
import { EtsyApiService, EtsySearchParamsSchema, ListingLookupSchema } from '../services/etsy-api';

/**
 * Controller for Etsy API endpoints
 */
export class EtsyController {
  /**
   * Helper method to extract access token from platform settings
   */
  private static getAccessToken(platform: any): string | null {
    return platform?.settings?.accessToken || null;
  }
  
  /**
   * Test the connection to Etsy API
   */
  static async testConnection(req: Request, res: Response) {
    try {
      const { apiKey, apiSecret, settings } = req.body;
      
      if (!apiKey) {
        return res.status(400).json({ 
          success: false, 
          message: 'Missing required API key'
        });
      }
      
      const accessToken = settings?.accessToken || null;
      
      const etsyApi = new EtsyApiService(
        apiKey, 
        apiSecret || null,
        accessToken
      );
      
      const isConnected = await etsyApi.testConnection();
      
      return res.json({ 
        success: isConnected,
        message: isConnected ? 'Successfully connected to Etsy API' : 'Failed to connect to Etsy API'
      });
    } catch (error) {
      console.error('Error testing Etsy connection:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'An error occurred while testing the connection',
        error: error.message
      });
    }
  }
  
  /**
   * Search for listings on Etsy
   */
  static async searchListings(req: Request, res: Response) {
    try {
      const { apiKey, apiSecret, accessToken } = req.body;
      
      // Validate search parameters
      const validationResult = EtsySearchParamsSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid search parameters',
          errors: validationResult.error.errors
        });
      }
      
      const etsyApi = new EtsyApiService(
        apiKey, 
        apiSecret || null,
        accessToken || null
      );
      
      const { keywords, category, minPrice, maxPrice, limit, offset, sortBy } = req.body;
      
      const results = await etsyApi.searchListings({
        keywords,
        category,
        minPrice,
        maxPrice,
        limit,
        offset,
        sortBy
      });
      
      return res.json({
        success: true,
        data: results
      });
    } catch (error) {
      console.error('Error searching Etsy listings:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'An error occurred while searching for listings',
        error: error.message
      });
    }
  }
  
  /**
   * Get listing details from Etsy
   */
  static async getListingDetails(req: Request, res: Response) {
    try {
      const { apiKey, apiSecret, accessToken, listingId } = req.body;
      
      // Validate listing ID
      const validationResult = ListingLookupSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid listing ID',
          errors: validationResult.error.errors
        });
      }
      
      const etsyApi = new EtsyApiService(
        apiKey, 
        apiSecret || null,
        accessToken || null
      );
      
      const listing = await etsyApi.getListingDetails(listingId);
      
      return res.json({
        success: true,
        data: listing
      });
    } catch (error) {
      console.error('Error getting Etsy listing details:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'An error occurred while retrieving listing details',
        error: error.message
      });
    }
  }
  
  /**
   * Get shop details from Etsy
   */
  static async getShopDetails(req: Request, res: Response) {
    try {
      const { apiKey, apiSecret, accessToken, shopId } = req.body;
      
      if (!shopId || typeof shopId !== 'number') {
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid shop ID. Please provide a valid shop ID.'
        });
      }
      
      const etsyApi = new EtsyApiService(
        apiKey, 
        apiSecret || null,
        accessToken || null
      );
      
      const shop = await etsyApi.getShopDetails(shopId);
      
      return res.json({
        success: true,
        data: shop
      });
    } catch (error) {
      console.error('Error getting Etsy shop details:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'An error occurred while retrieving shop details',
        error: error.message
      });
    }
  }
  
  /**
   * Get trending listings from Etsy
   */
  static async getTrendingListings(req: Request, res: Response) {
    try {
      const { apiKey, apiSecret, accessToken, limit } = req.body;
      
      const etsyApi = new EtsyApiService(
        apiKey, 
        apiSecret || null,
        accessToken || null
      );
      
      const listings = await etsyApi.getTrendingListings(limit);
      
      return res.json({
        success: true,
        data: listings
      });
    } catch (error) {
      console.error('Error getting Etsy trending listings:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'An error occurred while retrieving trending listings',
        error: error.message
      });
    }
  }
  
  /**
   * Get categories from Etsy
   */
  static async getCategories(req: Request, res: Response) {
    try {
      const { apiKey, apiSecret, accessToken } = req.body;
      
      const etsyApi = new EtsyApiService(
        apiKey, 
        apiSecret || null,
        accessToken || null
      );
      
      const categories = await etsyApi.getCategories();
      
      return res.json({
        success: true,
        data: categories
      });
    } catch (error) {
      console.error('Error getting Etsy categories:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'An error occurred while retrieving categories',
        error: error.message
      });
    }
  }
  
  /**
   * Get affiliate stats
   */
  static async getAffiliateStats(req: Request, res: Response) {
    try {
      const { apiKey, apiSecret, accessToken, period } = req.body;
      
      const etsyApi = new EtsyApiService(
        apiKey, 
        apiSecret || null,
        accessToken || null
      );
      
      const stats = await etsyApi.getAffiliateStats(period);
      
      return res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Error getting Etsy affiliate stats:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'An error occurred while retrieving affiliate statistics',
        error: error.message
      });
    }
  }
}