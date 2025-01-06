import { OverseerConfig, ValidationOptions, ValidationResult, Policy } from './types';

export class Overseer {
  private apiKey: string;
  private organizationId?: string;
  private baseUrl: string;

  constructor(config: OverseerConfig) {
    this.apiKey = config.apiKey;
    this.organizationId = config.organizationId;
    this.baseUrl = config.baseUrl || 'https://api.overseer.ai';
  }

  /**
   * Validate content against specified policies
   * 
   * @param options Validation options including content and policies
   * @returns Validation result with safety analysis
   */
  async validate(options: ValidationOptions): Promise<ValidationResult> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/validate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          ...(this.organizationId && { 'X-Organization-ID': this.organizationId })
        },
        body: JSON.stringify({
          content: options.content,
          policies: options.policies || ['safety'],
          systemId: options.systemId,
          policyId: options.policyId
        })
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.statusText}`);
      }

      const data = await response.json();
      
      return {
        valid: !data.is_flagged,
        content: options.content,
        issues: data.is_flagged ? [{
          type: 'safety',
          code: data.safety_code,
          message: data.reasons?.[0] || 'Content policy violation',
          severity: 'high',
          category: data.safety_code ? `MLCommons ${data.safety_code}` : undefined
        }] : undefined,
        safetyCode: data.safety_code,
        metadata: data.metadata
      };
    } catch (error) {
      throw new Error(`Validation failed: ${error.message}`);
    }
  }

  /**
   * Get all available policies
   * 
   * @returns List of configured policies
   */
  async getPolicies(): Promise<Policy[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/policies`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          ...(this.organizationId && { 'X-Organization-ID': this.organizationId })
        }
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      throw new Error(`Failed to fetch policies: ${error.message}`);
    }
  }

  /**
   * Create a new policy
   * 
   * @param policy Policy configuration
   * @returns Created policy
   */
  async createPolicy(policy: Omit<Policy, 'id'>): Promise<Policy> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/policies`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          ...(this.organizationId && { 'X-Organization-ID': this.organizationId })
        },
        body: JSON.stringify(policy)
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      throw new Error(`Failed to create policy: ${error.message}`);
    }
  }
}
