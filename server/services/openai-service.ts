import OpenAI from "openai";
import { z } from "zod";

/**
 * OpenAI Service for AI-powered features
 */
export class OpenAIService {
  private client: OpenAI;
  private static instance: OpenAIService;

  private constructor() {
    // Initialize OpenAI client
    this.client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): OpenAIService {
    if (!OpenAIService.instance) {
      OpenAIService.instance = new OpenAIService();
    }
    return OpenAIService.instance;
  }

  /**
   * Generate a personalized proposal for a freelance project
   */
  public async generateProjectProposal(options: {
    projectTitle: string;
    projectDescription: string;
    skills: string[];
    budget?: string;
    userExperience?: string;
    userSkills?: string[];
  }): Promise<string> {
    try {
      const { 
        projectTitle, 
        projectDescription, 
        skills,
        budget,
        userExperience,
        userSkills
      } = options;

      // Create a system prompt to guide the AI
      const systemPrompt = `You are an expert freelance proposal writer assistant. 
Your goal is to help the user write personalized, persuasive proposals for freelance projects.
Generate a professional and engaging project proposal based on the provided information.
Highlight relevant experience and skills, and explain how the user can deliver value.
Be concise yet compelling, with a friendly and confident tone.
Format the proposal with appropriate sections.`;

      // User prompt with project details
      const userPrompt = `Please write a proposal for this project:
Title: ${projectTitle}
Description: ${projectDescription}
Skills Required: ${skills.join(", ")}
${budget ? `Budget: ${budget}` : ""}
${userExperience ? `My Experience: ${userExperience}` : ""}
${userSkills && userSkills.length > 0 ? `My Skills: ${userSkills.join(", ")}` : ""}

The proposal should include:
1. A personalized greeting
2. A brief introduction showing understanding of the project
3. Why I'm qualified for this project
4. My approach to completing the work
5. A brief closing statement`;

      // Generate completion using OpenAI API
      // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      const response = await this.client.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.7,
      });

      return response.choices[0].message.content || "Unable to generate proposal";
    } catch (error) {
      console.error("Error generating project proposal:", error);
      throw new Error(`Failed to generate project proposal: ${error.message}`);
    }
  }
  
  /**
   * Analyze a project to determine if it's suitable for bidding
   */
  public async analyzeProjectSuitability(options: {
    projectTitle: string;
    projectDescription: string;
    requiredSkills: string[];
    userSkills: string[];
    budget?: string;
  }): Promise<{
    suitabilityScore: number;
    reasoning: string;
    suggestedBid?: string;
  }> {
    try {
      const {
        projectTitle,
        projectDescription,
        requiredSkills,
        userSkills,
        budget
      } = options;

      // JSON schema to guide the AI response
      const systemPrompt = `You are an AI assistant that helps freelancers evaluate project opportunities.
Analyze the provided project details and determine how suitable it is for the user based on skill match.
Return your response as a valid JSON object with the following structure:
{
  "suitabilityScore": number from 0 to 10 indicating match quality,
  "reasoning": clear explanation of your reasoning,
  "suggestedBid": (only if budget is provided) suggested bid amount with brief justification
}`;

      const userPrompt = `Please analyze this project opportunity:
Project Title: ${projectTitle}
Project Description: ${projectDescription}
Required Skills: ${requiredSkills.join(", ")}
My Skills: ${userSkills.join(", ")}
${budget ? `Project Budget: ${budget}` : ""}

Evaluate how well my skills match the project requirements, identify any red flags in the description,
and provide a suitability score from 0-10, where 10 is perfect match.`;

      // Generate completion using OpenAI API
      // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      const response = await this.client.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        response_format: { type: "json_object" },
        temperature: 0.3,
      });

      const content = response.choices[0].message.content || "";
      
      try {
        const result = JSON.parse(content);
        return {
          suitabilityScore: result.suitabilityScore,
          reasoning: result.reasoning,
          suggestedBid: result.suggestedBid
        };
      } catch (parseError) {
        console.error("Error parsing JSON response:", parseError);
        return {
          suitabilityScore: 0,
          reasoning: "Error analyzing project suitability"
        };
      }
    } catch (error) {
      console.error("Error analyzing project suitability:", error);
      throw new Error(`Failed to analyze project: ${error.message}`);
    }
  }
  
  /**
   * Generate a personalized response to a client message
   */
  public async generateClientResponse(options: {
    clientMessage: string;
    projectContext: string;
    previousMessages?: { role: string; content: string }[];
  }): Promise<string> {
    try {
      const { clientMessage, projectContext, previousMessages = [] } = options;

      // System prompt
      const systemPrompt = `You are a professional freelancer's AI assistant.
Help craft polite, clear, and helpful responses to client messages.
Maintain a professional tone while being friendly and solution-oriented.
Consider the project context when formulating your response.`;

      // Build conversation history
      const messages: Array<{ role: "system" | "user" | "assistant"; content: string }> = [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Project Context: ${projectContext}` }
      ];

      // Add previous messages if they exist
      if (previousMessages.length > 0) {
        previousMessages.forEach(msg => {
          if (["user", "assistant", "system"].includes(msg.role)) {
            messages.push({
              role: msg.role as "user" | "assistant" | "system",
              content: msg.content
            });
          }
        });
      }

      // Add the current client message
      messages.push({ role: "user", content: `Client Message: ${clientMessage}\n\nPlease help me craft a professional response.` });

      // Generate completion using OpenAI API
      // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      const response = await this.client.chat.completions.create({
        model: "gpt-4o",
        messages,
        temperature: 0.7,
      });

      return response.choices[0].message.content || "Unable to generate response";
    } catch (error) {
      console.error("Error generating client response:", error);
      throw new Error(`Failed to generate client response: ${error.message}`);
    }
  }
}

// Zod schemas for validating request bodies
export const proposalGenerationSchema = z.object({
  projectTitle: z.string(),
  projectDescription: z.string(),
  skills: z.array(z.string()),
  budget: z.string().optional(),
  userExperience: z.string().optional(),
  userSkills: z.array(z.string()).optional(),
});

export const projectAnalysisSchema = z.object({
  projectTitle: z.string(),
  projectDescription: z.string(),
  requiredSkills: z.array(z.string()),
  userSkills: z.array(z.string()),
  budget: z.string().optional(),
});

export const clientResponseSchema = z.object({
  clientMessage: z.string(),
  projectContext: z.string(),
  previousMessages: z.array(
    z.object({
      role: z.enum(["user", "assistant", "system"]),
      content: z.string(),
    })
  ).optional(),
});

// Export singleton instance
export const openAIService = OpenAIService.getInstance();