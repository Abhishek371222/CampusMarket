import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";

interface SearchBarProps {
  className?: string;
  initialValue?: string;
}

export function SearchBar({ className, initialValue = "" }: SearchBarProps) {
  const [value, setValue] = useState(initialValue);
  const [, setLocation] = useLocation();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim()) {
      setLocation(`/market?q=${encodeURIComponent(value)}`);
    } else {
      setLocation("/market");
    }
  };

  return (
    <form onSubmit={handleSearch} className={`relative ${className}`}>
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="search"
        placeholder="Search for textbooks, furniture..."
        className="pl-9 h-11 bg-background shadow-sm border-muted-foreground/20 focus-visible:ring-primary"
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
    </form>
  );
}
