# Security Architecture

## 1. Authentication & Identity
- **Management API:** Uses JSON Web Tokens (JWT) signed with `HS256`. Passwords are hashed using `bcrypt` before storage.
- **Runtime API:** Authenticated via project-specific API keys.
- **RBAC:** Projects have Owner, Admin, Developer, and Viewer roles with strict permission boundaries.

## 2. API Key Security
- **Generation:** High-entropy cryptographically secure random bytes (via `crypto.randomBytes`).
- **Storage:** Raw keys are NEVER stored. Only a bcrypt hash is stored in the database.
- **Identification:** A non-secret 12-character prefix (`bf_sk_...`) is stored in plaintext and used to quickly look up the key record before verifying the bcrypt hash.
- **Leak Prevention:** Raw keys are returned exactly once upon creation.

## 3. Data Isolation
- **Physical Separation:** Every project collection is stored in a separate MongoDB collection (`data_<projectId>_<collectionId>`).
- **Cross-Tenant Prevention:** The Runtime API requires a valid API key, which determines the target `projectId`. It is impossible to query another project's data by manipulating the URL parameters.

## 4. Application Security
- **Headers:** Configured via `helmet` (HSTS, Content Security Policy, XSS Protection, etc).
- **CORS:** Restricts cross-origin requests to configured domains.
- **Rate Limiting:** Protects against brute force and DDoS attacks.
- **Input Validation:** Centralized error handling and strict Mongoose schema validation prevents malformed payloads.
- **NoSQL Injection Prevention:** Runtime query filters only accept string primitives from query parameters, rejecting operator objects (`$gt`, `$ne`, etc.). Sort fields are whitelisted against the schema definition.
- **Environment:** Secrets are loaded via `.env` (ignored by git).
