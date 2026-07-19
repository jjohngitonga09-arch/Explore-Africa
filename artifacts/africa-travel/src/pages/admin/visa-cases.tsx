import { useState } from "react";
import { useGetAllVisaCases, useGetVisaCaseAdmin, useUpdateVisaCaseStatus, getGetAllVisaCasesQueryKey, getGetVisaCaseAdminQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";
import { FileText, Eye, CheckCircle2, CreditCard } from "lucide-react";

function VisaCaseDetailDialog({
  id, open, onOpenChange,
}: { id: number | null; open: boolean; onOpenChange: (open: boolean) => void }) {
  const { data: visaCase, isLoading } = useGetVisaCaseAdmin(id as number, {
    query: { enabled: !!id && open, queryKey: getGetVisaCaseAdminQueryKey(id as number) },
  });

  const updateStatus = useUpdateVisaCaseStatus();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState("");
  const [paymentInfo, setPaymentInfo] = useState("");

  if (visaCase && status === "" && !isLoading) {
    setStatus(visaCase.status);
    setNotes(visaCase.adminNotes || "");
    setPaymentInfo((visaCase as any).paymentInfo || "");
  }

  const handleSave = () => {
    if (!id) return;
    updateStatus.mutate(
      {
        id,
        data: {
          status,
          adminNotes: notes || undefined,
          paymentInfo: paymentInfo || undefined,
        } as any,
      },
      {
        onSuccess: () => {
          toast({ title: "Case updated successfully" });
          queryClient.invalidateQueries({ queryKey: getGetAllVisaCasesQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetVisaCaseAdminQueryKey(id) });
          onOpenChange(false);
        },
        onError: () => {
          toast({ title: "Update failed", variant: "destructive" });
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-none sm:max-w-[720px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl flex items-center border-b pb-4">
            <FileText className="w-5 h-5 mr-2 text-primary" />
            Case File #{id}
          </DialogTitle>
        </DialogHeader>

        {isLoading || !visaCase ? (
          <div className="py-12 text-center text-muted-foreground">Loading case details…</div>
        ) : (
          <div className="space-y-6 pt-4">
            {/* Applicant + service info */}
            <div className="grid grid-cols-2 gap-4 bg-muted/20 p-4 border border-border">
              <div>
                <div className="text-xs uppercase text-muted-foreground mb-1">Applicant</div>
                <div className="font-medium">{visaCase.user?.fullName}</div>
                <div className="text-sm text-muted-foreground">{visaCase.user?.email}</div>
                <div className="text-sm text-muted-foreground">Nationality: {visaCase.user?.nationality}</div>
              </div>
              <div>
                <div className="text-xs uppercase text-muted-foreground mb-1">Service Requested</div>
                <div className="font-medium text-primary">{visaCase.service?.name}</div>
                <div className="text-sm text-muted-foreground">Fee: ${visaCase.service?.fee}</div>
                <div className="text-sm text-muted-foreground">
                  Payment:{" "}
                  {visaCase.feePaid
                    ? <span className="text-green-600 font-medium">Paid</span>
                    : <span className="text-yellow-600">Pending</span>}
                </div>
              </div>
            </div>

            {/* Documents */}
            <div>
              <h3 className="font-medium uppercase text-xs tracking-wider text-muted-foreground border-b pb-2 mb-3">
                Submitted Documents ({visaCase.documents?.length || 0})
              </h3>
              {visaCase.documents && visaCase.documents.length > 0 ? (
                <ul className="space-y-2">
                  {visaCase.documents.map(doc => (
                    <li key={doc.id} className="flex justify-between items-center bg-sidebar p-3 border border-border">
                      <div className="flex items-center text-sm">
                        <CheckCircle2 className="w-4 h-4 text-primary mr-2" />
                        {doc.documentType}
                      </div>
                      <Button variant="outline" size="sm" className="h-7 text-xs rounded-none" asChild>
                        <a href={doc.fileUrl} target="_blank" rel="noreferrer">View File</a>
                      </Button>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-sm text-muted-foreground italic p-4 bg-sidebar border border-border">No documents uploaded yet.</div>
              )}
            </div>

            {/* Adjudication panel */}
            <div className="bg-card border border-border p-5 space-y-4">
              <h3 className="font-medium uppercase text-xs tracking-wider text-muted-foreground">Case Adjudication</h3>

              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger className="rounded-none"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="pending_documents">Pending Documents</SelectItem>
                    <SelectItem value="in_progress">In Progress (Embassy)</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Message to Applicant <span className="text-muted-foreground text-xs font-normal">(visible on their dashboard)</span></Label>
                <Textarea
                  className="rounded-none min-h-[80px]"
                  placeholder="e.g. Passport copy is blurry, please re-upload…"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-1">
                  <CreditCard className="w-3.5 h-3.5" /> Payment Instructions
                  <span className="text-muted-foreground text-xs font-normal ml-1">(shown to applicant so they know how to pay the processing fee)</span>
                </Label>
                <Textarea
                  className="rounded-none min-h-[80px]"
                  placeholder="e.g. Pay $250 via bank transfer to: Sojourn Africa Ltd, Account 0012345678, Bank XYZ. Reference: your full name + Case #ID"
                  value={paymentInfo}
                  onChange={e => setPaymentInfo(e.target.value)}
                />
              </div>

              <div className="pt-2 flex justify-end">
                <Button onClick={handleSave} className="rounded-none px-8" disabled={updateStatus.isPending}>
                  {updateStatus.isPending ? "Saving…" : "Save Adjudication"}
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default function AdminVisaCases() {
  const { data: cases, isLoading } = useGetAllVisaCases();
  const [selectedCase, setSelectedCase] = useState<number | null>(null);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "approved": return "bg-green-100 text-green-800 border-green-200";
      case "in_progress": return "bg-blue-100 text-blue-800 border-blue-200";
      case "fee_paid": return "bg-teal-100 text-teal-800 border-teal-200";
      case "pending_documents": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "rejected": return "bg-red-100 text-red-800 border-red-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className="p-8">
      <div className="flex items-center mb-8">
        <FileText className="w-8 h-8 mr-4 text-primary" />
        <div>
          <h1 className="text-3xl font-serif">Visa Adjudication Queue</h1>
          <p className="text-muted-foreground mt-1">Process client documents, set payment instructions, and manage embassy submissions.</p>
        </div>
      </div>

      <div className="bg-card border border-border shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/20">
              <TableHead className="w-20">Case ID</TableHead>
              <TableHead>Applicant</TableHead>
              <TableHead>Service</TableHead>
              <TableHead>Timeline</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Loading cases…</TableCell></TableRow>
            ) : cases?.map(visaCase => (
              <TableRow key={visaCase.id}>
                <TableCell className="font-mono text-muted-foreground">#{visaCase.id}</TableCell>
                <TableCell>
                  <div className="font-medium">{visaCase.user?.fullName}</div>
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground mt-1">{visaCase.user?.nationality}</div>
                </TableCell>
                <TableCell className="font-medium text-primary">{visaCase.service?.name}</TableCell>
                <TableCell className="text-sm">
                  <div className="text-muted-foreground">Created: {format(new Date(visaCase.createdAt), "MMM d")}</div>
                  {visaCase.submittedAt && <div>Submitted: {format(new Date(visaCase.submittedAt), "MMM d")}</div>}
                </TableCell>
                <TableCell>
                  {visaCase.feePaid
                    ? <Badge className="bg-green-100 text-green-800 rounded-none text-[10px]">Paid</Badge>
                    : <Badge variant="outline" className="rounded-none text-[10px]">Pending</Badge>}
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={`rounded-none uppercase tracking-widest text-[10px] px-2 py-1 ${getStatusColor(visaCase.status)}`}>
                    {visaCase.status.replace(/_/g, " ")}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="outline" size="sm" className="rounded-none h-8 px-3" onClick={() => setSelectedCase(visaCase.id)}>
                    <Eye className="w-4 h-4 mr-2" /> Review
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <VisaCaseDetailDialog
        id={selectedCase}
        open={selectedCase !== null}
        onOpenChange={open => !open && setSelectedCase(null)}
      />
    </div>
  );
}
