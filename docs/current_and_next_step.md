# NIMBL - Current & Next Steps

**Last Updated:** December 4, 2025

---

## ✅ Current Status: Phase 1 Complete (Steps 1-3)

### What's Done

#### Step 1: Database Abstraction Layer
- ✅ Created `packages/db` with TypeScript config
- ✅ Defined `IDBAdapter` interface (16 operations)
- ✅ Implemented `SupabaseAdapter` (PostgreSQL via Supabase)
- ✅ Created connection singleton (`getDB()`)
- ✅ Setup `.env.local` with SUPABASE_URL and SUPABASE_KEY

#### Step 2: Data Type Definitions
- ✅ Defined TypeScript types:
  - FormSchema (form document)
  - ComponentSchema (canvas component)
  - ResponseSchema (form submission)
  - UserSchema (user account)
- ✅ Created component constraints
- ✅ Exported all types from `@nimbl/db`

#### Step 3: Business Logic Services
- ✅ Created `FormService` with 8 methods:
  - createForm()
  - getForm() + ownership validation
  - updateForm() + ownership validation
  - deleteForm() + cascade delete
  - listForms() + pagination
  - getFormBySlug()
  - publishForm()
  - unpublishForm()
- ✅ Created `ResponseService` with 5 methods:
  - createResponse() + validation
  - getResponse() + ownership validation
  - listResponses() + pagination
  - deleteResponse() + ownership validation
  - exportResponsesAsCSV()
- ✅ Implemented ownership validation on all user operations
- ✅ Implemented comprehensive input validation
- ✅ Switched from MongoDB to Supabase (PostgreSQL)

---

## 🚀 Next Steps: Phase 2 (Steps 4-8)

### Step 4: Form CRUD API Routes (NEXT)

**What to build:**
```
POST   /api/forms              - Create new form
GET    /api/forms              - List user's forms
GET    /api/forms/:id          - Get single form
PUT    /api/forms/:id          - Update form
DELETE /api/forms/:id          - Delete form (cascade)
```

**Files to create/modify:**
- `apps/web/src/app/api/forms/route.ts` (POST, GET)
- `apps/web/src/app/api/forms/[id]/route.ts` (GET, PUT, DELETE)

**Acceptance Criteria:**
- ✓ Can create form with title
- ✓ Can list all user's forms (paginated)
- ✓ Can get single form by ID (ownership check)
- ✓ Can update form (ownership check)
- ✓ Can delete form with cascade delete of responses
- ✓ Returns 403 for unauthorized access
- ✓ Returns 404 for non-existent forms
- ✓ Returns 400 for validation errors
- ✓ Response includes pagination metadata

**Estimated Time:** 1-2 hours

**Dependencies:** Steps 1-3 complete ✅

---

### Step 5: Form Publishing Routes

**What to build:**
```
POST   /api/forms/:id/publish    - Publish form (make public)
POST   /api/forms/:id/unpublish  - Unpublish form
GET    /api/public/forms/:slug   - Get published form (no auth)
```

**Files to create:**
- `apps/web/src/app/api/forms/[id]/publish/route.ts`
- `apps/web/src/app/api/public/forms/[slug]/route.ts`

**Acceptance Criteria:**
- ✓ Can publish form to make it public
- ✓ Can unpublish form to make it private
- ✓ Public form accessible without authentication
- ✓ Cannot access unpublished form via public endpoint
- ✓ Slug must be unique

---

### Step 6: Canvas Component Routes

**What to build:**
```
POST   /api/forms/:id/components                   - Add component
PUT    /api/forms/:id/components/:componentId      - Update component
DELETE /api/forms/:id/components/:componentId      - Remove component
```

**Files to create:**
- `apps/web/src/app/api/forms/[id]/components/route.ts`
- `apps/web/src/app/api/forms/[id]/components/[componentId]/route.ts`

**Acceptance Criteria:**
- ✓ Can add component to form canvas
- ✓ Can update component properties
- ✓ Can delete component from form
- ✓ Validates component dimensions against constraints
- ✓ Returns 404 if component not found

---

### Step 7: Form Response Routes

**What to build:**
```
POST   /api/forms/:id/responses              - Submit response (public)
GET    /api/forms/:id/responses              - List responses (owner only)
GET    /api/forms/:id/responses/:responseId  - Get response (owner only)
DELETE /api/forms/:id/responses/:responseId  - Delete response (owner only)
```

**Files to create:**
- `apps/web/src/app/api/forms/[id]/responses/route.ts`
- `apps/web/src/app/api/forms/[id]/responses/[responseId]/route.ts`

**Acceptance Criteria:**
- ✓ Can submit response to published form
- ✓ Validates response against form schema
- ✓ Returns 400 if validation fails with details
- ✓ Can list responses (paginated, owner only)
- ✓ Can get single response (owner only)
- ✓ Can delete response (owner only)

---

### Step 8: Response Export Routes

**What to build:**
```
GET /api/forms/:id/responses/export/csv  - Export as CSV
GET /api/forms/:id/responses/export/json - Export as JSON
```

**Files to create:**
- `apps/web/src/app/api/forms/[id]/responses/export/route.ts`

**Acceptance Criteria:**
- ✓ Can export all responses as CSV
- ✓ Can export all responses as JSON
- ✓ Export includes all response fields
- ✓ Timestamps formatted correctly
- ✓ Owner only (403 otherwise)

---

## Architecture Notes

### Clean Microservice Architecture Implemented

```
┌─────────────────────────────────────┐
│   HTTP Routes (thin layer)          │
│   - Validation                      │
│   - Error handling                  │
│   - Response formatting             │
└────────────────┬────────────────────┘
                 │
┌────────────────▼────────────────────┐
│   Services (business logic)         │
│   - FormService                     │
│   - ResponseService                 │
│   - Ownership validation            │
│   - Input validation                │
└────────────────┬────────────────────┘
                 │
┌────────────────▼────────────────────┐
│   IDBAdapter (interface)            │
│   - All 16 operations               │
└────────────────┬────────────────────┘
                 │
┌────────────────▼────────────────────┐
│   SupabaseAdapter (implementation)  │
│   - PostgreSQL via Supabase         │
│   - Connection pooling              │
│   - Performance indexes             │
└─────────────────────────────────────┘
```

**Key Benefits:**
- ✅ Services never directly access database
- ✅ Ownership validation impossible to bypass
- ✅ Can swap database without changing services
- ✅ Can extract services to microservices later
- ✅ Services are fully testable (mock adapter)

---

## Environment Setup

### Before Step 4

1. Create Supabase project (already done: "nimbl")
2. Add credentials to `.env.local`:
   ```
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_KEY=your-anon-key
   ```
3. Create database schema in Supabase:
   - `forms` table (id, owner_id, title, slug, description, components, published, created_at, updated_at)
   - `responses` table (id, form_id, values, submitted_at, created_at)
   - `users` table (id, email, name, created_at, updated_at)

---

## File Structure

```
apps/web/src/app/
├── api/
│   ├── forms/
│   │   ├── route.ts (POST/GET forms)
│   │   └── [id]/
│   │       ├── route.ts (GET/PUT/DELETE single form)
│   │       ├── publish/route.ts
│   │       ├── components/route.ts
│   │       └── responses/route.ts
│   └── public/
│       └── forms/[slug]/route.ts
├── editor/
│   └── page.tsx (form editor UI)
└── forms/
    └── page.tsx (form list dashboard)
```

---

## Testing Strategy

### Before committing Step 4:

1. Test in Chrome DevTools console:
   ```javascript
   // Create form
   fetch('/api/forms', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({ title: 'Test Form' })
   }).then(r => r.json()).then(d => console.log(d))
   ```

2. Test with cURL:
   ```bash
   curl -X POST http://localhost:3000/api/forms \
     -H "Content-Type: application/json" \
     -d '{"title":"Test Form"}'
   ```

3. Test error cases:
   - Missing title → 400
   - Get other user's form → 403
   - Get non-existent form → 404

---

## Checklist Before Step 4

- [ ] Supabase project created
- [ ] Environment variables set in `.env.local`
- [ ] Database schema created (forms, responses tables)
- [ ] FormService and ResponseService compile without errors
- [ ] Ownership validation working in services
- [ ] Ready to build API routes

---

## Progress Tracking

| Phase | Steps | Status | Est. Time |
|-------|-------|--------|-----------|
| 1 | 1-3 | ✅ DONE | 2 days |
| 2 | 4-8 | ⏳ NEXT | 3-5 days |
| 3 | 9-15 | ⏹️ TODO | 5-7 days |
| 4 | 16-25 | ⏹️ TODO | 7-10 days |
| 5 | 26-40 | ⏹️ TODO | 10-15 days |

**Total Estimate:** 30-40 days of development

---

## Notes

- Each step is atomic and independently testable
- Steps can be reordered based on priorities
- Phase 1 foundation is solid and ready for Phase 2
- No rework needed - ready to proceed
- Test thoroughly between phases

