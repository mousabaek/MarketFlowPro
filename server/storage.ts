import {
  User,
  InsertUser,
  Platform,
  InsertPlatform,
  Workflow,
  InsertWorkflow,
  Opportunity,
  InsertOpportunity,
  Statistics,
  InsertStatistics,
  Task,
  InsertTask,
  RevenueData,
  PlatformWithStats,
  WorkflowWithStats,
  OpportunityWithPlatform,
  StatisticsWithChange
} from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Platform operations
  getPlatforms(userId: number): Promise<Platform[]>;
  getPlatform(id: number): Promise<Platform | undefined>;
  createPlatform(platform: InsertPlatform): Promise<Platform>;
  updatePlatform(id: number, platform: Partial<Platform>): Promise<Platform | undefined>;
  deletePlatform(id: number): Promise<boolean>;
  getPlatformsWithStats(userId: number): Promise<PlatformWithStats[]>;

  // Workflow operations
  getWorkflows(userId: number): Promise<Workflow[]>;
  getWorkflow(id: number): Promise<Workflow | undefined>;
  createWorkflow(workflow: InsertWorkflow): Promise<Workflow>;
  updateWorkflow(id: number, workflow: Partial<Workflow>): Promise<Workflow | undefined>;
  deleteWorkflow(id: number): Promise<boolean>;
  getWorkflowsWithStats(userId: number): Promise<WorkflowWithStats[]>;

  // Opportunity operations
  getOpportunities(userId: number, limit?: number, offset?: number): Promise<Opportunity[]>;
  getOpportunity(id: number): Promise<Opportunity | undefined>;
  createOpportunity(opportunity: InsertOpportunity): Promise<Opportunity>;
  updateOpportunity(id: number, opportunity: Partial<Opportunity>): Promise<Opportunity | undefined>;
  deleteOpportunity(id: number): Promise<boolean>;
  getOpportunitiesWithPlatform(userId: number, limit?: number, offset?: number): Promise<OpportunityWithPlatform[]>;
  getOpportunitiesCount(userId: number): Promise<number>;

  // Statistics operations
  getStatistics(userId: number): Promise<Statistics | undefined>;
  updateStatistics(userId: number, statistics: Partial<InsertStatistics>): Promise<Statistics | undefined>;
  createStatistics(statistics: InsertStatistics): Promise<Statistics>;
  getStatisticsWithChange(userId: number): Promise<StatisticsWithChange | undefined>;
  getRevenueData(userId: number, period: 'week' | 'month' | 'year'): Promise<RevenueData[]>;

  // Task operations
  getTasks(userId: number): Promise<Task[]>;
  getTask(id: number): Promise<Task | undefined>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: number, task: Partial<Task>): Promise<Task | undefined>;
  deleteTask(id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private platforms: Map<number, Platform>;
  private workflows: Map<number, Workflow>;
  private opportunities: Map<number, Opportunity>;
  private statisticsStore: Map<number, Statistics>;
  private tasks: Map<number, Task>;
  
  private currentUserId: number;
  private currentPlatformId: number;
  private currentWorkflowId: number;
  private currentOpportunityId: number;
  private currentStatisticsId: number;
  private currentTaskId: number;

  constructor() {
    this.users = new Map();
    this.platforms = new Map();
    this.workflows = new Map();
    this.opportunities = new Map();
    this.statisticsStore = new Map();
    this.tasks = new Map();
    
    this.currentUserId = 1;
    this.currentPlatformId = 1;
    this.currentWorkflowId = 1;
    this.currentOpportunityId = 1;
    this.currentStatisticsId = 1;
    this.currentTaskId = 1;
    
    // Create default user
    this.createUser({
      username: "demo",
      password: "password",
      email: "demo@example.com",
      fullName: "John Smith"
    });
    
    // Create default platforms
    this.createPlatform({
      userId: 1,
      name: "Clickbank",
      type: "clickbank",
      apiKey: "cb_api_key",
      secretKey: "cb_secret_key",
      status: "connected",
      metadata: { icon: "CB" }
    });
    
    this.createPlatform({
      userId: 1,
      name: "Fiverr",
      type: "fiverr",
      apiKey: "fv_api_key",
      secretKey: "fv_secret_key",
      status: "connected",
      metadata: { icon: "FV" }
    });
    
    this.createPlatform({
      userId: 1,
      name: "Upwork",
      type: "upwork",
      apiKey: "uw_api_key",
      secretKey: "uw_secret_key",
      status: "error",
      metadata: { icon: "UW", errorMessage: "Authentication failed" }
    });
    
    // Create default workflows
    this.createWorkflow({
      userId: 1,
      name: "Clickbank Product Scanner",
      description: "Scans Clickbank marketplace for new products matching criteria and sends alerts.",
      platformId: 1,
      platformType: "clickbank",
      status: "active",
      config: {
        searchTerm: "digital marketing",
        categories: ["health", "fitness"],
        minCommission: 50
      },
      stats: {
        successfulRuns: "28/30",
        revenue: "$542",
        lastRun: "10 mins ago"
      }
    });
    
    this.createWorkflow({
      userId: 1,
      name: "Fiverr Order Automator",
      description: "Automatically responds to inquiries and manages orders for your Fiverr gigs.",
      platformId: 2,
      platformType: "fiverr",
      status: "active",
      config: {
        gigIds: ["FVG123", "FVG456"],
        responseTemplates: {
          inquiry: "Thank you for your interest!",
          confirmation: "I've received your order and will start right away."
        }
      },
      stats: {
        successfulRuns: "45/48",
        revenue: "$785",
        lastRun: "2 mins ago"
      }
    });
    
    this.createWorkflow({
      userId: 1,
      name: "Upwork Job Finder",
      description: "Scans Upwork for relevant job postings and sends proposals for matching opportunities.",
      platformId: 3,
      platformType: "upwork",
      status: "error",
      config: {
        keywords: ["React", "Node.js", "Fullstack"],
        hourlyRateRange: {
          min: 50,
          max: 100
        },
        proposalTemplate: "I'm interested in your project..."
      },
      stats: {
        successfulRuns: "18/25", 
        revenue: "$366",
        lastRun: "3 hours ago"
      }
    });
    
    // Create default opportunities
    this.createOpportunity({
      userId: 1,
      workflowId: 1,
      platformId: 1,
      platformType: "clickbank",
      title: "Digital Marketing Ebook",
      description: "Health & Fitness Category",
      value: "$42.50",
      status: "active",
      metadata: {
        commission: "75%",
        date: "Jun 12, 2023"
      }
    });
    
    this.createOpportunity({
      userId: 1,
      workflowId: 2,
      platformId: 2,
      platformType: "fiverr",
      title: "Logo Design Project",
      description: "Graphic Design",
      value: "$85.00",
      status: "pending",
      metadata: {
        priceType: "Fixed price",
        date: "Jun 10, 2023"
      }
    });
    
    this.createOpportunity({
      userId: 1,
      workflowId: 3,
      platformId: 3,
      platformType: "upwork",
      title: "Web Development Contract",
      description: "React.js Frontend",
      value: "$55.00/hr",
      status: "missed",
      metadata: {
        estimatedHours: "40 hours",
        date: "Jun 8, 2023"
      }
    });
    
    // Create statistics
    this.createStatistics({
      userId: 1,
      date: new Date(),
      activeWorkflows: 12,
      tasksCompleted: 384,
      revenue: "$2,456",
      opportunitiesFound: 67,
      platformStats: {
        clickbank: {
          activeTasks: 12,
          revenue: "$1,245",
          lastUpdate: "5 mins ago"
        },
        fiverr: {
          activeTasks: 8,
          revenue: "$845",
          lastUpdate: "12 mins ago"
        },
        upwork: {
          activeTasks: 5,
          revenue: "$366",
          lastUpdate: "3 hours ago"
        }
      }
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = {
      ...insertUser,
      id,
      createdAt: new Date()
    };
    this.users.set(id, user);
    return user;
  }

  // Platform operations
  async getPlatforms(userId: number): Promise<Platform[]> {
    return Array.from(this.platforms.values()).filter(
      platform => platform.userId === userId
    );
  }

  async getPlatform(id: number): Promise<Platform | undefined> {
    return this.platforms.get(id);
  }

  async createPlatform(insertPlatform: InsertPlatform): Promise<Platform> {
    const id = this.currentPlatformId++;
    const platform: Platform = {
      ...insertPlatform,
      id,
      lastUpdated: new Date(),
      createdAt: new Date()
    };
    this.platforms.set(id, platform);
    return platform;
  }

  async updatePlatform(id: number, platformUpdate: Partial<Platform>): Promise<Platform | undefined> {
    const platform = this.platforms.get(id);
    if (!platform) return undefined;
    
    const updatedPlatform = {
      ...platform,
      ...platformUpdate,
      lastUpdated: new Date()
    };
    
    this.platforms.set(id, updatedPlatform);
    return updatedPlatform;
  }

  async deletePlatform(id: number): Promise<boolean> {
    return this.platforms.delete(id);
  }

  async getPlatformsWithStats(userId: number): Promise<PlatformWithStats[]> {
    const platforms = await this.getPlatforms(userId);
    const stats = await this.getStatistics(userId);
    
    if (!stats || !stats.platformStats) return platforms;
    
    return platforms.map(platform => {
      const platformStats = (stats.platformStats as any)[platform.type];
      if (!platformStats) return platform;
      
      return {
        ...platform,
        activeTasks: platformStats.activeTasks,
        revenue: platformStats.revenue,
        lastUpdate: platformStats.lastUpdate
      };
    });
  }

  // Workflow operations
  async getWorkflows(userId: number): Promise<Workflow[]> {
    return Array.from(this.workflows.values()).filter(
      workflow => workflow.userId === userId
    );
  }

  async getWorkflow(id: number): Promise<Workflow | undefined> {
    return this.workflows.get(id);
  }

  async createWorkflow(insertWorkflow: InsertWorkflow): Promise<Workflow> {
    const id = this.currentWorkflowId++;
    const workflow: Workflow = {
      ...insertWorkflow,
      id,
      lastRun: null,
      createdAt: new Date()
    };
    this.workflows.set(id, workflow);
    return workflow;
  }

  async updateWorkflow(id: number, workflowUpdate: Partial<Workflow>): Promise<Workflow | undefined> {
    const workflow = this.workflows.get(id);
    if (!workflow) return undefined;
    
    const updatedWorkflow = {
      ...workflow,
      ...workflowUpdate
    };
    
    this.workflows.set(id, updatedWorkflow);
    return updatedWorkflow;
  }

  async deleteWorkflow(id: number): Promise<boolean> {
    return this.workflows.delete(id);
  }

  async getWorkflowsWithStats(userId: number): Promise<WorkflowWithStats[]> {
    const workflows = await this.getWorkflows(userId);
    
    return workflows.map(workflow => {
      const stats = workflow.stats as any;
      if (!stats) return workflow;
      
      return {
        ...workflow,
        successfulRuns: stats.successfulRuns,
        revenue: stats.revenue,
        lastRun: stats.lastRun
      };
    });
  }

  // Opportunity operations
  async getOpportunities(userId: number, limit?: number, offset = 0): Promise<Opportunity[]> {
    const userOpportunities = Array.from(this.opportunities.values())
      .filter(opportunity => opportunity.userId === userId)
      .sort((a, b) => (b.createdAt as any) - (a.createdAt as any));
    
    if (limit) {
      return userOpportunities.slice(offset, offset + limit);
    }
    
    return userOpportunities;
  }

  async getOpportunity(id: number): Promise<Opportunity | undefined> {
    return this.opportunities.get(id);
  }

  async createOpportunity(insertOpportunity: InsertOpportunity): Promise<Opportunity> {
    const id = this.currentOpportunityId++;
    const opportunity: Opportunity = {
      ...insertOpportunity,
      id,
      createdAt: new Date()
    };
    this.opportunities.set(id, opportunity);
    return opportunity;
  }

  async updateOpportunity(id: number, opportunityUpdate: Partial<Opportunity>): Promise<Opportunity | undefined> {
    const opportunity = this.opportunities.get(id);
    if (!opportunity) return undefined;
    
    const updatedOpportunity = {
      ...opportunity,
      ...opportunityUpdate
    };
    
    this.opportunities.set(id, updatedOpportunity);
    return updatedOpportunity;
  }

  async deleteOpportunity(id: number): Promise<boolean> {
    return this.opportunities.delete(id);
  }

  async getOpportunitiesWithPlatform(userId: number, limit?: number, offset = 0): Promise<OpportunityWithPlatform[]> {
    const opportunities = await this.getOpportunities(userId, limit, offset);
    const platforms = await this.getPlatforms(userId);
    
    return opportunities.map(opportunity => {
      const platform = platforms.find(p => p.id === opportunity.platformId);
      
      return {
        ...opportunity,
        platformName: platform?.name,
        platformIcon: platform?.metadata?.icon as string
      };
    });
  }

  async getOpportunitiesCount(userId: number): Promise<number> {
    return Array.from(this.opportunities.values()).filter(
      opportunity => opportunity.userId === userId
    ).length;
  }

  // Statistics operations
  async getStatistics(userId: number): Promise<Statistics | undefined> {
    return Array.from(this.statisticsStore.values()).find(
      stats => stats.userId === userId
    );
  }

  async updateStatistics(userId: number, statisticsUpdate: Partial<InsertStatistics>): Promise<Statistics | undefined> {
    const statistics = await this.getStatistics(userId);
    if (!statistics) return undefined;
    
    const updatedStatistics = {
      ...statistics,
      ...statisticsUpdate,
      date: new Date()
    };
    
    this.statisticsStore.set(statistics.id, updatedStatistics);
    return updatedStatistics;
  }

  async createStatistics(insertStatistics: InsertStatistics): Promise<Statistics> {
    const id = this.currentStatisticsId++;
    const statistics: Statistics = {
      ...insertStatistics,
      id
    };
    this.statisticsStore.set(id, statistics);
    return statistics;
  }

  async getStatisticsWithChange(userId: number): Promise<StatisticsWithChange | undefined> {
    const statistics = await this.getStatistics(userId);
    if (!statistics) return undefined;
    
    // In a real app, we'd compare with previous stats
    // For demo purposes, we're adding static changes
    return {
      ...statistics,
      activeWorkflowsChange: 2,
      tasksCompletedChange: 32,
      revenueChange: "+12.5%",
      opportunitiesFoundChange: 8
    };
  }

  async getRevenueData(userId: number, period: 'week' | 'month' | 'year'): Promise<RevenueData[]> {
    // Generate synthetic revenue data based on period
    const points = period === 'week' ? 7 : period === 'month' ? 6 : 12;
    const result: RevenueData[] = [];
    
    for (let i = 0; i < points; i++) {
      const date = new Date();
      date.setDate(date.getDate() - (points - i));
      
      const label = period === 'week' 
        ? date.toLocaleDateString('en-US', { weekday: 'short' })
        : period === 'month'
          ? `Week ${i + 1}`
          : date.toLocaleDateString('en-US', { month: 'short' });
      
      // Generate increasing revenue trend
      const total = 500 + (i * 100);
      const clickbank = Math.round(total * 0.5);
      const fiverr = Math.round(total * 0.3);
      const upwork = Math.round(total * 0.2);
      
      result.push({
        date: label,
        clickbank,
        fiverr,
        upwork,
        total
      });
    }
    
    return result;
  }

  // Task operations
  async getTasks(userId: number): Promise<Task[]> {
    return Array.from(this.tasks.values()).filter(
      task => task.userId === userId
    );
  }

  async getTask(id: number): Promise<Task | undefined> {
    return this.tasks.get(id);
  }

  async createTask(insertTask: InsertTask): Promise<Task> {
    const id = this.currentTaskId++;
    const task: Task = {
      ...insertTask,
      id,
      createdAt: new Date(),
      completedAt: null
    };
    this.tasks.set(id, task);
    return task;
  }

  async updateTask(id: number, taskUpdate: Partial<Task>): Promise<Task | undefined> {
    const task = this.tasks.get(id);
    if (!task) return undefined;
    
    const updatedTask = {
      ...task,
      ...taskUpdate
    };
    
    if (taskUpdate.status === 'completed' && !updatedTask.completedAt) {
      updatedTask.completedAt = new Date();
    }
    
    this.tasks.set(id, updatedTask);
    return updatedTask;
  }

  async deleteTask(id: number): Promise<boolean> {
    return this.tasks.delete(id);
  }
}

export const storage = new MemStorage();
