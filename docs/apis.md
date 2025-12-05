# NIMBL - APIs Specification

Complete REST API specification for the NIMBL form builder platform.

---

## Base URL

```
https://nimbl.app/api
```

---

## Form CRUD Operations

### Create Form

**Endpoint:** `POST /forms`

**Authentication:** Required (Bearer Token)

**Request Body:**
```json
{
  "title": "Customer Feedback Survey",
  "description": "Help us improve our service"
}
```

**Response (201):**
```json
{
  "_id": "form-uuid-123",
  "ownerId": "user-uuid-456",
  "title": "Customer Feedback Survey",
  "slug": "customer-feedback-survey",
  "description": "Help us improve our service",
  "components": [],
  "published": false,
  "settings": {
    "canvasWidth": 20,
    "gridSize": 8
  },
  "createdAt": "2025-12-04T10:00:00Z",
  "updatedAt": "2025-12-04T10:00:00Z"
}
```

**Error Responses:**
- `400 Bad Request` - Missing required field or invalid format
- `401 Unauthorized` - No authentication token
- `500 Server Error` - Database error

---

### Get All Forms

**Endpoint:** `GET /forms?page=1&limit=20&sort=createdAt&order=desc`

**Authentication:** Required

**Query Parameters:**
- `page` (optional, default: 1) - Page number
- `limit` (optional, default: 20) - Items per page
- `sort` (optional, default: createdAt) - Field to sort by
- `order` (optional, default: desc) - Sort order (asc/desc)

**Response (200):**
```json
{
  "data": [
    {
      "_id": "form-uuid-123",
      "title": "Customer Feedback Survey",
      "slug": "customer-feedback-survey",
      "published": false,
      "componentCount": 5,
      "responseCount": 12,
      "createdAt": "2025-12-04T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "pages": 3
  }
}
```

---

### Get Single Form

**Endpoint:** `GET /forms/:formId`

**Authentication:** Required (owner only)

**Response (200):**
```json
{
  "_id": "form-uuid-123",
  "ownerId": "user-uuid-456",
  "title": "Customer Feedback Survey",
  "slug": "customer-feedback-survey",
  "description": "Help us improve our service",
  "components": [
    {
      "id": "comp-1",
      "type": "text-input",
      "x": 0,
      "y": 0,
      "w": 10,
      "h": 1,
      "props": {
        "label": "Name",
        "placeholder": "Enter your name",
        "required": true
      }
    }
  ],
  "published": false,
  "settings": {
    "canvasWidth": 20,
    "gridSize": 8
  },
  "createdAt": "2025-12-04T10:00:00Z",
  "updatedAt": "2025-12-04T10:00:00Z"
}
```

**Error Responses:**
- `404 Not Found` - Form doesn't exist
- `403 Forbidden` - User doesn't own this form
- `401 Unauthorized` - No authentication token

---

### Update Form

**Endpoint:** `PUT /forms/:formId`

**Authentication:** Required (owner only)

**Request Body:**
```json
{
  "title": "Updated Title",
  "description": "Updated description"
}
```

**Response (200):**
```json
{
  "_id": "form-uuid-123",
  "title": "Updated Title",
  "description": "Updated description",
  "slug": "customer-feedback-survey",
  "updatedAt": "2025-12-04T10:30:00Z"
}
```

---

### Delete Form

**Endpoint:** `DELETE /forms/:formId`

**Authentication:** Required (owner only)

**Response (204):** No content

**Side Effects:** All responses for this form are also deleted

---

## Publishing

### Publish Form

**Endpoint:** `POST /forms/:formId/publish`

**Authentication:** Required (owner only)

**Response (200):**
```json
{
  "_id": "form-uuid-123",
  "published": true,
  "publicUrl": "https://nimbl.app/public/forms/customer-feedback-survey"
}
```

---

### Unpublish Form

**Endpoint:** `POST /forms/:formId/unpublish`

**Authentication:** Required (owner only)

**Response (200):**
```json
{
  "_id": "form-uuid-123",
  "published": false
}
```

---

### Get Public Form

**Endpoint:** `GET /public/forms/:slug`

**Authentication:** Not required

**Response (200):**
```json
{
  "title": "Customer Feedback Survey",
  "description": "Help us improve our service",
  "components": [
    {
      "id": "comp-1",
      "type": "text-input",
      "x": 0,
      "y": 0,
      "w": 10,
      "h": 1,
      "props": {
        "label": "Name",
        "placeholder": "Enter your name",
        "required": true
      }
    }
  ],
  "settings": {
    "canvasWidth": 20,
    "gridSize": 8
  }
}
```

---

## Components

### Add Component

**Endpoint:** `POST /forms/:formId/components`

**Authentication:** Required (owner only)

**Request Body:**
```json
{
  "type": "text-input",
  "x": 0,
  "y": 0,
  "w": 10,
  "h": 1,
  "props": {
    "label": "Name",
    "placeholder": "Enter your name",
    "required": true
  }
}
```

**Validation:**
- `w` must be 1-20 (depends on component type)
- `h` must be 1-10 (depends on component type)
- `x + w` must not exceed 20
- `y + h` must not exceed form height

**Response (201):**
```json
{
  "id": "comp-uuid-789",
  "type": "text-input",
  "x": 0,
  "y": 0,
  "w": 10,
  "h": 1,
  "props": {
    "label": "Name",
    "placeholder": "Enter your name",
    "required": true
  }
}
```

---

### Update Component

**Endpoint:** `PUT /forms/:formId/components/:componentId`

**Authentication:** Required (owner only)

**Request Body:**
```json
{
  "label": "Full Name",
  "placeholder": "First and last name",
  "required": false
}
```

**Response (200):**
```json
{
  "id": "comp-uuid-789",
  "type": "text-input",
  "props": {
    "label": "Full Name",
    "placeholder": "First and last name",
    "required": false
  }
}
```

---

### Delete Component

**Endpoint:** `DELETE /forms/:formId/components/:componentId`

**Authentication:** Required (owner only)

**Response (204):** No content

---

## Responses

### Submit Form Response

**Endpoint:** `POST /forms/:formId/responses`

**Authentication:** Not required (public form submission)

**Request Body:**
```json
{
  "values": {
    "comp-1": "John Doe",
    "comp-2": "john@example.com",
    "comp-3": true
  }
}
```

**Validation:**
- All required components must have values
- Values must match component type validation rules
- String lengths must be within min/max constraints
- Numbers must be within min/max constraints
- Email values must match email regex

**Response (201):**
```json
{
  "_id": "response-uuid-321",
  "formId": "form-uuid-123",
  "values": {
    "comp-1": "John Doe",
    "comp-2": "john@example.com",
    "comp-3": true
  },
  "submittedAt": "2025-12-04T10:45:00Z"
}
```

**Error Responses:**
- `400 Bad Request` - Validation failed
  ```json
  {
    "error": "VALIDATION_ERROR",
    "details": [
      {
        "field": "comp-2",
        "message": "Must be a valid email"
      }
    ]
  }
  ```
- `404 Not Found` - Form doesn't exist or not published

---

### Get Form Responses

**Endpoint:** `GET /forms/:formId/responses?page=1&limit=20`

**Authentication:** Required (owner only)

**Query Parameters:**
- `page` (optional, default: 1)
- `limit` (optional, default: 20)

**Response (200):**
```json
{
  "data": [
    {
      "_id": "response-uuid-321",
      "formId": "form-uuid-123",
      "values": {
        "comp-1": "John Doe",
        "comp-2": "john@example.com"
      },
      "submittedAt": "2025-12-04T10:45:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 42
  }
}
```

---

### Get Single Response

**Endpoint:** `GET /forms/:formId/responses/:responseId`

**Authentication:** Required (owner only)

**Response (200):**
```json
{
  "_id": "response-uuid-321",
  "formId": "form-uuid-123",
  "values": {
    "comp-1": "John Doe",
    "comp-2": "john@example.com",
    "comp-3": true
  },
  "submittedAt": "2025-12-04T10:45:00Z"
}
```

---

### Delete Response

**Endpoint:** `DELETE /forms/:formId/responses/:responseId`

**Authentication:** Required (owner only)

**Response (204):** No content

---

## Export

### Export Responses as CSV

**Endpoint:** `GET /forms/:formId/responses/export/csv`

**Authentication:** Required (owner only)

**Response:** CSV file download

```csv
Timestamp,Name,Email,Subscribe
2025-12-04T10:45:00Z,John Doe,john@example.com,true
2025-12-04T11:00:00Z,Jane Smith,jane@example.com,false
```

---

### Export Responses as JSON

**Endpoint:** `GET /forms/:formId/responses/export/json`

**Authentication:** Required (owner only)

**Response:** JSON file download

```json
{
  "form": {
    "_id": "form-uuid-123",
    "title": "Customer Feedback Survey"
  },
  "exportedAt": "2025-12-04T12:00:00Z",
  "responses": [
    {
      "id": "response-uuid-321",
      "values": {
        "comp-1": "John Doe"
      },
      "submittedAt": "2025-12-04T10:45:00Z"
    }
  ]
}
```

---

## Error Codes

| Code | HTTP Status | Description |
|------|------------|-------------|
| NOT_FOUND | 404 | Resource doesn't exist |
| UNAUTHORIZED | 403 | User doesn't have permission |
| VALIDATION_ERROR | 400 | Input validation failed |
| INVALID_FORM | 400 | Form format is invalid |
| INVALID_RESPONSE | 400 | Response submission is invalid |
| CONFLICT | 409 | Resource already exists (e.g., duplicate slug) |
| SERVER_ERROR | 500 | Internal server error |

---

## Rate Limiting

- **Anonymous users**: 10 form submissions per hour per IP
- **Authenticated users**: 100 API requests per minute
- **Burst limit**: 20 requests per second

Response headers include:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1701696000
```

---

## Pagination

All list endpoints support pagination:

```
GET /api/forms?page=2&limit=25
```

Response includes:
```json
{
  "data": [...],
  "pagination": {
    "page": 2,
    "limit": 25,
    "total": 100,
    "pages": 4
  }
}
```

---

## Authentication

Bearer token in Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

---

## Validation Rules

### Required Field Validation

All required fields must have non-empty values.

### Text Input Validation

- Min length constraint (if specified)
- Max length constraint (if specified)
- Regex pattern matching (if specified)

### Number Input Validation

- Min value constraint (if specified)
- Max value constraint (if specified)
- Must be a valid number

### Select Validation

- Value must be one of the specified options

### Email Validation

- Must match RFC 5322 email regex

### Checkbox Validation

- Value must be true or false

---

## CORS

CORS is enabled for:
- `https://nimbl.app`
- `https://*.nimbl.app`
- `http://localhost:3000` (development)

---

## Versioning

API version: `v1`

Future versions will be available at:
```
https://nimbl.app/api/v2/...
```

Deprecation notices will be provided 3 months in advance.

