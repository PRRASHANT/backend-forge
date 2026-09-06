# Backend Forge

**Build. Deploy. Scale.**

A mini Backend-as-a-Service (BaaS) platform that lets developers define schemas and expose secure runtime CRUD APIs without repeatedly writing boilerplate backend code.

Backend Forge is a hosted BaaS-style platform—not simply a CRUD code generator. You define your data models via a Management API/Dashboard, and the platform instantly provides secured, tenant-isolated RESTful CRUD APIs for your application to consume at runtime.

---

## 1. Live Demo
Frontend URL: [https://backend-forge-sigma.vercel.app](https://backend-forge-sigma.vercel.app)
*(Note: As a free-tier deployment, the backend may take 30-50 seconds to spin up from a cold start.)*

## 2. What is Backend Forge?
Building CRUD backend APIs is repetitive. Every new project requires boilerplate database models, validation logic, route controllers, authentication middleware, and error handling. 

Backend Forge eliminates this friction. Developers use the visual dashboard to define schemas and manage their backend configuration. The platform then dynamically resolves user-defined schemas and serves CRUD operations through a generic runtime API on the fly. 

## 3. Key Features
- Authentication & RBAC: Secure JWT-based dashboard authentication with Owner, Admin, Developer, and Viewer roles.
- Project Management & Multi-Tenant Isolation: Manage multiple backend projects. Each project's data collections are physically isolated in MongoDB (e.g. `data_{projectId}_{collectionId}`).
- Dynamic Collections & Schemas: Support for 12 data types (string, number, integer, boolean, date, email, url, enum, array, object, reference, decimal) with strict constraints (min/max length, required, enum values, etc.).
- Dynamic Runtime CRUD APIs: Dynamically exposes runtime CRUD endpoints for any user-defined collection.
- Project API Keys: Cryptographic runtime API keys (hashed via bcrypt) with one-time display and real-time revocation capabilities.
- Runtime Validation: Strict schema enforcement drops unknown fields and rejects invalid data structures before querying the database.
- API Explorer: Built-in dashboard tool to test and inspect exposed runtime APIs.
- Request Logs & Analytics: Asynchronous activity logging and real metrics computed directly from actual API requests.
- Rate Limiting: Configurable rate limiters for authentication, general management, and runtime APIs (enforced per API key).

## 4. How It Works
1. **Developer** creates a Backend Forge account.
2. Creates a **Project** (e.g., "E-Commerce App").
3. Defines a **Collection** (e.g., "products") with a custom schema.
4. Generates an **API key** for the project.
5. Uses the **Runtime REST API** from their client application using the API key.
6. Receives validated **JSON responses** backed by MongoDB.

## 5. Architecture
Backend Forge is separated into two distinct layers for security and scalability:

- Management API (Express): Handles dashboard operations, JWT auth, schema metadata definition, and analytics.
- Runtime Data API (Express): Dynamically resolves user-defined schemas and serves CRUD operations to end-user applications using `X-API-Key` authentication.
- Schema Engine: Dynamically compiles user schemas into Mongoose models and caches them in a bounded LRU memory cache for fast runtime resolution.
- Frontend (React/Vite): A polished dashboard built with Tailwind CSS, Axios, and Recharts.

```text
External Client App
       │
       ▼ (HTTP + X-API-Key)
┌──────────────────────┐      ┌─────────────────────────┐
│  Runtime Data API    │◄────►│  Dynamic Schema Engine  │
└─────────┬────────────┘      └─────────────────────────┘
          │
          ▼
┌──────────────────────┐      ┌─────────────────────────┐
│ Generic CRUD Engine  │◄────►│     MongoDB (Atlas)     │
└──────────────────────┘      └─────────────────────────┘
```

## 6. Management API vs Runtime Data API
- Management API: Used by developers to configure their backend (create projects, build schemas, manage members). Secured via standard JWT Bearer tokens.
- Runtime Data API: Used by the client applications (e.g., a mobile app or frontend website) to perform CRUD operations on the data. Secured via Project API Keys (`X-API-Key` header).

## 7. Dynamic Schema & Runtime API Example

Example Schema Definition (`products`):
- `name`: string (required)
- `price`: number (required, min 0)
- `description`: string (optional)
- `inStock`: boolean (required)

Dynamically Exposed Runtime Endpoints:
- `POST /api/v1/:projectId/products` — Create a product
- `GET /api/v1/:projectId/products` — List products (with pagination, sort, and strict filter whitelisting)
- `GET /api/v1/:projectId/products/:id` — Get a specific product
- `PATCH /api/v1/:projectId/products/:id` — Update a product
- `DELETE /api/v1/:projectId/products/:id` — Delete a product

## 8. Security
Backend Forge implements strict security boundaries:
- Authentication: JWT for dashboard, `bcrypt` for password hashing (cost factor 12).
- API Keys: Cryptographically generated. Only bcrypt hashes and a 12-char lookup prefix are stored.
- Key Revocation: Real-time prevention of revoked key usage.
- Tenant Isolation: Strict MongoDB collection separation per project/schema prevents cross-tenant data leaks.
- Validation: `schemaEngine` drops unknown fields and enforces strict typings to prevent payload injection.
- NoSQL / Query Protections: `listDocuments` whitelists sort and filter fields, strictly dropping complex NoSQL operator objects (like `$gt` or `$ne`) injected into query params.
- CORS & Limits: Safely restricted via `CORS_ORIGIN`. Distinct rate limiters for auth, general, and runtime endpoints.

## 9. Tech Stack
- Frontend: React.js, Vite, Tailwind CSS, Axios, Lucide React, Recharts
- Backend: Node.js, Express.js
- Database: MongoDB (Atlas), Mongoose
- Security: bcryptjs, jsonwebtoken, helmet, express-rate-limit, cors
- Testing: Jest, Supertest, MongoDB Memory Server

## 10. Testing & Quality
The backend is highly tested to ensure tenant isolation and correct validation.
- 77 Automated Tests across 5 test suites (Auth, Projects, Collections, Runtime CRUD, Logs/Analytics).
- Production flows (login, schema creation, dynamic API resolution, API consumption) have been manually smoke-tested.

## 11. Production Deployment
- Frontend: Vercel (SPA routing configured)
- Backend: Render (Web Service)
- Database: MongoDB Atlas

## 12. Local Development

### Prerequisites
- Node.js >= 18
- MongoDB (Local or Atlas)

### Setup
```bash
# Clone the repository
git clone https://github.com/PRRASHANT/backend-forge.git
cd BackendForge

# Install backend dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env and provide your MONGODB_URI and JWT_SECRET

# Start backend (defaults to http://localhost:5000)
npm run dev

# In a new terminal, start frontend
cd frontend
npm install
npm run dev
```

## 13. Project Structure
```text
BackendForge/
├── src/
│   ├── config/           # DB & environment config
│   ├── controllers/      # Route handlers
│   ├── middleware/       # Auth, RBAC, rate limiting, error handling
│   ├── models/           # Core Mongoose models
│   ├── routes/           # Express routers
│   ├── services/         # Schema engine, API key service, logging
│   └── utils/            # Constants, errors
├── tests/                # Jest integration test suites
├── frontend/             # React/Vite SPA
├── docs/                 # Additional architecture & API docs
├── server.js             # Backend entry point
└── package.json
```

## 14. Current v1.0 Scope & Limitations
Backend Forge v1.0 is a functional release with the following intentional architectural trade-offs:
- In-Memory Rate Limiting: `express-rate-limit` is used in-memory, which applies limits per individual Node process rather than globally.
- In-Memory Model Cache: The dynamic Mongoose model cache (`modelCache`) is bounded per-process. In a horizontally scaled cluster, schema updates may result in temporary model staleness on peer instances until eviction.
- REST Only: No real-time WebSocket subscriptions or file upload support in v1.0.

## 15. Future Improvements
- Distributed Caching: Implement a Redis layer for global rate limiting and cluster-wide dynamic model cache invalidation.
- Analytics Workers: Offload analytics processing to a dedicated background worker queue.
- E2E Testing: Expand automated browser testing (e.g., Playwright) for the frontend dashboard.

## 16. Author
Prashant

## 17. License

This project is licensed under the ISC License. See the `LICENSE` file for details.
