import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useMarketStore } from "@/lib/mockData";
import { useAuth } from "@/lib/auth";
import { useState } from "react";
import { MessageSquare, Heart, Share2, AlertCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useToast } from "@/hooks/use-toast";

export default function CommunityWall() {
  const { user } = useAuth();
  const { communityPosts, addCommunityPost } = useMarketStore();
  const { toast } = useToast();
  const [newPostContent, setNewPostContent] = useState("");
  const [postType, setPostType] = useState<"general" | "request" | "alert">("general");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostContent.trim()) return;

    if (!user) {
      toast({ title: "Please login to post", variant: "destructive" });
      return;
    }

    addCommunityPost(newPostContent, postType);
    setNewPostContent("");
    toast({ title: "Post published!" });
  };

  return (
    <div className="container max-w-4xl py-8 px-4">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Main Feed */}
        <div className="flex-1 space-y-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-heading font-bold">Community Wall</h1>
            <p className="text-muted-foreground">Campus news, lost & found, and study requests.</p>
          </div>

          {/* Create Post */}
          <Card className="border-primary/20 shadow-sm">
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <Textarea 
                  placeholder="What's happening on campus?"
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  className="min-h-[100px] resize-none"
                />
                <div className="flex justify-between items-center">
                  <div className="flex gap-2">
                    <Button 
                      type="button" 
                      variant={postType === "general" ? "default" : "outline"} 
                      size="sm"
                      onClick={() => setPostType("general")}
                      className="rounded-full"
                    >
                      General
                    </Button>
                    <Button 
                      type="button" 
                      variant={postType === "request" ? "default" : "outline"} 
                      size="sm"
                      onClick={() => setPostType("request")}
                      className="rounded-full"
                    >
                      Request
                    </Button>
                    <Button 
                      type="button" 
                      variant={postType === "alert" ? "default" : "outline"} 
                      size="sm"
                      onClick={() => setPostType("alert")}
                      className="rounded-full"
                    >
                      Alert
                    </Button>
                  </div>
                  <Button type="submit" disabled={!newPostContent.trim()}>Post</Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Posts Feed */}
          <div className="space-y-4">
            {communityPosts.map((post) => (
              <Card key={post.id} className="overflow-hidden">
                <CardHeader className="flex flex-row items-start gap-4 space-y-0 pb-2">
                  <Avatar>
                    <AvatarImage src={post.authorAvatar} />
                    <AvatarFallback>{post.authorName[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold">{post.authorName}</h4>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                    <Badge variant="secondary" className={`mt-1 text-[10px] 
                      ${post.type === 'alert' ? 'bg-red-100 text-red-700' : 
                        post.type === 'request' ? 'bg-blue-100 text-blue-700' : ''}
                    `}>
                      {post.type}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{post.content}</p>
                  
                  <div className="flex items-center gap-6 mt-4 pt-4 border-t text-muted-foreground">
                    <button className="flex items-center gap-2 text-xs hover:text-primary transition-colors">
                      <Heart className="h-4 w-4" /> {post.likes}
                    </button>
                    <button className="flex items-center gap-2 text-xs hover:text-primary transition-colors">
                      <MessageSquare className="h-4 w-4" /> {post.comments}
                    </button>
                    <button className="flex items-center gap-2 text-xs hover:text-primary transition-colors ml-auto">
                      <Share2 className="h-4 w-4" /> Share
                    </button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="w-full md:w-80 space-y-6">
          <Card className="bg-primary/5 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <AlertCircle className="h-5 w-5 text-primary" />
                Campus Safety
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              <p>• Meet in public places like the Library or Student Union.</p>
              <p>• Verify student IDs before high-value trades.</p>
              <p>• Report suspicious activity immediately.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Trending Topics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {["#TextbookExchange", "#DormLife", "#LostFound", "#StudyGroup", "#Events"].map(tag => (
                  <Badge key={tag} variant="outline" className="cursor-pointer hover:bg-secondary/20">
                    {tag}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
