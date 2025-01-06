import { OverseerConfig, ValidationOptions, ValidationResult, Policy } from './types';
import fetch from 'cross-fetch';

export class Overseer {
  private apiKey: string;
  private organizationId?: string;
  private baseUrl: string;

  constructor(config: OverseerConfig) {
    this.apiKey = config.apiKey;
    this.organizationId = config.organizationId;
    this.baseUrl = config.baseUrl || 'https://api.overseerai.app';
  }

  /**
   * Validate content against specified policies
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
        const errorText = await response.text();
        throw new Error(`API request failed: ${errorText}`);
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
      // Re-throw fetch errors directly
      if (error instanceof Error) {
        throw error;
      }
      // Handle unknown error types
      throw new Error('An unknown error occurred');
    }
  }

  /**
   * Get all available policies
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
        const errorText = await response.text();
        throw new Error(`API request failed: ${errorText}`);
      }

      return response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('An unknown error occurred');
    }
  }

  /**
   * Create a new policy
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
        const errorText = await response.text();
        throw new Error(`API request failed: ${errorText}`);
      }

      return response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('An unknown error occurred');
    }
  }
}
