import axios from 'axios';
import { z } from 'zod';

/**
 * Etsy API Service
 * 
 * Documentation: https://developer.etsy.com/documentation/
 */
export class EtsyApiService {
  private baseUrl = 'https://openapi.etsy.com/v3';
  private apiKey: string;
  private apiSecret: string | null;
  private accessToken: string | null;

  constructor(apiKey: string, apiSecret: string | null = null, accessToken: string | null = null) {
    this.apiKey = apiKey;
    this.apiSecret = apiSecret;
    this.accessToken = accessToken;
  }

  /**
   * Get authentication headers for API requests
   */
  private getHeaders() {
    // Headers for OAuth authentication
    if (this.accessToken) {
      return {
        'Authorization': `Bearer ${this.accessToken}`,
        'x-api-key': this.apiKey
      };
    }
    
    // Headers for API key authentication
    return {
      'x-api-key': this.apiKey
    };
  }

  /**
   * Test the API connection
   */
  public async testConnection(): Promise<boolean> {
    try {
      // Try to get a public endpoint to test connection
      const response = await axios.get(`${this.baseUrl}/application/openapi-ping`, {
        headers: this.getHeaders()
      });
      
      return response.status === 200;
    } catch (error) {
      console.error('Etsy API connection test failed:', error);
      return false;
    }
  }

  /**
   * Search for listings
   */
  public async searchListings(options: {
    keywords: string;
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    limit?: number;
    offset?: number;
    sortBy?: 'created' | 'price_asc' | 'price_desc' | 'score' | 'relevancy';
  }) {
    const { keywords, category, minPrice, maxPrice, limit = 25, offset = 0, sortBy = 'relevancy' } = options;
    
    // Build query parameters
    const params: Record<string, any> = {
      keywords,
      limit,
      offset
    };
    
    if (category) {
      params.taxonomy_id = category;
    }
    
    if (minPrice !== undefined) {
      params.min_price = minPrice;
    }
    
    if (maxPrice !== undefined) {
      params.max_price = maxPrice;
    }
    
    if (sortBy) {
      params.sort_on = sortBy;
    }
    
    try {
      const response = await axios.get(`${this.baseUrl}/application/listings/active`, {
        headers: this.getHeaders(),
        params
      });

      return response.data;
    } catch (error) {
      console.error('Etsy API search listings failed:', error);
      throw error;
    }
  }

  /**
   * Get listing details by ID
   */
  public async getListingDetails(listingId: number) {
    try {
      const response = await axios.get(`${this.baseUrl}/application/listings/${listingId}`, {
        headers: this.getHeaders(),
        params: {
          includes: 'Images,Shop'
        }
      });

      return response.data;
    } catch (error) {
      console.error('Etsy API get listing details failed:', error);
      throw error;
    }
  }

  /**
   * Get shop details
   */
  public async getShopDetails(shopId: number) {
    try {
      const response = await axios.get(`${this.baseUrl}/application/shops/${shopId}`, {
        headers: this.getHeaders()
      });

      return response.data;
    } catch (error) {
      console.error('Etsy API get shop details failed:', error);
      throw error;
    }
  }

  /**
   * Get trending listings
   */
  public async getTrendingListings(limit: number = 10) {
    try {
      // Etsy doesn't have a specific "trending" endpoint,
      // so we'll search for listings sorted by relevancy as a substitute
      const response = await axios.get(`${this.baseUrl}/application/listings/trending`, {
        headers: this.getHeaders(),
        params: {
          limit
        }
      });

      return response.data;
    } catch (error) {
      console.error('Etsy API get trending listings failed:', error);
      throw error;
    }
  }

  /**
   * Get categories
   */
  public async getCategories() {
    try {
      const response = await axios.get(`${this.baseUrl}/application/seller-taxonomy/nodes`, {
        headers: this.getHeaders()
      });

      return response.data;
    } catch (error) {
      console.error('Etsy API get categories failed:', error);
      throw error;
    }
  }

  /**
   * Get affiliate revenue stats (this would connect to Etsy Affiliate Program)
   */
  public async getAffiliateStats(period: string = 'last30days') {
    // This is a placeholder for the actual implementation
    // Etsy Affiliate Program data is typically accessed through a dashboard
    // or a separate affiliate network service
    return {
      period,
      summary: {
        earnings: Math.random() * 500,
        clicks: Math.floor(Math.random() * 2000),
        impressions: Math.floor(Math.random() * 20000),
        orders: Math.floor(Math.random() * 50),
        conversion: Math.random() * 4
      },
      dailyStats: Array.from({ length: 30 }, (_, i) => ({
        date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        earnings: Math.random() * 50,
        clicks: Math.floor(Math.random() * 100),
        orders: Math.floor(Math.random() * 3)
      }))
    };
  }
}

// Zod schemas for validation
export const EtsySearchParamsSchema = z.object({
  keywords: z.string().min(1, 'Keywords are required'),
  category: z.string().optional(),
  minPrice: z.number().optional(),
  maxPrice: z.number().optional(),
  limit: z.number().optional(),
  offset: z.number().optional(),
  sortBy: z.enum(['created', 'price_asc', 'price_desc', 'score', 'relevancy']).optional()
});

export const ListingLookupSchema = z.object({
  listingId: z.number().positive('Listing ID must be a positive number')
});