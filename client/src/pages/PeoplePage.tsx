import { useFollow } from "@/lib/store";
import { MOCK_PEOPLE } from "@/lib/mockData";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Star, Users, Eye } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "wouter";

export default function PeoplePage() {
  const { following, addFollow, removeFollow, isFollowing } = useFollow();

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 via-background to-accent/5 pb-20">
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <div className="flex items-center gap-3 mb-2">
            <Users className="w-8 h-8 text-primary" />
            <h1 className="text-headline-md">Discover People</h1>
          </div>
          <p className="text-muted-foreground">Follow sellers and buyers from your campus</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {MOCK_PEOPLE.map((person, idx) => (
            <motion.div
              key={person.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <Card className="p-6 card-elevated hover:shadow-elevation-4 transition-spring">
                <div className="flex flex-col items-center text-center gap-4">
                  <Avatar className="h-20 w-20 border-4 border-primary/20">
                    <AvatarImage src={person.avatar} alt={person.name} />
                    <AvatarFallback className="bg-primary/10 text-primary font-bold">
                      {person.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>

                  <div className="w-full">
                    <h3 className="text-title-md font-bold">{person.name}</h3>
                    <p className="text-sm text-muted-foreground">@{person.username}</p>
                    <p className="text-xs text-accent mt-1">{person.campus}</p>
                  </div>

                  <p className="text-sm text-muted-foreground italic">{person.bio}</p>

                  <div className="flex gap-4 w-full justify-center text-sm">
                    <div className="flex flex-col items-center">
                      <span className="font-bold text-primary">{person.itemsSold}</span>
                      <span className="text-xs text-muted-foreground">Sold</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 fill-accent text-accent" />
                        <span className="font-bold">{person.rating}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">Rating</span>
                    </div>
                  </div>

                  <div className="flex gap-2 w-full">
                    <Link href={`/people/${person.id}`} className="flex-1">
                      <Button 
                        variant="outline" 
                        className="w-full button-3d gap-1"
                        size="sm"
                      >
                        <Eye className="w-3 h-3" />
                        View
                      </Button>
                    </Link>
                    <Button
                      onClick={() => {
                        if (isFollowing(person.id)) {
                          removeFollow(person.id);
                        } else {
                          addFollow(person.id);
                        }
                      }}
                      variant={isFollowing(person.id) ? "default" : "outline"}
                      className="flex-1 button-3d"
                      size="sm"
                    >
                      {isFollowing(person.id) ? "✓" : "Follow"}
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-12 text-center"
        >
          <p className="text-sm text-muted-foreground">
            Following <span className="font-bold text-primary">{following.length}</span>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
