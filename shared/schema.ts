import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Platform schema (Clickbank, Fiverr, Upwork, etc)
export const platforms = pgTable("platforms", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(), // "affiliate", "freelance", etc
  apiKey: text("api_key"),
  apiSecret: text("api_secret"),
  status: text("status").default("disconnected"), // "connected", "disconnected", "limited", "error"
  healthStatus: text("health_status").default("unknown"), // "healthy", "warning", "error", "unknown"
  lastSynced: timestamp("last_synced"),
  settings: jsonb("settings").default({})
});

// Workflow schema (automation workflows)
export const workflows = pgTable("workflows", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  status: text("status").default("active"), // "active", "paused", "error"
  steps: jsonb("steps").notNull(),
  platformId: integer("platform_id").notNull(),
  lastRun: timestamp("last_run"),
  nextRun: timestamp("next_run"),
  successRate: integer("success_rate").default(0),
  revenue: integer("revenue").default(0), // stored in cents
  stats: jsonb("stats").default({})
});

// Task schema (discovered opportunities)
export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  workflowId: integer("workflow_id").notNull(),
  platformId: integer("platform_id").notNull(),
  externalId: text("external_id"), // ID from the external platform
  title: text("title").notNull(),
  description: text("description"),
  status: text("status").default("pending"), // "pending", "completed", "failed", "skipped"
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  data: jsonb("data").default({})
});

// Activity schema (system events and logs)
export const activities = pgTable("activities", {
  id: serial("id").primaryKey(),
  workflowId: integer("workflow_id"),
  platformId: integer("platform_id"),
  type: text("type").notNull(), // "success", "error", "warning", "info", "revenue", "system"
  title: text("title").notNull(),
  description: text("description"),
  timestamp: timestamp("timestamp").defaultNow(),
  data: jsonb("data").default({})
});

// Insert schemas
export const insertPlatformSchema = createInsertSchema(platforms).omit({ id: true });
export const insertWorkflowSchema = createInsertSchema(workflows).omit({ id: true });
export const insertTaskSchema = createInsertSchema(tasks).omit({ id: true, createdAt: true, updatedAt: true });
export const insertActivitySchema = createInsertSchema(activities).omit({ id: true, timestamp: true });

// Types
export type Platform = typeof platforms.$inferSelect;
export type InsertPlatform = z.infer<typeof insertPlatformSchema>;

export type Workflow = typeof workflows.$inferSelect;
export type InsertWorkflow = z.infer<typeof insertWorkflowSchema>;

export type Task = typeof tasks.$inferSelect;
export type InsertTask = z.infer<typeof insertTaskSchema>;

export type Activity = typeof activities.$inferSelect;
export type InsertActivity = z.infer<typeof insertActivitySchema>;

// Validation schemas for API requests
export const platformConnectionSchema = z.object({
  name: z.string().min(1, "Platform name is required"),
  type: z.string().min(1, "Platform type is required"),
  apiKey: z.string().min(1, "API key is required"),
  apiSecret: z.string().optional()
});

export const workflowCreationSchema = z.object({
  name: z.string().min(1, "Workflow name is required"),
  platformId: z.number().min(1, "Platform is required"),
  steps: z.array(z.object({
    type: z.string().min(1, "Step type is required"),
    config: z.record(z.any()).optional()
  })).min(1, "At least one step is required")
});
