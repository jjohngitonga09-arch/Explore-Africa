import { useState } from "react";
import { useGetMyVisaCases, useAddCaseDocument, getGetMyVisaCasesQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";
import { FileText, Link as LinkIcon, AlertCircle, Clock, CheckCircle2, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

export default function MyVisaCases() {
  const { data: cases, isLoading } = useGetMyVisaCases();
  const addDocument = useAddCaseDocument();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [docType, setDocType] = useState("");
  const [docUrl, setDocUrl] = useState("");
  const [activeCaseId, setActiveCaseId] = useState<number | null>(null);

  const getStatusColor = (status: string) => {
    switch(status.toLowerCase()) {
      case 'approved': return 'bg-green-100 text-green-800 hover:bg-green-100';
      case 'in_progress': return 'bg-blue-100 text-blue-800 hover:bg-blue-100';
      case 'pending_documents': return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100';
      case 'rejected': return 'bg-red-100 text-red-800 hover:bg-red-100';
      default: return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch(status.toLowerCase()) {
      case 'approved': return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      case 'pending_documents': return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      case 'rejected': return <AlertCircle className="w-5 h-5 text-red-600" />;
      default: return <Clock className="w-5 h-5 text-blue-600" />;
    }
  };

  const handleAddDocument = (caseId: number) => {
    if (!docType || !docUrl) return;
    
    addDocument.mutate(
      { id: caseId, data: { documentType: docType, fileUrl: docUrl } },
      {
        onSuccess: () => {
          toast({ title: "Document added successfully" });
          setDocType("");
          setDocUrl("");
          setActiveCaseId(null);
          queryClient.invalidateQueries({ queryKey: getGetMyVisaCasesQueryKey() });
        },
        onError: () => {
          toast({ title: "Failed to add document", variant: "destructive" });
        }
      }
    );
  };

  return (
    <div className="pb-24 pt-10 min-h-screen bg-sidebar">
      <div className="container mx-auto px-4 md:px-6 max-w-4xl">
        <div className="mb-10">
          <h1 className="text-4xl font-serif mb-2">My Visa Applications</h1>
          <p className="text-muted-foreground">Track the status of your visa cases and manage your documents.</p>
        </div>

        {isLoading ? (
          <div className="space-y-6">
            {[1, 2].map(i => (
              <div key={i} className="h-64 bg-muted animate-pulse border border-border" />
            ))}
          </div>
        ) : !cases || cases.length === 0 ? (
          <Card className="rounded-none border-dashed border-border/60 bg-background text-center py-20">
            <CardContent>
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-2xl font-serif mb-2">No Visa Cases</h3>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                You haven't applied for any visas through our concierge service.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            {cases.map(visaCase => (
              <Card key={visaCase.id} className="rounded-none border-border bg-background shadow-sm overflow-hidden">
                <div className="bg-muted/30 px-6 py-4 border-b border-border flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(visaCase.status)}
                    <div>
                      <h3 className="font-serif text-xl">{visaCase.service?.name || `Case #${visaCase.id}`}</h3>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider">
                        Submitted: {visaCase.submittedAt ? format(new Date(visaCase.submittedAt), 'MMM d, yyyy') : format(new Date(visaCase.createdAt), 'MMM d, yyyy')}
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline" className={`rounded-none uppercase tracking-widest text-xs px-3 py-1 ${getStatusColor(visaCase.status)}`}>
                    {visaCase.status.replace('_', ' ')}
                  </Badge>
                </div>
                
                <CardContent className="p-6">
                  {visaCase.adminNotes && (
                    <div className="mb-6 p-4 bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800 text-sm">
                      <strong className="font-medium uppercase text-xs tracking-wider block mb-1">Message from Embassy/Agent:</strong>
                      {visaCase.adminNotes}
                    </div>
                  )}

                  <div className="grid md:grid-cols-2 gap-8">
                    <div>
                      <h4 className="font-medium uppercase tracking-wider text-xs text-muted-foreground mb-4 border-b pb-2">Uploaded Documents</h4>
                      {visaCase.documents && visaCase.documents.length > 0 ? (
                        <ul className="space-y-3">
                          {visaCase.documents.map(doc => (
                            <li key={doc.id} className="flex items-start text-sm">
                              <CheckCircle2 className="w-4 h-4 text-green-500 mr-2 shrink-0 mt-0.5" />
                              <div>
                                <div className="font-medium">{doc.documentType}</div>
                                <a href={doc.fileUrl} target="_blank" rel="noreferrer" className="text-primary hover:underline text-xs flex items-center mt-1">
                                  <LinkIcon className="w-3 h-3 mr-1" /> View Document
                                </a>
                              </div>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm text-muted-foreground italic">No documents uploaded yet.</p>
                      )}
                    </div>

                    <div className="bg-sidebar p-5 border border-border/50">
                      <h4 className="font-medium uppercase tracking-wider text-xs text-muted-foreground mb-4">Add Document</h4>
                      {activeCaseId === visaCase.id ? (
                        <div className="space-y-4">
                          <div>
                            <Label className="text-xs uppercase">Document Name/Type</Label>
                            <Input 
                              placeholder="e.g. Passport Copy" 
                              className="rounded-none h-8 text-sm mt-1" 
                              value={docType}
                              onChange={(e) => setDocType(e.target.value)}
                            />
                          </div>
                          <div>
                            <Label className="text-xs uppercase">File URL (Cloud Storage Link)</Label>
                            <Input 
                              placeholder="https://..." 
                              className="rounded-none h-8 text-sm mt-1"
                              value={docUrl}
                              onChange={(e) => setDocUrl(e.target.value)}
                            />
                          </div>
                          <div className="flex gap-2 pt-2">
                            <Button size="sm" className="rounded-none w-full" onClick={() => handleAddDocument(visaCase.id)} disabled={!docType || !docUrl || addDocument.isPending}>
                              Upload
                            </Button>
                            <Button size="sm" variant="outline" className="rounded-none w-full" onClick={() => setActiveCaseId(null)}>
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <Button 
                          variant="outline" 
                          className="w-full rounded-none border-dashed bg-background hover:bg-muted"
                          onClick={() => setActiveCaseId(visaCase.id)}
                        >
                          <Upload className="w-4 h-4 mr-2" /> Upload New File
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
