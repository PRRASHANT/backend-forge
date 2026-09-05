# Backend Forge

**Build. Deploy. Scale.**

A schema-driven Backend-as-a-Service (BaaS) platform that allows developers to define data models through a management API and automatically exposes secured RESTful CRUD APIs for those models.

---

## Problem Statement

Building CRUD backend APIs is repetitive. Every new project requires:
- Database models
- Validation logic
- Controller/route boilerplate
- Authentication middleware
- Error handling

Backend Forge eliminates this by letting developers define schemas through a management API. The platform then dynamically generates and serves CRUD APIs — no code writing required.

## Features

- **User Authentication** — Registration, login, JWT-based auth with bcrypt password hashing
- **Project Management** — Create and manage multiple backend projects
- **Dynamic Collections** — Define data models with 12 supported field types
- **Dynamic Schema Engine** — Converts schema definitions to runtime-validated Mongoose models
- **Generic CRUD Engine** — Automatic REST API generation for any user-defined collection
- **Runtime Data API** — Separate API authenticated via project API keys (not dashboard JWT)
- **12 Field Types** — string, number, integer, boolean, date, email, url, enum, array, object, reference, decimal
- **Field Validation** — required, min/max, minLength/maxLength, enum values, email/URL format, array constraints
- **RBAC** — Owner, Admin, Developer, Viewer roles with enforced permission matrix
- **API Key Management** — Cryptographic key generation, bcrypt hashing, one-time display, revocation
- **Multi-Tenant Isolation** — Physical MongoDB collection separation per project/collection
- **Request Logging** — Async runtime API activity logging with pagination
- **Analytics** — Real metrics computed from actual request data
- **Rate Limiting** — Configurable limiters for auth, general, and runtime APIs
- **Security** — Helmet headers, CORS, payload size limits, centralized error handling, no secret leakage

## Technology Stack

### Backend
- **Node.js** with **Express**
- **MongoDB** with **Mongoose**
- **JWT** for Management Authentication
- **bcrypt** for hashing (Passwords & API Keys)
- **Helmet**, **express-rate-limit**, **cors** for security

### Frontend
- **React.js** with **Vite**
- **Tailwind CSS** for styling
- **Axios** for API communication
- **Lucide React** for iconography
- **Recharts** for runtime analytics

---

## Architecture

```
External App → HTTP + X-API-Key → Runtime API → API Key Auth → Project Resolution
    → Collection Resolution → Dynamic Schema Engine → Generic CRUD → MongoDB → JSON Response
```

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for detailed architecture decisions.

## Prerequisites

- Node.js >= 18
- MongoDB (local or Atlas)
- npm

## Installation

```bash
# Clone the repository
git clone <repository-url>
cd BackendForge

# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Edit .env with your values (especially MONGODB_URI and JWT_SECRET)
```

## Environment Variables

| Variable | Description | Default |
|---|---|---|
| `NODE_ENV` | Environment | `development` |
| `PORT` | Server port | `5000` |
| `MONGODB_URI` | MongoDB connection string | Required |
| `JWT_SECRET` | JWT signing secret (min 16 chars) | Required |
| `JWT_EXPIRES_IN` | Token expiry | `7d` |
| `CORS_ORIGIN` | Allowed CORS origin | `http://localhost:5173` |
| `RATE_LIMIT_WINDOW_MS` | General rate limit window | `900000` |
| `RATE_LIMIT_MAX_REQUESTS` | General rate limit max | `100` |

## Development

### 1. Start the Backend
Start the server:
```bash
npm run dev
```

### 3. Start the Frontend
In a new terminal window:
```bash
cd frontend
npm install
npm run dev
```
The dashboard will be available at `http://localhost:5173`.

## Testing

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Watch mode
npm run test:watch
```

**Current status: 77 tests passing across 5 test suites.**

## API Overview

### Management API (JWT Auth)

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Get current user |
| POST | `/api/projects` | Create project |
| GET | `/api/projects` | List user's projects |
| GET | `/api/projects/:id` | Get project details |
| PATCH | `/api/projects/:id` | Update project |
| DELETE | `/api/projects/:id` | Delete project |
| POST | `/api/projects/:id/collections` | Create collection |
| GET | `/api/projects/:id/collections` | List collections |
| PATCH | `/api/projects/:id/collections/:cid` | Update collection schema |
| DELETE | `/api/projects/:id/collections/:cid` | Delete collection |
| POST | `/api/projects/:id/api-keys` | Create API key |
| GET | `/api/projects/:id/api-keys` | List API keys |
| PATCH | `/api/projects/:id/api-keys/:kid/revoke` | Revoke key |
| POST | `/api/projects/:id/members` | Add member |
| GET | `/api/projects/:id/members` | List members |
| GET | `/api/projects/:id/logs` | View request logs |
| GET | `/api/projects/:id/analytics` | View analytics |

### Runtime Data API (API Key Auth via `X-API-Key` header)

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/v1/:projectId/:collection` | Create document |
| GET | `/api/v1/:projectId/:collection` | List documents (paginated) |
| GET | `/api/v1/:projectId/:collection/:docId` | Get document |
| PATCH | `/api/v1/:projectId/:collection/:docId` | Update document |
| DELETE | `/api/v1/:projectId/:collection/:docId` | Delete document |

See [docs/API.md](docs/API.md) for complete API documentation.

## Project Structure

```
BackendForge/
├── src/
│   ├── config/           # DB connection, environment config
│   ├── middleware/        # Auth, RBAC, rate limiting, error handler
│   ├── models/           # Mongoose models
│   ├── routes/           # Express route definitions
│   ├── controllers/      # Request handlers
│   ├── services/         # Business logic (schema engine, API keys, logging)
│   └── utils/            # Constants, error classes
├── tests/                # Jest integration tests
├── docs/                 # Architecture, API, security documentation
├── server.js             # Entry point
└── package.json
```

## Demo Flow

1. Register → Login → Create project "Ecommerce"
2. Create "products" collection with fields: name (string), price (number), inStock (boolean)
3. Generate API key → copy the raw key (shown once)
4. Use API key to POST/GET/PATCH/DELETE products via Runtime API
5. View request logs and analytics through Management API

## Deployment

See [docs/DEPLOYMENT.md] for deployment instructions.

**Frontend:** Static build deployed to any CDN/hosting (Phase 2)
**Backend:** Any Node.js hosting (Render, Railway, Heroku, EC2, etc.)
**Database:** MongoDB Atlas or self-hosted

## Limitations

- In-memory rate limiting (single server only; Redis needed for horizontal scaling)
- Dynamic model cache is per-process (stateless scaling requires Redis cache layer)
- No real-time subscriptions (REST only)
- No file upload support
- Public client keys not yet implemented (requires security rules engine)

## License

ISC
