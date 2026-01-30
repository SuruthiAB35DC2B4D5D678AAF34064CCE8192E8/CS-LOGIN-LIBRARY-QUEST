import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, BookCheck, Loader2, CheckCircle, AlertCircle, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import digitalLibraryBackground from "@/assets/digital-library-background.jpg";
import { useUserRole } from "@/hooks/useUserRole";

interface BorrowedBook {
  id: string;
  book_name: string;
  start_date: string;
  end_date: string;
  student_name: string;
  department: string;
  class: string;
  roll_number: string;
  email: string;
}

const ReturnBook = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { userEmail, isAdmin, isStaff, isLoading: isRoleLoading } = useUserRole();
  
  const [borrowedBooks, setBorrowedBooks] = useState<BorrowedBook[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isReturning, setIsReturning] = useState<string | null>(null);

  // Fetch borrowed books for current user or all if admin
  const fetchBorrowedBooks = async () => {
    if (!userEmail && !isAdmin && !isStaff) return;
    
    setIsLoading(true);
    
    try {
      // Build query - admins/staff see all, regular users see their own
      let query = supabase
        .from("borrowed_books")
        .select("id, book_name, start_date, end_date, student_name, department, class, roll_number, email")
        .eq("is_returned", false)
        .order("end_date", { ascending: true });

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      setBorrowedBooks(data || []);
    } catch (error) {
      console.error("Error fetching books:", error);
      toast({
        title: "Failed to Load Books",
        description: "Unable to fetch borrowed books. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch books when user role is loaded
  useEffect(() => {
    if (!isRoleLoading && userEmail) {
      fetchBorrowedBooks();
    }
  }, [isRoleLoading, userEmail, isAdmin, isStaff]);

  const handleReturn = async (bookId: string, bookName: string) => {
    // Only admins/staff can return books
    if (!isAdmin && !isStaff) {
      toast({
        title: "Permission Denied",
        description: "Only library staff can mark books as returned. Please visit the library.",
        variant: "destructive",
      });
      return;
    }

    setIsReturning(bookId);

    try {
      const { error } = await supabase
        .from("borrowed_books")
        .update({ is_returned: true })
        .eq("id", bookId);

      if (error) {
        throw error;
      }

      // Remove the returned book from the list
      setBorrowedBooks((prev) => prev.filter((book) => book.id !== bookId));

      toast({
        title: "Book Returned Successfully!",
        description: `"${bookName}" has been marked as returned.`,
      });
    } catch (error) {
      toast({
        title: "Return Failed",
        description: "Failed to return the book. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsReturning(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const isOverdue = (endDate: string) => {
    return new Date(endDate) < new Date();
  };

  // Show loading state
  if (isRoleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-gradient-background"
      style={{
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url(${digitalLibraryBackground})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate("/home")}
            className="bg-background/80 backdrop-blur-sm"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-white">
              {isAdmin || isStaff ? "Return Books (Admin)" : "My Borrowed Books"}
            </h1>
            <p className="text-white/70">
              {isAdmin || isStaff 
                ? "View and process book returns for all students"
                : "View your currently borrowed books"
              }
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchBorrowedBooks}
            disabled={isLoading}
            className="bg-background/80 backdrop-blur-sm"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Info Card */}
        <Card className="max-w-4xl mx-auto mb-8 bg-background/95 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookCheck className="h-5 w-5 text-primary" />
              {isAdmin || isStaff ? "All Borrowed Books" : "Your Borrowed Books"}
            </CardTitle>
            <CardDescription>
              {isAdmin || isStaff 
                ? `Showing all currently borrowed books. Found ${borrowedBooks.length} book(s).`
                : `Books borrowed with ${userEmail}. Found ${borrowedBooks.length} book(s).`
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : borrowedBooks.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="h-12 w-12 text-primary mx-auto mb-4" />
                <p className="text-muted-foreground">
                  {isAdmin || isStaff 
                    ? "No books are currently borrowed by any student."
                    : "You don't have any borrowed books."
                  }
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  {isAdmin || isStaff 
                    ? "All books have been returned."
                    : "Visit the Book Borrowing page to borrow a book."
                  }
                </p>
              </div>
            ) : (
              <>
                {borrowedBooks.some((book) => isOverdue(book.end_date)) && (
                  <Alert variant="destructive" className="mb-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Some books are overdue! {isAdmin || isStaff 
                        ? "Contact students to return immediately."
                        : "Please return them immediately to avoid late fees."
                      }
                    </AlertDescription>
                  </Alert>
                )}
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Book Name</TableHead>
                      {(isAdmin || isStaff) && <TableHead>Student</TableHead>}
                      <TableHead>Borrowed Date</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Status</TableHead>
                      {(isAdmin || isStaff) && (
                        <TableHead className="text-right">Action</TableHead>
                      )}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {borrowedBooks.map((book) => (
                      <TableRow key={book.id}>
                        <TableCell className="font-medium">
                          {book.book_name}
                        </TableCell>
                        {(isAdmin || isStaff) && (
                          <TableCell>
                            <div className="text-sm">
                              <p className="font-medium">{book.student_name}</p>
                              <p className="text-muted-foreground">{book.roll_number}</p>
                            </div>
                          </TableCell>
                        )}
                        <TableCell>{formatDate(book.start_date)}</TableCell>
                        <TableCell>{formatDate(book.end_date)}</TableCell>
                        <TableCell>
                          {isOverdue(book.end_date) ? (
                            <span className="inline-flex items-center gap-1 text-destructive font-medium">
                              <AlertCircle className="h-3 w-3" />
                              Overdue
                            </span>
                          ) : (
                            <span className="text-primary font-medium">Active</span>
                          )}
                        </TableCell>
                        {(isAdmin || isStaff) && (
                          <TableCell className="text-right">
                            <Button
                              size="sm"
                              onClick={() => handleReturn(book.id, book.book_name)}
                              disabled={isReturning === book.id}
                            >
                              {isReturning === book.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <>
                                  <BookCheck className="h-4 w-4 mr-1" />
                                  Return
                                </>
                              )}
                            </Button>
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {/* Note for regular users */}
                {!isAdmin && !isStaff && (
                  <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      <span className="font-medium">Note:</span> To return a book, 
                      please visit the library and hand it over to the librarian who will 
                      process the return.
                    </p>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ReturnBook;
