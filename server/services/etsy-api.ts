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
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'x-api-key': this.apiKey
    };

    if (this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
    }

    return headers;
  }

  /**
   * Test the API connection
   */
  public async testConnection(): Promise<boolean> {
    try {
      // Use ping endpoint or a simple public endpoint to test connection
      const response = await axios.get(`${this.baseUrl}/application/openapi-ping`, {
        headers: this.getHeaders()
      });
      
      return response.status === 200;
    } catch (error) {
      console.error('Error testing Etsy API connection:', error);
      return false;
    }
  }

  /**
   * Search for listings
   */
  public async searchListings(options: {
    keywords?: string;
    categoryId?: number;
    minPrice?: number;
    maxPrice?: number;
    sortOn?: string;
    sortOrder?: 'asc' | 'desc';
    limit?: number;
    offset?: number;
  }) {
    try {
      const params = new URLSearchParams();
      
      if (options.keywords) params.append('keywords', options.keywords);
      if (options.categoryId) params.append('taxonomy_id', options.categoryId.toString());
      if (options.minPrice) params.append('min_price', options.minPrice.toString());
      if (options.maxPrice) params.append('max_price', options.maxPrice.toString());
      if (options.sortOn) params.append('sort_on', options.sortOn);
      if (options.sortOrder) params.append('sort_order', options.sortOrder);
      if (options.limit) params.append('limit', options.limit.toString());
      if (options.offset) params.append('offset', options.offset.toString());
      
      // Add some fields we want to retrieve
      params.append('includes', 'Images,Shop');

      const response = await axios.get(`${this.baseUrl}/application/listings/active?${params.toString()}`, {
        headers: this.getHeaders()
      });
      
      return response.data;
    } catch (error) {
      console.error('Error searching Etsy listings:', error);
      throw error;
    }
  }

  /**
   * Get listing details by ID
   */
  public async getListingDetails(listingId: number) {
    try {
      const response = await axios.get(`${this.baseUrl}/application/listings/${listingId}?includes=Images,Shop,Inventory`, {
        headers: this.getHeaders()
      });
      
      return response.data;
    } catch (error) {
      console.error(`Error getting listing details for ID ${listingId}:`, error);
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
      console.error(`Error getting shop details for ID ${shopId}:`, error);
      throw error;
    }
  }

  /**
   * Get trending listings
   */
  public async getTrendingListings(limit: number = 10) {
    try {
      const params = new URLSearchParams();
      params.append('limit', limit.toString());
      params.append('sort_on', 'created');
      params.append('sort_order', 'desc');
      params.append('includes', 'Images,Shop');
      
      const response = await axios.get(`${this.baseUrl}/application/listings/trending?${params.toString()}`, {
        headers: this.getHeaders()
      });
      
      return response.data;
    } catch (error) {
      console.error('Error getting trending listings:', error);
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
      console.error('Error fetching Etsy categories:', error);
      throw error;
    }
  }

  /**
   * Get affiliate revenue stats (this would connect to Etsy Affiliate Program)
   */
  public async getAffiliateStats(period: string = 'last30days') {
    // This is a mock implementation as direct Etsy affiliate stats would 
    // typically come from a separate affiliate dashboard
    return {
      success: true,
      result: {
        period: period,
        clicks: 850,
        conversions: 42,
        revenue: 267.89,
        commissionRate: 4.5,
        conversionRate: 4.94
      }
    };
  }
}

// Zod schema for search parameters
export const EtsySearchParamsSchema = z.object({
  keywords: z.string().optional(),
  categoryId: z.number().optional(),
  minPrice: z.number().min(0).optional(),
  maxPrice: z.number().min(0).optional(),
  sortOn: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  limit: z.number().min(1).max(100).optional().default(25),
  offset: z.number().min(0).optional().default(0),
});

// Zod schema for listing lookup
export const ListingLookupSchema = z.object({
  listingId: z.number(),
});