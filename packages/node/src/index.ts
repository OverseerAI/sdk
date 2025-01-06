import axios from 'axios';

export interface OverseerConfig {
  apiKey: string;
  baseUrl?: string;
}

export interface ValidationResult {
  isAllowed: boolean;
  text: string;
  details?: {
    reason?: string;
    safetyCode?: string;
  };
}

export class Overseer {
  private apiKey: string;
  private baseUrl: string;

  constructor(config: OverseerConfig) {
    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl || 'https://api.overseerai.app';
  }

  /**
   * Validate AI-generated text
   * @param text The text to validate
   * @returns ValidationResult with either the original text or a rejection message
   */
  async validate(text: string): Promise<ValidationResult> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/api/v1/responses/check`,
        { text, rules: null },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const result = response.data;
      
      if (!result.is_allowed) {
        return {
          isAllowed: false,
          text: "Sorry, I can't help with that!",
          details: {
            reason: result.details?.reason,
            safetyCode: result.details?.safety_code
          }
        };
      }

      return {
        isAllowed: true,
        text: text
      };
    } catch (error) {
      // Handle API errors gracefully
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          throw new Error('Invalid API key');
        }
        if (error.response?.status === 429) {
          throw new Error('Rate limit exceeded');
        }
      }
      throw error;
    }
  }
}

// Default export
export default Overseer; 