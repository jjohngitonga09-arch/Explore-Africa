import { useState } from "react";
import { useListVisaServices, useCreateVisaService, useUpdateVisaService, useAdminListDestinationCountries, getListVisaServicesQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Plus, Edit, ShieldCheck } from "lucide-react";

export default function AdminVisaServices() {
  const { data: services, isLoading } = useListVisaServices();
  const { data: countries } = useAdminListDestinationCountries();
  
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const createService = useCreateVisaService();
  const updateService = useUpdateVisaService();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "", description: "", fee: 150, destinationCountryId: "", requirements: ""
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createService.mutate(
      { 
        data: {
          name: formData.name,
          description: formData.description,
          fee: Number(formData.fee),
          destinationCountryId: Number(formData.destinationCountryId),
          requirements: formData.requirements.split('\n').filter(r => r.trim()),
          isActive: true
        }
      },
      {
        onSuccess: () => {
          toast({ title: "Visa Service Created" });
          setIsCreateOpen(false);
          setFormData({ name: "", description: "", fee: 150, destinationCountryId: "", requirements: "" });
          queryClient.invalidateQueries({ queryKey: getListVisaServicesQueryKey() });
        }
      }
    );
  };

  const toggleStatus = (id: number, currentStatus: boolean) => {
    updateService.mutate(
      { id, data: { isActive: !currentStatus } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListVisaServicesQueryKey() });
        }
      }
    );
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center">
          <ShieldCheck className="w-8 h-8 mr-4 text-primary" />
          <div>
            <h1 className="text-3xl font-serif">Visa Concierge Catalog</h1>
            <p className="text-muted-foreground mt-1">Manage offered visa services and requirements.</p>
          </div>
        </div>

        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-none"><Plus className="w-4 h-4 mr-2" /> New Service</Button>
          </DialogTrigger>
          <DialogContent className="rounded-none sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle className="font-serif text-2xl">Create Visa Service</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="text-xs uppercase tracking-wider text-muted-foreground mb-1 block">Service Name</label>
                  <Input required className="rounded-none" placeholder="e.g. Kenya E-Visa Processing" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
                <div className="col-span-2">
                  <label className="text-xs uppercase tracking-wider text-muted-foreground mb-1 block">Destination Country</label>
                  <Select required value={formData.destinationCountryId} onValueChange={v => setFormData({...formData, destinationCountryId: v})}>
                    <SelectTrigger className="rounded-none"><SelectValue placeholder="Select Country" /></SelectTrigger>
                    <SelectContent>
                      {countries?.map(c => <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-2">
                  <label className="text-xs uppercase tracking-wider text-muted-foreground mb-1 block">Processing Fee (USD)</label>
                  <Input required type="number" className="rounded-none" value={formData.fee} onChange={e => setFormData({...formData, fee: e.target.value as any})} />
                </div>
                <div className="col-span-2">
                  <label className="text-xs uppercase tracking-wider text-muted-foreground mb-1 block">Description</label>
                  <Textarea required className="rounded-none min-h-[80px]" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
                </div>
                <div className="col-span-2">
                  <label className="text-xs uppercase tracking-wider text-muted-foreground mb-1 block">Requirements (One per line)</label>
                  <Textarea required className="rounded-none min-h-[100px]" placeholder="- Copy of passport page&#10;- Passport photo" value={formData.requirements} onChange={e => setFormData({...formData, requirements: e.target.value})} />
                </div>
              </div>
              <div className="pt-4 flex justify-end">
                <Button type="submit" className="rounded-none px-8" disabled={createService.isPending}>Save Service</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-card border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Service Name</TableHead>
              <TableHead>Destination</TableHead>
              <TableHead>Fee</TableHead>
              <TableHead>Requirements</TableHead>
              <TableHead>Active</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Loading services...</TableCell></TableRow>
            ) : services?.map((service) => (
              <TableRow key={service.id}>
                <TableCell className="font-medium">{service.name}</TableCell>
                <TableCell>{service.destinationCountry?.name}</TableCell>
                <TableCell className="text-primary font-medium">${service.fee}</TableCell>
                <TableCell className="text-muted-foreground text-sm">{service.requirements?.length || 0} items</TableCell>
                <TableCell>
                  <Switch 
                    checked={service.isActive} 
                    onCheckedChange={() => toggleStatus(service.id, service.isActive)} 
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
