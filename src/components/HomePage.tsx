import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Code, 
  BookOpen, 
  Calendar, 
  Trophy, 
  Bell, 
  Search, 
  User, 
  LogOut,
  Database,
  Brain,
  GitBranch,
  Terminal,
  Users,
  Clock,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import libraryBackground from "@/assets/library-background.jpg";

export const HomePage = () => {
  const [currentTime] = useState(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      
      // Technical/Programming subjects - redirect to GeeksforGeeks
      const technicalTerms = ['programming', 'java', 'python', 'javascript', 'html', 'css', 'react', 'node', 'database', 'sql', 'algorithm', 'data structure', 'computer', 'software', 'coding', 'web development', 'machine learning', 'ai', 'artificial intelligence'];
      
      // General books, novels, religious texts, newspapers - redirect to Wikipedia
      const generalTerms = ['story', 'novel', 'bible', 'quran', 'bhagavad gita', 'bagavat gita', 'hindu', 'dhina thanthi', 'newspaper', 'literature', 'fiction', 'poetry', 'biography', 'history', 'philosophy'];
      
      const isTechnical = technicalTerms.some(term => query.includes(term));
      const isGeneral = generalTerms.some(term => query.includes(term));
      
      let mockResults = [];
      
      if (isTechnical) {
        mockResults = [
          { title: `${searchQuery} - Programming Guide`, author: "GeeksforGeeks", type: "technical" },
          { title: `${searchQuery} - Tutorial`, author: "GeeksforGeeks", type: "technical" },
          { title: `${searchQuery} - Practice Problems`, author: "GeeksforGeeks", type: "technical" }
        ];
      } else if (isGeneral) {
        mockResults = [
          { title: `${searchQuery} - Encyclopedia`, author: "Wikipedia", type: "general" },
          { title: `${searchQuery} - Reference`, author: "Wikipedia", type: "general" },
          { title: `${searchQuery} - Article`, author: "Wikipedia", type: "general" }
        ];
      } else {
        // Default to general search for unknown terms
        mockResults = [
          { title: `${searchQuery} - Encyclopedia`, author: "Wikipedia", type: "general" },
          { title: `${searchQuery} - Reference`, author: "Wikipedia", type: "general" }
        ];
      }
      
      setSearchResults(mockResults);
    }
  };

  const handleBookClick = (book: any) => {
    if (book.type === "technical") {
      window.open(`https://www.geeksforgeeks.org/${searchQuery.toLowerCase().replace(/\s+/g, '-')}/`, '_blank');
    } else {
      window.open(`https://en.wikipedia.org/wiki/${searchQuery.replace(/\s+/g, '_')}`, '_blank');
    }
  };

  const handleLogout = () => {
    // Clear any stored user data/tokens
    localStorage.removeItem('user');
    sessionStorage.clear();
    // Redirect to login page
    window.location.href = '/login';
  };


  const assignments = [
    {
      id: 1,
      title: "2 books due soon",
      course: "Loans",
      dueDate: "2 days",
      status: "in-progress",
      priority: "high"
    },
    {
      id: 2,
      title: "Library workshop: Research basics",
      course: "Events",
      dueDate: "Friday",
      status: "not-started",
      priority: "medium"
    },
    {
      id: 3,
      title: "Membership renewed",
      course: "Account",
      dueDate: "-",
      status: "completed",
      priority: "low"
    }
  ];

  const libraryStats = {
    totalBooks: 15420,
    borrowedBooks: 2340,
    availableBooks: 13080,
    overdueBooks: 45
  };

  const departmentBorrowingStats = [
    { department: "Computer Science", borrowed: 450, percentage: 19.2 },
    { department: "Electronics", borrowed: 380, percentage: 16.2 },
    { department: "Mechanical", borrowed: 320, percentage: 13.7 },
    { department: "Civil", borrowed: 290, percentage: 12.4 },
    { department: "Electrical", borrowed: 250, percentage: 10.7 },
    { department: "Others", borrowed: 650, percentage: 27.8 }
  ];

  const popularBooks = [
    { title: "Introduction to Algorithms", author: "Cormen, Leiserson", category: "Computer Science", available: 3, total: 8 },
    { title: "Digital Electronics", author: "Morris Mano", category: "Electronics", available: 2, total: 6 },
    { title: "Thermodynamics", author: "P.K. Nag", category: "Mechanical", available: 4, total: 7 },
    { title: "Structural Analysis", author: "R.C. Hibbeler", category: "Civil", available: 1, total: 5 },
    { title: "Power Systems", author: "C.L. Wadhwa", category: "Electrical", available: 5, total: 9 }
  ];

  const upcomingDeadlines = [
    { student: "Arjun Kumar", book: "Data Structures", dueDate: "2 days", department: "CSE", isOverdue: false },
    { student: "Priya Sharma", book: "Circuit Analysis", dueDate: "1 day", department: "ECE", isOverdue: false },
    { student: "Rahul Singh", book: "Machine Design", dueDate: "Overdue by 3 days", department: "Mech", isOverdue: true },
    { student: "Sneha Patel", book: "Concrete Technology", dueDate: "4 days", department: "Civil", isOverdue: false }
  ];

  return (
    <div 
      className="min-h-screen bg-gradient-background relative"
      style={{
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url(${libraryBackground})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Header */}
      <header className="bg-card border-b border-border shadow-soft">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-gradient-primary rounded-lg shadow-glow">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">MMES College Library</h1>
                <p className="text-sm text-muted-foreground">Welcome to your library</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <form onSubmit={handleSearch} className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search catalog, books, journals..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-background border border-border rounded-lg focus:border-primary focus:ring-primary/20 transition-smooth"
                />
              </form>
              <Button variant="ghost" size="icon">
                <Bell className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon">
                <User className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" onClick={handleLogout}>
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-2">
                Welcome back, Alex! 👋
              </h2>
              <p className="text-muted-foreground">
                Find books, journals, and manage your loans. Current time: {currentTime}
              </p>
            </div>
            {searchResults.length > 0 && (
              <Card className="bg-gradient-card border-0 shadow-soft">
                <CardContent className="p-4">
                  <h4 className="font-medium mb-3">Search Results</h4>
                  <div className="space-y-2">
                    {searchResults.map((book, index) => (
                      <div 
                        key={index}
                        onClick={() => handleBookClick(book)}
                        className="p-2 bg-background rounded-lg border border-border hover:bg-accent/10 cursor-pointer transition-smooth"
                      >
                        <p className="font-medium text-primary">{book.title}</p>
                        <p className="text-sm text-muted-foreground">by {book.author}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">

            {/* Popular Books */}
            <section>
              <h3 className="text-xl font-semibold text-foreground mb-4">Popular Books</h3>
              <Card className="bg-gradient-card border-0 shadow-soft">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {popularBooks.map((book, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-background rounded-lg border border-border">
                        <div className="flex items-center space-x-4">
                          <div className="p-2 bg-primary/10 rounded-lg">
                            <BookOpen className="h-5 w-5 text-primary" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-foreground">{book.title}</h4>
                            <p className="text-sm text-muted-foreground">by {book.author}</p>
                            <Badge variant="outline" className="mt-1">{book.category}</Badge>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium text-green-500">{book.available} available</span>
                            <span className="text-sm text-muted-foreground">/ {book.total} total</span>
                          </div>
                          <Progress value={(book.available / book.total) * 100} className="w-20 h-2 mt-1" />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Return Deadlines */}
            <section>
              <h3 className="text-xl font-semibold text-foreground mb-4">Upcoming Return Deadlines</h3>
              <Card className="bg-gradient-card border-0 shadow-soft">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {upcomingDeadlines.map((deadline, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-background rounded-lg border border-border">
                        <div className="flex items-center space-x-4">
                          <div className="p-2 bg-primary/10 rounded-lg">
                            {deadline.isOverdue ? (
                              <AlertCircle className="h-5 w-5 text-red-500" />
                            ) : (
                              <Clock className="h-5 w-5 text-primary" />
                            )}
                          </div>
                          <div>
                            <h4 className="font-medium text-foreground">{deadline.student}</h4>
                            <p className="text-sm text-muted-foreground">{deadline.book}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <Badge variant="outline">{deadline.department}</Badge>
                          <span className={`text-sm font-medium ${deadline.isOverdue ? 'text-red-500' : 'text-muted-foreground'}`}>
                            {deadline.dueDate}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </section>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <Card className="bg-gradient-card border-0 shadow-soft">
              <CardHeader>
                <CardTitle className="text-lg">Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Books Borrowed</span>
                  <span className="font-semibold">2</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Due This Week</span>
                  <span className="font-semibold text-orange-500">1</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Books Reserved</span>
                  <span className="font-semibold text-green-500">0</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Reading Hours</span>
                  <span className="font-semibold">24h</span>
                </div>
              </CardContent>
            </Card>

            {/* Library Statistics */}
            <Card className="bg-gradient-card border-0 shadow-soft">
              <CardHeader>
                <CardTitle className="text-lg">Library Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-background rounded-lg">
                    <p className="text-2xl font-bold text-primary">{libraryStats.totalBooks.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">Total Books</p>
                  </div>
                  <div className="text-center p-3 bg-background rounded-lg">
                    <p className="text-2xl font-bold text-orange-500">{libraryStats.borrowedBooks.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">Borrowed</p>
                  </div>
                  <div className="text-center p-3 bg-background rounded-lg">
                    <p className="text-2xl font-bold text-green-500">{libraryStats.availableBooks.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">Available</p>
                  </div>
                  <div className="text-center p-3 bg-background rounded-lg">
                    <p className="text-2xl font-bold text-red-500">{libraryStats.overdueBooks}</p>
                    <p className="text-sm text-muted-foreground">Overdue</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Department Borrowing Stats */}
            <Card className="bg-gradient-card border-0 shadow-soft">
              <CardHeader>
                <CardTitle className="text-lg">Borrowing by Department</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {departmentBorrowingStats.map((dept, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground">{dept.department}</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-muted-foreground">{dept.borrowed}</span>
                      <div className="w-16 bg-background rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full" 
                          style={{ width: `${dept.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Study Groups */}
            <Card className="bg-gradient-card border-0 shadow-soft">
              <CardHeader>
                <CardTitle className="text-lg">Library Services</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div 
                  className="flex items-center space-x-3 cursor-pointer hover:bg-accent/10 p-2 rounded-lg transition-smooth"
                  onClick={() => window.open('https://wa.me/918234567890?text=Hello,%20I%20need%20help%20with%20library%20services', '_blank')}
                >
                  <Users className="h-4 w-4 text-primary" />
                  <div>
                    <p className="font-medium text-foreground">Ask a Librarian</p>
                    <p className="text-sm text-muted-foreground">Chat on WhatsApp</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Users className="h-4 w-4 text-primary" />
                  <div>
                    <p className="font-medium text-foreground">Citation Help Desk</p>
                    <p className="text-sm text-muted-foreground">View times</p>
                  </div>
                </div>
                <Button variant="outline" className="w-full mt-4">
                  View All Services
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};