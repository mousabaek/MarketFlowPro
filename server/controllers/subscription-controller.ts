import { storage } from "../storage";
import { subscriptionRequestSchema, type InsertSubscription } from "@shared/schema";
import Stripe from "stripe";

// Initialize Stripe
if (!process.env.STRIPE_SECRET_KEY) {
  console.warn("Warning: STRIPE_SECRET_KEY not set. Stripe payments will not work.");
}

const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2023-10-16" })
  : null;

export class SubscriptionController {
  // Start a free trial for a user
  async startTrial(userId: number) {
    // Check if the user has already used their trial
    const user = await storage.getUser(userId);
    if (!user) {
      throw new Error("User not found");
    }

    if (user.trialUsed) {
      throw new Error("Free trial has already been used");
    }

    // Check if the user already has an active subscription
    const activeSubscription = await storage.getUserActiveSubscription(userId);
    if (activeSubscription) {
      throw new Error("User already has an active subscription");
    }

    // Start the trial
    const updatedUser = await storage.startUserTrial(userId);
    return updatedUser;
  }

  // Create a new subscription
  async createSubscription(userId: number, data: any) {
    // Validate the request
    const validatedData = subscriptionRequestSchema.parse(data);
    
    // Get the subscription plan
    const plan = await storage.getSubscriptionPlanByName(validatedData.plan);
    if (!plan) {
      throw new Error("Invalid subscription plan");
    }

    // Get the user
    const user = await storage.getUser(userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Check if the user already has an active subscription
    const activeSubscription = await storage.getUserActiveSubscription(userId);
    if (activeSubscription && activeSubscription.status === "active") {
      throw new Error("User already has an active subscription");
    }

    // Calculate subscription end date based on billing cycle
    const startDate = new Date();
    const endDate = new Date();
    if (plan.billingCycle === "monthly") {
      endDate.setMonth(endDate.getMonth() + 1);
    } else if (plan.billingCycle === "yearly") {
      endDate.setFullYear(endDate.getFullYear() + 1);
    } else {
      throw new Error("Invalid billing cycle");
    }

    // If we have Stripe, create a Stripe subscription
    let stripeSubscriptionId = null;
    if (stripe && user.stripeCustomerId) {
      try {
        // Create or retrieve a Stripe customer
        let customerId = user.stripeCustomerId;
        
        if (!customerId) {
          const customer = await stripe.customers.create({
            email: user.email,
            name: `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.username,
          });
          
          customerId = customer.id;
          await storage.updateStripeCustomerId(userId, customerId);
        }
        
        // Create a subscription in Stripe
        const stripeSubscription = await stripe.subscriptions.create({
          customer: customerId,
          items: [
            {
              price_data: {
                currency: "usd",
                product_data: {
                  name: plan.displayName,
                  description: `${plan.displayName} subscription (${plan.billingCycle})`,
                },
                unit_amount: Math.round(parseFloat(plan.price.toString()) * 100),
                recurring: {
                  interval: plan.billingCycle === "monthly" ? "month" : "year",
                },
              },
            },
          ],
        });
        
        stripeSubscriptionId = stripeSubscription.id;
      } catch (error) {
        console.error("Stripe subscription creation failed:", error);
        throw new Error("Payment processing failed");
      }
    }

    // Determine max workflows based on plan
    const maxWorkflows = plan.maxWorkflows;
    
    // Update user record with subscription info and workflow limits
    await storage.updateUser(userId, {
      subscriptionStatus: "active",
      subscriptionPlan: validatedData.plan,
      subscriptionStartDate: startDate,
      subscriptionEndDate: endDate,
      maxWorkflows
    });

    // Create a subscription record
    const subscriptionData: InsertSubscription = {
      userId,
      status: "active",
      plan: validatedData.plan,
      amount: plan.price.toString(),
      startDate,
      endDate,
      stripeSubscriptionId,
      paymentMethodId: validatedData.paymentMethodId || null
    };

    const subscription = await storage.createSubscription(subscriptionData);
    return subscription;
  }

  // Cancel a subscription
  async cancelSubscription(userId: number) {
    // Get the active subscription
    const subscription = await storage.getUserActiveSubscription(userId);
    if (!subscription) {
      throw new Error("No active subscription found");
    }

    // If using Stripe, cancel the Stripe subscription
    if (stripe && subscription.stripeSubscriptionId) {
      try {
        await stripe.subscriptions.cancel(subscription.stripeSubscriptionId);
      } catch (error) {
        console.error("Stripe subscription cancellation failed:", error);
        // Continue with local cancellation even if Stripe fails
      }
    }

    // Cancel the subscription in our database
    const updatedSubscription = await storage.cancelUserSubscription(userId);
    return updatedSubscription;
  }

  // Check if a user is an admin
  async isUserAdmin(userId: number): Promise<boolean> {
    return await storage.isUserAdmin(userId);
  }

  // Get subscription plans
  async getSubscriptionPlans() {
    return await storage.getSubscriptionPlans();
  }

  // Get platform commission rate
  async getPlatformCommissionRate(): Promise<number> {
    const settingValue = await storage.getPlatformSetting("default_commission_rate");
    return settingValue ? parseFloat(settingValue) : 20; // Default to 20%
  }
}