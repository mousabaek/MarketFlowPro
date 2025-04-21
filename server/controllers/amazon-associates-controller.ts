import { Request, Response } from 'express';
import { AmazonAssociatesApiService, ProductSearchParamsSchema, AsinLookupSchema } from '../services/amazon-associates-api';
import { storage } from '../storage';

/**
 * Controller for Amazon Associates API endpoints
 */
export class AmazonAssociatesController {
  /**
   * Test the connection to Amazon Associates API
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
      
      if (platform.type !== 'affiliate' || platform.name !== 'Amazon Associates') {
        return res.status(400).json({ error: 'Invalid platform type or name' });
      }
      
      if (!platform.apiKey || !platform.apiSecret) {
        return res.status(400).json({ error: 'API key and secret are required' });
      }
      
      // Extract settings
      const settings = platform.settings as any;
      if (!settings?.associateTag) {
        return res.status(400).json({ error: 'Associate Tag is required in platform settings' });
      }
      
      const amazonApi = new AmazonAssociatesApiService(
        platform.apiKey, 
        platform.apiSecret, 
        settings.associateTag,
        settings.marketplace || 'US'
      );
      
      const isConnected = await amazonApi.testConnection();
      
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
          error: 'Failed to connect to Amazon Associates API. Please check your credentials.' 
        });
      }
    } catch (error) {
      console.error('Error testing Amazon Associates connection:', error);
      return res.status(500).json({ 
        error: 'An error occurred while testing the connection' 
      });
    }
  }
  
  /**
   * Search for products on Amazon
   */
  static async searchProducts(req: Request, res: Response) {
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
      const searchParams = ProductSearchParamsSchema.parse(req.query);
      
      // Extract settings
      const settings = platform.settings as any;
      
      // Initialize API client
      const amazonApi = new AmazonAssociatesApiService(
        platform.apiKey, 
        platform.apiSecret, 
        settings.associateTag,
        settings.marketplace || 'US'
      );
      
      // Execute search
      const results = await amazonApi.searchProducts(searchParams);
      
      return res.json(results);
    } catch (error) {
      console.error('Error searching Amazon products:', error);
      
      if (error.name === 'ZodError') {
        return res.status(400).json({ error: 'Invalid search parameters' });
      }
      
      return res.status(500).json({ 
        error: 'An error occurred while searching products' 
      });
    }
  }
  
  /**
   * Get product details from Amazon
   */
  static async getProductDetails(req: Request, res: Response) {
    try {
      const { platformId, asin } = req.params;
      
      // Validate platform
      const platform = await storage.getPlatform(parseInt(platformId));
      if (!platform) {
        return res.status(404).json({ error: 'Platform not found' });
      }
      
      if (platform.status !== 'connected') {
        return res.status(400).json({ error: 'Platform is not connected' });
      }
      
      // Validate ASIN
      AsinLookupSchema.parse({ asin });
      
      // Extract settings
      const settings = platform.settings as any;
      
      // Initialize API client
      const amazonApi = new AmazonAssociatesApiService(
        platform.apiKey, 
        platform.apiSecret, 
        settings.associateTag,
        settings.marketplace || 'US'
      );
      
      // Get product details
      const product = await amazonApi.getProductDetails(asin);
      
      return res.json(product);
    } catch (error) {
      console.error('Error getting Amazon product details:', error);
      
      if (error.name === 'ZodError') {
        return res.status(400).json({ error: 'Invalid ASIN' });
      }
      
      return res.status(500).json({ 
        error: 'An error occurred while getting product details' 
      });
    }
  }
  
  /**
   * Get commission rates
   */
  static async getCommissionRates(req: Request, res: Response) {
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
      
      // Extract settings
      const settings = platform.settings as any;
      
      // Initialize API client
      const amazonApi = new AmazonAssociatesApiService(
        platform.apiKey, 
        platform.apiSecret, 
        settings.associateTag,
        settings.marketplace || 'US'
      );
      
      // Get commission rates
      const rates = await amazonApi.getCommissionRates();
      
      return res.json(rates);
    } catch (error) {
      console.error('Error getting Amazon commission rates:', error);
      return res.status(500).json({ 
        error: 'An error occurred while getting commission rates' 
      });
    }
  }
  
  /**
   * Get earnings report
   */
  static async getEarningsReport(req: Request, res: Response) {
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
      
      // Extract settings
      const settings = platform.settings as any;
      
      // Initialize API client
      const amazonApi = new AmazonAssociatesApiService(
        platform.apiKey, 
        platform.apiSecret, 
        settings.associateTag,
        settings.marketplace || 'US'
      );
      
      // Get earnings report
      const report = await amazonApi.getEarningsReport(period as string);
      
      return res.json(report);
    } catch (error) {
      console.error('Error getting Amazon earnings report:', error);
      return res.status(500).json({ 
        error: 'An error occurred while getting earnings report' 
      });
    }
  }
}