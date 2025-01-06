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
  type: 'safety' | 'quality' | 'bias' | 'brand' | 'compliance';
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
}

export interface PolicyRules {
  safety?: {
    enabled: boolean;
    level: 'low' | 'medium' | 'high';
  };
  quality?: {
    enabled: boolean;
    minLength?: number;
    maxLength?: number;
    requiredElements?: string[];
  };
  bias?: {
    enabled: boolean;
    categories?: string[];
  };
  brand?: {
    enabled: boolean;
    protectedTerms?: string[];
    tone?: 'casual' | 'professional' | 'technical';
  };
  compliance?: {
    enabled: boolean;
    standards?: string[];
    customRules?: Record<string, any>;
  };
}
