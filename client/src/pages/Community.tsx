import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/lib/auth";
import { useState } from "react";
import { MessageSquare, Heart, Share2, AlertCircle, Loader2, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { useCommunityPosts, useCreateCommunityPost, useLikeCommunityPost, useDeleteCommunityPost } from "@/lib/api-hooks";
import type { CommunityPost } from "@shared/schema";
import { motion, AnimatePresence } from "framer-motion";

function PostCard({ post, currentUserId, index = 0 }: { post: CommunityPost; currentUserId?: string; index?: number }) {
  const { toast } = useToast();
  const likePost = useLikeCommunityPost(post.id);
  const deletePost = useDeleteCommunityPost(post.id);
  const isAuthor = currentUserId === post.authorId;

  const handleLike = async () => {
    try {
      await likePost.mutateAsync();
    } catch (error) {
      toast({
        title: "Failed to like post",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this post?")) return;
    
    try {
      await deletePost.mutateAsync();
      toast({ title: "Post deleted successfully" });
    } catch (error) {
      toast({
        title: "Failed to delete post",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ 
        duration: 0.35, 
        delay: index * 0.05,
        ease: [0.25, 0.46, 0.45, 0.94]
      }}
    >
    <Card data-testid={`card-post-${post.id}`} className="overflow-visible">
      <CardHeader className="flex flex-row items-start gap-4 space-y-0 pb-2">
        <Avatar>
          <AvatarFallback>{post.authorId.slice(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-sm" data-testid={`text-author-${post.id}`}>
              User {post.authorId.slice(0, 8)}
            </h4>
            <span className="text-xs text-muted-foreground" data-testid={`text-time-${post.id}`}>
              {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
            </span>
          </div>
          <Badge 
            variant="secondary" 
            className={`mt-1 text-[10px] ${
              post.type === 'alert' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' : 
              post.type === 'request' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' : ''
            }`}
            data-testid={`badge-type-${post.id}`}
          >
            {post.type}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm leading-relaxed whitespace-pre-wrap" data-testid={`text-content-${post.id}`}>
          {post.content}
        </p>
        
        <div className="flex items-center gap-6 mt-4 pt-4 border-t text-muted-foreground">
          <button 
            onClick={handleLike}
            disabled={likePost.isPending}
            className="flex items-center gap-2 text-xs hover:text-primary transition-colors disabled:opacity-50"
            data-testid={`button-like-${post.id}`}
          >
            {likePost.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Heart className="h-4 w-4" />
            )}
            <span data-testid={`text-likes-${post.id}`}>{post.likes}</span>
          </button>
          <button className="flex items-center gap-2 text-xs hover:text-primary transition-colors">
            <MessageSquare className="h-4 w-4" /> 
            <span data-testid={`text-comments-${post.id}`}>{post.comments || 0}</span>
          </button>
          {isAuthor && (
            <button 
              onClick={handleDelete}
              disabled={deletePost.isPending}
              className="flex items-center gap-2 text-xs hover:text-destructive transition-colors ml-auto disabled:opacity-50"
              data-testid={`button-delete-${post.id}`}
            >
              {deletePost.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
              Delete
            </button>
          )}
        </div>
      </CardContent>
    </Card>
    </motion.div>
  );
}

export default function CommunityWall() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [newPostContent, setNewPostContent] = useState("");
  const [postType, setPostType] = useState<"general" | "request" | "alert">("general");

  const { data: communityPosts, isLoading } = useCommunityPosts();
  const createPost = useCreateCommunityPost();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostContent.trim()) return;

    if (!user) {
      toast({ title: "Please login to post", variant: "destructive" });
      return;
    }

    try {
      await createPost.mutateAsync({
        content: newPostContent,
        type: postType,
      });
      setNewPostContent("");
      toast({ title: "Post published!" });
    } catch (error) {
      toast({ 
        title: "Failed to create post", 
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive" 
      });
    }
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
                  data-testid="input-post-content"
                  disabled={createPost.isPending}
                />
                <div className="flex justify-between items-center">
                  <div className="flex gap-2">
                    <Button 
                      type="button" 
                      variant={postType === "general" ? "default" : "outline"} 
                      size="sm"
                      onClick={() => setPostType("general")}
                      className="rounded-full"
                      data-testid="button-post-type-general"
                      disabled={createPost.isPending}
                    >
                      General
                    </Button>
                    <Button 
                      type="button" 
                      variant={postType === "request" ? "default" : "outline"} 
                      size="sm"
                      onClick={() => setPostType("request")}
                      className="rounded-full"
                      data-testid="button-post-type-request"
                      disabled={createPost.isPending}
                    >
                      Request
                    </Button>
                    <Button 
                      type="button" 
                      variant={postType === "alert" ? "default" : "outline"} 
                      size="sm"
                      onClick={() => setPostType("alert")}
                      className="rounded-full"
                      data-testid="button-post-type-alert"
                      disabled={createPost.isPending}
                    >
                      Alert
                    </Button>
                  </div>
                  <Button 
                    type="submit" 
                    disabled={!newPostContent.trim() || createPost.isPending}
                    data-testid="button-submit-post"
                  >
                    {createPost.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Post
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Posts Feed */}
          {isLoading ? (
            <motion.div 
              className="flex justify-center items-center py-12" 
              data-testid="loading-posts"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </motion.div>
          ) : !communityPosts || communityPosts.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <Card className="p-8 text-center">
                <p className="text-muted-foreground" data-testid="text-no-posts">
                  No posts yet. Be the first to share something!
                </p>
              </Card>
            </motion.div>
          ) : (
            <div className="space-y-4">
              <AnimatePresence mode="popLayout">
                {communityPosts.map((post, index) => (
                  <PostCard key={post.id} post={post} currentUserId={user?.id} index={index} />
                ))}
              </AnimatePresence>
            </div>
          )}
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
