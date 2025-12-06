import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ShieldCheck, UserCheck, AlertTriangle, Loader2 } from "lucide-react";
import { useUsers, useProducts, useUpdateVerification } from "@/lib/api-hooks";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

function ApproveButton({ userId }: { userId: string }) {
  const { mutate, isPending } = useUpdateVerification(userId);
  const { toast } = useToast();

  const handleApprove = () => {
    mutate(
      { verificationStatus: "verified", isVerified: true },
      {
        onSuccess: () => {
          toast({
            title: "User Verified",
            description: "Student ID has been approved successfully.",
          });
        },
        onError: () => {
          toast({
            title: "Error",
            description: "Failed to verify user. Please try again.",
            variant: "destructive",
          });
        },
      }
    );
  };

  return (
    <Button 
      size="sm" 
      onClick={handleApprove} 
      disabled={isPending}
      data-testid={`button-approve-${userId}`}
    >
      {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Approve ID"}
    </Button>
  );
}

export default function AdminDashboard() {
  const { data: users, isLoading: usersLoading } = useUsers();
  const { data: products, isLoading: productsLoading } = useProducts();

  const pendingUsers = users?.filter(u => u.verificationStatus === "pending") || [];
  const stats = [
    { label: "Total Users", value: users?.length || 0, icon: UserCheck },
    { label: "Active Listings", value: products?.filter(p => p.status === "available").length || 0, icon: ShieldCheck },
    { label: "Pending Reviews", value: pendingUsers.length, icon: AlertTriangle },
  ];

  return (
    <div className="container py-8 px-4 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage verifications and monitor platform activity.</p>
        </div>
        <Badge variant="outline" className="px-4 py-1 text-sm bg-green-50 text-green-700 border-green-200">
          System Operational
        </Badge>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="flex items-center p-6 gap-4">
              <div className="p-3 rounded-xl bg-primary/10 text-primary">
                <stat.icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                <h3 className="text-2xl font-bold" data-testid={`stat-${stat.label.toLowerCase().replace(' ', '-')}`}>
                  {usersLoading || productsLoading ? "..." : stat.value}
                </h3>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        
        {/* Verification Queue */}
        <Card className="h-[500px] flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCheck className="h-5 w-5" /> Verification Requests
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-hidden">
            <ScrollArea className="h-full pr-4">
              {usersLoading ? (
                <div className="h-full flex items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : pendingUsers.length > 0 ? (
                <div className="space-y-4">
                  {pendingUsers.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-4 border rounded-xl bg-muted/20" data-testid={`user-pending-${user.id}`}>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={user.avatar || undefined} />
                          <AvatarFallback>{user.name[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold" data-testid={`text-username-${user.id}`}>{user.name}</p>
                          <p className="text-xs text-muted-foreground" data-testid={`text-email-${user.id}`}>{user.email}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <ApproveButton userId={user.id} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-muted-foreground opacity-50">
                  <ShieldCheck className="h-12 w-12 mb-2" />
                  <p>All users verified</p>
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Recent Users */}
        <Card className="h-[500px] flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCheck className="h-5 w-5" /> Recent Users
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-hidden">
            <ScrollArea className="h-full pr-4">
              {usersLoading ? (
                <div className="h-full flex items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <div className="space-y-4">
                  {users?.slice(0, 10).map((user) => (
                    <div key={user.id} className="flex items-center gap-3 p-3 border rounded-xl" data-testid={`user-item-${user.id}`}>
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={user.avatar || undefined} />
                        <AvatarFallback>{user.name[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{user.name}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </div>
                      {user.isVerified && (
                        <Badge variant="outline" className="text-green-700 border-green-200 bg-green-50">
                          <ShieldCheck className="h-3 w-3 mr-1" /> Verified
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
