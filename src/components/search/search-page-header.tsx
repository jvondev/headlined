"use client";

import { FC, useState } from "react";
import { useRouter } from "next/navigation";
import { Search as SearchIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/shared/page-header";
import { useFullScreen } from "@/context/full-screen-context";

type SearchPageHeaderProps = {
  initialQuery: string;
};

export const SearchPageHeader: FC<SearchPageHeaderProps> = ({ initialQuery }) => {
  const { isFullScreen, toggleFullScreen } = useFullScreen();
  const [query, setQuery] = useState(initialQuery);
  const router = useRouter();

  const handleSearch = (e?: React.FormEvent<HTMLFormElement>) => {
    if (e) e.preventDefault();
    if (query.trim()) {
      router.push(`/search/${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <PageHeader
      isFullScreen={isFullScreen}
      toggleFullScreen={toggleFullScreen}
    >
      <form onSubmit={handleSearch} className="flex-1 relative max-w-xl mx-auto">
        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search posts..."
            className="pl-10 pr-20"
        />
        <Button type="submit" size="sm" className="absolute right-1.5 top-1/2 -translate-y-1/2">
            Search
        </Button>
      </form>
    </PageHeader>
  );
};