import { Request, Response } from "express";
import { ClickBankApiService, ClickBankSearchParamsSchema, ClickBankProductLookupSchema } from "../services/clickbank-api";
import { storage } from "../storage";

/**
 * Controller for ClickBank API endpoints
 */
export class ClickBankController {
  /**
   * Helper method to extract API credentials from platform settings
   */
  private static getCredentials(platform: any): { apiKey: string | null, developerApiKey: string | null, clerk: string | null } {
    if (!platform) {
      return { apiKey: null, developerApiKey: null, clerk: null };
    }

    const settings = platform.settings || {};
    return {
      apiKey: settings.clickbankApiKey || null,
      developerApiKey: settings.clickbankDeveloperApiKey || null,
      clerk: settings.clickbankClerkId || null
    };
  }

  /**
   * Test the connection to ClickBank API
   */
  static async testConnection(req: Request, res: Response) {
    try {
      const { platformId } = req.params;
      const platform = await storage.getPlatform(parseInt(platformId));
      
      if (!platform) {
        return res.status(404).json({ success: false, message: "Platform not found" });
      }
      
      const { apiKey, developerApiKey, clerk } = this.getCredentials(platform);
      
      if (!apiKey || !developerApiKey || !clerk) {
        return res.status(400).json({ 
          success: false, 
          message: "Missing ClickBank API credentials in platform settings" 
        });
      }
      
      const clickbankService = new ClickBankApiService(apiKey, developerApiKey, clerk);
      const isConnected = await clickbankService.testConnection();
      
      if (isConnected) {
        return res.json({ success: true, message: "Successfully connected to ClickBank API" });
      } else {
        return res.status(400).json({ success: false, message: "Failed to connect to ClickBank API" });
      }
    } catch (error) {
      console.error("ClickBank test connection error:", error);
      return res.status(500).json({ 
        success: false, 
        message: "An error occurred while testing the ClickBank connection" 
      });
    }
  }

  /**
   * Search for products on ClickBank
   */
  static async searchProducts(req: Request, res: Response) {
    try {
      const { platformId } = req.params;
      const platform = await storage.getPlatform(parseInt(platformId));
      
      if (!platform) {
        return res.status(404).json({ success: false, message: "Platform not found" });
      }
      
      const { apiKey, developerApiKey, clerk } = this.getCredentials(platform);
      
      if (!apiKey || !developerApiKey || !clerk) {
        // For demo purposes, we'll continue with empty credentials to show mock data
        // In a real application, we would return an error
      }
      
      // Validate the query parameters
      const validatedParams = ClickBankSearchParamsSchema.safeParse(req.query);
      
      if (!validatedParams.success) {
        return res.status(400).json({ 
          success: false, 
          message: "Invalid search parameters", 
          errors: validatedParams.error.format() 
        });
      }
      
      const clickbankService = new ClickBankApiService(
        apiKey || "demo-api-key", 
        developerApiKey || "demo-developer-key", 
        clerk || "demo-clerk"
      );
      
      const searchResults = await clickbankService.searchProducts(validatedParams.data);
      
      return res.json(searchResults);
    } catch (error) {
      console.error("ClickBank search products error:", error);
      return res.status(500).json({ 
        success: false, 
        message: "An error occurred while searching ClickBank products" 
      });
    }
  }

  /**
   * Get product details from ClickBank
   */
  static async getProductDetails(req: Request, res: Response) {
    try {
      const { platformId } = req.params;
      const platform = await storage.getPlatform(parseInt(platformId));
      
      if (!platform) {
        return res.status(404).json({ success: false, message: "Platform not found" });
      }
      
      const { apiKey, developerApiKey, clerk } = this.getCredentials(platform);
      
      // Validate productId
      const validatedParams = ClickBankProductLookupSchema.safeParse(req.params);
      
      if (!validatedParams.success) {
        return res.status(400).json({ 
          success: false, 
          message: "Invalid product ID", 
          errors: validatedParams.error.format() 
        });
      }
      
      const { productId } = validatedParams.data;
      
      const clickbankService = new ClickBankApiService(
        apiKey || "demo-api-key", 
        developerApiKey || "demo-developer-key", 
        clerk || "demo-clerk"
      );
      
      const productDetails = await clickbankService.getProductDetails(productId);
      
      return res.json(productDetails);
    } catch (error) {
      console.error("ClickBank get product details error:", error);
      return res.status(500).json({ 
        success: false, 
        message: "An error occurred while fetching ClickBank product details" 
      });
    }
  }

  /**
   * Get commission rates
   */
  static async getCommissionRates(req: Request, res: Response) {
    try {
      const { platformId } = req.params;
      const platform = await storage.getPlatform(parseInt(platformId));
      
      if (!platform) {
        return res.status(404).json({ success: false, message: "Platform not found" });
      }
      
      const { apiKey, developerApiKey, clerk } = this.getCredentials(platform);
      
      if (!apiKey || !developerApiKey || !clerk) {
        // For demo purposes, we'll continue with empty credentials to show mock data
      }
      
      const clickbankService = new ClickBankApiService(
        apiKey || "demo-api-key", 
        developerApiKey || "demo-developer-key", 
        clerk || "demo-clerk"
      );
      
      const commissionRates = await clickbankService.getCommissionRates();
      
      return res.json(commissionRates);
    } catch (error) {
      console.error("ClickBank get commission rates error:", error);
      return res.status(500).json({ 
        success: false, 
        message: "An error occurred while fetching ClickBank commission rates" 
      });
    }
  }

  /**
   * Get earnings report
   */
  static async getEarningsReport(req: Request, res: Response) {
    try {
      const { platformId } = req.params;
      const platform = await storage.getPlatform(parseInt(platformId));
      
      if (!platform) {
        return res.status(404).json({ success: false, message: "Platform not found" });
      }
      
      const { apiKey, developerApiKey, clerk } = this.getCredentials(platform);
      
      if (!apiKey || !developerApiKey || !clerk) {
        // For demo purposes, we'll continue with empty credentials to show mock data
      }
      
      const period = req.query.period as string || 'last30days';
      
      const clickbankService = new ClickBankApiService(
        apiKey || "demo-api-key", 
        developerApiKey || "demo-developer-key", 
        clerk || "demo-clerk"
      );
      
      const earningsReport = await clickbankService.getEarningsReport(period);
      
      return res.json(earningsReport);
    } catch (error) {
      console.error("ClickBank get earnings report error:", error);
      return res.status(500).json({ 
        success: false, 
        message: "An error occurred while fetching ClickBank earnings report" 
      });
    }
  }

  /**
   * Get top performing products
   */
  static async getTopProducts(req: Request, res: Response) {
    try {
      const { platformId } = req.params;
      const platform = await storage.getPlatform(parseInt(platformId));
      
      if (!platform) {
        return res.status(404).json({ success: false, message: "Platform not found" });
      }
      
      const { apiKey, developerApiKey, clerk } = this.getCredentials(platform);
      
      if (!apiKey || !developerApiKey || !clerk) {
        // For demo purposes, we'll continue with empty credentials to show mock data
      }
      
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      
      const clickbankService = new ClickBankApiService(
        apiKey || "demo-api-key", 
        developerApiKey || "demo-developer-key", 
        clerk || "demo-clerk"
      );
      
      const topProducts = await clickbankService.getTopProducts(limit);
      
      return res.json(topProducts);
    } catch (error) {
      console.error("ClickBank get top products error:", error);
      return res.status(500).json({ 
        success: false, 
        message: "An error occurred while fetching ClickBank top products" 
      });
    }
  }
}