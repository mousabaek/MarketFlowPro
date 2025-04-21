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
      const { platformId } = req.params;
      const asin = req.params.asin || req.query.asin || req.body.asin;
      
      if (!asin) {
        return res.status(400).json({ 
          success: false, 
          message: 'Missing required ASIN parameter'
        });
      }
      
      const platform = await storage.getPlatform(parseInt(platformId));
      if (!platform) {
        return res.status(404).json({ 
          success: false, 
          message: 'Platform not found'
        });
      }
      
      // For testing purposes, return mock data
      // In production, this would use the actual API:
      /*
      const amazonApi = new AmazonAssociatesApiService(
        platform.apiKey,
        platform.apiSecret,
        platform.settings?.associateTag || '',
        platform.settings?.marketplace || 'US'
      );
      
      const product = await amazonApi.getProductDetails(asin as string);
      */
      
      // Mock product data for testing the UI
      const product = {
        title: "Premium Wireless Headphones - Noise Cancelling Bluetooth Technology",
        asin: asin,
        price: {
          amount: 99.99,
          currency: "USD",
          formattedPrice: "$99.99"
        },
        imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=1000&auto=format&fit=crop",
        images: [
          "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=1000&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1484704849700-f032a568e944?q=80&w=1000&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1546435770-a3e426bf472b?q=80&w=1000&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1524678606370-a47ad25cb82a?q=80&w=1000&auto=format&fit=crop"
        ],
        detailPageUrl: "https://www.amazon.com/dp/" + asin,
        rating: {
          value: 4.7,
          totalReviews: 2453
        },
        categories: ["Electronics", "Headphones", "Wireless", "Audio"],
        features: [
          "Active noise cancellation technology",
          "40 hour battery life",
          "Comfortable over-ear design",
          "Built-in microphone for calls",
          "Compatible with all Bluetooth devices",
          "Fast charging - 5 hours of playback from 10 minutes charge"
        ],
        description: "Experience premium sound quality with these wireless headphones featuring advanced noise cancellation technology. Perfect for travel, work, or enjoying your favorite music without distractions.\n\nThese headphones offer exceptional comfort with memory foam ear cushions and adjustable headband. The built-in microphone ensures crystal clear calls, while the intuitive touch controls make operation simple and convenient.\n\nWith up to 40 hours of battery life on a single charge, you'll have music for days. When you do need to charge, get 5 hours of playback from just 10 minutes of charging.",
        availability: "In Stock",
        brand: "SoundMaster",
        affiliateLink: "https://www.amazon.com/dp/" + asin + "?tag=" + (platform.settings?.associateTag || "tag"),
        estimatedCommission: 5.99
      };
      
      return res.json(product);
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