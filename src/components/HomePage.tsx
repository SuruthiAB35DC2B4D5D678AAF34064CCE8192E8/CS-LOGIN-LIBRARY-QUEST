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

export const HomePage = () => {
  const [currentTime] = useState(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));

  const courses = [
    {
      id: 1,
      name: "Borrowed Books",
      code: "My Loans",
      progress: 40,
      nextClass: "2 due in 3 days",
      instructor: "View and renew",
      icon: BookOpen,
      color: "bg-blue-500"
    },
    {
      id: 2,
      name: "Digital Library",
      code: "E-Resources",
      progress: 80,
      nextClass: "New journals added",
      instructor: "Access databases",
      icon: Database,
      color: "bg-purple-500"
    },
    {
      id: 3,
      name: "Research Guides",
      code: "Guides",
      progress: 60,
      nextClass: "Citation styles, subject guides",
      instructor: "Explore guides",
      icon: Brain,
      color: "bg-green-500"
    },
    {
      id: 4,
      name: "Study Rooms",
      code: "Reservations",
      progress: 30,
      nextClass: "Rooms available today",
      instructor: "Book a room",
      icon: Users,
      color: "bg-orange-500"
    }
  ];

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

  const upcomingEvents = [
    {
      title: "Citation Styles 101",
      time: "Today 3:00 PM",
      location: "Library Hall"
    },
    {
      title: "Digital Resources Orientation",
      time: "Tomorrow",
      location: "Computer Lab"
    },
    {
      title: "Author Talk: Modern Fiction",
      time: "Friday 2:00 PM",
      location: "Auditorium"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-background">
      {/* Header */}
      <header className="bg-card border-b border-border shadow-soft">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-gradient-primary rounded-lg shadow-glow">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">MMMES College Library</h1>
                <p className="text-sm text-muted-foreground">Welcome to your library</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search catalog, books, journals..."
                  className="pl-10 pr-4 py-2 bg-background border border-border rounded-lg focus:border-primary focus:ring-primary/20 transition-smooth"
                />
              </div>
              <Button variant="ghost" size="icon">
                <Bell className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon">
                <User className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon">
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
            <div className="flex items-center space-x-4">
              <Card className="bg-gradient-card border-0 shadow-soft">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <BookOpen className="h-5 w-5 text-accent" />
                    <div>
                      <p className="text-sm font-medium">Active Loans</p>
                      <p className="text-lg font-bold text-accent">2</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Courses Grid */}
            <section>
              <h3 className="text-xl font-semibold text-foreground mb-4">Library Shortcuts</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {courses.map((course) => {
                  const IconComponent = course.icon;
                  return (
                    <Card key={course.id} className="bg-gradient-card border-0 shadow-soft hover:shadow-medium transition-smooth cursor-pointer">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className={`p-2 ${course.color} rounded-lg`}>
                            <IconComponent className="h-5 w-5 text-white" />
                          </div>
                          <Badge variant="secondary">{course.code}</Badge>
                        </div>
                        <CardTitle className="text-lg">{course.name}</CardTitle>
                        <CardDescription>{course.instructor}</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <div className="flex justify-between text-sm mb-2">
                            <span>Progress</span>
                            <span>{course.progress}%</span>
                          </div>
                          <Progress value={course.progress} className="h-2" />
                        </div>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Clock className="h-4 w-4 mr-1" />
                          {course.nextClass}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </section>

            {/* Assignments */}
            <section>
              <h3 className="text-xl font-semibold text-foreground mb-4">Library Notices</h3>
              <Card className="bg-gradient-card border-0 shadow-soft">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {assignments.map((assignment) => (
                      <div key={assignment.id} className="flex items-center justify-between p-4 bg-background rounded-lg border border-border">
                        <div className="flex items-center space-x-4">
                          <div className="p-2 bg-primary/10 rounded-lg">
                            {assignment.status === 'completed' ? (
                              <CheckCircle2 className="h-5 w-5 text-green-500" />
                            ) : assignment.priority === 'high' ? (
                              <AlertCircle className="h-5 w-5 text-red-500" />
                            ) : (
                              <BookOpen className="h-5 w-5 text-primary" />
                            )}
                          </div>
                          <div>
                            <h4 className="font-medium text-foreground">{assignment.title}</h4>
                            <p className="text-sm text-muted-foreground">{assignment.course}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <Badge 
                            variant={assignment.priority === 'high' ? 'destructive' : 'secondary'}
                          >
                            {assignment.priority}
                          </Badge>
                          <span className="text-sm text-muted-foreground">Due in {assignment.dueDate}</span>
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
                  <span className="text-muted-foreground">Courses Enrolled</span>
                  <span className="font-semibold">4</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Assignments Due</span>
                  <span className="font-semibold text-orange-500">2</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Completed Projects</span>
                  <span className="font-semibold text-green-500">12</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Study Hours</span>
                  <span className="font-semibold">156h</span>
                </div>
              </CardContent>
            </Card>

            {/* Upcoming Events */}
            <Card className="bg-gradient-card border-0 shadow-soft">
              <CardHeader>
                <CardTitle className="text-lg">Upcoming Events</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {upcomingEvents.map((event, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="p-1 bg-primary/20 rounded">
                      <Calendar className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground">{event.title}</p>
                      <p className="text-sm text-muted-foreground">{event.time}</p>
                      <p className="text-xs text-muted-foreground">{event.location}</p>
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
                <div className="flex items-center space-x-3">
                  <Users className="h-4 w-4 text-primary" />
                  <div>
                    <p className="font-medium text-foreground">Ask a Librarian</p>
                    <p className="text-sm text-muted-foreground">Chat now</p>
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