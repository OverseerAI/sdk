# @overseerai/sdk

Node.js SDK for Overseer AI content safety validation.

## Installation

```bash
npm install @overseerai/sdk
```

## Usage

```typescript
import { Overseer } from '@overseerai/sdk';

// Initialize the SDK
const overseer = new Overseer({
  apiKey: 'your-api-key',
  // Optional: Override the base URL if needed
  baseUrl: 'https://api.overseer.ai'
});

// Validate content
try {
  const result = await overseer.validate('Hello! How can I help you today?');
  if (result.isAllowed) {
    console.log('Content is safe:', result.text);
  } else {
    console.log('Content was rejected:', result.text);
    console.log('Reason:', result.details?.reason);
  }
} catch (error) {
  console.error('Error validating content:', error);
}
```

## API Reference

### `new Overseer(options)`

Creates a new instance of the Overseer SDK.

#### Options

- `apiKey` (required): Your Overseer AI API key
- `baseUrl` (optional): Override the default API base URL

### `validate(text: string): Promise<ValidationResult>`

Validates the given text content against Overseer AI's safety policies.

#### Returns

A promise that resolves to a `ValidationResult` object:

```typescript
interface ValidationResult {
  isAllowed: boolean;
  text: string;
  details?: {
    reason: string | null;
  };
}
```

## License

MIT 