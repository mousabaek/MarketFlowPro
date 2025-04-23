import { pgTable, text, serial, integer, boolean, timestamp, jsonb, decimal, date } from "drizzle-orm/pg-core";
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
  type: text("type").notNull(), // "success", "error", "warning", "info", "revenue", "system", "payment"
  title: text("title").notNull(),
  description: text("description"),
  timestamp: timestamp("timestamp").defaultNow(),
  data: jsonb("data").default({})
});

// User schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password"), // Make password optional for social logins
  firstName: text("first_name"),
  lastName: text("last_name"),
  avatar: text("avatar"),
  role: text("role").default("user"), // "user", "admin"
  balance: decimal("balance", { precision: 10, scale: 2 }).default("0"),
  pendingBalance: decimal("pending_balance", { precision: 10, scale: 2 }).default("0"),
  stripeCustomerId: text("stripe_customer_id"),
  googleId: text("google_id").unique(),
  githubId: text("github_id").unique(),
  appleId: text("apple_id").unique(),
  provider: text("provider"), // "local", "google", "github", "apple"
  subscriptionStatus: text("subscription_status").default("none"), // "none", "trial", "active", "cancelled", "expired"
  subscriptionPlan: text("subscription_plan"), // "monthly", "yearly", "premium"
  subscriptionStartDate: timestamp("subscription_start_date"),
  subscriptionEndDate: timestamp("subscription_end_date"),
  trialUsed: boolean("trial_used").default(false),
  commissionRate: decimal("commission_rate", { precision: 5, scale: 2 }).default("80.00"), // User keeps 80% by default
  maxWorkflows: integer("max_workflows"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Payment Method schema
export const paymentMethods = pgTable("payment_methods", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  type: text("type").notNull(), // "paypal", "bank", "stripe"
  accountName: text("account_name").notNull(),
  accountDetails: text("account_details").notNull(),
  isDefault: boolean("is_default").default(false),
  isVerified: boolean("is_verified").default(false),
  lastUsed: timestamp("last_used"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Withdrawal schema
export const withdrawals = pgTable("withdrawals", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  platformFee: decimal("platform_fee", { precision: 10, scale: 2 }).notNull(),
  netAmount: decimal("net_amount", { precision: 10, scale: 2 }).notNull(),
  paymentMethod: text("payment_method").notNull(), // "paypal", "bank", "stripe"
  accountDetails: text("account_details").notNull(),
  status: text("status").notNull(), // "pending", "processing", "completed", "failed"
  transactionId: text("transaction_id"),
  notes: text("notes"),
  requestedAt: timestamp("requested_at").notNull(),
  processedAt: timestamp("processed_at"),
  completedAt: timestamp("completed_at")
});

// Transaction schema for tracking all earnings and withdrawals
export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  type: text("type").notNull(), // "commission", "withdrawal", "refund", "fee"
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  platformId: integer("platform_id"),
  workflowId: integer("workflow_id"),
  withdrawalId: integer("withdrawal_id"),
  description: text("description").notNull(),
  status: text("status").default("complete"), // "pending", "complete", "failed"
  createdAt: timestamp("created_at").defaultNow(),
  data: jsonb("data").default({})
});

// Earnings by platform for reporting
export const platformEarnings = pgTable("platform_earnings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  platformId: integer("platform_id").notNull(),
  platformName: text("platform_name").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).default("0"),
  commissions: decimal("commissions", { precision: 10, scale: 2 }).default("0"),
  period: text("period").notNull(), // "daily", "weekly", "monthly", "yearly", "all_time"
  date: date("date").notNull(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Subscription schema
export const subscriptions = pgTable("subscriptions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  status: text("status").notNull(), // "trial", "active", "cancelled", "expired"
  plan: text("plan").notNull(), // "monthly", "yearly", "premium"
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  stripeSubscriptionId: text("stripe_subscription_id"),
  paymentMethodId: integer("payment_method_id"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Subscription plans
export const subscriptionPlans = pgTable("subscription_plans", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  displayName: text("display_name").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  billingCycle: text("billing_cycle").notNull(), // "monthly", "yearly"
  features: jsonb("features").notNull().default({}),
  maxWorkflows: integer("max_workflows").notNull(),
  maxPlatforms: integer("max_platforms").notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Platform settings
export const platformSettings = pgTable("platform_settings", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(),
  value: text("value").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Maintenance Requests schema
export const maintenanceRequests = pgTable("maintenance_requests", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  status: text("status").default("pending").notNull(), // "pending", "approved", "in_progress", "completed", "rejected"
  priority: text("priority").default("medium").notNull(), // "low", "medium", "high", "critical"
  type: text("type").notNull(), // "bug", "feature", "improvement", "question", "other"
  area: text("area").notNull(), // "frontend", "backend", "database", "api", "payment", "authentication", "other"
  aiAnalysis: jsonb("ai_analysis"),
  aiSolution: jsonb("ai_solution"),
  adminApproval: boolean("admin_approval").default(false),
  adminNotes: text("admin_notes"),
  adminId: integer("admin_id"), // The admin who approved or rejected
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  completedAt: timestamp("completed_at")
});

// Insert schemas
export const insertPlatformSchema = createInsertSchema(platforms).omit({ id: true });
export const insertWorkflowSchema = createInsertSchema(workflows).omit({ id: true });
export const insertTaskSchema = createInsertSchema(tasks).omit({ id: true, createdAt: true, updatedAt: true });
export const insertActivitySchema = createInsertSchema(activities).omit({ id: true, timestamp: true });
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true, updatedAt: true, balance: true, pendingBalance: true });
export const insertPaymentMethodSchema = createInsertSchema(paymentMethods).omit({ id: true, createdAt: true, updatedAt: true, lastUsed: true });
export const insertWithdrawalSchema = createInsertSchema(withdrawals).omit({ id: true, processedAt: true, completedAt: true });
export const insertTransactionSchema = createInsertSchema(transactions).omit({ id: true, createdAt: true });
export const insertPlatformEarningSchema = createInsertSchema(platformEarnings).omit({ id: true, updatedAt: true });
export const insertSubscriptionSchema = createInsertSchema(subscriptions).omit({ id: true, createdAt: true, updatedAt: true });
export const insertSubscriptionPlanSchema = createInsertSchema(subscriptionPlans).omit({ id: true, createdAt: true, updatedAt: true });
export const insertPlatformSettingSchema = createInsertSchema(platformSettings).omit({ id: true, createdAt: true, updatedAt: true });
export const insertMaintenanceRequestSchema = createInsertSchema(maintenanceRequests).omit({ id: true, createdAt: true, updatedAt: true, completedAt: true, aiAnalysis: true, aiSolution: true, adminApproval: true, adminNotes: true, adminId: true });

// Types
export type Platform = typeof platforms.$inferSelect;
export type InsertPlatform = z.infer<typeof insertPlatformSchema>;

export type Workflow = typeof workflows.$inferSelect;
export type InsertWorkflow = z.infer<typeof insertWorkflowSchema>;

export type Task = typeof tasks.$inferSelect;
export type InsertTask = z.infer<typeof insertTaskSchema>;

export type Activity = typeof activities.$inferSelect;
export type InsertActivity = z.infer<typeof insertActivitySchema>;

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type PaymentMethod = typeof paymentMethods.$inferSelect;
export type InsertPaymentMethod = z.infer<typeof insertPaymentMethodSchema>;

export type Withdrawal = typeof withdrawals.$inferSelect;
export type InsertWithdrawal = z.infer<typeof insertWithdrawalSchema>;

export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;

export type PlatformEarning = typeof platformEarnings.$inferSelect;
export type InsertPlatformEarning = z.infer<typeof insertPlatformEarningSchema>;

export type Subscription = typeof subscriptions.$inferSelect;
export type InsertSubscription = z.infer<typeof insertSubscriptionSchema>;

export type SubscriptionPlan = typeof subscriptionPlans.$inferSelect;
export type InsertSubscriptionPlan = z.infer<typeof insertSubscriptionPlanSchema>;

export type PlatformSetting = typeof platformSettings.$inferSelect;
export type InsertPlatformSetting = z.infer<typeof insertPlatformSettingSchema>;

export type MaintenanceRequest = typeof maintenanceRequests.$inferSelect;
export type InsertMaintenanceRequest = z.infer<typeof insertMaintenanceRequestSchema>;

// Validation schemas for API requests
export const platformConnectionSchema = z.object({
  name: z.string().min(1, "Platform name is required"),
  type: z.string().min(1, "Platform type is required"),
  apiKey: z.string().min(1, "API key is required"),
  apiSecret: z.string().optional(),
  settings: z.record(z.any()).optional()
}).refine((data) => {
  // Special validation for Amazon Associates
  if (data.name === 'Amazon Associates' && data.type === 'affiliate') {
    const settings = data.settings as Record<string, any>;
    return settings && settings.associateTag && settings.marketplace;
  }
  
  // Special validation for Etsy
  if (data.name === 'Etsy' && data.type === 'affiliate') {
    // Optional validation for Etsy as accessToken is not always required
    return true;
  }
  
  return true;
}, {
  message: "Missing required settings for this platform",
  path: ["settings"]
});

export const workflowCreationSchema = z.object({
  name: z.string().min(1, "Workflow name is required"),
  platformId: z.number().min(1, "Platform is required"),
  steps: z.array(z.object({
    type: z.string().min(1, "Step type is required"),
    config: z.record(z.any()).optional()
  })).min(1, "At least one step is required")
});

// Validation schema for withdrawal requests
export const withdrawalRequestSchema = z.object({
  amount: z.number().min(50, "Minimum withdrawal amount is $50"),
  paymentMethod: z.enum(["paypal", "bank", "stripe"], {
    required_error: "Payment method is required",
  }),
  accountDetails: z.string().optional()
});

// Validation schema for subscription
export const subscriptionRequestSchema = z.object({
  plan: z.enum(["monthly_basic", "yearly_basic", "monthly_premium"], {
    required_error: "Subscription plan is required",
  }),
  paymentMethodId: z.number().optional()
});

// Validation schema for maintenance requests
export const maintenanceRequestSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters long"),
  description: z.string().min(20, "Please provide a detailed description of the issue"),
  type: z.enum(["bug", "feature", "improvement", "question", "other"], {
    required_error: "Type of request is required",
  }),
  area: z.enum(["frontend", "backend", "database", "api", "payment", "authentication", "other"], {
    required_error: "Area of the application is required",
  }),
  priority: z.enum(["low", "medium", "high", "critical"], {
    required_error: "Priority level is required",
  }).default("medium")
});
