import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Upload, Send, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { motion } from "framer-motion";

export default function SellItemPage() {
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    price: "",
    condition: "Used - Good",
    description: "",
    image: null as string | null,
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const categories = [
    "Electronics",
    "Textbooks",
    "Hostel Needs",
    "Fashion",
    "Cycles",
    "Other"
  ];

  const conditions = [
    "New",
    "Used - Like New",
    "Used - Good",
    "Used - Fair"
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, image: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.category || !formData.price || !formData.description) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    toast({
      title: "Item listed successfully!",
      description: "Your product is now live on Campus Market"
    });
    
    setLocation("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/10 py-20 px-4 relative overflow-hidden">
      {/* Background Animation */}
      <div className="absolute top-20 right-20 w-96 h-96 bg-primary/20 rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-accent/20 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-2xl mx-auto relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center justify-center gap-2 mb-4">
            <Zap className="w-6 h-6 text-accent" />
            <span className="text-sm font-bold text-accent">NEW LISTING</span>
          </div>
          <h1 className="text-4xl font-display font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Sell Your Item
          </h1>
          <p className="text-lg text-muted-foreground">List your item on Campus Market in minutes</p>
        </motion.div>

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          onSubmit={handleSubmit}
          className="bg-white/80 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl p-10 space-y-8"
        >
          {/* Title */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            className="space-y-2"
          >
            <Label className="text-base font-semibold">Product Title *</Label>
            <Input
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g., Sony Headphones - Like New"
              className="h-12 rounded-xl border-primary/20 focus:border-primary transition-all"
              required
            />
          </motion.div>

          {/* Category & Price */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="grid md:grid-cols-2 gap-6"
          >
            <div className="space-y-2">
              <Label className="text-base font-semibold">Category *</Label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="h-12 w-full px-4 rounded-xl border border-primary/20 focus:border-primary bg-white transition-all"
                required
              >
                <option value="">Select category</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label className="text-base font-semibold">Price ($) *</Label>
              <Input
                name="price"
                type="number"
                value={formData.price}
                onChange={handleChange}
                placeholder="0.00"
                className="h-12 rounded-xl border-primary/20 focus:border-primary transition-all"
                step="0.01"
                required
              />
            </div>
          </motion.div>

          {/* Condition */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="space-y-2"
          >
            <Label className="text-base font-semibold">Condition</Label>
            <select
              name="condition"
              value={formData.condition}
              onChange={handleChange}
              className="h-12 w-full px-4 rounded-xl border border-primary/20 focus:border-primary bg-white transition-all"
            >
              {conditions.map(cond => (
                <option key={cond} value={cond}>{cond}</option>
              ))}
            </select>
          </motion.div>

          {/* Description */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="space-y-2"
          >
            <Label className="text-base font-semibold">Description *</Label>
            <Textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Tell buyers about your item... condition, features, why you're selling, etc."
              className="rounded-xl border-primary/20 focus:border-primary min-h-32 transition-all"
              required
            />
          </motion.div>

          {/* Image Upload */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
            className="space-y-4"
          >
            <Label className="text-base font-semibold">Product Image</Label>
            <div className="relative">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="image-upload"
              />
              <label
                htmlFor="image-upload"
                className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-primary/30 rounded-2xl hover:border-primary/60 cursor-pointer transition-all bg-primary/5 hover:bg-primary/10"
              >
                {formData.image ? (
                  <img src={formData.image} alt="Preview" className="w-32 h-32 object-cover rounded-lg" />
                ) : (
                  <>
                    <Upload className="w-8 h-8 text-primary mb-2" />
                    <span className="text-sm font-semibold text-primary">Click to upload image</span>
                    <span className="text-xs text-muted-foreground">PNG, JPG up to 5MB</span>
                  </>
                )}
              </label>
            </div>
          </motion.div>

          {/* Submit Button */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.5 }}
            className="flex gap-4 pt-6"
          >
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1 h-12 rounded-xl bg-gradient-to-r from-primary to-accent text-white font-semibold shadow-lg shadow-primary/25 hover:shadow-xl transition-all"
            >
              {isLoading ? (
                <>
                  <Zap className="animate-spin mr-2 w-4 h-4" />
                  Publishing...
                </>
              ) : (
                <>
                  <Send className="mr-2 w-4 h-4" />
                  Publish Listing
                </>
              )}
            </Button>
          </motion.div>

          {/* Info Box */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="bg-accent/10 border border-accent/20 rounded-xl p-6 text-sm text-muted-foreground"
          >
            <p className="font-semibold text-accent mb-2">Pro Tips:</p>
            <ul className="space-y-1 list-disc list-inside">
              <li>Clear photos help your item sell faster</li>
              <li>Be detailed about condition and any defects</li>
              <li>Competitive pricing gets more interest</li>
              <li>Fast responses to messages increase sales</li>
            </ul>
          </motion.div>
        </motion.form>
      </div>
    </div>
  );
}
