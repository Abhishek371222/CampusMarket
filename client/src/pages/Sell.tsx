import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/lib/auth";
import { useMarketStore } from "@/lib/mockData";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { Upload, X, Wand2, Sparkles, Loader2 } from "lucide-react";
import { useState } from "react";

const formSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  price: z.coerce.number().min(1, "Price must be at least $1"),
  category: z.string({ required_error: "Please select a category" }),
  condition: z.enum(["New", "Like New", "Good", "Fair"], { required_error: "Select condition" }),
});

export default function Sell() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { addProduct } = useMarketStore();
  const { toast } = useToast();
  const [images, setImages] = useState<string[]>([]);
  const [isAiLoading, setIsAiLoading] = useState(false);

  if (!user) {
     setLocation("/login");
     return null;
  }

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      price: 0,
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (images.length === 0) {
      toast({
        title: "Image required",
        description: "Please upload at least one image.",
        variant: "destructive",
      });
      return;
    }

    addProduct({
      ...values,
      images: images,
    });

    toast({
      title: "Item Listed!",
      description: "Your product is now live.",
    });

    setLocation("/profile");
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const imageUrl = URL.createObjectURL(file);
      setImages([...images, imageUrl]);
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const simulateAiGeneration = () => {
    setIsAiLoading(true);
    setTimeout(() => {
      form.setValue("title", "Calculus: Early Transcendentals (8th Edition)");
      form.setValue("description", "James Stewart's Calculus text is widely renowned for its mathematical precision and accuracy, clarity of exposition, and outstanding examples and problem sets.");
      form.setValue("category", "Textbooks");
      form.setValue("condition", "Good");
      form.setValue("price", 45);
      setIsAiLoading(false);
      toast({
        title: "AI Auto-Fill Complete",
        description: "Listing details generated from image analysis.",
      });
    }, 1500);
  };

  return (
    <div className="container max-w-2xl px-4 py-8">
      <div className="space-y-2 mb-8">
        <h1 className="text-3xl font-heading font-bold">Sell an Item</h1>
        <p className="text-muted-foreground">List your textbooks, furniture, or electronics for sale.</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-heading font-semibold text-lg">Photos</h3>
              <Button type="button" variant="outline" size="sm" onClick={simulateAiGeneration} disabled={images.length === 0 || isAiLoading}>
                {isAiLoading ? <Loader2 className="mr-2 h-3 w-3 animate-spin" /> : <Sparkles className="mr-2 h-3 w-3 text-purple-500" />}
                AI Auto-Fill
              </Button>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              {images.map((img, index) => (
                <div key={index} className="relative aspect-square rounded-lg overflow-hidden border group">
                  <img src={img} alt="Upload" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-1 right-1 bg-black/50 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
              {images.length < 5 && (
                <label className="border-2 border-dashed rounded-lg aspect-square flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors">
                  <Upload className="h-6 w-6 text-muted-foreground mb-2" />
                  <span className="text-xs text-muted-foreground">Upload Photo</span>
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                </label>
              )}
            </div>
            <p className="text-xs text-muted-foreground">Upload a photo to enable AI auto-fill for title and price.</p>
          </div>

          <div className="space-y-4">
            <h3 className="font-heading font-semibold text-lg">Details</h3>
            
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Calculus Early Transcendentals" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Textbooks">Textbooks</SelectItem>
                        <SelectItem value="Electronics">Electronics</SelectItem>
                        <SelectItem value="Furniture">Furniture</SelectItem>
                        <SelectItem value="Clothing">Clothing</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price ($)</FormLabel>
                    <div className="relative">
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      {field.value > 0 && (
                        <div className="absolute right-3 top-2.5">
                          <Wand2 className="h-4 w-4 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="condition"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Condition</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="New">New</SelectItem>
                      <SelectItem value="Like New">Like New</SelectItem>
                      <SelectItem value="Good">Good</SelectItem>
                      <SelectItem value="Fair">Fair</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Describe the item..." 
                      className="min-h-[120px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <Button type="submit" size="lg" className="w-full">List Item</Button>
        </form>
      </Form>
    </div>
  );
}
