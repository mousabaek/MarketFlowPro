import { db } from './db';
import { eq, and, gte, ne, desc, sql } from 'drizzle-orm';
import {
  platforms, Platform, InsertPlatform,
  workflows, Workflow, InsertWorkflow,
  tasks, Task, InsertTask,
  activities, Activity, InsertActivity,
  users, User, InsertUser,
  paymentMethods, PaymentMethod, InsertPaymentMethod,
  withdrawals, Withdrawal, InsertWithdrawal,
  transactions, InsertTransaction,
  platformEarnings, PlatformEarning, InsertPlatformEarning,
  subscriptions, Subscription, InsertSubscription,
  subscriptionPlans, SubscriptionPlan, InsertSubscriptionPlan,
  platformSettings, PlatformSetting, InsertPlatformSetting
} from '@shared/schema';
import { IStorage } from './storage';

export class DatabaseStorage implements IStorage {
  async getPlatforms(): Promise<Platform[]> {
    return await db.select().from(platforms);
  }

  async getPlatform(id: number): Promise<Platform | undefined> {
    const [platform] = await db.select().from(platforms).where(eq(platforms.id, id));
    return platform;
  }

  async getPlatformByName(name: string): Promise<Platform | undefined> {
    const [platform] = await db.select().from(platforms).where(eq(platforms.name, name));
    return platform;
  }

  async createPlatform(platform: InsertPlatform): Promise<Platform> {
    const [newPlatform] = await db.insert(platforms).values(platform).returning();
    return newPlatform;
  }

  async updatePlatform(id: number, data: Partial<Platform>): Promise<Platform | undefined> {
    const [updatedPlatform] = await db
      .update(platforms)
      .set(data)
      .where(eq(platforms.id, id))
      .returning();
    return updatedPlatform;
  }

  async deletePlatform(id: number): Promise<boolean> {
    const result = await db.delete(platforms).where(eq(platforms.id, id));
    return result.rowCount > 0;
  }

  async getWorkflows(): Promise<Workflow[]> {
    return await db.select().from(workflows);
  }

  async getWorkflow(id: number): Promise<Workflow | undefined> {
    const [workflow] = await db.select().from(workflows).where(eq(workflows.id, id));
    return workflow;
  }

  async getWorkflowsByPlatform(platformId: number): Promise<Workflow[]> {
    return await db.select().from(workflows).where(eq(workflows.platformId, platformId));
  }

  async createWorkflow(workflow: InsertWorkflow): Promise<Workflow> {
    const [newWorkflow] = await db.insert(workflows).values(workflow).returning();
    return newWorkflow;
  }

  async updateWorkflow(id: number, data: Partial<Workflow>): Promise<Workflow | undefined> {
    const [updatedWorkflow] = await db
      .update(workflows)
      .set(data)
      .where(eq(workflows.id, id))
      .returning();
    return updatedWorkflow;
  }

  async deleteWorkflow(id: number): Promise<boolean> {
    const result = await db.delete(workflows).where(eq(workflows.id, id));
    return result.rowCount > 0;
  }

  async getTasks(filters?: { workflowId?: number, platformId?: number, status?: string }): Promise<Task[]> {
    let query = db.select().from(tasks);
    
    if (filters) {
      if (filters.workflowId !== undefined) {
        query = query.where(eq(tasks.workflowId, filters.workflowId));
      }
      
      if (filters.platformId !== undefined) {
        query = query.where(eq(tasks.platformId, filters.platformId));
      }
      
      if (filters.status !== undefined) {
        query = query.where(eq(tasks.status, filters.status));
      }
    }
    
    return await query;
  }

  async getTask(id: number): Promise<Task | undefined> {
    const [task] = await db.select().from(tasks).where(eq(tasks.id, id));
    return task;
  }

  async createTask(task: InsertTask): Promise<Task> {
    const [newTask] = await db.insert(tasks).values(task).returning();
    return newTask;
  }

  async updateTask(id: number, data: Partial<Task>): Promise<Task | undefined> {
    const [updatedTask] = await db
      .update(tasks)
      .set(data)
      .where(eq(tasks.id, id))
      .returning();
    return updatedTask;
  }

  async deleteTask(id: number): Promise<boolean> {
    const result = await db.delete(tasks).where(eq(tasks.id, id));
    return result.rowCount > 0;
  }

  async getActivities(limit: number = 10): Promise<Activity[]> {
    return await db
      .select()
      .from(activities)
      .orderBy(desc(activities.timestamp))
      .limit(limit);
  }

  async createActivity(activity: InsertActivity): Promise<Activity> {
    const [newActivity] = await db.insert(activities).values(activity).returning();
    return newActivity;
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async getUserByGoogleId(googleId: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.googleId, googleId));
    return user;
  }

  async getUserByGithubId(githubId: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.githubId, githubId));
    return user;
  }

  async getUserByAppleId(appleId: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.appleId, appleId));
    return user;
  }

  async createUser(user: InsertUser): Promise<User> {
    const [newUser] = await db.insert(users).values({
      ...user,
      provider: user.provider || "local"
    }).returning();
    return newUser;
  }

  async updateUser(id: number, data: Partial<User>): Promise<User | undefined> {
    const [updatedUser] = await db.update(users).set(data).where(eq(users.id, id)).returning();
    return updatedUser;
  }

  async updateStripeCustomerId(id: number, customerId: string): Promise<User | undefined> {
    const [updatedUser] = await db
      .update(users)
      .set({ stripeCustomerId: customerId })
      .where(eq(users.id, id))
      .returning();
    return updatedUser;
  }

  // Payment operations
  async getUserBalance(userId: number): Promise<number> {
    const [user] = await db.select({ balance: users.balance }).from(users).where(eq(users.id, userId));
    return user ? parseFloat(user.balance.toString()) : 0;
  }

  async getUserPendingEarnings(userId: number): Promise<number> {
    const [user] = await db.select({ pendingBalance: users.pendingBalance }).from(users).where(eq(users.id, userId));
    return user ? parseFloat(user.pendingBalance.toString()) : 0;
  }

  async updateUserBalance(userId: number, balance: number): Promise<User | undefined> {
    const [updatedUser] = await db
      .update(users)
      .set({ balance: balance.toString(), updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();
    return updatedUser;
  }

  async getUserDailyWithdrawals(userId: number): Promise<Withdrawal[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return await db
      .select()
      .from(withdrawals)
      .where(
        and(
          eq(withdrawals.userId, userId),
          gte(withdrawals.requestedAt, today)
        )
      );
  }

  async getUserTotalEarnings(userId: number): Promise<number> {
    const result = await db
      .select({ 
        total: sql`SUM(${transactions.amount})` 
      })
      .from(transactions)
      .where(
        and(
          eq(transactions.userId, userId),
          eq(transactions.type, "commission"),
          eq(transactions.status, "complete")
        )
      );
    
    return result[0]?.total ? parseFloat(result[0].total.toString()) : 0;
  }

  async getUserPlatformFees(userId: number): Promise<number> {
    const result = await db
      .select({ 
        total: sql`SUM(${transactions.amount})` 
      })
      .from(transactions)
      .where(
        and(
          eq(transactions.userId, userId),
          eq(transactions.type, "fee"),
          eq(transactions.status, "complete")
        )
      );
    
    return result[0]?.total ? parseFloat(result[0].total.toString()) : 0;
  }

  async getUserPlatformEarnings(userId: number): Promise<PlatformEarning[]> {
    return await db
      .select()
      .from(platformEarnings)
      .where(
        and(
          eq(platformEarnings.userId, userId),
          eq(platformEarnings.period, "all_time")
        )
      );
  }

  // Withdrawal operations
  async createWithdrawal(withdrawal: InsertWithdrawal): Promise<Withdrawal> {
    const [newWithdrawal] = await db.insert(withdrawals).values({
      ...withdrawal,
      netAmount: (parseFloat(withdrawal.amount.toString()) - parseFloat(withdrawal.platformFee.toString())).toString()
    }).returning();
    
    // Also create a transaction record for the withdrawal
    await db.insert(transactions).values({
      userId: withdrawal.userId,
      type: "withdrawal",
      amount: withdrawal.amount.toString(),
      withdrawalId: newWithdrawal.id,
      description: `Withdrawal via ${withdrawal.paymentMethod}`,
      status: "pending"
    });
    
    return newWithdrawal;
  }

  async getWithdrawal(id: number): Promise<Withdrawal | undefined> {
    const [withdrawal] = await db.select().from(withdrawals).where(eq(withdrawals.id, id));
    return withdrawal;
  }

  async getUserWithdrawals(userId: number): Promise<Withdrawal[]> {
    return await db
      .select()
      .from(withdrawals)
      .where(eq(withdrawals.userId, userId))
      .orderBy(desc(withdrawals.requestedAt));
  }

  async updateWithdrawal(id: number, data: Partial<Withdrawal>): Promise<Withdrawal | undefined> {
    const [updatedWithdrawal] = await db
      .update(withdrawals)
      .set(data)
      .where(eq(withdrawals.id, id))
      .returning();
    
    // Also update the corresponding transaction if status changed
    if (data.status) {
      await db
        .update(transactions)
        .set({ status: data.status === "completed" ? "complete" : data.status })
        .where(eq(transactions.withdrawalId, id));
    }
    
    return updatedWithdrawal;
  }

  // Payment methods operations
  async getUserPaymentMethods(userId: number): Promise<PaymentMethod[]> {
    return await db
      .select()
      .from(paymentMethods)
      .where(eq(paymentMethods.userId, userId));
  }

  async getPaymentMethod(id: number): Promise<PaymentMethod | undefined> {
    const [method] = await db.select().from(paymentMethods).where(eq(paymentMethods.id, id));
    return method;
  }

  async createPaymentMethod(method: InsertPaymentMethod): Promise<PaymentMethod> {
    // If this is being set as default, clear other defaults first
    if (method.isDefault) {
      await db
        .update(paymentMethods)
        .set({ isDefault: false })
        .where(
          and(
            eq(paymentMethods.userId, method.userId),
            eq(paymentMethods.type, method.type)
          )
        );
    }
    
    const [newMethod] = await db.insert(paymentMethods).values(method).returning();
    return newMethod;
  }

  async updatePaymentMethod(id: number, data: Partial<PaymentMethod>): Promise<PaymentMethod | undefined> {
    // If this is being set as default, clear other defaults first
    if (data.isDefault) {
      const method = await this.getPaymentMethod(id);
      if (method) {
        await db
          .update(paymentMethods)
          .set({ isDefault: false })
          .where(
            and(
              eq(paymentMethods.userId, method.userId),
              eq(paymentMethods.type, method.type),
              ne(paymentMethods.id, id)
            )
          );
      }
    }
    
    const [updatedMethod] = await db
      .update(paymentMethods)
      .set({
        ...data,
        updatedAt: new Date()
      })
      .where(eq(paymentMethods.id, id))
      .returning();
    
    return updatedMethod;
  }

  async deletePaymentMethod(id: number): Promise<boolean> {
    const result = await db.delete(paymentMethods).where(eq(paymentMethods.id, id));
    return result.rowCount > 0;
  }

  // Earnings operations
  async recordPlatformEarning(earning: InsertPlatformEarning): Promise<PlatformEarning> {
    // Check if there's an existing record for this platform and period
    const [existingEarning] = await db
      .select()
      .from(platformEarnings)
      .where(
        and(
          eq(platformEarnings.userId, earning.userId),
          eq(platformEarnings.platformId, earning.platformId),
          eq(platformEarnings.period, earning.period),
          eq(platformEarnings.date, earning.date)
        )
      );
    
    if (existingEarning) {
      // Update existing record
      const existingAmount = existingEarning.amount ? parseFloat(existingEarning.amount.toString()) : 0;
      const earningAmount = earning.amount ? parseFloat(earning.amount.toString()) : 0;
      const newAmount = existingAmount + earningAmount;
      
      const existingCommissions = existingEarning.commissions ? parseFloat(existingEarning.commissions.toString()) : 0;
      const earningCommissions = earning.commissions ? parseFloat(earning.commissions.toString()) : 0;
      const newCommissions = existingCommissions + earningCommissions;
      
      const [updatedEarning] = await db
        .update(platformEarnings)
        .set({
          amount: newAmount.toString(),
          commissions: newCommissions.toString(),
          updatedAt: new Date()
        })
        .where(eq(platformEarnings.id, existingEarning.id))
        .returning();
      
      return updatedEarning;
    } else {
      // Create new record
      const [newEarning] = await db.insert(platformEarnings).values(earning).returning();
      return newEarning;
    }
  }

  // Subscription operations
  async getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
    return await db.select().from(subscriptionPlans).where(eq(subscriptionPlans.isActive, true));
  }

  async getSubscriptionPlan(id: number): Promise<SubscriptionPlan | undefined> {
    const [plan] = await db.select().from(subscriptionPlans).where(eq(subscriptionPlans.id, id));
    return plan;
  }

  async getSubscriptionPlanByName(name: string): Promise<SubscriptionPlan | undefined> {
    const [plan] = await db.select().from(subscriptionPlans).where(eq(subscriptionPlans.name, name));
    return plan;
  }

  async getUserSubscription(userId: number): Promise<Subscription | undefined> {
    const [subscription] = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.userId, userId))
      .orderBy(desc(subscriptions.id))
      .limit(1);
    
    return subscription;
  }

  async getUserActiveSubscription(userId: number): Promise<Subscription | undefined> {
    const now = new Date();
    
    const [subscription] = await db
      .select()
      .from(subscriptions)
      .where(
        and(
          eq(subscriptions.userId, userId),
          eq(subscriptions.status, "active"),
          gte(subscriptions.endDate, now)
        )
      )
      .orderBy(desc(subscriptions.id))
      .limit(1);
    
    return subscription;
  }

  async createSubscription(subscription: InsertSubscription): Promise<Subscription> {
    // Update user's subscription status
    await db
      .update(users)
      .set({
        subscriptionStatus: subscription.status,
        subscriptionPlan: subscription.plan,
        subscriptionStartDate: subscription.startDate,
        subscriptionEndDate: subscription.endDate,
        updatedAt: new Date()
      })
      .where(eq(users.id, subscription.userId));
    
    // Create the subscription record
    const [newSubscription] = await db.insert(subscriptions).values(subscription).returning();
    
    // If this is a trial, update the user's trial status
    if (subscription.status === "trial") {
      await db
        .update(users)
        .set({ trialUsed: true })
        .where(eq(users.id, subscription.userId));
    }
    
    return newSubscription;
  }

  async updateSubscription(id: number, data: Partial<Subscription>): Promise<Subscription | undefined> {
    const [updatedSubscription] = await db
      .update(subscriptions)
      .set(data)
      .where(eq(subscriptions.id, id))
      .returning();
    
    // If status or dates were updated, sync with user record
    if (data.status || data.startDate || data.endDate) {
      const subscription = updatedSubscription || await this.getSubscription(id);
      if (subscription) {
        await db
          .update(users)
          .set({
            subscriptionStatus: data.status || subscription.status,
            subscriptionStartDate: data.startDate || subscription.startDate,
            subscriptionEndDate: data.endDate || subscription.endDate,
            updatedAt: new Date()
          })
          .where(eq(users.id, subscription.userId));
      }
    }
    
    return updatedSubscription;
  }

  async getSubscription(id: number): Promise<Subscription | undefined> {
    const [subscription] = await db.select().from(subscriptions).where(eq(subscriptions.id, id));
    return subscription;
  }

  async cancelUserSubscription(userId: number): Promise<Subscription | undefined> {
    // Find active subscription
    const subscription = await this.getUserActiveSubscription(userId);
    if (!subscription) return undefined;
    
    // Update subscription status to cancelled
    const [updatedSubscription] = await db
      .update(subscriptions)
      .set({
        status: "cancelled",
        updatedAt: new Date()
      })
      .where(eq(subscriptions.id, subscription.id))
      .returning();
    
    // Update user record
    await db
      .update(users)
      .set({
        subscriptionStatus: "cancelled",
        updatedAt: new Date()
      })
      .where(eq(users.id, userId));
    
    return updatedSubscription;
  }

  // Trial management
  async startUserTrial(userId: number): Promise<User | undefined> {
    // Get trial period days from settings
    const settingValue = await this.getPlatformSetting("trial_period_days");
    const trialDays = settingValue ? parseInt(settingValue) : 3; // Default to 3 days
    
    // Calculate start and end dates
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + trialDays);
    
    // Update user record
    const [updatedUser] = await db
      .update(users)
      .set({
        subscriptionStatus: "trial",
        subscriptionStartDate: startDate,
        subscriptionEndDate: endDate,
        trialUsed: true,
        updatedAt: new Date()
      })
      .where(eq(users.id, userId))
      .returning();
    
    // Create a trial subscription record
    await db.insert(subscriptions).values({
      userId,
      status: "trial",
      plan: "monthly_basic", // Default to monthly plan for trial
      amount: "0", // Free trial
      startDate,
      endDate,
      paymentMethodId: null,
      stripeSubscriptionId: null
    });
    
    return updatedUser;
  }

  // Platform settings
  async getPlatformSetting(key: string): Promise<string | undefined> {
    const [setting] = await db
      .select()
      .from(platformSettings)
      .where(eq(platformSettings.key, key));
    
    return setting?.value;
  }

  async setPlatformSetting(key: string, value: string, description?: string): Promise<PlatformSetting> {
    // Check if setting exists
    const [existingSetting] = await db
      .select()
      .from(platformSettings)
      .where(eq(platformSettings.key, key));
    
    if (existingSetting) {
      // Update existing setting
      const [updatedSetting] = await db
        .update(platformSettings)
        .set({
          value,
          description: description || existingSetting.description,
          updatedAt: new Date()
        })
        .where(eq(platformSettings.id, existingSetting.id))
        .returning();
      
      return updatedSetting;
    } else {
      // Create new setting
      const [newSetting] = await db
        .insert(platformSettings)
        .values({
          key,
          value,
          description
        })
        .returning();
      
      return newSetting;
    }
  }

  // Admin operations
  async isUserAdmin(userId: number): Promise<boolean> {
    const user = await this.getUser(userId);
    return user?.role === "admin";
  }

  async getAdminEmail(): Promise<string | undefined> {
    return await this.getPlatformSetting("admin_email");
  }
}