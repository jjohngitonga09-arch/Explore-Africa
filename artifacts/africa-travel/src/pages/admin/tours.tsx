import { useState } from "react";
import { Link } from "wouter";
import { 
  useListTours, useCreateTour, useDeleteTour, 
  useListDestinationCountries, getListToursQueryKey 
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Trash2, Edit, Image as ImageIcon, MapPin } from "lucide-react";

export default function AdminTours() {
  const { data: tours, isLoading } = useListTours();
  const { data: countries } = useListDestinationCountries();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const createTour = useCreateTour();
  const deleteTour = useDeleteTour();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "", description: "", durationDays: 7, basePrice: 1000, destinationCountryId: ""
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createTour.mutate(
      { 
        data: {
          title: formData.title,
          description: formData.description,
          durationDays: Number(formData.durationDays),
          basePrice: Number(formData.basePrice),
          destinationCountryId: Number(formData.destinationCountryId),
          highlights: [],
          included: [],
          notIncluded: []
        }
      },
      {
        onSuccess: () => {
          toast({ title: "Tour Created" });
          setIsCreateOpen(false);
          setFormData({ title: "", description: "", durationDays: 7, basePrice: 1000, destinationCountryId: "" });
          queryClient.invalidateQueries({ queryKey: getListToursQueryKey() });
        }
      }
    );
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this tour?")) {
      deleteTour.mutate({ id }, {
        onSuccess: () => {
          toast({ title: "Tour deleted" });
          queryClient.invalidateQueries({ queryKey: getListToursQueryKey() });
        }
      });
    }
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-serif">Journey Catalog</h1>
          <p className="text-muted-foreground mt-1">Manage tours, itineraries, and pricing.</p>
        </div>

        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-none"><Plus className="w-4 h-4 mr-2" /> New Tour</Button>
          </DialogTrigger>
          <DialogContent className="rounded-none sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle className="font-serif text-2xl">Create New Tour</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="text-xs uppercase tracking-wider text-muted-foreground mb-1 block">Title</label>
                  <Input required className="rounded-none" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
                </div>
                <div className="col-span-2">
                  <label className="text-xs uppercase tracking-wider text-muted-foreground mb-1 block">Description</label>
                  <Textarea required className="rounded-none min-h-[100px]" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
                </div>
                <div>
                  <label className="text-xs uppercase tracking-wider text-muted-foreground mb-1 block">Destination</label>
                  <Select required value={formData.destinationCountryId} onValueChange={v => setFormData({...formData, destinationCountryId: v})}>
                    <SelectTrigger className="rounded-none"><SelectValue placeholder="Select Country" /></SelectTrigger>
                    <SelectContent>
                      {countries?.map(c => <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-xs uppercase tracking-wider text-muted-foreground mb-1 block">Duration (Days)</label>
                  <Input required type="number" className="rounded-none" value={formData.durationDays} onChange={e => setFormData({...formData, durationDays: e.target.value as any})} />
                </div>
                <div>
                  <label className="text-xs uppercase tracking-wider text-muted-foreground mb-1 block">Base Price (USD)</label>
                  <Input required type="number" className="rounded-none" value={formData.basePrice} onChange={e => setFormData({...formData, basePrice: e.target.value as any})} />
                </div>
              </div>
              <div className="pt-4 flex justify-end">
                <Button type="submit" className="rounded-none px-8" disabled={createTour.isPending}>Save Tour</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-card border border-border">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-16">ID</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Destination</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Base Price</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Loading tours...</TableCell></TableRow>
            ) : tours?.map((tour) => (
              <TableRow key={tour.id}>
                <TableCell className="font-mono text-muted-foreground">{tour.id}</TableCell>
                <TableCell className="font-medium">
                  {tour.title}
                  {tour.coverImage && <ImageIcon className="w-3 h-3 inline-block ml-2 text-primary" />}
                </TableCell>
                <TableCell><MapPin className="w-3 h-3 inline-block mr-1 text-muted-foreground"/>{tour.destinationCountry?.name || '-'}</TableCell>
                <TableCell>{tour.durationDays} Days</TableCell>
                <TableCell>${tour.basePrice}</TableCell>
                <TableCell className="text-right space-x-2">
                  <Button variant="ghost" size="sm" asChild className="h-8 w-8 p-0"><Link href={`/admin/tours/${tour.id}`}><Edit className="w-4 h-4" /></Link></Button>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => handleDelete(tour.id)}><Trash2 className="w-4 h-4" /></Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
