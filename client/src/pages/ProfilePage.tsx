import { useState } from "react";
import { useAuth, useUserListings, useFavorites } from "@/lib/store";
import { useLocation, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Upload, Mail, Phone, MapPin, Star, Heart, DollarSign, Edit2, Save, X, Package } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

export default function ProfilePage() {
  const { user, isAuthenticated, updateProfile } = useAuth();
  const { listings } = useUserListings();
  const { favorites } = useFavorites();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || "",
    campus: user?.campus || "",
    email: user?.email || "alex@university.edu",
    phone: user?.phone || "+1 (555) 123-4567",
    bio: user?.bio || "Love buying and selling on campus!",
    avatar: user?.avatar || "",
  });

  if (!isAuthenticated) {
    setLocation("/login");
    return null;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    updateProfile({
      name: formData.name,
      campus: formData.campus,
      email: formData.email,
      phone: formData.phone,
      bio: formData.bio,
      avatar: formData.avatar,
    });
    toast({
      title: "Profile updated!",
      description: "Your changes have been saved."
    });
    setIsEditing(false);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, avatar: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 via-background to-accent/5 pb-20">
      {/* Profile Header */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-gradient-to-r from-primary/20 to-accent/20 py-12"
      >
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-8 mb-6">
            {/* Avatar */}
            <div className="relative">
              <Avatar className="h-32 w-32 border-4 border-white shadow-lg">
                <AvatarImage src={formData.avatar} />
                <AvatarFallback className="bg-primary text-white text-3xl">
                  {formData.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              {isEditing && (
                <label className="absolute bottom-0 right-0 bg-primary text-white p-2 rounded-full cursor-pointer hover:bg-primary/90 transition-colors shadow-lg">
                  <Upload className="w-4 h-4" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {/* Info */}
            <div className="flex-1">
              <h1 className="text-3xl font-display font-bold mb-2">{formData.name}</h1>
              <div className="flex items-center gap-2 mb-3">
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                  4.8 (24 reviews)
                </Badge>
                <Badge variant="outline">Verified Seller</Badge>
              </div>
              <p className="text-muted-foreground flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                {formData.campus}
              </p>
            </div>

            {/* Edit Button */}
            <div className="flex gap-2">
              {!isEditing ? (
                <Button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 rounded-xl"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit Profile
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button
                    onClick={handleSave}
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700 rounded-xl"
                  >
                    <Save className="w-4 h-4" />
                    Save
                  </Button>
                  <Button
                    onClick={() => setIsEditing(false)}
                    variant="outline"
                    className="flex items-center gap-2 rounded-xl"
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <Card className="p-4 text-center border-primary/20 bg-white/50">
              <div className="text-2xl font-bold text-primary">12</div>
              <p className="text-xs text-muted-foreground">Items Sold</p>
            </Card>
            <Card className="p-4 text-center border-primary/20 bg-white/50">
              <div className="text-2xl font-bold text-accent">8</div>
              <p className="text-xs text-muted-foreground">Items Bought</p>
            </Card>
            <Card className="p-4 text-center border-primary/20 bg-white/50">
              <div className="text-2xl font-bold text-green-600">$340</div>
              <p className="text-xs text-muted-foreground">Total Sales</p>
            </Card>
          </div>
        </div>
      </motion.section>

      {/* Profile Content */}
      <section className="container mx-auto px-4 max-w-4xl py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2 space-y-6"
          >
            {/* About Section */}
            <Card className="p-6 border-primary/20 bg-white/50 backdrop-blur">
              <h2 className="text-xl font-display font-bold mb-4 flex items-center gap-2">
                <Heart className="w-5 h-5 text-primary" />
                About Me
              </h2>
              {isEditing ? (
                <Textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  placeholder="Tell other students about yourself..."
                  className="min-h-24"
                />
              ) : (
                <p className="text-muted-foreground">{formData.bio}</p>
              )}
            </Card>

            {/* Contact Info */}
            <Card className="p-6 border-primary/20 bg-white/50 backdrop-blur">
              <h2 className="text-xl font-display font-bold mb-4">Contact Information</h2>
              <div className="space-y-4">
                <div>
                  <Label className="flex items-center gap-2 text-sm font-semibold mb-2">
                    <Mail className="w-4 h-4" />
                    Email
                  </Label>
                  {isEditing ? (
                    <Input
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="rounded-lg"
                    />
                  ) : (
                    <p className="text-muted-foreground">{formData.email}</p>
                  )}
                </div>

                <div>
                  <Label className="flex items-center gap-2 text-sm font-semibold mb-2">
                    <Phone className="w-4 h-4" />
                    Phone
                  </Label>
                  {isEditing ? (
                    <Input
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      className="rounded-lg"
                    />
                  ) : (
                    <p className="text-muted-foreground">{formData.phone}</p>
                  )}
                </div>

                <div>
                  <Label className="flex items-center gap-2 text-sm font-semibold mb-2">
                    <MapPin className="w-4 h-4" />
                    Campus
                  </Label>
                  {isEditing ? (
                    <select
                      name="campus"
                      value={formData.campus}
                      onChange={(e) => setFormData(prev => ({ ...prev, campus: e.target.value }))}
                      className="w-full px-3 py-2 border rounded-lg"
                    >
                      <option value="North Campus">North Campus</option>
                      <option value="South Campus">South Campus</option>
                      <option value="East Campus">East Campus</option>
                      <option value="West Campus">West Campus</option>
                      <option value="Main Campus">Main Campus</option>
                    </select>
                  ) : (
                    <p className="text-muted-foreground">{formData.campus}</p>
                  )}
                </div>
              </div>
            </Card>

            {/* Preferences */}
            <Card className="p-6 border-primary/20 bg-white/50 backdrop-blur">
              <h2 className="text-xl font-display font-bold mb-4">Preferences</h2>
              <div className="space-y-3">
                <label className="flex items-center gap-3">
                  <input type="checkbox" defaultChecked className="rounded" />
                  <span className="text-sm">Enable notifications for new messages</span>
                </label>
                <label className="flex items-center gap-3">
                  <input type="checkbox" defaultChecked className="rounded" />
                  <span className="text-sm">Show my profile publicly</span>
                </label>
                <label className="flex items-center gap-3">
                  <input type="checkbox" className="rounded" />
                  <span className="text-sm">Receive product recommendations</span>
                </label>
              </div>
            </Card>
          </motion.div>

          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            {/* Quick Actions */}
            <Card className="p-6 border-primary/20 bg-white/50 backdrop-blur">
              <h3 className="font-bold mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <Link href="/my-listings">
                  <Button variant="outline" className="w-full justify-start rounded-lg">
                    <Package className="w-4 h-4 mr-2" />
                    My Listings ({listings.length})
                  </Button>
                </Link>
                <Link href="/saved-items">
                  <Button variant="outline" className="w-full justify-start rounded-lg">
                    <Heart className="w-4 h-4 mr-2" />
                    Saved Items ({favorites.length})
                  </Button>
                </Link>
                <Link href="/reviews">
                  <Button variant="outline" className="w-full justify-start rounded-lg">
                    <Star className="w-4 h-4 mr-2" />
                    Reviews
                  </Button>
                </Link>
              </div>
            </Card>

            {/* Rating Breakdown */}
            <Card className="p-6 border-primary/20 bg-white/50 backdrop-blur">
              <h3 className="font-bold mb-4">Rating Breakdown</h3>
              <div className="space-y-2 text-sm">
                {[
                  { stars: 5, count: 20 },
                  { stars: 4, count: 4 },
                  { stars: 3, count: 0 },
                  { stars: 2, count: 0 },
                  { stars: 1, count: 0 }
                ].map(({ stars, count }) => (
                  <div key={stars} className="flex items-center gap-2">
                    <span className="w-8">{stars}★</span>
                    <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-primary h-full transition-all"
                        style={{ width: `${(count / 24) * 100}%` }}
                      />
                    </div>
                    <span className="w-6 text-right text-xs text-muted-foreground">{count}</span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Verify Badge */}
            <Card className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 bg-green-600 rounded-full" />
                <p className="text-xs font-bold text-green-700">VERIFIED SELLER</p>
              </div>
              <p className="text-xs text-green-600">
                Identity verified • 24 successful transactions
              </p>
            </Card>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
