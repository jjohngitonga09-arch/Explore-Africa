import { useState } from "react";
import { useGetAdminGallery, useAddGalleryImage, useDeleteGalleryImage, useAdminListDestinationCountries, getGetAdminGalleryQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Plus, Image as ImageIcon } from "lucide-react";

export default function AdminGallery() {
  const { data: images, isLoading } = useGetAdminGallery();
  const { data: countries } = useAdminListDestinationCountries();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const addImage = useAddGalleryImage();
  const deleteImage = useDeleteGalleryImage();

  const [url, setUrl] = useState("");
  const [caption, setCaption] = useState("");
  const [countryId, setCountryId] = useState<string>("none");

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;
    addImage.mutate(
      { 
        data: { 
          imageUrl: url, 
          caption: caption || undefined, 
          countryId: countryId !== "none" ? parseInt(countryId) : undefined 
        } 
      },
      {
        onSuccess: () => {
          toast({ title: "Image Added" });
          setUrl("");
          setCaption("");
          setCountryId("none");
          queryClient.invalidateQueries({ queryKey: getGetAdminGalleryQueryKey() });
        }
      }
    );
  };

  const handleDelete = (id: number) => {
    if (confirm("Delete this image from the gallery?")) {
      deleteImage.mutate(
        { id },
        {
          onSuccess: () => {
            toast({ title: "Image Deleted" });
            queryClient.invalidateQueries({ queryKey: getGetAdminGalleryQueryKey() });
          }
        }
      );
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center">
        <ImageIcon className="w-8 h-8 mr-4 text-primary" />
        <div>
          <h1 className="text-3xl font-serif">Visual Assets</h1>
          <p className="text-muted-foreground mt-1">Manage the public inspiration gallery.</p>
        </div>
      </div>

      <Card className="rounded-none shadow-sm border-border mb-8 bg-sidebar">
        <CardContent className="p-6">
          <form onSubmit={handleAdd} className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1 space-y-2 w-full">
              <label className="text-xs uppercase tracking-wider text-muted-foreground">Image URL</label>
              <Input placeholder="https://..." className="rounded-none bg-background" value={url} onChange={e => setUrl(e.target.value)} />
            </div>
            <div className="flex-1 space-y-2 w-full">
              <label className="text-xs uppercase tracking-wider text-muted-foreground">Caption (Optional)</label>
              <Input placeholder="A beautiful sunset..." className="rounded-none bg-background" value={caption} onChange={e => setCaption(e.target.value)} />
            </div>
            <div className="w-full md:w-64 space-y-2">
              <label className="text-xs uppercase tracking-wider text-muted-foreground">Country Tag</label>
              <Select value={countryId} onValueChange={setCountryId}>
                <SelectTrigger className="rounded-none bg-background"><SelectValue placeholder="None" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {countries?.map(c => <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" className="rounded-none px-8" disabled={addImage.isPending || !url}>
              <Plus className="w-4 h-4 mr-2" /> Add Image
            </Button>
          </form>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <div key={i} className="aspect-square bg-muted animate-pulse" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {images?.map(img => (
            <div key={img.id} className="relative group bg-muted aspect-square overflow-hidden border border-border">
              <img src={img.imageUrl} alt={img.caption || 'Gallery'} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-4">
                <div className="flex justify-end">
                  <Button variant="destructive" size="sm" className="h-8 w-8 p-0 rounded-full" onClick={() => handleDelete(img.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                <div>
                  {img.country && <span className="text-primary text-[10px] font-bold uppercase tracking-widest bg-background/90 px-1.5 py-0.5">{img.country.name}</span>}
                  {img.caption && <p className="text-white text-xs mt-2 line-clamp-2">{img.caption}</p>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
