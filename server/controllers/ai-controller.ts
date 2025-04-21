import { Request, Response } from "express";
import { openAIService, proposalGenerationSchema, projectAnalysisSchema, clientResponseSchema } from "../services/openai-service";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

/**
 * Controller for AI-related endpoints
 */
export class AIController {
  /**
   * Generate a project proposal with AI
   */
  static async generateProposal(req: Request, res: Response) {
    try {
      // Validate request body
      const validatedData = proposalGenerationSchema.parse(req.body);
      
      // Generate proposal
      const proposal = await openAIService.generateProjectProposal(validatedData);
      
      // Return proposal
      return res.status(200).json({ proposal });
    } catch (error: any) {
      console.error("Error generating proposal:", error);
      
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ 
          error: "Invalid request data", 
          details: validationError.message 
        });
      }
      
      return res.status(500).json({ 
        error: "Failed to generate proposal", 
        message: error.message 
      });
    }
  }
  
  /**
   * Analyze project suitability with AI
   */
  static async analyzeProject(req: Request, res: Response) {
    try {
      // Validate request body
      const validatedData = projectAnalysisSchema.parse(req.body);
      
      // Analyze project
      const analysis = await openAIService.analyzeProjectSuitability(validatedData);
      
      // Return analysis
      return res.status(200).json(analysis);
    } catch (error: any) {
      console.error("Error analyzing project:", error);
      
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ 
          error: "Invalid request data", 
          details: validationError.message 
        });
      }
      
      return res.status(500).json({ 
        error: "Failed to analyze project", 
        message: error.message 
      });
    }
  }
  
  /**
   * Generate client response with AI
   */
  static async generateClientResponse(req: Request, res: Response) {
    try {
      // Validate request body
      const validatedData = clientResponseSchema.parse(req.body);
      
      // Generate response
      const response = await openAIService.generateClientResponse(validatedData);
      
      // Return response
      return res.status(200).json({ response });
    } catch (error: any) {
      console.error("Error generating client response:", error);
      
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ 
          error: "Invalid request data", 
          details: validationError.message 
        });
      }
      
      return res.status(500).json({ 
        error: "Failed to generate client response", 
        message: error.message 
      });
    }
  }
}