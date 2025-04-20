import { eq, desc, sql } from 'drizzle-orm';
import { db } from './db';
import * as schema from "@shared/schema";
import { 
  Platform, InsertPlatform, 
  Workflow, InsertWorkflow,
  Task, InsertTask,
  Activity, InsertActivity 
} from "@shared/schema";
import { IStorage } from './storage';

export class DatabaseStorage implements IStorage {
  // Platform operations
  async getPlatforms(): Promise<Platform[]> {
    return await db.select().from(schema.platforms);
  }

  async getPlatform(id: number): Promise<Platform | undefined> {
    const [platform] = await db
      .select()
      .from(schema.platforms)
      .where(eq(schema.platforms.id, id));
    return platform;
  }

  async getPlatformByName(name: string): Promise<Platform | undefined> {
    const [platform] = await db
      .select()
      .from(schema.platforms)
      .where(sql`LOWER(${schema.platforms.name}) = LOWER(${name})`);
    return platform;
  }

  async createPlatform(platform: InsertPlatform): Promise<Platform> {
    const [result] = await db
      .insert(schema.platforms)
      .values(platform)
      .returning();
    return result;
  }

  async updatePlatform(id: number, data: Partial<Platform>): Promise<Platform | undefined> {
    const [result] = await db
      .update(schema.platforms)
      .set(data)
      .where(eq(schema.platforms.id, id))
      .returning();
    return result;
  }

  async deletePlatform(id: number): Promise<boolean> {
    const result = await db
      .delete(schema.platforms)
      .where(eq(schema.platforms.id, id));
    return !!result;
  }

  // Workflow operations
  async getWorkflows(): Promise<Workflow[]> {
    return await db.select().from(schema.workflows);
  }

  async getWorkflow(id: number): Promise<Workflow | undefined> {
    const [workflow] = await db
      .select()
      .from(schema.workflows)
      .where(eq(schema.workflows.id, id));
    return workflow;
  }

  async getWorkflowsByPlatform(platformId: number): Promise<Workflow[]> {
    return await db
      .select()
      .from(schema.workflows)
      .where(eq(schema.workflows.platformId, platformId));
  }

  async createWorkflow(workflow: InsertWorkflow): Promise<Workflow> {
    const [result] = await db
      .insert(schema.workflows)
      .values(workflow)
      .returning();
    return result;
  }

  async updateWorkflow(id: number, data: Partial<Workflow>): Promise<Workflow | undefined> {
    const [result] = await db
      .update(schema.workflows)
      .set(data)
      .where(eq(schema.workflows.id, id))
      .returning();
    return result;
  }

  async deleteWorkflow(id: number): Promise<boolean> {
    const result = await db
      .delete(schema.workflows)
      .where(eq(schema.workflows.id, id));
    return !!result;
  }

  // Task operations
  async getTasks(filters?: { workflowId?: number, platformId?: number, status?: string }): Promise<Task[]> {
    // Start with a basic query
    let query = `
      SELECT * FROM tasks 
      WHERE 1=1
    `;
    const params: any[] = [];
    let paramCounter = 1;
    
    // Add filters as needed
    if (filters) {
      if (filters.workflowId !== undefined) {
        query += ` AND workflow_id = $${paramCounter++}`;
        params.push(filters.workflowId);
      }
      
      if (filters.platformId !== undefined) {
        query += ` AND platform_id = $${paramCounter++}`;
        params.push(filters.platformId);
      }
      
      if (filters.status !== undefined) {
        query += ` AND status = $${paramCounter++}`;
        params.push(filters.status);
      }
    }
    
    // Add ordering
    query += ` ORDER BY created_at DESC`;
    
    // Execute the raw query
    const { rows } = await db.execute(sql.raw(query, ...params));
    return rows as Task[];
  }

  async getTask(id: number): Promise<Task | undefined> {
    const [task] = await db
      .select()
      .from(schema.tasks)
      .where(eq(schema.tasks.id, id));
    return task;
  }

  async createTask(task: InsertTask): Promise<Task> {
    const now = new Date();
    const [result] = await db
      .insert(schema.tasks)
      .values({
        ...task,
        createdAt: now,
        updatedAt: now
      })
      .returning();
    return result;
  }

  async updateTask(id: number, data: Partial<Task>): Promise<Task | undefined> {
    const [result] = await db
      .update(schema.tasks)
      .set({
        ...data,
        updatedAt: new Date()
      })
      .where(eq(schema.tasks.id, id))
      .returning();
    return result;
  }

  async deleteTask(id: number): Promise<boolean> {
    const result = await db
      .delete(schema.tasks)
      .where(eq(schema.tasks.id, id));
    return !!result;
  }

  // Activity operations
  async getActivities(limit: number = 10): Promise<Activity[]> {
    const result = await db
      .select()
      .from(schema.activities)
      .orderBy(desc(schema.activities.timestamp))
      .limit(limit);
    return result;
  }

  async createActivity(activity: InsertActivity): Promise<Activity> {
    const [result] = await db
      .insert(schema.activities)
      .values({
        ...activity,
        timestamp: new Date()
      })
      .returning();
    return result;
  }
}