# request-dedupe 🔄

A lightweight, TypeScript-first utility to deduplicate concurrent API requests. Prevent duplicate network calls when multiple components or functions request the same resource simultaneously.

## Why?

- User clicks button twice → only 1 API call
- Component mounts + parent mounts and both fetch same data → only 1 call
- Multiple functions requesting same resource concurrently → only 1 call
- **Zero dependencies** • **~8KB** • **TypeScript native**

## Installation
```bash
npm install request-dedupe
```

## Quick Start

### Basic Usage (Default Instance)
```typescript
import { dedupe } from 'request-dedupe';

// First call makes the request
const user = await dedupe('user-123', () =>
  fetch('/api/users/123').then(r => r.json())
);

// Second call (within 100ms) returns the SAME promise
const userAgain = await dedupe('user-123', () =>
  fetch('/api/users/123').then(r => r.json())
);

// Only 1 network request was made!
```

### Custom Instance with Options
```typescript
import { createDeduplicator } from 'request-dedupe';

const dedup = createDeduplicator({
  duration: 200, // Cache for 200ms instead of default 100ms
  clearOnError: true, // Clear cache if request fails
});

const result = await dedup.dedupe('api-key', async () => {
  const response = await fetch('/api/data');
  return response.json();
});
```

## API

### `dedupe<T>(key: string, fetcher: () => Promise<T>): Promise<T>`

Deduplicate a request by key. If the same key is requested concurrently, returns the same promise.

**Parameters:**
- `key` - Unique identifier for the request
- `fetcher` - Async function that makes the actual request

**Returns:** Promise that resolves with the fetched data
```typescript
const data = await dedupe('unique-key', async () => {
  return fetch('/api/data').then(r => r.json());
});
```

### `createDeduplicator(options?): Deduplicator`

Create a custom deduplicator instance with options.
```typescript
const dedup = createDeduplicator({
  duration: 150, // How long to keep request in cache
  clearOnError: true, // Clear cache on error
});
```

**Methods:**
- `dedupe<T>(key, fetcher)` - Deduplicate request
- `clear(key?)` - Clear cache (entire cache if no key provided)
- `has(key)` - Check if key exists in cache
- `size()` - Get current cache size

## Real-World Examples

### React + Fetch
```typescript
import { dedupe } from 'request-dedupe';

export function UserProfile({ userId }: { userId: string }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    dedupe(`user-${userId}`, async () => {
      const response = await fetch(`/api/users/${userId}`);
      return response.json();
    }).then(setUser);
  }, [userId]);

  return <div>{user?.name}</div>;
}

// Even if component mounts multiple times, only 1 fetch happens
```

### Express Backend
```typescript
import express from 'express';
import { createDeduplicator } from 'request-dedupe';

const app = express();
const dedup = createDeduplicator({ duration: 500 });

app.get('/api/expensive-query', async (req, res) => {
  try {
    const data = await dedup('expensive-query', async () => {
      // Expensive database query
      return db.query('SELECT * FROM huge_table');
    });
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed' });
  }
});
```

### Vue.js Composable
```typescript
import { dedupe, clearDedupe } from 'request-dedupe';

export function useFetchUser(userId: string) {
  const user = ref(null);
  const loading = ref(true);
  const error = ref(null);

  onMounted(async () => {
    try {
      user.value = await dedupe(`user-${userId}`, async () => {
        const res = await fetch(`/api/users/${userId}`);
        return res.json();
      });
    } catch (e) {
      error.value = e;
    } finally {
      loading.value = false;
    }
  });

  return { user, loading, error };
}
```

## Testing
```bash
npm test
npm run test:watch # Watch mode
```

## Build
```bash
npm run build
# Creates dist/ with CJS and ESM versions
```

## License

MIT
