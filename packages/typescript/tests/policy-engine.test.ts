/**
 * @jest-environment node
 */

import { Overseer } from '../src/client';
import { ValidationOptions, Policy } from '../src/types';
import axios, { AxiosError } from 'axios';
import { describe, expect, it, beforeEach, jest } from '@jest/globals';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('Overseer SDK', () => {
  const client = new Overseer({
    apiKey: 'test-key',
    organizationId: 'test-org'
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('validate', () => {
    it('should allow safe content', async () => {
      mockedAxios.post.mockResolvedValueOnce({
        data: {
          is_flagged: false,
          safety_code: null,
          metadata: {}
        }
      });

      const result = await client.validate({
        content: 'Hello world'
      });

      expect(result.valid).toBe(true);
      expect(result.issues).toBeUndefined();
    });

    it('should reject unsafe content', async () => {
      mockedAxios.post.mockResolvedValueOnce({
        data: {
          is_flagged: true,
          safety_code: 'UNSAFE_CONTENT',
          reasons: ['Content violates policy'],
          metadata: { category: 'unsafe' }
        }
      });

      const result = await client.validate({
        content: 'Unsafe content'
      });

      expect(result.valid).toBe(false);
      expect(result.issues).toHaveLength(1);
      expect(result.issues![0].type).toBe('data_protection');
      expect(result.issues![0].message).toBe('Content violates policy');
    });

    it('should handle API errors', async () => {
      mockedAxios.post.mockRejectedValueOnce(new Error('API Error'));

      await expect(client.validate({
        content: 'Test content'
      })).rejects.toThrow('API Error');
    });
  });

  describe('policies', () => {
    it('should get policies', async () => {
      const mockPolicies: Policy[] = [{
        id: '1',
        name: 'Test Policy',
        description: 'A test policy',
        status: 'active',
        rules: {
          jailbreak: {
            enabled: true,
            detectPromptInjection: true
          },
          dataProtection: {
            enabled: true,
            detectPII: true
          }
        }
      }];

      mockedAxios.get.mockResolvedValueOnce({ data: mockPolicies });

      const policies = await client.getPolicies();
      expect(policies).toEqual(mockPolicies);
    });

    it('should create policy', async () => {
      const newPolicy: Omit<Policy, 'id'> = {
        name: 'New Policy',
        description: 'A new test policy',
        status: 'active',
        rules: {
          jailbreak: {
            enabled: true,
            detectPromptInjection: true
          },
          dataProtection: {
            enabled: true,
            detectPII: true
          }
        }
      };

      const mockResponse = {
        id: '2',
        ...newPolicy
      };

      mockedAxios.post.mockResolvedValueOnce({ data: mockResponse });

      const policy = await client.createPolicy(newPolicy);
      expect(policy).toEqual(mockResponse);
    });

    it('should handle invalid policy creation', async () => {
      const invalidPolicy = {
        name: 'Invalid Policy',
        rules: {}
      };

      const mockError = new Error('Invalid policy configuration') as AxiosError;
      mockError.isAxiosError = true;
      mockError.response = {
        data: { message: 'Invalid policy configuration' },
        status: 400,
        statusText: 'Bad Request',
        headers: {},
        config: {} as any
      };

      mockedAxios.post.mockRejectedValueOnce(mockError);

      await expect(client.createPolicy(invalidPolicy as any)).rejects.toThrow('Invalid policy configuration');
    });
  });
}); 