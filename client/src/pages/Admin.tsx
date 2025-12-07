import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { ShieldCheck, UserCheck, AlertTriangle, Loader2, Eye, Check, X, FileText, Image as ImageIcon } from "lucide-react";
import { useUsers, useProducts, usePendingVerifications, useReviewVerification, type VerificationWithUser } from "@/lib/api-hooks";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState } from "react";

function normalizeDocumentPath(path: string): string {
  if (!path) return "";
  if (path.startsWith("/uploads/") || path.startsWith("http")) {
    return path;
  }
  return `/uploads/${path}`;
}

function DocumentPreview({ documentPath }: { documentPath: string }) {
  const normalizedPath = normalizeDocumentPath(documentPath);
  const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(normalizedPath);
  const isPdf = /\.pdf$/i.test(normalizedPath);

  if (isImage) {
    return (
      <img
        src={normalizedPath}
        alt="Student ID Document"
        className="max-w-full max-h-[70vh] object-contain rounded-md"
        data-testid="img-document-preview"
      />
    );
  }

  if (isPdf) {
    return (
      <iframe
        src={normalizedPath}
        className="w-full h-[70vh] rounded-md border"
        title="PDF Document Preview"
        data-testid="iframe-document-preview"
      />
    );
  }

  return (
    <div className="flex flex-col items-center justify-center p-8 text-muted-foreground">
      <FileText className="h-16 w-16 mb-4" />
      <p>Unable to preview this document type</p>
      <a
        href={normalizedPath}
        target="_blank"
        rel="noopener noreferrer"
        className="text-primary underline mt-2"
        data-testid="link-download-document"
      >
        Download Document
      </a>
    </div>
  );
}

function VerificationCard({ verification }: { verification: VerificationWithUser }) {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isRejectOpen, setIsRejectOpen] = useState(false);
  const [rejectNotes, setRejectNotes] = useState("");
  const { mutate: reviewVerification, isPending } = useReviewVerification();
  const { toast } = useToast();

  const handleApprove = () => {
    reviewVerification(
      { id: verification.id, action: "approved" },
      {
        onSuccess: () => {
          toast({
            title: "ID Approved",
            description: `${verification.user?.name}'s student ID has been verified.`,
          });
        },
        onError: () => {
          toast({
            title: "Error",
            description: "Failed to approve verification. Please try again.",
            variant: "destructive",
          });
        },
      }
    );
  };

  const handleReject = () => {
    reviewVerification(
      { id: verification.id, action: "rejected", notes: rejectNotes || undefined },
      {
        onSuccess: () => {
          toast({
            title: "ID Rejected",
            description: `${verification.user?.name}'s verification has been rejected.`,
          });
          setIsRejectOpen(false);
          setRejectNotes("");
        },
        onError: () => {
          toast({
            title: "Error",
            description: "Failed to reject verification. Please try again.",
            variant: "destructive",
          });
        },
      }
    );
  };

  const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(verification.documentPath);

  return (
    <div
      className="flex flex-col gap-4 p-4 border rounded-xl bg-muted/20"
      data-testid={`verification-card-${verification.id}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={verification.user?.avatar || undefined} />
            <AvatarFallback>{verification.user?.name?.[0] || "?"}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold" data-testid={`text-username-${verification.id}`}>
              {verification.user?.name || "Unknown User"}
            </p>
            <p className="text-xs text-muted-foreground" data-testid={`text-email-${verification.id}`}>
              {verification.user?.email || "No email"}
            </p>
          </div>
        </div>
        <Badge variant="outline" className="text-amber-700 border-amber-200 bg-amber-50">
          Pending Review
        </Badge>
      </div>

      <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg">
        {isImage ? (
          <ImageIcon className="h-5 w-5 text-muted-foreground flex-shrink-0" />
        ) : (
          <FileText className="h-5 w-5 text-muted-foreground flex-shrink-0" />
        )}
        <span className="text-sm text-muted-foreground flex-1 truncate">
          {verification.documentType === "college_id" ? "College ID" : verification.documentType}
        </span>
        <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="sm" data-testid={`button-preview-${verification.id}`}>
              <Eye className="h-4 w-4 mr-1" />
              Preview
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh]">
            <DialogHeader>
              <DialogTitle>Student ID Document - {verification.user?.name}</DialogTitle>
            </DialogHeader>
            <div className="flex items-center justify-center overflow-auto">
              <DocumentPreview documentPath={verification.documentPath} />
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-2">
        <Button
          className="flex-1"
          onClick={handleApprove}
          disabled={isPending}
          data-testid={`button-approve-${verification.id}`}
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <Check className="h-4 w-4 mr-1" />
              Approve
            </>
          )}
        </Button>

        <Dialog open={isRejectOpen} onOpenChange={setIsRejectOpen}>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              className="flex-1"
              disabled={isPending}
              data-testid={`button-reject-open-${verification.id}`}
            >
              <X className="h-4 w-4 mr-1" />
              Reject
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reject Verification</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Are you sure you want to reject the verification for{" "}
                <span className="font-medium text-foreground">{verification.user?.name}</span>?
              </p>
              <Textarea
                placeholder="Reason for rejection (optional)..."
                value={rejectNotes}
                onChange={(e) => setRejectNotes(e.target.value)}
                className="min-h-[100px]"
                data-testid={`textarea-reject-notes-${verification.id}`}
              />
              <div className="flex gap-2 justify-end">
                <Button variant="ghost" onClick={() => setIsRejectOpen(false)}>
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleReject}
                  disabled={isPending}
                  data-testid={`button-confirm-reject-${verification.id}`}
                >
                  {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Confirm Reject"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const { data: users, isLoading: usersLoading } = useUsers();
  const { data: products, isLoading: productsLoading } = useProducts();
  const { data: pendingVerifications, isLoading: verificationsLoading } = usePendingVerifications();

  const stats = [
    { label: "Total Users", value: users?.length || 0, icon: UserCheck },
    { label: "Active Listings", value: products?.filter(p => p.status === "available").length || 0, icon: ShieldCheck },
    { label: "Pending Reviews", value: pendingVerifications?.length || 0, icon: AlertTriangle },
  ];

  return (
    <div className="container py-8 px-4 space-y-8">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-heading font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage verifications and monitor platform activity.</p>
        </div>
        <Badge variant="outline" className="px-4 py-1 text-sm bg-green-50 text-green-700 border-green-200">
          System Operational
        </Badge>
      </div>

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
                  {usersLoading || productsLoading || verificationsLoading ? "..." : stat.value}
                </h3>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <Card className="h-[600px] flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" /> ID Verification Queue
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-hidden">
            <ScrollArea className="h-full pr-4">
              {verificationsLoading ? (
                <div className="h-full flex items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : pendingVerifications && pendingVerifications.length > 0 ? (
                <div className="space-y-4">
                  {pendingVerifications.map((verification) => (
                    <VerificationCard key={verification.id} verification={verification} />
                  ))}
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-muted-foreground opacity-50">
                  <ShieldCheck className="h-12 w-12 mb-2" />
                  <p>No pending verifications</p>
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        <Card className="h-[600px] flex flex-col">
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
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{user.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                      </div>
                      {user.isVerified ? (
                        <Badge variant="outline" className="text-green-700 border-green-200 bg-green-50 flex-shrink-0">
                          <ShieldCheck className="h-3 w-3 mr-1" /> Verified
                        </Badge>
                      ) : user.verificationStatus === "pending" ? (
                        <Badge variant="outline" className="text-amber-700 border-amber-200 bg-amber-50 flex-shrink-0">
                          Pending
                        </Badge>
                      ) : user.verificationStatus === "rejected" ? (
                        <Badge variant="outline" className="text-red-700 border-red-200 bg-red-50 flex-shrink-0">
                          Rejected
                        </Badge>
                      ) : null}
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
