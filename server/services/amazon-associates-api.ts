import axios from 'axios';
import crypto from 'crypto';
import { z } from 'zod';

/**
 * Amazon Associates API Service
 * 
 * Documentation: https://affiliate-program.amazon.com/help/node/topic/GBPX9ZHFN4XZ9YQN
 */
export class AmazonAssociatesApiService {
  private baseUrl = 'https://webservices.amazon.com/paapi5/searchitems';
  private accessKey: string;
  private secretKey: string;
  private associateTag: string;
  private marketplace: string;

  constructor(accessKey: string, secretKey: string, associateTag: string, marketplace: string = 'US') {
    this.accessKey = accessKey;
    this.secretKey = secretKey;
    this.associateTag = associateTag;
    this.marketplace = marketplace;
  }

  /**
   * Generate signature for Amazon API request
   */
  private generateSignature(stringToSign: string, secretKey: string): string {
    return crypto.createHmac('sha256', secretKey).update(stringToSign).digest('base64');
  }

  /**
   * Get authentication headers for API requests
   */
  private getHeaders(payload: any) {
    const timestamp = new Date().toISOString();
    const service = 'ProductAdvertisingAPI';
    const region = this.getRegionFromMarketplace();
    
    // Format the request for signing
    const stringToSign = `${service}\n${region}\n${timestamp}\n${JSON.stringify(payload)}`;
    const signature = this.generateSignature(stringToSign, this.secretKey);

    return {
      'Content-Type': 'application/json',
      'X-Amz-Date': timestamp,
      'X-Amz-Target': 'com.amazon.paapi5.v1.ProductAdvertisingAPIv1.SearchItems',
      'Host': `webservices.amazon.${this.getMarketplaceTLD()}`,
      'Authorization': `AWS4-HMAC-SHA256 Credential=${this.accessKey}/${timestamp.slice(0, 8)}/${region}/${service}/aws4_request, SignedHeaders=host;x-amz-date;x-amz-target, Signature=${signature}`
    };
  }

  /**
   * Get region from marketplace code
   */
  private getRegionFromMarketplace(): string {
    const marketplaceRegions: Record<string, string> = {
      'US': 'us-east-1',
      'CA': 'us-east-1',
      'MX': 'us-east-1',
      'BR': 'us-east-1',
      'UK': 'eu-west-1',
      'DE': 'eu-west-1',
      'FR': 'eu-west-1',
      'IT': 'eu-west-1',
      'ES': 'eu-west-1',
      'IN': 'eu-west-1',
      'JP': 'us-west-2',
      'AU': 'us-west-2'
    };
    
    return marketplaceRegions[this.marketplace] || 'us-east-1';
  }

  /**
   * Get TLD for marketplace
   */
  private getMarketplaceTLD(): string {
    const marketplaceTLDs: Record<string, string> = {
      'US': 'com',
      'CA': 'ca',
      'MX': 'com.mx',
      'BR': 'com.br',
      'UK': 'co.uk',
      'DE': 'de',
      'FR': 'fr',
      'IT': 'it',
      'ES': 'es',
      'IN': 'in',
      'JP': 'co.jp',
      'AU': 'com.au'
    };
    
    return marketplaceTLDs[this.marketplace] || 'com';
  }

  /**
   * Test the API connection
   */
  public async testConnection(): Promise<boolean> {
    try {
      // Simple search to test connection
      const result = await this.searchProducts({ 
        keywords: "test",
        limit: 1
      });
      
      return result && result.items && result.items.length > 0;
    } catch (error) {
      console.error('Amazon Associates API connection test failed:', error);
      return false;
    }
  }

  /**
   * Search for products
   */
  public async searchProducts(options: {
    keywords: string;
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    limit?: number;
    sortBy?: 'relevance' | 'price-asc' | 'price-desc' | 'date-desc';
  }) {
    const { keywords, category, minPrice, maxPrice, limit = 10, sortBy = 'relevance' } = options;
    
    // Build query parameters
    const payload = {
      Keywords: keywords,
      SearchIndex: category || 'All',
      ItemCount: limit,
      PartnerTag: this.associateTag,
      PartnerType: 'Associates',
      Marketplace: `www.amazon.${this.getMarketplaceTLD()}`,
      Resources: [
        'ItemInfo.Title',
        'ItemInfo.ByLineInfo',
        'ItemInfo.ContentInfo',
        'Offers.Listings.Price',
        'Offers.Listings.DeliveryInfo.IsPrimeEligible',
        'Images.Primary.Medium'
      ]
    };

    if (minPrice || maxPrice) {
      payload.MinPrice = minPrice;
      payload.MaxPrice = maxPrice;
    }

    switch (sortBy) {
      case 'price-asc':
        payload.SortBy = 'Price:LowToHigh';
        break;
      case 'price-desc':
        payload.SortBy = 'Price:HighToLow';
        break;
      case 'date-desc':
        payload.SortBy = 'NewestArrivals';
        break;
      default:
        payload.SortBy = 'Relevance';
    }

    try {
      const response = await axios({
        method: 'post',
        url: this.baseUrl,
        headers: this.getHeaders(payload),
        data: payload
      });

      return response.data;
    } catch (error) {
      console.error('Amazon Associates API search failed:', error);
      throw error;
    }
  }

  /**
   * Get product details by ASIN
   */
  public async getProductDetails(asin: string) {
    const payload = {
      ItemIds: [asin],
      PartnerTag: this.associateTag,
      PartnerType: 'Associates',
      Marketplace: `www.amazon.${this.getMarketplaceTLD()}`,
      Resources: [
        'ItemInfo.Title',
        'ItemInfo.Features',
        'ItemInfo.ProductInfo',
        'ItemInfo.ByLineInfo',
        'ItemInfo.ContentInfo',
        'ItemInfo.TechnicalInfo',
        'Offers.Listings.Price',
        'Offers.Listings.DeliveryInfo.IsPrimeEligible',
        'Images.Primary.Large',
        'Images.Variants.Large'
      ]
    };

    try {
      const response = await axios({
        method: 'post',
        url: 'https://webservices.amazon.com/paapi5/getitems',
        headers: this.getHeaders(payload),
        data: payload
      });

      return response.data;
    } catch (error) {
      console.error('Amazon Associates API product details failed:', error);
      throw error;
    }
  }

  /**
   * Get commission rates (note: this is generally retrieved from dashboard, not API)
   */
  public async getCommissionRates() {
    // This is simulated as the actual commission rates are retrieved from the Associates dashboard
    return {
      // Example rates by category - these are simulated and would need to be manually updated
      rates: [
        { category: 'Apparel', rate: 4.0 },
        { category: 'Automotive', rate: 4.5 },
        { category: 'Baby Products', rate: 4.5 },
        { category: 'Beauty', rate: 6.0 },
        { category: 'Books', rate: 4.5 },
        { category: 'Electronics', rate: 4.0 },
        { category: 'Furniture', rate: 8.0 },
        { category: 'Home & Kitchen', rate: 8.0 },
        { category: 'Pet Products', rate: 8.0 },
        { category: 'Sports & Outdoors', rate: 4.5 },
        { category: 'Toys & Games', rate: 3.0 },
        { category: 'Video Games', rate: 2.0 }
      ],
      lastUpdated: new Date().toISOString()
    };
  }

  /**
   * Get earnings report
   */
  public async getEarningsReport(period: string = 'last30days') {
    // This is simulated as earnings data typically comes from the Associates dashboard
    return {
      period,
      summary: {
        earnings: Math.random() * 1000,
        clicks: Math.floor(Math.random() * 5000),
        impressions: Math.floor(Math.random() * 50000),
        orders: Math.floor(Math.random() * 100),
        conversion: Math.random() * 5
      },
      // This would be data to populate a chart
      dailyStats: Array.from({ length: 30 }, (_, i) => ({
        date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        earnings: Math.random() * 100,
        clicks: Math.floor(Math.random() * 200),
        orders: Math.floor(Math.random() * 5)
      }))
    };
  }
}

// Zod schemas for validation
export const ProductSearchParamsSchema = z.object({
  keywords: z.string().min(1, 'Keywords are required'),
  category: z.string().optional(),
  minPrice: z.number().optional(),
  maxPrice: z.number().optional(),
  limit: z.number().optional(),
  sortBy: z.enum(['relevance', 'price-asc', 'price-desc', 'date-desc']).optional()
});

export const AsinLookupSchema = z.object({
  asin: z.string().min(10, 'ASIN must be at least 10 characters')
});