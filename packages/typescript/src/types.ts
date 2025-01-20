export interface OverseerConfig {
  apiKey: string;
  organizationId?: string;
  baseUrl?: string;
}

export interface ValidationOptions {
  content: string;
  policies?: string[];
  systemId?: string;
  policyId?: string;
}

export interface ValidationResult {
  valid: boolean;
  content: string;
  issues?: ValidationIssue[];
  safetyCode?: string;
  metadata?: Record<string, any>;
}

export interface ValidationIssue {
  type: 'jailbreak' | 'data_protection' | 'compliance' | 'ugc' | 'ai_decisions' | 'minor_protection' | 'brand_safety' | 'op_sec';
  code?: string;
  message: string;
  severity: 'low' | 'medium' | 'high';
  category?: string;
  details?: Record<string, any>;
}

export interface Policy {
  id: string;
  name: string;
  description?: string;
  rules: PolicyRules;
  status: 'active' | 'inactive' | 'archived';
  regions?: string[];
  use_types?: string[];
}

export interface PolicyRules {
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

// Region and use type constants
export const REGIONS = {
  GLOBAL: 'Global',
  NA: 'NA',
  EU: 'EU',
  UK: 'UK',
  APAC: 'APAC',
  LATAM: 'LATAM',
  IN: 'IN',
  CN: 'CN'
} as const;

export const USE_TYPES = {
  PERSONAL_DATA: 'personal_data',
  PAYMENTS: 'payments',
  FINANCIAL: 'financial',
  GOVERNMENT: 'government',
  MINORS: 'minors',
  HEALTHCARE: 'healthcare',
  UGC: 'ugc',
  AI_DECISIONS: 'ai_decisions'
} as const;
