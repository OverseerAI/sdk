import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { Overseer } from './index';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('Overseer SDK', () => {
  const sdk = new Overseer({
    apiKey: 'test-api-key',
    baseUrl: 'http://localhost:8000'
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should allow safe content', async () => {
    mockedAxios.post.mockResolvedValueOnce({
      data: {
        is_allowed: true,
        text: 'Hello! How can I help you today?',
        details: { reason: null }
      }
    });

    const result = await sdk.validate('Hello! How can I help you today?');
    expect(result.isAllowed).toBe(true);
    expect(result.text).toBe('Hello! How can I help you today?');
  });

  it('should reject unsafe content', async () => {
    mockedAxios.post.mockResolvedValueOnce({
      data: {
        is_allowed: false,
        text: "Sorry, I can't help with that!",
        details: { reason: 'Content violates safety policy' }
      }
    });

    const result = await sdk.validate('I will hack your system');
    expect(result.isAllowed).toBe(false);
    expect(result.text).toBe("Sorry, I can't help with that!");
    expect(result.details?.reason).toBe('Content violates safety policy');
  });

  it('should handle API errors', async () => {
    mockedAxios.post.mockRejectedValueOnce(new Error('Invalid API key'));

    await expect(sdk.validate('test')).rejects.toThrow('Invalid API key');
  });
}); 