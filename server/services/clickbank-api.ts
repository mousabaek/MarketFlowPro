import { z } from "zod";
import axios from "axios";

/**
 * ClickBank API Service
 * 
 * Documentation: https://api.clickbank.com/rest/1.3/
 */
export class ClickBankApiService {
  private baseUrl = 'https://api.clickbank.com/rest/1.3';
  private apiKey: string;
  private developerApiKey: string;
  private clerk: string; // The ClickBank clerk ID

  constructor(apiKey: string, developerApiKey: string, clerk: string) {
    this.apiKey = apiKey;
    this.developerApiKey = developerApiKey;
    this.clerk = clerk;
  }

  /**
   * Get authentication headers for API requests
   */
  private getHeaders() {
    return {
      'Authorization': `${this.apiKey}:${this.developerApiKey}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
  }

  /**
   * Test the API connection
   */
  public async testConnection(): Promise<boolean> {
    try {
      // Attempt to fetch account information to test the connection
      const response = await axios.get(`${this.baseUrl}/accounts/${this.clerk}`, {
        headers: this.getHeaders()
      });
      
      return response.status === 200;
    } catch (error) {
      console.error('ClickBank API connection test failed:', error);
      return false;
    }
  }

  /**
   * Search for products
   */
  public async searchProducts(options: {
    query?: string;
    category?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
  }) {
    const { query, category, page = 1, limit = 20, sortBy = 'gravity' } = options;
    
    try {
      // In a real implementation, you would make an API call like:
      // const response = await axios.get(`${this.baseUrl}/marketplace/products`, {
      //   headers: this.getHeaders(),
      //   params: {
      //     q: query,
      //     category: category,
      //     page: page,
      //     limit: limit,
      //     sortBy: sortBy
      //   }
      // });
      //
      // return response.data;
      
      // For demo purposes, return mock data
      const mockProducts = [
        {
          id: "cb123",
          title: "Ultimate Weight Loss Program",
          description: "A comprehensive weight loss program with meal plans and workout routines.",
          vendor: "HealthyLifestyle",
          category: "Health & Fitness",
          initialPrice: 47.00,
          recurringPrice: 19.00,
          recurring: true,
          gravity: 125.4, // ClickBank's popularity metric
          commission: "75%",
          hopLink: "https://vendor.clickbank.net/?affiliate=user&cbid=cb123",
          imageUrl: "https://placehold.co/400x300?text=Weight+Loss",
          stats: {
            conversionRate: "3.2%",
            refundRate: "2.1%",
            avgEarningsPerSale: "$35.25"
          }
        },
        {
          id: "cb456",
          title: "Learn Python Programming",
          description: "Master Python programming from beginner to advanced with practical projects.",
          vendor: "CodeMaster",
          category: "Education",
          initialPrice: 197.00,
          recurringPrice: 0,
          recurring: false,
          gravity: 87.2,
          commission: "50%",
          hopLink: "https://vendor.clickbank.net/?affiliate=user&cbid=cb456",
          imageUrl: "https://placehold.co/400x300?text=Python+Programming",
          stats: {
            conversionRate: "2.5%",
            refundRate: "1.8%",
            avgEarningsPerSale: "$98.50"
          }
        },
        {
          id: "cb789",
          title: "Digital Marketing Blueprint",
          description: "Complete guide to digital marketing including SEO, social media, and email marketing.",
          vendor: "MarketingPro",
          category: "Business/Investing",
          initialPrice: 297.00,
          recurringPrice: 47.00,
          recurring: true,
          gravity: 110.6,
          commission: "60%",
          hopLink: "https://vendor.clickbank.net/?affiliate=user&cbid=cb789",
          imageUrl: "https://placehold.co/400x300?text=Marketing+Blueprint",
          stats: {
            conversionRate: "1.9%",
            refundRate: "2.4%",
            avgEarningsPerSale: "$178.20"
          }
        }
      ];
      
      // Add simple filtering based on query
      let filteredProducts = mockProducts;
      if (query) {
        const searchTerms = query.toLowerCase();
        filteredProducts = mockProducts.filter(product => 
          product.title.toLowerCase().includes(searchTerms) || 
          product.description.toLowerCase().includes(searchTerms) ||
          product.category.toLowerCase().includes(searchTerms) ||
          product.vendor.toLowerCase().includes(searchTerms)
        );
      }
      
      // Add category filtering
      if (category) {
        filteredProducts = filteredProducts.filter(product => 
          product.category.toLowerCase() === category.toLowerCase()
        );
      }
      
      // Add sorting
      if (sortBy) {
        switch(sortBy.toLowerCase()) {
          case 'gravity':
            filteredProducts.sort((a, b) => b.gravity - a.gravity);
            break;
          case 'commission':
            filteredProducts.sort((a, b) => 
              parseInt(b.commission.replace('%', '')) - 
              parseInt(a.commission.replace('%', ''))
            );
            break;
          case 'price':
            filteredProducts.sort((a, b) => b.initialPrice - a.initialPrice);
            break;
          case 'earnings':
            filteredProducts.sort((a, b) => 
              parseFloat(b.stats.avgEarningsPerSale.replace('$', '')) - 
              parseFloat(a.stats.avgEarningsPerSale.replace('$', ''))
            );
            break;
        }
      }
      
      // Paginate results
      const startIndex = (page - 1) * limit;
      const paginatedProducts = filteredProducts.slice(startIndex, startIndex + limit);
      
      return {
        products: paginatedProducts,
        pagination: {
          total: filteredProducts.length,
          page,
          limit,
          totalPages: Math.ceil(filteredProducts.length / limit)
        }
      };
    } catch (error) {
      console.error('ClickBank search products error:', error);
      throw new Error('Failed to search ClickBank products');
    }
  }

  /**
   * Get product details
   */
  public async getProductDetails(productId: string) {
    try {
      // In a real implementation, you would make an API call like:
      // const response = await axios.get(`${this.baseUrl}/marketplace/products/${productId}`, {
      //   headers: this.getHeaders()
      // });
      //
      // return response.data;
      
      // For demo purposes, return mock data based on the product ID
      if (productId === "cb123") {
        return {
          id: "cb123",
          title: "Ultimate Weight Loss Program",
          description: "This comprehensive program gives you all the tools and knowledge you need to transform your body and health. With detailed step-by-step instructions, expert guidance, and proven methodologies, you'll see results faster than you ever thought possible.\n\nWhat's included:\n- Complete meal plans customized for your body type\n- Progressive workout routines for all fitness levels\n- Mindset and motivation strategies\n- 24/7 community support\n- Lifetime access to all materials and future updates",
          vendor: {
            name: "HealthyLifestyle",
            website: "https://example.com/healthylifestyle",
            supportEmail: "support@healthylifestyle.com",
            gravity: 125.4,
            totalSales: 15420,
          },
          category: "Health & Fitness",
          subcategory: "Weight Loss",
          pricing: {
            initialPrice: 47.00,
            formattedPrice: "$47.00",
            recurringPrice: 19.00,
            billingFrequency: "monthly",
            hasTrialPeriod: true,
            trialPeriodDays: 14,
            hasRebill: true,
            hasUpsells: true
          },
          affiliate: {
            commission: "75%",
            hopLink: `https://vendor.clickbank.net/?affiliate=user&cbid=${productId}`,
            averageEarningsPerSale: "$35.25",
            conversionRate: "3.2%",
            estimatedCommission: 35.25
          },
          stats: {
            refundRate: "2.1%",
            activeAffiliates: 423,
            competitionScore: "Medium",
          },
          content: {
            images: [
              "https://placehold.co/800x500?text=Weight+Loss",
              "https://placehold.co/800x500?text=Meal+Plans",
              "https://placehold.co/800x500?text=Workout+Routines"
            ],
            features: [
              "Personalized meal plans for different dietary preferences",
              "Custom workout routines based on your fitness level",
              "Progress tracking tools and metrics dashboard",
              "Community support and accountability groups",
              "24/7 coaching access via mobile app"
            ],
            testimonials: [
              {
                name: "Jane D.",
                text: "I lost 35 pounds in just 3 months following this program. The meal plans were easy to follow and the workouts were challenging but fun!",
                rating: 5
              },
              {
                name: "Mike S.",
                text: "After trying many different programs, this is the only one that gave me consistent results. Highly recommended!",
                rating: 5
              },
              {
                name: "Sarah T.",
                text: "Great program with excellent support. The community aspect really helped me stay motivated.",
                rating: 4
              }
            ]
          }
        };
      } else if (productId === "cb456") {
        return {
          id: "cb456",
          title: "Learn Python Programming",
          description: "Master Python programming from beginner to advanced with practical projects. This comprehensive course takes you from zero to hero with hands-on projects and real-world examples.\n\nWhat's included:\n- 100+ hours of video content\n- 50+ coding exercises and projects\n- Personal code reviews and feedback\n- Certificate of completion\n- Job assistance and interview preparation",
          vendor: {
            name: "CodeMaster",
            website: "https://example.com/codemaster",
            supportEmail: "support@codemaster.com",
            gravity: 87.2,
            totalSales: 8760,
          },
          category: "Education",
          subcategory: "Programming",
          pricing: {
            initialPrice: 197.00,
            formattedPrice: "$197.00",
            recurringPrice: 0,
            billingFrequency: "none",
            hasTrialPeriod: false,
            trialPeriodDays: 0,
            hasRebill: false,
            hasUpsells: true
          },
          affiliate: {
            commission: "50%",
            hopLink: `https://vendor.clickbank.net/?affiliate=user&cbid=${productId}`,
            averageEarningsPerSale: "$98.50",
            conversionRate: "2.5%",
            estimatedCommission: 98.50
          },
          stats: {
            refundRate: "1.8%",
            activeAffiliates: 215,
            competitionScore: "Low",
          },
          content: {
            images: [
              "https://placehold.co/800x500?text=Python+Programming",
              "https://placehold.co/800x500?text=Coding+Projects",
              "https://placehold.co/800x500?text=Course+Structure"
            ],
            features: [
              "100+ coding exercises with detailed solutions",
              "Real-world projects including web apps, games, and data analysis",
              "Code reviews and personalized feedback",
              "Algorithm and data structure fundamentals",
              "Certificate of completion recognized by employers"
            ],
            testimonials: [
              {
                name: "David L.",
                text: "This course took me from knowing nothing about programming to landing a job as a Python developer in just 6 months!",
                rating: 5
              },
              {
                name: "Anna M.",
                text: "Excellent course structure and the projects were very practical. I use what I learned daily in my data science role.",
                rating: 5
              },
              {
                name: "Robert K.",
                text: "Good content, though some sections could use more explanation. Overall worth the investment.",
                rating: 4
              }
            ]
          }
        };
      } else if (productId === "cb789") {
        return {
          id: "cb789",
          title: "Digital Marketing Blueprint",
          description: "Complete guide to digital marketing including SEO, social media, and email marketing. This comprehensive program covers everything you need to know to market effectively in the digital age.\n\nWhat's included:\n- Complete SEO strategy and implementation guide\n- Social media marketing mastery for all platforms\n- Email marketing automation and list building\n- Content marketing framework and templates\n- Paid advertising strategies for maximum ROI",
          vendor: {
            name: "MarketingPro",
            website: "https://example.com/marketingpro",
            supportEmail: "support@marketingpro.com",
            gravity: 110.6,
            totalSales: 12350,
          },
          category: "Business/Investing",
          subcategory: "Digital Marketing",
          pricing: {
            initialPrice: 297.00,
            formattedPrice: "$297.00",
            recurringPrice: 47.00,
            billingFrequency: "monthly",
            hasTrialPeriod: false,
            trialPeriodDays: 0,
            hasRebill: true,
            hasUpsells: true
          },
          affiliate: {
            commission: "60%",
            hopLink: `https://vendor.clickbank.net/?affiliate=user&cbid=${productId}`,
            averageEarningsPerSale: "$178.20",
            conversionRate: "1.9%",
            estimatedCommission: 178.20
          },
          stats: {
            refundRate: "2.4%",
            activeAffiliates: 352,
            competitionScore: "High",
          },
          content: {
            images: [
              "https://placehold.co/800x500?text=Marketing+Blueprint",
              "https://placehold.co/800x500?text=Marketing+Strategies",
              "https://placehold.co/800x500?text=Campaign+Examples"
            ],
            features: [
              "Complete social media strategy for all major platforms",
              "Email marketing templates and automation sequences",
              "SEO optimization techniques for higher rankings",
              "Traffic generation strategies with paid and organic methods",
              "Conversion optimization tactics for maximum results"
            ],
            testimonials: [
              {
                name: "Jennifer R.",
                text: "This blueprint helped me triple my business revenue in just 6 months by implementing the social media and email strategies.",
                rating: 5
              },
              {
                name: "Mark T.",
                text: "The SEO section alone was worth the price. My website now ranks on page 1 for several competitive keywords.",
                rating: 5
              },
              {
                name: "Lisa B.",
                text: "Good content overall, though I wish there was more focus on specific niches. Still very valuable.",
                rating: 4
              }
            ]
          }
        };
      } else {
        // Default mock product for unknown IDs
        return {
          id: productId,
          title: "Generic ClickBank Product",
          description: "This is a placeholder for a ClickBank product. In a real implementation, this would show details for the specific product ID requested.",
          vendor: {
            name: "Example Vendor",
            website: "https://example.com",
            supportEmail: "support@example.com",
            gravity: 50.0,
            totalSales: 5000,
          },
          category: "Miscellaneous",
          subcategory: "General",
          pricing: {
            initialPrice: 97.00,
            formattedPrice: "$97.00",
            recurringPrice: 0,
            billingFrequency: "none",
            hasTrialPeriod: false,
            trialPeriodDays: 0,
            hasRebill: false,
            hasUpsells: false
          },
          affiliate: {
            commission: "50%",
            hopLink: `https://vendor.clickbank.net/?affiliate=user&cbid=${productId}`,
            averageEarningsPerSale: "$48.50",
            conversionRate: "2.0%",
            estimatedCommission: 48.50
          },
          stats: {
            refundRate: "3.0%",
            activeAffiliates: 100,
            competitionScore: "Medium",
          },
          content: {
            images: [
              "https://placehold.co/800x500?text=Product+Image"
            ],
            features: [
              "Feature 1",
              "Feature 2",
              "Feature 3",
              "Feature 4",
              "Feature 5"
            ],
            testimonials: [
              {
                name: "User A",
                text: "Generic positive testimonial for this product.",
                rating: 5
              },
              {
                name: "User B",
                text: "Another positive review about this product.",
                rating: 4
              }
            ]
          }
        };
      }
    } catch (error) {
      console.error('ClickBank get product details error:', error);
      throw new Error('Failed to get ClickBank product details');
    }
  }

  /**
   * Get analytics data
   */
  public async getAnalytics(period: string = 'last30days') {
    try {
      // In a real implementation, you would make an API call like:
      // const response = await axios.get(`${this.baseUrl}/analytics/report`, {
      //   headers: this.getHeaders(),
      //   params: { period }
      // });
      //
      // return response.data;
      
      // For demo purposes, return mock analytics data
      return {
        period,
        impressions: 15420,
        clicks: 873,
        conversionRate: "6.21%",
        sales: 54,
        revenue: 4827.50,
        refunds: 2,
        netRevenue: 4650.30,
        topProducts: [
          {
            id: "cb123",
            title: "Ultimate Weight Loss Program",
            sales: 23,
            revenue: 2162.50
          },
          {
            id: "cb789",
            title: "Digital Marketing Blueprint",
            sales: 18,
            revenue: 1785.00
          },
          {
            id: "cb456",
            title: "Learn Python Programming",
            sales: 13,
            revenue: 880.00
          }
        ]
      };
    } catch (error) {
      console.error('ClickBank analytics error:', error);
      throw new Error('Failed to get ClickBank analytics data');
    }
  }

  /**
   * Get commission rates (note: typically retrieved from product details)
   */
  public async getCommissionRates() {
    try {
      // ClickBank typically doesn't have a separate API for commission rates
      // Rates are typically displayed per product
      // For demo purposes, return mock commission data by category
      return {
        categories: [
          {
            category: "Health & Fitness",
            averageCommission: "60-75%",
            topProducts: [
              { name: "Weight Loss Program X", commission: "75%" },
              { name: "Yoga Course Y", commission: "65%" },
              { name: "Nutrition Guide Z", commission: "70%" }
            ]
          },
          {
            category: "Business/Investing",
            averageCommission: "50-60%",
            topProducts: [
              { name: "Stock Trading Course", commission: "50%" },
              { name: "Ecommerce Blueprint", commission: "60%" },
              { name: "Passive Income System", commission: "55%" }
            ]
          },
          {
            category: "Education",
            averageCommission: "50-70%",
            topProducts: [
              { name: "Language Learning System", commission: "70%" },
              { name: "Programming Course", commission: "50%" },
              { name: "Memory Improvement", commission: "60%" }
            ]
          }
        ],
        generalInfo: {
          platformAverage: "50-75%",
          recurringCommissions: "Yes, on subscription products",
          paymentFrequency: "Net-15 (twice monthly)",
          paymentMethods: ["Direct Deposit", "Check", "Wire Transfer", "Payoneer"]
        }
      };
    } catch (error) {
      console.error('ClickBank commission rates error:', error);
      throw new Error('Failed to get ClickBank commission rates');
    }
  }

  /**
   * Get earnings report
   */
  public async getEarningsReport(period: string = 'last30days') {
    try {
      // In a real implementation, you would make an API call like:
      // const response = await axios.get(`${this.baseUrl}/accounting/earnings`, {
      //   headers: this.getHeaders(),
      //   params: { period }
      // });
      //
      // return response.data;
      
      // For demo purposes, return mock earnings data
      return {
        period,
        summary: {
          totalEarnings: 2845.75,
          totalSales: 38,
          averageCommission: 74.89,
          refunds: 3,
          netEarnings: 2625.22
        },
        topProducts: [
          { 
            name: "Ultimate Weight Loss Program", 
            sales: 15, 
            earnings: 1128.50, 
            refunds: 1, 
            netEarnings: 1045.25 
          },
          { 
            name: "Digital Marketing Blueprint", 
            sales: 8, 
            earnings: 963.60, 
            refunds: 1, 
            netEarnings: 820.35 
          },
          { 
            name: "Learn Python Programming", 
            sales: 7, 
            earnings: 689.50, 
            refunds: 1, 
            netEarnings: 604.00 
          }
        ],
        dailyEarnings: Array.from({ length: 30 }, (_, i) => ({
          date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          earnings: Math.random() * 200 + 50,
          sales: Math.floor(Math.random() * 5) + 1
        })),
        trends: {
          changeFromPreviousPeriod: "+12.5%",
          bestPerformingCategory: "Health & Fitness",
          fastestGrowingProduct: "Digital Marketing Blueprint"
        }
      };
    } catch (error) {
      console.error('ClickBank earnings report error:', error);
      throw new Error('Failed to get ClickBank earnings report');
    }
  }

  /**
   * Get top performing products
   */
  public async getTopProducts(limit: number = 10) {
    try {
      // In a real implementation, you would make an API call like:
      // const response = await axios.get(`${this.baseUrl}/marketplace/top-products`, {
      //   headers: this.getHeaders(),
      //   params: { limit }
      // });
      //
      // return response.data;
      
      // For demo purposes, return mock top products
      const mockTopProducts = [
        {
          id: "cb123",
          title: "Ultimate Weight Loss Program",
          vendor: "HealthyLifestyle",
          category: "Health & Fitness",
          gravity: 125.4,
          commission: "75%",
          initialPrice: 47.00,
          recurring: true,
          avgEarningsPerSale: 35.25,
          conversionRate: "3.2%"
        },
        {
          id: "cb789",
          title: "Digital Marketing Blueprint",
          vendor: "MarketingPro",
          category: "Business/Investing",
          gravity: 110.6,
          commission: "60%",
          initialPrice: 297.00,
          recurring: true,
          avgEarningsPerSale: 178.20,
          conversionRate: "1.9%"
        },
        {
          id: "cb456",
          title: "Learn Python Programming",
          vendor: "CodeMaster",
          category: "Education",
          gravity: 87.2,
          commission: "50%",
          initialPrice: 197.00,
          recurring: false,
          avgEarningsPerSale: 98.50,
          conversionRate: "2.5%"
        },
        {
          id: "cb234",
          title: "Advanced Forex Trading System",
          vendor: "ForexMaster",
          category: "Business/Investing",
          gravity: 78.5,
          commission: "55%",
          initialPrice: 197.00,
          recurring: false,
          avgEarningsPerSale: 108.35,
          conversionRate: "1.8%"
        },
        {
          id: "cb567",
          title: "Music Production Masterclass",
          vendor: "BeatMaster",
          category: "Arts & Entertainment",
          gravity: 65.9,
          commission: "60%",
          initialPrice: 147.00,
          recurring: false,
          avgEarningsPerSale: 88.20,
          conversionRate: "2.2%"
        },
        {
          id: "cb890",
          title: "Keto Diet Cookbook",
          vendor: "NutritionExpert",
          category: "Health & Fitness",
          gravity: 62.7,
          commission: "70%",
          initialPrice: 37.00,
          recurring: false,
          avgEarningsPerSale: 25.90,
          conversionRate: "3.5%"
        },
        {
          id: "cb345",
          title: "Affiliate Marketing Accelerator",
          vendor: "AffiliateGuru",
          category: "Business/Investing",
          gravity: 58.3,
          commission: "50%",
          initialPrice: 197.00,
          recurring: true,
          avgEarningsPerSale: 98.50,
          conversionRate: "2.1%"
        },
        {
          id: "cb678",
          title: "Guitar Mastery Method",
          vendor: "GuitarPro",
          category: "Arts & Entertainment",
          gravity: 55.2,
          commission: "65%",
          initialPrice: 127.00,
          recurring: false,
          avgEarningsPerSale: 82.55,
          conversionRate: "2.8%"
        },
        {
          id: "cb901",
          title: "Hydroponic Gardening Guide",
          vendor: "GreenThumb",
          category: "Home & Garden",
          gravity: 48.6,
          commission: "60%",
          initialPrice: 67.00,
          recurring: false,
          avgEarningsPerSale: 40.20,
          conversionRate: "2.4%"
        },
        {
          id: "cb432",
          title: "Dog Training Secrets",
          vendor: "DogWhisperer",
          category: "Pets & Animals",
          gravity: 45.3,
          commission: "70%",
          initialPrice: 47.00,
          recurring: false,
          avgEarningsPerSale: 32.90,
          conversionRate: "3.7%"
        }
      ].slice(0, limit);
      
      return { 
        products: mockTopProducts,
        updatedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('ClickBank top products error:', error);
      throw new Error('Failed to get ClickBank top products');
    }
  }
}

// Validation schemas for API parameters
export const ClickBankSearchParamsSchema = z.object({
  query: z.string().optional(),
  category: z.string().optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
  sortBy: z.string().optional()
});

export const ClickBankProductLookupSchema = z.object({
  productId: z.string().min(1, { message: "Product ID is required" })
});