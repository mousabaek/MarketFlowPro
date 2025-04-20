import { db } from './db';
import * as schema from '@shared/schema';

/**
 * Seeds the database with initial data
 */
async function seed() {
  console.log('Seeding database...');
  
  try {
    // Create platforms
    const [clickbank] = await db
      .insert(schema.platforms)
      .values({
        name: "Clickbank",
        type: "affiliate",
        apiKey: "demo_clickbank_key",
        apiSecret: "demo_clickbank_secret",
        status: "connected",
        healthStatus: "healthy",
        lastSynced: new Date(),
        settings: {}
      })
      .returning();
    console.log('Created Clickbank platform:', clickbank.id);

    const [fiverr] = await db
      .insert(schema.platforms)
      .values({
        name: "Fiverr",
        type: "freelance",
        apiKey: "demo_fiverr_key",
        status: "connected",
        healthStatus: "healthy",
        lastSynced: new Date(),
        settings: {}
      })
      .returning();
    console.log('Created Fiverr platform:', fiverr.id);

    const [upwork] = await db
      .insert(schema.platforms)
      .values({
        name: "Upwork",
        type: "freelance",
        apiKey: "demo_upwork_key",
        status: "connected",
        healthStatus: "warning",
        lastSynced: new Date(Date.now() - 3600000),
        settings: {}
      })
      .returning();
    console.log('Created Upwork platform:', upwork.id);

    // Create workflows
    const [workflow1] = await db
      .insert(schema.workflows)
      .values({
        name: "Clickbank Product Finder",
        status: "active",
        steps: [
          { type: "trigger", config: { platform: "clickbank", event: "new_product" } },
          { type: "filter", config: { field: "category", value: "e-business" } },
          { type: "action", config: { type: "notify", channel: "email" } }
        ],
        platformId: clickbank.id,
        lastRun: new Date(Date.now() - 30 * 60000),
        nextRun: new Date(Date.now() + 60 * 60000),
        successRate: 98,
        revenue: 124500,
        stats: { runs: 156, successes: 153, failures: 3 }
      })
      .returning();
    console.log('Created workflow 1:', workflow1.id);

    const [workflow2] = await db
      .insert(schema.workflows)
      .values({
        name: "Fiverr Job Applicator",
        status: "active",
        steps: [
          { type: "trigger", config: { platform: "fiverr", event: "new_job" } },
          { type: "filter", config: { field: "category", value: "web_development" } },
          { type: "action", config: { type: "apply", template: "web_expert" } }
        ],
        platformId: fiverr.id,
        lastRun: new Date(Date.now() - 120 * 60000),
        nextRun: new Date(Date.now() + 30 * 60000),
        successRate: 92,
        revenue: 0,
        stats: { runs: 74, successes: 68, failures: 6 }
      })
      .returning();
    console.log('Created workflow 2:', workflow2.id);

    const [workflow3] = await db
      .insert(schema.workflows)
      .values({
        name: "Upwork Proposal Sender",
        status: "active",
        steps: [
          { type: "trigger", config: { platform: "upwork", event: "new_job" } },
          { type: "filter", config: { field: "hourly_rate", value: 50, operator: ">=" } },
          { type: "action", config: { type: "submit", template: "expert_profile" } }
        ],
        platformId: upwork.id,
        lastRun: new Date(Date.now() - 24 * 3600000),
        nextRun: new Date(Date.now() + 15 * 60000),
        successRate: 78,
        revenue: 98250,
        stats: { runs: 32, successes: 25, failures: 7 }
      })
      .returning();
    console.log('Created workflow 3:', workflow3.id);

    const [workflow4] = await db
      .insert(schema.workflows)
      .values({
        name: "Clickbank Affiliate Connector",
        status: "error",
        steps: [
          { type: "trigger", config: { platform: "clickbank", event: "new_affiliate" } },
          { type: "action", config: { type: "connect" } }
        ],
        platformId: clickbank.id,
        lastRun: new Date(Date.now() - 5 * 3600000),
        nextRun: null,
        successRate: 0,
        revenue: 0,
        stats: { runs: 5, successes: 0, failures: 5 }
      })
      .returning();
    console.log('Created workflow 4:', workflow4.id);

    // Create activities
    await db
      .insert(schema.activities)
      .values({
        workflowId: workflow2.id,
        platformId: fiverr.id,
        type: "success",
        title: "Fiverr job application successful",
        description: "Applied to \"WordPress Developer Needed\" using template \"WordPress Expert\".",
        data: { jobId: "fv123456" }
      });

    await db
      .insert(schema.activities)
      .values({
        workflowId: workflow3.id,
        platformId: upwork.id,
        type: "warning",
        title: "Upwork rate limit warning",
        description: "API rate limit at 85%. Consider reducing request frequency.",
        data: { rateLimit: 85 }
      });

    await db
      .insert(schema.activities)
      .values({
        workflowId: workflow4.id,
        platformId: clickbank.id,
        type: "error",
        title: "Clickbank API authentication failed",
        description: "Invalid API credentials. Please check your API key and secret.",
        data: { errorCode: "AUTH_FAILED" }
      });

    await db
      .insert(schema.activities)
      .values({
        workflowId: workflow1.id,
        platformId: clickbank.id,
        type: "revenue",
        title: "Clickbank commission received",
        description: "Received $124.50 commission for product \"Digital Marketing Pro\".",
        data: { amount: 12450, product: "Digital Marketing Pro" }
      });

    await db
      .insert(schema.activities)
      .values({
        type: "system",
        title: "New workflow created",
        description: "Created new workflow \"Fiverr Job Finder\" with 3 steps.",
        data: { workflowId: 5 }
      });

    console.log('Seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
}

// Run the seed function
seed();