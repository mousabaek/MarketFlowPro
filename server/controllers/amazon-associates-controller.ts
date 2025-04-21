import { Request, Response } from 'express';
import { AmazonAssociatesApiService, ProductSearchParamsSchema, AsinLookupSchema } from '../services/amazon-associates-api';

/**
 * Controller for Amazon Associates API endpoints
 */
export class AmazonAssociatesController {
  /**
   * Test the connection to Amazon Associates API
   */
  static async testConnection(req: Request, res: Response) {
    try {
      const { apiKey, apiSecret, settings } = req.body;
      
      if (!apiKey || !apiSecret || !settings?.associateTag || !settings?.marketplace) {
        return res.status(400).json({ 
          success: false, 
          message: 'Missing required credentials. Please provide API key, API secret, associate tag, and marketplace.'
        });
      }
      
      const amazonApi = new AmazonAssociatesApiService(
        apiKey, 
        apiSecret, 
        settings.associateTag,
        settings.marketplace
      );
      
      const isConnected = await amazonApi.testConnection();
      
      return res.json({ 
        success: isConnected,
        message: isConnected ? 'Successfully connected to Amazon Associates API' : 'Failed to connect to Amazon Associates API'
      });
    } catch (error) {
      console.error('Error testing Amazon Associates connection:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'An error occurred while testing the connection',
        error: error.message
      });
    }
  }
  
  /**
   * Search for products on Amazon
   */
  static async searchProducts(req: Request, res: Response) {
    try {
      const { apiKey, apiSecret, associateTag, marketplace } = req.body;
      
      // Validate search parameters
      const validationResult = ProductSearchParamsSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid search parameters',
          errors: validationResult.error.errors
        });
      }
      
      const amazonApi = new AmazonAssociatesApiService(
        apiKey, 
        apiSecret, 
        associateTag,
        marketplace || 'US'
      );
      
      const { keywords, category, minPrice, maxPrice, limit, sortBy } = req.body;
      
      const results = await amazonApi.searchProducts({
        keywords,
        category,
        minPrice,
        maxPrice,
        limit,
        sortBy
      });
      
      return res.json({
        success: true,
        data: results
      });
    } catch (error) {
      console.error('Error searching Amazon products:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'An error occurred while searching for products',
        error: error.message
      });
    }
  }
  
  /**
   * Get product details from Amazon
   */
  static async getProductDetails(req: Request, res: Response) {
    try {
      const { apiKey, apiSecret, associateTag, marketplace, asin } = req.body;
      
      // Validate ASIN
      const validationResult = AsinLookupSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid ASIN',
          errors: validationResult.error.errors
        });
      }
      
      const amazonApi = new AmazonAssociatesApiService(
        apiKey, 
        apiSecret, 
        associateTag,
        marketplace || 'US'
      );
      
      const product = await amazonApi.getProductDetails(asin);
      
      return res.json({
        success: true,
        data: product
      });
    } catch (error) {
      console.error('Error getting Amazon product details:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'An error occurred while retrieving product details',
        error: error.message
      });
    }
  }
  
  /**
   * Get commission rates
   */
  static async getCommissionRates(req: Request, res: Response) {
    try {
      const { apiKey, apiSecret, associateTag, marketplace } = req.body;
      
      const amazonApi = new AmazonAssociatesApiService(
        apiKey, 
        apiSecret, 
        associateTag,
        marketplace || 'US'
      );
      
      const rates = await amazonApi.getCommissionRates();
      
      return res.json({
        success: true,
        data: rates
      });
    } catch (error) {
      console.error('Error getting Amazon commission rates:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'An error occurred while retrieving commission rates',
        error: error.message
      });
    }
  }
  
  /**
   * Get earnings report
   */
  static async getEarningsReport(req: Request, res: Response) {
    try {
      const { apiKey, apiSecret, associateTag, marketplace, period } = req.body;
      
      const amazonApi = new AmazonAssociatesApiService(
        apiKey, 
        apiSecret, 
        associateTag,
        marketplace || 'US'
      );
      
      const report = await amazonApi.getEarningsReport(period);
      
      return res.json({
        success: true,
        data: report
      });
    } catch (error) {
      console.error('Error getting Amazon earnings report:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'An error occurred while retrieving earnings report',
        error: error.message
      });
    }
  }
}