import { useState } from "react";
import { 
  useAdminListOriginCountries, useAdminListDestinationCountries, 
  useAddOriginCountry, useAddDestinationCountry, useDeleteCountry,
  getAdminListOriginCountriesQueryKey, getAdminListDestinationCountriesQueryKey,
  getListOriginCountriesQueryKey, getListDestinationCountriesQueryKey
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Globe, PlaneTakeoff, PlaneLanding, Trash2, Plus } from "lucide-react";

export default function AdminCountries() {
  const { data: originCountries, isLoading: originsLoading } = useAdminListOriginCountries();
  const { data: destCountries, isLoading: destsLoading } = useAdminListDestinationCountries();
  
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const addOrigin = useAddOriginCountry();
  const addDest = useAddDestinationCountry();
  const deleteCountry = useDeleteCountry();

  const [newOriginName, setNewOriginName] = useState("");
  const [newOriginCode, setNewOriginCode] = useState("");
  const [newDestName, setNewDestName] = useState("");
  const [newDestCode, setNewDestCode] = useState("");

  const handleAddOrigin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOriginName) return;
    addOrigin.mutate(
      { data: { name: newOriginName, code: newOriginCode } },
      {
        onSuccess: () => {
          toast({ title: "Origin Country Added" });
          setNewOriginName("");
          setNewOriginCode("");
          queryClient.invalidateQueries({ queryKey: getAdminListOriginCountriesQueryKey() });
        }
      }
    );
  };

  const handleAddDest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDestName) return;
    addDest.mutate(
      { data: { name: newDestName, code: newDestCode } },
      {
        onSuccess: () => {
          toast({ title: "Destination Country Added" });
          setNewDestName("");
          setNewDestCode("");
          queryClient.invalidateQueries({ queryKey: getAdminListDestinationCountriesQueryKey() });
        }
      }
    );
  };

  const handleDelete = (id: number, type: 'origin' | 'destination') => {
    if (confirm("Delete this country? This may affect linked pricing or tours.")) {
      deleteCountry.mutate(
        { id },
        {
          onSuccess: () => {
            toast({ title: "Country Deleted" });
            if (type === 'origin') {
              queryClient.invalidateQueries({ queryKey: getAdminListOriginCountriesQueryKey() });
              queryClient.invalidateQueries({ queryKey: getListOriginCountriesQueryKey() });
            } else {
              queryClient.invalidateQueries({ queryKey: getAdminListDestinationCountriesQueryKey() });
              queryClient.invalidateQueries({ queryKey: getListDestinationCountriesQueryKey() });
            }
          }
        }
      );
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center">
        <Globe className="w-8 h-8 mr-4 text-primary" />
        <div>
          <h1 className="text-3xl font-serif">Region Management</h1>
          <p className="text-muted-foreground mt-1">Configure supported origin markets and destination countries.</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Origin Countries */}
        <Card className="rounded-none shadow-sm border-border">
          <CardHeader className="bg-muted/20 border-b border-border/50">
            <CardTitle className="font-serif text-xl flex items-center">
              <PlaneTakeoff className="w-5 h-5 mr-2 text-primary" />
              Origin Markets
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="p-4 border-b border-border/50 bg-card">
              <form onSubmit={handleAddOrigin} className="flex gap-2">
                <Input placeholder="Country Name" className="rounded-none" value={newOriginName} onChange={e => setNewOriginName(e.target.value)} />
                <Input placeholder="Code (e.g. US)" className="rounded-none w-32" value={newOriginCode} onChange={e => setNewOriginCode(e.target.value)} />
                <Button type="submit" className="rounded-none" disabled={addOrigin.isPending || !newOriginName}><Plus className="w-4 h-4" /></Button>
              </form>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead className="w-24">Code</TableHead>
                  <TableHead className="text-right w-16"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {originsLoading ? (
                  <TableRow><TableCell colSpan={3} className="text-center py-4 text-muted-foreground">Loading...</TableCell></TableRow>
                ) : originCountries?.map((country) => (
                  <TableRow key={country.id}>
                    <TableCell className="font-medium">{country.name}</TableCell>
                    <TableCell className="font-mono text-muted-foreground">{country.code}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => handleDelete(country.id, 'origin')}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Destination Countries */}
        <Card className="rounded-none shadow-sm border-border">
          <CardHeader className="bg-muted/20 border-b border-border/50">
            <CardTitle className="font-serif text-xl flex items-center">
              <PlaneLanding className="w-5 h-5 mr-2 text-primary" />
              Destination Countries
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="p-4 border-b border-border/50 bg-card">
              <form onSubmit={handleAddDest} className="flex gap-2">
                <Input placeholder="Country Name" className="rounded-none" value={newDestName} onChange={e => setNewDestName(e.target.value)} />
                <Input placeholder="Code (e.g. KE)" className="rounded-none w-32" value={newDestCode} onChange={e => setNewDestCode(e.target.value)} />
                <Button type="submit" className="rounded-none" disabled={addDest.isPending || !newDestName}><Plus className="w-4 h-4" /></Button>
              </form>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead className="w-24">Code</TableHead>
                  <TableHead className="text-right w-16"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {destsLoading ? (
                  <TableRow><TableCell colSpan={3} className="text-center py-4 text-muted-foreground">Loading...</TableCell></TableRow>
                ) : destCountries?.map((country) => (
                  <TableRow key={country.id}>
                    <TableCell className="font-medium">{country.name}</TableCell>
                    <TableCell className="font-mono text-muted-foreground">{country.code}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => handleDelete(country.id, 'destination')}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
