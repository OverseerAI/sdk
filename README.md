# Overseer AI SDK

Official SDK for the Overseer AI content safety API. This repository contains the official Node.js and TypeScript client libraries for integrating with Overseer AI's content safety validation service.

## Packages

This monorepo contains the following packages:

- [@overseerai/sdk](./packages/node) - Node.js SDK
- [@overseerai/sdk-typescript](./packages/typescript) - TypeScript SDK

## Quick Start

### Node.js

```bash
npm install @overseerai/sdk
```

```javascript
import { Overseer } from '@overseerai/sdk';

// Initialize the client
const overseer = new Overseer({
  apiKey: 'your-api-key'
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

### TypeScript

```bash
npm install @overseerai/sdk-typescript
```

```typescript
import { Overseer } from '@overseerai/sdk-typescript';

// Initialize with type-safe config
const overseer = new Overseer({
  apiKey: 'your-api-key',
  organizationId: 'optional-org-id' // Optional
});

// Validate with type-safe options
const result = await overseer.validate({
  content: 'Hello! How can I help you today?',
  policies: ['safety'], // Optional
  systemId: 'optional-system-id' // Optional
});

if (result.valid) {
  console.log('Content is safe:', result.content);
} else {
  console.log('Issues found:', result.issues);
}
```

## Documentation

For detailed documentation, visit [docs.overseerai.app](https://docs.overseerai.app).

## Contributing

We welcome contributions! Please see our [Contributing Guide](./CONTRIBUTING.md) for details.

## License

MIT License - see [LICENSE](./LICENSE) for details. 