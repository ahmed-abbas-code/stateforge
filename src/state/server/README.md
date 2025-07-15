
# StateForge - State - Server

A modular set of server-side persistence strategies for StateForge apps. Supports pluggable storage backends including Firestore, Redis, REST API, and a dummy fallback for robust, scalable state management.

---

## Table of Contents
- [Overview](#overview)
- [Modules](#modules)
  - [createServerPersistenceStrategy.ts](#createserverpersistencestrategyts)
  - [RestApiStrategyImpl.ts](#restapistrategyimplts)
  - [RedisServerStrategyImpl.ts](#redisserverstrategyimplts)
  - [FirestoreStrategyImpl.ts](#firestorestrategyimplts)
  - [redis.ts](#redists)
  - [firestore.ts](#firestorets)
- [License](#license)

---

## Overview

StateForge server-side persistence is pluggable: choose Firestore, Redis, REST API, or supply your own implementation. Each strategy provides a common interface for reading, writing, and clearing state in a scalable, namespaced manner.

---

## Modules

### `createServerPersistenceStrategy.ts`

**Purpose:**  
A factory to select and instantiate the right server-side persistence strategy at runtime.

**Features:**  
- Returns the correct strategy based on a config/type: Firestore, Redis, REST API, or dummy fallback.
- Handles errors, logs fallback events, and supports namespaces.
- Each strategy implements `get`, `set`, and `clear`.

**Usage:**

```ts
import { createServerPersistenceStrategy } from '@state/server';

const storage = createServerPersistenceStrategy({ type: 'REDIS_SERVER', namespace: 'myspace' });
await storage.set('key', { foo: 'bar' });
const val = await storage.get('key');
```

---

### `RestApiStrategyImpl.ts`

**Purpose:**  
Store and retrieve state by calling RESTful API endpoints on your backend.

**Features:**  
- Namespaces keys for isolation
- Uses `fetchAppApi` to send HTTP requests to `/state/{namespace:key}`
- Implements `get` and `set`

**Usage:**

```ts
import { RestApiStrategyImpl } from '@state/server';

const apiStore = new RestApiStrategyImpl('myspace');
await apiStore.set('userid', { some: 'data' });
const userData = await apiStore.get('userid');
```

---

### `RedisServerStrategyImpl.ts`

**Purpose:**  
Persist state in Redis with optional time-to-live (TTL) for caching or session data.

**Features:**  
- Namespaced keys
- TTL support per value
- Handles Redis client errors gracefully
- Implements `get` and `set`

**Usage:**

```ts
import { RedisServerStrategyImpl } from '@state/server';

const redisStore = new RedisServerStrategyImpl('cache', 600);
await redisStore.set('sid', { foo: 'bar' });
const session = await redisStore.get('sid');
```

---

### `FirestoreStrategyImpl.ts`

**Purpose:**  
Persist state in Google Firestore collections, with each namespace as a collection.

**Features:**  
- Uses Firestore Admin SDK
- Each key is a Firestore document
- Handles Firestore errors
- Implements `get` and `set`

**Usage:**

```ts
import { FirestoreStrategyImpl } from '@state/server';

const store = new FirestoreStrategyImpl('state_collection');
await store.set('docid', { value: 42 });
const result = await store.get('docid');
```

---

### `redis.ts`

**Purpose:**  
Creates a singleton Redis client instance (or disables if no config).

**Features:**  
- Reads `REDIS_URL` from config
- Dynamically imports and connects to Redis
- Handles and logs errors, returns `undefined` if Redis is not available

**Usage:**

```ts
import { getRedisClient } from '@state/server';

const redis = await getRedisClient();
if (redis) { await redis.set('mykey', 'value'); }
```

---

### `firestore.ts`

**Purpose:**  
Initializes a singleton Firestore instance for use by server strategies.

**Features:**  
- Loads service account credentials from env vars
- Ensures only one Firestore app instance is used
- Exports `firestore` ready for queries and writes

**Usage:**

```ts
import { firestore } from '@state/server';

const snapshot = await firestore.collection('col').doc('docid').get();
```

---

## License

MIT License.
