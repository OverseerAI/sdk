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

export interface ValidationIssue {
  type: string;
  code?: string;
  message: string;
  severity: 'low' | 'medium' | 'high';
  category?: string;
}

export interface ValidationResult {
  valid: boolean;
  content: string;
  issues?: ValidationIssue[];
  safetyCode?: string;
  metadata?: Record<string, unknown>;
}

export interface Policy {
  id: string;
  name: string;
  description?: string;
  rules: PolicyRule[];
  metadata?: Record<string, unknown>;
}

export interface PolicyRule {
  id: string;
  type: string;
  config: Record<string, unknown>;
}
