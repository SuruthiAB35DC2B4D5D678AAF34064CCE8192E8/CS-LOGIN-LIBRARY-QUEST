-- Phase 1: Add user_id columns and update RLS for stronger security

-- Add user_id column to borrowed_books table
ALTER TABLE public.borrowed_books 
ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Add user_id column to chat_messages table  
ALTER TABLE public.chat_messages 
ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Drop existing RLS policies on borrowed_books
DROP POLICY IF EXISTS "Users can view their own borrowed books" ON public.borrowed_books;
DROP POLICY IF EXISTS "Admins can view all borrowed books" ON public.borrowed_books;
DROP POLICY IF EXISTS "Authenticated users can borrow books with their email" ON public.borrowed_books;
DROP POLICY IF EXISTS "Admins can update borrowed books" ON public.borrowed_books;

-- Create new RLS policies for borrowed_books using user_id
CREATE POLICY "Users can view their own borrowed books"
ON public.borrowed_books
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Admins can view all borrowed books"
ON public.borrowed_books
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'staff'));

CREATE POLICY "Users can borrow books for themselves"
ON public.borrowed_books
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can update borrowed books"
ON public.borrowed_books
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'staff'));

-- Drop existing RLS policies on chat_messages
DROP POLICY IF EXISTS "Users can view their own messages and admin responses" ON public.chat_messages;
DROP POLICY IF EXISTS "Users can send messages with their own email" ON public.chat_messages;
DROP POLICY IF EXISTS "Users can mark their received messages as read" ON public.chat_messages;

-- Create new RLS policies for chat_messages using user_id
-- Users can see their own messages (sent by them) + admin responses TO them
CREATE POLICY "Users can view their own conversations"
ON public.chat_messages
FOR SELECT
TO authenticated
USING (
  user_id = auth.uid() 
  OR has_role(auth.uid(), 'admin')
);

-- Users can only insert messages with their own user_id
CREATE POLICY "Users can send their own messages"
ON public.chat_messages
FOR INSERT
TO authenticated
WITH CHECK (
  user_id = auth.uid() 
  AND (is_admin = false OR has_role(auth.uid(), 'admin'))
);

-- Users can update is_read on messages in their conversation
CREATE POLICY "Users can mark messages as read"
ON public.chat_messages
FOR UPDATE
TO authenticated
USING (user_id = auth.uid() OR has_role(auth.uid(), 'admin'));