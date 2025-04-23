import { storage } from "../storage";
import { User } from "@shared/schema";

export class AdminController {
  // Check if a user is authorized as admin
  async isAuthorizedAdmin(userId: number): Promise<boolean> {
    // Get the user
    const user = await storage.getUser(userId);
    if (!user) return false;
    
    // Get the admin email from platform settings
    const adminEmail = await storage.getPlatformSetting("admin_email");
    if (!adminEmail) return false;
    
    // Check if the user's email matches the admin email
    return user.email === adminEmail;
  }
  
  // Get a list of all users
  async getAllUsers(): Promise<Partial<User>[]> {
    // This implementation would depend on adding a method to the storage interface
    // For now, we'll return a placeholder
    // In a real implementation, you would add a method to the DatabaseStorage class
    
    return []; // Placeholder for actual implementation
  }
  
  // Get a user's subscription status
  async getUserSubscriptionStatus(userId: number): Promise<any> {
    const user = await storage.getUser(userId);
    if (!user) {
      throw new Error("User not found");
    }
    
    const subscription = await storage.getUserActiveSubscription(userId);
    
    return {
      userId: user.id,
      email: user.email,
      username: user.username,
      status: user.subscriptionStatus || "none",
      plan: user.subscriptionPlan || null,
      startDate: user.subscriptionStartDate || null,
      endDate: user.subscriptionEndDate || null,
      trialUsed: user.trialUsed || false,
      subscription
    };
  }
  
  // Update user's subscription status (admin privilege)
  async updateUserSubscription(userId: number, data: any): Promise<any> {
    const user = await storage.getUser(userId);
    if (!user) {
      throw new Error("User not found");
    }
    
    // Update the user's subscription fields
    const updatedUser = await storage.updateUser(userId, {
      subscriptionStatus: data.status,
      subscriptionPlan: data.plan,
      subscriptionStartDate: data.startDate ? new Date(data.startDate) : undefined,
      subscriptionEndDate: data.endDate ? new Date(data.endDate) : undefined,
      trialUsed: data.trialUsed !== undefined ? data.trialUsed : user.trialUsed,
      commissionRate: data.commissionRate ? data.commissionRate : user.commissionRate,
      maxWorkflows: data.maxWorkflows ? data.maxWorkflows : user.maxWorkflows,
    });
    
    // If the user has an active subscription and we're cancelling or modifying it
    if (user.subscriptionStatus === "active" && data.status !== "active") {
      const activeSubscription = await storage.getUserActiveSubscription(userId);
      if (activeSubscription) {
        await storage.updateSubscription(activeSubscription.id, {
          status: data.status,
          endDate: data.endDate ? new Date(data.endDate) : new Date()
        });
      }
    }
    
    // If we're creating a new subscription
    if ((user.subscriptionStatus !== "active" && data.status === "active") || 
        (data.status === "active" && data.createNewSubscription)) {
      
      const plan = await storage.getSubscriptionPlanByName(data.plan);
      if (!plan) {
        throw new Error("Invalid subscription plan");
      }
      
      // Create a new subscription record
      await storage.createSubscription({
        userId,
        status: data.status,
        plan: data.plan,
        amount: plan.price.toString(),
        startDate: data.startDate ? new Date(data.startDate) : new Date(),
        endDate: data.endDate ? new Date(data.endDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Default to 30 days
        stripeSubscriptionId: null,
        paymentMethodId: null
      });
    }
    
    return updatedUser;
  }
  
  // Get platform settings
  async getPlatformSettings(): Promise<Record<string, string>> {
    // Get commission rate
    const commissionRate = await storage.getPlatformSetting("default_commission_rate");
    
    // Get trial period days
    const trialPeriodDays = await storage.getPlatformSetting("trial_period_days");
    
    // Get admin email
    const adminEmail = await storage.getPlatformSetting("admin_email");
    
    return {
      commissionRate: commissionRate || "20",
      trialPeriodDays: trialPeriodDays || "3",
      adminEmail: adminEmail || "mousa.baek90@gmail.com"
    };
  }
  
  // Update platform settings
  async updatePlatformSettings(settings: Record<string, string>): Promise<Record<string, string>> {
    const result: Record<string, string> = {};
    
    // Update each setting
    for (const [key, value] of Object.entries(settings)) {
      const setting = await storage.setPlatformSetting(key, value);
      result[key] = setting.value;
    }
    
    return result;
  }
}