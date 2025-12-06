import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Link } from "wouter";

interface CategoryBadgeProps {
  name: string;
  className?: string;
  isActive?: boolean;
}

export function CategoryBadge({ name, className, isActive }: CategoryBadgeProps) {
  return (
    <Link href={`/market?category=${name}`}>
      <Badge
        variant={isActive ? "default" : "secondary"}
        className={cn(
          "cursor-pointer px-4 py-2 text-sm font-medium hover:bg-primary hover:text-primary-foreground transition-colors",
          isActive && "bg-primary text-primary-foreground",
          className
        )}
      >
        {name}
      </Badge>
    </Link>
  );
}
