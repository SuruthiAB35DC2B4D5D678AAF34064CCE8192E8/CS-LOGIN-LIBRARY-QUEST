# Security Remediation Plan

## ✅ COMPLETED - Phase 1: Create User Roles System

1. ✅ **Created app_role enum and user_roles table**
   - Defined roles: `admin`, `staff`, `student`
   - Created `user_roles` table with proper foreign key to `auth.users`
   - Created `has_role()` security definer function to prevent RLS recursion

2. ✅ **Created profiles table**
   - Stores student roll numbers linked to authenticated user IDs
   - Proper RLS policies for user access

## ✅ COMPLETED - Phase 2: Fix borrowed_books RLS Policies

1. ✅ **Dropped existing permissive policies**:
   - Removed `Anyone can view borrowed books`
   - Removed `Anyone can borrow books`
   - Removed `Anyone can update borrowed books`

2. ✅ **Created proper restrictive policies**:
   - **SELECT**: Authenticated users can only view their own records (by email matching auth.jwt()->email) OR admins can view all
   - **INSERT**: Only authenticated users can insert, and email must match their auth email
   - **UPDATE**: Only admins/staff can update records (for marking returns)

## ✅ COMPLETED - Phase 3: Fix chat_messages RLS Policies

1. ✅ **Dropped existing permissive policies**:
   - Removed `Anyone can view messages`
   - Removed `Anyone can insert messages`
   - Removed `Anyone can update messages`

2. ✅ **Created proper restrictive policies**:
   - **SELECT**: Users see messages where their email matches sender_email OR admin messages
   - **INSERT**: Users can only insert with their own email, cannot set `is_admin = true` unless they have admin role
   - **UPDATE**: Users can only update `is_read` on messages sent to them, admins can update all

## ✅ COMPLETED - Phase 4: Update Frontend Code

1. ✅ **BookBorrow.tsx**:
   - Uses authenticated user's email from session instead of user input
   - Email field is read-only and auto-populated
   - Pre-fills student details from their profile

2. ✅ **ReturnBook.tsx**:
   - Auto-loads user's borrowed books based on their email
   - Admin/staff users see all borrowed books
   - Only admin/staff can mark books as returned
   - Regular users see a note to visit library for returns

3. ✅ **Created helper hooks**:
   - `useUserRole` hook - checks user's role from database
   - `useUserProfile` hook - manages user profile data

## ⚠️ PENDING - Phase 5: Additional Security Features (User Action Required)

1. ⚠️ **Enable leaked password protection**
   - Status: PENDING - Requires user action in Lovable Cloud settings
   - Go to: Settings → Auth → Enable "Leaked password protection"

2. ✅ **Email verification**
   - Auto-confirm email is disabled (users must verify email)

## Summary of Security Improvements

| Component | Before | After |
|-----------|--------|-------|
| `borrowed_books` SELECT | Anyone can read all | Students see own records only, admins/staff see all |
| `borrowed_books` INSERT | Anyone can insert any data | Only authenticated users with matching email |
| `borrowed_books` UPDATE | Anyone can update any record | Only admins/staff can mark returns |
| `chat_messages` SELECT | Anyone can read all | Users see their conversations only |
| `chat_messages` INSERT | Anyone can impersonate admin | `is_admin` only true if user has admin role |
| `chat_messages` UPDATE | Anyone can edit any message | Only `is_read` field, own messages only |
| User Roles | Not implemented | Role-based access control with `has_role()` function |
| User Profiles | Not linked to auth | Profiles linked to authenticated users |

## New Database Schema

### Tables Created
- `user_roles` - Stores user roles (admin, staff, student)
- `profiles` - Stores student details linked to auth users

### Functions Created
- `has_role(user_id, role)` - Security definer function to check user roles safely

### Hooks Created
- `useUserRole` - Returns user session, roles, and admin/staff status
- `useUserProfile` - Manages user profile data

## Remaining Action Item

To complete the security hardening, enable **Leaked Password Protection** in your Lovable Cloud settings.
