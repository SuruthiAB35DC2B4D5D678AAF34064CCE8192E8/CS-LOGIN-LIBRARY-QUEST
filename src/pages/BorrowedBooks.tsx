import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Calendar, ArrowLeft, ExternalLink, RefreshCcw } from "lucide-react";

export const BorrowedBooks = () => {
  const [books] = useState([
    {
      id: 1,
      title: "Advanced JavaScript Concepts",
      author: "John Smith",
      isbn: "978-1234567890",
      dueDate: "2024-01-15",
      status: "active",
      renewals: 1,
      coverUrl: "/placeholder.svg"
    },
    {
      id: 2,
      title: "Modern Web Development",
      author: "Jane Doe",
      isbn: "978-0987654321",
      dueDate: "2024-01-20",
      status: "overdue",
      renewals: 0,
      coverUrl: "/placeholder.svg"
    }
  ]);

  const handleOpenBook = (bookId: number, title: string) => {
    // Simulate opening a digital book
    alert(`Opening "${title}" - This would open the digital version of the book.`);
  };

  const handleRenewBook = (bookId: number, title: string) => {
    alert(`Renewing "${title}" - This would process the renewal request.`);
  };

  return (
    <div className="min-h-screen bg-gradient-background">
      {/* Header */}
      <header className="bg-card border-b border-border shadow-soft">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={() => window.close()}>
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Library
            </Button>
            <div className="p-2 bg-gradient-primary rounded-lg shadow-glow">
              <BookOpen className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">My Borrowed Books</h1>
              <p className="text-sm text-muted-foreground">Manage your current loans</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-foreground mb-2">Current Loans</h2>
          <p className="text-muted-foreground">You have {books.length} books currently borrowed</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {books.map((book) => (
            <Card key={book.id} className="bg-gradient-card border-0 shadow-soft">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-2">{book.title}</CardTitle>
                    <CardDescription>by {book.author}</CardDescription>
                    <p className="text-xs text-muted-foreground mt-1">ISBN: {book.isbn}</p>
                  </div>
                  <Badge 
                    variant={book.status === 'overdue' ? 'destructive' : 'secondary'}
                  >
                    {book.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4 mr-2" />
                  Due: {book.dueDate}
                </div>
                <div className="text-sm text-muted-foreground">
                  Renewals used: {book.renewals}/3
                </div>
                
                <div className="flex flex-col space-y-2">
                  <Button 
                    onClick={() => handleOpenBook(book.id, book.title)}
                    className="w-full"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Open Book
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => handleRenewBook(book.id, book.title)}
                    disabled={book.renewals >= 3}
                    className="w-full"
                  >
                    <RefreshCcw className="h-4 w-4 mr-2" />
                    Renew (Max 3)
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {books.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No books borrowed</h3>
            <p className="text-muted-foreground">Visit the library to borrow some books!</p>
          </div>
        )}
      </main>
    </div>
  );
};