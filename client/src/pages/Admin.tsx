import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useMarketStore } from "@/lib/mockData";
import { ShieldCheck, UserCheck, Activity, AlertTriangle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function AdminDashboard() {
  const { users, products, recentActivity, approveVerification } = useMarketStore();

  const pendingUsers = users.filter(u => u.verificationStatus === "pending");
  const stats = [
    { label: "Total Users", value: users.length, icon: UserCheck },
    { label: "Active Listings", value: products.filter(p => p.status === "available").length, icon: ShieldCheck },
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
                <h3 className="text-2xl font-bold">{stat.value}</h3>
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
              {pendingUsers.length > 0 ? (
                <div className="space-y-4">
                  {pendingUsers.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-4 border rounded-xl bg-muted/20">
                      <div className="flex items-center gap-3">
                        <img src={user.avatar} className="h-10 w-10 rounded-full" alt="" />
                        <div>
                          <p className="font-semibold">{user.name}</p>
                          <p className="text-xs text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => approveVerification(user.id)}>
                          Approve ID
                        </Button>
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

        {/* Activity Log */}
        <Card className="h-[500px] flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" /> System Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-hidden">
            <ScrollArea className="h-full pr-4">
              <div className="space-y-4">
                {recentActivity.map((log, i) => (
                  <div key={i} className="flex gap-3 text-sm border-b pb-3 last:border-0">
                    <span className="text-muted-foreground font-mono text-xs whitespace-nowrap pt-0.5">
                      {new Date().toLocaleTimeString()}
                    </span>
                    <p>{log}</p>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
