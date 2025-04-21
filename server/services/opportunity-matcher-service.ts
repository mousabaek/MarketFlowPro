/**
 * Opportunity Matcher Service
 * 
 * This service uses AI to match users with the best opportunities across different platforms
 * based on their skills, interests, and past performance.
 */

import OpenAI from "openai";
import { storage } from "../storage";
import { z } from "zod";

// Initialize OpenAI client
// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Schema for the match request
export const OpportunityMatchRequestSchema = z.object({
  userId: z.number().optional(),
  userProfile: z.object({
    skills: z.array(z.string()),
    interests: z.array(z.string()),
    experience: z.string().optional(),
    preferredPlatforms: z.array(z.string()).optional(),
    preferredCategories: z.array(z.string()).optional(),
    preferredEarningModel: z.string().optional(),
    timeAvailability: z.string().optional(),
  }),
  matchCount: z.number().default(5),
});

export type OpportunityMatchRequest = z.infer<typeof OpportunityMatchRequestSchema>;

// Schema for the recommendation response
export const RecommendationSchema = z.object({
  id: z.string(),
  platform: z.string(),
  title: z.string(),
  description: z.string(),
  category: z.string(),
  matchScore: z.number().min(0).max(100),
  estimatedEarnings: z.string().optional(),
  timeCommitment: z.string().optional(),
  difficulty: z.string().optional(),
  reasonForRecommendation: z.string(),
  nextSteps: z.array(z.string()).optional(),
  requiresApplication: z.boolean().default(false),
  opportunityType: z.enum(['freelance', 'affiliate', 'both']),
  keywords: z.array(z.string()).optional(),
  expiresAt: z.string().optional(),
  directLink: z.string().optional(),
  platformMetadata: z.record(z.string(), z.any()).optional(),
  marketInsights: z.string().optional(),
  challengesAndSolutions: z.array(
    z.object({
      challenge: z.string(),
      solution: z.string()
    })
  ).optional(),
  complementarySkills: z.array(z.string()).optional(),
});

export type Recommendation = z.infer<typeof RecommendationSchema>;

export class OpportunityMatcherService {
  /**
   * Find and return the best matches across all platforms based on user profile
   */
  public async findMatches(matchRequest: OpportunityMatchRequest): Promise<Recommendation[]> {
    try {
      // 1. Gather opportunities from all connected platforms
      const opportunities = await this.gatherOpportunities(matchRequest);
      
      // 2. Use AI to analyze and rank opportunities based on the user profile
      const recommendations = await this.rankOpportunitiesWithAI(matchRequest, opportunities);
      
      return recommendations;
    } catch (error) {
      console.error("Error finding opportunity matches:", error);
      throw new Error("Failed to find opportunity matches");
    }
  }

  /**
   * Gather opportunities from all platforms the user has connected
   */
  private async gatherOpportunities(matchRequest: OpportunityMatchRequest): Promise<any[]> {
    try {
      // Get all platforms from storage
      const platforms = await storage.getPlatforms();
      const opportunities: any[] = [];

      // If user has preferred platforms, filter by those
      let filteredPlatforms = platforms;
      if (matchRequest.userProfile.preferredPlatforms && matchRequest.userProfile.preferredPlatforms.length > 0) {
        filteredPlatforms = platforms.filter(platform => 
          matchRequest.userProfile.preferredPlatforms?.includes(platform.name)
        );
      }

      // For each platform, gather relevant opportunities
      for (const platform of filteredPlatforms) {
        const platformOpportunities = await this.getOpportunitiesFromPlatform(platform, matchRequest);
        opportunities.push(...platformOpportunities);
      }

      return opportunities;
    } catch (error) {
      console.error("Error gathering opportunities:", error);
      return [];
    }
  }

  /**
   * Get opportunities from a specific platform
   */
  private async getOpportunitiesFromPlatform(platform: any, matchRequest: OpportunityMatchRequest): Promise<any[]> {
    switch (platform.name.toLowerCase()) {
      case 'freelancer':
        return this.getFreelancerOpportunities(platform.id);
      case 'clickbank':
        return this.getClickBankOpportunities(platform.id, matchRequest);
      case 'amazon associates':
        return this.getAmazonOpportunities(platform.id, matchRequest);
      case 'etsy':
        return this.getEtsyOpportunities(platform.id, matchRequest);
      default:
        return [];
    }
  }

  /**
   * Get opportunities from Freelancer.com
   */
  private async getFreelancerOpportunities(platformId: number): Promise<any[]> {
    try {
      // Placeholder for real API implementation
      // In a real implementation, we would call the Freelancer.com API
      // For now, we'll return mock data that the AI can use for analysis
      
      const mockFreelancerProjects = [
        {
          id: "freel-1",
          title: "React Developer for E-commerce Site",
          description: "Looking for an experienced React developer to build UI components for an e-commerce site.",
          category: "Web Development",
          skills: ["React", "JavaScript", "CSS", "UI/UX", "E-commerce"],
          budget: "$1000-$2000",
          timeFrame: "2-4 weeks",
          clientRating: 4.8,
          clientHistory: "10+ projects",
          platform: "Freelancer",
          opportunityType: "freelance",
          postedAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
        },
        {
          id: "freel-2",
          title: "WordPress Site Migration and Optimization",
          description: "Need help migrating WordPress site to new host and optimizing performance.",
          category: "WordPress",
          skills: ["WordPress", "PHP", "MySQL", "Server Administration", "Performance Optimization"],
          budget: "$500-$800",
          timeFrame: "1-2 weeks",
          clientRating: 4.5,
          clientHistory: "5+ projects",
          platform: "Freelancer",
          opportunityType: "freelance",
          postedAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days from now
        },
        {
          id: "freel-3",
          title: "AI Chatbot Development for Customer Service",
          description: "Looking to build an AI-powered chatbot for our customer service department using the latest NLP techniques.",
          category: "AI & Machine Learning",
          skills: ["Python", "AI", "NLP", "Machine Learning", "API Integration"],
          budget: "$3000-$5000",
          timeFrame: "4-8 weeks",
          clientRating: 4.9,
          clientHistory: "3+ projects",
          platform: "Freelancer",
          opportunityType: "freelance",
          postedAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days from now
        },
        {
          id: "freel-4",
          title: "Mobile App Development - Fitness Tracker",
          description: "Need a cross-platform mobile app for fitness tracking with social features.",
          category: "Mobile Development",
          skills: ["React Native", "Firebase", "Mobile Development", "UI/UX", "API Integration"],
          budget: "$2500-$4000",
          timeFrame: "2-3 months",
          clientRating: 4.7,
          clientHistory: "7+ projects",
          platform: "Freelancer",
          opportunityType: "freelance",
          postedAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days from now
        },
        {
          id: "freel-5",
          title: "Content Writing for Tech Blog",
          description: "Looking for a tech-savvy writer to create articles for our tech blog. Topics include AI, blockchain, and software development.",
          category: "Writing & Content",
          skills: ["Content Writing", "Technical Writing", "SEO", "Research", "Technology"],
          budget: "$50-$100 per article",
          timeFrame: "Ongoing",
          clientRating: 4.6,
          clientHistory: "15+ projects",
          platform: "Freelancer",
          opportunityType: "freelance",
          postedAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
        }
      ];
      
      return mockFreelancerProjects;
    } catch (error) {
      console.error("Error getting Freelancer opportunities:", error);
      return [];
    }
  }

  /**
   * Get opportunities from ClickBank
   */
  private async getClickBankOpportunities(platformId: number, matchRequest: OpportunityMatchRequest): Promise<any[]> {
    try {
      // In a real implementation, this would call the ClickBank API
      // For now, return mock data that the AI can use for matching
      
      const mockClickBankProducts = [
        {
          id: "cb-1",
          title: "Keto Diet Complete Guide",
          description: "The ultimate Keto Diet guide for weight loss and health improvement. High commission rates and proven conversion funnel.",
          category: "Health & Fitness",
          gravity: 250.5, // Popularity metric in ClickBank
          initialPrice: "$47",
          commission: "75%",
          avgEarningsPerSale: "$35.25",
          conversionRate: "3.2%",
          recurring: false,
          platform: "ClickBank",
          keywords: ["keto", "diet", "weight loss", "nutrition", "health"],
          opportunityType: "affiliate",
          vendor: {
            name: "HealthNow Inc.",
            rating: 4.8,
            products: 5
          },
          affiliate: {
            marketingMaterials: true,
            landingPages: true,
            emailSwipes: true
          }
        },
        {
          id: "cb-2",
          title: "Forex Trading Masterclass",
          description: "Comprehensive forex trading course with proven strategies. High ticket item with excellent commission structure.",
          category: "Business/Investing",
          gravity: 180.3,
          initialPrice: "$997",
          commission: "50%",
          avgEarningsPerSale: "$498.50",
          conversionRate: "1.5%",
          recurring: false,
          platform: "ClickBank",
          keywords: ["forex", "trading", "investment", "finance", "income"],
          opportunityType: "affiliate",
          vendor: {
            name: "ForexPro Trading",
            rating: 4.6,
            products: 3
          },
          affiliate: {
            marketingMaterials: true,
            landingPages: true,
            emailSwipes: true
          }
        },
        {
          id: "cb-3",
          title: "Photography Masterclass",
          description: "Learn professional photography from experts. Popular product with excellent customer satisfaction.",
          category: "Arts & Entertainment",
          gravity: 120.7,
          initialPrice: "$197",
          commission: "65%",
          avgEarningsPerSale: "$128.05",
          conversionRate: "2.8%",
          recurring: false,
          platform: "ClickBank",
          keywords: ["photography", "camera", "DSLR", "photo editing", "creative"],
          opportunityType: "affiliate",
          vendor: {
            name: "Creative Vision Studios",
            rating: 4.9,
            products: 2
          },
          affiliate: {
            marketingMaterials: true,
            landingPages: true,
            emailSwipes: false
          }
        },
        {
          id: "cb-4",
          title: "Yoga for Back Pain Relief",
          description: "Specialized yoga program targeting back pain issues. High conversion rates with monthly recurring subscription.",
          category: "Health & Fitness",
          gravity: 95.2,
          initialPrice: "$27",
          commission: "60%",
          avgEarningsPerSale: "$97.20", // Including lifetime value of subscription
          conversionRate: "4.1%",
          recurring: true,
          platform: "ClickBank",
          keywords: ["yoga", "back pain", "fitness", "health", "pain relief"],
          opportunityType: "affiliate",
          vendor: {
            name: "YogaWell Institute",
            rating: 4.7,
            products: 4
          },
          affiliate: {
            marketingMaterials: true,
            landingPages: false,
            emailSwipes: true
          }
        },
        {
          id: "cb-5",
          title: "DIY Solar Panel Installation Guide",
          description: "Step-by-step guide to install solar panels and reduce electricity bills. High commission with good conversion rates.",
          category: "Home & Garden",
          gravity: 85.9,
          initialPrice: "$67",
          commission: "70%",
          avgEarningsPerSale: "$46.90",
          conversionRate: "2.5%",
          recurring: false,
          platform: "ClickBank",
          keywords: ["solar", "renewable energy", "DIY", "home improvement", "electricity"],
          opportunityType: "affiliate",
          vendor: {
            name: "Green Energy Solutions",
            rating: 4.5,
            products: 2
          },
          affiliate: {
            marketingMaterials: true,
            landingPages: true,
            emailSwipes: true
          }
        }
      ];
      
      // If user has preferred categories, filter by those
      if (matchRequest.userProfile.preferredCategories && matchRequest.userProfile.preferredCategories.length > 0) {
        return mockClickBankProducts.filter(product => 
          matchRequest.userProfile.preferredCategories?.some(category => 
            product.category.toLowerCase().includes(category.toLowerCase())
          )
        );
      }
      
      return mockClickBankProducts;
    } catch (error) {
      console.error("Error getting ClickBank opportunities:", error);
      return [];
    }
  }

  /**
   * Get opportunities from Amazon Associates
   */
  private async getAmazonOpportunities(platformId: number, matchRequest: OpportunityMatchRequest): Promise<any[]> {
    try {
      // In a real implementation, this would call the Amazon API
      // For now, return mock data that the AI can use for matching
      
      const mockAmazonProducts = [
        {
          id: "amzn-1",
          title: "Premium Bluetooth Headphones",
          description: "High-quality noise cancelling headphones with excellent commission rates in the electronics category.",
          category: "Electronics",
          asin: "B07XYZABC1",
          price: "$129.99",
          commission: "4%",
          avgEarningsPerSale: "$5.20",
          estimatedMonthlyTraffic: "High",
          platform: "Amazon Associates",
          keywords: ["headphones", "bluetooth", "audio", "noise cancelling", "wireless"],
          opportunityType: "affiliate",
          rating: 4.6,
          reviewCount: 1250,
          trending: true
        },
        {
          id: "amzn-2",
          title: "Professional Knife Set",
          description: "Professional 15-piece knife set with stand. Popular in the kitchen category with good commission structure.",
          category: "Home & Kitchen",
          asin: "B08ABCXYZ2",
          price: "$89.99",
          commission: "4.5%",
          avgEarningsPerSale: "$4.05",
          estimatedMonthlyTraffic: "Medium",
          platform: "Amazon Associates",
          keywords: ["kitchen", "knives", "cooking", "chef", "utensils"],
          opportunityType: "affiliate",
          rating: 4.8,
          reviewCount: 875,
          trending: false
        },
        {
          id: "amzn-3",
          title: "Smart Fitness Tracker",
          description: "Advanced fitness tracker with heart rate monitoring. Trending in the sports category with excellent conversion rates.",
          category: "Sports & Outdoors",
          asin: "B09XYZDEF3",
          price: "$79.99",
          commission: "3%",
          avgEarningsPerSale: "$2.40",
          estimatedMonthlyTraffic: "Very High",
          platform: "Amazon Associates",
          keywords: ["fitness", "tracker", "smart watch", "exercise", "health"],
          opportunityType: "affiliate",
          rating: 4.5,
          reviewCount: 2240,
          trending: true
        },
        {
          id: "amzn-4",
          title: "Organic Skincare Set",
          description: "Premium organic skincare set with moisturizer, serum, and cleanser. High demand in beauty category.",
          category: "Beauty & Personal Care",
          asin: "B07DEFGHI4",
          price: "$59.99",
          commission: "5%",
          avgEarningsPerSale: "$3.00",
          estimatedMonthlyTraffic: "Medium",
          platform: "Amazon Associates",
          keywords: ["skincare", "organic", "beauty", "moisturizer", "natural"],
          opportunityType: "affiliate",
          rating: 4.7,
          reviewCount: 950,
          trending: true
        },
        {
          id: "amzn-5",
          title: "Home Office Ergonomic Chair",
          description: "Ergonomic office chair with lumbar support. Steady seller in the furniture category.",
          category: "Home Office",
          asin: "B08HIJKLM5",
          price: "$199.99",
          commission: "3.5%",
          avgEarningsPerSale: "$7.00",
          estimatedMonthlyTraffic: "High",
          platform: "Amazon Associates",
          keywords: ["office chair", "ergonomic", "home office", "furniture", "desk chair"],
          opportunityType: "affiliate",
          rating: 4.4,
          reviewCount: 1875,
          trending: false
        }
      ];
      
      // If user has preferred categories, filter by those
      if (matchRequest.userProfile.preferredCategories && matchRequest.userProfile.preferredCategories.length > 0) {
        return mockAmazonProducts.filter(product => 
          matchRequest.userProfile.preferredCategories?.some(category => 
            product.category.toLowerCase().includes(category.toLowerCase())
          )
        );
      }
      
      return mockAmazonProducts;
    } catch (error) {
      console.error("Error getting Amazon opportunities:", error);
      return [];
    }
  }

  /**
   * Get opportunities from Etsy
   */
  private async getEtsyOpportunities(platformId: number, matchRequest: OpportunityMatchRequest): Promise<any[]> {
    try {
      // In a real implementation, this would call the Etsy API
      // For now, return mock data that the AI can use for matching
      
      const mockEtsyListings = [
        {
          id: "etsy-1",
          title: "Handmade Leather Journal",
          description: "Unique handcrafted leather journals. Trending item with excellent affiliate potential.",
          category: "Craft Supplies",
          listingId: "123456789",
          price: "$45.99",
          commission: "3%",
          avgEarningsPerSale: "$1.38",
          estimatedMonthlyTraffic: "Medium",
          platform: "Etsy",
          keywords: ["journal", "leather", "handmade", "stationery", "gift"],
          opportunityType: "affiliate",
          shopName: "ArtisanLeatherCrafts",
          shopRating: 4.9,
          totalSales: 1250,
          trending: true
        },
        {
          id: "etsy-2",
          title: "Custom Portrait Illustration",
          description: "Personalized digital portraits. Popular gift item with good commission rates.",
          category: "Art & Collectibles",
          listingId: "987654321",
          price: "$35.00",
          commission: "3.5%",
          avgEarningsPerSale: "$1.23",
          estimatedMonthlyTraffic: "High",
          platform: "Etsy",
          keywords: ["portrait", "illustration", "custom", "digital art", "gift"],
          opportunityType: "affiliate",
          shopName: "DigitalArtWonder",
          shopRating: 4.8,
          totalSales: 3200,
          trending: true
        },
        {
          id: "etsy-3",
          title: "Handcrafted Ceramic Mug Set",
          description: "Set of 4 unique ceramic mugs. Steady seller with consistent commission earnings.",
          category: "Home & Living",
          listingId: "456789123",
          price: "$64.99",
          commission: "3%",
          avgEarningsPerSale: "$1.95",
          estimatedMonthlyTraffic: "Medium",
          platform: "Etsy",
          keywords: ["ceramic", "mug", "handmade", "kitchen", "pottery"],
          opportunityType: "affiliate",
          shopName: "CeramicStudioCrafts",
          shopRating: 4.7,
          totalSales: 875,
          trending: false
        },
        {
          id: "etsy-4",
          title: "Personalized Jewelry Box",
          description: "Custom wooden jewelry box with engraved name. Popular gift item with good conversion rates.",
          category: "Jewelry",
          listingId: "789123456",
          price: "$39.99",
          commission: "3.5%",
          avgEarningsPerSale: "$1.40",
          estimatedMonthlyTraffic: "Medium-High",
          platform: "Etsy",
          keywords: ["jewelry box", "personalized", "wood", "gift", "custom"],
          opportunityType: "affiliate",
          shopName: "CustomWoodDesigns",
          shopRating: 4.9,
          totalSales: 1450,
          trending: true
        },
        {
          id: "etsy-5",
          title: "Vintage Style Wall Art",
          description: "Set of 3 vintage botanical prints. Trending in home decor with steady commissions.",
          category: "Home Decor",
          listingId: "321654987",
          price: "$28.50",
          commission: "3%",
          avgEarningsPerSale: "$0.86",
          estimatedMonthlyTraffic: "High",
          platform: "Etsy",
          keywords: ["wall art", "vintage", "botanical", "prints", "decor"],
          opportunityType: "affiliate",
          shopName: "VintageArtPrints",
          shopRating: 4.8,
          totalSales: 2100,
          trending: true
        }
      ];
      
      // If user has preferred categories, filter by those
      if (matchRequest.userProfile.preferredCategories && matchRequest.userProfile.preferredCategories.length > 0) {
        return mockEtsyListings.filter(listing => 
          matchRequest.userProfile.preferredCategories?.some(category => 
            listing.category.toLowerCase().includes(category.toLowerCase())
          )
        );
      }
      
      return mockEtsyListings;
    } catch (error) {
      console.error("Error getting Etsy opportunities:", error);
      return [];
    }
  }

  /**
   * Use OpenAI to analyze and rank opportunities based on the user profile
   */
  private async rankOpportunitiesWithAI(
    matchRequest: OpportunityMatchRequest, 
    opportunities: any[]
  ): Promise<Recommendation[]> {
    try {
      if (opportunities.length === 0) {
        return [];
      }

      // Prepare the prompt for OpenAI
      const prompt = this.buildMatchingPrompt(matchRequest, opportunities);

      // Call the OpenAI API
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are an expert affiliate marketing and freelance opportunity matcher. Your task is to analyze a user profile and available opportunities, then rank and recommend the best matches. Provide thorough, data-driven reasoning for each recommendation."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.5, // Lower temperature for more focused recommendations
        max_tokens: 2500
      });

      // Parse the AI response
      const content = response.choices[0].message.content;
      if (!content) {
        throw new Error("AI returned empty response");
      }

      const aiResponse = JSON.parse(content);
      if (!aiResponse.recommendations || !Array.isArray(aiResponse.recommendations)) {
        throw new Error("Invalid AI response format");
      }

      // Map AI recommendations to our schema
      const recommendations: Recommendation[] = aiResponse.recommendations.map((rec: any, index: number) => ({
        id: rec.id || `rec-${index}`,
        platform: rec.platform,
        title: rec.title,
        description: rec.description,
        category: rec.category,
        matchScore: rec.matchScore,
        estimatedEarnings: rec.estimatedEarnings,
        timeCommitment: rec.timeCommitment,
        difficulty: rec.difficulty,
        reasonForRecommendation: rec.reasonForRecommendation,
        nextSteps: rec.nextSteps || [],
        requiresApplication: rec.requiresApplication || false,
        opportunityType: rec.opportunityType,
        keywords: rec.keywords || [],
        expiresAt: rec.expiresAt,
        directLink: rec.directLink
      }));

      return recommendations;
    } catch (error) {
      console.error("Error ranking opportunities with AI:", error);
      throw new Error("Failed to analyze opportunities with AI");
    }
  }

  /**
   * Build the prompt for the OpenAI API
   */
  private buildMatchingPrompt(matchRequest: OpportunityMatchRequest, opportunities: any[]): string {
    return `
# User Profile
Skills: ${matchRequest.userProfile.skills.join(", ")}
Interests: ${matchRequest.userProfile.interests.join(", ")}
${matchRequest.userProfile.experience ? `Experience: ${matchRequest.userProfile.experience}` : ''}
${matchRequest.userProfile.preferredPlatforms?.length ? `Preferred Platforms: ${matchRequest.userProfile.preferredPlatforms.join(", ")}` : ''}
${matchRequest.userProfile.preferredCategories?.length ? `Preferred Categories: ${matchRequest.userProfile.preferredCategories.join(", ")}` : ''}
${matchRequest.userProfile.preferredEarningModel ? `Preferred Earning Model: ${matchRequest.userProfile.preferredEarningModel}` : ''}
${matchRequest.userProfile.timeAvailability ? `Time Availability: ${matchRequest.userProfile.timeAvailability}` : ''}

# Available Opportunities
${JSON.stringify(opportunities, null, 2)}

# Task
Analyze the user profile and available opportunities in depth. Select the top ${matchRequest.matchCount} opportunities that best match the user's skills, interests, and preferences. Consider the following factors in your analysis:

## Matching Factors
1. Skill Alignment: How well the user's skills match the opportunity requirements
2. Interest Alignment: How well the user's interests align with the opportunity domain
3. Experience Level: Whether the opportunity matches the user's experience level
4. Platform Preference: Whether the opportunity is on a platform the user prefers
5. Category Preference: Whether the opportunity is in a category the user prefers
6. Earning Model: Whether the opportunity offers the user's preferred earning model
7. Time Commitment: Whether the opportunity fits the user's available time

## Platform-Specific Considerations
- For Freelancer opportunities: Consider project budget, timeline, client rating, and required skills
- For ClickBank opportunities: Consider gravity score, commission rate, average earnings per sale, and conversion rate
- For Amazon Associates opportunities: Consider commission rate, price point, popularity, and niche relevance
- For Etsy opportunities: Consider product popularity, commission structure, and audience overlap

For each recommendation, include:
1. Match score (0-100) calculated based on multiple factors
2. Detailed, personalized reasoning explaining why this opportunity is an excellent match for this specific user
3. Precise estimated earnings potential with realistic figures
4. Specific time commitment estimate with frequency (e.g., "10-15 hours/week for 3 weeks")
5. Appropriate difficulty level (Beginner, Intermediate, Advanced) with justification
6. Actionable, step-by-step next steps to pursue this opportunity
7. Relevant keywords that directly align with the user's profile
8. Platform-specific metadata relevant to the opportunity type

## Advanced Features
- Include specific strategies for maximizing success with each opportunity
- Provide data-driven insights about market conditions for each opportunity
- Highlight potential challenges and how to overcome them
- Suggest complementary skills that would enhance success

Return your recommendations in this JSON format:
{
  "recommendations": [
    {
      "id": "opportunity-id",
      "platform": "platform-name",
      "title": "opportunity-title",
      "description": "opportunity-description",
      "category": "opportunity-category",
      "matchScore": 85,
      "estimatedEarnings": "$X per hour/month",
      "timeCommitment": "X hours per week/month",
      "difficulty": "Beginner/Intermediate/Advanced",
      "reasonForRecommendation": "Detailed explanation of why this is a good match",
      "nextSteps": ["Step 1", "Step 2", "Step 3"],
      "requiresApplication": true/false,
      "opportunityType": "freelance/affiliate/both",
      "keywords": ["keyword1", "keyword2"],
      "expiresAt": "ISO date or null",
      "directLink": "URL or null",
      "platformMetadata": {
        // For Freelancer opportunities
        "clientRating": 4.8,
        "clientHistory": "10+ projects",
        "proposedBudget": "$X-$Y",
        
        // For affiliate opportunities (ClickBank, Amazon, Etsy)
        "commission": "X%",
        "conversionRate": "X%",
        "gravity": 250.5,
        "popularity": "High/Medium/Low",
        "recurring": true/false
      },
      "marketInsights": "Analysis of current market conditions for this opportunity",
      "challengesAndSolutions": [
        {"challenge": "Potential challenge", "solution": "Recommended solution"}
      ],
      "complementarySkills": ["skill1", "skill2"]
    }
  ]
}
`;
  }
}

export const opportunityMatcherService = new OpportunityMatcherService();