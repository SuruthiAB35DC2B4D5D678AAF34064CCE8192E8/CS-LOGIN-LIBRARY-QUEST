import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Database, Search, ArrowLeft, ExternalLink, Download } from "lucide-react";

export const DigitalLibrary = () => {
  const [resources] = useState([
    {
      id: 1,
      title: "IEEE Digital Library",
      type: "Database",
      description: "Access to IEEE publications and standards",
      url: "https://ieeexplore.ieee.org",
      category: "Engineering"
    },
    {
      id: 2,
      title: "ACM Digital Library",
      type: "Database",
      description: "Computing and information technology resources",
      url: "https://dl.acm.org",
      category: "Computer Science"
    },
    {
      id: 3,
      title: "JSTOR Academic",
      type: "Journal Database",
      description: "Scholarly literature across disciplines",
      url: "https://jstor.org",
      category: "Multidisciplinary"
    },
    {
      id: 4,
      title: "Nature Digital Edition",
      type: "E-Journal",
      description: "Latest scientific research and discoveries",
      url: "https://nature.com",
      category: "Science"
    }
  ]);

  const handleOpenResource = (resource: any) => {
    window.open(resource.url, '_blank');
  };

  const handleDownloadGuide = (resourceTitle: string) => {
    alert(`Downloading access guide for "${resourceTitle}"`);
  };

  return (
    <div className="min-h-screen bg-gradient-background">
      {/* Header */}
      <header className="bg-card border-b border-border shadow-soft">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={() => window.close()}>
                <ArrowLeft className="h-5 w-5 mr-2" />
                Back to Library
              </Button>
              <div className="p-2 bg-gradient-primary rounded-lg shadow-glow">
                <Database className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">Digital Library</h1>
                <p className="text-sm text-muted-foreground">Access online databases and e-resources</p>
              </div>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search databases..."
                className="pl-10 pr-4 py-2 bg-background border border-border rounded-lg focus:border-primary focus:ring-primary/20 transition-smooth"
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-foreground mb-2">Available Databases</h2>
          <p className="text-muted-foreground">Access our collection of digital resources and databases</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {resources.map((resource) => (
            <Card key={resource.id} className="bg-gradient-card border-0 shadow-soft">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-2">{resource.title}</CardTitle>
                    <CardDescription>{resource.description}</CardDescription>
                  </div>
                  <Badge variant="secondary">{resource.category}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center text-sm text-muted-foreground">
                  <Database className="h-4 w-4 mr-2" />
                  Type: {resource.type}
                </div>
                
                <div className="flex flex-col space-y-2">
                  <Button 
                    onClick={() => handleOpenResource(resource)}
                    className="w-full"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Access Database
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => handleDownloadGuide(resource.title)}
                    className="w-full"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Access Guide
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-12 bg-gradient-card p-6 rounded-lg border-0 shadow-soft">
          <h3 className="text-lg font-semibold text-foreground mb-4">Need Help?</h3>
          <p className="text-muted-foreground mb-4">
            Having trouble accessing digital resources? Our librarians are here to help.
          </p>
          <Button variant="outline">
            Contact Support
          </Button>
        </div>
      </main>
    </div>
  );
};