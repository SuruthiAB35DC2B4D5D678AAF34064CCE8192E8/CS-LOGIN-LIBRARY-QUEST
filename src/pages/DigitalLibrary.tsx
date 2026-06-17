import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Database, Search, ArrowLeft, BookOpen, LogOut, Lock, ExternalLink } from "lucide-react";
import digitalLibraryBackground from "@/assets/digital-library-background.jpg";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { Session } from "@supabase/supabase-js";

type EBook = {
  id: number;
  title: string;
  category: string;
  description: string;
  pdfUrl: string;
  available: boolean;
};

// Curated, freely available PDF e-books (official / open-access sources)
// matching the syllabus topics. These render inline like a book/PDF.
const eBooks: EBook[] = [
  {
    id: 1,
    title: "TNPSC — Constitution of India (Polity Reference)",
    category: "TNPSC",
    description:
      "Official Constitution of India (Govt. of India) — core polity reference for TNPSC Group I / II / IV General Studies.",
    pdfUrl: "https://legislative.gov.in/sites/default/files/COI.pdf",
    available: true,
  },
  {
    id: 2,
    title: "SSC — Quantitative Aptitude & Reasoning Notes",
    category: "SSC",
    description:
      "NCERT Class 10 Mathematics (foundation for SSC CGL/CHSL Quant section).",
    pdfUrl: "https://ncert.nic.in/textbook/pdf/jemh1ps.pdf",
    available: true,
  },
  {
    id: 3,
    title: "RRB — General Science Study Material",
    category: "RRB",
    description:
      "NCERT Class 10 Science — foundation for Railway NTPC / Group D General Science.",
    pdfUrl: "https://ncert.nic.in/textbook/pdf/jesc1ps.pdf",
    available: true,
  },
  {
    id: 4,
    title: "UGC NET Paper 1 — Teaching & Research Aptitude",
    category: "UGC NET",
    description:
      "Official UGC NET Paper 1 syllabus & study guide (teaching aptitude, research methodology, ICT, comprehension).",
    pdfUrl: "https://ugcnet.nta.nic.in/images/syllabus/paper1.pdf",
    available: true,
  },
  {
    id: 5,
    title: "TRB — Teacher Recruitment Pedagogy Guide",
    category: "TRB",
    description:
      "Foundations of education and pedagogy reference (NCERT) for TRB PG/UG Assistant exams.",
    pdfUrl: "https://ncert.nic.in/textbook/pdf/iess101.pdf",
    available: true,
  },
  {
    id: 6,
    title: "Thirukkural — Tamil Literature Classic",
    category: "Tamil Literature",
    description:
      "Thirukkural by Thiruvalluvar — complete text (Tamil + English translation), classical Tamil literature.",
    pdfUrl:
      "https://archive.org/download/Thirukkural_with_English_Couplets/Thirukkural_with_English_Couplets.pdf",
    available: true,
  },
  {
    id: 7,
    title: "English Grammar & Communication",
    category: "English Communication",
    description:
      "NCERT English Grammar workbook — grammar, comprehension and writing skills.",
    pdfUrl: "https://ncert.nic.in/textbook/pdf/jeff1ps.pdf",
    available: true,
  },
  {
    id: 8,
    title: "NEET — Physics (NCERT Class 11)",
    category: "NEET",
    description:
      "NCERT Class 11 Physics Part 1 — Units, Measurements, Motion (core NEET physics).",
    pdfUrl: "https://ncert.nic.in/textbook/pdf/keph101.pdf",
    available: true,
  },
  {
    id: 9,
    title: "Aptitude & Reasoning — Foundation",
    category: "Aptitude & Reasoning",
    description:
      "NCERT Class 10 Math (Statistics, Probability, Algebra) — quantitative aptitude foundation.",
    pdfUrl: "https://ncert.nic.in/textbook/pdf/jemh114.pdf",
    available: true,
  },
  {
    id: 10,
    title: "Current Affairs — Indian Economic Survey (Reference)",
    category: "Current Affairs",
    description:
      "Government of India Economic Survey highlights — current affairs reference for competitive exams.",
    pdfUrl: "https://ncert.nic.in/textbook/pdf/keec101.pdf",
    available: true,
  },
  {
    id: 11,
    title: "Python Data Science Handbook — Jake VanderPlas",
    category: "Data Science",
    description:
      "Open-access Data Science textbook: NumPy, Pandas, Matplotlib, Scikit-Learn (full book).",
    pdfUrl:
      "https://tanthiamhuat.files.wordpress.com/2018/04/pythondatasciencehandbook.pdf",
    available: true,
  },
  {
    id: 12,
    title: "A Graduate Course in Applied Cryptography — Boneh & Shoup",
    category: "Cryptography",
    description:
      "Free Stanford textbook on modern cryptography — symmetric, public-key, protocols, full book PDF.",
    pdfUrl: "https://toc.cryptobook.us/book.pdf",
    available: true,
  },
];

export const DigitalLibrary = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [query, setQuery] = useState("");
  const [session, setSession] = useState<Session | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [openBook, setOpenBook] = useState<EBook | null>(null);

  // Re-verify auth on this page (defense in depth)
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, s) => {
        setSession(s);
        setAuthChecked(true);
      }
    );
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      setAuthChecked(true);
    });
    return () => subscription.unsubscribe();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return eBooks;
    return eBooks.filter(
      (b) =>
        b.title.toLowerCase().includes(q) ||
        b.category.toLowerCase().includes(q) ||
        b.description.toLowerCase().includes(q)
    );
  }, [query]);

  const handleOpen = (book: EBook) => {
    if (!session) {
      toast({
        title: "Sign in required",
        description: "Please sign in to read e-books.",
        variant: "destructive",
      });
      navigate("/login");
      return;
    }
    setOpenBook(book);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  if (!authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-6">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" /> Sign in required
            </CardTitle>
            <CardDescription>
              E-Books are only available to authenticated users. Please sign in to continue.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" onClick={() => navigate("/login")}>
              Go to Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Use Google Docs viewer to render any PDF inline like a book
  const viewerUrl = (pdfUrl: string) =>
    `https://docs.google.com/gview?url=${encodeURIComponent(pdfUrl)}&embedded=true`;

  return (
    <div
      className="min-h-screen bg-gradient-background relative"
      style={{
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url(${digitalLibraryBackground})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      <header className="bg-card border-b border-border shadow-soft">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={() => navigate("/home")}>
                <ArrowLeft className="h-5 w-5 mr-2" />
                Back to Home
              </Button>
              <div className="p-2 bg-gradient-primary rounded-lg shadow-glow">
                <Database className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">E-Books / Digital Books Department</h1>
                <p className="text-sm text-muted-foreground">Read full e-books inline — like a real book</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search e-books..."
                  className="pl-10 pr-4 py-2 bg-background border border-border rounded-lg focus:border-primary focus:ring-primary/20 transition-smooth w-64"
                />
              </div>
              <Button variant="ghost" size="icon" onClick={handleLogout} title="Logout">
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-foreground mb-2">Available E-Books</h2>
          <p className="text-muted-foreground">
            All {eBooks.length} e-books are enabled. Click any book to read it inline as a PDF.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((book) => (
            <Card key={book.id} className="bg-gradient-card border-0 shadow-soft flex flex-col">
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-2 flex items-start gap-2">
                      <BookOpen className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                      {book.title}
                    </CardTitle>
                    <CardDescription>{book.description}</CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2 pt-2">
                  <Badge variant="secondary">{book.category}</Badge>
                  <Badge className="bg-green-600 hover:bg-green-700 text-white">Enabled</Badge>
                </div>
              </CardHeader>
              <CardContent className="mt-auto">
                <Button onClick={() => handleOpen(book)} className="w-full">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Read E-Book
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            No e-books match your search.
          </div>
        )}
      </main>

      <Dialog open={!!openBook} onOpenChange={(o) => !o && setOpenBook(null)}>
        <DialogContent className="max-w-5xl w-[95vw] h-[90vh] p-0 flex flex-col">
          <DialogHeader className="px-6 py-3 border-b shrink-0">
            <div className="flex items-center justify-between gap-4">
              <DialogTitle className="flex items-center gap-2 text-base">
                <BookOpen className="h-5 w-5 text-primary" />
                {openBook?.title}
              </DialogTitle>
              {openBook && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    window.open(openBook.pdfUrl, "_blank", "noopener,noreferrer")
                  }
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Open PDF
                </Button>
              )}
            </div>
          </DialogHeader>
          {openBook && (
            <iframe
              key={openBook.id}
              src={viewerUrl(openBook.pdfUrl)}
              title={openBook.title}
              className="flex-1 w-full bg-muted"
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DigitalLibrary;
