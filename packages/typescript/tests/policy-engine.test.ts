import { Overseer } from '../src/client';
import { ValidationOptions } from '../src/types';
import { describe, expect, it, beforeEach } from '@jest/globals';

// Extend ValidationOptions to include policyConfig
declare module '../src/types' {
  interface ValidationOptions {
    policyConfig?: {
      brandSafety?: {
        detectTone?: boolean;
        detectProfanity?: boolean;
        brandKeywords?: string[];
      };
      compliance?: {
        detectHIPAA?: boolean;
        detectPII?: boolean;
      };
      customRules?: {
        keywords: string[];
        threshold: number;
      };
      [key: string]: any; // Allow for dynamic policy configurations
    };
  }
}

describe('Overseer Policy Engine', () => {
  const TEST_API_KEY = 'ovsk_test_key';
  const TEST_ORG_ID = 'org_test_123';
  const TEST_BASE_URL = 'http://localhost:8000';
  
  let client: Overseer;

  beforeEach(() => {
    client = new Overseer({
      apiKey: TEST_API_KEY,
      organizationId: TEST_ORG_ID,
      baseUrl: TEST_BASE_URL
    });
  });

  describe('Content Validation', () => {
    it('should allow safe content', async () => {
      const options: ValidationOptions = {
        content: 'Hello, how can I help you today?',
        policies: ['safety']
      };

      const result = await client.validate(options);
      expect(result.valid).toBe(true);
      expect(result.issues).toBeUndefined();
    });

    it('should detect harmful content', async () => {
      const options: ValidationOptions = {
        content: 'I will hack your system and steal your data',
        policies: ['safety']
      };

      const result = await client.validate(options);
      expect(result.valid).toBe(false);
      expect(result.issues).toBeDefined();
      expect(result.issues![0].type).toBe('safety');
      expect(result.issues![0].message.toLowerCase()).toContain('harmful');
    });
  });

  describe('Brand Safety Rules', () => {
    it('should detect brand safety violations', async () => {
      const options: ValidationOptions = {
        content: 'This is the best product ever, absolutely perfect!',
        policies: ['brandSafety'],
        policyConfig: {
          brandSafety: {
            detectTone: true,
            brandKeywords: ['best', 'perfect', 'greatest']
          }
        }
      };

      const result = await client.validate(options);
      expect(result.valid).toBe(false);
      expect(result.issues![0].category).toContain('brand');
    });
  });

  describe('Compliance Rules', () => {
    it('should detect HIPAA violations', async () => {
      const options: ValidationOptions = {
        content: 'Patient John Doe\'s blood pressure is 120/80',
        policies: ['compliance'],
        policyConfig: {
          compliance: {
            detectHIPAA: true,
            detectPII: true
          }
        }
      };

      const result = await client.validate(options);
      expect(result.valid).toBe(false);
      expect(result.issues).toBeDefined();
      expect(result.issues!.some(issue => 
        issue.message.toLowerCase().includes('hipaa') || 
        issue.message.toLowerCase().includes('pii')
      )).toBe(true);
    });
  });

  describe('Multiple Policy Violations', () => {
    it('should detect multiple violations', async () => {
      const options: ValidationOptions = {
        content: 'This damn patient\'s blood pressure is too high!',
        policies: ['brandSafety', 'compliance'],
        policyConfig: {
          brandSafety: {
            detectProfanity: true,
            detectTone: true
          },
          compliance: {
            detectHIPAA: true
          }
        }
      };

      const result = await client.validate(options);
      expect(result.valid).toBe(false);
      expect(result.issues!.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('Custom Policies', () => {
    it('should enforce custom policy rules', async () => {
      const options: ValidationOptions = {
        content: 'This is a confidential internal document',
        policies: ['custom'],
        policyConfig: {
          customRules: {
            keywords: ['confidential', 'internal', 'secret'],
            threshold: 0.8
          }
        }
      };

      const result = await client.validate(options);
      expect(result.valid).toBe(false);
      expect(result.issues).toBeDefined();
      expect(result.issues![0].category).toContain('custom');
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid API key', async () => {
      const invalidClient = new Overseer({
        apiKey: 'invalid_key',
        organizationId: TEST_ORG_ID,
        baseUrl: TEST_BASE_URL
      });

      const options: ValidationOptions = {
        content: 'test content',
        policies: ['safety']
      };

      await expect(invalidClient.validate(options))
        .rejects
        .toThrow(/unauthorized/i);
    });

    it('should handle invalid policy configuration', async () => {
      const options: ValidationOptions = {
        content: 'test content',
        policies: ['invalid'],
        policyConfig: {
          invalidRule: {
            nonexistentOption: true
          }
        }
      };

      await expect(client.validate(options))
        .rejects
        .toThrow(/invalid/i);
    });
  });

  describe('Batch Processing', () => {
    it('should handle batch content validation', async () => {
      const contents = [
        'Hello, how are you?',
        'I will hack your system',
        'Patient data is confidential'
      ];

      const results = await Promise.all(
        contents.map(content => 
          client.validate({ content, policies: ['safety'] })
        )
      );

      expect(results.length).toBe(3);
      expect(results[0].valid).toBe(true);  // Safe content
      expect(results[1].valid).toBe(false); // Harmful content
      expect(results[2].valid).toBe(false); // Compliance violation
    });
  });
}); 