# Scalability Considerations

Backend Forge is designed for scale but currently operates with an in-memory architecture for simplicity in Phase 1.

## 1. Current State
- **Rate Limiting:** `express-rate-limit` uses an in-memory store.
- **Schema Caching:** Dynamic Mongoose models are cached in a Node.js `Map`.
- **Database:** MongoDB handles physical data separation gracefully up to ~24,000 collections per database natively.

## 2. Scaling to Multiple Instances
To scale horizontally across multiple Node.js instances (e.g., in a Kubernetes cluster or AWS ECS), the following architectural changes are required:

### Rate Limiting
The in-memory store must be replaced with `rate-limit-redis` to share request counts across instances.

### Schema Cache Invalidation
Currently, updating a schema clears the model from the local process `modelCache`. In a distributed environment, a Pub/Sub mechanism (like Redis Pub/Sub) is needed so all instances drop their cached Mongoose models when a schema is updated.

### MongoDB Connection Pooling
Connection limits must be managed carefully. A large number of dynamic collections is handled well by MongoDB, but the Node.js driver's connection pool size might need tuning depending on instance count.

## 3. Future Enhancements
- Data archiving for inactive tenants.
- Database sharding based on `projectId`.
