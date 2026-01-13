import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, Search, BookCheck, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import digitalLibraryBackground from "@/assets/digital-library-background.jpg";

interface BorrowedBook {
  id: string;
  book_name: string;
  start_date: string;
  end_date: string;
  student_name: string;
  department: string;
  class: string;
}

const ReturnBook = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [rollNumber, setRollNumber] = useState("");
  const [borrowedBooks, setBorrowedBooks] = useState<BorrowedBook[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isReturning, setIsReturning] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!rollNumber.trim()) {
      toast({
        title: "Roll Number Required",
        description: "Please enter your roll number to search.",
        variant: "destructive",
      });
      return;
    }

    setIsSearching(true);
    setHasSearched(true);

    try {
      const { data, error } = await supabase
        .from("borrowed_books")
        .select("id, book_name, start_date, end_date, student_name, department, class")
        .eq("roll_number", rollNumber.trim().toUpperCase())
        .eq("is_returned", false);

      if (error) {
        throw error;
      }

      setBorrowedBooks(data || []);

      if (data && data.length === 0) {
        toast({
          title: "No Books Found",
          description: "No borrowed books found for this roll number.",
        });
      }
    } catch (error) {
      toast({
        title: "Search Failed",
        description: "Failed to fetch borrowed books. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleReturn = async (bookId: string, bookName: string) => {
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
          <div>
            <h1 className="text-3xl font-bold text-white">Return Book</h1>
            <p className="text-white/70">
              Enter your roll number to view and return borrowed books
            </p>
          </div>
        </div>

        {/* Search Card */}
        <Card className="max-w-2xl mx-auto mb-8 bg-background/95 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookCheck className="h-5 w-5 text-primary" />
              Find Your Borrowed Books
            </CardTitle>
            <CardDescription>
              Enter your roll number to see all books currently borrowed
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearch} className="flex gap-4">
              <div className="flex-1">
                <Label htmlFor="rollNumber" className="sr-only">
                  Roll Number
                </Label>
                <Input
                  id="rollNumber"
                  type="text"
                  placeholder="Enter Roll Number (e.g., M251712)"
                  value={rollNumber}
                  onChange={(e) => setRollNumber(e.target.value.toUpperCase())}
                  className="h-12"
                />
              </div>
              <Button type="submit" className="h-12 px-6" disabled={isSearching}>
                {isSearching ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Search className="h-4 w-4 mr-2" />
                    Search
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Results */}
        {hasSearched && (
          <Card className="max-w-4xl mx-auto bg-background/95 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Borrowed Books</CardTitle>
              <CardDescription>
                {borrowedBooks.length > 0
                  ? `Found ${borrowedBooks.length} book(s) currently borrowed`
                  : "No books currently borrowed"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {borrowedBooks.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    No borrowed books found for roll number{" "}
                    <span className="font-semibold">{rollNumber}</span>
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    All books have been returned or the roll number doesn't have any records.
                  </p>
                </div>
              ) : (
                <>
                  {borrowedBooks.some((book) => isOverdue(book.end_date)) && (
                    <Alert variant="destructive" className="mb-4">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        Some books are overdue! Please return them immediately to avoid late fees.
                      </AlertDescription>
                    </Alert>
                  )}
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Book Name</TableHead>
                        <TableHead>Borrowed Date</TableHead>
                        <TableHead>Due Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {borrowedBooks.map((book) => (
                        <TableRow key={book.id}>
                          <TableCell className="font-medium">
                            {book.book_name}
                          </TableCell>
                          <TableCell>{formatDate(book.start_date)}</TableCell>
                          <TableCell>{formatDate(book.end_date)}</TableCell>
                          <TableCell>
                            {isOverdue(book.end_date) ? (
                              <span className="inline-flex items-center gap-1 text-destructive font-medium">
                                <AlertCircle className="h-3 w-3" />
                                Overdue
                              </span>
                            ) : (
                              <span className="text-green-600 font-medium">Active</span>
                            )}
                          </TableCell>
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
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  {/* Student Info */}
                  {borrowedBooks[0] && (
                    <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                      <p className="text-sm text-muted-foreground">
                        <span className="font-medium">Student:</span>{" "}
                        {borrowedBooks[0].student_name} |{" "}
                        <span className="font-medium">Department:</span>{" "}
                        {borrowedBooks[0].department} |{" "}
                        <span className="font-medium">Class:</span>{" "}
                        {borrowedBooks[0].class}
                      </p>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ReturnBook;
