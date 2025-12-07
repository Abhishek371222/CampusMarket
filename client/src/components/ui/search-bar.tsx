import { Input } from "@/components/ui/input";
import { Search, X, Loader2 } from "lucide-react";
import { useEffect, useState, useCallback, useRef } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";

interface SearchBarProps {
  className?: string;
  initialValue?: string;
  onSearch?: (value: string) => void;
  debounceMs?: number;
  isSearching?: boolean;
}

export function SearchBar({ 
  className, 
  initialValue = "", 
  onSearch,
  debounceMs = 300,
  isSearching = false
}: SearchBarProps) {
  const [value, setValue] = useState(initialValue);
  const [, setLocation] = useLocation();
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  const debouncedSearch = useCallback((searchValue: string) => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    
    debounceRef.current = setTimeout(() => {
      if (onSearch) {
        onSearch(searchValue);
      }
    }, debounceMs);
  }, [onSearch, debounceMs]);

  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setValue(newValue);
    debouncedSearch(newValue);
  };

  const handleClear = () => {
    setValue("");
    if (onSearch) {
      onSearch("");
    }
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    if (onSearch) {
      onSearch(value);
    } else {
      if (value.trim()) {
        setLocation(`/market?q=${encodeURIComponent(value)}`);
      } else {
        setLocation("/market");
      }
    }
  };

  return (
    <form onSubmit={handleSearch} className={`relative ${className}`}>
      {isSearching ? (
        <Loader2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground animate-spin" />
      ) : (
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      )}
      <Input
        type="search"
        placeholder="Search for textbooks, furniture..."
        className="pl-9 pr-9 h-11 bg-background shadow-sm border-muted-foreground/20 focus-visible:ring-primary"
        value={value}
        onChange={handleChange}
        data-testid="input-search"
      />
      {value && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
          onClick={handleClear}
          data-testid="button-clear-search"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </form>
  );
}
