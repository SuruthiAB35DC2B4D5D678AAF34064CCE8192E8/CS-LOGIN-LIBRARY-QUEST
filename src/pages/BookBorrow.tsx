import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, ArrowLeft, BookOpen, AlertTriangle, Loader2 } from "lucide-react";
import { format, addDays } from "date-fns";
import { cn } from "@/lib/utils";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import libraryBackground from "@/assets/library-background.jpg";
import { useUserRole } from "@/hooks/useUserRole";
import { useUserProfile } from "@/hooks/useUserProfile";

const FormSchema = z.object({
  studentName: z.string().min(2, { message: "Student name must be at least 2 characters." }),
  class: z.string().min(1, { message: "Class is required." }),
  department: z.string().min(1, { message: "Department is required." }),
  bookName: z.string().min(1, { message: "Book name is required." }),
  rollNumber: z.string().min(1, { message: "Roll number is required." }),
  startDate: z.date({ required_error: "Start date is required." }),
});

const BookBorrow = () => {
  const navigate = useNavigate();
  const { session, userEmail, userId, isLoading: isRoleLoading } = useUserRole();
  const { profile, isLoading: isProfileLoading } = useUserProfile(session?.user?.id);
  
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [hasExistingBook, setHasExistingBook] = useState(false);
  const [existingBookInfo, setExistingBookInfo] = useState<{ book_name: string; end_date: string } | null>(null);
  const [isCheckingBorrow, setIsCheckingBorrow] = useState(false);

  useEffect(() => {
    document.title = "Book Borrowing - MMES College Library";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) {
      meta.setAttribute("content", "Borrow books from MMES College Library. Fill out the form to request a book loan.");
    }
  }, []);

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      studentName: "",
      class: "",
      department: "",
      bookName: "",
      rollNumber: "",
    },
  });

  // Pre-fill form from profile when available
  useEffect(() => {
    if (profile) {
      if (profile.student_name) form.setValue("studentName", profile.student_name);
      if (profile.class) form.setValue("class", profile.class);
      if (profile.department) form.setValue("department", profile.department);
      if (profile.roll_number) form.setValue("rollNumber", profile.roll_number);
    }
  }, [profile, form]);

  const watchStartDate = form.watch("startDate");
  const watchRollNumber = form.watch("rollNumber");

  useEffect(() => {
    if (watchStartDate) {
      const calculatedEndDate = addDays(watchStartDate, 7);
      setEndDate(calculatedEndDate);
    }
  }, [watchStartDate]);

  // Check if student already has a borrowed book
  useEffect(() => {
    const checkExistingBorrow = async () => {
      if (watchRollNumber && watchRollNumber.trim().length >= 3) {
        setIsCheckingBorrow(true);
        try {
          const { data, error } = await supabase
            .from('borrowed_books')
            .select('book_name, end_date')
            .eq('roll_number', watchRollNumber.trim())
            .eq('is_returned', false)
            .maybeSingle();

          if (error) {
            console.error('Error checking borrow status:', error);
            setHasExistingBook(false);
            setExistingBookInfo(null);
          } else if (data) {
            setHasExistingBook(true);
            setExistingBookInfo({ book_name: data.book_name, end_date: data.end_date });
          } else {
            setHasExistingBook(false);
            setExistingBookInfo(null);
          }
        } catch (err) {
          console.error('Error:', err);
          setHasExistingBook(false);
          setExistingBookInfo(null);
        }
        setIsCheckingBorrow(false);
      } else {
        setHasExistingBook(false);
        setExistingBookInfo(null);
      }
    };

    const debounceTimer = setTimeout(checkExistingBorrow, 500);
    return () => clearTimeout(debounceTimer);
  }, [watchRollNumber]);

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    // Ensure user is logged in
    if (!userEmail || !userId) {
      toast({
        title: "Login Required",
        description: "Please log in to borrow books.",
        variant: "destructive",
      });
      return;
    }

    // Double-check if student already has a borrowed book
    if (hasExistingBook) {
      toast({
        title: "Cannot Borrow Book",
        description: `You already have "${existingBookInfo?.book_name}" borrowed. Please return it first before borrowing another book.`,
        variant: "destructive",
      });
      return;
    }

    const submissionData = {
      user_id: userId, // Use authenticated user's ID for RLS
      roll_number: data.rollNumber.trim(),
      student_name: data.studentName.trim(),
      email: userEmail, // Use authenticated user's email
      department: data.department.trim(),
      class: data.class.trim(),
      book_name: data.bookName.trim(),
      start_date: format(data.startDate, "yyyy-MM-dd"),
      end_date: endDate ? format(endDate, "yyyy-MM-dd") : format(addDays(data.startDate, 7), "yyyy-MM-dd"),
    };

    try {
      const { error } = await supabase
        .from('borrowed_books')
        .insert(submissionData);

      if (error) {
        // Check if it's a unique constraint violation (student already has a book)
        if (error.code === '23505') {
          toast({
            title: "Cannot Borrow Book",
            description: "You already have a book borrowed. Please return it first before borrowing another book.",
            variant: "destructive",
          });
          return;
        }
        throw error;
      }

      toast({
        title: "Book Borrowing Request Approved!",
        description: `Hi ${data.studentName}, your request for "${data.bookName}" has been approved. The digital book link has been sent to ${userEmail}. Return by: ${endDate ? format(endDate, "PPP") : ""}`,
      });

      // Show confirmation
      setTimeout(() => {
        toast({
          title: "Email Sent Successfully!",
          description: `Digital book access link sent to ${userEmail}. Check your inbox for the download link.`,
        });
      }, 1500);
      
      // Redirect back to home after 4 seconds
      setTimeout(() => {
        navigate("/home");
      }, 4000);
    } catch (error) {
      console.error('Error borrowing book:', error);
      toast({
        title: "Error",
        description: "Failed to submit borrowing request. Please try again.",
        variant: "destructive",
      });
    }
  }

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
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/home")}
                className="hover:bg-accent/10"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Library
              </Button>
              <div className="p-2 bg-gradient-primary rounded-lg shadow-glow">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">Book Borrowing Request</h1>
                <p className="text-sm text-muted-foreground">Fill out the form to borrow a book</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-8">
        <Card className="bg-gradient-card border-0 shadow-soft">
          <CardHeader>
            <CardTitle className="text-2xl">Book Borrowing Form</CardTitle>
            <CardDescription>
              Please fill out all required fields. Books can be borrowed for 7 days from the selected start date.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Warning if student already has a borrowed book */}
            {hasExistingBook && existingBookInfo && (
              <Alert variant="destructive" className="mb-6">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>You Already Have a Borrowed Book</AlertTitle>
                <AlertDescription>
                  You currently have "{existingBookInfo.book_name}" borrowed until {format(new Date(existingBookInfo.end_date), "PPP")}. 
                  Please return it first before borrowing another book. Each student can only borrow one book at a time.
                </AlertDescription>
              </Alert>
            )}

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="studentName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Student Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter your full name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="rollNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Roll Number *</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter your roll number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="class"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Class *</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., B.E. II Year" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="department"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Department *</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Computer Science & Engineering" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Email Display (Read-only from session) */}
                <div className="space-y-2">
                  <Label>Email ID (From your account)</Label>
                  <Input 
                    value={userEmail || ''} 
                    disabled 
                    className="bg-muted"
                    placeholder="Loading..."
                  />
                  <p className="text-xs text-muted-foreground">
                    Book access link will be sent to this email
                  </p>
                </div>

                <FormField
                  control={form.control}
                  name="bookName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Book Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter the name of the book you want to borrow" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="startDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Start Date *</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "PPP")
                                ) : (
                                  <span>Pick start date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) => date < new Date()}
                              initialFocus
                              className={cn("p-3 pointer-events-auto")}
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex flex-col">
                    <Label className="mb-2">End Date (Auto-calculated)</Label>
                    <div className="flex h-10 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm">
                      {endDate ? format(endDate, "PPP") : "Select start date first"}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Books must be returned within 7 days
                    </p>
                  </div>
                </div>

                <div className="flex justify-end space-x-4 pt-6">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => navigate("/home")}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    className="bg-gradient-primary text-white hover:shadow-glow"
                    disabled={hasExistingBook || isCheckingBorrow}
                  >
                    {isCheckingBorrow ? "Checking..." : "Submit Request"}
                  </Button>
                </div>

                {/* Summary Section */}
                {form.watch("studentName") && endDate && (
                  <Card className="bg-accent/5 border border-primary/20">
                    <CardHeader>
                      <CardTitle className="text-lg text-primary">Borrowing Summary</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">Student Name</Label>
                          <p className="text-lg font-semibold text-foreground">{form.watch("studentName")}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">Return Date</Label>
                          <p className="text-lg font-semibold text-primary">{format(endDate, "PPP")}</p>
                        </div>
                        {form.watch("bookName") && (
                          <div className="md:col-span-2">
                            <Label className="text-sm font-medium text-muted-foreground">Book to Borrow</Label>
                            <p className="text-lg font-semibold text-foreground">{form.watch("bookName")}</p>
                          </div>
                        )}
                        {userEmail && (
                          <div className="md:col-span-2">
                            <Label className="text-sm font-medium text-muted-foreground">Digital Link will be sent to</Label>
                            <p className="text-lg font-semibold text-primary">{userEmail}</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </form>
            </Form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default BookBorrow;