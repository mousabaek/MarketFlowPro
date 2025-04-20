/**
 * API Key Manager Service
 * 
 * Handles secure storage and retrieval of API keys and tokens
 */
export class ApiKeyManager {
  private static instance: ApiKeyManager;
  private apiKeys: Map<string, string> = new Map();
  
  private constructor() {}
  
  /**
   * Get singleton instance
   */
  public static getInstance(): ApiKeyManager {
    if (!ApiKeyManager.instance) {
      ApiKeyManager.instance = new ApiKeyManager();
    }
    return ApiKeyManager.instance;
  }
  
  /**
   * Store API key with platform identifier
   */
  public storeApiKey(platformId: number, key: string): void {
    this.apiKeys.set(`platform_${platformId}`, key);
  }
  
  /**
   * Get API key for specific platform
   */
  public getApiKey(platformId: number): string | undefined {
    return this.apiKeys.get(`platform_${platformId}`);
  }
  
  /**
   * Remove API key for specific platform
   */
  public removeApiKey(platformId: number): boolean {
    return this.apiKeys.delete(`platform_${platformId}`);
  }
  
  /**
   * Check if API key exists for platform
   */
  public hasApiKey(platformId: number): boolean {
    return this.apiKeys.has(`platform_${platformId}`);
  }
  
  /**
   * Store OAuth token with platform identifier
   */
  public storeOAuthToken(platformId: number, token: string): void {
    this.apiKeys.set(`platform_${platformId}_oauth`, token);
  }
  
  /**
   * Get OAuth token for specific platform
   */
  public getOAuthToken(platformId: number): string | undefined {
    return this.apiKeys.get(`platform_${platformId}_oauth`);
  }
  
  /**
   * Clear all keys (mainly for testing purposes)
   */
  public clearAll(): void {
    this.apiKeys.clear();
  }
}

export const apiKeyManager = ApiKeyManager.getInstance();