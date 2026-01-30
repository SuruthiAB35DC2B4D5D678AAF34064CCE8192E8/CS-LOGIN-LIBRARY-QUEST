

## Security Remediation Plan

### Phase 1: Create User Roles System (High Priority)

1. **Create app_role enum and user_roles table**
   - Define roles: `admin`, `staff`, `student`
   - Create `user_roles` table with proper foreign key to `auth.users`
   - Create `has_role()` security definer function to prevent RLS recursion

2. **Create profiles table** (optional but recommended)
   - Store student roll numbers linked to authenticated user IDs
   - This allows proper identity verification

### Phase 2: Fix borrowed_books RLS Policies

1. **Drop existing permissive policies**:
   - Remove `Anyone can view borrowed books`
   - Remove `Anyone can borrow books`
   - Remove `Anyone can update borrowed books`

2. **Create proper restrictive policies**:
   - **SELECT**: Authenticated users can only view their own records (by email matching auth.jwt()->email) OR admins can view all
   - **INSERT**: Only authenticated users can insert, and email must match their auth email
   - **UPDATE**: Only admins can update records (for marking returns)

### Phase 3: Fix chat_messages RLS Policies

1. **Drop existing permissive policies**

2. **Create proper restrictive policies**:
   - **SELECT**: Users see messages where their email matches sender_email OR messages from admins
   - **INSERT**: Users can only insert with their own email, cannot set `is_admin = true` unless they have admin role
   - **UPDATE**: Users can only update `is_read` on messages sent to them, not content

### Phase 4: Update Frontend Code

1. **BookBorrow.tsx**:
   - Use authenticated user's email from session instead of user input
   - Pre-fill student details from their profile

2. **ReturnBook.tsx**:
   - Restrict to admin users only OR allow students to only see their own books
   - Remove the roll number search for students (auto-load their own books)

3. **Chat System**:
   - Create admin chat panel (separate component)
   - Use authenticated user info instead of allowing user input for sender details
   - Hide `is_admin` toggle from regular users

### Phase 5: Enable Additional Security Features

1. **Enable leaked password protection** in auth settings
2. **Add email verification** for new accounts (currently auto-confirm is on for testing)

### Database Migration SQL Preview

```sql
-- Create app_role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'staff', 'student');

-- Create user_roles table
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    UNIQUE (user_id, role)
);

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Drop old permissive policies and create proper ones
-- ... (detailed SQL for each table)
```

### Summary of Changes

| Component | Current State | After Fix |
|-----------|--------------|-----------|
| `borrowed_books` SELECT | Anyone can read all | Students see own records, admins see all |
| `borrowed_books` INSERT | Anyone can insert any data | Only authenticated users with matching email |
| `borrowed_books` UPDATE | Anyone can update any record | Only admins can mark returns |
| `chat_messages` SELECT | Anyone can read all | Users see their conversations only |
| `chat_messages` INSERT | Anyone can impersonate admin | `is_admin` only true if user has admin role |
| `chat_messages` UPDATE | Anyone can edit any message | Only `is_read` field, own messages only |
| Password Security | Leaked password check OFF | Enabled |

