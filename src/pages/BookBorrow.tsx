import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, ArrowLeft, BookOpen } from "lucide-react";
import { format, addDays } from "date-fns";
import { cn } from "@/lib/utils";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "@/hooks/use-toast";
import libraryBackground from "@/assets/library-background.jpg";

const FormSchema = z.object({
  studentName: z.string().min(2, { message: "Student name must be at least 2 characters." }),
  class: z.string().min(1, { message: "Class is required." }),
  department: z.string().min(1, { message: "Department is required." }),
  bookName: z.string().min(1, { message: "Book name is required." }),
  rollNumber: z.string().min(1, { message: "Roll number is required." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  startDate: z.date({ required_error: "Start date is required." }),
});

const BookBorrow = () => {
  const navigate = useNavigate();
  const [endDate, setEndDate] = useState<Date | null>(null);

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
      email: "",
    },
  });

  const watchStartDate = form.watch("startDate");

  useEffect(() => {
    if (watchStartDate) {
      const calculatedEndDate = addDays(watchStartDate, 7);
      setEndDate(calculatedEndDate);
    }
  }, [watchStartDate]);

  function onSubmit(data: z.infer<typeof FormSchema>) {
    const submissionData = {
      ...data,
      startDate: format(data.startDate, "PPP"),
      endDate: endDate ? format(endDate, "PPP") : "",
    };

    // Simulate sending book link via email
    const bookLink = `https://library.mmecollege.org/books/${data.bookName.toLowerCase().replace(/\s+/g, '-')}`;
    
    toast({
      title: "Book Borrowing Request Approved!",
      description: `Hi ${data.studentName}, your request for "${data.bookName}" has been approved. The digital book link has been sent to ${data.email}. Return by: ${endDate ? format(endDate, "PPP") : ""}`,
    });

    // Simulate email sending
    console.log("Sending email to:", data.email);
    console.log("Book link:", bookLink);
    console.log("Student details:", submissionData);
    
    // Show confirmation with book link
    setTimeout(() => {
      toast({
        title: "Email Sent Successfully!",
        description: `Digital book access link sent to ${data.email}. Check your inbox for the download link.`,
      });
    }, 1500);
    
    // Redirect back to home after 4 seconds
    setTimeout(() => {
      navigate("/home");
    }, 4000);
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

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email ID *</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your email address" type="email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

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
                  <Button type="submit" className="bg-gradient-primary text-white hover:shadow-glow">
                    Submit Request
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
                        {form.watch("email") && (
                          <div className="md:col-span-2">
                            <Label className="text-sm font-medium text-muted-foreground">Digital Link will be sent to</Label>
                            <p className="text-lg font-semibold text-primary">{form.watch("email")}</p>
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