import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  User, 
  BookOpen, 
  Settings, 
  History, 
  ArrowLeft, 
  LogOut, 
  Mail,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  Loader2
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import libraryBackground from "@/assets/library-background.jpg";

interface BorrowedBook {
  id: string;
  book_name: string;
  start_date: string;
  end_date: string;
  is_returned: boolean;
  student_name: string;
  roll_number: string;
  email: string;
  department: string;
  class: string;
  created_at: string;
}

export const UserProfile = () => {
  const [user, setUser] = useState<any>(null);
  const [borrowedBooks, setBorrowedBooks] = useState<BorrowedBook[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [rollNumber, setRollNumber] = useState("");
  const [searchedRollNumber, setSearchedRollNumber] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
      }
      setIsLoading(false);
    };
    getUser();
  }, []);

  const fetchBorrowedBooks = async (roll: string) => {
    if (!roll.trim()) {
      toast({
        title: "Enter Roll Number",
        description: "Please enter your roll number to view borrowing history.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('borrowed_books')
        .select('*')
        .eq('roll_number', roll.trim())
        .order('created_at', { ascending: false });

      if (error) throw error;

      setBorrowedBooks(data || []);
      setSearchedRollNumber(roll.trim());
      
      if (!data || data.length === 0) {
        toast({
          title: "No Records Found",
          description: "No borrowing history found for this roll number.",
        });
      }
    } catch (error) {
      console.error('Error fetching books:', error);
      toast({
        title: "Error",
        description: "Failed to fetch borrowing history.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      localStorage.removeItem('user');
      sessionStorage.clear();
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      toast({
        title: "Error",
        description: "Failed to logout. Please try again.",
        variant: "destructive",
      });
    }
  };

  const isOverdue = (endDate: string) => {
    return new Date(endDate) < new Date();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const activeBooks = borrowedBooks.filter(book => !book.is_returned);
  const returnedBooks = borrowedBooks.filter(book => book.is_returned);

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
              <Button variant="ghost" onClick={() => navigate('/home')}>
                <ArrowLeft className="h-5 w-5 mr-2" />
                Back to Home
              </Button>
              <div className="p-2 bg-gradient-primary rounded-lg shadow-glow">
                <User className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">My Profile</h1>
                <p className="text-sm text-muted-foreground">View your account and borrowing history</p>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleLogout}
              className="hover:bg-red-100 hover:text-red-600"
              title="Logout"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <Tabs defaultValue="history" className="space-y-6">
          <TabsList className="bg-card border border-border">
            <TabsTrigger value="history" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <History className="h-4 w-4 mr-2" />
              Borrowing History
            </TabsTrigger>
            <TabsTrigger value="account" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Settings className="h-4 w-4 mr-2" />
              Account Settings
            </TabsTrigger>
          </TabsList>

          {/* Borrowing History Tab */}
          <TabsContent value="history" className="space-y-6">
            {/* Search by Roll Number */}
            <Card className="bg-gradient-card border-0 shadow-soft">
              <CardHeader>
                <CardTitle className="text-lg">Search Your History</CardTitle>
                <CardDescription>Enter your roll number to view borrowing records</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <Input
                      placeholder="Enter your roll number (e.g., 21CS101)"
                      value={rollNumber}
                      onChange={(e) => setRollNumber(e.target.value.toUpperCase())}
                      onKeyDown={(e) => e.key === 'Enter' && fetchBorrowedBooks(rollNumber)}
                    />
                  </div>
                  <Button 
                    onClick={() => fetchBorrowedBooks(rollNumber)}
                    disabled={isLoading}
                    className="bg-gradient-primary"
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <History className="h-4 w-4 mr-2" />
                    )}
                    View History
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Results */}
            {searchedRollNumber && (
              <>
                {/* Stats Summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="bg-gradient-card border-0 shadow-soft">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Total Borrowed</p>
                          <p className="text-3xl font-bold text-foreground">{borrowedBooks.length}</p>
                        </div>
                        <BookOpen className="h-10 w-10 text-primary opacity-50" />
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="bg-gradient-card border-0 shadow-soft">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Currently Borrowed</p>
                          <p className="text-3xl font-bold text-amber-500">{activeBooks.length}</p>
                        </div>
                        <Clock className="h-10 w-10 text-amber-500 opacity-50" />
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="bg-gradient-card border-0 shadow-soft">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Returned</p>
                          <p className="text-3xl font-bold text-green-500">{returnedBooks.length}</p>
                        </div>
                        <CheckCircle2 className="h-10 w-10 text-green-500 opacity-50" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Currently Borrowed */}
                {activeBooks.length > 0 && (
                  <Card className="bg-gradient-card border-0 shadow-soft">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Clock className="h-5 w-5 text-amber-500" />
                        Currently Borrowed
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {activeBooks.map((book) => (
                          <div 
                            key={book.id} 
                            className={`p-4 rounded-lg border ${
                              isOverdue(book.end_date) 
                                ? 'bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-800' 
                                : 'bg-background border-border'
                            }`}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex items-start gap-4">
                                <div className="p-2 bg-primary/10 rounded-lg">
                                  <BookOpen className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                  <h4 className="font-semibold text-foreground">{book.book_name}</h4>
                                  <p className="text-sm text-muted-foreground">{book.student_name} • {book.department}</p>
                                  <div className="flex items-center gap-4 mt-2 text-sm">
                                    <span className="flex items-center gap-1">
                                      <Calendar className="h-3 w-3" />
                                      Borrowed: {formatDate(book.start_date)}
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <Calendar className="h-3 w-3" />
                                      Due: {formatDate(book.end_date)}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              {isOverdue(book.end_date) ? (
                                <Badge variant="destructive" className="flex items-center gap-1">
                                  <AlertCircle className="h-3 w-3" />
                                  Overdue
                                </Badge>
                              ) : (
                                <Badge variant="secondary">Active</Badge>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Returned Books History */}
                <Card className="bg-gradient-card border-0 shadow-soft">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                      Return History
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {returnedBooks.length === 0 ? (
                      <div className="text-center py-8">
                        <History className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">No returned books yet</p>
                      </div>
                    ) : (
                      <ScrollArea className="h-[300px]">
                        <div className="space-y-3">
                          {returnedBooks.map((book) => (
                            <div 
                              key={book.id} 
                              className="p-4 bg-background rounded-lg border border-border"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                  <div className="p-2 bg-green-100 dark:bg-green-950/30 rounded-lg">
                                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                                  </div>
                                  <div>
                                    <h4 className="font-medium text-foreground">{book.book_name}</h4>
                                    <p className="text-sm text-muted-foreground">
                                      {formatDate(book.start_date)} - {formatDate(book.end_date)}
                                    </p>
                                  </div>
                                </div>
                                <Badge variant="outline" className="text-green-600 border-green-600">
                                  Returned
                                </Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    )}
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>

          {/* Account Settings Tab */}
          <TabsContent value="account" className="space-y-6">
            <Card className="bg-gradient-card border-0 shadow-soft">
              <CardHeader>
                <CardTitle className="text-lg">Account Information</CardTitle>
                <CardDescription>Your account details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-4 p-4 bg-background rounded-lg border border-border">
                  <div className="p-3 bg-primary/10 rounded-full">
                    <User className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Library Member</p>
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      {user?.email || 'Not available'}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label>Email Address</Label>
                    <Input 
                      value={user?.email || ''} 
                      disabled 
                      className="mt-1.5 bg-muted"
                    />
                    <p className="text-xs text-muted-foreground mt-1">Email cannot be changed</p>
                  </div>

                  <div>
                    <Label>Account Created</Label>
                    <Input 
                      value={user?.created_at ? formatDate(user.created_at) : 'Not available'} 
                      disabled 
                      className="mt-1.5 bg-muted"
                    />
                  </div>

                  <div>
                    <Label>Last Sign In</Label>
                    <Input 
                      value={user?.last_sign_in_at ? formatDate(user.last_sign_in_at) : 'Not available'} 
                      disabled 
                      className="mt-1.5 bg-muted"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-card border-0 shadow-soft">
              <CardHeader>
                <CardTitle className="text-lg text-red-500">Danger Zone</CardTitle>
                <CardDescription>Irreversible account actions</CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  variant="destructive" 
                  onClick={handleLogout}
                  className="w-full"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out of Account
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default UserProfile;
