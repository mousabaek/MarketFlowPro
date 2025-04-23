import { Request, Response } from 'express';
import { OpenAIService } from '../services/openai-service';
import { z } from 'zod';

// Validation schema for story generation request
const storyGenerationSchema = z.object({
  industry: z.string().optional(),
  targetAudience: z.string().optional(),
  storyType: z.enum(['case_study', 'success_story', 'personal_narrative', 'product_story']).optional(),
  toneOfVoice: z.enum(['professional', 'friendly', 'authoritative', 'conversational']).optional(),
  keywords: z.array(z.string()).optional(),
  includeCallToAction: z.boolean().optional(),
  maxLength: z.number().min(100).max(2000).optional(),
  affiliateProduct: z.string().optional(),
  platformName: z.string().optional()
});

// Validation schema for project proposal
const projectProposalSchema = z.object({
  clientName: z.string().optional(),
  projectType: z.string(),
  deliverables: z.array(z.string()),
  timeline: z.string().optional(),
  budget: z.string().optional(),
  skills: z.array(z.string()).optional(),
  toneOfVoice: z.enum(['professional', 'friendly', 'authoritative', 'conversational']).optional()
});

// Validation schema for project analysis
const projectAnalysisSchema = z.object({
  projectDescription: z.string(),
  targetPlatforms: z.array(z.string()).optional(),
  budget: z.string().optional(),
  timeline: z.string().optional(),
  keyObjectives: z.array(z.string()).optional()
});

// Validation schema for client response
const clientResponseSchema = z.object({
  clientMessage: z.string(),
  projectContext: z.string().optional(),
  relationshipLength: z.string().optional(),
  responseType: z.enum(['agreement', 'clarification', 'resolution', 'general']).optional(),
  toneOfVoice: z.enum(['professional', 'friendly', 'authoritative', 'conversational']).optional()
});

/**
 * Controller for AI-related endpoints
 */
export class AIController {
  /**
   * Generate a professional marketing story with AI
   */
  static async generateStory(req: Request, res: Response) {
    try {
      // Validate request body
      const validationResult = storyGenerationSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ 
          error: 'Invalid request parameters', 
          details: validationResult.error.format() 
        });
      }

      // Generate the story using OpenAI service
      const story = await OpenAIService.generateStory(validationResult.data);
      
      // Return the generated story
      return res.status(200).json(story);
    } catch (error: any) {
      console.error('Error in generateStory controller:', error);
      return res.status(500).json({ error: error.message || 'Failed to generate story' });
    }
  }

  /**
   * Generate a project proposal with AI
   */
  static async generateProposal(req: Request, res: Response) {
    try {
      // Validate request body
      const validationResult = projectProposalSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ 
          error: 'Invalid request parameters', 
          details: validationResult.error.format() 
        });
      }

      // TODO: Implement proposal generation functionality
      // This is a placeholder for future implementation
      
      return res.status(501).json({ message: 'Proposal generation feature coming soon' });
    } catch (error: any) {
      console.error('Error in generateProposal controller:', error);
      return res.status(500).json({ error: error.message || 'Failed to generate proposal' });
    }
  }

  /**
   * Analyze project suitability with AI
   */
  static async analyzeProject(req: Request, res: Response) {
    try {
      // Validate request body
      const validationResult = projectAnalysisSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ 
          error: 'Invalid request parameters', 
          details: validationResult.error.format() 
        });
      }

      // TODO: Implement project analysis functionality
      // This is a placeholder for future implementation
      
      return res.status(501).json({ message: 'Project analysis feature coming soon' });
    } catch (error: any) {
      console.error('Error in analyzeProject controller:', error);
      return res.status(500).json({ error: error.message || 'Failed to analyze project' });
    }
  }

  /**
   * Generate client response with AI
   */
  static async generateClientResponse(req: Request, res: Response) {
    try {
      // Validate request body
      const validationResult = clientResponseSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ 
          error: 'Invalid request parameters', 
          details: validationResult.error.format() 
        });
      }

      // TODO: Implement client response generation functionality
      // This is a placeholder for future implementation
      
      return res.status(501).json({ message: 'Client response generation feature coming soon' });
    } catch (error: any) {
      console.error('Error in generateClientResponse controller:', error);
      return res.status(500).json({ error: error.message || 'Failed to generate client response' });
    }
  }
}