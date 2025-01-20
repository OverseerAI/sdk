import { OverseerConfig, ValidationOptions, ValidationResult, Policy, ValidationIssue } from './types';
import axios, { AxiosError } from 'axios';

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
      const response = await axios.post(
        `${this.baseUrl}/api/v1/validate`,
        {
          content: options.content,
          policies: options.policies || ['safety'],
          systemId: options.systemId,
          policyId: options.policyId
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
            ...(this.organizationId && { 'X-Organization-ID': this.organizationId })
          }
        }
      );

      const data = response.data;
      
      const issues: ValidationIssue[] | undefined = data.is_flagged ? [{
        type: 'data_protection',  // Default to data protection for backward compatibility
        code: data.safety_code,
        message: data.reasons?.[0] || 'Content policy violation',
        severity: 'high',
        category: data.safety_code ? `MLCommons ${data.safety_code}` : undefined,
        details: data.metadata
      }] : undefined;

      return {
        valid: !data.is_flagged,
        content: options.content,
        issues,
        safetyCode: data.safety_code,
        metadata: data.metadata
      };
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError;
        throw new Error(axiosError.response?.data?.message || axiosError.message);
      }
      throw error;
    }
  }

  /**
   * Get all available policies
   */
  async getPolicies(): Promise<Policy[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/api/v1/policies`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          ...(this.organizationId && { 'X-Organization-ID': this.organizationId })
        }
      });

      return response.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError;
        throw new Error(axiosError.response?.data?.message || axiosError.message);
      }
      throw error;
    }
  }

  /**
   * Create a new policy
   */
  async createPolicy(policy: Omit<Policy, 'id'>): Promise<Policy> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/api/v1/policies`,
        policy,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
            ...(this.organizationId && { 'X-Organization-ID': this.organizationId })
          }
        }
      );

      return response.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError;
        throw new Error(axiosError.response?.data?.message || axiosError.message);
      }
      throw error;
    }
  }
}
