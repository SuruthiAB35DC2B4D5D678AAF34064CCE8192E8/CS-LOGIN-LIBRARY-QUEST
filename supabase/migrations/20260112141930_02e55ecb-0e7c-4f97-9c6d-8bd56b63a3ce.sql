-- Create a table to track borrowed books
CREATE TABLE public.borrowed_books (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  roll_number TEXT NOT NULL,
  student_name TEXT NOT NULL,
  email TEXT NOT NULL,
  department TEXT NOT NULL,
  class TEXT NOT NULL,
  book_name TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_returned BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create unique constraint to prevent same student from borrowing multiple books
-- A student can only have ONE active (not returned) book at a time
CREATE UNIQUE INDEX idx_one_active_book_per_student 
ON public.borrowed_books (roll_number) 
WHERE is_returned = false;

-- Enable Row Level Security
ALTER TABLE public.borrowed_books ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read borrowed books (for checking if student already has a book)
CREATE POLICY "Anyone can view borrowed books" 
ON public.borrowed_books 
FOR SELECT 
USING (true);

-- Allow anyone to insert borrowed books (public borrowing form)
CREATE POLICY "Anyone can borrow books" 
ON public.borrowed_books 
FOR INSERT 
WITH CHECK (true);

-- Allow updates (for marking as returned)
CREATE POLICY "Anyone can update borrowed books" 
ON public.borrowed_books 
FOR UPDATE 
USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_borrowed_books_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_borrowed_books_updated_at
BEFORE UPDATE ON public.borrowed_books
FOR EACH ROW
EXECUTE FUNCTION public.update_borrowed_books_updated_at();