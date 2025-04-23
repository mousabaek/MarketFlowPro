import OpenAI from "openai";
import { db } from "../db";
import { eq } from "drizzle-orm";
import { maintenanceRequests, users } from "@shared/schema";

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Define the structured response for AI analysis
interface AIAnalysisResponse {
  analysis: {
    rootCause: string;
    impactSeverity: string;
    technicalDetails: string;
    affectedComponents: string[];
  };
  solution: {
    recommendedActions: string[];
    codeChanges?: {
      file: string;
      changeSummary: string;
      oldCode?: string;
      newCode?: string;
    }[];
    configuration?: Record<string, any>;
    testingSteps?: string[];
  };
  estimatedTimeToFix: string;
  requiredSkills: string[];
  securityImplications: string;
}

export class AIMaintenance {
  /**
   * Analyze a maintenance request using AI
   */
  static async analyzeRequest(requestId: number): Promise<boolean> {
    try {
      // Get the request details
      const [request] = await db
        .select()
        .from(maintenanceRequests)
        .where(eq(maintenanceRequests.id, requestId));

      if (!request) {
        throw new Error(`Maintenance request #${requestId} not found`);
      }

      // Get the user details for context
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, request.userId));

      if (!user) {
        throw new Error(`User #${request.userId} not found`);
      }

      // Create the prompt for analysis
      const prompt = `
You are an expert developer and AI maintenance agent for the Wolf Auto Marketer application. 
Your task is to analyze and propose solutions for the following maintenance request:

ISSUE DETAILS:
Title: ${request.title}
Description: ${request.description}
Type: ${request.type}
Area: ${request.area}
Priority: ${request.priority}
Reported by: ${user.firstName || user.username} (${user.role})

SYSTEM CONTEXT:
Wolf Auto Marketer is a platform for freelancers and affiliate marketers that connects to platforms like Clickbank, Fiverr, Upwork, Freelancer.com, Amazon Associates, and Etsy. The application uses:
- React.js with TypeScript frontend
- Node.js backend with Express
- PostgreSQL database with Drizzle ORM
- OpenAI integration for AI features
- WebSocket for real-time communication
- Stripe for payment processing

Analyze the issue thoroughly and provide:
1. A detailed analysis of the root cause based on the description
2. A comprehensive solution plan including any code or configuration changes
3. Estimated time to implement the solution
4. Required skills to fix this issue
5. Security implications, if any

Format your response as JSON with the following structure:
{
  "analysis": {
    "rootCause": "Detailed explanation of what's causing the issue",
    "impactSeverity": "Low/Medium/High/Critical",
    "technicalDetails": "Technical explanation of the issue",
    "affectedComponents": ["component1", "component2"]
  },
  "solution": {
    "recommendedActions": ["Action 1", "Action 2"],
    "codeChanges": [
      {
        "file": "path/to/file.ts",
        "changeSummary": "What needs to be changed",
        "oldCode": "Code to be replaced (if applicable)",
        "newCode": "New code (if applicable)"
      }
    ],
    "configuration": {
      "setting1": "value1"
    },
    "testingSteps": ["Step 1", "Step 2"]
  },
  "estimatedTimeToFix": "X hours/days",
  "requiredSkills": ["skill1", "skill2"],
  "securityImplications": "Description of any security concerns"
}`;

      // Call OpenAI to analyze the issue
      // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: "You are an expert developer and AI maintenance agent. Respond only with valid JSON." },
          { role: "user", content: prompt }
        ],
        response_format: { type: "json_object" },
      });

      // Parse the AI response
      const aiResponse = JSON.parse(response.choices[0].message.content) as AIAnalysisResponse;

      // Update the maintenance request with the AI analysis
      await db
        .update(maintenanceRequests)
        .set({
          aiAnalysis: aiResponse.analysis,
          aiSolution: aiResponse.solution,
          status: "pending_approval",
          updatedAt: new Date()
        })
        .where(eq(maintenanceRequests.id, requestId));

      return true;
    } catch (error) {
      console.error("Error in AI maintenance analysis:", error);
      return false;
    }
  }

  /**
   * Implement the AI-suggested solution after admin approval
   */
  static async implementSolution(requestId: number): Promise<boolean> {
    try {
      // Get the request details with the AI solution
      const [request] = await db
        .select()
        .from(maintenanceRequests)
        .where(eq(maintenanceRequests.id, requestId));

      if (!request) {
        throw new Error(`Maintenance request #${requestId} not found`);
      }

      if (!request.adminApproval) {
        throw new Error(`Maintenance request #${requestId} has not been approved by an admin`);
      }

      if (!request.aiSolution) {
        throw new Error(`Maintenance request #${requestId} does not have an AI solution`);
      }

      // Mark as in progress
      await db
        .update(maintenanceRequests)
        .set({
          status: "in_progress",
          updatedAt: new Date()
        })
        .where(eq(maintenanceRequests.id, requestId));

      // Here you would implement the actual solution based on aiSolution
      // This could include code changes, configuration changes, etc.
      // For example, you might use the file system to make code changes

      // For now, we'll just simulate a delay and mark it as completed
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Mark as completed
      await db
        .update(maintenanceRequests)
        .set({
          status: "completed",
          completedAt: new Date(),
          updatedAt: new Date()
        })
        .where(eq(maintenanceRequests.id, requestId));

      return true;
    } catch (error) {
      console.error("Error implementing AI solution:", error);
      
      // Mark as failed
      await db
        .update(maintenanceRequests)
        .set({
          status: "failed",
          updatedAt: new Date()
        })
        .where(eq(maintenanceRequests.id, requestId));
        
      return false;
    }
  }
}