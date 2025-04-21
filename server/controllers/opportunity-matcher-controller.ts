/**
 * Controller for Opportunity Matching API endpoints
 */

import { Request, Response } from "express";
import { OpportunityMatchRequestSchema, opportunityMatcherService } from "../services/opportunity-matcher-service";

export class OpportunityMatcherController {
  /**
   * Find AI-powered opportunity matches
   */
  static async findMatches(req: Request, res: Response) {
    try {
      // Validate request body
      const result = OpportunityMatchRequestSchema.safeParse(req.body);
      
      if (!result.success) {
        return res.status(400).json({
          success: false,
          message: "Invalid request data",
          errors: result.error.format()
        });
      }

      // Get matches from service
      const matches = await opportunityMatcherService.findMatches(result.data);
      
      return res.status(200).json({
        success: true,
        matches,
        count: matches.length
      });
    } catch (error) {
      console.error("Error finding opportunity matches:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to find opportunity matches",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  }

  /**
   * Get optimization suggestions for a specific opportunity
   */
  static async getOptimizationSuggestions(req: Request, res: Response) {
    try {
      const { opportunityId, platformName } = req.params;
      
      if (!opportunityId || !platformName) {
        return res.status(400).json({
          success: false,
          message: "Missing required parameters: opportunityId and platformName"
        });
      }

      // This would be implemented in a real system to provide AI-powered suggestions
      // for optimizing the user's approach to a specific opportunity
      // For now, return a mock response
      
      const suggestions = [
        {
          id: "sug-1",
          title: "Optimize your proposal headline",
          description: "Use keywords from the project description in your proposal headline to catch the client's attention.",
          priority: "High",
          estimatedImpact: "High",
          implementation: "Quick (5 minutes)"
        },
        {
          id: "sug-2",
          title: "Highlight relevant experience",
          description: "Mention specific experience with similar projects in your first paragraph.",
          priority: "High",
          estimatedImpact: "High",
          implementation: "Medium (15 minutes)"
        },
        {
          id: "sug-3",
          title: "Include a custom sample",
          description: "Create a small proof of concept that demonstrates your understanding of the project.",
          priority: "Medium",
          estimatedImpact: "Very High",
          implementation: "Extensive (1-2 hours)"
        }
      ];
      
      return res.status(200).json({
        success: true,
        opportunityId,
        platformName,
        suggestions,
        count: suggestions.length
      });
    } catch (error) {
      console.error("Error getting optimization suggestions:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to get optimization suggestions",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  }

  /**
   * Generate a custom strategy for pursuing a specific opportunity
   */
  static async generateStrategy(req: Request, res: Response) {
    try {
      const { opportunityId } = req.params;
      const { userProfile, platformName } = req.body;
      
      if (!opportunityId || !platformName || !userProfile) {
        return res.status(400).json({
          success: false,
          message: "Missing required parameters: opportunityId, platformName, and userProfile"
        });
      }

      // This would be implemented in a real system to provide a detailed AI-generated
      // strategy for pursuing a specific opportunity
      // For now, return a mock response
      
      const strategy = {
        id: `strategy-${opportunityId}`,
        opportunityId,
        platformName,
        title: "Custom Strategy for Success",
        overview: "This personalized strategy is designed to maximize your chances of success with this opportunity based on your skills and the specific requirements.",
        steps: [
          {
            id: "step-1",
            title: "Research the market",
            description: "Spend 30 minutes researching similar successful projects or products to understand what works.",
            timeEstimate: "30 minutes",
            resources: ["Market research tools", "Competitor analysis template"]
          },
          {
            id: "step-2",
            title: "Prepare your approach",
            description: "Develop a customized proposal or marketing plan that highlights your unique value proposition.",
            timeEstimate: "1-2 hours",
            resources: ["Proposal template", "Value proposition canvas"]
          },
          {
            id: "step-3",
            title: "Create supporting materials",
            description: "Develop any necessary samples, mock-ups, or promotional materials.",
            timeEstimate: "2-4 hours",
            resources: ["Design tools", "Content creation templates"]
          },
          {
            id: "step-4",
            title: "Submit and follow up",
            description: "Submit your work and follow up appropriately based on platform best practices.",
            timeEstimate: "30 minutes + follow-up time",
            resources: ["Follow-up schedule template", "Communication templates"]
          }
        ],
        estimatedTotalTime: "4-7 hours",
        successProbability: "High",
        potentialPitfalls: [
          "Not being specific enough in your approach",
          "Failing to demonstrate clear understanding of requirements",
          "Missing the optimal timing for submission"
        ],
        recommendedTools: [
          "Proposal template generator",
          "Keyword optimization tool",
          "Portfolio showcase builder"
        ]
      };
      
      return res.status(200).json({
        success: true,
        strategy
      });
    } catch (error) {
      console.error("Error generating strategy:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to generate strategy",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  }
}