-- Complete Security Setup Migration

-- Step 1: Create app_role enum if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role') THEN
        CREATE TYPE public.app_role AS ENUM ('admin', 'staff', 'student');
    END IF;
END$$;

-- Step 2: Create user_roles table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Step 3: Create has_role function
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

-- Step 4: Create update_updated_at_column function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Step 5: Drop all existing policies on user_roles
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;

-- Create user_roles policies
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Admins can view all roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- Step 6: Create profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    roll_number TEXT,
    student_name TEXT,
    department TEXT,
    class TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing profile policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

-- Create profile policies
CREATE POLICY "Users can view their own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can update their own profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own profile"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for profiles if not exists
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Step 7: Fix borrowed_books RLS policies
DROP POLICY IF EXISTS "Anyone can view borrowed books" ON public.borrowed_books;
DROP POLICY IF EXISTS "Anyone can borrow books" ON public.borrowed_books;
DROP POLICY IF EXISTS "Anyone can update borrowed books" ON public.borrowed_books;
DROP POLICY IF EXISTS "Users can view their own borrowed books" ON public.borrowed_books;
DROP POLICY IF EXISTS "Admins can view all borrowed books" ON public.borrowed_books;
DROP POLICY IF EXISTS "Authenticated users can borrow books with their email" ON public.borrowed_books;
DROP POLICY IF EXISTS "Admins can update borrowed books" ON public.borrowed_books;

CREATE POLICY "Users can view their own borrowed books"
ON public.borrowed_books
FOR SELECT
TO authenticated
USING (email = (auth.jwt()->>'email'));

CREATE POLICY "Admins can view all borrowed books"
ON public.borrowed_books
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'staff'::app_role));

CREATE POLICY "Authenticated users can borrow books with their email"
ON public.borrowed_books
FOR INSERT
TO authenticated
WITH CHECK (email = (auth.jwt()->>'email'));

CREATE POLICY "Admins can update borrowed books"
ON public.borrowed_books
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'staff'::app_role));

-- Step 8: Fix chat_messages RLS policies
DROP POLICY IF EXISTS "Anyone can view messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Anyone can insert messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Anyone can update messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Users can view their own messages and admin responses" ON public.chat_messages;
DROP POLICY IF EXISTS "Users can send messages with their own email" ON public.chat_messages;
DROP POLICY IF EXISTS "Users can mark their received messages as read" ON public.chat_messages;

CREATE POLICY "Users can view their own messages and admin responses"
ON public.chat_messages
FOR SELECT
TO authenticated
USING (
  sender_email = (auth.jwt()->>'email')
  OR is_admin = true
  OR public.has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Users can send messages with their own email"
ON public.chat_messages
FOR INSERT
TO authenticated
WITH CHECK (
  sender_email = (auth.jwt()->>'email')
  AND (
    is_admin = false
    OR public.has_role(auth.uid(), 'admin'::app_role)
  )
);

CREATE POLICY "Users can mark their received messages as read"
ON public.chat_messages
FOR UPDATE
TO authenticated
USING (
  (sender_email = (auth.jwt()->>'email') AND is_admin = false)
  OR public.has_role(auth.uid(), 'admin'::app_role)
);