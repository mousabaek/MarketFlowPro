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
      const { platformId } = req.params;
      const listingId = parseInt(req.params.listingId || req.query.listingId as string || req.body.listingId);
      
      if (isNaN(listingId)) {
        return res.status(400).json({ 
          success: false, 
          message: 'Missing or invalid listing ID'
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
      const etsyApi = new EtsyApiService(
        platform.apiKey, 
        platform.apiSecret || null,
        EtsyController.getAccessToken(platform)
      );
      
      const listing = await etsyApi.getListingDetails(listingId);
      */
      
      // Mock listing data for testing the UI
      const listing = {
        listingId: listingId,
        title: "Handmade Ceramic Mug with Custom Design - Personalized Gift",
        description: "Beautiful handmade ceramic mug, perfectly crafted for your morning coffee or evening tea. Each mug is hand-thrown on a potter's wheel and glazed with food-safe materials.\n\nThis listing is for ONE mug. Available in multiple colors including blue, green, white, and earthy brown. The design can be personalized with a name or short message (up to 10 characters).\n\nDimensions: Approximately 3.5 inches tall and 3 inches in diameter\nCapacity: 12 oz\nMaterial: Stoneware ceramic\nCare: Dishwasher and microwave safe",
        price: {
          amount: 28.99,
          currency: "USD",
          formattedPrice: "$28.99"
        },
        url: `https://www.etsy.com/listing/${listingId}/handmade-ceramic-mug`,
        imageUrl: "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?q=80&w=1000&auto=format&fit=crop",
        images: [
          "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?q=80&w=1000&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1577741314755-048d8525d31e?q=80&w=1000&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1578475392068-624b34173c30?q=80&w=1000&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1519682943544-8c0fe0650438?q=80&w=1000&auto=format&fit=crop"
        ],
        shop: {
          shopId: 12345,
          shopName: "CeramicWonders",
          url: "https://www.etsy.com/shop/ceramicwonders",
          iconUrl: "https://images.unsplash.com/photo-1556760544-74068565f05c?q=80&w=100&auto=format&fit=crop",
          saleCount: 1842,
          reviewCount: 576,
          rating: 4.9
        },
        tags: [
          "ceramic mug", 
          "personalized gift", 
          "handmade pottery", 
          "custom mug", 
          "coffee lover", 
          "housewarming gift", 
          "wedding gift"
        ],
        categories: [
          "Home & Living", 
          "Kitchen & Dining", 
          "Drink & Barware", 
          "Drinkware", 
          "Mugs"
        ],
        creationDate: "2023-06-15T12:30:00Z",
        lastModified: "2024-02-02T09:15:20Z",
        views: 3254,
        favorites: 187,
        inStock: true,
        quantity: 15,
        affiliateLink: `https://www.etsy.com/listing/${listingId}/handmade-ceramic-mug?utm_source=affiliate&utm_medium=api&utm_campaign=${platform.settings?.affiliateId || "wolf_marketer"}`,
        estimatedCommission: 1.45,
        shippingInfo: {
          primaryCountry: "United States",
          processingDays: "3-5 business days"
        }
      };
      
      return res.json(listing);
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