# NIMBL Auth & Storage System

## Overview

Complete authentication and local storage system with:
- ✅ httpOnly cookie-based sessions (secure)
- ✅ Race condition protection (mutex locks, debouncing)
- ✅ Network resilience (offline-first with IndexedDB)
- ✅ Dual auth tracks (username/password + OAuth)
- ✅ Automatic token refresh
- ✅ Local autosave with migration to server

## Architecture

### Auth Flow
```
1. User edits form in /playground (unauthenticated)
2. Form auto-saves to IndexedDB every 2 seconds
3. User clicks "Save" or "Publish"
4. Auth modal appears
5. User authenticates
6. Form migrates from IndexedDB to server
7. Redirect to /editor/:id (synced)
```

### Session Service (Race-Safe)

**Location:** `src/lib/auth/session.ts`

**Features:**
- Single source of truth for auth state
- Mutex locks prevent concurrent refresh
- Automatic token refresh 60s before expiry
- Event-based state broadcasting
- Debounced refresh calls

**Usage:**
```typescript
import { getSessionService } from '@/lib/auth';

const session = getSessionService();

// Sign in
await session.signIn(username, password);

// Sign up
await session.signUp(username, password);

// OAuth
await session.signInWithOAuth('google' | 'github');

// Check auth
const isAuth = session.isAuthenticated();
const user = session.getUser();

// Subscribe to changes
const unsubscribe = session.subscribe((state) => {
  console.log('Auth changed:', state.user);
});
```

### React Hook

**Location:** `src/lib/auth/useAuth.ts`

**Usage:**
```typescript
import { useAuth } from '@/lib/auth';

function MyComponent() {
  const { user, session, loading } = useAuth();

  if (loading) return <div>Loading...</div>;
  if (!user) return <div>Not authenticated</div>;

  return <div>Hello {user.email}</div>;
}
```

### Form Storage (IndexedDB)

**Location:** `src/lib/storage/formStorage.ts`

**Features:**
- Offline-first persistence
- Automatic sync status tracking
- Query unsynced forms
- Batch operations

**Usage:**
```typescript
import { getFormStorage } from '@/lib/storage';

const storage = getFormStorage();

// Save form locally
await storage.saveForm({
  id: 'form-123',
  title: 'Contact Form',
  components: [...],
  settings: {...}
});

// Get form
const form = await storage.getForm('form-123');

// Get all unsynced forms
const unsynced = await storage.getUnsyncedForms();

// Mark as synced after server save
await storage.markSynced('form-123');
```

### Autosave Hook

**Location:** `src/lib/storage/useAutosave.ts`

**Features:**
- Debounced saves (default 2s)
- Deduplication (skip if unchanged)
- Immediate save on unmount
- Error handling

**Usage:**
```typescript
import { useAutosave } from '@/lib/storage';

function FormEditor() {
  const [formData, setFormData] = useState({...});

  const { save, saving } = useAutosave('form-123', formData, {
    debounceMs: 2000,
    onSave: () => console.log('Saved!'),
    onError: (err) => console.error(err),
  });

  // Manual save
  const handleSaveNow = () => save();

  return <div>...</div>;
}
```

### Auth Modal

**Location:** `src/components/AuthModal.tsx`

**Features:**
- Username/password authentication
- Google & GitHub OAuth
- Sign in / Sign up toggle
- Error handling
- Loading states

**Usage:**
```typescript
import { AuthModal } from '@/components/AuthModal';

function Playground() {
  const [showAuth, setShowAuth] = useState(false);

  const handleSave = () => {
    const { user } = useAuth();
    if (!user) {
      setShowAuth(true);
    } else {
      // Save to server
    }
  };

  return (
    <>
      <button onClick={handleSave}>Save</button>
      <AuthModal
        isOpen={showAuth}
        onClose={() => setShowAuth(false)}
        onSuccess={() => {
          // Migrate local form to server
        }}
      />
    </>
  );
}
```

## Environment Setup

**File:** `apps/web/.env.local`

```bash
# Database (server-side)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your_service_role_key

# Auth (client-side)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

## Middleware

**File:** `middleware.ts`

Automatically refreshes sessions on each request using httpOnly cookies.

## Key Design Decisions

### Why httpOnly Cookies?
- XSS protection (JavaScript can't access)
- Automatic attachment to requests
- Secure by default

### Why Mutex Locks?
- Prevents concurrent token refresh
- Avoids race conditions
- Single refresh promise shared

### Why IndexedDB?
- Survives page refresh
- Survives network issues
- No size limits (unlike localStorage)
- Structured queries

### Why Debouncing?
- Reduces write operations
- Better performance
- Less battery drain
- Network efficiency

## Migration Flow

When user authenticates after local editing:

```typescript
// 1. Get unsynced forms
const storage = getFormStorage();
const unsynced = await storage.getUnsyncedForms();

// 2. Upload to server
for (const form of unsynced) {
  const response = await fetch('/api/forms', {
    method: 'POST',
    body: JSON.stringify(form),
  });
  
  if (response.ok) {
    await storage.markSynced(form.id);
  }
}
```

## Security Notes

- ✅ Tokens stored in httpOnly cookies (not localStorage)
- ✅ CSRF protection via Supabase
- ✅ OAuth redirects validated
- ✅ Username format: `username@nimbl.local` (not real email)
- ✅ Password hashing via Supabase Auth

## Next Steps

1. ✅ Auth infrastructure
2. ✅ Session service with race protection
3. ✅ IndexedDB storage
4. ✅ Autosave hook
5. ✅ Auth modal
6. ⏳ Build /playground page
7. ⏳ Implement local-to-server migration
