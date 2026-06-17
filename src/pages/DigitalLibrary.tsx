import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Database, Search, ArrowLeft, ExternalLink, BookOpen, LogOut } from "lucide-react";
import digitalLibraryBackground from "@/assets/digital-library-background.jpg";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

type EBook = {
  id: number;
  title: string;
  category: string;
  description: string;
  url: string;
  available: boolean;
};

const eBooks: EBook[] = [
  {
    id: 1,
    title: "TNPSC Group Exams Complete Guide",
    category: "TNPSC",
    description: "Comprehensive study material for TNPSC Group I, II, IV exams including General Studies and Tamil.",
    url: "https://www.tnpsc.gov.in/English/StudyMaterials.aspx",
    available: true,
  },
  {
    id: 2,
    title: "SSC CGL / CHSL Preparation",
    category: "SSC",
    description: "Staff Selection Commission preparation books covering Quant, Reasoning, English and GK.",
    url: "https://ssc.gov.in/",
    available: true,
  },
  {
    id: 3,
    title: "RRB NTPC & Group D Guide",
    category: "RRB",
    description: "Railway Recruitment Board exam preparation: NTPC, Group D, ALP and JE syllabus material.",
    url: "https://www.rrbcdg.gov.in/",
    available: true,
  },
  {
    id: 4,
    title: "UGC NET Paper 1 — Teaching & Research Aptitude",
    category: "UGC NET",
    description: "Complete Paper 1 study material: teaching aptitude, research methodology, reading comprehension and ICT.",
    url: "https://ugcnet.nta.nic.in/",
    available: true,
  },
  {
    id: 5,
    title: "TRB Teacher Recruitment Study Material",
    category: "TRB",
    description: "Tamil Nadu Teachers Recruitment Board PG / UG Assistant and Polytechnic exam resources.",
    url: "https://trb.tn.gov.in/",
    available: true,
  },
  {
    id: 6,
    title: "Tamil Literature — Sangam to Modern",
    category: "Tamil Literature",
    description: "Classical and modern Tamil literature: Thirukkural, Sangam works, novels and poetry.",
    url: "https://ta.wikisource.org/",
    available: true,
  },
  {
    id: 7,
    title: "English Communication & Grammar",
    category: "English Communication",
    description: "Spoken English, business communication, grammar and vocabulary builder e-books.",
    url: "https://www.britishcouncil.org/english",
    available: true,
  },
  {
    id: 8,
    title: "NEET UG — Physics, Chemistry, Biology",
    category: "NEET",
    description: "Complete NEET preparation: NCERT-based notes, previous year papers and mock tests.",
    url: "https://neet.nta.nic.in/",
    available: true,
  },
  {
    id: 9,
    title: "Aptitude and Reasoning Mastery",
    category: "Aptitude & Reasoning",
    description: "Quantitative aptitude, logical reasoning and verbal ability for competitive exams and placements.",
    url: "https://www.indiabix.com/",
    available: true,
  },
  {
    id: 10,
    title: "Current Affairs Monthly Digest",
    category: "Current Affairs",
    description: "Up-to-date current affairs for UPSC, TNPSC, SSC, banking and all competitive exams.",
    url: "https://www.gktoday.in/",
    available: true,
  },
  {
    id: 11,
    title: "Data Science Handbook",
    category: "Data Science",
    description: "Python for data science, machine learning, statistics and data visualization.",
    url: "https://jakevdp.github.io/PythonDataScienceHandbook/",
    available: true,
  },
  {
    id: 12,
    title: "Cryptography & Network Security",
    category: "Cryptography",
    description: "Modern cryptography, network security, applied crypto and blockchain fundamentals.",
    url: "https://crypto.stanford.edu/~dabo/cryptobook/",
    available: true,
  },
];

export const DigitalLibrary = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [query, setQuery] = useState("");

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
    window.open(book.url, "_blank", "noopener,noreferrer");
    toast({ title: "Opening e-book", description: book.title });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

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
                <p className="text-sm text-muted-foreground">Government exam, academic & skill e-books</p>
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
            All {eBooks.length} e-books are enabled and ready to read.
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
                  <ExternalLink className="h-4 w-4 mr-2" />
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
    </div>
  );
};

export default DigitalLibrary;
