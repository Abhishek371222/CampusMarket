import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/lib/auth";
import { Bell } from "lucide-react";

export function NotificationBell() {
  const { user } = useAuth();
  
  if (!user) return null;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" data-testid="button-notifications">
          <Bell className="h-5 w-5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="p-4 border-b">
          <h4 className="font-heading font-semibold">Notifications</h4>
        </div>
        <ScrollArea className="h-[300px]">
          <div className="p-8 text-center text-sm text-muted-foreground">
            No notifications yet
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
