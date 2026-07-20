import { useState } from "react";
import { customFetch } from "@workspace/api-client-react";
import { useAdminListDestinationCountries, useGetAdminGallery, getGetAdminGalleryQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link2, Loader2 } from "lucide-react";

export default function AdminUrls() {
  const { data: countries } = useAdminListDestinationCountries();
  const { data: images } = useGetAdminGallery();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [url, setUrl] = useState("");
  const [caption, setCaption] = useState("");
  const [countryId, setCountryId] = useState<string>("none");
  const [isUploading, setIsUploading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;
    setIsUploading(true);
    try {
      await customFetch("/admin/gallery/upload-from-url", {
        method: "POST",
        body: JSON.stringify({
          imageUrl: url,
          caption: caption || undefined,
          countryId: countryId !== "none" ? parseInt(countryId) : undefined,
        }),
      });
      toast({ title: "Image uploaded to Cloudinary and added to gallery" });
      setUrl("");
      setCaption("");
      setCountryId("none");
      queryClient.invalidateQueries({ queryKey: getGetAdminGalleryQueryKey() });
    } catch (err: any) {
      toast({ title: "Upload failed", description: err?.message ?? "Something went wrong", variant: "destructive" });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center">
        <Link2 className="w-8 h-8 mr-4 text-primary" />
        <div>
          <h1 className="text-3xl font-serif">URLs</h1>
          <p className="text-muted-foreground mt-1">
            Paste a direct link to an image anywhere on the internet. It will be uploaded to Cloudinary and added to the gallery automatically.
          </p>
        </div>
      </div>

      <Card className="rounded-none shadow-sm border-border mb-8 bg-sidebar">
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1 space-y-2 w-full">
              <label className="text-xs uppercase tracking-wider text-muted-foreground">Image URL</label>
              <Input placeholder="https://example.com/photo.jpg" className="rounded-none bg-background" value={url} onChange={e => setUrl(e.target.value)} />
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
            <Button type="submit" className="rounded-none px-8" disabled={isUploading || !url}>
              {isUploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Link2 className="w-4 h-4 mr-2" />}
              {isUploading ? "Uploading..." : "Upload"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {images?.map(img => (
          <div key={img.id} className="relative bg-muted aspect-square overflow-hidden border border-border">
            <img src={img.imageUrl} alt={img.caption || 'Gallery'} className="w-full h-full object-cover" />
          </div>
        ))}
      </div>
    </div>
  );
}
