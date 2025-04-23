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
  platformEarnings, PlatformEarning, InsertPlatformEarning
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
      const newAmount = parseFloat(existingEarning.amount.toString()) + parseFloat(earning.amount.toString());
      const newCommissions = parseFloat(existingEarning.commissions.toString()) + parseFloat(earning.commissions.toString());
      
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
}