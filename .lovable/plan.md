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

## ✅ COMPLETED - Phase 5: Enhanced Security with user_id

1. ✅ **Added user_id column to borrowed_books and chat_messages**
   - Both tables now use user_id for RLS instead of email-based matching
   - This prevents enumeration attacks and ensures proper identity verification

2. ✅ **Updated RLS policies to use user_id = auth.uid()**
   - `borrowed_books`: SELECT, INSERT, UPDATE now use user_id
   - `chat_messages`: SELECT, INSERT, UPDATE, DELETE now use user_id
   - Added DELETE policies for data management

3. ✅ **Updated frontend code**
   - `useUserRole` hook now exposes userId
   - `BookBorrow.tsx` includes user_id in insert operations
   - `ReturnBook.tsx` fetches using user_id context

## ⚠️ PENDING - Phase 6: User Action Required

1. ⚠️ **Enable leaked password protection**
   - Status: PENDING - Requires user action in Lovable Cloud settings
   - Go to: Settings → Auth → Enable "Leaked password protection"

## Summary of Security Improvements

| Component | Before | After |
|-----------|--------|-------|
| `borrowed_books` SELECT | Email-based matching | user_id = auth.uid() |
| `borrowed_books` INSERT | Email verification only | user_id = auth.uid() required |
| `borrowed_books` UPDATE | Admin/staff role check | Admin/staff role check |
| `borrowed_books` DELETE | Not allowed | Admin only |
| `chat_messages` SELECT | Email + is_admin check | user_id = auth.uid() |
| `chat_messages` INSERT | Email + admin role check | user_id = auth.uid() |
| `chat_messages` UPDATE | Email-based | user_id = auth.uid() |
| `chat_messages` DELETE | Not allowed | user_id = auth.uid() |
| `profiles` DELETE | Not allowed | user_id = auth.uid() |
| User Roles | Implemented | Working with has_role() function |
| Password Security | Leaked check OFF | Pending user action |

## New Database Schema

### Columns Added
- `borrowed_books.user_id` - UUID referencing auth.users
- `chat_messages.user_id` - UUID referencing auth.users

### RLS Policies Updated
- All policies now use `user_id = auth.uid()` for secure identity verification
- DELETE policies added for data management

### Frontend Updates
- `useUserRole` hook returns `userId` for use in queries
- All database operations include `user_id` field

## Remaining Action Item

⚠️ **Enable Leaked Password Protection** in your Lovable Cloud auth settings.
