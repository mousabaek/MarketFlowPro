import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  fullName: text("full_name"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  fullName: true,
});

// Platform schema
export const platforms = pgTable("platforms", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  type: text("type").notNull(), // 'clickbank', 'fiverr', 'upwork'
  apiKey: text("api_key"),
  secretKey: text("secret_key"),
  status: text("status").notNull().default('disconnected'), // 'connected', 'disconnected', 'error'
  metadata: json("metadata"),
  lastUpdated: timestamp("last_updated").defaultNow(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertPlatformSchema = createInsertSchema(platforms).pick({
  userId: true,
  name: true,
  type: true,
  apiKey: true,
  secretKey: true,
  status: true,
  metadata: true,
});

// Workflow schema
export const workflows = pgTable("workflows", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  description: text("description"),
  platformId: integer("platform_id").references(() => platforms.id),
  platformType: text("platform_type").notNull(), 
  status: text("status").notNull().default('inactive'), // 'active', 'inactive', 'error', 'paused'
  config: json("config").notNull(),
  stats: json("stats"),
  lastRun: timestamp("last_run"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertWorkflowSchema = createInsertSchema(workflows).pick({
  userId: true,
  name: true,
  description: true,
  platformId: true,
  platformType: true,
  status: true,
  config: true,
});

// Opportunity schema
export const opportunities = pgTable("opportunities", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  workflowId: integer("workflow_id").references(() => workflows.id),
  platformId: integer("platform_id").references(() => platforms.id),
  platformType: text("platform_type").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  value: text("value"),
  status: text("status").notNull(), // 'active', 'pending', 'completed', 'missed'
  metadata: json("metadata"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertOpportunitySchema = createInsertSchema(opportunities).pick({
  userId: true,
  workflowId: true,
  platformId: true,
  platformType: true,
  title: true,
  description: true,
  value: true,
  status: true,
  metadata: true,
});

// Statistics schema
export const statistics = pgTable("statistics", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  date: timestamp("date").defaultNow().notNull(),
  activeWorkflows: integer("active_workflows").default(0),
  tasksCompleted: integer("tasks_completed").default(0),
  revenue: text("revenue").default("0"),
  opportunitiesFound: integer("opportunities_found").default(0),
  platformStats: json("platform_stats"),
});

export const insertStatisticsSchema = createInsertSchema(statistics).pick({
  userId: true,
  date: true,
  activeWorkflows: true,
  tasksCompleted: true,
  revenue: true,
  opportunitiesFound: true,
  platformStats: true,
});

// Task schema
export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  workflowId: integer("workflow_id").references(() => workflows.id),
  opportunityId: integer("opportunity_id").references(() => opportunities.id),
  action: text("action").notNull(),
  status: text("status").notNull(), // 'pending', 'completed', 'failed'
  result: json("result"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
});

export const insertTaskSchema = createInsertSchema(tasks).pick({
  userId: true,
  workflowId: true,
  opportunityId: true,
  action: true,
  status: true,
  result: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Platform = typeof platforms.$inferSelect;
export type InsertPlatform = z.infer<typeof insertPlatformSchema>;

export type Workflow = typeof workflows.$inferSelect;
export type InsertWorkflow = z.infer<typeof insertWorkflowSchema>;

export type Opportunity = typeof opportunities.$inferSelect;
export type InsertOpportunity = z.infer<typeof insertOpportunitySchema>;

export type Statistics = typeof statistics.$inferSelect;
export type InsertStatistics = z.infer<typeof insertStatisticsSchema>;

export type Task = typeof tasks.$inferSelect;
export type InsertTask = z.infer<typeof insertTaskSchema>;

// UI Types that combine DB types
export interface PlatformWithStats extends Platform {
  activeTasks?: number;
  revenue?: string;
  lastUpdate?: string;
}

export interface WorkflowWithStats extends Workflow {
  successfulRuns?: string;
  revenue?: string;
  lastRun?: string;
}

export interface OpportunityWithPlatform extends Opportunity {
  platformName?: string;
  platformIcon?: string;
}

export interface StatisticsWithChange extends Statistics {
  activeWorkflowsChange?: number;
  tasksCompletedChange?: number;
  revenueChange?: string;
  opportunitiesFoundChange?: number;
}

export interface RevenueData {
  date: string;
  clickbank?: number;
  fiverr?: number;
  upwork?: number;
  total?: number;
}
