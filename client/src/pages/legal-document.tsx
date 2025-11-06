import { useQuery } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import type { LegalDocument } from "@shared/schema";

export default function LegalDocumentPage() {
  const [match, params] = useRoute("/legal/:type");
  const documentType = params?.type;

  const { data: document, isLoading, error } = useQuery<LegalDocument>({
    queryKey: [`/api/legal-documents/${documentType}`],
    enabled: !!documentType,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-lamplight-accent"></div>
      </div>
    );
  }

  if (error || !document) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Document Not Found</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-slate-600 mb-4">
              The requested legal document could not be found.
            </p>
            <Button onClick={() => window.history.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6">
          <Button 
            variant="outline" 
            onClick={() => window.history.back()}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-lamplight-primary">
              {document.title}
            </CardTitle>
            <p className="text-slate-600">
              Last updated: {document.lastUpdated ? new Date(document.lastUpdated).toLocaleDateString() : 'Unknown'}
            </p>
          </CardHeader>
          <CardContent>
            <div className="prose prose-slate max-w-none">
              <div 
                dangerouslySetInnerHTML={{ 
                  __html: document.content.replace(/\n/g, '<br>').replace(/# (.*)/g, '<h1>$1</h1>').replace(/## (.*)/g, '<h2>$1</h2>').replace(/### (.*)/g, '<h3>$1</h3>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/- (.*)/g, '<li>$1</li>') 
                }} 
              />
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 text-center text-slate-500">
          <p>© 2025 Lamplight Technology Holdings LLC. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}