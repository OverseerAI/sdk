/**
 * @jest-environment node
 */

import { Overseer } from '../src/client';
import { ValidationOptions } from '../src/types';
import { describe, expect, it, beforeEach, jest } from '@jest/globals';

// Mock cross-fetch module
jest.mock('cross-fetch', () => ({
  __esModule: true,
  default: jest.fn()
}));

import fetch from 'cross-fetch';
const mockedFetch = fetch as jest.MockedFunction<typeof fetch>;

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
    mockedFetch.mockClear();
  });

  describe('Content Validation', () => {
    it('should allow safe content', async () => {
      const options: ValidationOptions = {
        content: 'Hello, how can I help you today?',
        policies: ['safety']
      };

      mockedFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          is_flagged: false,
          safety_code: null,
          reasons: []
        })
      } as Response);

      const result = await client.validate(options);
      expect(result.valid).toBe(true);
      expect(result.issues).toBeUndefined();
    });

    it('should detect harmful content', async () => {
      const options: ValidationOptions = {
        content: 'I will hack your system and steal your data',
        policies: ['safety']
      };

      mockedFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          is_flagged: true,
          safety_code: 'S2',
          reasons: ['Harmful content detected']
        })
      } as Response);

      const result = await client.validate(options);
      expect(result.valid).toBe(false);
      expect(result.issues).toBeDefined();
      expect(result.issues![0].type).toBe('safety');
      expect(result.issues![0].message.toLowerCase()).toContain('harmful');
    });

    it('should handle API errors gracefully', async () => {
      const options: ValidationOptions = {
        content: 'Test content',
        policies: ['safety']
      };

      mockedFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        text: async () => 'Invalid API key'
      } as Response);

      await expect(client.validate(options)).rejects.toThrow('API request failed: Invalid API key');
    });

    it('should handle network errors', async () => {
      const options: ValidationOptions = {
        content: 'Test content',
        policies: ['safety']
      };

      mockedFetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(client.validate(options)).rejects.toThrow('Network error');
    });
  });

  describe('Policy Management', () => {
    it('should fetch policies', async () => {
      const mockPolicies = [
        {
          id: 'pol_1',
          name: 'Safety Policy',
          description: 'Basic safety checks',
          rules: [{ id: 'rule_1', type: 'safety', config: {} }]
        }
      ];

      mockedFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockPolicies
      } as Response);

      const policies = await client.getPolicies();
      expect(policies).toEqual(mockPolicies);
    });

    it('should create a new policy', async () => {
      const newPolicy = {
        name: 'Custom Policy',
        description: 'Custom safety rules',
        rules: [{ id: 'rule_1', type: 'custom', config: {} }]
      };

      const mockResponse = {
        id: 'pol_2',
        ...newPolicy
      };

      mockedFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      } as Response);

      const policy = await client.createPolicy(newPolicy);
      expect(policy).toEqual(mockResponse);
    });

    it('should handle policy creation errors', async () => {
      const invalidPolicy = {
        name: '',
        rules: []
      };

      mockedFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        text: async () => 'Invalid policy configuration'
      } as Response);

      await expect(client.createPolicy(invalidPolicy)).rejects.toThrow('API request failed: Invalid policy configuration');
    });
  });

  describe('Configuration', () => {
    it('should use default base URL if not provided', () => {
      const defaultClient = new Overseer({
        apiKey: TEST_API_KEY
      });
      expect(defaultClient['baseUrl']).toBe('https://api.overseerai.app');
    });

    it('should include organization ID in headers when provided', async () => {
      const options: ValidationOptions = {
        content: 'Test content',
        policies: ['safety']
      };

      mockedFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ is_flagged: false })
      } as Response);

      await client.validate(options);

      expect(mockedFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            'X-Organization-ID': TEST_ORG_ID
          })
        })
      );
    });
  });
}); 