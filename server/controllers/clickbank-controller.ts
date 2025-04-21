import { Request, Response } from "express";
import { ClickBankApiService, ClickBankSearchParamsSchema, ClickBankProductLookupSchema } from "../services/clickbank-api";
import { z } from "zod";

/**
 * Controller for ClickBank API endpoints
 */
export class ClickBankController {
  /**
   * Helper method to extract API credentials from platform settings
   */
  private static getCredentials(platform: any): { apiKey: string | null, developerApiKey: string | null, clerk: string | null } {
    try {
      const settings = platform.settings || {};
      return {
        apiKey: settings.apiKey || null,
        developerApiKey: settings.developerApiKey || null,
        clerk: settings.clerk || null
      };
    } catch (error) {
      console.error("Error extracting ClickBank credentials:", error);
      return { apiKey: null, developerApiKey: null, clerk: null };
    }
  }

  /**
   * Test the connection to ClickBank API
   */
  static async testConnection(req: Request, res: Response) {
    try {
      const { platform } = req.body;
      
      if (!platform) {
        return res.status(400).json({ message: "Platform data is required" });
      }
      
      const { apiKey, developerApiKey, clerk } = this.getCredentials(platform);
      
      if (!apiKey || !developerApiKey || !clerk) {
        return res.status(400).json({ 
          message: "Missing required ClickBank credentials", 
          requiredFields: ["apiKey", "developerApiKey", "clerk"] 
        });
      }
      
      const clickBankApi = new ClickBankApiService(apiKey, developerApiKey, clerk);
      const isConnected = await clickBankApi.testConnection();
      
      if (isConnected) {
        return res.status(200).json({ success: true, message: "Successfully connected to ClickBank API" });
      } else {
        return res.status(400).json({ success: false, message: "Failed to connect to ClickBank API" });
      }
    } catch (error) {
      console.error("ClickBank test connection error:", error);
      return res.status(500).json({ message: "Internal server error testing ClickBank connection" });
    }
  }

  /**
   * Search for products on ClickBank
   */
  static async searchProducts(req: Request, res: Response) {
    try {
      const platformId = parseInt(req.params.platformId);
      const result = ClickBankSearchParamsSchema.safeParse(req.query);
      
      if (!result.success) {
        return res.status(400).json({ 
          message: "Invalid query parameters", 
          errors: result.error.errors 
        });
      }
      
      // For demo purposes, return mock data without requiring a valid API key
      // In a production environment, you'd retrieve the platform from DB and validate credentials
      
      // Mock response that mimics ClickBank's product data structure
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
      
      // Add pagination metadata
      const response = {
        products: mockProducts,
        pagination: {
          total: 243,
          page: result.data.page || 1,
          limit: result.data.limit || 20,
          totalPages: Math.ceil(243 / (result.data.limit || 20))
        }
      };
      
      return res.status(200).json(response);
    } catch (error) {
      console.error("ClickBank search products error:", error);
      return res.status(500).json({ message: "Internal server error searching for ClickBank products" });
    }
  }

  /**
   * Get product details from ClickBank
   */
  static async getProductDetails(req: Request, res: Response) {
    try {
      const platformId = parseInt(req.params.platformId);
      const { productId } = req.params;
      
      const result = ClickBankProductLookupSchema.safeParse({ productId });
      
      if (!result.success) {
        return res.status(400).json({ 
          message: "Invalid product ID", 
          errors: result.error.errors 
        });
      }
      
      // For demo purposes, return mock data
      // In a production environment, you'd verify platform credentials and call the actual API
      
      // Mock product details based on the ID
      const productDetails = {
        id: productId,
        title: productId === "cb123" ? "Ultimate Weight Loss Program" : 
              productId === "cb456" ? "Learn Python Programming" : 
              "Digital Marketing Blueprint",
        description: "This comprehensive program gives you all the tools and knowledge you need to transform your life. With detailed step-by-step instructions, expert guidance, and proven methodologies, you'll see results faster than you ever thought possible.\n\nWhat's included:\n- Complete beginner to advanced curriculum\n- Practical exercises and real-world examples\n- Lifetime access to all materials and future updates\n- Community support and expert feedback\n- 60-day money-back guarantee",
        vendor: {
          name: productId === "cb123" ? "HealthyLifestyle" : 
                productId === "cb456" ? "CodeMaster" : 
                "MarketingPro",
          website: "https://example.com/vendor",
          supportEmail: "support@example.com",
          gravity: productId === "cb123" ? 125.4 : 
                  productId === "cb456" ? 87.2 : 
                  110.6,
          totalSales: productId === "cb123" ? 15420 : 
                     productId === "cb456" ? 8760 : 
                     12350,
        },
        category: productId === "cb123" ? "Health & Fitness" : 
                productId === "cb456" ? "Education" : 
                "Business/Investing",
        subcategory: productId === "cb123" ? "Weight Loss" : 
                    productId === "cb456" ? "Programming" : 
                    "Digital Marketing",
        pricing: {
          initialPrice: productId === "cb123" ? 47.00 : 
                      productId === "cb456" ? 197.00 : 
                      297.00,
          formattedPrice: productId === "cb123" ? "$47.00" : 
                         productId === "cb456" ? "$197.00" : 
                         "$297.00",
          recurringPrice: productId === "cb123" ? 19.00 : 
                        productId === "cb456" ? 0 : 
                        47.00,
          billingFrequency: productId === "cb123" ? "monthly" : 
                          productId === "cb456" ? "none" : 
                          "monthly",
          hasTrialPeriod: productId === "cb123" ? true : false,
          trialPeriodDays: productId === "cb123" ? 14 : 0,
          hasRebill: productId === "cb123" || productId === "cb789",
          hasUpsells: true
        },
        affiliate: {
          commission: productId === "cb123" ? "75%" : 
                    productId === "cb456" ? "50%" : 
                    "60%",
          hopLink: `https://vendor.clickbank.net/?affiliate=user&cbid=${productId}`,
          averageEarningsPerSale: productId === "cb123" ? "$35.25" : 
                                productId === "cb456" ? "$98.50" : 
                                "$178.20",
          conversionRate: productId === "cb123" ? "3.2%" : 
                        productId === "cb456" ? "2.5%" : 
                        "1.9%",
          estimatedCommission: productId === "cb123" ? 35.25 : 
                             productId === "cb456" ? 98.50 : 
                             178.20
        },
        stats: {
          refundRate: productId === "cb123" ? "2.1%" : 
                    productId === "cb456" ? "1.8%" : 
                    "2.4%",
          activeAffiliates: productId === "cb123" ? 423 : 
                          productId === "cb456" ? 215 : 
                          352,
          competitionScore: productId === "cb123" ? "Medium" : 
                          productId === "cb456" ? "Low" : 
                          "High",
        },
        content: {
          images: [
            `https://placehold.co/800x500?text=${encodeURIComponent(
              productId === "cb123" ? "Weight Loss" : 
              productId === "cb456" ? "Python Programming" : 
              "Marketing Blueprint"
            )}`,
            `https://placehold.co/800x500?text=${encodeURIComponent(
              productId === "cb123" ? "Meal Plans" : 
              productId === "cb456" ? "Coding Projects" : 
              "Marketing Strategies"
            )}`,
            `https://placehold.co/800x500?text=${encodeURIComponent(
              productId === "cb123" ? "Workout Routines" : 
              productId === "cb456" ? "Course Structure" : 
              "Campaign Examples"
            )}`
          ],
          features: [
            productId === "cb123" ? "Personalized meal plans" : 
            productId === "cb456" ? "100+ coding exercises" : 
            "Complete social media strategy",
            productId === "cb123" ? "Custom workout routines" : 
            productId === "cb456" ? "Real-world projects" : 
            "Email marketing templates",
            productId === "cb123" ? "Progress tracking tools" : 
            productId === "cb456" ? "Code review and feedback" : 
            "SEO optimization techniques",
            productId === "cb123" ? "Community support" : 
            productId === "cb456" ? "Certificate of completion" : 
            "Traffic generation strategies",
            productId === "cb123" ? "24/7 coaching access" : 
            productId === "cb456" ? "Job assistance" : 
            "Conversion optimization tactics"
          ],
          testimonials: [
            {
              name: "John D.",
              text: "This product completely changed my life. The results were amazing!",
              rating: 5
            },
            {
              name: "Sara M.",
              text: "I was skeptical at first, but after trying it I'm a complete believer.",
              rating: 5
            },
            {
              name: "Michael T.",
              text: "Great value for the price. Would definitely recommend to others.",
              rating: 4
            }
          ]
        }
      };
      
      return res.status(200).json(productDetails);
    } catch (error) {
      console.error("ClickBank get product details error:", error);
      return res.status(500).json({ message: "Internal server error retrieving ClickBank product details" });
    }
  }

  /**
   * Get commission rates
   */
  static async getCommissionRates(req: Request, res: Response) {
    try {
      const platformId = parseInt(req.params.platformId);
      
      // For demo purposes, return mock commission data
      const mockCommissionData = {
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
      
      return res.status(200).json(mockCommissionData);
    } catch (error) {
      console.error("ClickBank commission rates error:", error);
      return res.status(500).json({ message: "Internal server error retrieving ClickBank commission rates" });
    }
  }

  /**
   * Get earnings report
   */
  static async getEarningsReport(req: Request, res: Response) {
    try {
      const platformId = parseInt(req.params.platformId);
      const period = req.query.period as string || 'last30days';
      
      // For demo purposes, return mock earnings data
      const mockEarningsData = {
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
      
      return res.status(200).json(mockEarningsData);
    } catch (error) {
      console.error("ClickBank earnings report error:", error);
      return res.status(500).json({ message: "Internal server error retrieving ClickBank earnings report" });
    }
  }

  /**
   * Get top performing products
   */
  static async getTopProducts(req: Request, res: Response) {
    try {
      const platformId = parseInt(req.params.platformId);
      const limit = parseInt(req.query.limit as string) || 10;
      
      // For demo purposes, return mock top products data
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
        }
      ].slice(0, limit);
      
      return res.status(200).json({ 
        products: mockTopProducts,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error("ClickBank top products error:", error);
      return res.status(500).json({ message: "Internal server error retrieving ClickBank top products" });
    }
  }
}