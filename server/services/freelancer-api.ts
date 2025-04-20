import axios from 'axios';
import { z } from 'zod';

/**
 * Freelancer.com API Service
 * 
 * Documentation: https://developers.freelancer.com/
 */
export class FreelancerApiService {
  private baseUrl = 'https://www.freelancer.com/api';
  private apiKey: string;
  private oauth_token: string | null;
  
  constructor(apiKey: string, oauth_token: string | null = null) {
    this.apiKey = apiKey;
    this.oauth_token = oauth_token;
  }
  
  /**
   * Get authentication headers for API requests
   */
  private getHeaders() {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    // Use OAuth token if available, otherwise use API key
    if (this.oauth_token) {
      headers['Authorization'] = `OAuth ${this.oauth_token}`;
    } else {
      headers['freelancer-oauth-v1'] = this.apiKey;
    }
    
    return headers;
  }
  
  /**
   * Test the API connection
   */
  public async testConnection(): Promise<boolean> {
    try {
      const response = await axios.get(`${this.baseUrl}/users/0.1/self`, { 
        headers: this.getHeaders() 
      });
      return response.status === 200;
    } catch (error) {
      console.error('Error testing Freelancer.com API connection:', error);
      return false;
    }
  }
  
  /**
   * Get user profile information
   */
  public async getUserProfile() {
    try {
      const response = await axios.get(`${this.baseUrl}/users/0.1/self`, { 
        headers: this.getHeaders() 
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }
  }
  
  /**
   * Search for projects matching specific criteria
   */
  public async searchProjects(options: {
    query?: string;
    limit?: number;
    offset?: number;
    job_details?: boolean;
    min_budget?: number;
    max_budget?: number;
    skillIds?: number[];
  }) {
    try {
      const params = new URLSearchParams();
      
      if (options.query) params.append('query', options.query);
      if (options.limit) params.append('limit', options.limit.toString());
      if (options.offset) params.append('offset', options.offset.toString());
      if (options.job_details) params.append('job_details', options.job_details.toString());
      if (options.min_budget) params.append('min_budget', options.min_budget.toString());
      if (options.max_budget) params.append('max_budget', options.max_budget.toString());
      if (options.skillIds && options.skillIds.length > 0) {
        params.append('jobs[]', options.skillIds.join(','));
      }
      
      const response = await axios.get(`${this.baseUrl}/projects/0.1/projects/active?${params.toString()}`, {
        headers: this.getHeaders()
      });
      
      return response.data;
    } catch (error) {
      console.error('Error searching projects:', error);
      throw error;
    }
  }
  
  /**
   * Get project details by ID
   */
  public async getProjectDetails(projectId: number) {
    try {
      const response = await axios.get(`${this.baseUrl}/projects/0.1/projects/${projectId}`, {
        headers: this.getHeaders()
      });
      
      return response.data;
    } catch (error) {
      console.error(`Error getting project details for ID ${projectId}:`, error);
      throw error;
    }
  }
  
  /**
   * Submit a bid on a project
   */
  public async submitBid(projectId: number, options: {
    amount: number;
    period: number;
    milestone_percentage: number;
    description: string;
  }) {
    try {
      const response = await axios.post(
        `${this.baseUrl}/projects/0.1/bids/`,
        {
          project_id: projectId,
          bidder_id: 'self',
          amount: options.amount,
          period: options.period,
          milestone_percentage: options.milestone_percentage,
          description: options.description
        },
        { headers: this.getHeaders() }
      );
      
      return response.data;
    } catch (error) {
      console.error(`Error submitting bid for project ${projectId}:`, error);
      throw error;
    }
  }
  
  /**
   * Get list of available skills/jobs
   */
  public async getSkills() {
    try {
      const response = await axios.get(`${this.baseUrl}/projects/0.1/jobs`, {
        headers: this.getHeaders()
      });
      
      return response.data;
    } catch (error) {
      console.error('Error fetching skills list:', error);
      throw error;
    }
  }
  
  /**
   * Get bidding stats and analytics
   */
  public async getBiddingStats() {
    try {
      const response = await axios.get(`${this.baseUrl}/users/0.1/self/bidding_stats`, {
        headers: this.getHeaders()
      });
      
      return response.data;
    } catch (error) {
      console.error('Error fetching bidding stats:', error);
      throw error;
    }
  }
  
  /**
   * Get current bids
   */
  public async getCurrentBids() {
    try {
      const response = await axios.get(`${this.baseUrl}/projects/0.1/bids`, {
        headers: this.getHeaders(),
        params: {
          bidder_id: 'self',
          status: 'active',
        }
      });
      
      return response.data;
    } catch (error) {
      console.error('Error fetching current bids:', error);
      throw error;
    }
  }
}

// Zod schema for search parameters
export const SearchParamsSchema = z.object({
  query: z.string().optional(),
  limit: z.number().min(1).max(100).optional().default(10),
  offset: z.number().min(0).optional().default(0),
  job_details: z.boolean().optional().default(true),
  min_budget: z.number().min(0).optional(),
  max_budget: z.number().min(0).optional(),
  skillIds: z.array(z.number()).optional(),
});

// Zod schema for bid submission
export const BidSubmissionSchema = z.object({
  projectId: z.number(),
  amount: z.number().min(1),
  period: z.number().min(1),
  milestone_percentage: z.number().min(10).max(100),
  description: z.string().min(20),
});