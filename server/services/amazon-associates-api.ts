import axios from 'axios';
import { z } from 'zod';
import crypto from 'crypto';

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
    return crypto
      .createHmac('sha256', secretKey)
      .update(stringToSign)
      .digest('base64');
  }

  /**
   * Get authentication headers for API requests
   */
  private getHeaders(payload: any) {
    const timestamp = new Date().toISOString().replace(/[:-]|\.\d{3}/g, '');
    const date = timestamp.substring(0, 8);

    // Create canonical request
    const canonicalURI = '/paapi5/searchitems';
    const canonicalQueryString = '';
    const canonicalHeaders = `host:webservices.amazon.${this.marketplace.toLowerCase()}\nx-amz-date:${timestamp}\n`;
    const signedHeaders = 'host;x-amz-date';
    const payloadHash = crypto.createHash('sha256').update(JSON.stringify(payload)).digest('hex');
    const canonicalRequest = `POST\n${canonicalURI}\n${canonicalQueryString}\n${canonicalHeaders}\n${signedHeaders}\n${payloadHash}`;

    // Create string to sign
    const algorithm = 'AWS4-HMAC-SHA256';
    const credentialScope = `${date}/${this.marketplace.toLowerCase()}/paapi5/aws4_request`;
    const stringToSign = `${algorithm}\n${timestamp}\n${credentialScope}\n${crypto.createHash('sha256').update(canonicalRequest).digest('hex')}`;

    // Calculate signature
    const kDate = crypto.createHmac('sha256', `AWS4${this.secretKey}`).update(date).digest();
    const kRegion = crypto.createHmac('sha256', kDate).update(this.marketplace.toLowerCase()).digest();
    const kService = crypto.createHmac('sha256', kRegion).update('paapi5').digest();
    const kSigning = crypto.createHmac('sha256', kService).update('aws4_request').digest();
    const signature = this.generateSignature(stringToSign, kSigning.toString('hex'));

    return {
      'Content-Type': 'application/json',
      'X-Amz-Date': timestamp,
      'Authorization': `${algorithm} Credential=${this.accessKey}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`
    };
  }

  /**
   * Test the API connection
   */
  public async testConnection(): Promise<boolean> {
    try {
      const payload = {
        'Keywords': 'test',
        'Resources': ['ItemInfo.Title'],
        'PartnerTag': this.associateTag,
        'PartnerType': 'Associates',
        'Marketplace': `www.amazon.${this.marketplace.toLowerCase()}`
      };

      await axios.post(
        this.baseUrl,
        payload,
        { headers: this.getHeaders(payload) }
      );
      return true;
    } catch (error) {
      console.error('Error testing Amazon Associates API connection:', error);
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
    sortBy?: string;
    limit?: number;
  }) {
    try {
      const payload = {
        'Keywords': options.keywords,
        'Resources': [
          'ItemInfo.Title',
          'ItemInfo.Features',
          'ItemInfo.ProductInfo',
          'ItemInfo.ByLineInfo',
          'Images.Primary.Medium',
          'Offers.Listings.Price',
          'Offers.Listings.SavingBasis'
        ],
        'PartnerTag': this.associateTag,
        'PartnerType': 'Associates',
        'Marketplace': `www.amazon.${this.marketplace.toLowerCase()}`,
        'ItemCount': options.limit || 10
      };

      if (options.category) {
        payload['SearchIndex'] = options.category;
      }

      if (options.minPrice || options.maxPrice) {
        payload['ItemPage'] = {
          'MinPrice': options.minPrice,
          'MaxPrice': options.maxPrice,
        };
      }

      if (options.sortBy) {
        payload['SortBy'] = options.sortBy;
      }

      const response = await axios.post(
        this.baseUrl,
        payload,
        { headers: this.getHeaders(payload) }
      );

      return response.data;
    } catch (error) {
      console.error('Error searching products:', error);
      throw error;
    }
  }

  /**
   * Get product details by ASIN
   */
  public async getProductDetails(asin: string) {
    try {
      const payload = {
        'ItemIds': [asin],
        'Resources': [
          'ItemInfo.Title',
          'ItemInfo.Features',
          'ItemInfo.ProductInfo',
          'ItemInfo.ByLineInfo',
          'ItemInfo.ContentInfo',
          'ItemInfo.ManufactureInfo',
          'ItemInfo.TechnicalInfo',
          'ItemInfo.Classifications',
          'Images.Primary.Large',
          'Images.Variants.Large',
          'Offers.Listings.Price',
          'Offers.Listings.SavingBasis',
          'Offers.Summaries.LowestPrice'
        ],
        'PartnerTag': this.associateTag,
        'PartnerType': 'Associates',
        'Marketplace': `www.amazon.${this.marketplace.toLowerCase()}`
      };

      const response = await axios.post(
        this.baseUrl,
        payload,
        { headers: this.getHeaders(payload) }
      );

      return response.data;
    } catch (error) {
      console.error(`Error getting product details for ASIN ${asin}:`, error);
      throw error;
    }
  }

  /**
   * Get commission rates (note: this is generally retrieved from dashboard, not API)
   */
  public async getCommissionRates() {
    // This is a mock implementation as Amazon doesn't provide direct API access to commission rates
    // In a real implementation, these would typically be manually configured based on current rates
    return {
      success: true,
      result: {
        rates: {
          'Amazon Devices': 4,
          'Automotive': 4.5,
          'Baby': 4.5,
          'Beauty': 6,
          'Books': 4.5,
          'Clothing': 7,
          'Electronics': 3,
          'Furniture': 8,
          'Garden': 5.5,
          'Grocery': 5,
          'Health & Personal Care': 6,
          'Home': 8,
          'Kitchen': 8,
          'Office Products': 6,
          'Pet Supplies': 8,
          'Sports': 5.5,
          'Tools': 6,
          'Toys': 3,
          'Video Games': 2
        }
      }
    };
  }

  /**
   * Get earnings report
   */
  public async getEarningsReport(period: string = 'last30days') {
    // This is a mock implementation as Amazon doesn't provide direct API access to earnings
    // In a real implementation, this would be integrated with the Amazon Associates reporting API
    return {
      success: true,
      result: {
        period: period,
        clicks: 1250,
        orderedItems: 78,
        earnings: 342.55,
        conversionRate: 6.24,
        averageCommission: 4.39
      }
    };
  }
}

// Zod schema for product search parameters
export const ProductSearchParamsSchema = z.object({
  keywords: z.string().min(1, "Keywords are required"),
  category: z.string().optional(),
  minPrice: z.number().min(0).optional(),
  maxPrice: z.number().min(0).optional(),
  sortBy: z.string().optional(),
  limit: z.number().min(1).max(50).optional().default(10),
});

// Zod schema for ASIN lookup
export const AsinLookupSchema = z.object({
  asin: z.string().min(10).max(10),
});