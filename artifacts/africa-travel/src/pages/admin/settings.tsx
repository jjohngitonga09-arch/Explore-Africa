import { useEffect, useState } from "react";
import { useGetSiteSettings, useUpdateSiteSettings, getGetSiteSettingsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Settings as SettingsIcon, Loader2 } from "lucide-react";

export default function AdminSettings() {
  const { data: settings, isLoading } = useGetSiteSettings();
  const updateSettings = useUpdateSiteSettings();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [intervalSeconds, setIntervalSeconds] = useState("");

  useEffect(() => {
    if (settings) {
      setIntervalSeconds((settings.headerCarouselIntervalMs / 1000).toString());
    }
  }, [settings]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const seconds = parseFloat(intervalSeconds);
    if (isNaN(seconds) || seconds < 0.5) {
      toast({ title: "Invalid value", description: "Interval must be at least 0.5 seconds", variant: "destructive" });
      return;
    }
    updateSettings.mutate(
      { data: { headerCarouselIntervalMs: Math.round(seconds * 1000) } },
      {
        onSuccess: () => {
          toast({ title: "Settings updated" });
          queryClient.invalidateQueries({ queryKey: getGetSiteSettingsQueryKey() });
        },
        onError: (err: any) => {
          toast({ title: "Update failed", description: err?.message ?? "Something went wrong", variant: "destructive" });
        },
      }
    );
  };

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center">
        <SettingsIcon className="w-8 h-8 mr-4 text-primary" />
        <div>
          <h1 className="text-3xl font-serif">Site Settings</h1>
          <p className="text-muted-foreground mt-1">Configure site-wide behavior.</p>
        </div>
      </div>

      <Card className="rounded-none shadow-sm border-border max-w-xl bg-sidebar">
        <CardContent className="p-6">
          {isLoading ? (
            <div className="h-10 bg-muted animate-pulse" />
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4 items-end">
              <div className="flex-1 space-y-2 w-full">
                <label className="text-xs uppercase tracking-wider text-muted-foreground">
                  Homepage Banner Rotation Speed (seconds)
                </label>
                <Input
                  type="number"
                  step="0.5"
                  min="0.5"
                  className="rounded-none bg-background"
                  value={intervalSeconds}
                  onChange={(e) => setIntervalSeconds(e.target.value)}
                />
              </div>
              <Button type="submit" className="rounded-none px-8" disabled={updateSettings.isPending}>
                {updateSettings.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                {updateSettings.isPending ? "Saving..." : "Save"}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
