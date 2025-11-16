
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, RefreshCw } from "lucide-react";

interface BlogSearchBarProps {
  query: string;
  onQueryChange: (query: string) => void;
  onRefresh: () => void;
  onCreate: () => void;
  refreshing: boolean;
}

export function BlogSearchBar({
  query,
  onQueryChange,
  onRefresh,
  onCreate,
  refreshing,
}: BlogSearchBarProps) {
  return (
    <div className="mt-8 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
      <div className="relative max-w-xl w-full">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
        <Input
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Search posts, slugs, tags..."
          className="pl-9 bg-white"
        />
      </div>
      <div className="flex gap-2">
        <Button
          variant="outline"
          onClick={onRefresh}
          disabled={refreshing}
          className="self-start sm:self-auto"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
          {refreshing ? "Loading..." : "Refreshing"}
        </Button>
        <Button onClick={onCreate} className="self-start sm:self-auto">
          <Plus className="h-4 w-4 mr-2" /> Create new blog
        </Button>
      </div>
    </div>
  );
}