import { useNewsletterSubscriptions, useExportNewsletterCsv } from "@/hooks/useNewsletter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";
import { Loader2, Download } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

export default function DashboardNewsletter() {
  const [filters, setFilters] = useState({
    from: "",
    to: "",
    country: "",
    search: "",
  });
  const [revealedIps, setRevealedIps] = useState<Record<string, boolean>>({});

  const query = useNewsletterSubscriptions(filters);
  const exportMutation = useExportNewsletterCsv();

  const subscriptions = useMemo(
    () => query.data?.pages.flatMap(page => page.items) ?? [],
    [query.data]
  );

  const onExport = () => {
    exportMutation.mutate(filters, {
      onSuccess: blob => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "newsletter.csv";
        a.click();
        URL.revokeObjectURL(url);
      },
      onError: () => toast.error("Export failed"),
    });
  };

  const maskIp = (ip?: string) => {
    if (!ip) return "";
    const parts = ip.split(".");
    if (parts.length === 4) {
      return `${parts[0]}.${parts[1]}.***`;
    }
    return "****";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-serif font-bold text-foreground">Newsletter Subscribers</h1>
          <p className="text-sm text-muted-foreground">Filter, review, and export signups.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => query.refetch()} disabled={query.isLoading}>
            {query.isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Refresh"}
          </Button>
          <Button variant="outline" onClick={onExport} disabled={exportMutation.isPending}>
            {exportMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" /> Export CSV
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
        <div className="space-y-1">
          <Label htmlFor="filter-from">From</Label>
          <Input
            id="filter-from"
            type="date"
            value={filters.from}
            onChange={e => setFilters(prev => ({ ...prev, from: e.target.value }))}
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="filter-to">To</Label>
          <Input
            id="filter-to"
            type="date"
            value={filters.to}
            onChange={e => setFilters(prev => ({ ...prev, to: e.target.value }))}
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="filter-country">Country</Label>
          <Input
            id="filter-country"
            placeholder="e.g. us"
            value={filters.country}
            onChange={e => setFilters(prev => ({ ...prev, country: e.target.value }))}
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="filter-search">Search</Label>
          <Input
            id="filter-search"
            placeholder="Email or country"
            value={filters.search}
            onChange={e => setFilters(prev => ({ ...prev, search: e.target.value }))}
          />
        </div>
      </div>

      {query.isLoading ? (
        <div className="text-sm text-muted-foreground">Loading...</div>
      ) : subscriptions.length === 0 ? (
        <div className="text-sm text-muted-foreground">No subscribers found.</div>
      ) : (
        <div className="space-y-3">
          {subscriptions.map(sub => (
            <div key={sub.id} className="border rounded-xl p-4 bg-card shadow-sm flex items-center justify-between">
              <div className="space-y-1">
                <div className="font-medium text-foreground">{sub.email}</div>
                <div className="text-xs text-muted-foreground">
                  {format(new Date(sub.createdAt), "MMM d, yyyy h:mm a")}
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                {sub.country && <Badge variant="outline">{sub.country}</Badge>}
                {sub.ip && (
                  <div className="flex items-center gap-1 text-xs">
                    <span>IP: {revealedIps[sub.id] ? sub.ip : maskIp(sub.ip)}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        setRevealedIps(prev => ({ ...prev, [sub.id]: !prev[sub.id] }))
                      }
                      aria-label={
                        revealedIps[sub.id]
                          ? `Hide IP for ${sub.email}`
                          : `Reveal IP for ${sub.email}`
                      }
                    >
                      {revealedIps[sub.id] ? "Hide" : "Show"}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}
          {query.hasNextPage && (
            <div className="flex justify-center">
              <Button
                variant="outline"
                onClick={() => query.fetchNextPage()}
                disabled={query.isFetchingNextPage}
              >
                {query.isFetchingNextPage ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Load more"
                )}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
