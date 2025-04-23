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
} from "@shared/schema";

// Interface for storage operations
export interface IStorage {
  // Platform operations
  getPlatforms(): Promise<Platform[]>;
  getPlatform(id: number): Promise<Platform | undefined>;
  getPlatformByName(name: string): Promise<Platform | undefined>;
  createPlatform(platform: InsertPlatform): Promise<Platform>;
  updatePlatform(id: number, data: Partial<Platform>): Promise<Platform | undefined>;
  deletePlatform(id: number): Promise<boolean>;

  // Workflow operations
  getWorkflows(): Promise<Workflow[]>;
  getWorkflow(id: number): Promise<Workflow | undefined>;
  getWorkflowsByPlatform(platformId: number): Promise<Workflow[]>;
  createWorkflow(workflow: InsertWorkflow): Promise<Workflow>;
  updateWorkflow(id: number, data: Partial<Workflow>): Promise<Workflow | undefined>;
  deleteWorkflow(id: number): Promise<boolean>;

  // Task operations
  getTasks(filters?: { workflowId?: number, platformId?: number, status?: string }): Promise<Task[]>;
  getTask(id: number): Promise<Task | undefined>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: number, data: Partial<Task>): Promise<Task | undefined>;
  deleteTask(id: number): Promise<boolean>;

  // Activity operations
  getActivities(limit?: number): Promise<Activity[]>;
  createActivity(activity: InsertActivity): Promise<Activity>;
  
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByGoogleId(googleId: string): Promise<User | undefined>;
  getUserByGithubId(githubId: string): Promise<User | undefined>;
  getUserByAppleId(appleId: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, data: Partial<User>): Promise<User | undefined>;
  updateStripeCustomerId(id: number, customerId: string): Promise<User | undefined>;

  // Payment operations
  getUserBalance(userId: number): Promise<number>;
  getUserPendingEarnings(userId: number): Promise<number>;
  updateUserBalance(userId: number, balance: number): Promise<User | undefined>;
  getUserDailyWithdrawals(userId: number): Promise<Withdrawal[]>;
  getUserTotalEarnings(userId: number): Promise<number>;
  getUserPlatformFees(userId: number): Promise<number>;
  getUserPlatformEarnings(userId: number): Promise<PlatformEarning[]>;

  // Withdrawal operations
  createWithdrawal(withdrawal: InsertWithdrawal): Promise<Withdrawal>;
  getWithdrawal(id: number): Promise<Withdrawal | undefined>;
  getUserWithdrawals(userId: number): Promise<Withdrawal[]>;
  updateWithdrawal(id: number, data: Partial<Withdrawal>): Promise<Withdrawal | undefined>;

  // Payment methods operations
  getUserPaymentMethods(userId: number): Promise<PaymentMethod[]>;
  getPaymentMethod(id: number): Promise<PaymentMethod | undefined>;
  createPaymentMethod(method: InsertPaymentMethod): Promise<PaymentMethod>;
  updatePaymentMethod(id: number, data: Partial<PaymentMethod>): Promise<PaymentMethod | undefined>;
  deletePaymentMethod(id: number): Promise<boolean>;

  // Earnings operations
  recordPlatformEarning(earning: InsertPlatformEarning): Promise<PlatformEarning>;
}

// In-memory storage implementation
export class MemStorage implements IStorage {
  private platforms: Map<number, Platform>;
  private workflows: Map<number, Workflow>;
  private tasks: Map<number, Task>;
  private activities: Map<number, Activity>;
  
  private platformId: number;
  private workflowId: number;
  private taskId: number;
  private activityId: number;

  constructor() {
    this.platforms = new Map();
    this.workflows = new Map();
    this.tasks = new Map();
    this.activities = new Map();
    
    this.platformId = 1;
    this.workflowId = 1;
    this.taskId = 1;
    this.activityId = 1;
    
    // Adding some initial data for demo purposes
    this.setupInitialData();
  }

  // Platform operations
  async getPlatforms(): Promise<Platform[]> {
    return Array.from(this.platforms.values());
  }

  async getPlatform(id: number): Promise<Platform | undefined> {
    return this.platforms.get(id);
  }

  async getPlatformByName(name: string): Promise<Platform | undefined> {
    return Array.from(this.platforms.values()).find(
      (platform) => platform.name.toLowerCase() === name.toLowerCase()
    );
  }

  async createPlatform(platform: InsertPlatform): Promise<Platform> {
    const id = this.platformId++;
    const newPlatform: Platform = { ...platform, id };
    this.platforms.set(id, newPlatform);
    return newPlatform;
  }

  async updatePlatform(id: number, data: Partial<Platform>): Promise<Platform | undefined> {
    const platform = this.platforms.get(id);
    if (!platform) return undefined;
    
    const updatedPlatform = { ...platform, ...data };
    this.platforms.set(id, updatedPlatform);
    return updatedPlatform;
  }

  async deletePlatform(id: number): Promise<boolean> {
    return this.platforms.delete(id);
  }

  // Workflow operations
  async getWorkflows(): Promise<Workflow[]> {
    return Array.from(this.workflows.values());
  }

  async getWorkflow(id: number): Promise<Workflow | undefined> {
    return this.workflows.get(id);
  }

  async getWorkflowsByPlatform(platformId: number): Promise<Workflow[]> {
    return Array.from(this.workflows.values()).filter(
      (workflow) => workflow.platformId === platformId
    );
  }

  async createWorkflow(workflow: InsertWorkflow): Promise<Workflow> {
    const id = this.workflowId++;
    const newWorkflow: Workflow = { ...workflow, id };
    this.workflows.set(id, newWorkflow);
    return newWorkflow;
  }

  async updateWorkflow(id: number, data: Partial<Workflow>): Promise<Workflow | undefined> {
    const workflow = this.workflows.get(id);
    if (!workflow) return undefined;
    
    const updatedWorkflow = { ...workflow, ...data };
    this.workflows.set(id, updatedWorkflow);
    return updatedWorkflow;
  }

  async deleteWorkflow(id: number): Promise<boolean> {
    return this.workflows.delete(id);
  }

  // Task operations
  async getTasks(filters?: { workflowId?: number, platformId?: number, status?: string }): Promise<Task[]> {
    let tasks = Array.from(this.tasks.values());
    
    if (filters) {
      if (filters.workflowId !== undefined) {
        tasks = tasks.filter(task => task.workflowId === filters.workflowId);
      }
      
      if (filters.platformId !== undefined) {
        tasks = tasks.filter(task => task.platformId === filters.platformId);
      }
      
      if (filters.status !== undefined) {
        tasks = tasks.filter(task => task.status === filters.status);
      }
    }
    
    return tasks;
  }

  async getTask(id: number): Promise<Task | undefined> {
    return this.tasks.get(id);
  }

  async createTask(task: InsertTask): Promise<Task> {
    const id = this.taskId++;
    const now = new Date();
    const newTask: Task = { 
      ...task, 
      id, 
      createdAt: now, 
      updatedAt: now 
    };
    this.tasks.set(id, newTask);
    return newTask;
  }

  async updateTask(id: number, data: Partial<Task>): Promise<Task | undefined> {
    const task = this.tasks.get(id);
    if (!task) return undefined;
    
    const updatedTask = { 
      ...task, 
      ...data, 
      updatedAt: new Date() 
    };
    this.tasks.set(id, updatedTask);
    return updatedTask;
  }

  async deleteTask(id: number): Promise<boolean> {
    return this.tasks.delete(id);
  }

  // Activity operations
  async getActivities(limit: number = 10): Promise<Activity[]> {
    const activities = Array.from(this.activities.values());
    activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    return activities.slice(0, limit);
  }

  async createActivity(activity: InsertActivity): Promise<Activity> {
    const id = this.activityId++;
    const newActivity: Activity = { 
      ...activity, 
      id, 
      timestamp: new Date() 
    };
    this.activities.set(id, newActivity);
    return newActivity;
  }

  // Setup initial demo data
  private setupInitialData() {
    // Create platforms
    const clickbank = this.createPlatform({
      name: "Clickbank",
      type: "affiliate",
      apiKey: "demo_clickbank_key",
      apiSecret: "demo_clickbank_secret",
      status: "connected",
      healthStatus: "healthy",
      lastSynced: new Date(),
      settings: {}
    });

    const fiverr = this.createPlatform({
      name: "Fiverr",
      type: "freelance",
      apiKey: "demo_fiverr_key",
      status: "connected",
      healthStatus: "healthy",
      lastSynced: new Date(),
      settings: {}
    });

    const upwork = this.createPlatform({
      name: "Upwork",
      type: "freelance",
      apiKey: "demo_upwork_key",
      status: "connected",
      healthStatus: "warning",
      lastSynced: new Date(Date.now() - 3600000),
      settings: {}
    });

    // Let promises resolve and get the created platforms
    Promise.all([clickbank, fiverr, upwork]).then(([cbPlatform, fvPlatform, upPlatform]) => {
      // Create workflows
      this.createWorkflow({
        name: "Clickbank Product Finder",
        status: "active",
        steps: [
          { type: "trigger", config: { platform: "clickbank", event: "new_product" } },
          { type: "filter", config: { field: "category", value: "e-business" } },
          { type: "action", config: { type: "notify", channel: "email" } }
        ],
        platformId: cbPlatform.id,
        lastRun: new Date(Date.now() - 30 * 60000),
        nextRun: new Date(Date.now() + 60 * 60000),
        successRate: 98,
        revenue: 124500,
        stats: { runs: 156, successes: 153, failures: 3 }
      });

      this.createWorkflow({
        name: "Fiverr Job Applicator",
        status: "active",
        steps: [
          { type: "trigger", config: { platform: "fiverr", event: "new_job" } },
          { type: "filter", config: { field: "category", value: "web_development" } },
          { type: "action", config: { type: "apply", template: "web_expert" } }
        ],
        platformId: fvPlatform.id,
        lastRun: new Date(Date.now() - 120 * 60000),
        nextRun: new Date(Date.now() + 30 * 60000),
        successRate: 92,
        revenue: 0,
        stats: { runs: 74, successes: 68, failures: 6 }
      });

      this.createWorkflow({
        name: "Upwork Proposal Sender",
        status: "active",
        steps: [
          { type: "trigger", config: { platform: "upwork", event: "new_job" } },
          { type: "filter", config: { field: "hourly_rate", value: 50, operator: ">=" } },
          { type: "action", config: { type: "submit", template: "expert_profile" } }
        ],
        platformId: upPlatform.id,
        lastRun: new Date(Date.now() - 24 * 3600000),
        nextRun: new Date(Date.now() + 15 * 60000),
        successRate: 78,
        revenue: 98250,
        stats: { runs: 32, successes: 25, failures: 7 }
      });

      this.createWorkflow({
        name: "Clickbank Affiliate Connector",
        status: "error",
        steps: [
          { type: "trigger", config: { platform: "clickbank", event: "new_affiliate" } },
          { type: "action", config: { type: "connect" } }
        ],
        platformId: cbPlatform.id,
        lastRun: new Date(Date.now() - 5 * 3600000),
        nextRun: null,
        successRate: 0,
        revenue: 0,
        stats: { runs: 5, successes: 0, failures: 5 }
      });

      // Create some sample activities
      this.createActivity({
        workflowId: 2,
        platformId: fvPlatform.id,
        type: "success",
        title: "Fiverr job application successful",
        description: "Applied to \"WordPress Developer Needed\" using template \"WordPress Expert\".",
        data: { jobId: "fv123456" }
      });

      this.createActivity({
        workflowId: 3,
        platformId: upPlatform.id,
        type: "warning",
        title: "Upwork rate limit warning",
        description: "API rate limit at 85%. Consider reducing request frequency.",
        data: { rateLimit: 85 }
      });

      this.createActivity({
        workflowId: 4,
        platformId: cbPlatform.id,
        type: "error",
        title: "Clickbank API authentication failed",
        description: "Invalid API credentials. Please check your API key and secret.",
        data: { errorCode: "AUTH_FAILED" }
      });

      this.createActivity({
        workflowId: 1,
        platformId: cbPlatform.id,
        type: "revenue",
        title: "Clickbank commission received",
        description: "Received $124.50 commission for product \"Digital Marketing Pro\".",
        data: { amount: 12450, product: "Digital Marketing Pro" }
      });

      this.createActivity({
        type: "system",
        title: "New workflow created",
        description: "Created new workflow \"Fiverr Job Finder\" with 3 steps.",
        data: { workflowId: 5 }
      });
    });
  }
}

// For development/testing, you can switch between MemStorage and DatabaseStorage
import { DatabaseStorage } from './database-storage';
export const storage = new DatabaseStorage();
