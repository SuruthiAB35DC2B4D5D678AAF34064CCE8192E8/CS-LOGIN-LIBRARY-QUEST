import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Database, Search, ArrowLeft, BookOpen, LogOut, Lock, Download, Loader2 } from "lucide-react";
import digitalLibraryBackground from "@/assets/digital-library-background.jpg";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { Session } from "@supabase/supabase-js";

type EBook = {
  id: string;
  title: string;
  category: string;
  description: string;
  filename: string;
};

// IDs match the server-side EBOOKS map in supabase/functions/ebook-proxy
const eBooks: EBook[] = [
  { id: "1", title: "TNPSC — Constitution of India (Polity Reference)", category: "TNPSC", description: "Official Constitution of India — core polity reference for TNPSC Group I/II/IV General Studies.", filename: "constitution-of-india.pdf" },
  { id: "2", title: "SSC — Quantitative Aptitude (NCERT Class 10 Math)", category: "SSC", description: "NCERT Class 10 Mathematics — foundation for SSC CGL/CHSL Quant section.", filename: "ncert-class10-maths.pdf" },
  { id: "3", title: "RRB — General Science (NCERT Class 10)", category: "RRB", description: "NCERT Class 10 Science — foundation for Railway NTPC / Group D General Science.", filename: "ncert-class10-science.pdf" },
  { id: "4", title: "UGC NET Paper 1 — Teaching & Research Aptitude", category: "UGC NET", description: "Official UGC NET Paper 1 syllabus & study guide.", filename: "ugc-net-paper1-syllabus.pdf" },
  { id: "5", title: "TRB — Teacher Recruitment Pedagogy Guide", category: "TRB", description: "Foundations of education & pedagogy reference for TRB PG/UG Assistant exams.", filename: "trb-pedagogy-reference.pdf" },
  { id: "6", title: "Thirukkural — Tamil Literature Classic", category: "Tamil Literature", description: "Thirukkural by Thiruvalluvar — full text with English translation.", filename: "thirukkural.pdf" },
  { id: "7", title: "English Grammar & Communication", category: "English Communication", description: "NCERT English grammar workbook — grammar, comprehension and writing skills.", filename: "english-grammar.pdf" },
  { id: "8", title: "NEET — Physics (NCERT Class 11)", category: "NEET", description: "NCERT Class 11 Physics — Units, Measurements, Motion (core NEET physics).", filename: "neet-physics-class11-ch1.pdf" },
  { id: "9", title: "Aptitude & Reasoning — Foundation", category: "Aptitude & Reasoning", description: "NCERT Class 10 Math (Statistics, Probability, Algebra) — quantitative aptitude foundation.", filename: "aptitude-foundation.pdf" },
  { id: "10", title: "Current Affairs — Indian Economic Reference", category: "Current Affairs", description: "NCERT Economics — current affairs / economy reference for competitive exams.", filename: "economic-survey-reference.pdf" },
  { id: "11", title: "Python Data Science Handbook — Jake VanderPlas", category: "Data Science", description: "Open-access Data Science textbook: NumPy, Pandas, Matplotlib, Scikit-Learn (full book).", filename: "python-data-science-handbook.pdf" },
  { id: "12", title: "Applied Cryptography — Boneh & Shoup", category: "Cryptography", description: "Free Stanford textbook on modern cryptography (full book PDF).", filename: "applied-cryptography-boneh-shoup.pdf" },
];

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;

export const DigitalLibrary = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [query, setQuery] = useState("");
  const [session, setSession] = useState<Session | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [openBook, setOpenBook] = useState<EBook | null>(null);
  const [viewerUrl, setViewerUrl] = useState<string>("");
  const [viewerError, setViewerError] = useState<string>("");
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
      setAuthChecked(true);
    });
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

  const buildProxyUrl = (id: string, download = false) => {
    const token = session?.access_token;
    if (!token) return "";
    const params = new URLSearchParams({ id, token });
    if (download) params.set("download", "1");
    return `${SUPABASE_URL}/functions/v1/ebook-proxy?${params.toString()}`;
  };

  const handleOpen = (book: EBook) => {
    if (!session) {
      toast({ title: "Sign in required", description: "Please sign in to read e-books.", variant: "destructive" });
      navigate("/login");
      return;
    }
    const url = buildProxyUrl(book.id);
    setOpenBook(book);
    setViewerError("");
    setViewerUrl(url);
  };

  const handleDownload = async (book: EBook) => {
    if (!session) {
      navigate("/login");
      return;
    }
    setDownloadingId(book.id);
    try {
      const res = await fetch(buildProxyUrl(book.id, true));
      if (!res.ok) {
        const msg = await res.text().catch(() => "");
        throw new Error(`Download failed (${res.status}) ${msg}`);
      }
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = book.filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
      toast({ title: "Downloaded", description: book.title });
    } catch (err) {
      console.error(err);
      toast({
        title: "Could not download e-book",
        description: err instanceof Error ? err.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setDownloadingId(null);
    }
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
                <p className="text-sm text-muted-foreground">Read inline or download — secure, authenticated access</p>
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
            All {eBooks.length} e-books are enabled. Click <strong>Read</strong> to open inline, or <strong>Download</strong> to save.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((book) => (
            <Card key={book.id} className="bg-gradient-card border-0 shadow-soft flex flex-col">
              <CardHeader>
                <CardTitle className="text-lg mb-2 flex items-start gap-2">
                  <BookOpen className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  {book.title}
                </CardTitle>
                <CardDescription>{book.description}</CardDescription>
                <div className="flex items-center gap-2 pt-2">
                  <Badge variant="secondary">{book.category}</Badge>
                  <Badge className="bg-green-600 hover:bg-green-700 text-white">Enabled</Badge>
                </div>
              </CardHeader>
              <CardContent className="mt-auto space-y-2">
                <Button onClick={() => handleOpen(book)} className="w-full">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Read E-Book
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleDownload(book)}
                  className="w-full"
                  disabled={downloadingId === book.id}
                >
                  {downloadingId === book.id ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4 mr-2" />
                  )}
                  Download PDF
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">No e-books match your search.</div>
        )}
      </main>

      <Dialog
        open={!!openBook}
        onOpenChange={(o) => {
          if (!o) {
            setOpenBook(null);
            setViewerUrl("");
            setViewerError("");
          }
        }}
      >
        <DialogContent className="max-w-5xl w-[95vw] h-[90vh] p-0 flex flex-col">
          <DialogHeader className="px-6 py-3 border-b shrink-0">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex-1 min-w-0">
                <DialogTitle className="flex items-center gap-2 text-base truncate">
                  <BookOpen className="h-5 w-5 text-primary shrink-0" />
                  <span className="truncate">{openBook?.title}</span>
                </DialogTitle>
                <DialogDescription className="text-xs">
                  Reading inline as PDF — use the browser controls to scroll, zoom, or print.
                </DialogDescription>
              </div>
              {openBook && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDownload(openBook)}
                  disabled={downloadingId === openBook.id}
                >
                  {downloadingId === openBook.id ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4 mr-2" />
                  )}
                  Download
                </Button>
              )}
            </div>
          </DialogHeader>
          {viewerError ? (
            <div className="flex-1 flex items-center justify-center p-8 text-center text-muted-foreground">
              {viewerError}
            </div>
          ) : viewerUrl ? (
            <object
              key={viewerUrl}
              data={viewerUrl}
              type="application/pdf"
              className="flex-1 w-full bg-muted"
            >
              <iframe
                src={viewerUrl}
                title={openBook?.title}
                className="w-full h-full"
                onError={() =>
                  setViewerError(
                    "Unable to preview this e-book in your browser. Try the Download button instead.",
                  )
                }
              />
            </object>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DigitalLibrary;
