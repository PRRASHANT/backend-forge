# Backend Forge API Documentation

Backend Forge provides two distinct API interfaces:

1. **Management API**: Used by platform users (developers) to manage their projects, configure schemas, and view analytics. Authenticated via JWT.
2. **Runtime Data API**: The dynamically generated CRUD APIs for the user-defined collections. Authenticated via API Keys (passed in headers).

---

## 1. Management API

Base URL: `/api/`
Authentication: `Authorization: Bearer <JWT_TOKEN>`

### Authentication

| Method | Endpoint | Description | Request Body | Response |
|---|---|---|---|---|
| POST | `/auth/register` | Register new user | `{ name, email, password }` | `{ token, user }` |
| POST | `/auth/login` | Login | `{ email, password }` | `{ token, user }` |
| GET | `/auth/me` | Get current user | None | `{ user }` |

### Projects

| Method | Endpoint | Description | Request Body | Response |
|---|---|---|---|---|
| POST | `/projects` | Create a project | `{ name, description? }` | `{ project }` |
| GET | `/projects` | List projects | None | `{ projects }` |
| GET | `/projects/:id` | Get project | None | `{ project, role }` |
| PATCH | `/projects/:id` | Update project | `{ name?, description? }` | `{ project }` |
| DELETE | `/projects/:id` | Delete project | None | `{ success }` |

### Project Members (RBAC)

**Roles:** `owner`, `admin`, `developer`, `viewer`

| Method | Endpoint | Description | Request Body | Response |
|---|---|---|---|---|
| POST | `/projects/:id/members` | Add member | `{ email, role }` | `{ membership }` |
| GET | `/projects/:id/members` | List members | None | `{ members }` |

### Collections (Dynamic Schemas)

| Method | Endpoint | Description | Request Body | Response |
|---|---|---|---|---|
| POST | `/projects/:id/collections` | Create collection | `{ name, fields: [...] }` | `{ collection }` |
| GET | `/projects/:id/collections` | List collections | None | `{ collections }` |
| PATCH | `/projects/:id/collections/:cid`| Update schema | `{ fields: [...] }` | `{ collection }` |
| DELETE| `/projects/:id/collections/:cid`| Delete collection | None | `{ success }` |

#### Supported Field Types
`string`, `number`, `integer`, `boolean`, `date`, `email`, `url`, `enum`, `array`, `object`, `reference`, `decimal`.

### API Keys

| Method | Endpoint | Description | Request Body | Response |
|---|---|---|---|---|
| POST | `/projects/:id/api-keys` | Create API key | `{ name }` | `{ apiKey, warning: "Save this rawKey..." }` |
| GET | `/projects/:id/api-keys` | List API keys | None | `{ apiKeys (no raw keys) }` |
| PATCH | `/projects/:id/api-keys/:kid/revoke` | Revoke a key | None | `{ apiKey }` |

### Logs & Analytics

| Method | Endpoint | Description | Parameters | Response |
|---|---|---|---|---|
| GET | `/projects/:id/logs` | View runtime logs | `?page=1&limit=50` | `{ logs, pagination }` |
| GET | `/projects/:id/analytics` | View analytics | None | `{ analytics }` |

---

## 2. Runtime Data API

Base URL: `/api/v1/:projectId/:collectionSlug/`
Authentication: `X-API-Key: <RAW_API_KEY>`

This API dynamically adapts to the schemas defined in the Management API. Validation is automatically enforced based on the defined field types and constraints.

### Generic CRUD Endpoints

| Method | Endpoint | Description | Request Body | Response |
|---|---|---|---|---|
| POST | `/` | Create a document | JSON object matching schema | `{ document }` |
| GET | `/` | List documents | `?page=1&limit=20` | `{ documents, pagination }` |
| GET | `/:docId` | Get a document | None | `{ document }` |
| PATCH | `/:docId` | Update document | Partial JSON object | `{ document }` |
| DELETE | `/:docId` | Delete document | None | `{ success }` |

### Example Runtime Usage

Assume a project ID `64a...` with a collection `products` (fields: `name` string, `price` number).

**Create a product:**
```bash
curl -X POST http://localhost:5000/api/v1/64a.../products \
  -H "X-API-Key: bf_sk_1234567890abcdef..." \
  -H "Content-Type: application/json" \
  -d '{"name": "Laptop", "price": 999.99}'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "document": {
      "_id": "64b...",
      "name": "Laptop",
      "price": 999.99,
      "createdAt": "2023-11-01T10:00:00.000Z",
      "updatedAt": "2023-11-01T10:00:00.000Z"
    }
  }
}
```

### Common Runtime Errors

- `401 Unauthorized`: Missing or invalid `X-API-Key`.
- `404 Not Found`: Project ID or Collection slug doesn't exist, or document ID not found.
- `422 Unprocessable Entity`: Validation failed (e.g., missing required field, wrong data type, negative number for min:0, invalid enum value). Message will detail the validation failure.
