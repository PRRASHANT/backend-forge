# Testing Strategy

Backend Forge uses `jest` and `supertest` for comprehensive integration testing.

## Test Environment
- **Database:** Uses `mongodb-memory-server` to spin up an ephemeral, in-memory MongoDB instance for tests. Tests run completely isolated and clean up after themselves.
- **Rate Limiting:** Bypassed during testing (`NODE_ENV=test`) to prevent integration tests from failing due to rapid requests.

## Test Suites (5 Total, 77 Tests)
1. **`auth.test.js`** (13 tests): Registration, login, JWT validation, duplicate email rejection, missing fields, malformed tokens.
2. **`projects.test.js`** (15 tests): Project CRUD, ownership enforcement, RBAC denial for viewer (update/delete/collections), developer (API keys), and cross-user project access.
3. **`collections.test.js`** (12 tests): Schema validation, reserved names, all 12 field types, duplicate field detection, unsupported types.
4. **`runtime.test.js`** (31 tests): Dynamic CRUD (create/list/get/update/delete), pagination, API key auth, revoked key rejection, tenant isolation (GET/POST/PATCH/DELETE), date/reference/decimal runtime validation, unknown fields, enum/email/URL/integer/min validation.
5. **`logs-analytics.test.js`** (6 tests): Runtime logging middleware, log pagination, accurate analytics computation, empty project analytics, health endpoint, 404 handler.

## Coverage Areas
- **Security:** Duplicate registration, bad login, invalid JWT, unauthorized project access, RBAC denial, revoked API key, wrong-project API key, cross-tenant CRUD (all verbs), NoSQL injection prevention
- **Validation:** All 12 field types at runtime, required fields, unknown fields, min/max, enum values
- **Operations:** Health endpoint, 404 handler, pagination bounds

## Running Tests
```bash
npm test              # Run all tests
npm run test:watch    # Watch mode
npm run test:coverage # Coverage report
```
