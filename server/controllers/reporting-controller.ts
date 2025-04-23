import { storage } from "../storage";
import { platform } from "os";

interface DateRange {
  startDate: Date;
  endDate: Date;
}

interface PlatformMetrics {
  platformId: number;
  platformName: string;
  earnings: string;
  tasks: number;
  successRate: number;
}

interface UserMetrics {
  userId: number;
  username: string;
  email: string;
  totalEarnings: string;
  commissions: string;
  activeWorkflows: number;
}

interface EarningsByPeriod {
  period: string;
  amount: string;
  commissions: string;
}

export class ReportingController {
  /**
   * Calculate date range based on period
   */
  private getDateRangeForPeriod(period: string): DateRange {
    const now = new Date();
    const startDate = new Date();
    const endDate = new Date();
    
    switch (period) {
      case 'today':
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'yesterday':
        startDate.setDate(startDate.getDate() - 1);
        startDate.setHours(0, 0, 0, 0);
        endDate.setDate(endDate.getDate() - 1);
        endDate.setHours(23, 59, 59, 999);
        break;
      case 'last7days':
        startDate.setDate(startDate.getDate() - 7);
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'last30days':
        startDate.setDate(startDate.getDate() - 30);
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'thisMonth':
        startDate.setDate(1);
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'lastMonth':
        startDate.setMonth(startDate.getMonth() - 1);
        startDate.setDate(1);
        startDate.setHours(0, 0, 0, 0);
        endDate.setDate(0); // Last day of previous month
        endDate.setHours(23, 59, 59, 999);
        break;
      default:
        startDate.setDate(startDate.getDate() - 30); // Default to last 30 days
        startDate.setHours(0, 0, 0, 0);
    }
    
    return { startDate, endDate };
  }
  
  /**
   * Get earnings report for a user by platform
   */
  async getUserEarningsByPlatform(userId: number, period: string): Promise<PlatformMetrics[]> {
    const user = await storage.getUser(userId);
    if (!user) {
      throw new Error("User not found");
    }
    
    // Get date range based on period
    const { startDate, endDate } = this.getDateRangeForPeriod(period);
    
    // Get user's platform earnings
    const platforms = await storage.getPlatforms();
    const metrics: PlatformMetrics[] = [];
    
    // For each platform, calculate the earnings and tasks metrics
    for (const platform of platforms) {
      // First get tasks for this platform in the date range
      const tasks = await storage.getTasks({
        platformId: platform.id
      });
      
      const tasksInPeriod = tasks.filter(task => {
        const taskDate = new Date(task.createdAt);
        return taskDate >= startDate && taskDate <= endDate;
      });
      
      // Calculate success rate
      const successfulTasks = tasksInPeriod.filter(task => task.status === "completed");
      const successRate = tasksInPeriod.length > 0 
        ? (successfulTasks.length / tasksInPeriod.length) * 100 
        : 0;
      
      // Get earnings for this platform in this period
      const earningRecords = await storage.getUserPlatformEarnings(userId);
      
      // Filter by platform and date range
      const platformEarnings = earningRecords.filter(earning => {
        const earningDate = new Date(earning.date);
        return earning.platformId === platform.id && 
               earningDate >= startDate && 
               earningDate <= endDate;
      });
      
      // Sum up earnings and commissions
      let totalEarnings = 0;
      let totalCommissions = 0;
      
      platformEarnings.forEach(earning => {
        totalEarnings += parseFloat(earning.amount?.toString() || "0");
        totalCommissions += parseFloat(earning.commissions?.toString() || "0");
      });
      
      metrics.push({
        platformId: platform.id,
        platformName: platform.name,
        earnings: totalEarnings.toFixed(2),
        tasks: tasksInPeriod.length,
        successRate: parseFloat(successRate.toFixed(2))
      });
    }
    
    // Sort by earnings (highest first)
    return metrics.sort((a, b) => parseFloat(b.earnings) - parseFloat(a.earnings));
  }
  
  /**
   * Get earnings report by time period (daily, weekly, monthly)
   */
  async getUserEarningsByPeriod(userId: number, timeframe: string, periodCount: number): Promise<EarningsByPeriod[]> {
    const user = await storage.getUser(userId);
    if (!user) {
      throw new Error("User not found");
    }
    
    const now = new Date();
    const results: EarningsByPeriod[] = [];
    
    // Function to format date as YYYY-MM-DD
    const formatDate = (date: Date): string => {
      return date.toISOString().split('T')[0];
    };
    
    // Function to format month as YYYY-MM
    const formatMonth = (date: Date): string => {
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    };
    
    // Get all earnings for this user
    const allEarnings = await storage.getUserPlatformEarnings(userId);
    
    if (timeframe === 'daily') {
      // Generate daily data points for the last n days
      for (let i = periodCount - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        date.setHours(0, 0, 0, 0);
        
        const nextDate = new Date(date);
        nextDate.setDate(nextDate.getDate() + 1);
        
        // Find earnings for this day
        const dayEarnings = allEarnings.filter(earning => {
          const earningDate = new Date(earning.date);
          return earningDate >= date && earningDate < nextDate;
        });
        
        // Sum up earnings and commissions
        let dayAmount = 0;
        let dayCommissions = 0;
        
        dayEarnings.forEach(earning => {
          dayAmount += parseFloat(earning.amount?.toString() || "0");
          dayCommissions += parseFloat(earning.commissions?.toString() || "0");
        });
        
        results.push({
          period: formatDate(date),
          amount: dayAmount.toFixed(2),
          commissions: dayCommissions.toFixed(2)
        });
      }
    } else if (timeframe === 'weekly') {
      // Generate weekly data points
      for (let i = periodCount - 1; i >= 0; i--) {
        const endOfWeek = new Date();
        endOfWeek.setDate(endOfWeek.getDate() - (endOfWeek.getDay() + 1) % 7 - (7 * i));
        
        const startOfWeek = new Date(endOfWeek);
        startOfWeek.setDate(startOfWeek.getDate() - 6);
        startOfWeek.setHours(0, 0, 0, 0);
        
        endOfWeek.setHours(23, 59, 59, 999);
        
        // Find earnings for this week
        const weekEarnings = allEarnings.filter(earning => {
          const earningDate = new Date(earning.date);
          return earningDate >= startOfWeek && earningDate <= endOfWeek;
        });
        
        // Sum up earnings and commissions
        let weekAmount = 0;
        let weekCommissions = 0;
        
        weekEarnings.forEach(earning => {
          weekAmount += parseFloat(earning.amount?.toString() || "0");
          weekCommissions += parseFloat(earning.commissions?.toString() || "0");
        });
        
        results.push({
          period: `${formatDate(startOfWeek)} to ${formatDate(endOfWeek)}`,
          amount: weekAmount.toFixed(2),
          commissions: weekCommissions.toFixed(2)
        });
      }
    } else if (timeframe === 'monthly') {
      // Generate monthly data points
      for (let i = periodCount - 1; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        date.setDate(1);
        date.setHours(0, 0, 0, 0);
        
        const nextMonth = new Date(date);
        nextMonth.setMonth(nextMonth.getMonth() + 1);
        
        // Find earnings for this month
        const monthEarnings = allEarnings.filter(earning => {
          const earningDate = new Date(earning.date);
          return earningDate >= date && earningDate < nextMonth;
        });
        
        // Sum up earnings and commissions
        let monthAmount = 0;
        let monthCommissions = 0;
        
        monthEarnings.forEach(earning => {
          monthAmount += parseFloat(earning.amount?.toString() || "0");
          monthCommissions += parseFloat(earning.commissions?.toString() || "0");
        });
        
        results.push({
          period: formatMonth(date),
          amount: monthAmount.toFixed(2),
          commissions: monthCommissions.toFixed(2)
        });
      }
    }
    
    return results;
  }
  
  /**
   * Get workflow performance metrics
   */
  async getWorkflowPerformance(userId: number, period: string): Promise<any[]> {
    const user = await storage.getUser(userId);
    if (!user) {
      throw new Error("User not found");
    }
    
    // Get date range based on period
    const { startDate, endDate } = this.getDateRangeForPeriod(period);
    
    // Get all workflows for this user
    // In a real implementation, we'd filter by user ID
    const workflows = await storage.getWorkflows();
    
    const workflowMetrics = [];
    
    for (const workflow of workflows) {
      // Get tasks for this workflow in the date range
      const tasks = await storage.getTasks({ workflowId: workflow.id });
      
      const tasksInPeriod = tasks.filter(task => {
        const taskDate = new Date(task.createdAt);
        return taskDate >= startDate && taskDate <= endDate;
      });
      
      // Calculate metrics
      const successfulTasks = tasksInPeriod.filter(task => task.status === "completed");
      const failedTasks = tasksInPeriod.filter(task => task.status === "failed");
      const pendingTasks = tasksInPeriod.filter(task => task.status === "pending");
      
      const successRate = tasksInPeriod.length > 0 
        ? (successfulTasks.length / tasksInPeriod.length) * 100 
        : 0;
      
      // Get the platform name
      const platform = await storage.getPlatform(workflow.platformId);
      
      workflowMetrics.push({
        workflowId: workflow.id,
        workflowName: workflow.name,
        platformId: workflow.platformId,
        platformName: platform?.name || "Unknown Platform",
        taskCount: tasksInPeriod.length,
        successfulTasks: successfulTasks.length,
        failedTasks: failedTasks.length,
        pendingTasks: pendingTasks.length,
        successRate: parseFloat(successRate.toFixed(2)),
        revenue: parseFloat(workflow.revenue?.toString() || "0").toFixed(2),
        lastRun: workflow.lastRun
      });
    }
    
    // Sort by success rate (highest first)
    return workflowMetrics.sort((a, b) => b.successRate - a.successRate);
  }
  
  /**
   * Get platform analytics overview
   */
  async getPlatformAnalytics(platformId: number, period: string): Promise<any> {
    // Get the platform
    const platform = await storage.getPlatform(platformId);
    if (!platform) {
      throw new Error("Platform not found");
    }
    
    // Get date range based on period
    const { startDate, endDate } = this.getDateRangeForPeriod(period);
    
    // Get workflows for this platform
    const workflows = await storage.getWorkflowsByPlatform(platformId);
    
    // Get tasks for this platform in the date range
    const tasks = await storage.getTasks({ platformId });
    
    const tasksInPeriod = tasks.filter(task => {
      const taskDate = new Date(task.createdAt);
      return taskDate >= startDate && taskDate <= endDate;
    });
    
    // Calculate metrics
    const successfulTasks = tasksInPeriod.filter(task => task.status === "completed");
    const failedTasks = tasksInPeriod.filter(task => task.status === "failed");
    const pendingTasks = tasksInPeriod.filter(task => task.status === "pending");
    
    const successRate = tasksInPeriod.length > 0 
      ? (successfulTasks.length / tasksInPeriod.length) * 100 
      : 0;
    
    // Calculate revenue
    let totalRevenue = 0;
    workflows.forEach(workflow => {
      totalRevenue += parseFloat(workflow.revenue?.toString() || "0");
    });
    
    return {
      platformId,
      platformName: platform.name,
      platformType: platform.type,
      workflowCount: workflows.length,
      taskCount: tasksInPeriod.length,
      successfulTasks: successfulTasks.length,
      failedTasks: failedTasks.length,
      pendingTasks: pendingTasks.length,
      successRate: parseFloat(successRate.toFixed(2)),
      revenue: totalRevenue.toFixed(2),
      healthStatus: platform.healthStatus,
      lastSynced: platform.lastSynced
    };
  }
  
  /**
   * Admin-only: Get aggregated user metrics
   */
  async getUserMetrics(period: string, limit: number = 10): Promise<UserMetrics[]> {
    // Get date range based on period
    const { startDate, endDate } = this.getDateRangeForPeriod(period);
    
    // Get all users
    // In a real implementation, this would have pagination
    const allUsers = []; // Placeholder until we add getAllUsers to storage
    const userMetrics: UserMetrics[] = [];
    
    for (const user of allUsers) {
      // Get workflows for this user
      // In a real implementation, we'd filter by user ID
      const workflows = await storage.getWorkflows();
      const activeWorkflows = workflows.filter(w => w.status === "active");
      
      // Get earnings for this user in this period
      const earningRecords = await storage.getUserPlatformEarnings(user.id);
      
      // Filter by date range
      const periodEarnings = earningRecords.filter(earning => {
        const earningDate = new Date(earning.date);
        return earningDate >= startDate && earningDate <= endDate;
      });
      
      // Sum up earnings and commissions
      let totalEarnings = 0;
      let totalCommissions = 0;
      
      periodEarnings.forEach(earning => {
        totalEarnings += parseFloat(earning.amount?.toString() || "0");
        totalCommissions += parseFloat(earning.commissions?.toString() || "0");
      });
      
      userMetrics.push({
        userId: user.id,
        username: user.username,
        email: user.email,
        totalEarnings: totalEarnings.toFixed(2),
        commissions: totalCommissions.toFixed(2),
        activeWorkflows: activeWorkflows.length
      });
    }
    
    // Sort by earnings (highest first)
    return userMetrics
      .sort((a, b) => parseFloat(b.totalEarnings) - parseFloat(a.totalEarnings))
      .slice(0, limit);
  }
  
  /**
   * Admin-only: Get platform earnings report
   */
  async getPlatformEarningsReport(period: string): Promise<any> {
    // Get date range based on period
    const { startDate, endDate } = this.getDateRangeForPeriod(period);
    
    // Get all platforms
    const platforms = await storage.getPlatforms();
    const platformReport = [];
    
    let totalEarnings = 0;
    let totalCommissions = 0;
    let totalUsers = 0;
    
    for (const platform of platforms) {
      // Get workflows for this platform
      const workflows = await storage.getWorkflowsByPlatform(platform.id);
      
      // Calculate revenue
      let platformRevenue = 0;
      workflows.forEach(workflow => {
        platformRevenue += parseFloat(workflow.revenue?.toString() || "0");
      });
      
      // Get all platform earnings
      // In a real implementation, this would filter by platform ID and date range
      const platformEarnings = []; // Placeholder until we add specific method
      
      // Sum up earnings and commissions
      let platformTotalEarnings = 0;
      let platformTotalCommissions = 0;
      let usersCount = new Set();
      
      platformEarnings.forEach(earning => {
        platformTotalEarnings += parseFloat(earning.amount?.toString() || "0");
        platformTotalCommissions += parseFloat(earning.commissions?.toString() || "0");
        usersCount.add(earning.userId);
      });
      
      totalEarnings += platformTotalEarnings;
      totalCommissions += platformTotalCommissions;
      totalUsers += usersCount.size;
      
      platformReport.push({
        platformId: platform.id,
        platformName: platform.name,
        platformType: platform.type,
        workflowCount: workflows.length,
        userCount: usersCount.size,
        earnings: platformTotalEarnings.toFixed(2),
        commissions: platformTotalCommissions.toFixed(2),
        revenue: platformRevenue.toFixed(2)
      });
    }
    
    // Sort by earnings (highest first)
    return {
      platforms: platformReport.sort((a, b) => parseFloat(b.earnings) - parseFloat(a.earnings)),
      summary: {
        totalEarnings: totalEarnings.toFixed(2),
        totalCommissions: totalCommissions.toFixed(2),
        totalPlatforms: platforms.length,
        totalUsers: totalUsers,
        period
      }
    };
  }
  
  /**
   * Get system performance metrics
   */
  async getSystemPerformance(period: string): Promise<any> {
    // Get date range based on period
    const { startDate, endDate } = this.getDateRangeForPeriod(period);
    
    // Get platforms
    const platforms = await storage.getPlatforms();
    
    // Get workflows
    const workflows = await storage.getWorkflows();
    const activeWorkflows = workflows.filter(w => w.status === "active");
    
    // Get tasks in period
    const tasks = await storage.getTasks();
    const tasksInPeriod = tasks.filter(task => {
      const taskDate = new Date(task.createdAt);
      return taskDate >= startDate && taskDate <= endDate;
    });
    
    // Calculate success rate
    const successfulTasks = tasksInPeriod.filter(task => task.status === "completed");
    const failedTasks = tasksInPeriod.filter(task => task.status === "failed");
    const pendingTasks = tasksInPeriod.filter(task => task.status === "pending");
    
    const successRate = tasksInPeriod.length > 0 
      ? (successfulTasks.length / tasksInPeriod.length) * 100 
      : 0;
    
    // Get activities
    const activities = await storage.getActivities(100);
    const activitiesInPeriod = activities.filter(activity => {
      const activityDate = new Date(activity.timestamp);
      return activityDate >= startDate && activityDate <= endDate;
    });
    
    // Platform health
    const healthyPlatforms = platforms.filter(p => p.healthStatus === "healthy");
    const warningPlatforms = platforms.filter(p => p.healthStatus === "warning");
    const errorPlatforms = platforms.filter(p => p.healthStatus === "error");
    
    return {
      platforms: {
        total: platforms.length,
        healthy: healthyPlatforms.length,
        warning: warningPlatforms.length,
        error: errorPlatforms.length
      },
      workflows: {
        total: workflows.length,
        active: activeWorkflows.length,
        inactive: workflows.length - activeWorkflows.length
      },
      tasks: {
        total: tasksInPeriod.length,
        successful: successfulTasks.length,
        failed: failedTasks.length,
        pending: pendingTasks.length,
        successRate: parseFloat(successRate.toFixed(2))
      },
      activities: {
        total: activitiesInPeriod.length,
        byType: this.groupActivitiesByType(activitiesInPeriod)
      },
      period
    };
  }
  
  /**
   * Helper method to group activities by type
   */
  private groupActivitiesByType(activities: any[]): Record<string, number> {
    const result: Record<string, number> = {};
    
    activities.forEach(activity => {
      const type = activity.type || "unknown";
      if (!result[type]) {
        result[type] = 0;
      }
      result[type]++;
    });
    
    return result;
  }
}