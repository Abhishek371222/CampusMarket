import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useMarketStore } from "@/lib/mockData";
import { useAuth } from "@/lib/auth";
import { Bell } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Link } from "wouter";

export function NotificationBell() {
  const { user } = useAuth();
  const { notifications, markNotificationsRead } = useMarketStore();
  
  if (!user) return null;

  const myNotifications = notifications
    .filter((n) => n.userId === user.id)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const unreadCount = myNotifications.filter((n) => !n.isRead).length;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" onClick={() => markNotificationsRead()}>
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-background animate-pulse" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="p-4 border-b">
          <h4 className="font-heading font-semibold">Notifications</h4>
        </div>
        <ScrollArea className="h-[300px]">
          {myNotifications.length > 0 ? (
            <div className="flex flex-col">
              {myNotifications.map((notif) => (
                <Link key={notif.id} href={notif.link || "#"}>
                  <div className={`p-4 border-b hover:bg-muted/50 cursor-pointer transition-colors ${!notif.isRead ? "bg-primary/5" : ""}`}>
                    <p className="text-sm">{notif.content}</p>
                    <span className="text-xs text-muted-foreground mt-1 block">
                      {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-sm text-muted-foreground">
              No notifications yet
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
