-- Add DELETE policies for better data management

-- Allow admins to delete borrowed books records (for cleanup/testing)
CREATE POLICY "Admins can delete borrowed books"
ON public.borrowed_books
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'));

-- Allow users to delete their own chat messages
CREATE POLICY "Users can delete their own messages"
ON public.chat_messages
FOR DELETE
TO authenticated
USING (user_id = auth.uid());

-- Allow users to delete their own profile
CREATE POLICY "Users can delete their own profile"
ON public.profiles
FOR DELETE
TO authenticated
USING (user_id = auth.uid());