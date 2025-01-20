import axios, { AxiosError } from 'axios';

interface OverseerConfig {
  apiKey: string;
  organizationId?: string;
  baseUrl?: string;
}

interface ValidationOptions {
  content: string;
  policies?: string[];
  systemId?: string;
  policyId?: string;
}

interface ValidationResult {
  valid: boolean;
  content: string;
  issues?: ValidationIssue[];
  safetyCode?: string;
  metadata?: Record<string, any>;
}

interface ValidationIssue {
  type: 'jailbreak' | 'data_protection' | 'compliance' | 'ugc' | 'ai_decisions' | 'minor_protection' | 'brand_safety' | 'op_sec';
  code?: string;
  message: string;
  severity: 'low' | 'medium' | 'high';
  category?: string;
  details?: Record<string, any>;
}

interface Policy {
  id: string;
  name: string;
  description?: string;
  rules: PolicyRules;
  status: 'active' | 'inactive' | 'archived';
  regions?: string[];
  use_types?: string[];
}

interface PolicyRules {
  // Base protection
  jailbreak?: {
    enabled: boolean;
    detectPromptInjection?: boolean;
    detectRoleplay?: boolean;
    detectCodeExecution?: boolean;
    customPatterns?: string[];
    threshold?: number;
  };

  // Data protection
  dataProtection?: {
    enabled: boolean;
    detectPII?: boolean;
    detectSourceCode?: boolean;
    detectCredentials?: boolean;
    sensitiveKeywords?: string[];
    threshold?: number;
    patterns?: Record<string, {
      pattern: string;
      description: string;
      example: string;
    }>;
  };

  // Compliance
  compliance?: {
    enabled: boolean;
    detectGDPR?: boolean;
    detectUKGDPR?: boolean;
    detectCCPA?: boolean;
    detectPIPL?: boolean;
    detectPDPL?: boolean;
    detectAPEC?: boolean;
    detectLGPD?: boolean;
    complianceKeywords?: string[];
    threshold?: number;
  };

  // UGC controls
  ugc?: {
    enabled: boolean;
    detectProfanity?: boolean;
    detectHate?: boolean;
    detectViolence?: boolean;
    moderationLevel?: 'strict' | 'standard';
  };

  // AI decision-making
  aiDecisions?: {
    enabled: boolean;
    requireExplanation?: boolean;
    detectBias?: boolean;
    detectDiscrimination?: boolean;
    humanOversight?: boolean;
    appealProcess?: boolean;
  };

  // Minor protection
  minorProtection?: {
    enabled: boolean;
    detectAgeRestricted?: boolean;
    requireParentalConsent?: boolean;
    strictDataCollection?: boolean;
    coppaCompliance?: boolean;
  };

  // Brand safety
  brandSafety?: {
    enabled: boolean;
    detectProfanity?: boolean;
    detectBias?: boolean;
    detectTone?: boolean;
    brandKeywords?: string[];
    threshold?: number;
  };

  // Operational security
  opSec?: {
    enabled: boolean;
    detectInfrastructure?: boolean;
    detectEmployeeInfo?: boolean;
    detectSecurityPractices?: boolean;
    opsecKeywords?: string[];
    threshold?: number;
  };
}

interface APIErrorResponse {
  message: string;
}

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
        const axiosError = error as AxiosError<APIErrorResponse>;
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
        const axiosError = error as AxiosError<APIErrorResponse>;
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
        const axiosError = error as AxiosError<APIErrorResponse>;
        throw new Error(axiosError.response?.data?.message || axiosError.message);
      }
      throw error;
    }
  }
}

// Default export
export default Overseer; 