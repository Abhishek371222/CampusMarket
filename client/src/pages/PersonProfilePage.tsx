import { useParams } from "wouter";
import { MOCK_PEOPLE } from "@/lib/mockData";
import { useFollow } from "@/lib/store";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, MapPin, MessageCircle, Share2, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "wouter";

export default function PersonProfilePage() {
  const { id } = useParams();
  const { isFollowing, addFollow, removeFollow } = useFollow();

  const person = MOCK_PEOPLE.find((p) => p.id === parseInt(id || "0"));

  if (!person) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 text-center">
          <h2 className="text-xl font-bold mb-4">Person not found</h2>
          <Link href="/people">
            <Button variant="outline">Back to People</Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 via-background to-accent/5 pb-20">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-6"
        >
          <Link href="/people">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="p-8 card-elevated">
            <div className="flex flex-col items-center text-center gap-6 mb-8">
              <Avatar className="h-32 w-32 border-4 border-primary/20">
                <AvatarImage src={person.avatar} alt={person.name} />
                <AvatarFallback className="bg-primary/10 text-primary text-4xl font-bold">
                  {person.name.charAt(0)}
                </AvatarFallback>
              </Avatar>

              <div className="w-full">
                <h1 className="text-headline-md mb-1">{person.name}</h1>
                <p className="text-lg text-primary font-semibold">@{person.username}</p>
              </div>

              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-accent" />
                <Badge variant="secondary">{person.campus}</Badge>
              </div>

              <p className="text-lg text-muted-foreground italic max-w-md">{person.bio}</p>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-8 py-6 border-y border-border/50">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-1">{person.itemsSold}</div>
                <div className="text-sm text-muted-foreground">Items Sold</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Star className="w-5 h-5 fill-accent text-accent" />
                  <span className="text-3xl font-bold">{person.rating}</span>
                </div>
                <div className="text-sm text-muted-foreground">Rating</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-accent mb-1">98%</div>
                <div className="text-sm text-muted-foreground">Positive</div>
              </div>
            </div>

            <div className="flex gap-3 flex-wrap justify-center">
              <Button
                onClick={() => {
                  if (isFollowing(person.id)) {
                    removeFollow(person.id);
                  } else {
                    addFollow(person.id);
                  }
                }}
                className="button-3d flex-1 min-w-32"
                variant={isFollowing(person.id) ? "default" : "outline"}
              >
                {isFollowing(person.id) ? "✓ Following" : "Follow"}
              </Button>
              <Button variant="outline" size="icon" className="button-3d h-10 w-10">
                <MessageCircle className="w-5 h-5" />
              </Button>
              <Button variant="outline" size="icon" className="button-3d h-10 w-10">
                <Share2 className="w-5 h-5" />
              </Button>
            </div>

            <div className="mt-8 pt-8 border-t border-border/50">
              <h3 className="text-title-md mb-4">Seller Info</h3>
              <div className="space-y-3 text-sm">
                <p className="flex justify-between">
                  <span className="text-muted-foreground">Member Since</span>
                  <span className="font-semibold">January 2023</span>
                </p>
                <p className="flex justify-between">
                  <span className="text-muted-foreground">Response Time</span>
                  <span className="font-semibold">2 hours</span>
                </p>
                <p className="flex justify-between">
                  <span className="text-muted-foreground">Followers</span>
                  <span className="font-semibold">247</span>
                </p>
                <p className="flex justify-between">
                  <span className="text-muted-foreground">Reviews</span>
                  <span className="font-semibold">{Math.round(person.itemsSold * 0.85)} positive</span>
                </p>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
